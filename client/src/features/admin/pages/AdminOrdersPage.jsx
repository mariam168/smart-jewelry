import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  FaEye,
  FaRotate,
  FaBoxOpen,
  FaCircleCheck,
  FaClock,
  FaTruck,
  FaBan,
  FaBagShopping,
  FaCreditCard,
} from "react-icons/fa6";

import { getAdminOrders } from "../../orders/services/orderApi.js";

const COLORS = {
  background: "#F8F5EF",
  brown: "#12263A",
  brownLight: "#173650",
  gold: "#C9A24D",
  goldLight: "#E3C47A",
  cream: "#F2ECE3",
  muted: "#8A939C",
  border: "#EDE5D9",
};

const orderStatusConfig = {
  pending: {
    label: "Pending",
    className:
      "border-champagne-gold/30 bg-champagne-gold/10 text-antique-gold",
    icon: <FaClock />,
  },

  confirmed: {
    label: "Confirmed",
    className: "border-premium-silver/60 bg-silver-mist/80 text-midnight-navy",
    icon: <FaCircleCheck />,
  },

  processing: {
    label: "Processing",
    className: "border-light-champagne bg-soft-cream text-slate-gray",
    icon: <FaBoxOpen />,
  },

  shipped: {
    label: "Shipped",
    className: "border-navy-soft/20 bg-silver-mist/80 text-navy-soft",
    icon: <FaTruck />,
  },

  delivered: {
    label: "Delivered",
    className: "border-classic-gold/30 bg-soft-cream text-antique-gold",
    icon: <FaCircleCheck />,
  },

  cancelled: {
    label: "Cancelled",
    className: "border-antique-gold/25 bg-warm-ivory text-antique-gold",
    icon: <FaBan />,
  },
};

const paymentStatusConfig = {
  pending: {
    label: "Pending",
    className:
      "border-champagne-gold/30 bg-champagne-gold/10 text-antique-gold",
  },

  paid: {
    label: "Paid",
    className: "border-classic-gold/30 bg-soft-cream text-antique-gold",
  },

  failed: {
    label: "Failed",
    className: "border-antique-gold/25 bg-warm-ivory text-antique-gold",
  },
};

