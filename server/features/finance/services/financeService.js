import mongoose from "mongoose";

import Order from "../../orders/models/Order.js";
import ManufacturingOrder from "../../manufacturing/models/ManufacturingOrder.js";
import FinanceExpense from "../models/FinanceExpense.js";

const createError = (
  message,
  statusCode = 400,
) => {
  const error = new Error(message);

  error.statusCode = statusCode;

  return error;
};

const roundMoney = (value) => {
  return Number(
    Number(value || 0).toFixed(2),
  );
};

const getNumber = (...values) => {
  for (const value of values) {
    if (
      value === undefined ||
      value === null ||
      value === ""
    ) {
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

  if (
    typeof value === "object" &&
    value._id
  ) {
    return String(value._id);
  }

  return String(value);
};

const normalizeDate = (
  value,
  endOfDay = false,
) => {
  if (!value) {
    return null;
  }

  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    throw createError(
      "Date must use YYYY-MM-DD format",
    );
  }

  const [year, month, day] = value
    .split("-")
    .map(Number);

  const date = new Date(
    Date.UTC(
      year,
      month - 1,
      day,
    ),
  );

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw createError(
      "Invalid date",
    );
  }

  if (endOfDay) {
    date.setUTCDate(
      date.getUTCDate() + 1,
    );
  }

  return date;
};

const buildDateRange = (
  from,
  to,
  fieldName,
) => {
  const fromDate =
    normalizeDate(from);

  const toDate =
    normalizeDate(
      to,
      true,
    );

  if (
    fromDate &&
    toDate &&
    fromDate >= toDate
  ) {
    throw createError(
      "From date cannot be after To date",
    );
  }

  const match = {};

  if (fromDate || toDate) {
    match[fieldName] = {};

    if (fromDate) {
      match[fieldName].$gte =
        fromDate;
    }

    if (toDate) {
      match[fieldName].$lt =
        toDate;
    }
  }

  return match;
};

const getQuantity = (item) => {
  const quantity = Number(
    item?.quantity || 1,
  );

  if (
    !Number.isFinite(quantity) ||
    quantity <= 0
  ) {
    return 1;
  }

  return quantity;
};

const getItemRevenue = (item) => {
  const quantity =
    getQuantity(item);

  const itemTotal =
    getNumber(
      item?.itemTotal,
      item?.lineTotal,
      item?.totalPrice,
      item?.subtotal,
    );

  if (itemTotal > 0) {
    return roundMoney(
      itemTotal,
    );
  }

  const unitPrice =
    getNumber(
      item?.unitPrice,
      item?.price,
      item?.variantPrice,
      item?.product?.price,
    );

  return roundMoney(
    unitPrice * quantity,
  );
};

const getProductCost = (item) => {
  const quantity =
    getQuantity(item);

  /*
    New orders use the historical product-cost
    snapshot stored when the customer places the order.

    product.costPrice is only a fallback for older
    orders created before productCostSnapshot existed.
  */
  const unitCost =
    getNumber(
      item?.productCostSnapshot,
      item?.product?.costPrice,
    );

  return roundMoney(
    unitCost * quantity,
  );
};

const getCustomerName = (order) => {
  const address =
    order?.shippingAddress || {};

  const name = [
    address.firstName,
    address.lastName,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    name ||
    order?.user?.email ||
    "Unknown Customer"
  );
};

/*
 * FINANCE RECOGNITION RULE
 *
 * Revenue becomes visible in Finance as soon as
 * the order reaches "confirmed".
 *
 * It remains recognized while the order progresses:
 * confirmed -> processing -> shipped -> delivered
 *
 * It is excluded when the order is:
 * pending or cancelled.
 *
 * Therefore, if an admin moves an order backwards
 * from confirmed/processing/etc. to pending, it
 * disappears from Finance again.
 */
