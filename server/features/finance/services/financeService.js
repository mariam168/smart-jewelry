import mongoose from "mongoose";

import Order from "../../orders/models/Order.js";
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

  const [year, month, day] =
    value.split("-").map(Number);

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
  fieldName = "createdAt",
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

  if (
    fromDate ||
    toDate
  ) {
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

  return {
    match,
    fromDate,
    toDate,
  };
};

const startOfUtcDay = (
  date = new Date(),
) => {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
    ),
  );
};

const startOfUtcMonth = (
  date = new Date(),
) => {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      1,
    ),
  );
};

const nextUtcMonth = (
  date,
) => {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth() + 1,
      1,
    ),
  );
};

const previousUtcMonth = (
  date,
) => {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth() - 1,
      1,
    ),
  );
};

const monthKey = (
  year,
  month,
) => {
  return `${year}-${String(
    month,
  ).padStart(2, "0")}`;
};

const monthLabel = (
  date,
) => {
  return date.toLocaleDateString(
    "en-US",
    {
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    },
  );
};

const getPeriodSales = async (
  start,
  end,
) => {
  const rows =
    await Order.aggregate([
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
              $ifNull: [
                "$total",
                0,
              ],
            },
          },

          paid: {
            $sum: {
              $cond: [
                {
                  $eq: [
                    "$paymentStatus",
                    "paid",
                  ],
                },

                {
                  $ifNull: [
                    "$total",
                    0,
                  ],
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
    sales: roundMoney(
      rows[0]?.sales,
    ),

    paid: roundMoney(
      rows[0]?.paid,
    ),

    count: Number(
      rows[0]?.count || 0,
    ),
  };
};

const getPeriodExpenses = async (
  start,
  end,
) => {
  const rows =
    await FinanceExpense.aggregate([
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
    amount: roundMoney(
      rows[0]?.amount,
    ),

    count: Number(
      rows[0]?.count || 0,
    ),
  };
};

const getMonthlyFinance =
  async () => {
    const now = new Date();

    const end =
      nextUtcMonth(
        startOfUtcMonth(now),
      );

    const start =
      new Date(
        Date.UTC(
          now.getUTCFullYear(),
          now.getUTCMonth() - 11,
          1,
        ),
      );

    const [
      orderRows,
      expenseRows,
    ] = await Promise.all([
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
                $ifNull: [
                  "$total",
                  0,
                ],
              },
            },

            paid: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$paymentStatus",
                      "paid",
                    ],
                  },

                  {
                    $ifNull: [
                      "$total",
                      0,
                    ],
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
                $year:
                  "$expenseDate",
              },

              month: {
                $month:
                  "$expenseDate",
              },
            },

            expenses: {
              $sum: "$amount",
            },
          },
        },
      ]),
    ]);

    const ordersMap =
      new Map();

    const expensesMap =
      new Map();

    orderRows.forEach(
      (item) => {
        ordersMap.set(
          monthKey(
            item._id.year,
            item._id.month,
          ),
          item,
        );
      },
    );

    expenseRows.forEach(
      (item) => {
        expensesMap.set(
          monthKey(
            item._id.year,
            item._id.month,
          ),
          item,
        );
      },
    );

    const result = [];

    const cursor =
      new Date(start);

    while (cursor < end) {
      const key =
        monthKey(
          cursor.getUTCFullYear(),
          cursor.getUTCMonth() + 1,
        );

      const order =
        ordersMap.get(key);

      const expense =
        expensesMap.get(key);

      const sales =
        roundMoney(
          order?.sales,
        );

      const paid =
        roundMoney(
          order?.paid,
        );

      const expenses =
        roundMoney(
          expense?.expenses,
        );

      result.push({
        month: key,

        label:
          monthLabel(cursor),

        sales,

        paid,

        expenses,

        netCash:
          roundMoney(
            paid - expenses,
          ),

        orders:
          Number(
            order?.orders || 0,
          ),
      });

      cursor.setUTCMonth(
        cursor.getUTCMonth() + 1,
      );
    }

    return result;
  };

