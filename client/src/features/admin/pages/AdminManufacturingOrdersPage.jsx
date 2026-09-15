
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import {
  getManufacturingOrders,
  deleteManufacturingOrder,
} from "../services/manufacturingApi";

import { useAuth } from "../../auth/context/AuthContext.jsx";

const statusLabels = {
  pending: "Pending",
  unit_assigned: "Unit Assigned",
  experience_created: "Experience Created",
  in_production: "In Production",
  ready_for_packaging: "Ready for Packaging",
  packaging: "Packaging",
  completed: "Completed",
  failed: "Failed",
};

const getStatusClasses = (status) => {
  switch (status) {
    case "pending":
      return "border-champagne-gold/30 bg-champagne-gold/10 text-antique-gold";

    case "unit_assigned":
      return "border-light-champagne bg-silver-mist text-navy-soft";

    case "experience_created":
      return "border-champagne-gold/25 bg-soft-cream text-antique-gold";

    case "in_production":
      return "border-navy-soft/20 bg-silver-mist text-navy-soft";

    case "ready_for_packaging":
      return "border-champagne-gold/30 bg-warm-ivory text-antique-gold";

    case "packaging":
      return "border-classic-gold/30 bg-champagne-gold/10 text-antique-gold";

    case "completed":
      return "border-classic-gold/30 bg-soft-cream text-antique-gold";

    case "failed":
      return "border-antique-gold/25 bg-warm-ivory text-antique-gold";

    default:
      return "border-light-champagne bg-silver-mist text-slate-gray";
  }
};

const formatDate = (value) => {
  if (!value) return "N/A";

  return new Date(value).toLocaleDateString("en-GB");
};

const getLocalizedText = (value, language, fallback = "") => {
  if (!value) return fallback;

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "object") {
    return value[language] || value.en || value.ar || fallback;
  }

  return String(value);
};

