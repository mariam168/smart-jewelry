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

export const getFinanceDashboard =
  async ({
    from,
    to,
  } = {}) => {
    const orderDateMatch =
      buildDateRange(
        from,
        to,
        "createdAt",
      );

    const expenseDateMatch =
      buildDateRange(
        from,
        to,
        "expenseDate",
      );

    /*
     * FINANCE RULE:
     * Orders count as recognized sales from
     * "confirmed" status onward.
     *
     * Pending and cancelled orders do not count.
     */
    const recognizedOrders =
      await Order.find({
        ...orderDateMatch,

        orderStatus: {
          $in:
            FINANCE_RECOGNIZED_ORDER_STATUSES,
        },
      })
        .populate(
          "user",
          "email",
        )
        .populate(
          "items.product",
          "name sku price costPrice",
        )
        .sort({
          createdAt: -1,
        })
        .lean();

    const orderIds =
      recognizedOrders.map(
        (order) =>
          order._id,
      );

    const manufacturingOrders =
      orderIds.length > 0
        ? await ManufacturingOrder.find({
            order: {
              $in: orderIds,
            },
          })
            .populate(
              "units.smartUnit",
              "name costPrice",
            )
            .lean()
        : [];

    const manufacturingByOrder =
      new Map();

    for (
      const manufacturing of
        manufacturingOrders
    ) {
      manufacturingByOrder.set(
        getId(
          manufacturing.order,
        ),
        manufacturing,
      );
    }

    const soldItems = [];

    let recognizedSales = 0;

    let totalProductCost = 0;

    let totalSmartUnitCost = 0;

    let totalInstallationCost = 0;

    let totalPackagingCost = 0;

    let totalUnitsSold = 0;

    for (
      const order of recognizedOrders
    ) {
      const orderId =
        getId(order._id);

      const manufacturing =
        manufacturingByOrder.get(
          orderId,
        );

      const units =
        manufacturing?.units || [];

      const unitsByItem =
        new Map();

      for (const unit of units) {
        const itemId =
          getId(
            unit.orderItemId,
          );

        if (!itemId) {
          continue;
        }

        if (
          !unitsByItem.has(
            itemId,
          )
        ) {
          unitsByItem.set(
            itemId,
            [],
          );
        }

        unitsByItem
          .get(itemId)
          .push(unit);
      }

      for (
        const item of
          order.items || []
      ) {
        const itemId =
          getId(item._id);

        const quantity =
          getQuantity(item);

        const revenue =
          getItemRevenue(item);

        const productCost =
          getProductCost(item);

        const productionUnits =
          unitsByItem.get(
            itemId,
          ) || [];

        let smartUnitCost = 0;

        let installationCost = 0;

        let packagingCost = 0;

        for (
          const unit of
            productionUnits
        ) {
          smartUnitCost +=
            getNumber(
              unit?.smartUnitCostSnapshot,
              unit?.smartUnit?.costPrice,
            );

          installationCost +=
            getNumber(
              unit?.assemblyCost,
            );

          packagingCost +=
            getNumber(
              unit?.packagingCost,
            );
        }

        smartUnitCost =
          roundMoney(
            smartUnitCost,
          );

        installationCost =
          roundMoney(
            installationCost,
          );

        packagingCost =
          roundMoney(
            packagingCost,
          );

        const totalCost =
          roundMoney(
            productCost +
              smartUnitCost +
              installationCost +
              packagingCost,
          );

        const profit =
          roundMoney(
            revenue -
              totalCost,
          );

        const margin =
          revenue > 0
            ? roundMoney(
                (profit /
                  revenue) *
                  100,
              )
            : 0;

        recognizedSales +=
          revenue;

        totalProductCost +=
          productCost;

        totalSmartUnitCost +=
          smartUnitCost;

        totalInstallationCost +=
          installationCost;

        totalPackagingCost +=
          packagingCost;

        totalUnitsSold +=
          quantity;

        soldItems.push({
          orderId:
            order._id,

          orderNumber:
            order.orderNumber,

          orderDate:
            order.createdAt,

          orderStatus:
            order.orderStatus,

          customer:
            getCustomerName(
              order,
            ),

          customerEmail:
            order.user?.email ||
            "",

          productId:
            getId(
              item.product,
            ),

          productName:
            item.name ||
            item.product?.name ||
            "Unknown Product",

          sku:
            item.variant?.sku ||
            item.product?.sku ||
            "",

          quantity,

          sellingPricePerUnit:
            quantity > 0
              ? roundMoney(
                  revenue /
                    quantity,
                )
              : 0,

          revenue,

          productCost,

          smartUnitCost,

          installationCost,

          packagingCost,

          totalCost,

          profit,

          margin,

          manufacturingStatus:
            manufacturing?.status ||
            "not_started",
        });
      }
    }

    recognizedSales =
      roundMoney(
        recognizedSales,
      );

    totalProductCost =
      roundMoney(
        totalProductCost,
      );

    totalSmartUnitCost =
      roundMoney(
        totalSmartUnitCost,
      );

    totalInstallationCost =
      roundMoney(
        totalInstallationCost,
      );

    totalPackagingCost =
      roundMoney(
        totalPackagingCost,
      );

    const totalDirectCost =
      roundMoney(
        totalProductCost +
          totalSmartUnitCost +
          totalInstallationCost +
          totalPackagingCost,
      );

    const profit =
      roundMoney(
        recognizedSales -
          totalDirectCost,
      );

    const profitMargin =
      recognizedSales > 0
        ? roundMoney(
            (profit /
              recognizedSales) *
              100,
          )
        : 0;

    const [
      expenseRows,
      recentExpenses,
    ] =
      await Promise.all([
        FinanceExpense.aggregate([
          {
            $match:
              expenseDateMatch,
          },

          {
            $group: {
              _id: null,

              total: {
                $sum:
                  "$amount",
              },

              count: {
                $sum: 1,
              },
            },
          },
        ]),

        FinanceExpense.find(
          expenseDateMatch,
        )
          .populate(
            "createdBy",
            "email",
          )
          .sort({
            expenseDate: -1,

            createdAt: -1,
          })
          .limit(20)
          .lean(),
      ]);

    return {
      currency:
        process.env
          .FINANCE_CURRENCY ||
        "EGP",

      filters: {
        from: from || null,

        to: to || null,
      },

      financeRecognition: {
        startsAt:
          "confirmed",

        includedStatuses:
          FINANCE_RECOGNIZED_ORDER_STATUSES,

        excludedStatuses: [
          "pending",
          "cancelled",
        ],
      },

      overview: {
        recognizedSales,

        recognizedOrders:
          recognizedOrders.length,

        totalDirectCost,

        profit,

        profitMargin,

        totalUnitsSold,

        /*
         * Backward-compatible aliases.
         *
         * Keep these temporarily so any older
         * frontend code using deliveredSales /
         * deliveredOrders does not break.
         */
        deliveredSales:
          recognizedSales,

        deliveredOrders:
          recognizedOrders.length,
      },

      costBreakdown: {
        productCost:
          totalProductCost,

        smartUnitCost:
          totalSmartUnitCost,

        installationCost:
          totalInstallationCost,

        packagingCost:
          totalPackagingCost,

        total:
          totalDirectCost,
      },

      soldItems,

      businessExpenses: {
        total:
          roundMoney(
            expenseRows[0]
              ?.total,
          ),

        count:
          Number(
            expenseRows[0]
              ?.count ||
              0,
          ),
      },

      recentExpenses:
        recentExpenses.map(
          (expense) => ({
            _id:
              expense._id,

            title:
              expense.title,

            category:
              expense.category,

            amount:
              roundMoney(
                expense.amount,
              ),

            expenseDate:
              expense.expenseDate,

            note:
              expense.note,

            createdBy:
              expense
                .createdBy
                ?.email ||
              "",
          }),
        ),
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