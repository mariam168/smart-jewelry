import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import { useTranslation } from "react-i18next";

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
  const { t, i18n } = useTranslation();

  const [data, setData] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [savingExpense, setSavingExpense] = useState(false);

  const [expandedOrders, setExpandedOrders] = useState({});

  const [filters, setFilters] = useState({
    from: "",
    to: "",
  });

  const [appliedFilters, setAppliedFilters] = useState({
    from: "",
    to: "",
  });

  const [expenseForm, setExpenseForm] = useState({
    title: "",
    category: "other",
    amount: "",
    expenseDate: new Date().toISOString().slice(0, 10),
    note: "",
  });

  const currency = data?.currency || "EGP";

  const loadFinance = async () => {
    try {
      setLoading(true);

      setError("");

      const response = await getFinanceDashboard(appliedFilters);

      setData(response?.data || null);
    } catch (error) {
      console.error("FINANCE ERROR:", error);

      setError(
        error?.response?.data?.message ||
          t("adminFinance.failedToLoadDashboard"),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFinance();
  }, [appliedFilters.from, appliedFilters.to]);

  const formatMoney = (value) => {
    return Number(value || 0).toLocaleString("en-EG", {
      maximumFractionDigits: 2,
    });
  };

  const formatPercent = (value) => {
    return `${Number(value || 0).toLocaleString("en-EG", {
      maximumFractionDigits: 2,
    })}%`;
  };

  const formatLabel = (value) => {
    if (!value) {
      return t("adminFinance.unknown");
    }

    const formattedValue = String(value)
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());

    return t(`adminFinance.categories.${value}`, {
      defaultValue: formattedValue,
    });
  };

  const formatProductName = (value) => {
    if (!value) {
      return t("adminFinance.unknown");
    }

    if (typeof value !== "string") {
      return String(value);
    }

    const currentLanguage = i18n.language?.startsWith("ar") ? "ar" : "en";

    const match = value.match(
      /^\{\s*en:\s*['"]([\s\S]*?)['"]\s*,\s*ar:\s*['"]([\s\S]*?)['"]\s*\}$/,
    );

    if (match) {
      const [, englishName, arabicName] = match;

      return currentLanguage === "ar" ? arabicName : englishName;
    }

    return value;
  };

  const formatDate = (value) => {
    if (!value) {
      return "—";
    }

    return new Date(value).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleApplyFilters = () => {
    if (filters.from && filters.to && filters.from > filters.to) {
      setError(t("adminFinance.fromDateCannotBeAfterToDate"));

      return;
    }

    setError("");

    setAppliedFilters({
      ...filters,
    });
  };

  const handleResetFilters = () => {
    const empty = {
      from: "",
      to: "",
    };

    setFilters(empty);

    setAppliedFilters(empty);
  };

  const handleExpenseChange = (event) => {
    const { name, value } = event.target;

    setExpenseForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleAddExpense = async (event) => {
    event.preventDefault();

    if (!expenseForm.title.trim()) {
      setError(t("adminFinance.expenseTitleRequired"));

      return;
    }

    if (!expenseForm.amount || Number(expenseForm.amount) <= 0) {
      setError(t("adminFinance.validExpenseAmount"));

      return;
    }

    try {
      setSavingExpense(true);

      setError("");

      await createFinanceExpense({
        title: expenseForm.title,
        category: expenseForm.category,
        amount: Number(expenseForm.amount),
        expenseDate: expenseForm.expenseDate,
        note: expenseForm.note,
      });

      setExpenseForm({
        title: "",
        category: "other",
        amount: "",
        expenseDate: new Date().toISOString().slice(0, 10),
        note: "",
      });

      await loadFinance();
    } catch (error) {
      setError(
        error?.response?.data?.message ||
          t("adminFinance.failedToSaveExpense"),
      );
    } finally {
      setSavingExpense(false);
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    const confirmed = window.confirm(
      t("adminFinance.deleteExpenseConfirmation"),
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await deleteFinanceExpense(expenseId);

      await loadFinance();
    } catch (error) {
      setError(
        error?.response?.data?.message ||
          t("adminFinance.failedToDeleteExpense"),
      );
    }
  };

  const toggleOrder = (orderId) => {
    setExpandedOrders((previous) => ({
      ...previous,
      [orderId]: !previous[orderId],
    }));
  };

  if (loading && !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-warm-ivory">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-light-champagne border-t-classic-gold" />

          <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-gray">
            {t("adminFinance.loadingFinance")}
          </p>
        </div>
      </div>
    );
  }

  const overview = data?.overview || {};

  const costs = data?.costBreakdown || {};

  const soldItems = Array.isArray(data?.soldItems) ? data.soldItems : [];

  const expenses = Array.isArray(data?.recentExpenses)
    ? data.recentExpenses
    : [];

const recognizedSales = Number(
  overview.confirmedSales ?? 0,
);

const recognizedOrders = soldItems.length;

  return (
    <main className="min-h-screen bg-warm-ivory text-rich-navy">
      <header className="border-b border-light-champagne bg-soft-white">
        <div className="mx-auto max-w-[1500px] px-5 py-8 lg:px-8">
          <div className="flex flex-col gap-7 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="h-px w-9 bg-classic-gold" />

                <p className="text-[9px] font-semibold uppercase tracking-[0.32em] text-antique-gold">
                  {t("adminFinance.administration")}
                </p>
              </div>

              <h1 className="mt-3 font-serif text-5xl font-normal tracking-[-0.045em]">
                {t("adminFinance.finance")}
              </h1>

              <p className="mt-3 max-w-xl text-[13px] leading-6 text-slate-gray">
                {t("adminFinance.financeDescription")}
              </p>
            </div>

            <div className="flex flex-wrap items-end gap-3">
              <div>
                <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.18em] text-steel-gray">
                  {t("adminFinance.from")}
                </label>

                <input
                  type="date"
                  value={filters.from}
                  onChange={(event) =>
                    setFilters((previous) => ({
                      ...previous,
                      from: event.target.value,
                    }))
                  }
                  className="h-11 rounded-xl border border-light-champagne bg-white px-4 text-[11px] outline-none focus:border-classic-gold"
                />
              </div>

              <div>
                <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.18em] text-steel-gray">
                  {t("adminFinance.to")}
                </label>

                <input
                  type="date"
                  value={filters.to}
                  onChange={(event) =>
                    setFilters((previous) => ({
                      ...previous,
                      to: event.target.value,
                    }))
                  }
                  className="h-11 rounded-xl border border-light-champagne bg-white px-4 text-[11px] outline-none focus:border-classic-gold"
                />
              </div>

              <button
                type="button"
                onClick={handleApplyFilters}
                className="h-11 rounded-xl bg-deep-navy px-5 text-[10px] font-semibold text-white transition hover:bg-midnight-navy"
              >
                {t("adminFinance.apply")}
              </button>

              <button
                type="button"
                onClick={handleResetFilters}
                className="h-11 rounded-xl border border-light-champagne bg-white px-5 text-[10px] font-semibold text-slate-gray"
              >
                {t("adminFinance.reset")}
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
            label={t("adminFinance.confirmedSales")}
            value={`${formatMoney(recognizedSales)} ${currency}`}
            helper={t("adminFinance.confirmedOrLaterOrders", {
              count: recognizedOrders,
            })}
            dark
          />

          <SummaryCard
            label={t("adminFinance.totalProductCost")}
            value={`${formatMoney(overview.totalDirectCost)} ${currency}`}
            helper={t("adminFinance.productCostBreakdownHelper")}
          />

          <SummaryCard
            label={t("adminFinance.profit")}
            value={`${formatMoney(overview.profit)} ${currency}`}
            helper={t("adminFinance.margin", {
              value: formatPercent(overview.profitMargin),
            })}
            profit={Number(overview.profit || 0)}
          />
        </section>

        <section className="mt-7 rounded-[18px] border border-champagne-gold/25 bg-soft-cream px-5 py-4">
          <p className="text-[9px] font-semibold uppercase tracking-[0.17em] text-antique-gold">
            {t("adminFinance.financeRecognitionRule")}
          </p>

          <p className="mt-2 text-[10px] leading-6 text-slate-gray">
            {t("adminFinance.financeRecognitionDescriptionBefore")}{" "}
            <strong className="text-rich-navy">
              {t("adminFinance.confirmed")}
            </strong>
            {t("adminFinance.financeRecognitionDescriptionAfter")}
          </p>
        </section>

        <section className="mt-7 overflow-hidden rounded-[26px] border border-light-champagne bg-soft-white">
          <SectionHeader
            eyebrow={t("adminFinance.cost")}
            title={t("adminFinance.productCostBreakdown")}
          />

          <div className="grid gap-0 md:grid-cols-4">
            <CostItem
              label={t("adminFinance.productCost")}
              value={`${formatMoney(costs.productCost)} ${currency}`}
            />

            <CostItem
              label={t("adminFinance.smartUnitCost")}
              value={`${formatMoney(costs.smartUnitCost)} ${currency}`}
            />

            <CostItem
              label={t("adminFinance.smartUnitInstallation")}
              value={`${formatMoney(costs.installationCost)} ${currency}`}
            />

            <CostItem
              label={t("adminFinance.packagingCost")}
              value={`${formatMoney(costs.packagingCost)} ${currency}`}
            />
          </div>
        </section>

        <section className="mt-7 overflow-hidden rounded-[26px] border border-light-champagne bg-soft-white">
          <SectionHeader
            eyebrow={t("adminFinance.confirmedOrders")}
            title={t("adminFinance.salesAndProfit")}
          />

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1580px]">
              <thead>
                <tr className="border-b border-light-champagne bg-warm-ivory/60 text-left">
                  <TableHead text={t("adminFinance.order")} />

                  <TableHead text={t("adminFinance.status")} />

                  <TableHead text={t("adminFinance.product")} />

                  <TableHead text={t("adminFinance.qty")} />

                  <TableHead text={t("adminFinance.sale")} right />

                  <TableHead text={t("adminFinance.productCost")} right />

                  <TableHead text={t("adminFinance.smartUnit")} right />

                  <TableHead text={t("adminFinance.installation")} right />

                  <TableHead text={t("adminFinance.packagingCost")} right />

                  <TableHead text={t("adminFinance.totalCost")} right />

                  <TableHead text={t("adminFinance.profit")} right />

                  <TableHead text={t("adminFinance.margin")} right />

                  <TableHead text="" right />
                </tr>
              </thead>

              <tbody className="divide-y divide-light-champagne">
                {soldItems.length > 0 ? (
                  soldItems.map((order) => {
                    const isExpanded = Boolean(
                      expandedOrders[order.orderId],
                    );

                    return (
                      <>
                        <tr
                          key={order.orderId}
                          className="transition hover:bg-warm-ivory/40"
                        >
                          <td className="px-5 py-4">
                            <p className="font-mono text-[10px] font-semibold">
                              {order.orderNumber}
                            </p>

                            <p className="mt-1 text-[8px] text-steel-gray">
                              {formatDate(order.orderDate)}
                            </p>

                            <p className="mt-1 max-w-[180px] truncate text-[8px] text-steel-gray">
                              {order.customer}
                            </p>
                          </td>

                          <td className="px-5 py-4">
                            <OrderStatusBadge
                              status={order.orderStatus}
                            />
                          </td>

                          <td className="px-5 py-4">
                           <p className="text-[11px] font-semibold">
  {order.items?.length || 0}{" "}
  {order.items?.length === 1
    ? t("adminFinance.product")
    : t("adminFinance.products", {
        defaultValue: "Products",
      })}
</p>

                            <p className="mt-1 text-[8px] text-steel-gray">
                              {order.customerEmail}
                            </p>
                          </td>

                          <td className="px-5 py-4 text-[11px]">
                            {order.totalQuantity}
                          </td>

                          <MoneyCell
                            value={order.revenue}
                            currency={currency}
                          />

                          <MoneyCell
                            value={order.productCost}
                            currency={currency}
                          />

                          <MoneyCell
                            value={order.smartUnitCost}
                            currency={currency}
                          />

                          <MoneyCell
                            value={order.installationCost}
                            currency={currency}
                          />

                          <MoneyCell
                            value={order.packagingCost}
                            currency={currency}
                          />

                          <MoneyCell
                            value={order.totalCost}
                            currency={currency}
                            strong
                          />

                          <ProfitCell
                            value={order.profit}
                            currency={currency}
                          />

                          <td className="whitespace-nowrap px-5 py-4 text-right text-[11px] font-semibold">
                            {formatPercent(order.margin)}
                          </td>

                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  toggleOrder(order.orderId)
                                }
                                className="inline-flex rounded-full border border-light-champagne bg-white px-4 py-2 text-[8px] font-semibold uppercase tracking-[0.08em] transition hover:border-classic-gold hover:bg-warm-ivory"
                              >
                                {isExpanded
                                  ? t(
                                      "adminFinance.hideDetails",
                                      {
                                        defaultValue:
                                          "Hide Details",
                                      },
                                    )
                                  : t(
                                      "adminFinance.viewDetails",
                                      {
                                        defaultValue:
                                          "View Details",
                                      },
                                    )}
                              </button>

                              <Link
                                to={`/admin/orders/${order.orderId}`}
                                className="inline-flex rounded-full border border-light-champagne bg-white px-4 py-2 text-[8px] font-semibold uppercase tracking-[0.08em] transition hover:border-classic-gold"
                              >
                                {t("adminFinance.open")}
                              </Link>
                            </div>
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr>
                            <td
                              colSpan={13}
                              className="bg-warm-ivory/40 px-6 py-6"
                            >
                              <div className="rounded-[20px] border border-light-champagne bg-white p-5">
                                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                                  <div>
                                    <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-antique-gold">
                                      {t(
                                        "adminFinance.orderDetails",
                                        {
                                          defaultValue:
                                            "Order Details",
                                        },
                                      )}
                                    </p>

                                    <p className="mt-1 text-[10px] text-steel-gray">
                                      {order.orderNumber} ·{" "}
                                      {formatDate(
                                        order.orderDate,
                                      )}
                                    </p>
                                  </div>

                                  <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-steel-gray">
                                    {order.items?.reduce(
                                      (total, item) =>
                                        total +
                                        Number(
                                          item.quantity || 0,
                                        ),
                                      0,
                                    ) || 0}{" "}
                                    {t("adminFinance.items", {
                                      defaultValue: "Items",
                                    })}
                                  </p>
                                </div>

                                <div className="overflow-x-auto rounded-2xl border border-light-champagne">
                                  <table className="w-full min-w-[1250px]">
                                    <thead>
                                      <tr className="border-b border-light-champagne bg-warm-ivory/60 text-left">
                                        <TableHead
                                          text={t(
                                            "adminFinance.product",
                                          )}
                                        />

                                        <TableHead
                                          text={t(
                                            "adminFinance.piece",
                                            {
                                              defaultValue:
                                                "Piece",
                                            },
                                          )}
                                        />

                                        <TableHead
                                          text={t(
                                            "adminFinance.sale",
                                          )}
                                          right
                                        />

                                        <TableHead
                                          text={t(
                                            "adminFinance.productCost",
                                          )}
                                          right
                                        />

                                        <TableHead
                                          text={t(
                                            "adminFinance.smartUnit",
                                          )}
                                          right
                                        />

                                        <TableHead
                                          text={t(
                                            "adminFinance.installation",
                                          )}
                                          right
                                        />

                                        <TableHead
                                          text={t(
                                            "adminFinance.packagingCost",
                                          )}
                                          right
                                        />

                                        <TableHead
                                          text={t(
                                            "adminFinance.totalCost",
                                          )}
                                          right
                                        />

                                        <TableHead
                                          text={t(
                                            "adminFinance.profit",
                                          )}
                                          right
                                        />

                                        <TableHead
                                          text={t(
                                            "adminFinance.margin",
                                          )}
                                          right
                                        />

                                        <TableHead
                                          text={t(
                                            "adminFinance.status",
                                          )}
                                          right
                                        />
                                      </tr>
                                    </thead>

                                    <tbody className="divide-y divide-light-champagne">
                                      {(order.items || []).flatMap(
                                        (item, itemIndex) => {
                                          const pieces = Array.isArray(
                                            item.pieces,
                                          )
                                            ? item.pieces
                                            : [];

                                          if (pieces.length === 0) {
                                            return [];
                                          }

                                          return pieces.map(
                                            (
                                              piece,
                                              pieceIndex,
                                            ) => (
                                              <tr
                                                key={
                                                  piece.unitId ||
                                                  `${order.orderId}-${item.productId || itemIndex}-piece-${pieceIndex + 1}`
                                                }
                                                className="transition hover:bg-warm-ivory/40"
                                              >
                                                <td className="px-5 py-4">
                                                  <p className="max-w-[260px] truncate text-[11px] font-semibold">
                                                    {formatProductName(
                                                      piece.productName ||
                                                        item.productName,
                                                    )}
                                                  </p>

                                                  <p className="mt-1 text-[8px] uppercase tracking-[0.08em] text-antique-gold">
                                                    {t(
                                                      "adminFinance.item",
                                                      {
                                                        defaultValue:
                                                          "Item",
                                                      },
                                                    )}{" "}
                                                    {piece.pieceNumber ||
                                                      pieceIndex +
                                                        1}
                                                  </p>

                                                  {(piece.sku ||
                                                    item.sku) && (
                                                    <p className="mt-1 text-[8px] uppercase tracking-[0.08em] text-steel-gray">
                                                      {t(
                                                        "adminFinance.sku",
                                                      )}{" "}
                                                      {piece.sku ||
                                                        item.sku}
                                                    </p>
                                                  )}
                                                </td>

                                                <td className="px-5 py-4">
                                                  <span className="inline-flex min-w-[42px] items-center justify-center rounded-full border border-light-champagne bg-warm-ivory px-3 py-1.5 text-[9px] font-semibold text-rich-navy">
                                                    #
                                                    {piece.pieceNumber ||
                                                      pieceIndex +
                                                        1}
                                                  </span>
                                                </td>

                                                <MoneyCell
                                                  value={
                                                    piece.sellingPrice
                                                  }
                                                  currency={
                                                    currency
                                                  }
                                                />

                                                <MoneyCell
                                                  value={
                                                    piece.productCost
                                                  }
                                                  currency={
                                                    currency
                                                  }
                                                />

                                                <MoneyCell
                                                  value={
                                                    piece.smartUnitCost
                                                  }
                                                  currency={
                                                    currency
                                                  }
                                                />

                                                <MoneyCell
                                                  value={
                                                    piece.installationCost
                                                  }
                                                  currency={
                                                    currency
                                                  }
                                                />

                                                <MoneyCell
                                                  value={
                                                    piece.packagingCost
                                                  }
                                                  currency={
                                                    currency
                                                  }
                                                />

                                                <MoneyCell
                                                  value={
                                                    piece.totalCost
                                                  }
                                                  currency={
                                                    currency
                                                  }
                                                  strong
                                                />

                                                <ProfitCell
                                                  value={
                                                    piece.profit
                                                  }
                                                  currency={
                                                    currency
                                                  }
                                                />

                                                <td className="whitespace-nowrap px-5 py-4 text-right text-[10px] font-semibold">
                                                  {formatPercent(
                                                    piece.margin,
                                                  )}
                                                </td>

                                                <td className="px-5 py-4 text-right">
                                                  <span className="inline-flex rounded-full border border-light-champagne bg-warm-ivory px-3 py-1.5 text-[7px] font-semibold uppercase tracking-[0.08em] text-slate-gray">
                                                    {piece.manufacturingStatus ||
                                                      "—"}
                                                  </span>
                                                </td>
                                              </tr>
                                            ),
                                          );
                                        },
                                      )}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={13}>
                      <EmptyState
                        text={t(
                          "adminFinance.noConfirmedSalesYet",
                        )}
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-7 rounded-[26px] border border-light-champagne bg-soft-white">
          <SectionHeader
            eyebrow={t("adminFinance.businessExpenses")}
            title={t("adminFinance.addExpense")}
          />

          <div className="border-b border-light-champagne bg-soft-cream/50 px-6 py-4">
            <p className="text-[10px] leading-6 text-slate-gray">
              {t("adminFinance.expensesDescriptionBefore")}{" "}
              <strong className="text-rich-navy">
                {t("adminFinance.notIncluded")}
              </strong>{" "}
              {t("adminFinance.expensesDescriptionAfter")}
            </p>
          </div>

          <form
            onSubmit={handleAddExpense}
            className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-5"
          >
            <Field label={t("adminFinance.title")}>
              <input
                name="title"
                value={expenseForm.title}
                onChange={handleExpenseChange}
                placeholder={t(
                  "adminFinance.marketingCampaign",
                )}
                className="finance-input"
              />
            </Field>

            <Field label={t("adminFinance.category")}>
              <select
                name="category"
                value={expenseForm.category}
                onChange={handleExpenseChange}
                className="finance-input"
              >
                {expenseCategories.map((category) => (
                  <option key={category} value={category}>
                    {formatLabel(category)}
                  </option>
                ))}
              </select>
            </Field>

            <Field label={t("adminFinance.amount")}>
              <input
                type="number"
                min="0"
                step="0.01"
                name="amount"
                value={expenseForm.amount}
                onChange={handleExpenseChange}
                placeholder="0.00"
                className="finance-input"
              />
            </Field>

            <Field label={t("adminFinance.date")}>
              <input
                type="date"
                name="expenseDate"
                value={expenseForm.expenseDate}
                onChange={handleExpenseChange}
                className="finance-input"
              />
            </Field>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={savingExpense}
                className="h-11 w-full rounded-xl bg-deep-navy px-5 text-[10px] font-semibold text-white disabled:opacity-50"
              >
                {savingExpense
                  ? t("adminFinance.saving")
                  : t("adminFinance.addExpense")}
              </button>
            </div>

            <div className="md:col-span-2 xl:col-span-5">
              <Field label={t("adminFinance.note")}>
                <textarea
                  name="note"
                  value={expenseForm.note}
                  onChange={handleExpenseChange}
                  rows={3}
                  placeholder={t(
                    "adminFinance.optionalNote",
                  )}
                  className="finance-input resize-none py-3"
                />
              </Field>
            </div>
          </form>
        </section>

        <section className="mt-7 overflow-hidden rounded-[26px] border border-light-champagne bg-soft-white">
          <SectionHeader
            eyebrow={t("adminFinance.expenses")}
            title={t(
              "adminFinance.recentBusinessExpenses",
            )}
          />

          <div className="border-b border-light-champagne bg-warm-ivory/50 px-6 py-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-[10px] text-slate-gray">
                {t("adminFinance.recordedExpenses")}
              </p>

              <p className="font-serif text-[1.3rem] text-rich-navy">
                {formatMoney(
                  data?.businessExpenses?.total,
                )}{" "}
                {currency}
              </p>
            </div>
          </div>

          {expenses.length > 0 ? (
            <div className="divide-y divide-light-champagne">
              {expenses.map((expense) => (
                <div
                  key={expense._id}
                  className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[11px] font-semibold">
                      {expense.title}
                    </p>

                    <div className="mt-1 flex flex-wrap gap-2 text-[9px] text-steel-gray">
                      <span>
                        {formatLabel(expense.category)}
                      </span>

                      <span>·</span>

                      <span>
                        {formatDate(expense.expenseDate)}
                      </span>
                    </div>

                    {expense.note && (
                      <p className="mt-2 max-w-xl text-[9px] leading-5 text-slate-gray">
                        {expense.note}
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-4">
                    <p className="text-[12px] font-semibold text-[#A65353]">
                      -{formatMoney(expense.amount)}{" "}
                      {currency}
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        handleDeleteExpense(expense._id)
                      }
                      className="rounded-lg border border-red-200 px-3 py-2 text-[9px] font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      {t("adminFinance.delete")}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              text={t(
                "adminFinance.noExpensesRecorded",
              )}
            />
          )}
        </section>

        <section className="mt-7 rounded-[22px] border border-champagne-gold/25 bg-soft-cream px-6 py-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-antique-gold">
            {t("adminFinance.profitFormula")}
          </p>

          <p className="mt-3 text-[11px] leading-7 text-slate-gray">
            {t(
              "adminFinance.profitFormulaDescriptionBefore",
            )}{" "}
            <strong className="text-rich-navy">
              {t("adminFinance.productProfit")}
            </strong>
          </p>

          <p className="mt-2 text-[10px] leading-6 text-steel-gray">
            {t("adminFinance.profitFormulaNote")}
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
    profit !== null && Number(profit) < 0;

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
          negative ? "text-red-600" : ""
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

const CostItem = ({ label, value }) => {
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

const SectionHeader = ({ eyebrow, title }) => {
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

const Field = ({ label, children }) => {
  return (
    <label className="block">
      <span className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.16em] text-steel-gray">
        {label}
      </span>

      {children}
    </label>
  );
};

const TableHead = ({ text, right = false }) => {
  return (
    <th
      className={`whitespace-nowrap px-5 py-4 text-[8px] font-semibold uppercase tracking-[0.16em] text-steel-gray ${
        right ? "text-right" : ""
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
      {Number(value || 0).toLocaleString("en-EG", {
        maximumFractionDigits: 2,
      })}{" "}
      <span className="text-[7px] text-steel-gray">
        {currency}
      </span>
    </td>
  );
};

const ProfitCell = ({ value, currency }) => {
  const positive = Number(value || 0) >= 0;

  return (
    <td
      className={`whitespace-nowrap px-5 py-4 text-right text-[11px] font-semibold ${
        positive ? "text-antique-gold" : "text-red-600"
      }`}
    >
      {Number(value || 0).toLocaleString("en-EG", {
        maximumFractionDigits: 2,
      })}{" "}
      <span className="text-[7px] text-steel-gray">
        {currency}
      </span>
    </td>
  );
};

const OrderStatusBadge = ({ status }) => {
  const { t } = useTranslation();

  const normalized = String(
    status || "confirmed",
  ).toLowerCase();

  const className =
    normalized === "delivered"
      ? "border-classic-gold/30 bg-soft-cream text-antique-gold"
      : normalized === "shipped"
        ? "border-navy-soft/20 bg-silver-mist/80 text-navy-soft"
        : normalized === "processing"
          ? "border-light-champagne bg-warm-ivory text-slate-gray"
          : "border-champagne-gold/30 bg-champagne-gold/10 text-antique-gold";

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1.5 text-[7px] font-semibold uppercase tracking-[0.08em] ${className}`}
    >
      {t(`adminFinance.orderStatuses.${normalized}`, {
        defaultValue:
          formatStatusLabel(normalized),
      })}
    </span>
  );
};

const formatStatusLabel = (value) => {
  return String(value || "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
};

const EmptyState = ({ text }) => {
  return (
    <div className="px-6 py-12 text-center text-[10px] text-steel-gray">
      {text}
    </div>
  );
};

export default AdminFinancePage;