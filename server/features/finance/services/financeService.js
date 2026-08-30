import mongoose from "mongoose";

import Order from "../../orders/models/Order.js";
import ManufacturingOrder from "../../manufacturing/models/ManufacturingOrder.js";
import FinanceExpense from "../models/FinanceExpense.js";

const createError = (message, statusCode = 400) => {
  const error = new Error(message);

  error.statusCode = statusCode;

  return error;
};

const roundMoney = (value) => {
  return Number(Number(value || 0).toFixed(2));
};

const getNumber = (...values) => {
  for (const value of values) {
    if (value === undefined || value === null || value === "") {
      continue;
    }

    const number = Number(value);

    if (Number.isFinite(number)) {
      return number;
    }
  }

  return 0;
};

const getId = (value) => {
  if (!value) {
    return "";
  }

  if (typeof value === "object" && value._id) {
    return String(value._id);
  }

  return String(value);
};

const normalizeDate = (value, endOfDay = false) => {
  if (!value) {
    return null;
  }

  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw createError("Date must use YYYY-MM-DD format");
  }

  const [year, month, day] = value.split("-").map(Number);

  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw createError("Invalid date");
  }

  if (endOfDay) {
    date.setUTCDate(date.getUTCDate() + 1);
  }

  return date;
};

const buildDateRange = (from, to, fieldName = "createdAt") => {
  const fromDate = normalizeDate(from);

  const toDate = normalizeDate(to, true);

  if (fromDate && toDate && fromDate >= toDate) {
    throw createError("From date cannot be after To date");
  }

  const match = {};

  if (fromDate || toDate) {
    match[fieldName] = {};

    if (fromDate) {
      match[fieldName].$gte = fromDate;
    }

    if (toDate) {
      match[fieldName].$lt = toDate;
    }
  }

  return {
    match,
    fromDate,
    toDate,
  };
};

const startOfUtcDay = (date = new Date()) => {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
};

const startOfUtcMonth = (date = new Date()) => {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
};

const nextUtcMonth = (date) => {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1));
};

const previousUtcMonth = (date) => {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() - 1, 1));
};

const monthKey = (year, month) => {
  return `${year}-${String(month).padStart(2, "0")}`;
};

const monthLabel = (date) => {
  return date.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
};

const getOrderItemQuantity = (item) => {
  const quantity = Number(item?.quantity || 1);

  if (!Number.isFinite(quantity) || quantity <= 0) {
    return 1;
  }

  return quantity;
};

const getOrderItemLineRevenue = (item) => {
  const quantity = getOrderItemQuantity(item);

  const directTotal = getNumber(
    item?.lineTotal,
    item?.totalPrice,
    item?.itemTotal,
    item?.total,
    item?.subtotal,
    item?.amount,
  );

  if (directTotal > 0) {
    return directTotal;
  }

  const unitPrice = getNumber(
    item?.unitPrice,
    item?.sellingPrice,
    item?.price,
    item?.priceSnapshot,
    item?.productPriceSnapshot,
    item?.product?.price,
  );

  return roundMoney(unitPrice * quantity);
};

const getOrderProductRevenue = (order) => {
  const subtotal = getNumber(order?.subtotal);

  if (subtotal > 0) {
    return roundMoney(subtotal);
  }

  const total = getNumber(order?.total);

  const shipping = getNumber(order?.shippingCost);

  if (total > 0) {
    return roundMoney(Math.max(total - shipping, 0));
  }

  return roundMoney(
    (order?.items || []).reduce(
      (sum, item) => sum + getOrderItemLineRevenue(item),
      0,
    ),
  );
};

const getProductInfoFromItem = (item) => {
  const product = item?.product;

  return {
    productId: getId(product?._id || product || item?.productId),

    productName:
      product?.name ||
      item?.productName ||
      item?.productNameSnapshot ||
      item?.name ||
      "Unknown Product",

    sku: product?.sku || item?.sku || item?.skuSnapshot || "",
  };
};