const FINANCE_RECOGNIZED_ORDER_STATUSES = [
  "confirmed",
  "processing",
  "shipped",
  "delivered",
];
export const getFinanceDashboard = async ({ from, to } = {}) => {
  const orderDateMatch = buildDateRange(from, to, "createdAt");
  const expenseDateMatch = buildDateRange(from, to, "expenseDate");

  const recognizedOrders = await Order.find({
    ...orderDateMatch,
    orderStatus: { $in: FINANCE_RECOGNIZED_ORDER_STATUSES },
  })
    .populate("user", "email")
    .populate("items.product", "name sku price costPrice")
    .sort({ createdAt: -1 })
    .lean();

  const orderIds = recognizedOrders.map((order) => order._id);

  const manufacturingOrders =
    orderIds.length > 0
      ? await ManufacturingOrder.find({
          order: { $in: orderIds },
        })
          .populate("units.smartUnit", "name costPrice")
          .lean()
      : [];

  const manufacturingByOrder = new Map();

  for (const manufacturing of manufacturingOrders) {
    const orderId = getId(manufacturing.order);

    if (!orderId) continue;

    manufacturingByOrder.set(orderId, manufacturing);
  }

  let totalConfirmedSales = 0;
  let totalProductCost = 0;
  let totalSmartUnitCost = 0;
  let totalInstallationCost = 0;
  let totalPackagingCost = 0;
  let totalDirectCost = 0;
  let totalProfit = 0;

  const soldItems = [];

  for (const order of recognizedOrders) {
    const orderId = getId(order._id);
    const manufacturing = manufacturingByOrder.get(orderId);

    const units = manufacturing?.units || [];

    const unitsByItem = new Map();

    for (const unit of units) {
      const itemId = getId(unit.orderItemId);

      if (!itemId) continue;

      if (!unitsByItem.has(itemId)) {
        unitsByItem.set(itemId, []);
      }

      unitsByItem.get(itemId).push(unit);
    }

    const orderItems = [];

    let orderRevenue = 0;
    let orderProductCost = 0;
    let orderSmartUnitCost = 0;
    let orderInstallationCost = 0;
    let orderPackagingCost = 0;
    let orderTotalCost = 0;
    let orderProfit = 0;

    for (const item of order.items || []) {
      const itemId = getId(item._id);
      const quantity = getQuantity(item);

      const revenue = getItemRevenue(item);

      const productCostTotal = getProductCost(item);

      const productionUnits = unitsByItem.get(itemId) || [];

      const unitRevenue =
        quantity > 0
          ? roundMoney(revenue / quantity)
          : 0;

      const unitProductCost =
        quantity > 0
          ? roundMoney(productCostTotal / quantity)
          : 0;

      const pieces = [];

      if (productionUnits.length > 0) {
        for (let index = 0; index < productionUnits.length; index += 1) {
          const unit = productionUnits[index];

          const smartUnitCost = roundMoney(
            getNumber(
              unit?.smartUnitCostSnapshot,
              unit?.smartUnit?.costPrice,
            ),
          );

          const installationCost = roundMoney(
            getNumber(unit?.assemblyCost),
          );

          const packagingCost = roundMoney(
            getNumber(unit?.packagingCost),
          );

          const pieceRevenue = unitRevenue;

          const pieceProductCost = unitProductCost;

          const totalCost = roundMoney(
            pieceProductCost +
              smartUnitCost +
              installationCost +
              packagingCost,
          );

          const profit = roundMoney(
            pieceRevenue - totalCost,
          );

          const margin =
            pieceRevenue > 0
              ? roundMoney((profit / pieceRevenue) * 100)
              : 0;

          pieces.push({
            unitId: getId(unit._id),
            productId: getId(item.product),
            productName:
              item.name ||
              item.product?.name ||
              "Unknown Product",
            sku:
              item.variant?.sku ||
              item.product?.sku ||
              "",
            pieceNumber: index + 1,
            sellingPrice: pieceRevenue,
            productCost: pieceProductCost,
            smartUnitCost,
            installationCost,
            packagingCost,
            totalCost,
            profit,
            margin,
            manufacturingStatus:
              unit.status || "not_started",
          });
        }
      }

      if (pieces.length < quantity) {
        for (
          let index = pieces.length;
          index < quantity;
          index += 1
        ) {
          const totalCost = roundMoney(
            unitProductCost,
          );

          const profit = roundMoney(
            unitRevenue - totalCost,
          );

          const margin =
            unitRevenue > 0
              ? roundMoney((profit / unitRevenue) * 100)
              : 0;

          pieces.push({
            unitId: null,
            productId: getId(item.product),
            productName:
              item.name ||
              item.product?.name ||
              "Unknown Product",
            sku:
              item.variant?.sku ||
              item.product?.sku ||
              "",
            pieceNumber: index + 1,
            sellingPrice: unitRevenue,
            productCost: unitProductCost,
            smartUnitCost: 0,
            installationCost: 0,
            packagingCost: 0,
            totalCost,
            profit,
            margin,
            manufacturingStatus: "not_started",
          });
        }
      }

      let itemSmartUnitCost = 0;
      let itemInstallationCost = 0;
      let itemPackagingCost = 0;

      for (const piece of pieces) {
        itemSmartUnitCost += piece.smartUnitCost;
        itemInstallationCost += piece.installationCost;
        itemPackagingCost += piece.packagingCost;
      }

      itemSmartUnitCost = roundMoney(itemSmartUnitCost);
      itemInstallationCost = roundMoney(itemInstallationCost);
      itemPackagingCost = roundMoney(itemPackagingCost);

      const totalCost = roundMoney(
        productCostTotal +
          itemSmartUnitCost +
          itemInstallationCost +
          itemPackagingCost,
      );

      const profit = roundMoney(
        revenue - totalCost,
      );

      const margin =
        revenue > 0
          ? roundMoney((profit / revenue) * 100)
          : 0;

      orderItems.push({
        productId: getId(item.product),
        productName:
          item.name ||
          item.product?.name ||
          "Unknown Product",
        sku:
          item.variant?.sku ||
          item.product?.sku ||
          "",
        quantity,
        sellingPricePerUnit: unitRevenue,
        revenue,
        productCost: productCostTotal,
        smartUnitCost: itemSmartUnitCost,
        installationCost: itemInstallationCost,
        packagingCost: itemPackagingCost,
        totalCost,
        profit,
        margin,
        manufacturingStatus:
          manufacturing?.status || "not_started",
        pieces,
      });

      orderRevenue = roundMoney(
        orderRevenue + revenue,
      );

      orderProductCost = roundMoney(
        orderProductCost + productCostTotal,
      );

      orderSmartUnitCost = roundMoney(
        orderSmartUnitCost + itemSmartUnitCost,
      );

      orderInstallationCost = roundMoney(
        orderInstallationCost + itemInstallationCost,
      );

      orderPackagingCost = roundMoney(
        orderPackagingCost + itemPackagingCost,
      );

      orderTotalCost = roundMoney(
        orderTotalCost + totalCost,
      );

      orderProfit = roundMoney(
        orderProfit + profit,
      );
    }

    const orderMargin =
      orderRevenue > 0
        ? roundMoney(
            (orderProfit / orderRevenue) * 100,
          )
        : 0;

    totalConfirmedSales = roundMoney(
      totalConfirmedSales + orderRevenue,
    );

    totalProductCost = roundMoney(
      totalProductCost + orderProductCost,
    );

    totalSmartUnitCost = roundMoney(
      totalSmartUnitCost + orderSmartUnitCost,
    );

    totalInstallationCost = roundMoney(
      totalInstallationCost + orderInstallationCost,
    );

    totalPackagingCost = roundMoney(
      totalPackagingCost + orderPackagingCost,
    );

    totalDirectCost = roundMoney(
      totalDirectCost + orderTotalCost,
    );

    totalProfit = roundMoney(
      totalProfit + orderProfit,
    );

    soldItems.push({
      orderId,
      orderNumber:
        order.orderNumber ||
        order._id?.toString() ||
        "",
      customerName: getCustomerName(order),
      customerEmail: order.user?.email || "",
      orderStatus: order.orderStatus,
      createdAt: order.createdAt,
      revenue: orderRevenue,
      productCost: orderProductCost,
      smartUnitCost: orderSmartUnitCost,
      installationCost: orderInstallationCost,
      packagingCost: orderPackagingCost,
      totalCost: orderTotalCost,
      profit: orderProfit,
      margin: orderMargin,
      items: orderItems,
    });
  }

  const expenses = await FinanceExpense.find(
    expenseDateMatch,
  )
    .populate("createdBy", "email")
    .sort({
      expenseDate: -1,
      createdAt: -1,
    })
    .lean();

  const businessExpenses = expenses.map((expense) => ({
    id: getId(expense._id),
    title: expense.title,
    category: expense.category,
    amount: roundMoney(expense.amount),
    expenseDate: expense.expenseDate,
    note: expense.note || "",
    createdBy: expense.createdBy?.email || "",
    createdAt: expense.createdAt,
  }));

  const totalBusinessExpenses = roundMoney(
    businessExpenses.reduce(
      (sum, expense) =>
        sum + Number(expense.amount || 0),
      0,
    ),
  );

  const netProfit = roundMoney(
    totalProfit - totalBusinessExpenses,
  );

  const totalProfitMargin =
    totalConfirmedSales > 0
      ? roundMoney(
          (totalProfit / totalConfirmedSales) * 100,
        )
      : 0;

  const netProfitMargin =
    totalConfirmedSales > 0
      ? roundMoney(
          (netProfit / totalConfirmedSales) * 100,
        )
      : 0;

  return {
    currency: "EGP",

    filters: {
      from: from || "",
      to: to || "",
    },

    financeRecognition: {
      recognizedOrderStatuses:
        FINANCE_RECOGNIZED_ORDER_STATUSES,
    },

    overview: {
      confirmedSales: totalConfirmedSales,
      productCost: totalProductCost,
      smartUnitCost: totalSmartUnitCost,
      installationCost: totalInstallationCost,
      packagingCost: totalPackagingCost,
      totalDirectCost,
      profit: totalProfit,
      profitMargin: totalProfitMargin,
      businessExpenses: totalBusinessExpenses,
      netProfit,
      netProfitMargin,
    },

    costBreakdown: {
      productCost: totalProductCost,
      smartUnitCost: totalSmartUnitCost,
      installationCost: totalInstallationCost,
      packagingCost: totalPackagingCost,
      totalDirectCost,
    },

    soldItems,

    businessExpenses: {
      total: totalBusinessExpenses,
      items: businessExpenses,
    },

    recentExpenses: businessExpenses.slice(0, 10),
  };
};
export const createFinanceExpense =
  async ({
    title,
    category,
    amount,
    expenseDate,
    note,
    createdBy,
  }) => {
    if (
      !title ||
      !String(
        title,
      ).trim()
    ) {
      throw createError(
        "Expense title is required",
      );
    }

    const numericAmount =
      Number(amount);

    if (
      !Number.isFinite(
        numericAmount,
      ) ||
      numericAmount <= 0
    ) {
      throw createError(
        "Expense amount must be greater than zero",
      );
    }

    let parsedDate =
      new Date();

    if (expenseDate) {
      parsedDate =
        normalizeDate(
          expenseDate,
        );
    }

    const expense =
      await FinanceExpense.create({
        title:
          String(
            title,
          ).trim(),

        category:
          category ||
          "other",

        amount:
          numericAmount,

        expenseDate:
          parsedDate,

        note:
          note
            ? String(
                note,
              ).trim()
            : "",

        createdBy:
          createdBy ||
          null,
      });

    return expense;
  };