const AdminManufacturingOrdersPage = () => {
  const { t, i18n } = useTranslation();

  const { user } = useAuth();

  const isSuperAdmin =
    user?.role?.name === "super_admin";

  const [manufacturingOrders, setManufacturingOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const activeLanguage = i18n.language === "ar" ? "ar" : "en";

  const loadManufacturingOrders = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await getManufacturingOrders();

      const data = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response?.data?.manufacturingOrders)
          ? response.data.manufacturingOrders
          : [];

      setManufacturingOrders(data);
    } catch (error) {
      console.error("Unable to load manufacturing orders:", error);

      setError(
        error?.response?.data?.message ||
          t("adminManufacturingOrders.unableToLoadManufacturingOrders"),
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadManufacturingOrders();
  }, []);

  const handleDelete = async (manufacturingOrder) => {
    const confirmed = window.confirm(
      t("adminManufacturingOrders.deleteConfirmation", {
        orderNumber: manufacturingOrder.orderNumber,
      }),
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(manufacturingOrder._id);
      setError("");

      await deleteManufacturingOrder(manufacturingOrder._id);

      setManufacturingOrders((previous) =>
        previous.filter(
          (item) => item._id !== manufacturingOrder._id,
        ),
      );
    } catch (error) {
      console.error("Unable to delete manufacturing order:", error);

      setError(
        error?.response?.data?.message ||
          t(
            "adminManufacturingOrders.unableToDeleteManufacturingOrder",
          ),
      );
    } finally {
      setDeletingId("");
    }
  };

  const filteredManufacturingOrders = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return manufacturingOrders;
    }

    return manufacturingOrders.filter((manufacturingOrder) => {
      const unit = manufacturingOrder?.units?.[0];

      const product = unit?.product || null;

      const productNameEn =
        typeof product?.name === "object"
          ? product.name?.en
          : product?.name;

      const productNameAr =
        typeof product?.name === "object"
          ? product.name?.ar
          : "";

      const smartUnitSerial =
        unit?.smartUnitInstance?.serialNumber ||
        unit?.serialNumber ||
        "";

      const smartUnitNameEn =
        typeof unit?.smartUnit?.name === "object"
          ? unit.smartUnit.name?.en
          : unit?.smartUnit?.name;

      const smartUnitNameAr =
        typeof unit?.smartUnit?.name === "object"
          ? unit.smartUnit.name?.ar
          : "";

      const status =
        unit?.status ||
        manufacturingOrder?.status ||
        "pending";

      const searchableValues = [
        manufacturingOrder?.orderNumber,
        manufacturingOrder?._id,
        productNameEn,
        productNameAr,
        product?.sku,
        smartUnitSerial,
        smartUnitNameEn,
        smartUnitNameAr,
        status,
        statusLabels[status],
      ];

      return searchableValues.some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(normalizedSearch),
      );
    });
  }, [manufacturingOrders, searchTerm]);

  if (isLoading) {
    return (
      <div className="relative min-h-[440px] overflow-hidden">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-soft-cream blur-[100px]" />

        <div className="relative flex min-h-[440px] items-center justify-center">
          <div className="text-center">
            <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-champagne-gold/25 bg-midnight-navy shadow-[0_12px_30px_rgba(18,38,58,0.15)]">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-champagne-gold/20 border-t-champagne-gold" />
            </div>

            <p className="mt-6 text-[9px] font-semibold uppercase tracking-[0.25em] text-slate-gray">
              {t("adminManufacturingOrders.loading")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-full space-y-8">
      <div className="relative overflow-hidden rounded-[28px] border border-champagne-gold/15 bg-midnight-navy px-7 py-9 shadow-[0_24px_65px_rgba(7,19,31,0.16)] sm:px-9 lg:px-10">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-rich-navy via-midnight-navy to-luxury-black" />

        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border border-champagne-gold/10" />

        <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full border border-champagne-gold/[0.08]" />

        <div className="pointer-events-none absolute -bottom-28 -left-20 h-64 w-64 rounded-full border border-champagne-gold/[0.08]" />

        <div className="relative z-10">
          <div className="mb-4 flex items-center gap-3">
            <span className="h-px w-8 bg-classic-gold/65" />

            <span className="text-[8px] font-semibold uppercase tracking-[0.34em] text-champagne-gold">
              {t("adminManufacturingOrders.production")}
            </span>

            <span className="h-px w-8 bg-classic-gold/65" />
          </div>

          <h1 className="font-serif text-[2.6rem] font-normal leading-none tracking-[-0.04em] text-soft-white sm:text-[3.2rem]">
            {t("adminManufacturingOrders.manufacturingOrders")}
          </h1>

          <p className="mt-4 text-[12px] leading-7 text-premium-silver/70 sm:text-[13px]">
            {t("adminManufacturingOrders.description")}
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-[20px] border border-antique-gold/25 bg-soft-cream p-5 text-[11px] text-antique-gold">
          {getLocalizedText(error, activeLanguage, error)}

          <button
            type="button"
            onClick={loadManufacturingOrders}
            className="ml-4 font-semibold underline"
          >
            {t("adminManufacturingOrders.retry")}
          </button>
        </div>
      )}

      {manufacturingOrders.length === 0 ? (
        <div className="relative overflow-hidden rounded-[28px] border border-light-champagne/90 bg-soft-white/85 p-12 text-center shadow-[0_14px_40px_rgba(7,19,31,0.045)]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-champagne-gold/25 bg-warm-ivory text-classic-gold">
            ✦
          </div>

          <h2 className="mt-6 font-serif text-[1.8rem] text-midnight-navy">
            {t("adminManufacturingOrders.noManufacturingOrders")}
          </h2>

          <p className="mt-3 text-[11px] text-slate-gray">
            {t("adminManufacturingOrders.noOrdersYet")}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[28px] border border-light-champagne/90 bg-soft-white/85 shadow-[0_18px_50px_rgba(7,19,31,0.05)]">
          <div className="border-b border-light-champagne/80 bg-warm-ivory/45 px-6 py-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-midnight-navy">
                  {t("adminManufacturingOrders.manufacturingOrders")}
                </p>

                <p className="mt-1 text-[9px] text-slate-gray">
                  {searchTerm.trim()
                    ? `${filteredManufacturingOrders.length} ${t(
                        "adminManufacturingOrders.searchResults",
                      )}`
                    : `${manufacturingOrders.length} ${t(
                        "adminManufacturingOrders.ordersFound",
                      )}`}
                </p>
              </div>

              <div className="relative w-full lg:w-[360px]">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(event.target.value)
                  }
                  placeholder={t(
                    "adminManufacturingOrders.searchPlaceholder",
                  )}
                  className="h-11 w-full rounded-full border border-light-champagne bg-soft-white px-5 pr-11 text-[10px] text-midnight-navy outline-none transition-all placeholder:text-steel-gray/70 focus:border-classic-gold focus:ring-2 focus:ring-classic-gold/10"
                />

                <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-[16px] text-antique-gold">
                  ⌕
                </span>
              </div>
            </div>
          </div>

          {filteredManufacturingOrders.length === 0 ? (
            <div className="relative flex min-h-[340px] flex-col items-center justify-center px-6 text-center">
              <div className="pointer-events-none absolute left-1/2 top-1/2 h-[260px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-soft-cream blur-[85px]" />

              <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-champagne-gold/25 bg-warm-ivory text-[17px] text-classic-gold shadow-[0_9px_24px_rgba(7,19,31,0.04)]">
                ⌕
              </div>

              <h2 className="relative mt-6 font-serif text-[1.7rem] font-normal tracking-[-0.025em] text-midnight-navy">
                {t(
                  "adminManufacturingOrders.noMatchingOrders",
                )}
              </h2>

              <p className="relative mt-3 max-w-sm text-[11px] leading-6 text-slate-gray">
                {t(
                  "adminManufacturingOrders.noMatchingOrdersDescription",
                )}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left">
                <thead>
                  <tr className="bg-midnight-navy">
                    <th className="px-6 py-5 text-[7px] font-semibold uppercase tracking-[0.2em] text-champagne-gold">
                      {t("adminManufacturingOrders.order")}
                    </th>

                    <th className="px-6 py-5 text-[7px] font-semibold uppercase tracking-[0.2em] text-champagne-gold">
                      {t("adminManufacturingOrders.product")}
                    </th>

                    <th className="px-6 py-5 text-[7px] font-semibold uppercase tracking-[0.2em] text-champagne-gold">
                      {t("adminManufacturingOrders.smartUnit")}
                    </th>

                    <th className="px-6 py-5 text-[7px] font-semibold uppercase tracking-[0.2em] text-champagne-gold">
                      {t("adminManufacturingOrders.units")}
                    </th>

                    <th className="px-6 py-5 text-[7px] font-semibold uppercase tracking-[0.2em] text-champagne-gold">
                      {t("adminManufacturingOrders.status")}
                    </th>

                    <th className="px-6 py-5 text-[7px] font-semibold uppercase tracking-[0.2em] text-champagne-gold">
                      {t("adminManufacturingOrders.created")}
                    </th>

                    <th className="px-6 py-5 text-right text-[7px] font-semibold uppercase tracking-[0.2em] text-champagne-gold">
                      {t("adminManufacturingOrders.action")}
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-light-champagne/65">
                  {filteredManufacturingOrders.map(
                    (manufacturingOrder) => {
                      const unit =
                        manufacturingOrder?.units?.[0];

                      const product =
                        unit?.product || null;

                      const productName =
                        getLocalizedText(
                          product?.name,
                          activeLanguage,
                          t(
                            "adminManufacturingOrders.unknownProduct",
                          ),
                        );

                      const unitName =
                        unit?.smartUnitInstance
                          ?.serialNumber ||
                        unit?.serialNumber ||
                        getLocalizedText(
                          unit?.smartUnit?.name,
                          activeLanguage,
                          t(
                            "adminManufacturingOrders.notAssigned",
                          ),
                        );

                      const status =
                        unit?.status ||
                        manufacturingOrder?.status ||
                        "pending";

                      const isDeleting =
                        deletingId ===
                        manufacturingOrder._id;

                      return (
                        <tr
                          key={manufacturingOrder._id}
                          className="transition-colors hover:bg-warm-ivory/55"
                        >
                          <td className="px-6 py-5">
                            <p className="font-serif text-[1.05rem] text-midnight-navy">
                              #{manufacturingOrder.orderNumber}
                            </p>
                          </td>

                          <td className="px-6 py-5">
                            <p className="max-w-[220px] truncate text-[11px] font-semibold text-midnight-navy">
                              {productName}
                            </p>

                            {product?.sku && (
                              <p className="mt-1 text-[8px] text-steel-gray">
                                {product.sku}
                              </p>
                            )}
                          </td>

                          <td className="px-6 py-5">
                            <p className="text-[10px] font-semibold text-midnight-navy">
                              {unitName}
                            </p>
                          </td>

                          <td className="px-6 py-5">
                            <p className="text-[10px] text-midnight-navy">
                              {manufacturingOrder.units?.length ||
                                0}
                            </p>
                          </td>

                          <td className="px-6 py-5">
                            <span
                              className={`inline-flex rounded-full border px-3 py-1.5 text-[7px] font-semibold uppercase tracking-[0.08em] ${getStatusClasses(
                                status,
                              )}`}
                            >
                              {t(
                                `adminManufacturingOrders.statusLabels.${status}`,
                                {
                                  defaultValue:
                                    statusLabels[status] ||
                                    status,
                                },
                              )}
                            </span>
                          </td>

                          <td className="px-6 py-5">
                            <p className="text-[9px] text-slate-gray">
                              {formatDate(
                                manufacturingOrder.createdAt,
                              )}
                            </p>
                          </td>

                          <td className="px-6 py-5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link
                                to={`/admin/manufacturing/${manufacturingOrder._id}`}
                                className="inline-flex min-h-[38px] items-center justify-center gap-3 rounded-full bg-midnight-navy px-5 text-[7px] font-semibold uppercase tracking-[0.1em] text-soft-white transition hover:bg-rich-navy"
                              >
                                {t(
                                  "adminManufacturingOrders.manage",
                                )}

                                <span className="text-champagne-gold">
                                  →
                                </span>
                              </Link>

                              {isSuperAdmin && (
                                <button
                                  type="button"
                                  disabled={isDeleting}
                                  onClick={() =>
                                    handleDelete(
                                      manufacturingOrder,
                                    )
                                  }
                                  className="inline-flex min-h-[38px] items-center justify-center rounded-full border border-antique-gold/30 bg-soft-white px-5 text-[7px] font-semibold uppercase tracking-[0.1em] text-antique-gold transition-all duration-300 hover:-translate-y-0.5 hover:border-antique-gold/60 hover:bg-soft-cream hover:text-midnight-navy disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                                >
                                  {isDeleting
                                    ? t(
                                        "adminManufacturingOrders.deleting",
                                      )
                                    : t(
                                        "adminManufacturingOrders.delete",
                                      )}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    },
                  )}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex items-center justify-center gap-3 border-t border-light-champagne px-6 py-4">
            <span className="h-px w-8 bg-classic-gold/30" />

            <span className="text-classic-gold">✦</span>

            <span className="h-px w-8 bg-classic-gold/30" />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminManufacturingOrdersPage;
