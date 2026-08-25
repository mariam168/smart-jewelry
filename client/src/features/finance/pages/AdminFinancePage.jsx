import {
  useEffect,
  useMemo,
  useState,
} from "react";

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
        .slice(0, 10),
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

  const formatLabel = (
    value,
  ) => {
    if (!value) {
      return "Unknown";
    }

    return String(value)
      .replaceAll("_", " ")
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
      if (!monthly.length) {
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
    }, [monthly]);

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

      setFilters(empty);
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
          [name]: value,
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
        setSavingExpense(true);
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
                Revenue, payments, expenses and cash performance.
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
            helper={`${formatMoney(overview.collectionRate)}% collection rate`}
          />

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
            label="Net Cash"
            value={formatMoney(
              overview.netCash,
            )}
            currency={
              currency
            }
            helper="Paid revenue minus recorded expenses"
          />
        </section>

        <section className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MiniCard
            label="Expenses"
            value={`${formatMoney(overview.expenses)} ${currency}`}
          />

          <MiniCard
            label="Shipping Charged"
            value={`${formatMoney(overview.shippingRevenue)} ${currency}`}
          />

          <MiniCard
            label="Failed Payments"
            value={`${formatMoney(overview.failedPayments)} ${currency}`}
          />

          <MiniCard
            label="Cancelled Value"
            value={`${formatMoney(overview.cancelledValue)} ${currency}`}
          />
        </section>

        <section className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MiniCard
            label="Today Sales"
            value={`${formatMoney(data?.periods?.today?.sales)} ${currency}`}
          />

          <MiniCard
            label="This Month"
            value={`${formatMoney(data?.periods?.thisMonth?.sales)} ${currency}`}
          />

          <MiniCard
            label="Last Month"
            value={`${formatMoney(data?.periods?.lastMonth?.sales)} ${currency}`}
          />

          <MiniCard
            label="Monthly Growth"
            value={`${Number(data?.periods?.monthlyGrowth || 0) >= 0 ? "+" : ""}${formatMoney(data?.periods?.monthlyGrowth)}%`}
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
                  label="Expenses"
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

        <section className="mt-7 grid gap-6 xl:grid-cols-2">
          <div className="rounded-[26px] border border-light-champagne bg-soft-white">
            <SectionHeader
              eyebrow="Orders"
              title="Order Value by Status"
            />

            <div className="divide-y divide-light-champagne px-6">
              {data
                ?.orderStatuses
                ?.map(
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
            <Field
              label="Title"
            >
              <input
                name="title"
                value={
                  expenseForm.title
                }
                onChange={
                  handleExpenseChange
                }
                placeholder="Packaging materials"
                className="finance-input"
              />
            </Field>

            <Field
              label="Category"
            >
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

            <Field
              label="Amount"
            >
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

            <Field
              label="Date"
            >
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
              <Field
                label="Note"
              >
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
                            <p className="font-mono text-[10px] font-semibold">
                              {
                                order.orderNumber
                              }
                            </p>

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

                          <td className="px-5 py-4 text-[10px]">
                            {formatLabel(
                              order.paymentStatus,
                            )}
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

        <div className="mt-7 rounded-2xl border border-light-champagne bg-soft-white px-5 py-4">
          <p className="text-[10px] leading-6 text-steel-gray">
            Net Cash represents paid order revenue minus manually recorded
            expenses. It is not accounting profit because historical product,
            manufacturing and inventory costs are not currently snapshotted
            inside each order.
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
}) => {
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
        <span className="font-serif text-[2.1rem] leading-none">
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
}) => {
  return (
    <div className="rounded-[20px] border border-light-champagne bg-soft-white p-5">
      <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-steel-gray">
        {label}
      </p>

      <p className="mt-3 font-serif text-[1.45rem] text-rich-navy">
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
      className={`px-5 py-4 text-[8px] font-semibold uppercase tracking-[0.16em] text-steel-gray ${
        right
          ? "text-right"
          : ""
      }`}
    >
      {text}
    </th>
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