export const updateFinanceExpense =
  async (
    expenseId,
    payload,
  ) => {
    if (
      !mongoose.Types.ObjectId.isValid(
        expenseId,
      )
    ) {
      throw createError(
        "Invalid expense ID",
      );
    }

    const expense =
      await FinanceExpense.findById(
        expenseId,
      );

    if (!expense) {
      throw createError(
        "Expense not found",
        404,
      );
    }

    if (
      payload.title !==
      undefined
    ) {
      if (
        !String(
          payload.title,
        ).trim()
      ) {
        throw createError(
          "Expense title is required",
        );
      }

      expense.title =
        String(
          payload.title,
        ).trim();
    }

    if (
      payload.category !==
      undefined
    ) {
      expense.category =
        payload.category;
    }

    if (
      payload.amount !==
      undefined
    ) {
      const numericAmount =
        Number(
          payload.amount,
        );

      if (
        !Number.isFinite(
          numericAmount,
        ) ||
        numericAmount <= 0
      ) {
        throw createError(
          "Expense amount must be greater than zero",
        );
      }

      expense.amount =
        numericAmount;
    }

    if (
      payload.expenseDate !==
      undefined
    ) {
      expense.expenseDate =
        normalizeDate(
          payload.expenseDate,
        );
    }

    if (
      payload.note !==
      undefined
    ) {
      expense.note =
        String(
          payload.note ||
            "",
        ).trim();
    }

    await expense.save();

    return expense;
  };