const getUnitCost = (unit, orderItem = null) => {
  const productCost = getNumber(
    unit?.productCostSnapshot,
    orderItem?.productCostSnapshot,
    orderItem?.costPriceSnapshot,
    orderItem?.product?.costPrice,
    unit?.product?.costPrice,
  );

  const smartUnitCost = getNumber(
    unit?.smartUnitCostSnapshot,
    unit?.smartUnit?.costPrice,
  );

  const assemblyCost = getNumber(unit?.assemblyCost);

  const packagingCost = getNumber(unit?.packagingCost);

  return {
    productCost: roundMoney(productCost),

    smartUnitCost: roundMoney(smartUnitCost),

    assemblyCost: roundMoney(assemblyCost),

    packagingCost: roundMoney(packagingCost),

    totalCost: roundMoney(
      productCost + smartUnitCost + assemblyCost + packagingCost,
    ),
  };
};

const getOrderCostingStatus = (units) => {
  if (!Array.isArray(units) || units.length === 0) {
    return "not_started";
  }

  const allCompleted = units.every((unit) => unit.status === "completed");

  if (allCompleted) {
    return "completed";
  }

  return "in_progress";
};

const getPeriodSales = async (start, end) => {
  const rows = await Order.aggregate([
    {
      $match: {
        orderStatus: {
          $ne: "cancelled",
        },

        createdAt: {
          $gte: start,
          $lt: end,
        },
      },
    },

    {
      $group: {
        _id: null,

        sales: {
          $sum: {
            $ifNull: ["$total", 0],
          },
        },

        paid: {
          $sum: {
            $cond: [
              {
                $eq: ["$paymentStatus", "paid"],
              },

              {
                $ifNull: ["$total", 0],
              },

              0,
            ],
          },
        },

        count: {
          $sum: 1,
        },
      },
    },
  ]);

  return {
    sales: roundMoney(rows[0]?.sales),

    paid: roundMoney(rows[0]?.paid),

    count: Number(rows[0]?.count || 0),
  };
};

const getPeriodExpenses = async (start, end) => {
  const rows = await FinanceExpense.aggregate([
    {
      $match: {
        expenseDate: {
          $gte: start,
          $lt: end,
        },
      },
    },

    {
      $group: {
        _id: null,

        amount: {
          $sum: "$amount",
        },

        count: {
          $sum: 1,
        },
      },
    },
  ]);

  return {
    amount: roundMoney(rows[0]?.amount),

    count: Number(rows[0]?.count || 0),
  };
};

const getMonthlyFinance = async () => {
  const now = new Date();

  const end = nextUtcMonth(startOfUtcMonth(now));

  const start = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11, 1),
  );

  const [orderRows, expenseRows] = await Promise.all([
    Order.aggregate([
      {
        $match: {
          orderStatus: {
            $ne: "cancelled",
          },

          createdAt: {
            $gte: start,

            $lt: end,
          },
        },
      },

      {
        $group: {
          _id: {
            year: {
              $year: "$createdAt",
            },

            month: {
              $month: "$createdAt",
            },
          },

          sales: {
            $sum: {
              $ifNull: ["$total", 0],
            },
          },

          paid: {
            $sum: {
              $cond: [
                {
                  $eq: ["$paymentStatus", "paid"],
                },

                {
                  $ifNull: ["$total", 0],
                },

                0,
              ],
            },
          },

          orders: {
            $sum: 1,
          },
        },
      },
    ]),

    FinanceExpense.aggregate([
      {
        $match: {
          expenseDate: {
            $gte: start,

            $lt: end,
          },
        },
      },

      {
        $group: {
          _id: {
            year: {
              $year: "$expenseDate",
            },

            month: {
              $month: "$expenseDate",
            },
          },

          expenses: {
            $sum: "$amount",
          },
        },
      },
    ]),
  ]);

  const ordersMap = new Map();

  const expensesMap = new Map();

  orderRows.forEach((item) => {
    ordersMap.set(monthKey(item._id.year, item._id.month), item);
  });

  expenseRows.forEach((item) => {
    expensesMap.set(monthKey(item._id.year, item._id.month), item);
  });

  const result = [];

  const cursor = new Date(start);

  while (cursor < end) {
    const key = monthKey(cursor.getUTCFullYear(), cursor.getUTCMonth() + 1);

    const order = ordersMap.get(key);

    const expense = expensesMap.get(key);

    const sales = roundMoney(order?.sales);

    const paid = roundMoney(order?.paid);

    const expenses = roundMoney(expense?.expenses);

    result.push({
      month: key,

      label: monthLabel(cursor),

      sales,

      paid,

      expenses,

      netCash: roundMoney(paid - expenses),

      orders: Number(order?.orders || 0),
    });

    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }

  return result;
};

