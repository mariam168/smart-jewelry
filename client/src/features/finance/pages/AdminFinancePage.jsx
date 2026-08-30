import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  getFinanceDashboard,
  createFinanceExpense,
  deleteFinanceExpense,
} from "../services/financeApi";

const expenseCategories = [
  "marketing",
  "shipping",
  "packaging",
  "manufacturing",
  "rent",
  "salary",
  "software",
  "refund",
  "maintenance",
  "other",
];

const AdminFinancePage = () => {
  const [
    data,
    setData,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    savingExpense,
    setSavingExpense,
  ] = useState(false);

  const [
    filters,
    setFilters,
  ] = useState({
    from: "",
    to: "",
  });

  const [
    appliedFilters,
    setAppliedFilters,
  ] = useState({
    from: "",
    to: "",
  });

  const [
    expenseForm,
    setExpenseForm,
  ] = useState({
    title: "",
    category: "other",
    amount: "",
    expenseDate:
      new Date()
        .toISOString()
        .slice(
          0,
          10,
        ),
    note: "",
  });

  const currency =
    data?.currency ||
    "EGP";

  const loadFinance =
    async () => {
      try {
        setLoading(true);

        setError("");

        const response =
          await getFinanceDashboard(
            appliedFilters,
          );

        setData(
          response?.data ||
            null,
        );
      } catch (error) {
        console.error(
          "FINANCE ERROR:",
          error,
        );

        setError(
          error?.response?.data
            ?.message ||
            "Failed to load finance dashboard.",
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadFinance();
  }, [
    appliedFilters.from,
    appliedFilters.to,
  ]);

  const formatMoney = (
    value,
  ) => {
    return Number(
      value || 0,
    ).toLocaleString(
      "en-EG",
      {
        maximumFractionDigits: 2,
      },
    );
  };

  const formatPercent = (
    value,
  ) => {
    const number =
      Number(value || 0);

    return `${
      number >= 0
        ? ""
        : "-"
    }${Math.abs(
      number,
    ).toLocaleString(
      "en-EG",
      {
        maximumFractionDigits: 2,
      },
    )}%`;
  };

  const formatLabel = (
    value,
  ) => {
    if (!value) {
      return "Unknown";
    }

    return String(value)
      .replaceAll(
        "_",
        " ",
      )
      .replace(
        /\b\w/g,
        (letter) =>
          letter.toUpperCase(),
      );
  };

  const formatDate = (
    value,
  ) => {
    if (!value) {
      return "—";
    }

    return new Date(
      value,
    ).toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      },
    );
  };

  const monthly =
    Array.isArray(
      data?.monthly,
    )
      ? data.monthly
      : [];

  const maxChartValue =
    useMemo(() => {
      if (
        !monthly.length
      ) {
        return 1;
      }

      return Math.max(
        ...monthly.map(
          (item) =>
            Math.max(
              Number(
                item.sales ||
                  0,
              ),

              Number(
                item.expenses ||
                  0,
              ),
            ),
        ),

        1,
      );
    }, [
      monthly,
    ]);

  const handleApplyFilters =
    () => {
      if (
        filters.from &&
        filters.to &&
        filters.from >
          filters.to
      ) {
        setError(
          "From date cannot be after To date.",
        );

        return;
      }

      setError("");

      setAppliedFilters({
        ...filters,
      });
    };

  const handleResetFilters =
    () => {
      const empty = {
        from: "",
        to: "",
      };

      setFilters(
        empty,
      );

      setAppliedFilters(
        empty,
      );
    };

  const handleExpenseChange =
    (event) => {
      const {
        name,
        value,
      } =
        event.target;

      setExpenseForm(
        (previous) => ({
          ...previous,

          [name]:
            value,
        }),
      );
    };

  const handleAddExpense =
    async (event) => {
      event.preventDefault();

      if (
        !expenseForm.title.trim()
      ) {
        setError(
          "Expense title is required.",
        );

        return;
      }

      if (
        !expenseForm.amount ||
        Number(
          expenseForm.amount,
        ) <= 0
      ) {
        setError(
          "Enter a valid expense amount.",
        );

        return;
      }

      try {
        setSavingExpense(
          true,
        );

        setError("");

        await createFinanceExpense({
          title:
            expenseForm.title,

          category:
            expenseForm.category,

          amount:
            Number(
              expenseForm.amount,
            ),

          expenseDate:
            expenseForm.expenseDate,

          note:
            expenseForm.note,
        });

        setExpenseForm({
          title: "",

          category:
            "other",

          amount: "",

          expenseDate:
            new Date()
              .toISOString()
              .slice(
                0,
                10,
              ),

          note: "",
        });

        await loadFinance();
      } catch (error) {
        setError(
          error?.response?.data
            ?.message ||
            "Failed to save expense.",
        );
      } finally {
        setSavingExpense(
          false,
        );
      }
    };

  const handleDeleteExpense =
    async (
      expenseId,
    ) => {
      const confirmed =
        window.confirm(
          "Delete this expense?",
        );

      if (!confirmed) {
        return;
      }

      try {
        setError("");

        await deleteFinanceExpense(
          expenseId,
        );

        await loadFinance();
      } catch (error) {
        setError(
          error?.response?.data
            ?.message ||
            "Failed to delete expense.",
        );
      }
    };

  if (
    loading &&
    !data
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-warm-ivory">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-light-champagne border-t-classic-gold" />

          <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-gray">
            Loading Finance
          </p>
        </div>
      </div>
    );
  }

  const overview =
    data?.overview ||
    {};

  const costBreakdown =
    data?.costBreakdown ||
    {};

  const costing =
    data?.costing ||
    {};

  const productProfitability =
    Array.isArray(
      data?.productProfitability,
    )
      ? data.productProfitability
      : [];

  const orderProfitability =
    Array.isArray(
      data?.orderProfitability,
    )
      ? data.orderProfitability
      : [];

  const hasIncompleteCosting =
    Number(
      costing.inProgress ||
        0,
    ) > 0 ||
    Number(
      costing.notStarted ||
        0,
    ) > 0;

  return (
    <main className="min-h-screen bg-warm-ivory text-rich-navy">
      <header className="border-b border-light-champagne bg-soft-white">
        <div className="mx-auto max-w-[1500px] px-5 py-8 lg:px-8">
          <div className="flex flex-col gap-7 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="h-px w-9 bg-classic-gold" />

                <p className="text-[9px] font-semibold uppercase tracking-[0.32em] text-antique-gold">
                  Administration
                </p>
              </div>

              <h1 className="mt-3 font-serif text-5xl font-normal tracking-[-0.045em]">
                Finance
              </h1>

              <p className="mt-3 text-[13px] text-slate-gray">
                Revenue, product costs, manufacturing costs, profit and cash performance.
              </p>
            </div>

            <div className="flex flex-wrap items-end gap-3">
              <div>
                <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.18em] text-steel-gray">
                  From
                </label>

                <input
                  type="date"
                  value={
                    filters.from
                  }
                  onChange={(
                    event,
                  ) =>
                    setFilters(
                      (
                        previous,
                      ) => ({
                        ...previous,

                        from:
                          event
                            .target
                            .value,
                      }),
                    )
                  }
                  className="h-11 rounded-xl border border-light-champagne bg-white px-4 text-[11px] outline-none focus:border-classic-gold"
                />
              </div>

              <div>
                <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.18em] text-steel-gray">
                  To
                </label>

                <input
                  type="date"
                  value={
                    filters.to
                  }
                  onChange={(
                    event,
                  ) =>
                    setFilters(
                      (
                        previous,
                      ) => ({
                        ...previous,

                        to:
                          event
                            .target
                            .value,
                      }),
                    )
                  }
                  className="h-11 rounded-xl border border-light-champagne bg-white px-4 text-[11px] outline-none focus:border-classic-gold"
                />
              </div>

              <button
                type="button"
                onClick={
                  handleApplyFilters
                }
                className="h-11 rounded-xl bg-deep-navy px-5 text-[10px] font-semibold text-white transition hover:bg-midnight-navy"
              >
                Apply
              </button>

              <button
                type="button"
                onClick={
                  handleResetFilters
                }
                className="h-11 rounded-xl border border-light-champagne bg-white px-5 text-[10px] font-semibold text-slate-gray"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] px-5 py-8 lg:px-8">
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-[12px] text-red-700">
            {error}
          </div>
        )}

        {hasIncompleteCosting && (
          <div className="mb-6 rounded-[20px] border border-champagne-gold/30 bg-soft-cream px-5 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-antique-gold">
              Profit calculation is still provisional
            </p>

            <p className="mt-2 text-[10px] leading-6 text-slate-gray">
              {Number(
                costing.inProgress ||
                  0,
              )}{" "}
              order(s) are still in manufacturing and{" "}
              {Number(
                costing.notStarted ||
                  0,
              )}{" "}
              order(s) do not have manufacturing costs yet. Final profit becomes exact after production and packaging costs are completed.
            </p>
          </div>
        )}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <FinanceCard
            dark
            label="Total Sales"
            value={formatMoney(
              overview.totalSales,
            )}
            currency={
              currency
            }
            helper={`${data?.orders?.active || 0} active orders`}
          />

          <FinanceCard
            label="Paid Revenue"
            value={formatMoney(
              overview.paidRevenue,
            )}
            currency={
              currency
            }
            helper={`${formatMoney(
              overview.collectionRate,
            )}% collection rate`}
          />

          <FinanceCard
            label="Direct Production Cost"
            value={formatMoney(
              overview.directProductionCost,
            )}
            currency={
              currency
            }
            helper="Product + smart unit + assembly + packaging"
          />

          <FinanceCard
            label="Gross Product Profit"
            value={formatMoney(
              overview.grossProductProfit,
            )}
            currency={
              currency
            }
            helper={`${formatPercent(
              overview.grossMargin,
            )} gross margin`}
            profit={
              Number(
                overview.grossProductProfit ||
                  0,
              )
            }
          />
        </section>

        <section className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <FinanceCard
            label="Outstanding"
            value={formatMoney(
              overview.outstandingRevenue,
            )}
            currency={
              currency
            }
            helper={`${data?.orders?.pending || 0} pending payments`}
          />

          <FinanceCard
            label="Expenses"
            value={formatMoney(
              overview.expenses,
            )}
            currency={
              currency
            }
            helper="Manually recorded business expenses"
          />

          <FinanceCard
            label="Net Cash"
            value={formatMoney(
              overview.netCash,
            )}
            currency={
              currency
            }
            helper="Paid revenue minus manual expenses"
          />

          <FinanceCard
            label="Net Profit"
            value={formatMoney(
              overview.netProfit,
            )}
            currency={
              currency
            }
            helper="Paid revenue minus paid-order direct costs and expenses"
            profit={
              Number(
                overview.netProfit ||
                  0,
              )
            }
          />
        </section>

        <section className="mt-7">
          <SectionHeaderStandalone
            eyebrow="Cost Structure"
            title="Direct Production Cost Breakdown"
          />

          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <MiniCard
              label="Product Cost"
              value={`${formatMoney(
                costBreakdown.productCost,
              )} ${currency}`}
            />

            <MiniCard
              label="Smart Unit Cost"
              value={`${formatMoney(
                costBreakdown.smartUnitCost,
              )} ${currency}`}
            />

            <MiniCard
              label="Assembly Cost"
              value={`${formatMoney(
                costBreakdown.assemblyCost,
              )} ${currency}`}
            />

            <MiniCard
              label="Packaging Cost"
              value={`${formatMoney(
                costBreakdown.packagingCost,
              )} ${currency}`}
            />

            <MiniCard
              label="Total Direct Cost"
              value={`${formatMoney(
                costBreakdown.total,
              )} ${currency}`}
              accent
            />
          </div>
        </section>

        <section className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MiniCard
            label="Today Sales"
            value={`${formatMoney(
              data?.periods?.today?.sales,
            )} ${currency}`}
          />

          <MiniCard
            label="This Month"
            value={`${formatMoney(
              data?.periods?.thisMonth?.sales,
            )} ${currency}`}
          />

          <MiniCard
            label="Last Month"
            value={`${formatMoney(
              data?.periods?.lastMonth?.sales,
            )} ${currency}`}
          />

          <MiniCard
            label="Monthly Growth"
            value={`${
              Number(
                data?.periods?.monthlyGrowth ||
                  0,
              ) >= 0
                ? "+"
                : ""
            }${formatMoney(
              data?.periods?.monthlyGrowth,
            )}%`}
          />
        </section>

        <section className="mt-7 grid gap-6 xl:grid-cols-[1.5fr_0.7fr]">
          <div className="rounded-[26px] border border-light-champagne bg-soft-white shadow-sm">
            <SectionHeader
              eyebrow="Performance"
              title="12 Month Overview"
            />

            <div className="overflow-x-auto p-6">
              <div className="flex h-[320px] min-w-[760px] items-end gap-4 border-b border-light-champagne">
                {monthly.map(
                  (item) => {
                    const salesHeight =
                      Math.max(
                        (Number(
                          item.sales ||
                            0,
                        ) /
                          maxChartValue) *
                          100,

                        item.sales
                          ? 3
                          : 0,
                      );

                    const expenseHeight =
                      Math.max(
                        (Number(
                          item.expenses ||
                            0,
                        ) /
                          maxChartValue) *
                          100,

                        item.expenses
                          ? 3
                          : 0,
                      );

                    return (
                      <div
                        key={
                          item.month
                        }
                        className="flex min-w-[48px] flex-1 flex-col items-center justify-end"
                      >
                        <div className="flex h-[230px] items-end gap-1.5">
                          <div
                            className="w-5 rounded-t-md bg-deep-navy"
                            style={{
                              height: `${salesHeight}%`,
                            }}
                          />

                          <div
                            className="w-5 rounded-t-md bg-classic-gold"
                            style={{
                              height: `${expenseHeight}%`,
                            }}
                          />
                        </div>

                        <p className="mt-3 whitespace-nowrap text-[9px] text-steel-gray">
                          {
                            item.label
                          }
                        </p>
                      </div>
                    );
                  },
                )}
              </div>

              <div className="mt-5 flex gap-6">
                <Legend
                  className="bg-deep-navy"
                  label="Sales"
                />

                <Legend
                  className="bg-classic-gold"
                  label="Manual Expenses"
                />
              </div>
            </div>
          </div>

          <div className="rounded-[26px] border border-light-champagne bg-soft-white">
            <SectionHeader
              eyebrow="Payments"
              title="Payment Methods"
            />

            <div className="divide-y divide-light-champagne px-6">
              {data
                ?.paymentMethods
                ?.length ? (
                data.paymentMethods.map(
                  (item) => (
                    <div
                      key={
                        item.method
                      }
                      className="flex items-center justify-between gap-4 py-5"
                    >
                      <div>
                        <p className="text-[12px] font-semibold">
                          {formatLabel(
                            item.method,
                          )}
                        </p>

                        <p className="mt-1 text-[9px] text-steel-gray">
                          {
                            item.count
                          }{" "}
                          orders
                        </p>
                      </div>

                      <p className="text-[12px] font-semibold">
                        {formatMoney(
                          item.amount,
                        )}{" "}
                        {
                          currency
                        }
                      </p>
                    </div>
                  ),
                )
              ) : (
                <EmptyState text="No payment data yet." />
              )}
            </div>
          </div>
        </section>

        <section className="mt-7 overflow-hidden rounded-[26px] border border-light-champagne bg-soft-white">
          <SectionHeader
            eyebrow="Product Economics"
            title="Product Profitability"
          />

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1450px]">
              <thead>
                <tr className="border-b border-light-champagne bg-warm-ivory/55 text-left">
                  <TableHead text="Product" />
                  <TableHead text="Qty" />
                  <TableHead
                    text="Avg Sold Price"
                    right
                  />
                  <TableHead
                    text="Revenue"
                    right
                  />
                  <TableHead
                    text="Product Cost"
                    right
                  />
                  <TableHead
                    text="Smart Unit"
                    right
                  />
                  <TableHead
                    text="Assembly"
                    right
                  />
                  <TableHead
                    text="Packaging"
                    right
                  />
                  <TableHead
                    text="Total Cost"
                    right
                  />
                  <TableHead
                    text="Gross Profit"
                    right
                  />
                  <TableHead
                    text="Margin"
                    right
                  />
                  <TableHead text="Costing" />
                </tr>
              </thead>

              <tbody className="divide-y divide-light-champagne">
                {productProfitability.length ? (
                  productProfitability.map(
                    (
                      product,
                      index,
                    ) => (
                      <tr
                        key={
                          product.productId ||
                          `${product.productName}-${index}`
                        }
                        className="transition hover:bg-warm-ivory/40"
                      >
                        <td className="px-5 py-4">
                          <p className="max-w-[230px] truncate text-[11px] font-semibold text-rich-navy">
                            {
                              product.productName
                            }
                          </p>

                          {product.sku && (
                            <p className="mt-1 text-[8px] uppercase tracking-[0.08em] text-steel-gray">
                              SKU ·{" "}
                              {
                                product.sku
                              }
                            </p>
                          )}
                        </td>

                        <td className="px-5 py-4 text-[11px]">
                          {
                            product.quantity
                          }
                        </td>

                        <MoneyCell
                          value={
                            product.averageSellingPrice
                          }
                          currency={
                            currency
                          }
                        />

                        <MoneyCell
                          value={
                            product.revenue
                          }
                          currency={
                            currency
                          }
                        />

                        <MoneyCell
                          value={
                            product.productCost
                          }
                          currency={
                            currency
                          }
                        />

                        <MoneyCell
                          value={
                            product.smartUnitCost
                          }
                          currency={
                            currency
                          }
                        />

                        <MoneyCell
                          value={
                            product.assemblyCost
                          }
                          currency={
                            currency
                          }
                        />

                        <MoneyCell
                          value={
                            product.packagingCost
                          }
                          currency={
                            currency
                          }
                        />

                        <MoneyCell
                          value={
                            product.totalCost
                          }
                          currency={
                            currency
                          }
                          strong
                        />

                        <ProfitCell
                          value={
                            product.grossProfit
                          }
                          currency={
                            currency
                          }
                          formatMoney={
                            formatMoney
                          }
                        />

                        <td className="px-5 py-4 text-right text-[11px] font-semibold">
                          {formatPercent(
                            product.margin,
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <CostingBadge
                            status={
                              product.costingStatus
                            }
                          />
                        </td>
                      </tr>
                    ),
                  )
                ) : (
                  <tr>
                    <td
                      colSpan={12}
                    >
                      <EmptyState text="No product profitability data yet." />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-7 overflow-hidden rounded-[26px] border border-light-champagne bg-soft-white">
          <SectionHeader
            eyebrow="Order Economics"
            title="Order Profitability"
          />

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1600px]">
              <thead>
                <tr className="border-b border-light-champagne bg-warm-ivory/55 text-left">
                  <TableHead text="Order" />
                  <TableHead text="Customer" />
                  <TableHead text="Payment" />
                  <TableHead
                    text="Product Revenue"
                    right
                  />
                  <TableHead
                    text="Shipping"
                    right
                  />
                  <TableHead
                    text="Order Total"
                    right
                  />
                  <TableHead
                    text="Product Cost"
                    right
                  />
                  <TableHead
                    text="Smart Unit"
                    right
                  />
                  <TableHead
                    text="Assembly"
                    right
                  />
                  <TableHead
                    text="Packaging"
                    right
                  />
                  <TableHead
                    text="Direct Cost"
                    right
                  />
                  <TableHead
                    text="Gross Profit"
                    right
                  />
                  <TableHead
                    text="Margin"
                    right
                  />
                  <TableHead text="Costing" />
                  <TableHead
                    text=""
                    right
                  />
                </tr>
              </thead>

              <tbody className="divide-y divide-light-champagne">
                {orderProfitability.length ? (
                  orderProfitability.map(
                    (order) => (
                      <tr
                        key={
                          order._id
                        }
                        className="transition hover:bg-warm-ivory/40"
                      >
                        <td className="px-5 py-4">
                          <p className="font-mono text-[10px] font-semibold text-rich-navy">
                            {
                              order.orderNumber
                            }
                          </p>

                          <p className="mt-1 text-[8px] text-steel-gray">
                            {formatDate(
                              order.createdAt,
                            )}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <p className="max-w-[180px] truncate text-[10px] font-semibold">
                            {
                              order.customer
                            }
                          </p>

                          {order.customerEmail && (
                            <p className="mt-1 max-w-[180px] truncate text-[8px] text-steel-gray">
                              {
                                order.customerEmail
                              }
                            </p>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <PaymentBadge
                            status={
                              order.paymentStatus
                            }
                          />
                        </td>

                        <MoneyCell
                          value={
                            order.productRevenue
                          }
                          currency={
                            currency
                          }
                        />

                        <MoneyCell
                          value={
                            order.shippingCost
                          }
                          currency={
                            currency
                          }
                        />

                        <MoneyCell
                          value={
                            order.orderTotal
                          }
                          currency={
                            currency
                          }
                          strong
                        />

                        <MoneyCell
                          value={
                            order.productCost
                          }
                          currency={
                            currency
                          }
                        />

                        <MoneyCell
                          value={
                            order.smartUnitCost
                          }
                          currency={
                            currency
                          }
                        />

                        <MoneyCell
                          value={
                            order.assemblyCost
                          }
                          currency={
                            currency
                          }
                        />

                        <MoneyCell
                          value={
                            order.packagingCost
                          }
                          currency={
                            currency
                          }
                        />

                        <MoneyCell
                          value={
                            order.directProductionCost
                          }
                          currency={
                            currency
                          }
                          strong
                        />

                        <ProfitCell
                          value={
                            order.grossProductProfit
                          }
                          currency={
                            currency
                          }
                          formatMoney={
                            formatMoney
                          }
                        />

                        <td className="px-5 py-4 text-right text-[11px] font-semibold">
                          {formatPercent(
                            order.grossMargin,
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <CostingBadge
                            status={
                              order.costingStatus
                            }
                          />
                        </td>

                        <td className="px-5 py-4 text-right">
                          <Link
                            to={`/admin/orders/${order._id}`}
                            className="inline-flex rounded-full border border-light-champagne bg-white px-4 py-2 text-[8px] font-semibold uppercase tracking-[0.08em] text-rich-navy transition hover:border-classic-gold"
                          >
                            Open
                          </Link>
                        </td>
                      </tr>
                    ),
                  )
                ) : (
                  <tr>
                    <td
                      colSpan={15}
                    >
                      <EmptyState text="No order profitability data yet." />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-7 grid gap-6 xl:grid-cols-2">
          <div className="rounded-[26px] border border-light-champagne bg-soft-white">
            <SectionHeader
              eyebrow="Orders"
              title="Order Value by Status"
            />

            <div className="divide-y divide-light-champagne px-6">
              {data
                ?.orderStatuses
                ?.length ? (
                data.orderStatuses.map(
                  (item) => (
                    <div
                      key={
                        item.status
                      }
                      className="flex items-center justify-between gap-4 py-4"
                    >
                      <div>
                        <p className="text-[11px] font-semibold">
                          {formatLabel(
                            item.status,
                          )}
                        </p>

                        <p className="mt-1 text-[9px] text-steel-gray">
                          {
                            item.count
                          }{" "}
                          orders
                        </p>
                      </div>

                      <p className="text-[12px] font-semibold">
                        {formatMoney(
                          item.amount,
                        )}{" "}
                        {
                          currency
                        }
                      </p>
                    </div>
                  ),
                )
              ) : (
                <EmptyState text="No orders yet." />
              )}
            </div>
          </div>

          <div className="rounded-[26px] border border-light-champagne bg-soft-white">
            <SectionHeader
              eyebrow="Expenses"
              title="Expense Categories"
            />

            <div className="divide-y divide-light-champagne px-6">
              {data
                ?.expenseCategories
                ?.length ? (
                data.expenseCategories.map(
                  (item) => (
                    <div
                      key={
                        item.category
                      }
                      className="flex items-center justify-between gap-4 py-4"
                    >
                      <div>
                        <p className="text-[11px] font-semibold">
                          {formatLabel(
                            item.category,
                          )}
                        </p>

                        <p className="mt-1 text-[9px] text-steel-gray">
                          {
                            item.count
                          }{" "}
                          entries
                        </p>
                      </div>

                      <p className="text-[12px] font-semibold">
                        {formatMoney(
                          item.amount,
                        )}{" "}
                        {
                          currency
                        }
                      </p>
                    </div>
                  ),
                )
              ) : (
                <EmptyState text="No expenses recorded." />
              )}
            </div>
          </div>
        </section>

        <section className="mt-7 rounded-[26px] border border-light-champagne bg-soft-white">
          <SectionHeader
            eyebrow="Expense Management"
            title="Add Expense"
          />

          <form
            onSubmit={
              handleAddExpense
            }
            className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-5"
          >
            <Field label="Title">
              <input
                name="title"
                value={
                  expenseForm.title
                }
                onChange={
                  handleExpenseChange
                }
                placeholder="Marketing campaign"
                className="finance-input"
              />
            </Field>

            <Field label="Category">
              <select
                name="category"
                value={
                  expenseForm.category
                }
                onChange={
                  handleExpenseChange
                }
                className="finance-input"
              >
                {expenseCategories.map(
                  (
                    category,
                  ) => (
                    <option
                      key={
                        category
                      }
                      value={
                        category
                      }
                    >
                      {formatLabel(
                        category,
                      )}
                    </option>
                  ),
                )}
              </select>
            </Field>

            <Field label="Amount">
              <input
                type="number"
                min="0"
                step="0.01"
                name="amount"
                value={
                  expenseForm.amount
                }
                onChange={
                  handleExpenseChange
                }
                placeholder="0.00"
                className="finance-input"
              />
            </Field>

            <Field label="Date">
              <input
                type="date"
                name="expenseDate"
                value={
                  expenseForm.expenseDate
                }
                onChange={
                  handleExpenseChange
                }
                className="finance-input"
              />
            </Field>

            <div className="flex items-end">
              <button
                disabled={
                  savingExpense
                }
                className="h-11 w-full rounded-xl bg-deep-navy px-5 text-[10px] font-semibold text-white disabled:opacity-50"
              >
                {savingExpense
                  ? "Saving..."
                  : "Add Expense"}
              </button>
            </div>

            <div className="md:col-span-2 xl:col-span-5">
              <Field label="Note">
                <textarea
                  name="note"
                  value={
                    expenseForm.note
                  }
                  onChange={
                    handleExpenseChange
                  }
                  rows={3}
                  placeholder="Optional note"
                  className="finance-input resize-none py-3"
                />
              </Field>
            </div>
          </form>
        </section>

        <section className="mt-7 grid gap-6 xl:grid-cols-2">
          <div className="overflow-hidden rounded-[26px] border border-light-champagne bg-soft-white">
            <SectionHeader
              eyebrow="Transactions"
              title="Recent Orders"
            />

            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px]">
                <thead>
                  <tr className="border-b border-light-champagne bg-warm-ivory/50 text-left">
                    <TableHead text="Order" />
                    <TableHead text="Customer" />
                    <TableHead text="Payment" />
                    <TableHead text="Status" />
                    <TableHead
                      text="Total"
                      right
                    />
                  </tr>
                </thead>

                <tbody className="divide-y divide-light-champagne">
                  {data
                    ?.recentOrders
                    ?.map(
                      (order) => (
                        <tr
                          key={
                            order._id
                          }
                        >
                          <td className="px-5 py-4">
                            <Link
                              to={`/admin/orders/${order._id}`}
                              className="font-mono text-[10px] font-semibold text-rich-navy hover:text-antique-gold"
                            >
                              {
                                order.orderNumber
                              }
                            </Link>

                            <p className="mt-1 text-[9px] text-steel-gray">
                              {formatDate(
                                order.createdAt,
                              )}
                            </p>
                          </td>

                          <td className="max-w-[180px] truncate px-5 py-4 text-[10px] text-slate-gray">
                            {
                              order.customer
                            }
                          </td>

                          <td className="px-5 py-4">
                            <PaymentBadge
                              status={
                                order.paymentStatus
                              }
                            />
                          </td>

                          <td className="px-5 py-4 text-[10px]">
                            {formatLabel(
                              order.orderStatus,
                            )}
                          </td>

                          <td className="px-5 py-4 text-right text-[11px] font-semibold">
                            {formatMoney(
                              order.total,
                            )}{" "}
                            {
                              currency
                            }
                          </td>
                        </tr>
                      ),
                    )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="overflow-hidden rounded-[26px] border border-light-champagne bg-soft-white">
            <SectionHeader
              eyebrow="Expenses"
              title="Recent Expenses"
            />

            <div className="divide-y divide-light-champagne">
              {data
                ?.recentExpenses
                ?.length ? (
                data.recentExpenses.map(
                  (expense) => (
                    <div
                      key={
                        expense._id
                      }
                      className="flex items-center justify-between gap-5 px-6 py-5"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-[11px] font-semibold">
                          {
                            expense.title
                          }
                        </p>

                        <div className="mt-1 flex flex-wrap gap-2 text-[9px] text-steel-gray">
                          <span>
                            {formatLabel(
                              expense.category,
                            )}
                          </span>

                          <span>
                            ·
                          </span>

                          <span>
                            {formatDate(
                              expense.expenseDate,
                            )}
                          </span>
                        </div>

                        {expense.note && (
                          <p className="mt-2 max-w-md truncate text-[9px] text-slate-gray">
                            {
                              expense.note
                            }
                          </p>
                        )}
                      </div>

                      <div className="flex shrink-0 items-center gap-4">
                        <p className="text-[12px] font-semibold text-[#A65353]">
                          -
                          {formatMoney(
                            expense.amount,
                          )}{" "}
                          {
                            currency
                          }
                        </p>

                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteExpense(
                              expense._id,
                            )
                          }
                          className="rounded-lg border border-red-200 px-3 py-2 text-[9px] font-semibold text-red-600 transition hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ),
                )
              ) : (
                <EmptyState text="No expenses recorded." />
              )}
            </div>
          </div>
        </section>

        <div className="mt-7 rounded-[22px] border border-light-champagne bg-soft-white px-6 py-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-antique-gold">
            How profit is calculated
          </p>

          <div className="mt-4 grid gap-4 text-[10px] leading-6 text-slate-gray lg:grid-cols-2">
            <div className="rounded-[16px] bg-warm-ivory/60 p-4">
              <strong className="text-rich-navy">
                Direct Production Cost
              </strong>

              <p className="mt-1">
                Product original cost + Smart Unit cost + Smart Unit installation cost + Packaging cost.
              </p>
            </div>

            <div className="rounded-[16px] bg-warm-ivory/60 p-4">
              <strong className="text-rich-navy">
                Gross Product Profit
              </strong>

              <p className="mt-1">
                Product revenue minus direct production cost. Customer shipping charge is shown separately.
              </p>
            </div>

            <div className="rounded-[16px] bg-warm-ivory/60 p-4">
              <strong className="text-rich-navy">
                Net Cash
              </strong>

              <p className="mt-1">
                Paid order revenue minus manually recorded expenses.
              </p>
            </div>

            <div className="rounded-[16px] bg-warm-ivory/60 p-4">
              <strong className="text-rich-navy">
                Net Profit
              </strong>

              <p className="mt-1">
                Paid revenue minus direct production cost of paid orders minus manually recorded business expenses.
              </p>
            </div>
          </div>

          <p className="mt-4 text-[9px] leading-5 text-steel-gray">
            Do not enter the same Product, Smart Unit, Assembly or Packaging cost again as a manual expense, otherwise that cost will be deducted twice.
          </p>
        </div>
      </div>

      <style>
        {`
          .finance-input {
            height: 44px;
            width: 100%;
            border-radius: 12px;
            border: 1px solid #EDE5D9;
            background: #FFFFFF;
            padding-left: 14px;
            padding-right: 14px;
            font-size: 11px;
            color: #12263A;
            outline: none;
            transition: 0.2s;
          }

          textarea.finance-input {
            height: auto;
          }

          .finance-input:focus {
            border-color: #C9A24D;
            box-shadow: 0 0 0 4px rgba(201, 162, 77, 0.08);
          }
        `}
      </style>
    </main>
  );
};

const FinanceCard = ({
  label,
  value,
  currency,
  helper,
  dark = false,
  profit = null,
}) => {
  const isNegative =
    profit !== null &&
    Number(profit) < 0;

  return (
    <div
      className={`relative overflow-hidden rounded-[24px] border p-6 ${
        dark
          ? "border-deep-navy bg-deep-navy text-white"
          : "border-light-champagne bg-soft-white text-rich-navy"
      }`}
    >
      {dark && (
        <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full border border-classic-gold/10" />
      )}

      <p
        className={`text-[9px] font-semibold uppercase tracking-[0.22em] ${
          dark
            ? "text-champagne-gold"
            : "text-antique-gold"
        }`}
      >
        {label}
      </p>

      <div className="mt-5 flex items-end gap-2">
        <span
          className={`font-serif text-[2.1rem] leading-none ${
            isNegative
              ? "text-red-600"
              : ""
          }`}
        >
          {value}
        </span>

        <span
          className={`pb-0.5 text-[9px] ${
            dark
              ? "text-premium-silver"
              : "text-steel-gray"
          }`}
        >
          {currency}
        </span>
      </div>

      <p
        className={`mt-4 text-[9px] ${
          dark
            ? "text-premium-silver/65"
            : "text-steel-gray"
        }`}
      >
        {helper}
      </p>
    </div>
  );
};

const MiniCard = ({
  label,
  value,
  accent = false,
}) => {
  return (
    <div
      className={`rounded-[20px] border p-5 ${
        accent
          ? "border-champagne-gold/30 bg-soft-cream"
          : "border-light-champagne bg-soft-white"
      }`}
    >
      <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-steel-gray">
        {label}
      </p>

      <p
        className={`mt-3 font-serif text-[1.45rem] ${
          accent
            ? "text-antique-gold"
            : "text-rich-navy"
        }`}
      >
        {value}
      </p>
    </div>
  );
};

const SectionHeader = ({
  eyebrow,
  title,
}) => {
  return (
    <div className="border-b border-light-champagne px-6 py-5">
      <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-antique-gold">
        {eyebrow}
      </p>

      <h2 className="mt-1.5 font-serif text-[1.55rem] tracking-[-0.025em] text-rich-navy">
        {title}
      </h2>
    </div>
  );
};

const SectionHeaderStandalone = ({
  eyebrow,
  title,
}) => {
  return (
    <div>
      <div className="flex items-center gap-3">
        <span className="h-px w-8 bg-classic-gold" />

        <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-antique-gold">
          {eyebrow}
        </p>
      </div>

      <h2 className="mt-2 font-serif text-[1.65rem] tracking-[-0.025em] text-rich-navy">
        {title}
      </h2>
    </div>
  );
};

const Legend = ({
  className,
  label,
}) => {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`h-2.5 w-2.5 rounded-sm ${className}`}
      />

      <span className="text-[9px] text-steel-gray">
        {label}
      </span>
    </div>
  );
};

const Field = ({
  label,
  children,
}) => {
  return (
    <label className="block">
      <span className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.16em] text-steel-gray">
        {label}
      </span>

      {children}
    </label>
  );
};

const TableHead = ({
  text,
  right = false,
}) => {
  return (
    <th
      className={`whitespace-nowrap px-5 py-4 text-[8px] font-semibold uppercase tracking-[0.16em] text-steel-gray ${
        right
          ? "text-right"
          : ""
      }`}
    >
      {text}
    </th>
  );
};

const MoneyCell = ({
  value,
  currency,
  strong = false,
}) => {
  return (
    <td
      className={`whitespace-nowrap px-5 py-4 text-right text-[10px] ${
        strong
          ? "font-semibold text-rich-navy"
          : "text-slate-gray"
      }`}
    >
      {Number(
        value || 0,
      ).toLocaleString(
        "en-EG",
        {
          maximumFractionDigits: 2,
        },
      )}{" "}
      <span className="text-[7px] text-steel-gray">
        {currency}
      </span>
    </td>
  );
};

const ProfitCell = ({
  value,
  currency,
  formatMoney,
}) => {
  const positive =
    Number(
      value || 0,
    ) >= 0;

  return (
    <td
      className={`whitespace-nowrap px-5 py-4 text-right text-[11px] font-semibold ${
        positive
          ? "text-antique-gold"
          : "text-red-600"
      }`}
    >
      {formatMoney(
        value,
      )}{" "}
      <span className="text-[7px] text-steel-gray">
        {currency}
      </span>
    </td>
  );
};

const CostingBadge = ({
  status,
}) => {
  if (
    status ===
    "completed"
  ) {
    return (
      <span className="inline-flex rounded-full border border-classic-gold/30 bg-soft-cream px-3 py-1.5 text-[7px] font-semibold uppercase tracking-[0.08em] text-antique-gold">
        Completed
      </span>
    );
  }

  if (
    status ===
    "in_progress"
  ) {
    return (
      <span className="inline-flex rounded-full border border-champagne-gold/30 bg-warm-ivory px-3 py-1.5 text-[7px] font-semibold uppercase tracking-[0.08em] text-antique-gold">
        In Progress
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full border border-light-champagne bg-silver-mist px-3 py-1.5 text-[7px] font-semibold uppercase tracking-[0.08em] text-slate-gray">
      Not Started
    </span>
  );
};

const PaymentBadge = ({
  status,
}) => {
  const classes =
    status === "paid"
      ? "border-classic-gold/30 bg-soft-cream text-antique-gold"
      : status ===
          "failed"
        ? "border-red-200 bg-red-50 text-red-600"
        : "border-light-champagne bg-warm-ivory text-slate-gray";

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1.5 text-[7px] font-semibold uppercase tracking-[0.08em] ${classes}`}
    >
      {String(
        status ||
          "pending",
      ).replaceAll(
        "_",
        " ",
      )}
    </span>
  );
};

const EmptyState = ({
  text,
}) => {
  return (
    <div className="px-6 py-12 text-center text-[10px] text-steel-gray">
      {text}
    </div>
  );
};

export default AdminFinancePage;