const formatDate = (date) => {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatPrice = (price) => {
  return `${Number(price || 0).toLocaleString()} EGP`;
};

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAdminOrders();

      setOrders(response?.data || []);
    } catch (error) {
      console.error("Failed to fetch orders:", error);

      setError(error?.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="relative flex min-h-[500px] items-center justify-center overflow-hidden">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-soft-cream blur-[100px]" />

        <div className="relative text-center">
          <div className="relative mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-champagne-gold/25 bg-midnight-navy shadow-[0_12px_30px_rgba(18,38,58,0.15)]">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-champagne-gold/20 border-t-champagne-gold" />

            <span className="absolute text-[6px] text-champagne-gold">✦</span>
          </div>

          <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-slate-gray">
            Loading orders...
          </p>
        </div>
      </div>
    );
  }

  const totalOrders = orders.length;

  const pendingOrders = orders.filter(
    (order) => order.orderStatus === "pending",
  ).length;

  const processingOrders = orders.filter(
    (order) => order.orderStatus === "processing",
  ).length;

  const deliveredOrders = orders.filter(
    (order) => order.orderStatus === "delivered",
  ).length;

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-[28px] border border-champagne-gold/15 bg-midnight-navy px-7 py-8 shadow-[0_24px_65px_rgba(7,19,31,0.16)] sm:px-9 sm:py-10">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-rich-navy via-midnight-navy to-luxury-black" />

        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full border border-champagne-gold/10" />

        <div className="pointer-events-none absolute -right-8 -top-12 h-44 w-44 rounded-full border border-champagne-gold/[0.08]" />

        <div className="pointer-events-none absolute -bottom-28 -left-20 h-60 w-60 rounded-full bg-champagne-gold/[0.06] blur-[75px]" />

        <div className="relative flex flex-col gap-7 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <span className="h-px w-9 bg-classic-gold/70" />

              <span className="text-[8px] font-semibold uppercase tracking-[0.32em] text-champagne-gold">
                Management
              </span>

              <span className="text-[7px] text-classic-gold">✦</span>
            </div>

            <h1 className="font-serif text-[2.6rem] font-normal leading-none tracking-[-0.04em] text-soft-white sm:text-[3.2rem]">
              Orders
            </h1>

            <p className="mt-4 max-w-xl text-[12px] leading-7 text-premium-silver/70 sm:text-[13px]">
              Manage, review and track all customer orders from one place.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchOrders}
            className="group inline-flex min-h-[48px] w-fit items-center justify-center gap-3 rounded-[13px] border border-champagne-gold/20 bg-soft-white/[0.05] px-5 text-[9px] font-semibold uppercase tracking-[0.12em] text-soft-white shadow-[0_10px_24px_rgba(0,0,0,0.12)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-champagne-gold/45 hover:bg-soft-white/[0.09]"
          >
            <FaRotate className="text-[11px] text-champagne-gold transition-transform duration-500 group-hover:rotate-180" />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="relative overflow-hidden rounded-[18px] border border-antique-gold/25 bg-soft-cream/80 px-5 py-4 shadow-[0_8px_24px_rgba(7,19,31,0.035)]">
          <div className="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-champagne-gold/10 blur-[45px]" />

          <div className="relative flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-midnight-navy text-[10px] text-champagne-gold">
              <FaBan />
            </div>

            <span className="pt-1.5 text-[11px] leading-5 text-antique-gold">
              {error}
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <div className="group relative overflow-hidden rounded-[22px] border border-light-champagne/90 bg-soft-white/85 p-6 shadow-[0_10px_30px_rgba(7,19,31,0.04)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-champagne-gold/50 hover:shadow-[0_18px_42px_rgba(7,19,31,0.08)]">
          <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-soft-cream blur-[50px]" />

          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-[7px] font-semibold uppercase tracking-[0.23em] text-steel-gray">
                Total Orders
              </p>

              <p className="mt-4 font-serif text-[2.6rem] font-normal leading-none tracking-[-0.035em] text-midnight-navy">
                {totalOrders}
              </p>

              <p className="mt-2 text-[9px] leading-5 text-slate-gray">
                All customer orders
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-champagne-gold/25 bg-soft-cream text-[13px] text-classic-gold">
              <FaBagShopping />
            </div>
          </div>

          <div className="relative mt-6 flex items-center gap-2">
            <span className="h-px w-6 bg-classic-gold/45" />
            <span className="h-px flex-1 bg-light-champagne" />
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-[22px] border border-light-champagne/90 bg-soft-white/85 p-6 shadow-[0_10px_30px_rgba(7,19,31,0.04)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-champagne-gold/50 hover:shadow-[0_18px_42px_rgba(7,19,31,0.08)]">
          <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-champagne-gold/[0.07] blur-[50px]" />

          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-[7px] font-semibold uppercase tracking-[0.23em] text-steel-gray">
                Pending
              </p>

              <p className="mt-4 font-serif text-[2.6rem] font-normal leading-none tracking-[-0.035em] text-antique-gold">
                {pendingOrders}
              </p>

              <p className="mt-2 text-[9px] leading-5 text-slate-gray">
                Waiting for confirmation
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-champagne-gold/25 bg-champagne-gold/10 text-[13px] text-antique-gold">
              <FaClock />
            </div>
          </div>

          <div className="relative mt-6 flex items-center gap-2">
            <span className="h-px w-6 bg-classic-gold/45" />
            <span className="h-px flex-1 bg-light-champagne" />
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-[22px] border border-light-champagne/90 bg-soft-white/85 p-6 shadow-[0_10px_30px_rgba(7,19,31,0.04)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-champagne-gold/50 hover:shadow-[0_18px_42px_rgba(7,19,31,0.08)]">
          <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-soft-cream blur-[50px]" />

          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-[7px] font-semibold uppercase tracking-[0.23em] text-steel-gray">
                Processing
              </p>

              <p className="mt-4 font-serif text-[2.6rem] font-normal leading-none tracking-[-0.035em] text-midnight-navy">
                {processingOrders}
              </p>

              <p className="mt-2 text-[9px] leading-5 text-slate-gray">
                Currently being prepared
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-light-champagne bg-silver-mist/80 text-[13px] text-navy-soft">
              <FaBoxOpen />
            </div>
          </div>

          <div className="relative mt-6 flex items-center gap-2">
            <span className="h-px w-6 bg-classic-gold/45" />
            <span className="h-px flex-1 bg-light-champagne" />
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-[22px] border border-light-champagne/90 bg-soft-white/85 p-6 shadow-[0_10px_30px_rgba(7,19,31,0.04)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-champagne-gold/50 hover:shadow-[0_18px_42px_rgba(7,19,31,0.08)]">
          <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-soft-cream blur-[50px]" />

          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-[7px] font-semibold uppercase tracking-[0.23em] text-steel-gray">
                Delivered
              </p>

              <p className="mt-4 font-serif text-[2.6rem] font-normal leading-none tracking-[-0.035em] text-midnight-navy">
                {deliveredOrders}
              </p>

              <p className="mt-2 text-[9px] leading-5 text-slate-gray">
                Successfully completed
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-champagne-gold/25 bg-soft-cream text-[13px] text-classic-gold">
              <FaCircleCheck />
            </div>
          </div>

          <div className="relative mt-6 flex items-center gap-2">
            <span className="h-px w-6 bg-classic-gold/45" />
            <span className="h-px flex-1 bg-light-champagne" />
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-[26px] border border-light-champagne/90 bg-soft-white/85 shadow-[0_16px_50px_rgba(7,19,31,0.05)] backdrop-blur-sm">
        <div className="pointer-events-none absolute -right-28 -top-28 h-64 w-64 rounded-full bg-soft-cream blur-[80px]" />

        <div className="relative flex flex-col gap-4 border-b border-light-champagne/80 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-midnight-navy text-[9px] text-champagne-gold shadow-[0_7px_18px_rgba(18,38,58,0.13)]">
              ✦
            </span>

            <div>
              <h2 className="font-serif text-[1.35rem] font-normal text-midnight-navy">
                Customer Orders
              </h2>

              <p className="mt-1 text-[9px] text-slate-gray">
                {totalOrders} {totalOrders === 1 ? "order" : "orders"} in total
              </p>
            </div>
          </div>

          <div className="text-[7px] font-semibold uppercase tracking-[0.25em] text-antique-gold">
            Smart Jewelry
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="relative flex min-h-[360px] flex-col items-center justify-center px-6 text-center">
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[280px] w-[380px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-soft-cream blur-[85px]" />

            <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-champagne-gold/25 bg-warm-ivory text-[17px] text-classic-gold shadow-[0_9px_24px_rgba(7,19,31,0.04)]">
              <FaBoxOpen />
            </div>

            <h2 className="relative mt-6 font-serif text-[1.7rem] font-normal tracking-[-0.025em] text-midnight-navy">
              No orders found
            </h2>

            <p className="relative mt-3 max-w-sm text-[11px] leading-6 text-slate-gray">
              There are no customer orders yet. New orders will appear here.
            </p>
          </div>
        ) : (
          <div className="relative overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead>
                <tr className="border-b border-light-champagne/80 bg-warm-ivory/55">
                  <th className="px-6 py-4 text-left text-[7px] font-semibold uppercase tracking-[0.18em] text-steel-gray">
                    Order
                  </th>

                  <th className="px-6 py-4 text-left text-[7px] font-semibold uppercase tracking-[0.18em] text-steel-gray">
                    Customer
                  </th>

                  <th className="px-6 py-4 text-left text-[7px] font-semibold uppercase tracking-[0.18em] text-steel-gray">
                    Items
                  </th>

                  <th className="px-6 py-4 text-left text-[7px] font-semibold uppercase tracking-[0.18em] text-steel-gray">
                    Total
                  </th>

                  <th className="px-6 py-4 text-left text-[7px] font-semibold uppercase tracking-[0.18em] text-steel-gray">
                    Payment
                  </th>

                  <th className="px-6 py-4 text-left text-[7px] font-semibold uppercase tracking-[0.18em] text-steel-gray">
                    Status
                  </th>

                  <th className="px-6 py-4 text-left text-[7px] font-semibold uppercase tracking-[0.18em] text-steel-gray">
                    Date
                  </th>

                  <th className="px-6 py-4 text-right text-[7px] font-semibold uppercase tracking-[0.18em] text-steel-gray">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-light-champagne/65">
                {orders.map((order) => {
                  const status =
                    orderStatusConfig[order.orderStatus] ||
                    orderStatusConfig.pending;

                  const payment =
                    paymentStatusConfig[order.paymentStatus] ||
                    paymentStatusConfig.pending;

                  const customerEmail = order.user?.email || "Unknown customer";

                  const customerName =
                    [
                      order.shippingAddress?.firstName,
                      order.shippingAddress?.lastName,
                    ]
                      .filter(Boolean)
                      .join(" ") || "Unknown customer";

                  return (
                    <tr
                      key={order._id}
                      className="group transition-colors duration-300 hover:bg-warm-ivory/55"
                    >
                      <td className="px-6 py-5">
                        <div>
                          <p className="font-serif text-[1rem] font-normal text-midnight-navy">
                            #{order.orderNumber}
                          </p>

                          <p className="mt-1 max-w-[130px] truncate text-[8px] text-steel-gray">
                            ID: {order._id}
                          </p>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-champagne-gold/15 bg-midnight-navy text-[9px] font-semibold text-champagne-gold shadow-[0_6px_16px_rgba(18,38,58,0.12)]">
                            {customerName.charAt(0).toUpperCase()}
                          </div>

                          <div className="min-w-0">
                            <p className="max-w-[190px] truncate text-[11px] font-semibold text-midnight-navy">
                              {customerName}
                            </p>

                            <p className="mt-1 max-w-[190px] truncate text-[9px] text-slate-gray">
                              {customerEmail}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-light-champagne bg-warm-ivory text-[9px] font-semibold text-midnight-navy">
                            {order.items?.length || 0}
                          </span>

                          <span className="text-[9px] text-slate-gray">
                            {order.items?.length === 1 ? "item" : "items"}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <p className="font-serif text-[1rem] font-normal text-midnight-navy">
                          {formatPrice(order.total)}
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex flex-col items-start gap-2.5">
                          <div className="flex items-center gap-2 text-[9px] text-slate-gray">
                            <FaCreditCard className="text-[10px] text-classic-gold" />

                            <span>
                              {order.paymentMethod === "cash_on_delivery"
                                ? "Cash on Delivery"
                                : "Card"}
                            </span>
                          </div>

                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1.5 text-[7px] font-semibold uppercase tracking-[0.08em] ${payment.className}`}
                          >
                            {payment.label}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[7px] font-semibold uppercase tracking-[0.08em] ${status.className}`}
                        >
                          <span className="text-[8px]">{status.icon}</span>

                          {status.label}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <p className="text-[9px] text-slate-gray">
                          {formatDate(order.createdAt)}
                        </p>
                      </td>

                      <td className="px-6 py-5 text-right">
                        <Link
                          to={`/admin/orders/${order._id}`}
                          className="group/view inline-flex min-h-[38px] items-center justify-center gap-2.5 rounded-full bg-midnight-navy px-4 text-[7px] font-semibold uppercase tracking-[0.1em] text-soft-white shadow-[0_7px_18px_rgba(18,38,58,0.12)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-rich-navy hover:shadow-[0_10px_22px_rgba(18,38,58,0.18)]"
                        >
                          <FaEye className="text-[9px] text-champagne-gold transition-transform duration-300 group-hover/view:scale-110" />
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="relative flex items-center justify-center gap-3 border-t border-light-champagne/70 px-6 py-4">
          <span className="h-px w-8 bg-classic-gold/30" />

          <span className="text-[7px] text-classic-gold">✦</span>

          <span className="h-px w-8 bg-classic-gold/30" />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 py-2 text-[7px] font-semibold uppercase tracking-[0.28em] text-steel-gray">
        <span>Elegant</span>

        <span className="text-classic-gold">✦</span>

        <span>Personal</span>

        <span className="text-classic-gold">✦</span>

        <span>Smart</span>
      </div>
    </div>
  );
};

export default AdminOrdersPage;