export const getFinanceDashboard = async ({ from, to } = {}) => {
  const { match: orderDateMatch } = buildDateRange(from, to, "createdAt");

  const { match: expenseDateMatch } = buildDateRange(from, to, "expenseDate");

  const now = new Date();

  const todayStart = startOfUtcDay(now);

  const tomorrow = new Date(todayStart);

  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

  const thisMonthStart = startOfUtcMonth(now);

  const nextMonthStart = nextUtcMonth(thisMonthStart);

  const lastMonthStart = previousUtcMonth(thisMonthStart);

  const financeOrders = await Order.find({
    ...orderDateMatch,

    orderStatus: {
      $ne: "cancelled",
    },
  })
    .populate("user", "email")
    .populate("items.product", "name sku price costPrice")
    .sort({
      createdAt: -1,
    })
    .lean();

  const orderIds = financeOrders.map((order) => order._id);

  const manufacturingOrders =
    orderIds.length > 0
      ? await ManufacturingOrder.find({
          order: {
            $in: orderIds,
          },
        })
          .populate("units.product", "name sku price costPrice")
          .populate("units.smartUnit", "name costPrice")
          .lean()
      : [];

  const unitsByOrder = new Map();

  manufacturingOrders.forEach((manufacturing) => {
    const orderId = getId(manufacturing.order);

    if (!unitsByOrder.has(orderId)) {
      unitsByOrder.set(orderId, []);
    }

    unitsByOrder.get(orderId).push(...(manufacturing.units || []));
  });

  const productMap = new Map();

  const orderItemProductMap = new Map();

  financeOrders.forEach((order) => {
    const items = Array.isArray(order.items) ? order.items : [];

    let itemRevenues = items.map((item) => getOrderItemLineRevenue(item));

    const itemRevenueTotal = itemRevenues.reduce(
      (sum, value) => sum + Number(value || 0),
      0,
    );

    const orderProductRevenue = getOrderProductRevenue(order);

    if (itemRevenueTotal <= 0 && orderProductRevenue > 0 && items.length > 0) {
      const totalQuantity = items.reduce(
        (sum, item) => sum + getOrderItemQuantity(item),
        0,
      );

      itemRevenues = items.map((item) => {
        const quantity = getOrderItemQuantity(item);

        return totalQuantity > 0
          ? roundMoney(orderProductRevenue * (quantity / totalQuantity))
          : 0;
      });
    }

    items.forEach((item, index) => {
      const { productId, productName, sku } = getProductInfoFromItem(item);

      const fallbackId =
        productId || `${getId(order._id)}-${getId(item._id)}-${index}`;

      const itemId = getId(item._id);

      if (itemId) {
        orderItemProductMap.set(`${getId(order._id)}:${itemId}`, fallbackId);
      }

      if (!productMap.has(fallbackId)) {
        productMap.set(fallbackId, {
          productId: productId || "",

          productName,

          sku,

          quantity: 0,

          revenue: 0,

          productCost: 0,

          smartUnitCost: 0,

          assemblyCost: 0,

          packagingCost: 0,

          totalCost: 0,

          manufacturingUnits: 0,

          completedUnits: 0,
        });
      }

      const row = productMap.get(fallbackId);

      row.quantity += getOrderItemQuantity(item);

      row.revenue += Number(itemRevenues[index] || 0);
    });
  });

  let totalProductCost = 0;

  let totalSmartUnitCost = 0;

  let totalAssemblyCost = 0;

  let totalPackagingCost = 0;

  let paidDirectProductionCost = 0;

  const orderCostMap = new Map();

  financeOrders.forEach((order) => {
    const orderId = getId(order._id);

    const units = unitsByOrder.get(orderId) || [];

    const items = Array.isArray(order.items) ? order.items : [];

    const itemsMap = new Map();

    items.forEach((item) => {
      itemsMap.set(getId(item._id), item);
    });

    let orderProductCost = 0;

    let orderSmartUnitCost = 0;

    let orderAssemblyCost = 0;

    let orderPackagingCost = 0;

    units.forEach((unit) => {
      const orderItemId = getId(unit.orderItemId);

      const orderItem = orderItemId ? itemsMap.get(orderItemId) : null;

      const cost = getUnitCost(unit, orderItem);

      totalProductCost += cost.productCost;

      totalSmartUnitCost += cost.smartUnitCost;

      totalAssemblyCost += cost.assemblyCost;

      totalPackagingCost += cost.packagingCost;

      orderProductCost += cost.productCost;

      orderSmartUnitCost += cost.smartUnitCost;

      orderAssemblyCost += cost.assemblyCost;

      orderPackagingCost += cost.packagingCost;

      let productId = getId(unit.product);

      if (!productId && orderItemId) {
        productId = orderItemProductMap.get(`${orderId}:${orderItemId}`) || "";
      }

      if (!productId && orderItem) {
        productId = getProductInfoFromItem(orderItem).productId;
      }

      if (productId) {
        if (!productMap.has(productId)) {
          const itemInfo = orderItem
            ? getProductInfoFromItem(orderItem)
            : {
                productId,
                productName: unit?.product?.name || "Unknown Product",
                sku: unit?.product?.sku || "",
              };

          productMap.set(productId, {
            productId,

            productName: itemInfo.productName,

            sku: itemInfo.sku,

            quantity: 0,

            revenue: 0,

            productCost: 0,

            smartUnitCost: 0,

            assemblyCost: 0,

            packagingCost: 0,

            totalCost: 0,

            manufacturingUnits: 0,

            completedUnits: 0,
          });
        }

        const productRow = productMap.get(productId);

        productRow.productCost += cost.productCost;

        productRow.smartUnitCost += cost.smartUnitCost;

        productRow.assemblyCost += cost.assemblyCost;

        productRow.packagingCost += cost.packagingCost;

        productRow.totalCost += cost.totalCost;

        productRow.manufacturingUnits += 1;

        if (unit.status === "completed") {
          productRow.completedUnits += 1;
        }
      }
    });

    const directCost = roundMoney(
      orderProductCost +
        orderSmartUnitCost +
        orderAssemblyCost +
        orderPackagingCost,
    );

    if (order.paymentStatus === "paid") {
      paidDirectProductionCost += directCost;
    }

    orderCostMap.set(orderId, {
      productCost: roundMoney(orderProductCost),

      smartUnitCost: roundMoney(orderSmartUnitCost),

      assemblyCost: roundMoney(orderAssemblyCost),

      packagingCost: roundMoney(orderPackagingCost),

      total: directCost,

      costingStatus: getOrderCostingStatus(units),
    });
  });

  totalProductCost = roundMoney(totalProductCost);

  totalSmartUnitCost = roundMoney(totalSmartUnitCost);

  totalAssemblyCost = roundMoney(totalAssemblyCost);

  totalPackagingCost = roundMoney(totalPackagingCost);

  const directProductionCost = roundMoney(
    totalProductCost +
      totalSmartUnitCost +
      totalAssemblyCost +
      totalPackagingCost,
  );

  const productProfitability = Array.from(productMap.values())
    .map((product) => {
      const revenue = roundMoney(product.revenue);

      const totalCost = roundMoney(
        product.productCost +
          product.smartUnitCost +
          product.assemblyCost +
          product.packagingCost,
      );

      const grossProfit = roundMoney(revenue - totalCost);

      const margin =
        revenue > 0 ? roundMoney((grossProfit / revenue) * 100) : 0;

      let costingStatus = "not_started";

      if (product.manufacturingUnits > 0) {
        costingStatus =
          product.completedUnits >= product.quantity && product.quantity > 0
            ? "completed"
            : "in_progress";
      }

      return {
        productId: product.productId,

        productName: product.productName,

        sku: product.sku,

        quantity: product.quantity,

        averageSellingPrice:
          product.quantity > 0 ? roundMoney(revenue / product.quantity) : 0,

        revenue,

        productCost: roundMoney(product.productCost),

        smartUnitCost: roundMoney(product.smartUnitCost),

        assemblyCost: roundMoney(product.assemblyCost),

        packagingCost: roundMoney(product.packagingCost),

        totalCost,

        grossProfit,

        margin,

        costingStatus,
      };
    })
    .sort((first, second) => second.grossProfit - first.grossProfit);

  const orderProfitability = financeOrders.map((order) => {
    const orderId = getId(order._id);

    const costs = orderCostMap.get(orderId) || {
      productCost: 0,

      smartUnitCost: 0,

      assemblyCost: 0,

      packagingCost: 0,

      total: 0,

      costingStatus: "not_started",
    };

    const productRevenue = getOrderProductRevenue(order);

    const grossProductProfit = roundMoney(productRevenue - costs.total);

    const grossMargin =
      productRevenue > 0
        ? roundMoney((grossProductProfit / productRevenue) * 100)
        : 0;

    const shippingAddress = order.shippingAddress || {};

    const customerName =
      order.customerName ||
      [shippingAddress.firstName, shippingAddress.lastName]
        .filter(Boolean)
        .join(" ") ||
      order.user?.email ||
      "Unknown";

    return {
      _id: order._id,

      orderNumber: order.orderNumber,

      customer: customerName,

      customerEmail:
        order.user?.email || order.email || shippingAddress.email || "",

      paymentStatus: order.paymentStatus,

      orderStatus: order.orderStatus,

      productRevenue,

      shippingCost: roundMoney(order.shippingCost),

      orderTotal: roundMoney(order.total),

      productCost: costs.productCost,

      smartUnitCost: costs.smartUnitCost,

      assemblyCost: costs.assemblyCost,

      packagingCost: costs.packagingCost,

      directProductionCost: costs.total,

      grossProductProfit,

      grossMargin,

      costingStatus: costs.costingStatus,

      createdAt: order.createdAt,
    };
  });

  let completedCosting = 0;

  let inProgressCosting = 0;

  let notStartedCosting = 0;

  orderProfitability.forEach((order) => {
    if (order.costingStatus === "completed") {
      completedCosting += 1;
    } else if (order.costingStatus === "in_progress") {
      inProgressCosting += 1;
    } else {
      notStartedCosting += 1;
    }
  });

  const [
    orderSummaryRows,
    expenseSummaryRows,
    paymentMethodsRows,
    orderStatusRows,
    expenseCategoryRows,
    monthly,
    recentOrders,
    recentExpenses,
    todaySales,
    todayExpenses,
    thisMonthSales,
    thisMonthExpenses,
    lastMonthSales,
    lastMonthExpenses,
  ] = await Promise.all([
    Order.aggregate([
      {
        $match: orderDateMatch,
      },

      {
        $group: {
          _id: null,

          totalOrders: {
            $sum: 1,
          },

          activeOrders: {
            $sum: {
              $cond: [
                {
                  $ne: ["$orderStatus", "cancelled"],
                },

                1,

                0,
              ],
            },
          },

          totalSales: {
            $sum: {
              $cond: [
                {
                  $ne: ["$orderStatus", "cancelled"],
                },

                {
                  $ifNull: ["$total", 0],
                },

                0,
              ],
            },
          },

          productRevenue: {
            $sum: {
              $cond: [
                {
                  $ne: ["$orderStatus", "cancelled"],
                },

                {
                  $ifNull: [
                    "$subtotal",
                    {
                      $subtract: [
                        {
                          $ifNull: ["$total", 0],
                        },

                        {
                          $ifNull: ["$shippingCost", 0],
                        },
                      ],
                    },
                  ],
                },

                0,
              ],
            },
          },

          paidRevenue: {
            $sum: {
              $cond: [
                {
                  $and: [
                    {
                      $ne: ["$orderStatus", "cancelled"],
                    },

                    {
                      $eq: ["$paymentStatus", "paid"],
                    },
                  ],
                },

                {
                  $ifNull: ["$total", 0],
                },

                0,
              ],
            },
          },

          pendingRevenue: {
            $sum: {
              $cond: [
                {
                  $and: [
                    {
                      $ne: ["$orderStatus", "cancelled"],
                    },

                    {
                      $eq: ["$paymentStatus", "pending"],
                    },
                  ],
                },

                {
                  $ifNull: ["$total", 0],
                },

                0,
              ],
            },
          },

          failedRevenue: {
            $sum: {
              $cond: [
                {
                  $and: [
                    {
                      $ne: ["$orderStatus", "cancelled"],
                    },

                    {
                      $eq: ["$paymentStatus", "failed"],
                    },
                  ],
                },

                {
                  $ifNull: ["$total", 0],
                },

                0,
              ],
            },
          },

          cancelledValue: {
            $sum: {
              $cond: [
                {
                  $eq: ["$orderStatus", "cancelled"],
                },

                {
                  $ifNull: ["$total", 0],
                },

                0,
              ],
            },
          },

          shippingRevenue: {
            $sum: {
              $cond: [
                {
                  $ne: ["$orderStatus", "cancelled"],
                },

                {
                  $ifNull: ["$shippingCost", 0],
                },

                0,
              ],
            },
          },

          paidOrders: {
            $sum: {
              $cond: [
                {
                  $and: [
                    {
                      $ne: ["$orderStatus", "cancelled"],
                    },

                    {
                      $eq: ["$paymentStatus", "paid"],
                    },
                  ],
                },

                1,

                0,
              ],
            },
          },

          pendingOrders: {
            $sum: {
              $cond: [
                {
                  $and: [
                    {
                      $ne: ["$orderStatus", "cancelled"],
                    },

                    {
                      $eq: ["$paymentStatus", "pending"],
                    },
                  ],
                },

                1,

                0,
              ],
            },
          },

          failedOrders: {
            $sum: {
              $cond: [
                {
                  $and: [
                    {
                      $ne: ["$orderStatus", "cancelled"],
                    },

                    {
                      $eq: ["$paymentStatus", "failed"],
                    },
                  ],
                },

                1,

                0,
              ],
            },
          },

          cancelledOrders: {
            $sum: {
              $cond: [
                {
                  $eq: ["$orderStatus", "cancelled"],
                },

                1,

                0,
              ],
            },
          },
        },
      },
    ]),

    FinanceExpense.aggregate([
      {
        $match: expenseDateMatch,
      },

      {
        $group: {
          _id: null,

          totalExpenses: {
            $sum: "$amount",
          },

          expenseCount: {
            $sum: 1,
          },
        },
      },
    ]),

    Order.aggregate([
      {
        $match: {
          ...orderDateMatch,

          orderStatus: {
            $ne: "cancelled",
          },
        },
      },

      {
        $group: {
          _id: "$paymentMethod",

          amount: {
            $sum: {
              $ifNull: ["$total", 0],
            },
          },

          count: {
            $sum: 1,
          },
        },
      },

      {
        $sort: {
          amount: -1,
        },
      },
    ]),

    Order.aggregate([
      {
        $match: orderDateMatch,
      },

      {
        $group: {
          _id: "$orderStatus",

          amount: {
            $sum: {
              $ifNull: ["$total", 0],
            },
          },

          count: {
            $sum: 1,
          },
        },
      },

      {
        $sort: {
          amount: -1,
        },
      },
    ]),

    FinanceExpense.aggregate([
      {
        $match: expenseDateMatch,
      },

      {
        $group: {
          _id: "$category",

          amount: {
            $sum: "$amount",
          },

          count: {
            $sum: 1,
          },
        },
      },

      {
        $sort: {
          amount: -1,
        },
      },
    ]),

    getMonthlyFinance(),

    Order.find(orderDateMatch)
      .populate("user", "email")
      .select(
        "orderNumber user total subtotal shippingCost paymentMethod paymentStatus orderStatus createdAt",
      )
      .sort({
        createdAt: -1,
      })
      .limit(10)
      .lean(),

    FinanceExpense.find(expenseDateMatch)
      .populate("createdBy", "email")
      .sort({
        expenseDate: -1,
        createdAt: -1,
      })
      .limit(10)
      .lean(),

    getPeriodSales(todayStart, tomorrow),

    getPeriodExpenses(todayStart, tomorrow),

    getPeriodSales(thisMonthStart, nextMonthStart),

    getPeriodExpenses(thisMonthStart, nextMonthStart),

    getPeriodSales(lastMonthStart, thisMonthStart),

    getPeriodExpenses(lastMonthStart, thisMonthStart),
  ]);

  const orderSummary = orderSummaryRows[0] || {};

  const expenseSummary = expenseSummaryRows[0] || {};

  const totalSales = roundMoney(orderSummary.totalSales);

  const productRevenue = roundMoney(orderSummary.productRevenue);

  const paidRevenue = roundMoney(orderSummary.paidRevenue);

  const expenses = roundMoney(expenseSummary.totalExpenses);

  const activeOrders = Number(orderSummary.activeOrders || 0);

  const averageOrderValue =
    activeOrders > 0 ? roundMoney(totalSales / activeOrders) : 0;

  const collectionRate =
    totalSales > 0 ? roundMoney((paidRevenue / totalSales) * 100) : 0;

  const grossProductProfit = roundMoney(productRevenue - directProductionCost);

  const grossMargin =
    productRevenue > 0
      ? roundMoney((grossProductProfit / productRevenue) * 100)
      : 0;

  const netProfit = roundMoney(
    paidRevenue - paidDirectProductionCost - expenses,
  );

  const monthlyGrowth =
    lastMonthSales.sales > 0
      ? roundMoney(
          ((thisMonthSales.sales - lastMonthSales.sales) /
            lastMonthSales.sales) *
            100,
        )
      : thisMonthSales.sales > 0
        ? 100
        : 0;

  return {
    currency: process.env.FINANCE_CURRENCY || "EGP",

    filters: {
      from: from || null,

      to: to || null,
    },

    overview: {
      totalSales,

      productRevenue,

      paidRevenue,

      outstandingRevenue: roundMoney(orderSummary.pendingRevenue),

      failedPayments: roundMoney(orderSummary.failedRevenue),

      cancelledValue: roundMoney(orderSummary.cancelledValue),

      shippingRevenue: roundMoney(orderSummary.shippingRevenue),

      directProductionCost,

      grossProductProfit,

      grossMargin,

      expenses,

      netCash: roundMoney(paidRevenue - expenses),

      netProfit,

      collectionRate,

      averageOrderValue,
    },

    costBreakdown: {
      productCost: totalProductCost,

      smartUnitCost: totalSmartUnitCost,

      assemblyCost: totalAssemblyCost,

      packagingCost: totalPackagingCost,

      total: directProductionCost,
    },

    costing: {
      completed: completedCosting,

      inProgress: inProgressCosting,

      notStarted: notStartedCosting,

      total: completedCosting + inProgressCosting + notStartedCosting,
    },

    orders: {
      total: Number(orderSummary.totalOrders || 0),

      active: activeOrders,

      paid: Number(orderSummary.paidOrders || 0),

      pending: Number(orderSummary.pendingOrders || 0),

      failed: Number(orderSummary.failedOrders || 0),

      cancelled: Number(orderSummary.cancelledOrders || 0),
    },

    periods: {
      today: {
        sales: todaySales.sales,

        paid: todaySales.paid,

        expenses: todayExpenses.amount,

        netCash: roundMoney(todaySales.paid - todayExpenses.amount),
      },

      thisMonth: {
        sales: thisMonthSales.sales,

        paid: thisMonthSales.paid,

        expenses: thisMonthExpenses.amount,

        netCash: roundMoney(thisMonthSales.paid - thisMonthExpenses.amount),
      },

      lastMonth: {
        sales: lastMonthSales.sales,

        paid: lastMonthSales.paid,

        expenses: lastMonthExpenses.amount,

        netCash: roundMoney(lastMonthSales.paid - lastMonthExpenses.amount),
      },

      monthlyGrowth,
    },

    paymentMethods: paymentMethodsRows.map((item) => ({
      method: item._id || "unknown",

      amount: roundMoney(item.amount),

      count: Number(item.count || 0),
    })),

    orderStatuses: orderStatusRows.map((item) => ({
      status: item._id || "unknown",

      amount: roundMoney(item.amount),

      count: Number(item.count || 0),
    })),

    expenseCategories: expenseCategoryRows.map((item) => ({
      category: item._id || "other",

      amount: roundMoney(item.amount),

      count: Number(item.count || 0),
    })),

    monthly,

    productProfitability,

    orderProfitability,

    recentOrders: recentOrders.map((order) => ({
      _id: order._id,

      orderNumber: order.orderNumber,

      customer: order.user?.email || "Unknown",

      subtotal: roundMoney(order.subtotal),

      shippingCost: roundMoney(order.shippingCost),

      total: roundMoney(order.total),

      paymentMethod: order.paymentMethod,

      paymentStatus: order.paymentStatus,

      orderStatus: order.orderStatus,

      createdAt: order.createdAt,
    })),

    recentExpenses: recentExpenses.map((expense) => ({
      _id: expense._id,

      title: expense.title,

      category: expense.category,

      amount: roundMoney(expense.amount),

      expenseDate: expense.expenseDate,

      note: expense.note,

      createdBy: expense.createdBy?.email || "",
    })),
  };
};

