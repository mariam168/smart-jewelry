import {
  useEffect,
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

const AdminFinancePage =
  () => {
    const [
      data,
      setData,
    ] =
      useState(null);

    const [
      loading,
      setLoading,
    ] =
      useState(true);

    const [
      error,
      setError,
    ] =
      useState("");

    const [
      savingExpense,
      setSavingExpense,
    ] =
      useState(false);

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

    const currency =
      data?.currency ||
      "EGP";

    const loadFinance =
      async () => {
        try {
          setLoading(
            true,
          );

          setError("");

          const response =
            await getFinanceDashboard(
              appliedFilters,
            );

          setData(
            response?.data ||
              null,
          );
        } catch (
          error
        ) {
          console.error(
            "FINANCE ERROR:",
            error,
          );

          setError(
            error
              ?.response
              ?.data
              ?.message ||
              "Failed to load finance dashboard.",
          );
        } finally {
          setLoading(
            false,
          );
        }
      };

    useEffect(() => {
      loadFinance();
    }, [
      appliedFilters.from,
      appliedFilters.to,
    ]);

    const formatMoney =
      (value) => {
        return Number(
          value ||
            0,
        ).toLocaleString(
          "en-EG",
          {
            maximumFractionDigits:
              2,
          },
        );
      };

    const formatPercent =
      (value) => {
        return `${Number(
          value ||
            0,
        ).toLocaleString(
          "en-EG",
          {
            maximumFractionDigits:
              2,
          },
        )}%`;
      };

    const formatLabel =
      (value) => {
        if (!value) {
          return "Unknown";
        }

        return String(
          value,
        )
          .replaceAll(
            "_",
            " ",
          )
          .replace(
            /\b\w/g,
            (
              letter,
            ) =>
              letter.toUpperCase(),
          );
      };

    const formatDate =
      (value) => {
        if (!value) {
          return "—";
        }

        return new Date(
          value,
        ).toLocaleDateString(
          "en-GB",
          {
            day:
              "2-digit",

            month:
              "short",

            year:
              "numeric",
          },
        );
      };

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
      (
        event,
      ) => {
        const {
          name,
          value,
        } =
          event.target;

        setExpenseForm(
          (
            previous,
          ) => ({
            ...previous,

            [name]:
              value,
          }),
        );
      };

    const handleAddExpense =
      async (
        event,
      ) => {
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
        } catch (
          error
        ) {
          setError(
            error
              ?.response
              ?.data
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

        if (
          !confirmed
        ) {
          return;
        }

        try {
          setError("");

          await deleteFinanceExpense(
            expenseId,
          );

          await loadFinance();
        } catch (
          error
        ) {
          setError(
            error
              ?.response
              ?.data
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

    const costs =
      data?.costBreakdown ||
      {};

    const soldItems =
      Array.isArray(
        data?.soldItems,
      )
        ? data.soldItems
        : [];

    const expenses =
      Array.isArray(
        data?.recentExpenses,
      )
        ? data.recentExpenses
        : [];

    const recognizedSales =
      Number(
        overview.recognizedSales ??
          overview.deliveredSales ??
          0,
      );

    const recognizedOrders =
      Number(
        overview.recognizedOrders ??
          overview.deliveredOrders ??
          0,
      );

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

                <p className="mt-3 max-w-xl text-[13px] leading-6 text-slate-gray">
                  Sales are recognized from
                  Confirmed status onward,
                  together with product costs
                  and actual product profit.
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

          <section className="grid gap-5 md:grid-cols-3">
            <SummaryCard
              label="Confirmed Sales"
              value={`${formatMoney(
                recognizedSales,
              )} ${currency}`}
              helper={`${recognizedOrders} confirmed-or-later order(s)`}
              dark
            />

            <SummaryCard
              label="Total Product Cost"
              value={`${formatMoney(
                overview.totalDirectCost,
              )} ${currency}`}
              helper="Product + Smart Unit + Installation + Packaging"
            />

            <SummaryCard
              label="Profit"
              value={`${formatMoney(
                overview.profit,
              )} ${currency}`}
              helper={`${formatPercent(
                overview.profitMargin,
              )} margin`}
              profit={
                Number(
                  overview.profit ||
                    0,
                )
              }
            />
          </section>

          <section className="mt-7 rounded-[18px] border border-champagne-gold/25 bg-soft-cream px-5 py-4">
            <p className="text-[9px] font-semibold uppercase tracking-[0.17em] text-antique-gold">
              Finance Recognition Rule
            </p>

            <p className="mt-2 text-[10px] leading-6 text-slate-gray">
              An order starts appearing in
              Finance when its status becomes{" "}
              <strong className="text-rich-navy">
                Confirmed
              </strong>
              . It remains counted while it
              moves through Processing,
              Shipped and Delivered. Pending
              and Cancelled orders are not
              included.
            </p>
          </section>

          <section className="mt-7 overflow-hidden rounded-[26px] border border-light-champagne bg-soft-white">
            <SectionHeader
              eyebrow="Cost"
              title="Product Cost Breakdown"
            />

            <div className="grid gap-0 md:grid-cols-4">
              <CostItem
                label="Product Cost"
                value={`${formatMoney(
                  costs.productCost,
                )} ${currency}`}
              />

              <CostItem
                label="Smart Unit Cost"
                value={`${formatMoney(
                  costs.smartUnitCost,
                )} ${currency}`}
              />

              <CostItem
                label="Smart Unit Installation"
                value={`${formatMoney(
                  costs.installationCost,
                )} ${currency}`}
              />

              <CostItem
                label="Packaging Cost"
                value={`${formatMoney(
                  costs.packagingCost,
                )} ${currency}`}
              />
            </div>
          </section>

          <section className="mt-7 overflow-hidden rounded-[26px] border border-light-champagne bg-soft-white">
            <SectionHeader
              eyebrow="Confirmed Orders"
              title="Sales & Profit"
            />

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1580px]">
                <thead>
                  <tr className="border-b border-light-champagne bg-warm-ivory/60 text-left">
                    <TableHead text="Order" />

                    <TableHead text="Status" />

                    <TableHead text="Product" />

                    <TableHead text="Qty" />

                    <TableHead
                      text="Sale"
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
                      text="Installation"
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
                      text="Profit"
                      right
                    />

                    <TableHead
                      text="Margin"
                      right
                    />

                    <TableHead
                      text=""
                      right
                    />
                  </tr>
                </thead>

                <tbody className="divide-y divide-light-champagne">
                  {soldItems.length >
                  0 ? (
                    soldItems.map(
                      (
                        item,
                        index,
                      ) => (
                        <tr
                          key={`${item.orderId}-${item.productId}-${index}`}
                          className="transition hover:bg-warm-ivory/40"
                        >
                          <td className="px-5 py-4">
                            <p className="font-mono text-[10px] font-semibold">
                              {
                                item.orderNumber
                              }
                            </p>

                            <p className="mt-1 text-[8px] text-steel-gray">
                              {formatDate(
                                item.orderDate,
                              )}
                            </p>
                          </td>

                          <td className="px-5 py-4">
                            <OrderStatusBadge
                              status={
                                item.orderStatus
                              }
                            />
                          </td>

                          <td className="px-5 py-4">
                            <p className="max-w-[220px] truncate text-[11px] font-semibold">
                              {
                                item.productName
                              }
                            </p>

                            {item.sku && (
                              <p className="mt-1 text-[8px] uppercase tracking-[0.08em] text-steel-gray">
                                SKU ·{" "}
                                {
                                  item.sku
                                }
                              </p>
                            )}

                            <p className="mt-1 max-w-[220px] truncate text-[8px] text-steel-gray">
                              {
                                item.customer
                              }
                            </p>
                          </td>

                          <td className="px-5 py-4 text-[11px]">
                            {
                              item.quantity
                            }
                          </td>

                          <MoneyCell
                            value={
                              item.revenue
                            }
                            currency={
                              currency
                            }
                          />

                          <MoneyCell
                            value={
                              item.productCost
                            }
                            currency={
                              currency
                            }
                          />

                          <MoneyCell
                            value={
                              item.smartUnitCost
                            }
                            currency={
                              currency
                            }
                          />

                          <MoneyCell
                            value={
                              item.installationCost
                            }
                            currency={
                              currency
                            }
                          />

                          <MoneyCell
                            value={
                              item.packagingCost
                            }
                            currency={
                              currency
                            }
                          />

                          <MoneyCell
                            value={
                              item.totalCost
                            }
                            currency={
                              currency
                            }
                            strong
                          />

                          <ProfitCell
                            value={
                              item.profit
                            }
                            currency={
                              currency
                            }
                          />

                          <td className="whitespace-nowrap px-5 py-4 text-right text-[11px] font-semibold">
                            {formatPercent(
                              item.margin,
                            )}
                          </td>

                          <td className="px-5 py-4 text-right">
                            <Link
                              to={`/admin/orders/${item.orderId}`}
                              className="inline-flex rounded-full border border-light-champagne bg-white px-4 py-2 text-[8px] font-semibold uppercase tracking-[0.08em] transition hover:border-classic-gold"
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
                        colSpan={
                          13
                        }
                      >
                        <EmptyState text="No confirmed sales yet." />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-7 rounded-[26px] border border-light-champagne bg-soft-white">
            <SectionHeader
              eyebrow="Business Expenses"
              title="Add Expense"
            />

            <div className="border-b border-light-champagne bg-soft-cream/50 px-6 py-4">
              <p className="text-[10px] leading-6 text-slate-gray">
                These expenses are kept
                separately and are{" "}
                <strong className="text-rich-navy">
                  not included
                </strong>{" "}
                in the Product Profit
                calculation above.
              </p>
            </div>

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
                  type="submit"
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
                    rows={
                      3
                    }
                    placeholder="Optional note"
                    className="finance-input resize-none py-3"
                  />
                </Field>
              </div>
            </form>
          </section>

          <section className="mt-7 overflow-hidden rounded-[26px] border border-light-champagne bg-soft-white">
            <SectionHeader
              eyebrow="Expenses"
              title="Recent Business Expenses"
            />

            <div className="border-b border-light-champagne bg-warm-ivory/50 px-6 py-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="text-[10px] text-slate-gray">
                  Recorded expenses
                </p>

                <p className="font-serif text-[1.3rem] text-rich-navy">
                  {formatMoney(
                    data
                      ?.businessExpenses
                      ?.total,
                  )}{" "}
                  {currency}
                </p>
              </div>
            </div>

            {expenses.length >
            0 ? (
              <div className="divide-y divide-light-champagne">
                {expenses.map(
                  (
                    expense,
                  ) => (
                    <div
                      key={
                        expense._id
                      }
                      className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
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
                          <p className="mt-2 max-w-xl text-[9px] leading-5 text-slate-gray">
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
                )}
              </div>
            ) : (
              <EmptyState text="No expenses recorded." />
            )}
          </section>

          <section className="mt-7 rounded-[22px] border border-champagne-gold/25 bg-soft-cream px-6 py-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-antique-gold">
              Profit Formula
            </p>

            <p className="mt-3 text-[11px] leading-7 text-slate-gray">
              Confirmed-or-Later Product
              Sales − Product Cost − Smart
              Unit Cost − Smart Unit
              Installation Cost −
              Packaging Cost ={" "}
              <strong className="text-rich-navy">
                Product Profit
              </strong>
            </p>

            <p className="mt-2 text-[10px] leading-6 text-steel-gray">
              Shipping is not included
              in Product Profit.
              Business expenses are
              recorded separately.
            </p>
          </section>
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

const SummaryCard = ({
  label,
  value,
  helper,
  dark = false,
  profit = null,
}) => {
  const negative =
    profit !== null &&
    Number(
      profit,
    ) < 0;

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

      <p
        className={`mt-5 font-serif text-[2.1rem] leading-none ${
          negative
            ? "text-red-600"
            : ""
        }`}
      >
        {value}
      </p>

      <p
        className={`mt-4 text-[9px] leading-5 ${
          dark
            ? "text-premium-silver/70"
            : "text-steel-gray"
        }`}
      >
        {helper}
      </p>
    </div>
  );
};

const CostItem = ({
  label,
  value,
}) => {
  return (
    <div className="border-b border-light-champagne px-6 py-6 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0">
      <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-steel-gray">
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
        value ||
          0,
      ).toLocaleString(
        "en-EG",
        {
          maximumFractionDigits:
            2,
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
}) => {
  const positive =
    Number(
      value ||
        0,
    ) >= 0;

  return (
    <td
      className={`whitespace-nowrap px-5 py-4 text-right text-[11px] font-semibold ${
        positive
          ? "text-antique-gold"
          : "text-red-600"
      }`}
    >
      {Number(
        value ||
          0,
      ).toLocaleString(
        "en-EG",
        {
          maximumFractionDigits:
            2,
        },
      )}{" "}
      <span className="text-[7px] text-steel-gray">
        {currency}
      </span>
    </td>
  );
};

const OrderStatusBadge = ({
  status,
}) => {
  const normalized =
    String(
      status ||
        "confirmed",
    ).toLowerCase();

  const className =
    normalized ===
    "delivered"
      ? "border-classic-gold/30 bg-soft-cream text-antique-gold"
      : normalized ===
        "shipped"
      ? "border-navy-soft/20 bg-silver-mist/80 text-navy-soft"
      : normalized ===
        "processing"
      ? "border-light-champagne bg-warm-ivory text-slate-gray"
      : "border-champagne-gold/30 bg-champagne-gold/10 text-antique-gold";

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1.5 text-[7px] font-semibold uppercase tracking-[0.08em] ${className}`}
    >
      {formatStatusLabel(
        normalized,
      )}
    </span>
  );
};

const formatStatusLabel = (
  value,
) => {
  return String(
    value ||
      "",
  )
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