export const getFinanceDashboard =
  async ({
    from,
    to,
  } = {}) => {
    const {
      match: orderDateMatch,
    } =
      buildDateRange(
        from,
        to,
        "createdAt",
      );

    const {
      match: expenseDateMatch,
    } =
      buildDateRange(
        from,
        to,
        "expenseDate",
      );

    const now =
      new Date();

    const todayStart =
      startOfUtcDay(now);

    const tomorrow =
      new Date(todayStart);

    tomorrow.setUTCDate(
      tomorrow.getUTCDate() + 1,
    );

    const thisMonthStart =
      startOfUtcMonth(now);

    const nextMonthStart =
      nextUtcMonth(
        thisMonthStart,
      );

    const lastMonthStart =
      previousUtcMonth(
        thisMonthStart,
      );

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
    ] =
      await Promise.all([
        Order.aggregate([
          {
            $match:
              orderDateMatch,
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
                      $ne: [
                        "$orderStatus",
                        "cancelled",
                      ],
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
                      $ne: [
                        "$orderStatus",
                        "cancelled",
                      ],
                    },

                    {
                      $ifNull: [
                        "$total",
                        0,
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
                          $ne: [
                            "$orderStatus",
                            "cancelled",
                          ],
                        },
                        {
                          $eq: [
                            "$paymentStatus",
                            "paid",
                          ],
                        },
                      ],
                    },

                    {
                      $ifNull: [
                        "$total",
                        0,
                      ],
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
                          $ne: [
                            "$orderStatus",
                            "cancelled",
                          ],
                        },
                        {
                          $eq: [
                            "$paymentStatus",
                            "pending",
                          ],
                        },
                      ],
                    },

                    {
                      $ifNull: [
                        "$total",
                        0,
                      ],
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
                          $ne: [
                            "$orderStatus",
                            "cancelled",
                          ],
                        },
                        {
                          $eq: [
                            "$paymentStatus",
                            "failed",
                          ],
                        },
                      ],
                    },

                    {
                      $ifNull: [
                        "$total",
                        0,
                      ],
                    },

                    0,
                  ],
                },
              },

              cancelledValue: {
                $sum: {
                  $cond: [
                    {
                      $eq: [
                        "$orderStatus",
                        "cancelled",
                      ],
                    },

                    {
                      $ifNull: [
                        "$total",
                        0,
                      ],
                    },

                    0,
                  ],
                },
              },

              shippingRevenue: {
                $sum: {
                  $cond: [
                    {
                      $ne: [
                        "$orderStatus",
                        "cancelled",
                      ],
                    },

                    {
                      $ifNull: [
                        "$shippingCost",
                        0,
                      ],
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
                          $ne: [
                            "$orderStatus",
                            "cancelled",
                          ],
                        },
                        {
                          $eq: [
                            "$paymentStatus",
                            "paid",
                          ],
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
                          $ne: [
                            "$orderStatus",
                            "cancelled",
                          ],
                        },
                        {
                          $eq: [
                            "$paymentStatus",
                            "pending",
                          ],
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
                          $ne: [
                            "$orderStatus",
                            "cancelled",
                          ],
                        },
                        {
                          $eq: [
                            "$paymentStatus",
                            "failed",
                          ],
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
                      $eq: [
                        "$orderStatus",
                        "cancelled",
                      ],
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
            $match:
              expenseDateMatch,
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
              _id:
                "$paymentMethod",

              amount: {
                $sum: {
                  $ifNull: [
                    "$total",
                    0,
                  ],
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
            $match:
              orderDateMatch,
          },

          {
            $group: {
              _id:
                "$orderStatus",

              amount: {
                $sum: {
                  $ifNull: [
                    "$total",
                    0,
                  ],
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
            $match:
              expenseDateMatch,
          },

          {
            $group: {
              _id:
                "$category",

              amount: {
                $sum:
                  "$amount",
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

        Order.find(
          orderDateMatch,
        )
          .populate(
            "user",
            "email",
          )
          .select(
            "orderNumber user total subtotal shippingCost paymentMethod paymentStatus orderStatus createdAt",
          )
          .sort({
            createdAt: -1,
          })
          .limit(10)
          .lean(),

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
          .limit(10)
          .lean(),

        getPeriodSales(
          todayStart,
          tomorrow,
        ),

        getPeriodExpenses(
          todayStart,
          tomorrow,
        ),

        getPeriodSales(
          thisMonthStart,
          nextMonthStart,
        ),

        getPeriodExpenses(
          thisMonthStart,
          nextMonthStart,
        ),

        getPeriodSales(
          lastMonthStart,
          thisMonthStart,
        ),

        getPeriodExpenses(
          lastMonthStart,
          thisMonthStart,
        ),
      ]);

    const orderSummary =
      orderSummaryRows[0] ||
      {};

    const expenseSummary =
      expenseSummaryRows[0] ||
      {};

    const totalSales =
      roundMoney(
        orderSummary.totalSales,
      );

    const paidRevenue =
      roundMoney(
        orderSummary.paidRevenue,
      );

    const expenses =
      roundMoney(
        expenseSummary.totalExpenses,
      );

    const activeOrders =
      Number(
        orderSummary.activeOrders ||
          0,
      );

    const averageOrderValue =
      activeOrders > 0
        ? roundMoney(
            totalSales /
              activeOrders,
          )
        : 0;

    const collectionRate =
      totalSales > 0
        ? roundMoney(
            (paidRevenue /
              totalSales) *
              100,
          )
        : 0;

    const monthlyGrowth =
      lastMonthSales.sales > 0
        ? roundMoney(
            ((thisMonthSales.sales -
              lastMonthSales.sales) /
              lastMonthSales.sales) *
              100,
          )
        : thisMonthSales.sales >
            0
          ? 100
          : 0;

    return {
      currency:
        process.env
          .FINANCE_CURRENCY ||
        "EGP",

      filters: {
        from: from || null,
        to: to || null,
      },

      overview: {
        totalSales,

        paidRevenue,

        outstandingRevenue:
          roundMoney(
            orderSummary.pendingRevenue,
          ),

        failedPayments:
          roundMoney(
            orderSummary.failedRevenue,
          ),

        cancelledValue:
          roundMoney(
            orderSummary.cancelledValue,
          ),

        shippingRevenue:
          roundMoney(
            orderSummary.shippingRevenue,
          ),

        expenses,

        netCash:
          roundMoney(
            paidRevenue -
              expenses,
          ),

        collectionRate,

        averageOrderValue,
      },

      orders: {
        total:
          Number(
            orderSummary.totalOrders ||
              0,
          ),

        active:
          activeOrders,

        paid:
          Number(
            orderSummary.paidOrders ||
              0,
          ),

        pending:
          Number(
            orderSummary.pendingOrders ||
              0,
          ),

        failed:
          Number(
            orderSummary.failedOrders ||
              0,
          ),

        cancelled:
          Number(
            orderSummary.cancelledOrders ||
              0,
          ),
      },

      periods: {
        today: {
          sales:
            todaySales.sales,

          paid:
            todaySales.paid,

          expenses:
            todayExpenses.amount,

          netCash:
            roundMoney(
              todaySales.paid -
                todayExpenses.amount,
            ),
        },

        thisMonth: {
          sales:
            thisMonthSales.sales,

          paid:
            thisMonthSales.paid,

          expenses:
            thisMonthExpenses.amount,

          netCash:
            roundMoney(
              thisMonthSales.paid -
                thisMonthExpenses.amount,
            ),
        },

        lastMonth: {
          sales:
            lastMonthSales.sales,

          paid:
            lastMonthSales.paid,

          expenses:
            lastMonthExpenses.amount,

          netCash:
            roundMoney(
              lastMonthSales.paid -
                lastMonthExpenses.amount,
            ),
        },

        monthlyGrowth,
      },

      paymentMethods:
        paymentMethodsRows.map(
          (item) => ({
            method:
              item._id ||
              "unknown",

            amount:
              roundMoney(
                item.amount,
              ),

            count:
              Number(
                item.count ||
                  0,
              ),
          }),
        ),

      orderStatuses:
        orderStatusRows.map(
          (item) => ({
            status:
              item._id ||
              "unknown",

            amount:
              roundMoney(
                item.amount,
              ),

            count:
              Number(
                item.count ||
                  0,
              ),
          }),
        ),

      expenseCategories:
        expenseCategoryRows.map(
          (item) => ({
            category:
              item._id ||
              "other",

            amount:
              roundMoney(
                item.amount,
              ),

            count:
              Number(
                item.count ||
                  0,
              ),
          }),
        ),

      monthly,

      recentOrders:
        recentOrders.map(
          (order) => ({
            _id:
              order._id,

            orderNumber:
              order.orderNumber,

            customer:
              order.user?.email ||
              "Unknown",

            subtotal:
              roundMoney(
                order.subtotal,
              ),

            shippingCost:
              roundMoney(
                order.shippingCost,
              ),

            total:
              roundMoney(
                order.total,
              ),

            paymentMethod:
              order.paymentMethod,

            paymentStatus:
              order.paymentStatus,

            orderStatus:
              order.orderStatus,

            createdAt:
              order.createdAt,
          }),
        ),

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
              expense.createdBy
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
      !String(title).trim()
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
    const {
      match,
    } =
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