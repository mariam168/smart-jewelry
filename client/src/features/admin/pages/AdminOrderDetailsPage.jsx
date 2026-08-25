import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  getAdminOrderById,
  updateOrderStatus,
} from "../../orders/services/orderApi";

import {
  getManufacturingOrders,
  createManufacturingOrder,
  startManufacturing,
} from "../services/manufacturingApi";

const statuses = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const BACKEND_URL = (
  import.meta.env.VITE_BACKEND_URL || ""
).replace(/\/$/, "");

const formatDate = (date) => {
  if (!date) {
    return "N/A";
  }

  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatMoney = (value) => {
  return `${Number(value || 0).toLocaleString("en-EG", {
    maximumFractionDigits: 2,
  })} EGP`;
};

const formatLabel = (value) => {
  if (!value) {
    return "N/A";
  }

  return String(value)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const getImageUrl = (image) => {
  if (!image) {
    return "";
  }

  if (
    image.startsWith("http://") ||
    image.startsWith("https://")
  ) {
    return image;
  }

  const cleanImage = image.startsWith("/")
    ? image
    : `/${image}`;

  return `${BACKEND_URL}${cleanImage}`;
};

const getOrderStatusClass = (status) => {
  switch (status) {
    case "pending":
      return "border-champagne-gold/30 bg-champagne-gold/10 text-antique-gold";

    case "confirmed":
      return "border-premium-silver/60 bg-silver-mist/80 text-midnight-navy";

    case "processing":
      return "border-light-champagne bg-soft-cream text-slate-gray";

    case "shipped":
      return "border-navy-soft/20 bg-silver-mist/80 text-navy-soft";

    case "delivered":
      return "border-classic-gold/30 bg-soft-cream text-antique-gold";

    case "cancelled":
      return "border-red-200 bg-red-50 text-red-700";

    default:
      return "border-light-champagne bg-warm-ivory text-slate-gray";
  }
};

const getPaymentStatusClass = (status) => {
  switch (status) {
    case "paid":
      return "border-classic-gold/30 bg-soft-cream text-antique-gold";

    case "failed":
      return "border-red-200 bg-red-50 text-red-700";

    default:
      return "border-champagne-gold/30 bg-champagne-gold/10 text-antique-gold";
  }
};

const getManufacturingStatusClass = (status) => {
  switch (status) {
    case "pending":
      return "border-champagne-gold/30 bg-champagne-gold/10 text-antique-gold";

    case "in_progress":
      return "border-navy-soft/20 bg-silver-mist/80 text-navy-soft";

    case "manufacturing":
      return "border-navy-soft/20 bg-silver-mist/80 text-navy-soft";

    case "completed":
      return "border-classic-gold/30 bg-soft-cream text-antique-gold";

    case "cancelled":
      return "border-red-200 bg-red-50 text-red-700";

    default:
      return "border-light-champagne bg-warm-ivory text-slate-gray";
  }
};

const getUnitStatusClass = (status) => {
  switch (status) {
    case "pending":
      return "border-light-champagne bg-warm-ivory text-slate-gray";

    case "assigned":
    case "unit_assigned":
      return "border-champagne-gold/30 bg-soft-cream text-antique-gold";

    case "experience_created":
      return "border-premium-silver/60 bg-silver-mist/80 text-midnight-navy";

    case "manufacturing":
    case "in_production":
      return "border-navy-soft/20 bg-silver-mist/80 text-navy-soft";

    case "ready":
    case "completed":
      return "border-classic-gold/30 bg-soft-cream text-antique-gold";

    default:
      return "border-light-champagne bg-warm-ivory text-slate-gray";
  }
};

const SectionTitle = ({
  eyebrow,
  title,
  description,
  action = null,
}) => {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        {eyebrow && (
          <div className="mb-2 flex items-center gap-3">
            <span className="h-px w-7 bg-classic-gold/60" />

            <p className="text-[8px] font-semibold uppercase tracking-[0.3em] text-antique-gold">
              {eyebrow}
            </p>
          </div>
        )}

        <h2 className="font-serif text-[1.45rem] font-normal tracking-[-0.02em] text-midnight-navy">
          {title}
        </h2>

        {description && (
          <p className="mt-2 max-w-xl text-[11px] leading-6 text-slate-gray">
            {description}
          </p>
        )}
      </div>

      {action}
    </div>
  );
};

const InfoRow = ({
  label,
  value,
  gold = false,
  noBreak = false,
}) => {
  const hasValue =
    value !== undefined &&
    value !== null &&
    value !== "";

  return (
    <div className="flex flex-col gap-1.5 border-b border-light-champagne/75 py-3 last:border-b-0">
      <span className="text-[8px] font-semibold uppercase tracking-[0.16em] text-steel-gray">
        {label}
      </span>

      <span
        className={`text-[11px] font-medium ${
          gold
            ? "text-antique-gold"
            : "text-midnight-navy"
        } ${noBreak ? "" : "break-all"}`}
      >
        {hasValue ? value : "N/A"}
      </span>
    </div>
  );
};

const SummaryCard = ({
  label,
  value,
  description,
  dark = false,
  children,
}) => {
  return (
    <div
      className={`relative overflow-hidden rounded-[20px] border p-5 shadow-[0_8px_25px_rgba(7,19,31,0.035)] ${
        dark
          ? "border-champagne-gold/15 bg-midnight-navy text-soft-white"
          : "border-light-champagne/90 bg-soft-white/85"
      }`}
    >
      {dark && (
        <>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-rich-navy via-midnight-navy to-luxury-black" />

          <div className="pointer-events-none absolute -right-14 -top-14 h-32 w-32 rounded-full bg-champagne-gold/10 blur-[45px]" />
        </>
      )}

      <div className="relative">
        <p
          className={`text-[7px] font-semibold uppercase tracking-[0.22em] ${
            dark
              ? "text-premium-silver/45"
              : "text-steel-gray"
          }`}
        >
          {label}
        </p>

        {value && (
          <p
            className={`mt-3 font-serif text-[1.55rem] font-normal ${
              dark
                ? "text-champagne-gold"
                : "text-midnight-navy"
            }`}
          >
            {value}
          </p>
        )}

        {children}

        {description && (
          <p
            className={`mt-2 text-[9px] ${
              dark
                ? "text-premium-silver/50"
                : "text-slate-gray"
            }`}
          >
            {description}
          </p>
        )}
      </div>
    </div>
  );
};

const AdminOrderDetailsPage = () => {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const [error, setError] = useState("");

  const [
    manufacturingOrder,
    setManufacturingOrder,
  ] = useState(null);

  const [
    isManufacturingLoading,
    setIsManufacturingLoading,
  ] = useState(true);

  const [
    isStartingManufacturing,
    setIsStartingManufacturing,
  ] = useState(false);

  const [
    manufacturingError,
    setManufacturingError,
  ] = useState("");

  useEffect(() => {
    const loadOrder = async () => {
      try {
        setIsLoading(true);
        setError("");

        const response =
          await getAdminOrderById(id);

        const orderData =
          response?.data ?? response;

        if (!orderData) {
          throw new Error(
            "Order not found",
          );
        }

        setOrder(orderData);

        setStatus(
          orderData.orderStatus ||
            "pending",
        );
      } catch (error) {
        console.error(
          "LOAD ORDER ERROR:",
          error,
        );

        setError(
          error?.response?.data
            ?.message ||
            error?.message ||
            "Unable to load order",
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      loadOrder();
    }
  }, [id]);

  useEffect(() => {
    const loadManufacturingOrder =
      async () => {
        try {
          setIsManufacturingLoading(
            true,
          );

          setManufacturingError("");

          const response =
            await getManufacturingOrders();

          const manufacturingOrders =
            response?.data ??
            response ??
            [];

          const foundOrder =
            Array.isArray(
              manufacturingOrders,
            )
              ? manufacturingOrders.find(
                  (item) => {
                    const orderId =
                      item.order?._id ||
                      item.order;

                    return (
                      orderId?.toString() ===
                      id?.toString()
                    );
                  },
                )
              : null;

          setManufacturingOrder(
            foundOrder || null,
          );
        } catch (error) {
          console.error(
            "LOAD MANUFACTURING ORDER ERROR:",
            error,
          );

          setManufacturingError(
            error?.response?.data
              ?.message ||
              error?.message ||
              "Unable to load manufacturing information",
          );
        } finally {
          setIsManufacturingLoading(
            false,
          );
        }
      };

    if (id) {
      loadManufacturingOrder();
    }
  }, [id]);

  const handleStatusUpdate = async () => {
    if (!id || !status) {
      return;
    }

    try {
      setIsUpdating(true);
      setError("");

      const response =
        await updateOrderStatus(
          id,
          status,
        );

      const updatedOrder =
        response?.data ?? response;

      if (updatedOrder) {
        setOrder(updatedOrder);

        setStatus(
          updatedOrder.orderStatus ||
            status,
        );
      }
    } catch (error) {
      console.error(
        "UPDATE ORDER STATUS ERROR:",
        error,
      );

      setError(
        error?.response?.data
          ?.message ||
          error?.message ||
          "Unable to update status",
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStartManufacturing =
    async () => {
      if (!id) {
        return;
      }

      try {
        setIsStartingManufacturing(
          true,
        );

        setManufacturingError("");

        let currentManufacturingOrder =
          manufacturingOrder;

        if (
          !currentManufacturingOrder
        ) {
          const createResponse =
            await createManufacturingOrder(
              id,
            );

          currentManufacturingOrder =
            createResponse?.data ??
            createResponse;

          setManufacturingOrder(
            currentManufacturingOrder,
          );
        }

        const manufacturingId =
          currentManufacturingOrder?._id;

        if (!manufacturingId) {
          throw new Error(
            "Manufacturing order ID was not found",
          );
        }

        const currentStatus =
          currentManufacturingOrder.status;

        if (
          currentStatus !==
            "in_progress" &&
          currentStatus !==
            "manufacturing" &&
          currentStatus !==
            "completed" &&
          currentStatus !==
            "cancelled"
        ) {
          const startResponse =
            await startManufacturing(
              manufacturingId,
            );

          const startedOrder =
            startResponse?.data ??
            startResponse;

          setManufacturingOrder(
            startedOrder,
          );
        }
      } catch (error) {
        console.error(
          "START MANUFACTURING ERROR:",
          error,
        );

        setManufacturingError(
          error?.response?.data
            ?.message ||
            error?.message ||
            "Unable to start manufacturing",
        );
      } finally {
        setIsStartingManufacturing(
          false,
        );
      }
    };

  const totalQuantity = useMemo(() => {
    return (
      order?.items?.reduce(
        (total, item) =>
          total +
          Number(
            item.quantity || 0,
          ),
        0,
      ) || 0
    );
  }, [order]);

  if (isLoading) {
    return (
      <div className="relative flex min-h-[500px] items-center justify-center overflow-hidden bg-warm-ivory">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-soft-cream blur-[100px]" />

        <div className="relative text-center">
          <div className="relative mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-champagne-gold/25 bg-midnight-navy shadow-[0_12px_30px_rgba(18,38,58,0.15)]">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-champagne-gold/20 border-t-champagne-gold" />

            <span className="absolute text-[6px] text-champagne-gold">
              ✦
            </span>
          </div>

          <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-slate-gray">
            Loading order...
          </p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="rounded-[24px] border border-light-champagne bg-soft-white p-10 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-midnight-navy text-xl text-champagne-gold">
          ✦
        </div>

        <p className="mt-5 text-sm text-red-600">
          {error ||
            "Order not found"}
        </p>

        <Link
          to="/admin/orders"
          className="mt-5 inline-flex rounded-full bg-midnight-navy px-5 py-2.5 text-sm font-medium text-soft-white transition hover:bg-rich-navy"
        >
          Back to Orders
        </Link>
      </div>
    );
  }

  const completedUnits =
    manufacturingOrder?.units?.filter(
      (unit) =>
        unit.status === "completed" ||
        unit.status === "ready",
    ).length || 0;

  const totalUnits =
    manufacturingOrder?.units?.length ||
    0;

  const productionProgress =
    totalUnits > 0
      ? Math.round(
          (completedUnits /
            totalUnits) *
            100,
        )
      : 0;

  const shippingAreaName =
    order.shippingAreaName ||
    order.shippingArea?.name ||
    order.shippingAddress?.city ||
    "N/A";

  const shippingAreaId =
    order.shippingArea?._id ||
    (typeof order.shippingArea ===
    "string"
      ? order.shippingArea
      : "");

  const shippingCost = Number(
    order.shippingCost || 0,
  );

  const subtotal = Number(
    order.subtotal || 0,
  );

  const orderTotal = Number(
    order.total || 0,
  );

  return (
    <div className="min-h-screen bg-warm-ivory">
      <div className="mb-8">
        <Link
          to="/admin/orders"
          className="group inline-flex items-center gap-2 text-[8px] font-semibold uppercase tracking-[0.16em] text-slate-gray transition hover:text-antique-gold"
        >
          <span className="transition-transform group-hover:-translate-x-1">
            ←
          </span>

          Back to Orders
        </Link>

        <div className="relative mt-5 overflow-hidden rounded-[28px] border border-champagne-gold/15 bg-midnight-navy px-7 py-8 shadow-[0_24px_65px_rgba(7,19,31,0.16)] sm:px-9">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-rich-navy via-midnight-navy to-luxury-black" />

          <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full border border-champagne-gold/10" />

          <div className="pointer-events-none absolute -bottom-28 -left-20 h-60 w-60 rounded-full bg-champagne-gold/[0.06] blur-[75px]" />

          <div className="relative flex flex-col justify-between gap-7 xl:flex-row xl:items-end">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <span className="h-px w-9 bg-classic-gold/70" />

                <span className="text-[8px] font-semibold uppercase tracking-[0.32em] text-champagne-gold">
                  Order Details
                </span>

                <span className="text-[7px] text-classic-gold">
                  ✦
                </span>
              </div>

              <h1 className="font-serif text-[2.25rem] font-normal tracking-[-0.035em] text-soft-white sm:text-[2.8rem]">
                #{order.orderNumber}
              </h1>

              <p className="mt-3 text-[11px] text-premium-silver/60">
                Placed on{" "}
                {formatDate(
                  order.createdAt,
                )}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <select
                value={status}
                onChange={(event) =>
                  setStatus(
                    event.target.value,
                  )
                }
                className="min-h-[48px] rounded-[13px] border border-soft-white/15 bg-soft-white/[0.06] px-4 text-[10px] font-medium capitalize text-soft-white outline-none backdrop-blur-sm"
              >
                {statuses.map(
                  (item) => (
                    <option
                      key={item}
                      value={item}
                      className="bg-midnight-navy text-soft-white"
                    >
                      {formatLabel(item)}
                    </option>
                  ),
                )}
              </select>

              <button
                type="button"
                onClick={
                  handleStatusUpdate
                }
                disabled={
                  isUpdating ||
                  status ===
                    order.orderStatus
                }
                className="min-h-[48px] rounded-[13px] bg-soft-white px-6 text-[8px] font-semibold uppercase tracking-[0.12em] text-midnight-navy transition hover:bg-warm-ivory disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isUpdating
                  ? "Updating..."
                  : "Update Status"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-[16px] border border-red-200 bg-red-50 px-5 py-4 text-[11px] text-red-700">
          {error}
        </div>
      )}

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <SummaryCard label="Order Status">
          <span
            className={`mt-3 inline-flex rounded-full border px-3 py-1.5 text-[8px] font-semibold uppercase tracking-[0.08em] ${getOrderStatusClass(
              order.orderStatus,
            )}`}
          >
            {formatLabel(
              order.orderStatus,
            )}
          </span>
        </SummaryCard>

        <SummaryCard label="Payment">
          <p className="mt-3 text-[11px] font-semibold text-midnight-navy">
            {formatLabel(
              order.paymentMethod,
            )}
          </p>

          <span
            className={`mt-2 inline-flex rounded-full border px-2.5 py-1.5 text-[7px] font-semibold uppercase tracking-[0.08em] ${getPaymentStatusClass(
              order.paymentStatus,
            )}`}
          >
            {formatLabel(
              order.paymentStatus,
            )}
          </span>
        </SummaryCard>

        <SummaryCard
          label="Items"
          value={String(
            totalQuantity,
          )}
          description="Total product quantity"
        />

        <SummaryCard
          label="Shipping"
          value={formatMoney(
            shippingCost,
          )}
          description={
            shippingAreaName
          }
        />

        <SummaryCard
          label="Order Total"
          value={formatMoney(
            orderTotal,
          )}
          dark
        />
      </div>

      <section className="mb-8 rounded-[24px] border border-light-champagne/90 bg-soft-white/85 p-6 shadow-[0_12px_38px_rgba(7,19,31,0.04)]">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
          <SectionTitle
            eyebrow="Production"
            title="Manufacturing"
            description="Manage production and smart unit preparation for this order."
          />

          {!manufacturingOrder ? (
            <button
              type="button"
              onClick={
                handleStartManufacturing
              }
              disabled={
                isStartingManufacturing ||
                order.orderStatus ===
                  "cancelled"
              }
              className="min-h-[44px] rounded-full bg-midnight-navy px-6 text-[8px] font-semibold uppercase tracking-[0.12em] text-soft-white transition hover:bg-rich-navy disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isStartingManufacturing
                ? "Starting..."
                : "Start Manufacturing"}
            </button>
          ) : manufacturingOrder.status ===
            "pending" ? (
            <button
              type="button"
              onClick={
                handleStartManufacturing
              }
              disabled={
                isStartingManufacturing
              }
              className="min-h-[44px] rounded-full bg-midnight-navy px-6 text-[8px] font-semibold uppercase tracking-[0.12em] text-soft-white transition hover:bg-rich-navy disabled:opacity-40"
            >
              {isStartingManufacturing
                ? "Starting..."
                : "Start Manufacturing"}
            </button>
          ) : null}
        </div>

        {manufacturingError && (
          <div className="mb-5 rounded-[14px] border border-red-200 bg-red-50 p-4 text-[11px] text-red-600">
            {manufacturingError}
          </div>
        )}

        {isManufacturingLoading ? (
          <div className="rounded-[16px] bg-warm-ivory p-6 text-center text-[10px] text-slate-gray">
            Loading manufacturing
            information...
          </div>
        ) : manufacturingOrder ? (
          <div>
            <div className="grid gap-4 md:grid-cols-4">
              <ManufacturingStat
                label="Status"
                content={
                  <span
                    className={`inline-flex rounded-full border px-3 py-1.5 text-[8px] font-semibold uppercase tracking-[0.06em] ${getManufacturingStatusClass(
                      manufacturingOrder.status,
                    )}`}
                  >
                    {formatLabel(
                      manufacturingOrder.status,
                    )}
                  </span>
                }
              />

              <ManufacturingStat
                label="Manufacturing No."
                content={
                  manufacturingOrder.orderNumber ||
                  "N/A"
                }
              />

              <ManufacturingStat
                label="Production Units"
                content={String(
                  totalUnits,
                )}
              />

              <ManufacturingStat
                label="Started At"
                content={formatDate(
                  manufacturingOrder.startedAt,
                )}
              />
            </div>

            <div className="relative mt-6 overflow-hidden rounded-[18px] bg-midnight-navy p-5">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-rich-navy via-midnight-navy to-luxury-black" />

              <div className="relative">
                <div className="flex items-center justify-between gap-5">
                  <div>
                    <p className="text-[7px] font-semibold uppercase tracking-[0.2em] text-premium-silver/45">
                      Production
                      Progress
                    </p>

                    <p className="mt-2 text-[10px] text-soft-white">
                      {completedUnits} of{" "}
                      {totalUnits} units
                      completed
                    </p>
                  </div>

                  <span className="font-serif text-[1.5rem] text-champagne-gold">
                    {
                      productionProgress
                    }
                    %
                  </span>
                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-soft-white/10">
                  <div
                    className="h-full rounded-full bg-champagne-gold transition-all duration-500"
                    style={{
                      width: `${productionProgress}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-8">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-serif text-[1.2rem] text-midnight-navy">
                  Production Units
                </h3>

                <span className="text-[9px] text-slate-gray">
                  {completedUnits} /{" "}
                  {totalUnits} completed
                </span>
              </div>

              <div className="space-y-4">
                {manufacturingOrder
                  .units?.length > 0 ? (
                  manufacturingOrder.units.map(
                    (
                      unit,
                      index,
                    ) => (
                      <div
                        key={
                          unit._id ||
                          index
                        }
                        className="rounded-[18px] border border-light-champagne bg-warm-ivory/60 p-5"
                      >
                        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                          <div>
                            <h4 className="font-serif text-[1rem] text-midnight-navy">
                              Production
                              Unit #
                              {unit.unitNumber ||
                                index +
                                  1}
                            </h4>

                            <p className="mt-1 break-all text-[8px] text-steel-gray">
                              Unit ID:{" "}
                              {unit._id ||
                                "N/A"}
                            </p>
                          </div>

                          <span
                            className={`inline-flex w-fit rounded-full border px-3 py-1.5 text-[7px] font-semibold uppercase tracking-[0.06em] ${getUnitStatusClass(
                              unit.status,
                            )}`}
                          >
                            {formatLabel(
                              unit.status,
                            )}
                          </span>
                        </div>

                        <div className="mt-5 grid gap-4 md:grid-cols-3">
                          <MiniInfoBox
                            label="Serial Number"
                            value={
                              unit.serialNumber ||
                              "Not assigned"
                            }
                          />

                          <MiniInfoBox
                            label="Smart Unit"
                            value={
                              unit
                                .smartUnit
                                ?.serialNumber ||
                              unit
                                .smartUnit
                                ?._id ||
                              (typeof unit.smartUnit ===
                              "string"
                                ? unit.smartUnit
                                : "Not assigned")
                            }
                          />

                          <MiniInfoBox
                            label="Experience"
                            value={
                              unit
                                .experience
                                ?.slug ||
                              unit
                                .experience
                                ?._id ||
                              (typeof unit.experience ===
                              "string"
                                ? unit.experience
                                : "Not created")
                            }
                          />
                        </div>

                        <div className="mt-4 grid gap-4 border-t border-light-champagne pt-4 md:grid-cols-2">
                          <InfoRow
                            label="Started"
                            value={formatDate(
                              unit.startedAt,
                            )}
                          />

                          <InfoRow
                            label="Completed"
                            value={formatDate(
                              unit.completedAt,
                            )}
                          />
                        </div>
                      </div>
                    ),
                  )
                ) : (
                  <div className="rounded-[16px] border border-dashed border-light-champagne bg-warm-ivory/60 p-8 text-center text-[10px] text-slate-gray">
                    No production units
                    found.
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-[18px] border border-dashed border-light-champagne bg-warm-ivory/60 p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-midnight-navy text-champagne-gold">
              ✦
            </div>

            <p className="mt-4 font-serif text-[1.15rem] text-midnight-navy">
              Manufacturing has not
              started yet.
            </p>

            <p className="mt-2 text-[10px] text-slate-gray">
              Start manufacturing to
              create the production
              order.
            </p>
          </div>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-[24px] border border-light-champagne/90 bg-soft-white/85 p-6 shadow-[0_12px_38px_rgba(7,19,31,0.04)] lg:col-span-2">
          <SectionTitle
            eyebrow="Products"
            title="Order Items"
            description="Product snapshots, selected variants, technology models and stored order pricing."
          />

          <div className="space-y-8">
            {order.items?.map(
              (item, index) => {
                const variant =
                  item.variant || null;

                const technology =
                  item.technologyModel ||
                  null;

                const productPrice =
                  Number(
                    item.price || 0,
                  );

                const variantPrice =
                  Number(
                    item.variantPrice ||
                      0,
                  );

                const technologyPrice =
                  Number(
                    item.technologyPrice ||
                      0,
                  );

                const unitPrice =
                  Number(
                    item.unitPrice || 0,
                  );

                const quantity =
                  Number(
                    item.quantity || 1,
                  );

                const calculatedItemTotal =
                  unitPrice *
                  quantity;

                const itemTotal =
                  Number(
                    item.itemTotal ??
                      calculatedItemTotal,
                  );

                const technologyModelName =
                  technology?.modelName ||
                  technology?.name ||
                  "No Technology Model Selected";

                return (
                  <div
                    key={
                      item._id ||
                      index
                    }
                    className="border-b border-light-champagne pb-8 last:border-b-0 last:pb-0"
                  >
                    <div className="flex flex-col gap-5 sm:flex-row">
                      <div className="h-28 w-28 shrink-0 overflow-hidden rounded-[18px] border border-light-champagne bg-soft-cream">
                        {item.image ? (
                          <img
                            src={getImageUrl(
                              item.image,
                            )}
                            alt={
                              item.name ||
                              "Product"
                            }
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-[8px] uppercase tracking-[0.12em] text-steel-gray">
                            No Image
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-antique-gold">
                          Product
                        </p>

                        <h3 className="mt-1 font-serif text-[1.45rem] text-midnight-navy">
                          {item.name ||
                            "Unnamed Product"}
                        </h3>

                        <div className="mt-4 flex flex-wrap gap-2">
                          <span className="rounded-full bg-midnight-navy px-3 py-1.5 text-[8px] text-soft-white">
                            Qty:{" "}
                            {quantity}
                          </span>

                          <span className="rounded-full border border-champagne-gold/20 bg-soft-cream px-3 py-1.5 text-[8px] text-antique-gold">
                            Stored Base:{" "}
                            {formatMoney(
                              productPrice,
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="sm:text-right">
                        <p className="text-[7px] font-semibold uppercase tracking-[0.2em] text-steel-gray">
                          Item Total
                        </p>

                        <p className="mt-2 font-serif text-[1.35rem] text-midnight-navy">
                          {formatMoney(
                            itemTotal,
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 rounded-[18px] border border-light-champagne bg-warm-ivory/60 p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[7px] font-semibold uppercase tracking-[0.2em] text-antique-gold">
                            Selected Option
                          </p>

                          <h4 className="mt-1 font-serif text-[1.05rem] text-midnight-navy">
                            Variant
                            Details
                          </h4>
                        </div>

                        <span className="text-classic-gold">
                          ✦
                        </span>
                      </div>

                      {variant ? (
                        <div className="mt-4 grid gap-x-6 md:grid-cols-2">
                          <InfoRow
                            label="Variant Name"
                            value={
                              variant.name
                            }
                          />

                          <InfoRow
                            label="Color"
                            value={
                              variant.color
                            }
                          />

                          <InfoRow
                            label="Size"
                            value={
                              variant.size
                            }
                          />

                          <InfoRow
                            label="Material"
                            value={
                              variant.material
                            }
                          />

                          <InfoRow
                            label="Finish"
                            value={
                              variant.finish
                            }
                          />

                          <InfoRow
                            label="SKU"
                            value={
                              variant.sku
                            }
                          />

                          <InfoRow
                            label="Stored Variant Price"
                            value={formatMoney(
                              variantPrice,
                            )}
                            gold
                          />

                          {variant.image && (
                            <div className="mt-3 md:col-span-2">
                              <p className="mb-2 text-[8px] font-semibold uppercase tracking-[0.15em] text-steel-gray">
                                Variant
                                Image
                              </p>

                              <img
                                src={getImageUrl(
                                  variant.image,
                                )}
                                alt={
                                  variant.name ||
                                  "Variant"
                                }
                                className="h-28 w-28 rounded-[14px] object-cover"
                              />
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="mt-4 text-[10px] text-slate-gray">
                          No variant
                          selected.
                        </p>
                      )}
                    </div>

                    <div className="relative mt-4 overflow-hidden rounded-[18px] border border-champagne-gold/15 bg-midnight-navy p-5 text-soft-white">
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-rich-navy via-midnight-navy to-luxury-black" />

                      <div className="pointer-events-none absolute -right-14 -top-14 h-32 w-32 rounded-full bg-champagne-gold/10 blur-[45px]" />

                      <div className="relative">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[7px] font-semibold uppercase tracking-[0.2em] text-champagne-gold">
                              Selected
                              Technology
                            </p>

                            <h4 className="mt-1 font-serif text-[1.15rem] text-soft-white">
                              {
                                technologyModelName
                              }
                            </h4>
                          </div>

                          <span className="text-champagne-gold">
                            ✦
                          </span>
                        </div>

                        {technology ? (
                          <>
                            <div className="mt-5 grid gap-x-6 md:grid-cols-2">
                              <DarkInfoRow
                                label="Technology Model"
                                value={
                                  technology.modelName ||
                                  technology.name
                                }
                              />

                              <DarkInfoRow
                                label="Technology"
                                value={
                                  technology
                                    .technology
                                    ?.name
                                }
                              />

                              <DarkInfoRow
                                label="Model Code"
                                value={
                                  technology.modelCode
                                }
                              />

                              <DarkInfoRow
                                label="Technology Code"
                                value={
                                  technology
                                    .technology
                                    ?.code
                                }
                              />

                              <DarkInfoRow
                                label="Stored Technology Price"
                                value={formatMoney(
                                  technologyPrice,
                                )}
                                gold
                              />

                              <DarkInfoRow
                                label="Status"
                                value={formatLabel(
                                  technology.status,
                                )}
                              />
                            </div>

                            {technology.description && (
                              <div className="mt-4 border-t border-soft-white/10 pt-4">
                                <p className="text-[7px] font-semibold uppercase tracking-[0.15em] text-premium-silver/45">
                                  Description
                                </p>

                                <p className="mt-2 text-[10px] leading-6 text-premium-silver/70">
                                  {
                                    technology.description
                                  }
                                </p>
                              </div>
                            )}
                          </>
                        ) : (
                          <p className="mt-4 rounded-[12px] border border-soft-white/10 bg-soft-white/[0.04] p-4 text-[10px] text-premium-silver/55">
                            No technology
                            model selected
                            for this
                            product.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 rounded-[18px] border border-light-champagne bg-soft-white p-5">
                      <div className="flex items-center justify-between">
                        <h4 className="font-serif text-[1.05rem] text-midnight-navy">
                          Stored Price
                          Breakdown
                        </h4>

                        <span className="text-classic-gold">
                          ✦
                        </span>
                      </div>

                      <div className="mt-4 space-y-3 text-[10px]">
                        <PriceRow
                          label="Product Base Price"
                          value={formatMoney(
                            productPrice,
                          )}
                        />

                        <PriceRow
                          label="Variant Snapshot"
                          value={formatMoney(
                            variantPrice,
                          )}
                        />

                        <PriceRow
                          label="Technology Snapshot"
                          value={formatMoney(
                            technologyPrice,
                          )}
                        />

                        <PriceRow
                          label="Final Unit Price"
                          value={formatMoney(
                            unitPrice,
                          )}
                          highlight
                        />

                        <PriceRow
                          label="Quantity"
                          value={`× ${quantity}`}
                        />

                        <div className="h-px bg-light-champagne" />

                        <PriceRow
                          label="Item Total"
                          value={formatMoney(
                            itemTotal,
                          )}
                          strong
                        />
                      </div>
                    </div>
                  </div>
                );
              },
            )}
          </div>

          <div className="ml-auto mt-8 max-w-md">
            <div className="relative overflow-hidden rounded-[22px] border border-champagne-gold/15 bg-midnight-navy p-6 text-soft-white">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-rich-navy via-midnight-navy to-luxury-black" />

              <div className="pointer-events-none absolute -right-20 -top-20 h-44 w-44 rounded-full bg-champagne-gold/10 blur-[55px]" />

              <div className="relative">
                <div className="mb-5 flex items-center gap-3">
                  <span className="h-px flex-1 bg-soft-white/10" />

                  <span className="text-[7px] font-semibold uppercase tracking-[0.24em] text-champagne-gold">
                    Order Financial
                    Snapshot
                  </span>

                  <span className="h-px flex-1 bg-soft-white/10" />
                </div>

                <div className="space-y-4">
                  <FinancialRow
                    label="Products Subtotal"
                    value={formatMoney(
                      subtotal,
                    )}
                  />

                  <FinancialRow
                    label="Shipping Area"
                    value={
                      shippingAreaName
                    }
                    gold
                  />

                  <FinancialRow
                    label="Shipping Fee"
                    value={formatMoney(
                      shippingCost,
                    )}
                  />

                  <FinancialRow
                    label="Payment Method"
                    value={formatLabel(
                      order.paymentMethod,
                    )}
                  />

                  <FinancialRow
                    label="Payment Status"
                    value={formatLabel(
                      order.paymentStatus,
                    )}
                    gold={
                      order.paymentStatus ===
                      "paid"
                    }
                  />

                  <div className="h-px bg-soft-white/10" />

                  <div className="flex items-end justify-between gap-4">
                    <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-soft-white">
                      Order Total
                    </span>

                    <span className="font-serif text-[1.8rem] text-champagne-gold">
                      {formatMoney(
                        orderTotal,
                      )}
                    </span>
                  </div>
                </div>

                <div className="mt-5 rounded-[12px] border border-soft-white/10 bg-soft-white/[0.04] px-4 py-3">
                  <p className="text-[8px] leading-5 text-premium-silver/45">
                    These amounts are
                    stored with the
                    order and represent
                    the pricing at the
                    time the customer
                    placed it.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="space-y-6">
          <SidebarSection
            eyebrow="Customer"
            title="Customer Information"
          >
            <InfoRow
              label="Customer Name"
              value={[
                order
                  .shippingAddress
                  ?.firstName,
                order
                  .shippingAddress
                  ?.lastName,
              ]
                .filter(Boolean)
                .join(" ")}
              noBreak
            />

            <InfoRow
              label="Email"
              value={
                order.user?.email ||
                "Unknown"
              }
            />

            <InfoRow
              label="User ID"
              value={
                order.user?._id ||
                (typeof order.user ===
                "string"
                  ? order.user
                  : "")
              }
            />

            <InfoRow
              label="Phone"
              value={
                order
                  .shippingAddress
                  ?.phone
              }
            />
          </SidebarSection>

          <SidebarSection
            eyebrow="Delivery"
            title="Shipping Details"
          >
            <div className="mb-4 rounded-[16px] border border-champagne-gold/20 bg-soft-cream/70 p-4">
              <p className="text-[7px] font-semibold uppercase tracking-[0.18em] text-antique-gold">
                Selected Shipping
                Area
              </p>

              <div className="mt-2 flex items-end justify-between gap-4">
                <p className="font-serif text-[1.25rem] text-midnight-navy">
                  {shippingAreaName}
                </p>

                <p className="text-[11px] font-semibold text-antique-gold">
                  {formatMoney(
                    shippingCost,
                  )}
                </p>
              </div>
            </div>

            <InfoRow
              label="Shipping Area Snapshot"
              value={shippingAreaName}
              gold
              noBreak
            />

            {shippingAreaId && (
              <InfoRow
                label="Shipping Area ID"
                value={
                  shippingAreaId
                }
              />
            )}

            <InfoRow
              label="Shipping Fee Snapshot"
              value={formatMoney(
                shippingCost,
              )}
              gold
              noBreak
            />

            <InfoRow
              label="Recipient"
              value={[
                order
                  .shippingAddress
                  ?.firstName,
                order
                  .shippingAddress
                  ?.lastName,
              ]
                .filter(Boolean)
                .join(" ")}
              noBreak
            />

            <InfoRow
              label="Phone"
              value={
                order
                  .shippingAddress
                  ?.phone
              }
            />

            <InfoRow
              label="Address"
              value={
                order
                  .shippingAddress
                  ?.address
              }
              noBreak
            />

            <InfoRow
              label="City / Area"
              value={
                order
                  .shippingAddress
                  ?.city
              }
              noBreak
            />

            <InfoRow
              label="Country"
              value={
                order
                  .shippingAddress
                  ?.country
              }
              noBreak
            />
          </SidebarSection>

          <SidebarSection
            eyebrow="Payment"
            title="Payment Details"
          >
            <InfoRow
              label="Method"
              value={formatLabel(
                order.paymentMethod,
              )}
              noBreak
            />

            <div className="border-b border-light-champagne/75 py-3">
              <p className="text-[8px] font-semibold uppercase tracking-[0.16em] text-steel-gray">
                Payment Status
              </p>

              <span
                className={`mt-2 inline-flex rounded-full border px-3 py-1.5 text-[7px] font-semibold uppercase tracking-[0.08em] ${getPaymentStatusClass(
                  order.paymentStatus,
                )}`}
              >
                {formatLabel(
                  order.paymentStatus,
                )}
              </span>
            </div>

            <InfoRow
              label="Subtotal"
              value={formatMoney(
                subtotal,
              )}
              noBreak
            />

            <InfoRow
              label="Shipping"
              value={formatMoney(
                shippingCost,
              )}
              noBreak
            />

            <InfoRow
              label="Total"
              value={formatMoney(
                orderTotal,
              )}
              gold
              noBreak
            />
          </SidebarSection>

          <SidebarSection
            eyebrow="Tracking"
            title="Order Status"
          >
            <span
              className={`inline-flex rounded-full border px-4 py-2 text-[8px] font-semibold uppercase tracking-[0.08em] ${getOrderStatusClass(
                order.orderStatus,
              )}`}
            >
              {formatLabel(
                order.orderStatus,
              )}
            </span>
          </SidebarSection>

          <SidebarSection
            eyebrow="Information"
            title="Order Information"
          >
            <InfoRow
              label="Order Number"
              value={
                order.orderNumber
              }
            />

            <InfoRow
              label="Created"
              value={formatDate(
                order.createdAt,
              )}
              noBreak
            />

            <InfoRow
              label="Updated"
              value={formatDate(
                order.updatedAt,
              )}
              noBreak
            />

            <InfoRow
              label="Order ID"
              value={order._id}
            />
          </SidebarSection>
        </div>
      </div>
    </div>
  );
};

const ManufacturingStat = ({
  label,
  content,
}) => {
  return (
    <div className="rounded-[16px] border border-light-champagne bg-warm-ivory/60 p-4">
      <p className="text-[7px] font-semibold uppercase tracking-[0.16em] text-steel-gray">
        {label}
      </p>

      <div className="mt-3 text-[10px] font-semibold text-midnight-navy">
        {content}
      </div>
    </div>
  );
};

const MiniInfoBox = ({
  label,
  value,
}) => {
  return (
    <div className="rounded-[14px] border border-light-champagne/70 bg-soft-white/80 p-4">
      <p className="text-[7px] font-semibold uppercase tracking-[0.15em] text-steel-gray">
        {label}
      </p>

      <p className="mt-2 break-all text-[10px] font-medium text-midnight-navy">
        {value || "N/A"}
      </p>
    </div>
  );
};

const DarkInfoRow = ({
  label,
  value,
  gold = false,
}) => {
  const hasValue =
    value !== undefined &&
    value !== null &&
    value !== "";

  return (
    <div className="border-b border-soft-white/10 py-3 last:border-b-0">
      <p className="text-[7px] font-semibold uppercase tracking-[0.15em] text-premium-silver/40">
        {label}
      </p>

      <p
        className={`mt-1.5 break-all text-[10px] font-medium ${
          gold
            ? "text-champagne-gold"
            : "text-soft-white"
        }`}
      >
        {hasValue ? value : "N/A"}
      </p>
    </div>
  );
};

const PriceRow = ({
  label,
  value,
  highlight = false,
  strong = false,
}) => {
  return (
    <div className="flex items-center justify-between gap-4">
      <span
        className={
          strong
            ? "font-semibold text-midnight-navy"
            : "text-slate-gray"
        }
      >
        {label}
      </span>

      <span
        className={`text-right ${
          strong
            ? "font-serif text-[1.1rem] text-midnight-navy"
            : highlight
              ? "font-semibold text-antique-gold"
              : "font-medium text-midnight-navy"
        }`}
      >
        {value}
      </span>
    </div>
  );
};

const FinancialRow = ({
  label,
  value,
  gold = false,
}) => {
  return (
    <div className="flex items-start justify-between gap-5 text-[10px]">
      <span className="text-premium-silver/50">
        {label}
      </span>

      <span
        className={`max-w-[220px] text-right font-semibold ${
          gold
            ? "text-champagne-gold"
            : "text-soft-white"
        }`}
      >
        {value}
      </span>
    </div>
  );
};

const SidebarSection = ({
  eyebrow,
  title,
  children,
}) => {
  return (
    <section className="relative overflow-hidden rounded-[22px] border border-light-champagne/90 bg-soft-white/85 p-6 shadow-[0_10px_30px_rgba(7,19,31,0.035)]">
      <div className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full bg-soft-cream blur-[55px]" />

      <div className="relative">
        <SectionTitle
          eyebrow={eyebrow}
          title={title}
        />

        {children}
      </div>
    </section>
  );
};

export default AdminOrderDetailsPage;