export const createFinanceExpense = async ({
  title,
  category,
  amount,
  expenseDate,
  note,
  createdBy,
}) => {
  if (!title || !String(title).trim()) {
    throw createError("Expense title is required");
  }

  const numericAmount = Number(amount);

  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    throw createError("Expense amount must be greater than zero");
  }

  let parsedDate = new Date();

  if (expenseDate) {
    parsedDate = normalizeDate(expenseDate);
  }

  const expense = await FinanceExpense.create({
    title: String(title).trim(),

    category: category || "other",

    amount: numericAmount,

    expenseDate: parsedDate,

    note: note ? String(note).trim() : "",

    createdBy: createdBy || null,
  });

  return expense;
};

export const updateFinanceExpense = async (expenseId, payload) => {
  if (!mongoose.Types.ObjectId.isValid(expenseId)) {
    throw createError("Invalid expense ID");
  }

  const expense = await FinanceExpense.findById(expenseId);

  if (!expense) {
    throw createError("Expense not found", 404);
  }

  if (payload.title !== undefined) {
    if (!String(payload.title).trim()) {
      throw createError("Expense title is required");
    }

    expense.title = String(payload.title).trim();
  }

  if (payload.category !== undefined) {
    expense.category = payload.category;
  }

  if (payload.amount !== undefined) {
    const numericAmount = Number(payload.amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      throw createError("Expense amount must be greater than zero");
    }

    expense.amount = numericAmount;
  }

  if (payload.expenseDate !== undefined) {
    expense.expenseDate = normalizeDate(payload.expenseDate);
  }

  if (payload.note !== undefined) {
    expense.note = String(payload.note || "").trim();
  }

  await expense.save();

  return expense;
};

export const deleteFinanceExpense = async (expenseId) => {
  if (!mongoose.Types.ObjectId.isValid(expenseId)) {
    throw createError("Invalid expense ID");
  }

  const expense = await FinanceExpense.findByIdAndDelete(expenseId);

  if (!expense) {
    throw createError("Expense not found", 404);
  }

  return expense;
};

export const getFinanceExpenses = async ({
  from,
  to,
  page = 1,
  limit = 20,
} = {}) => {
  const { match } = buildDateRange(from, to, "expenseDate");

  const safePage = Math.max(Number(page) || 1, 1);

  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);

  const [expenses, total] = await Promise.all([
    FinanceExpense.find(match)
      .populate("createdBy", "email")
      .sort({
        expenseDate: -1,
        createdAt: -1,
      })
      .skip((safePage - 1) * safeLimit)
      .limit(safeLimit)
      .lean(),

    FinanceExpense.countDocuments(match),
  ]);

  return {
    expenses,

    pagination: {
      page: safePage,

      limit: safeLimit,

      total,

      pages: Math.ceil(total / safeLimit),
    },
  };
};