export const deleteFinanceExpense =
  async (
    expenseId,
  ) => {
    if (
      !mongoose.Types.ObjectId.isValid(
        expenseId,
      )
    ) {
      throw createError(
        "Invalid expense ID",
      );
    }

    const expense =
      await FinanceExpense.findByIdAndDelete(
        expenseId,
      );

    if (!expense) {
      throw createError(
        "Expense not found",
        404,
      );
    }

    return expense;
  };

export const getFinanceExpenses =
  async ({
    from,
    to,
    page = 1,
    limit = 20,
  } = {}) => {
    const match =
      buildDateRange(
        from,
        to,
        "expenseDate",
      );

    const safePage =
      Math.max(
        Number(page) || 1,
        1,
      );

    const safeLimit =
      Math.min(
        Math.max(
          Number(limit) ||
            20,
          1,
        ),
        100,
      );

    const [
      expenses,
      total,
    ] =
      await Promise.all([
        FinanceExpense.find(
          match,
        )
          .populate(
            "createdBy",
            "email",
          )
          .sort({
            expenseDate: -1,

            createdAt: -1,
          })
          .skip(
            (safePage - 1) *
              safeLimit,
          )
          .limit(
            safeLimit,
          )
          .lean(),

        FinanceExpense.countDocuments(
          match,
        ),
      ]);

    return {
      expenses,

      pagination: {
        page:
          safePage,

        limit:
          safeLimit,

        total,

        pages:
          Math.ceil(
            total /
              safeLimit,
          ),
      },
    };
  };