import { useEffect, useState } from "react";
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

// ==========================================
// COLORS
// ==========================================

const colors = {
  dark: "#302820",
  darkLight: "#3B3026",
  gold: "#C5A66B",
  goldLight: "#DCC18F",
  cream: "#F8F5F0",
  warmWhite: "#F8F4ED",
  muted: "#9F9385",
  border: "#4A3D31",
};

// ==========================================
// ORDER STATUSES
// ==========================================

const statuses = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

// ==========================================
// HELPERS
// ==========================================

const formatDate = (date) => {
  if (!date) return "N/A";

  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatMoney = (value) => {
  const number = Number(value || 0);
  return `${number.toLocaleString()} EGP`;
};

const getImageUrl = (image) => {
  if (!image) return "";

  if (
    image.startsWith("http://") ||
    image.startsWith("https://")
  ) {
    return image;
  }

  return `http://localhost:5000/api${
    image.startsWith("/") ? image : `/${image}`
  }`;
};


const getOrderStatusClass = (orderStatus) => {
  switch (orderStatus) {
    case "pending":
      return "bg-[#C5A66B]/15 text-[#9A7738] border-[#C5A66B]/30";

    case "confirmed":
      return "bg-[#3B3026]/10 text-[#5B4A3B] border-[#3B3026]/20";

    case "processing":
      return "bg-[#8B7355]/15 text-[#735C43] border-[#8B7355]/25";

    case "shipped":
      return "bg-[#DCC18F]/20 text-[#80683F] border-[#DCC18F]/30";

    case "delivered":
      return "bg-green-50 text-green-700 border-green-200";

    case "cancelled":
      return "bg-red-50 text-red-700 border-red-200";

    default:
      return "bg-[#F8F5F0] text-[#6F6255] border-[#E5DDD2]";
  }
};

const getManufacturingStatusClass = (status) => {
  switch (status) {
    case "pending":
      return "bg-[#C5A66B]/15 text-[#9A7738] border-[#C5A66B]/30";

    case "in_progress":
      return "bg-[#3B3026]/10 text-[#5B4A3B] border-[#3B3026]/20";

    case "completed":
      return "bg-green-50 text-green-700 border-green-200";

    case "cancelled":
      return "bg-red-50 text-red-700 border-red-200";

    default:
      return "bg-[#F8F5F0] text-[#6F6255] border-[#E5DDD2]";
  }
};

const getUnitStatusClass = (status) => {
  switch (status) {
    case "pending":
      return "bg-[#F8F5F0] text-[#6F6255] border-[#E5DDD2]";

    case "unit_assigned":
      return "bg-[#DCC18F]/20 text-[#80683F] border-[#DCC18F]/30";

    case "experience_created":
      return "bg-[#3B3026]/10 text-[#5B4A3B] border-[#3B3026]/20";

    case "in_production":
      return "bg-[#C5A66B]/15 text-[#9A7738] border-[#C5A66B]/30";

    case "completed":
      return "bg-green-50 text-green-700 border-green-200";

    default:
      return "bg-[#F8F5F0] text-[#6F6255] border-[#E5DDD2]";
  }
};

// ==========================================
// SECTION TITLE
// ==========================================

const SectionTitle = ({
  eyebrow,
  title,
  description,
}) => {
  return (
    <div className="mb-6">
      {eyebrow && (
        <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.3em] text-[#B08D57]">
          {eyebrow}
        </p>
      )}

      <h2 className="text-xl font-medium tracking-tight text-[#302820]">
        {title}
      </h2>

      {description && (
        <p className="mt-1 text-sm text-[#9F9385]">
          {description}
        </p>
      )}
    </div>
  );
};

// ==========================================
// INFO ROW
// ==========================================

const InfoRow = ({ label, value }) => {
  return (
    <div className="flex flex-col gap-1 border-b border-[#E8E0D6] py-3 last:border-b-0">
      <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#9F9385]">
        {label}
      </span>

      <span className="break-all text-sm text-[#4B4036]">
        {value !== undefined &&
        value !== null &&
        value !== ""
          ? value
          : "N/A"}
      </span>
    </div>
  );
};

// ==========================================
// ADMIN ORDER DETAILS PAGE
// ==========================================

const AdminOrderDetailsPage = () => {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const [error, setError] = useState("");

  const [manufacturingOrder, setManufacturingOrder] =
    useState(null);

  const [
    isManufacturingLoading,
    setIsManufacturingLoading,
  ] = useState(true);

  const [
    isStartingManufacturing,
    setIsStartingManufacturing,
  ] = useState(false);

  const [manufacturingError, setManufacturingError] =
    useState("");

  // ==========================================
  // LOAD ORDER
  // ==========================================

  useEffect(() => {
    const loadOrder = async () => {
      try {
        setIsLoading(true);
        setError("");

        const response = await getAdminOrderById(id);

        const orderData = response?.data ?? response;

        if (!orderData) {
          throw new Error("Order not found");
        }

        setOrder(orderData);
        setStatus(orderData.orderStatus || "pending");
      } catch (error) {
        console.error("LOAD ORDER ERROR:", error);

        setError(
          error?.response?.data?.message ||
            error?.message ||
            "Unable to load order"
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      loadOrder();
    }
  }, [id]);

  // ==========================================
  // LOAD MANUFACTURING
  // ==========================================

  useEffect(() => {
    const loadManufacturingOrder = async () => {
      try {
        setIsManufacturingLoading(true);
        setManufacturingError("");

        const response = await getManufacturingOrders();

        const manufacturingOrders =
          response?.data ?? response ?? [];

        const foundOrder = Array.isArray(
          manufacturingOrders
        )
          ? manufacturingOrders.find((item) => {
              const manufacturingOrderId =
                item.order?._id || item.order;

              return (
                manufacturingOrderId?.toString() ===
                id?.toString()
              );
            })
          : null;

        setManufacturingOrder(foundOrder || null);
      } catch (error) {
        console.error(
          "LOAD MANUFACTURING ORDER ERROR:",
          error
        );

        setManufacturingError(
          error?.response?.data?.message ||
            error?.message ||
            "Unable to load manufacturing information"
        );
      } finally {
        setIsManufacturingLoading(false);
      }
    };

    if (id) {
      loadManufacturingOrder();
    }
  }, [id]);

  // ==========================================
  // UPDATE ORDER STATUS
  // ==========================================

  const handleStatusUpdate = async () => {
    if (!id || !status) return;

    try {
      setIsUpdating(true);
      setError("");

      const response = await updateOrderStatus(
        id,
        status
      );

      const updatedOrder =
        response?.data ?? response;

      if (updatedOrder) {
        setOrder(updatedOrder);
        setStatus(
          updatedOrder.orderStatus || status
        );
      }
    } catch (error) {
      console.error(
        "UPDATE ORDER STATUS ERROR:",
        error
      );

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to update status"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  // ==========================================
  // START MANUFACTURING
  // ==========================================

  const handleStartManufacturing = async () => {
    if (!id) return;

    try {
      setIsStartingManufacturing(true);
      setManufacturingError("");

      let currentManufacturingOrder =
        manufacturingOrder;

      if (!currentManufacturingOrder) {
        const createResponse =
          await createManufacturingOrder(id);

        currentManufacturingOrder =
          createResponse?.data ?? createResponse;

        setManufacturingOrder(
          currentManufacturingOrder
        );
      }

      const manufacturingId =
        currentManufacturingOrder?._id;

      if (!manufacturingId) {
        throw new Error(
          "Manufacturing order ID was not found"
        );
      }

      if (
        currentManufacturingOrder.status !==
          "in_progress" &&
        currentManufacturingOrder.status !==
          "completed" &&
        currentManufacturingOrder.status !==
          "cancelled"
      ) {
        const startResponse =
          await startManufacturing(
            manufacturingId
          );

        const startedOrder =
          startResponse?.data ?? startResponse;

        setManufacturingOrder(startedOrder);
      }
    } catch (error) {
      console.error(
        "START MANUFACTURING ERROR:",
        error
      );

      setManufacturingError(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to start manufacturing"
      );
    } finally {
      setIsStartingManufacturing(false);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (isLoading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center bg-[#F8F5F0]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-[#E5DDD2] border-t-[#C5A66B]" />

          <p className="text-sm text-[#9F9385]">
            Loading order...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // NOT FOUND
  // ==========================================

  if (!order) {
    return (
      <div className="rounded-2xl border border-[#E5DDD2] bg-[#F8F4ED] p-10 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#3B3026] text-xl text-[#DCC18F]">
          ✦
        </div>

        <p className="mt-5 text-sm text-red-600">
          {error || "Order not found"}
        </p>

        <Link
          to="/admin/orders"
          className="mt-5 inline-flex rounded-full bg-[#302820] px-5 py-2.5 text-sm font-medium text-[#F8F4ED] transition hover:bg-[#3B3026]"
        >
          Back to Orders
        </Link>
      </div>
    );
  }

  const completedUnits =
    manufacturingOrder?.units?.filter(
      (unit) => unit.status === "completed"
    ).length || 0;

  const totalUnits =
    manufacturingOrder?.units?.length || 0;

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <div className="min-h-screen bg-[#F8F5F0]">

      {/* ======================================
          TOP HEADER
      ====================================== */}

      <div className="mb-8">
        <Link
          to="/admin/orders"
          className="inline-flex items-center gap-2 text-xs font-medium text-[#9F9385] transition hover:text-[#302820]"
        >
          ← Back to Orders
        </Link>

        <div className="mt-5 flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <span className="text-[9px] font-semibold uppercase tracking-[0.3em] text-[#B08D57]">
                Order Details
              </span>

              <span className="h-px w-10 bg-[#C5A66B]" />
            </div>

            <h1 className="text-3xl font-medium tracking-tight text-[#302820]">
              #{order.orderNumber}
            </h1>

            <p className="mt-2 text-sm text-[#9F9385]">
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <select
              value={status}
              onChange={(event) =>
                setStatus(event.target.value)
              }
              className="rounded-xl border border-[#D9D0C5] bg-[#F8F4ED] px-4 py-3 text-sm text-[#4B4036] outline-none transition focus:border-[#C5A66B] focus:ring-1 focus:ring-[#C5A66B]"
            >
              {statuses.map((item) => (
                <option key={item} value={item}>
                  {item.replaceAll("_", " ")}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleStatusUpdate}
              disabled={
                isUpdating ||
                status === order.orderStatus
              }
              className="rounded-xl bg-[#302820] px-6 py-3 text-sm font-medium text-[#F8F4ED] transition hover:bg-[#3B3026] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isUpdating
                ? "Updating..."
                : "Update Status"}
            </button>
          </div>
        </div>
      </div>

      {/* ERROR */}

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ======================================
          ORDER SUMMARY
      ====================================== */}

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <div className="rounded-2xl border border-[#E5DDD2] bg-[#F8F4ED] p-5">
          <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#9F9385]">
            Order Status
          </p>

          <span
            className={`mt-3 inline-flex rounded-full border px-3 py-1.5 text-xs font-medium capitalize ${getOrderStatusClass(
              order.orderStatus
            )}`}
          >
            {order.orderStatus || "pending"}
          </span>
        </div>

        <div className="rounded-2xl border border-[#E5DDD2] bg-[#F8F4ED] p-5">
          <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#9F9385]">
            Payment
          </p>

          <p className="mt-3 text-sm font-medium capitalize text-[#4B4036]">
            {order.paymentMethod
              ? order.paymentMethod.replaceAll(
                  "_",
                  " "
                )
              : "N/A"}
          </p>

          <span className="mt-2 inline-flex rounded-full bg-[#C5A66B]/15 px-2.5 py-1 text-xs text-[#8B6B35]">
            {order.paymentStatus || "N/A"}
          </span>
        </div>

        <div className="rounded-2xl border border-[#E5DDD2] bg-[#F8F4ED] p-5">
          <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#9F9385]">
            Items
          </p>

          <p className="mt-3 text-2xl font-medium text-[#302820]">
            {order.items?.length || 0}
          </p>

          <p className="mt-1 text-xs text-[#9F9385]">
            Products in this order
          </p>
        </div>

        <div className="rounded-2xl border border-[#E5DDD2] bg-[#302820] p-5">
          <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#9F9385]">
            Order Total
          </p>

          <p className="mt-3 text-2xl font-medium text-[#DCC18F]">
            {formatMoney(order.total)}
          </p>
        </div>
      </div>

      {/* ======================================
          MANUFACTURING
      ====================================== */}

      <section className="mb-8 rounded-2xl border border-[#E5DDD2] bg-[#F8F4ED] p-6 shadow-sm">

        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">

          <SectionTitle
            eyebrow="Production"
            title="Manufacturing"
            description="Manage production and smart unit preparation for this order."
          />

          <div>
            {!manufacturingOrder && (
              <button
                type="button"
                onClick={handleStartManufacturing}
                disabled={
                  isStartingManufacturing ||
                  order.orderStatus ===
                    "cancelled"
                }
                className="rounded-full bg-[#302820] px-6 py-3 text-sm font-medium text-[#F8F4ED] transition hover:bg-[#3B3026] disabled:opacity-50"
              >
                {isStartingManufacturing
                  ? "Starting..."
                  : "Start Manufacturing"}
              </button>
            )}

            {manufacturingOrder &&
              manufacturingOrder.status ===
                "pending" && (
                <button
                  type="button"
                  onClick={
                    handleStartManufacturing
                  }
                  disabled={
                    isStartingManufacturing
                  }
                  className="rounded-full bg-[#302820] px-6 py-3 text-sm font-medium text-[#F8F4ED] transition hover:bg-[#3B3026] disabled:opacity-50"
                >
                  {isStartingManufacturing
                    ? "Starting..."
                    : "Start Manufacturing"}
                </button>
              )}
          </div>
        </div>

        {manufacturingError && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {manufacturingError}
          </div>
        )}

        {isManufacturingLoading ? (
          <div className="rounded-xl bg-[#F8F5F0] p-6 text-center text-sm text-[#9F9385]">
            Loading manufacturing information...
          </div>
        ) : manufacturingOrder ? (
          <div>

            <div className="grid gap-4 md:grid-cols-4">

              <div className="rounded-xl border border-[#E5DDD2] bg-[#F8F5F0] p-4">
                <p className="text-[10px] uppercase tracking-[0.15em] text-[#9F9385]">
                  Status
                </p>

                <span
                  className={`mt-3 inline-flex rounded-full border px-3 py-1.5 text-xs capitalize ${getManufacturingStatusClass(
                    manufacturingOrder.status
                  )}`}
                >
                  {manufacturingOrder.status?.replaceAll(
                    "_",
                    " "
                  )}
                </span>
              </div>

              <div className="rounded-xl border border-[#E5DDD2] bg-[#F8F5F0] p-4">
                <p className="text-[10px] uppercase tracking-[0.15em] text-[#9F9385]">
                  Manufacturing No.
                </p>

                <p className="mt-3 font-semibold text-[#302820]">
                  {manufacturingOrder.orderNumber}
                </p>
              </div>

              <div className="rounded-xl border border-[#E5DDD2] bg-[#F8F5F0] p-4">
                <p className="text-[10px] uppercase tracking-[0.15em] text-[#9F9385]">
                  Production Units
                </p>

                <p className="mt-3 text-xl font-semibold text-[#302820]">
                  {totalUnits}
                </p>
              </div>

              <div className="rounded-xl border border-[#E5DDD2] bg-[#F8F5F0] p-4">
                <p className="text-[10px] uppercase tracking-[0.15em] text-[#9F9385]">
                  Started At
                </p>

                <p className="mt-3 text-sm font-medium text-[#4B4036]">
                  {formatDate(
                    manufacturingOrder.startedAt
                  )}
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-xl bg-[#302820] p-5">

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-[#9F9385]">
                    Production Progress
                  </p>

                  <p className="mt-1 text-sm text-[#F8F4ED]">
                    {completedUnits} of{" "}
                    {totalUnits} units completed
                  </p>
                </div>

                <span className="text-lg font-medium text-[#DCC18F]">
                  {totalUnits
                    ? Math.round(
                        (completedUnits /
                          totalUnits) *
                          100
                      )
                    : 0}
                  %
                </span>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#4A3D31]">
                <div
                  className="h-full rounded-full bg-[#C5A66B] transition-all"
                  style={{
                    width: `${
                      totalUnits
                        ? (completedUnits /
                            totalUnits) *
                          100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            <div className="mt-8">

              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-medium text-[#302820]">
                  Production Units
                </h3>

                <span className="text-xs text-[#9F9385]">
                  {completedUnits} / {totalUnits}{" "}
                  completed
                </span>
              </div>

              <div className="space-y-4">

                {manufacturingOrder.units?.length >
                0 ? (
                  manufacturingOrder.units.map(
                    (unit, index) => (
                      <div
                        key={
                          unit._id || index
                        }
                        className="rounded-xl border border-[#E5DDD2] bg-[#F8F5F0] p-5"
                      >

                        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">

                          <div>
                            <h4 className="font-medium text-[#302820]">
                              Production Unit #
                              {unit.unitNumber ||
                                index + 1}
                            </h4>

                            <p className="mt-1 break-all text-xs text-[#9F9385]">
                              Unit ID:{" "}
                              {unit._id || "N/A"}
                            </p>
                          </div>

                          <span
                            className={`inline-flex w-fit rounded-full border px-3 py-1.5 text-xs capitalize ${getUnitStatusClass(
                              unit.status
                            )}`}
                          >
                            {unit.status?.replaceAll(
                              "_",
                              " "
                            )}
                          </span>
                        </div>

                        <div className="mt-5 grid gap-4 md:grid-cols-3">

                          <div className="rounded-lg bg-[#F8F4ED] p-4">
                            <p className="text-[9px] uppercase tracking-[0.15em] text-[#9F9385]">
                              Serial Number
                            </p>

                            <p className="mt-2 break-all text-sm font-medium text-[#4B4036]">
                              {unit.serialNumber ||
                                "Not assigned"}
                            </p>
                          </div>

                          <div className="rounded-lg bg-[#F8F4ED] p-4">
                            <p className="text-[9px] uppercase tracking-[0.15em] text-[#9F9385]">
                              Smart Unit
                            </p>

                            <p className="mt-2 break-all text-sm font-medium text-[#4B4036]">
                              {unit.smartUnit
                                ?.serialNumber ||
                                unit.smartUnit
                                  ?._id ||
                                "Not assigned"}
                            </p>
                          </div>

                          <div className="rounded-lg bg-[#F8F4ED] p-4">
                            <p className="text-[9px] uppercase tracking-[0.15em] text-[#9F9385]">
                              Experience
                            </p>

                            <p className="mt-2 break-all text-sm font-medium text-[#4B4036]">
                              {unit.experience
                                ?.serialNumber ||
                                unit.experience
                                  ?._id ||
                                "Not created"}
                            </p>
                          </div>

                        </div>

                        <div className="mt-4 grid gap-4 border-t border-[#E5DDD2] pt-4 md:grid-cols-2">

                          <InfoRow
                            label="Started"
                            value={formatDate(
                              unit.startedAt
                            )}
                          />

                          <InfoRow
                            label="Completed"
                            value={formatDate(
                              unit.completedAt
                            )}
                          />

                        </div>
                      </div>
                    )
                  )
                ) : (
                  <div className="rounded-xl border border-dashed border-[#D9D0C5] bg-[#F8F5F0] p-8 text-center text-sm text-[#9F9385]">
                    No production units found.
                  </div>
                )}

              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-[#D9D0C5] bg-[#F8F5F0] p-8 text-center">

            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#3B3026] text-[#DCC18F]">
              ✦
            </div>

            <p className="mt-4 font-medium text-[#302820]">
              Manufacturing has not started yet.
            </p>

            <p className="mt-1 text-sm text-[#9F9385]">
              Start manufacturing to create the
              production order.
            </p>

          </div>
        )}
      </section>

      {/* ======================================
          MAIN CONTENT
      ====================================== */}

      <div className="grid gap-6 lg:grid-cols-3">

        {/* ====================================
            ORDER ITEMS
        ==================================== */}

        <section className="rounded-2xl border border-[#E5DDD2] bg-[#F8F4ED] p-6 shadow-sm lg:col-span-2">

          <SectionTitle
            eyebrow="Products"
            title="Order Items"
            description="Product, selected variant, technology model and pricing."
          />

          <div className="space-y-8">

            {order.items?.map((item, index) => {

              const variant = item.variant || null;
              const technology =
                item.technologyModel || null;

              const variantPrice = Number(
                item.variantPrice || 0
              );

              const technologyPrice = Number(
                item.technologyPrice || 0
              );

              const unitPrice = Number(
                item.unitPrice || 0
              );

              const quantity = Number(
                item.quantity || 1
              );

              const calculatedItemTotal =
                unitPrice * quantity;

              const itemTotal = Number(
                item.itemTotal ??
                  calculatedItemTotal
              );

              // ==========================================
              // TECHNOLOGY MODEL NAME
              // ==========================================

              const technologyModelName =
                technology?.modelName ||
                technology?.name ||
                "No Technology Model Selected";

              return (
                <div
                  key={item._id || index}
                  className="border-b border-[#E5DDD2] pb-8 last:border-b-0 last:pb-0"
                >

                  {/* ======================================
                      PRODUCT
                  ====================================== */}

                  <div className="flex flex-col gap-5 sm:flex-row">

                    <div className="h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-[#EAE2D8]">

                      {item.image ? (
                        <img
                          src={getImageUrl(
                            item.image
                          )}
                          alt={
                            item.name ||
                            "Product"
                          }
                          className="h-full w-full object-cover"
                          onError={(event) => {
                            event.currentTarget.style.display =
                              "none";
                          }}
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-[#9F9385]">
                          No Image
                        </div>
                      )}

                    </div>

                    <div className="min-w-0 flex-1">

                      <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#B08D57]">
                        Product
                      </p>

                      <h3 className="mt-1 text-xl font-medium text-[#302820]">
                        {item.name ||
                          "Unnamed Product"}
                      </h3>

                      <div className="mt-4 flex flex-wrap gap-2">

                        <span className="rounded-full bg-[#302820] px-3 py-1 text-xs text-[#F8F4ED]">
                          Qty: {quantity}
                        </span>

                        <span className="rounded-full bg-[#C5A66B]/15 px-3 py-1 text-xs text-[#8B6B35]">
                          Base:{" "}
                          {formatMoney(
                            item.price
                          )}
                        </span>

                      </div>
                    </div>

                    <div className="sm:text-right">

                      <p className="text-[9px] uppercase tracking-[0.2em] text-[#9F9385]">
                        Item Total
                      </p>

                      <p className="mt-2 text-xl font-medium text-[#302820]">
                        {formatMoney(
                          itemTotal
                        )}
                      </p>

                    </div>
                  </div>

                  {/* ======================================
                      VARIANT
                  ====================================== */}

                  <div className="mt-6 rounded-xl border border-[#E5DDD2] bg-[#F8F5F0] p-5">

                    <div className="flex items-center justify-between">

                      <div>
                        <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#B08D57]">
                          Selected Option
                        </p>

                        <h4 className="mt-1 font-medium text-[#302820]">
                          Variant Details
                        </h4>
                      </div>

                      <span className="text-[#C5A66B]">
                        ✦
                      </span>

                    </div>

                    {variant ? (
                      <div className="mt-4 grid gap-x-6 md:grid-cols-2">

                        <InfoRow
                          label="Variant Name"
                          value={variant.name}
                        />

                        <InfoRow
                          label="Color"
                          value={variant.color}
                        />

                        <InfoRow
                          label="Size"
                          value={variant.size}
                        />

                        <InfoRow
                          label="Material"
                          value={variant.material}
                        />

                        <InfoRow
                          label="Finish"
                          value={variant.finish}
                        />

                        <InfoRow
                          label="SKU"
                          value={variant.sku}
                        />

                        <InfoRow
                          label="Variant Price"
                          value={formatMoney(
                            variantPrice
                          )}
                        />

                        {variant.image && (
                          <div className="mt-3 md:col-span-2">

                            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#9F9385]">
                              Variant Image
                            </p>

                            <img
                              src={getImageUrl(
                                variant.image
                              )}
                              alt={
                                variant.name ||
                                "Variant"
                              }
                              className="h-28 w-28 rounded-xl object-cover"
                            />

                          </div>
                        )}

                      </div>
                    ) : (
                      <p className="mt-4 text-sm text-[#9F9385]">
                        No variant selected
                      </p>
                    )}

                  </div>

                  {/* ======================================
                      TECHNOLOGY MODEL
                  ====================================== */}

                  <div className="mt-4 rounded-xl border-2 border-[#C5A66B]/40 bg-[#C5A66B]/10 p-5">

                    <div className="flex items-center justify-between">

                      <div>
                        <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#B08D57]">
                          Selected Technology
                        </p>

                        <h4 className="mt-1 text-lg font-semibold text-[#302820]">
                          {technologyModelName}
                        </h4>
                      </div>

                      <span className="text-xl text-[#B08D57]">
                        ✦
                      </span>

                    </div>

                    {technology ? (
                      <>
                        <div className="mt-5 grid gap-x-6 md:grid-cols-2">

                          <InfoRow
                            label="Technology Model"
                            value={
                              technology.modelName
                            }
                          />

                          <InfoRow
                            label="Technology"
                            value={
                              technology
                                .technology
                                ?.name
                            }
                          />

                          <InfoRow
                            label="Model Code"
                            value={
                              technology.modelCode
                            }
                          />

                          <InfoRow
                            label="Technology Code"
                            value={
                              technology
                                .technology
                                ?.code
                            }
                          />

                          <InfoRow
                            label="Technology Price"
                            value={formatMoney(
                              technologyPrice
                            )}
                          />

                          <InfoRow
                            label="Status"
                            value={
                              technology.status
                            }
                          />

                        </div>

                        {technology.description && (
                          <div className="mt-4 border-t border-[#C5A66B]/20 pt-4">

                            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#9F9385]">
                              Description
                            </p>

                            <p className="mt-2 text-sm leading-6 text-[#4B4036]">
                              {
                                technology.description
                              }
                            </p>

                          </div>
                        )}
                      </>
                    ) : (
                      <p className="mt-4 rounded-lg bg-[#F8F4ED] p-4 text-sm text-[#9F9385]">
                        No technology model selected
                        for this product.
                      </p>
                    )}

                  </div>

                  {/* ======================================
                      PRICE BREAKDOWN
                  ====================================== */}

                  <div className="mt-4 rounded-xl border border-[#E5DDD2] bg-[#302820] p-5">

                    <div className="flex items-center justify-between">

                      <h4 className="font-medium text-[#F8F4ED]">
                        Price Breakdown
                      </h4>

                      <span className="text-[#DCC18F]">
                        ✦
                      </span>

                    </div>

                    <div className="mt-4 space-y-3 text-sm">

                      <div className="flex justify-between gap-4 text-[#C8BFB4]">
                        <span>
                          Base Product
                        </span>

                        <span className="text-[#F8F4ED]">
                          {formatMoney(
                            item.price
                          )}
                        </span>
                      </div>

                      <div className="flex justify-between gap-4 text-[#C8BFB4]">
                        <span>
                          Variant
                        </span>

                        <span className="text-[#F8F4ED]">
                          {formatMoney(
                            variantPrice
                          )}
                        </span>
                      </div>

                      <div className="flex justify-between gap-4 text-[#C8BFB4]">
                        <span>
                          Technology Model
                        </span>

                        <span className="text-[#F8F4ED]">
                          {formatMoney(
                            technologyPrice
                          )}
                        </span>
                      </div>

                      <div className="flex justify-between border-t border-[#4A3D31] pt-3 text-[#C8BFB4]">

                        <span>
                          Unit Price
                        </span>

                        <span className="text-[#DCC18F]">
                          {formatMoney(
                            unitPrice
                          )}
                        </span>

                      </div>

                      <div className="flex justify-between text-[#C8BFB4]">

                        <span>
                          Quantity
                        </span>

                        <span className="text-[#F8F4ED]">
                          × {quantity}
                        </span>

                      </div>

                      <div className="flex justify-between border-t border-[#4A3D31] pt-3 text-base font-medium">

                        <span className="text-[#F8F4ED]">
                          Item Total
                        </span>

                        <span className="text-[#DCC18F]">
                          {formatMoney(
                            itemTotal
                          )}
                        </span>

                      </div>

                    </div>
                  </div>

                </div>
              );
            })}

          </div>

          {/* ======================================
              TOTALS
          ====================================== */}

          <div className="mt-8 ml-auto max-w-sm rounded-2xl bg-[#302820] p-6">

            <div className="mb-4 flex items-center gap-3">

              <span className="h-px flex-1 bg-[#4A3D31]" />

              <span className="text-[9px] uppercase tracking-[0.25em] text-[#DCC18F]">
                Summary
              </span>

              <span className="h-px flex-1 bg-[#4A3D31]" />

            </div>

            <div className="space-y-3 text-sm">

              <div className="flex justify-between text-[#C8BFB4]">
                <span>Subtotal</span>

                <span className="text-[#F8F4ED]">
                  {formatMoney(
                    order.subtotal
                  )}
                </span>
              </div>

              <div className="flex justify-between text-[#C8BFB4]">
                <span>Shipping</span>

                <span className="text-[#F8F4ED]">
                  {Number(
                    order.shippingCost || 0
                  ) === 0
                    ? "Free"
                    : formatMoney(
                        order.shippingCost
                      )}
                </span>
              </div>

              <div className="flex justify-between border-t border-[#4A3D31] pt-4 text-lg font-medium">

                <span className="text-[#F8F4ED]">
                  Total
                </span>

                <span className="text-[#DCC18F]">
                  {formatMoney(order.total)}
                </span>

              </div>

            </div>
          </div>

        </section>

        {/* ====================================
            RIGHT SIDEBAR
        ==================================== */}

        <div className="space-y-6">

          {/* CUSTOMER */}

          <section className="rounded-2xl border border-[#E5DDD2] bg-[#F8F4ED] p-6 shadow-sm">

            <SectionTitle
              eyebrow="Customer"
              title="Customer Information"
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
              value={order.user?._id}
            />

          </section>

          {/* SHIPPING */}

          <section className="rounded-2xl border border-[#E5DDD2] bg-[#F8F4ED] p-6 shadow-sm">

            <SectionTitle
              eyebrow="Delivery"
              title="Shipping Address"
            />

            <div className="space-y-3 text-sm text-[#4B4036]">

              <p className="font-medium text-[#302820]">
                {order.shippingAddress?.firstName}{" "}
                {order.shippingAddress?.lastName}
              </p>

              <p>
                {order.shippingAddress?.phone}
              </p>

              <p>
                {order.shippingAddress?.address}
              </p>

              <p>
                {order.shippingAddress?.city}
              </p>

              <p>
                {order.shippingAddress?.country}
              </p>

            </div>

          </section>

          {/* PAYMENT */}

          <section className="rounded-2xl border border-[#E5DDD2] bg-[#F8F4ED] p-6 shadow-sm">

            <SectionTitle
              eyebrow="Payment"
              title="Payment Details"
            />

            <InfoRow
              label="Method"
              value={
                order.paymentMethod
                  ? order.paymentMethod.replaceAll(
                      "_",
                      " "
                    )
                  : "N/A"
              }
            />

            <InfoRow
              label="Status"
              value={
                order.paymentStatus
              }
            />

          </section>

          {/* STATUS */}

          <section className="rounded-2xl border border-[#E5DDD2] bg-[#F8F4ED] p-6 shadow-sm">

            <SectionTitle
              eyebrow="Tracking"
              title="Order Status"
            />

            <span
              className={`inline-flex rounded-full border px-4 py-2 text-xs font-medium capitalize ${getOrderStatusClass(
                order.orderStatus
              )}`}
            >
              {order.orderStatus ||
                "pending"}
            </span>

          </section>

          {/* ORDER INFORMATION */}

          <section className="rounded-2xl border border-[#E5DDD2] bg-[#F8F4ED] p-6 shadow-sm">

            <SectionTitle
              eyebrow="Information"
              title="Order Information"
            />

            <InfoRow
              label="Order Number"
              value={order.orderNumber}
            />

            <InfoRow
              label="Created"
              value={formatDate(
                order.createdAt
              )}
            />

            <InfoRow
              label="Updated"
              value={formatDate(
                order.updatedAt
              )}
            />

            <InfoRow
              label="Order ID"
              value={order._id}
            />

          </section>

        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetailsPage;