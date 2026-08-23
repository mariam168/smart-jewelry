import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  useAuth,
} from "../../auth/context/AuthContext";

import api from "../../../lib/axios";

const orderSteps = [
  {
    key: "pending",
    label: "Order Placed",
    description: "We received your order",
  },
  {
    key: "confirmed",
    label: "Confirmed",
    description: "Your order has been confirmed",
  },
  {
    key: "processing",
    label: "Preparing",
    description: "Your order is being prepared",
  },
  {
    key: "shipped",
    label: "Shipped",
    description: "Your order is on the way",
  },
  {
    key: "delivered",
    label: "Delivered",
    description: "Order successfully delivered",
  },
];

const manufacturingSteps = [
  {
    key: "pending",
    label: "Pending",
  },
  {
    key: "assigned",
    label: "Assigned",
  },
  {
    key: "manufacturing",
    label: "Manufacturing",
  },
  {
    key: "ready",
    label: "Ready",
  },
];

const AccountPage = () => {
  const navigate = useNavigate();

  const {
    user: authUser,
    logout,
  } = useAuth();

  const [
    account,
    setAccount,
  ] = useState(null);

  const [
    orders,
    setOrders,
  ] = useState([]);

  const [
    expandedOrder,
    setExpandedOrder,
  ] = useState(null);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    isLoggingOut,
    setIsLoggingOut,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  useEffect(() => {
    const loadAccountData = async () => {
      try {
        setIsLoading(true);
        setError("");

        const [
          accountResponse,
          ordersResponse,
        ] = await Promise.all([
          api.get("/auth/me"),
          api.get("/orders/my-orders"),
        ]);

        const accountData =
          accountResponse?.data?.data ||
          null;

        const ordersData =
          ordersResponse?.data?.data ||
          [];

        setAccount(accountData);

        setOrders(
          Array.isArray(ordersData)
            ? ordersData
            : []
        );
      } catch (error) {
        console.error(
          "ACCOUNT PAGE ERROR:",
          error
        );

        setError(
          error?.response?.data?.message ||
            error?.message ||
            "Failed to load account information."
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadAccountData();
  }, []);

  const user =
    account?.user ||
    authUser ||
    null;

  const customer =
    account?.customer ||
    null;

  const statistics = useMemo(() => {
    return {
      total: orders.length,

      pending: orders.filter(
        (order) =>
          order.orderStatus === "pending"
      ).length,

      active: orders.filter(
        (order) =>
          [
            "confirmed",
            "processing",
            "shipped",
          ].includes(order.orderStatus)
      ).length,

      delivered: orders.filter(
        (order) =>
          order.orderStatus === "delivered"
      ).length,

      cancelled: orders.filter(
        (order) =>
          order.orderStatus === "cancelled"
      ).length,

      totalValue: orders
        .filter(
          (order) =>
            order.orderStatus !== "cancelled"
        )
        .reduce(
          (total, order) =>
            total +
            Number(order.total || 0),
          0
        ),
    };
  }, [orders]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);

      await logout();

      navigate("/login");
    } catch (error) {
      console.error(
        "LOGOUT ERROR:",
        error
      );
    } finally {
      setIsLoggingOut(false);
    }
  };

  const toggleOrder = (orderId) => {
    setExpandedOrder(
      (previous) =>
        previous === orderId
          ? null
          : orderId
    );
  };

  const formatMoney = (value) => {
    return Number(
      value || 0
    ).toLocaleString("en-EG", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };

  const formatDate = (value) => {
    if (!value) {
      return "—";
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "—";
    }

    return date.toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const formatDateTime = (value) => {
    if (!value) {
      return "—";
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "—";
    }

    return date.toLocaleString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  const formatStatus = (status) => {
    if (!status) {
      return "—";
    }

    return status
      .replaceAll("_", " ")
      .replace(
        /\b\w/g,
        (letter) =>
          letter.toUpperCase()
      );
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

    return `http://localhost:5000${image}`;
  };

  const getOrderStepIndex = (status) => {
    return orderSteps.findIndex(
      (step) =>
        step.key === status
    );
  };

  const getOrderStatusLabel = (status) => {
    if (
      status === "cancelled"
    ) {
      return "Cancelled";
    }

    const step =
      orderSteps.find(
        (item) =>
          item.key === status
      );

    return (
      step?.label ||
      formatStatus(status)
    );
  };

  const getOrderStatusStyle = (status) => {
    switch (status) {
      case "pending":
        return "border-[#E5D3A7] bg-[#FBF6E9] text-[#8A6A2F]";

      case "confirmed":
        return "border-[#BFD1E8] bg-[#EEF4FB] text-[#4D6F99]";

      case "processing":
        return "border-[#C8D3EB] bg-[#F0F3FA] text-[#536D9C]";

      case "shipped":
        return "border-[#C9C5E8] bg-[#F3F1FA] text-[#625A98]";

      case "delivered":
        return "border-[#B8D8C0] bg-[#EEF8F0] text-[#467454]";

      case "cancelled":
        return "border-[#E7C1C1] bg-[#FCF0F0] text-[#A65353]";

      default:
        return "border-light-champagne bg-warm-ivory text-slate-gray";
    }
  };

  const getPaymentStatusStyle = (status) => {
    switch (status) {
      case "paid":
        return "border-[#B8D8C0] bg-[#EEF8F0] text-[#467454]";

      case "failed":
        return "border-[#E7C1C1] bg-[#FCF0F0] text-[#A65353]";

      default:
        return "border-[#E5D3A7] bg-[#FBF6E9] text-[#8A6A2F]";
    }
  };

  const getManufacturingStatusStyle = (
    status
  ) => {
    switch (status) {
      case "pending":
        return "border-[#E5D3A7] bg-[#FBF6E9] text-[#8A6A2F]";

      case "assigned":
        return "border-[#BFD1E8] bg-[#EEF4FB] text-[#4D6F99]";

      case "manufacturing":
        return "border-[#D8C7E8] bg-[#F6F0FA] text-[#79538F]";

      case "ready":
        return "border-[#B8D8C0] bg-[#EEF8F0] text-[#467454]";

      case "not_required":
        return "border-[#D9D5D0] bg-[#F4F2F0] text-[#77716A]";

      default:
        return "border-light-champagne bg-warm-ivory text-slate-gray";
    }
  };

  const getManufacturingStepIndex = (
    status
  ) => {
    return manufacturingSteps.findIndex(
      (step) =>
        step.key === status
    );
  };

  if (isLoading) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-warm-ivory px-6">
        <div className="pointer-events-none absolute -left-52 top-20 h-[500px] w-[500px] rounded-full bg-champagne-gold/[0.05] blur-[140px]" />

        <div className="relative text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-champagne-gold/25 bg-soft-white shadow-[0_8px_24px_rgba(7,19,31,0.04)]">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-light-champagne border-t-classic-gold" />
          </div>

          <p className="mt-5 text-[13px] text-slate-gray">
            Loading your account...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-warm-ivory text-midnight-navy">
      <div className="pointer-events-none fixed -left-52 top-20 h-[520px] w-[520px] rounded-full bg-champagne-gold/[0.05] blur-[140px]" />

      <div className="pointer-events-none fixed -right-52 bottom-0 h-[520px] w-[520px] rounded-full bg-light-champagne/60 blur-[140px]" />

      <header className="relative border-b border-light-champagne/90 bg-soft-white/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-8 sm:flex-row sm:items-end sm:justify-between lg:px-8">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <span className="h-px w-8 bg-classic-gold/70" />

              <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-antique-gold">
                Smart Jewelry
              </span>
            </div>

            <h1 className="font-serif text-[2.6rem] font-normal leading-none tracking-[-0.045em] text-midnight-navy sm:text-[3.2rem]">
              My Account
            </h1>

            <p className="mt-3 text-[13px] leading-6 text-slate-gray">
              Profile, purchases, manufacturing and delivery tracking.
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="inline-flex min-h-[44px] w-fit items-center justify-center rounded-[12px] border border-light-champagne bg-soft-white px-5 text-[11px] font-semibold text-slate-gray transition-all duration-300 hover:border-champagne-gold hover:bg-soft-cream hover:text-midnight-navy disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoggingOut
              ? "Logging out..."
              : "Logout"}
          </button>
        </div>
      </header>

      <div className="relative mx-auto max-w-7xl px-6 py-10 lg:px-8">
        {error && (
          <div className="mb-7 rounded-[16px] border border-red-200 bg-red-50 px-5 py-4 text-[13px] text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[310px_minmax(0,1fr)]">
          <aside className="space-y-6">
            <section className="overflow-hidden rounded-[24px] border border-light-champagne/90 bg-soft-white shadow-[0_15px_45px_rgba(7,19,31,0.045)]">
              <div className="border-b border-light-champagne/80 bg-warm-ivory/40 px-6 py-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-antique-gold">
                  Profile
                </p>

                <h2 className="mt-1.5 font-serif text-[1.45rem] font-normal">
                  Account Details
                </h2>
              </div>

              <div className="p-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-champagne-gold/25 bg-soft-cream font-serif text-[1.5rem] text-antique-gold">
                  {customer?.firstName?.[0]?.toUpperCase() ||
                    user?.email?.[0]?.toUpperCase() ||
                    "U"}
                </div>

                <h3 className="mt-5 font-serif text-[1.35rem] text-midnight-navy">
                  {customer
                    ? `${customer.firstName || ""} ${customer.lastName || ""}`.trim()
                    : "Customer"}
                </h3>

                <p className="mt-1 break-all text-[12px] text-slate-gray">
                  {user?.email || "—"}
                </p>

                <div className="mt-6 space-y-4 border-t border-light-champagne/80 pt-5">
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-steel-gray">
                      Phone
                    </p>

                    <p className="mt-1.5 text-[12px] font-medium">
                      {customer?.phone ||
                        "Not added"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-steel-gray">
                      Role
                    </p>

                    <p className="mt-1.5 text-[12px] font-medium capitalize">
                      {user?.role?.name ||
                        authUser?.role?.name ||
                        "customer"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-steel-gray">
                      Account Status
                    </p>

                    <div className="mt-1.5 flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          user?.isActive ===
                          false
                            ? "bg-red-400"
                            : "bg-[#5F9A6C]"
                        }`}
                      />

                      <p className="text-[12px] font-medium">
                        {user?.isActive ===
                        false
                          ? "Inactive"
                          : "Active"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-steel-gray">
                      Email
                    </p>

                    <p className="mt-1.5 text-[12px] font-medium">
                      {user?.emailVerifiedAt
                        ? "Verified"
                        : "Not Verified"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-steel-gray">
                      Marketing Emails
                    </p>

                    <p className="mt-1.5 text-[12px] font-medium">
                      {customer?.marketingConsent
                        ? "Enabled"
                        : "Disabled"}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="overflow-hidden rounded-[24px] border border-light-champagne/90 bg-soft-white shadow-[0_15px_45px_rgba(7,19,31,0.045)]">
              <div className="border-b border-light-champagne/80 bg-warm-ivory/40 px-6 py-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-antique-gold">
                  Purchases
                </p>

                <h2 className="mt-1.5 font-serif text-[1.4rem]">
                  Order Summary
                </h2>
              </div>

              <div className="divide-y divide-light-champagne/70 px-6">
                <div className="flex items-center justify-between py-4">
                  <span className="text-[11px] text-slate-gray">
                    Total Orders
                  </span>

                  <span className="font-serif text-[1.35rem]">
                    {statistics.total}
                  </span>
                </div>

                <div className="flex items-center justify-between py-4">
                  <span className="text-[11px] text-slate-gray">
                    Pending
                  </span>

                  <span className="text-[12px] font-semibold">
                    {statistics.pending}
                  </span>
                </div>

                <div className="flex items-center justify-between py-4">
                  <span className="text-[11px] text-slate-gray">
                    Active
                  </span>

                  <span className="text-[12px] font-semibold">
                    {statistics.active}
                  </span>
                </div>

                <div className="flex items-center justify-between py-4">
                  <span className="text-[11px] text-slate-gray">
                    Delivered
                  </span>

                  <span className="text-[12px] font-semibold">
                    {statistics.delivered}
                  </span>
                </div>

                <div className="flex items-center justify-between py-4">
                  <span className="text-[11px] text-slate-gray">
                    Cancelled
                  </span>

                  <span className="text-[12px] font-semibold">
                    {statistics.cancelled}
                  </span>
                </div>

                <div className="py-5">
                  <p className="text-[10px] text-steel-gray">
                    Order Value
                  </p>

                  <div className="mt-1">
                    <span className="font-serif text-[1.6rem]">
                      {formatMoney(
                        statistics.totalValue
                      )}
                    </span>

                    <span className="ml-1 text-[10px] text-steel-gray">
                      EGP
                    </span>
                  </div>
                </div>
              </div>
            </section>
          </aside>

          <section>
            <div className="mb-6 flex items-end justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-antique-gold">
                  Purchase History
                </p>

                <h2 className="mt-1 font-serif text-[2rem] tracking-[-0.03em]">
                  My Orders
                </h2>
              </div>

              <p className="text-[11px] text-slate-gray">
                {orders.length}{" "}
                {orders.length === 1
                  ? "order"
                  : "orders"}
              </p>
            </div>

            {orders.length === 0 ? (
              <div className="rounded-[28px] border border-light-champagne/90 bg-soft-white px-6 py-20 text-center shadow-[0_15px_45px_rgba(7,19,31,0.04)]">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-champagne-gold/25 bg-soft-cream text-antique-gold">
                  ✦
                </div>

                <h3 className="mt-5 font-serif text-[1.55rem]">
                  No Orders Yet
                </h3>

                <p className="mt-2 text-[13px] text-slate-gray">
                  Your purchases will appear here after checkout.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {orders.map(
                  (order) => {
                    const isExpanded =
                      expandedOrder ===
                      order._id;

                    const currentOrderStep =
                      getOrderStepIndex(
                        order.orderStatus
                      );

                    return (
                      <article
                        key={order._id}
                        className="overflow-hidden rounded-[24px] border border-light-champagne/90 bg-soft-white shadow-[0_12px_38px_rgba(7,19,31,0.04)]"
                      >
                        <button
                          type="button"
                          onClick={() =>
                            toggleOrder(
                              order._id
                            )
                          }
                          className="w-full px-6 py-6 text-left transition-colors duration-300 hover:bg-warm-ivory/30"
                        >
                          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                            <div>
                              <div className="flex items-center gap-3">
                                <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-antique-gold">
                                  Order
                                </p>

                                <span className="h-1 w-1 rounded-full bg-light-champagne" />

                                <p className="text-[10px] text-steel-gray">
                                  {formatDate(
                                    order.createdAt
                                  )}
                                </p>
                              </div>

                              <h3 className="mt-2 font-mono text-[13px] font-semibold tracking-[0.04em]">
                                {order.orderNumber ||
                                  order._id}
                              </h3>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                              <div>
                                <p className="text-[9px] uppercase tracking-[0.14em] text-steel-gray">
                                  Status
                                </p>

                                <span
                                  className={`mt-1 inline-flex rounded-full border px-3 py-1.5 text-[10px] font-semibold ${getOrderStatusStyle(
                                    order.orderStatus
                                  )}`}
                                >
                                  {getOrderStatusLabel(
                                    order.orderStatus
                                  )}
                                </span>
                              </div>

                              <div>
                                <p className="text-[9px] uppercase tracking-[0.14em] text-steel-gray">
                                  Payment
                                </p>

                                <span
                                  className={`mt-1 inline-flex rounded-full border px-3 py-1.5 text-[10px] font-semibold ${getPaymentStatusStyle(
                                    order.paymentStatus
                                  )}`}
                                >
                                  {formatStatus(
                                    order.paymentStatus
                                  )}
                                </span>
                              </div>

                              <div className="min-w-[100px] xl:text-right">
                                <p className="text-[9px] uppercase tracking-[0.14em] text-steel-gray">
                                  Total
                                </p>

                                <p className="mt-1 font-serif text-[1.35rem]">
                                  {formatMoney(
                                    order.total
                                  )}{" "}
                                  <span className="font-sans text-[9px] text-steel-gray">
                                    EGP
                                  </span>
                                </p>
                              </div>

                              <div className="ml-1 flex h-9 w-9 items-center justify-center rounded-full border border-light-champagne text-[16px] text-antique-gold">
                                {isExpanded
                                  ? "−"
                                  : "+"}
                              </div>
                            </div>
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="border-t border-light-champagne/80 bg-warm-ivory/20 px-6 py-7">
                            <section className="rounded-[22px] border border-light-champagne/85 bg-soft-white p-6">
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-antique-gold">
                                    Order Tracking
                                  </p>

                                  <h4 className="mt-1.5 font-serif text-[1.5rem]">
                                    {order.orderStatus ===
                                    "cancelled"
                                      ? "Order Cancelled"
                                      : getOrderStatusLabel(
                                          order.orderStatus
                                        )}
                                  </h4>
                                </div>

                                <p className="text-[10px] text-steel-gray">
                                  Updated{" "}
                                  {formatDateTime(
                                    order.updatedAt
                                  )}
                                </p>
                              </div>

                              {order.orderStatus ===
                              "cancelled" ? (
                                <div className="mt-6 rounded-[16px] border border-red-200 bg-red-50 px-5 py-5">
                                  <div className="flex items-start gap-4">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-lg font-semibold text-red-600">
                                      ×
                                    </div>

                                    <div>
                                      <p className="text-[13px] font-semibold text-red-700">
                                        This order has been cancelled
                                      </p>

                                      <p className="mt-1 text-[11px] leading-5 text-red-600/80">
                                        This order will not continue through processing and delivery.
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="mt-8">
                                  <div className="hidden md:block">
                                    <div className="relative">
                                      <div className="absolute left-[10%] right-[10%] top-5 h-px bg-light-champagne" />

                                      {currentOrderStep >
                                        0 && (
                                        <div
                                          className="absolute left-[10%] top-5 h-px bg-classic-gold transition-all duration-500"
                                          style={{
                                            width: `${
                                              (currentOrderStep /
                                                (orderSteps.length -
                                                  1)) *
                                              80
                                            }%`,
                                          }}
                                        />
                                      )}

                                      <div className="relative grid grid-cols-5">
                                        {orderSteps.map(
                                          (
                                            step,
                                            index
                                          ) => {
                                            const completed =
                                              index <
                                              currentOrderStep;

                                            const current =
                                              index ===
                                              currentOrderStep;

                                            return (
                                              <div
                                                key={
                                                  step.key
                                                }
                                                className="flex flex-col items-center px-2 text-center"
                                              >
                                                <div
                                                  className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                                                    completed
                                                      ? "border-midnight-navy bg-midnight-navy text-soft-white"
                                                      : current
                                                        ? "border-classic-gold bg-soft-white text-antique-gold shadow-[0_0_0_5px_rgba(201,162,77,0.10)]"
                                                        : "border-light-champagne bg-soft-white text-steel-gray"
                                                  }`}
                                                >
                                                  {completed ? (
                                                    <span className="text-[13px]">
                                                      ✓
                                                    </span>
                                                  ) : current ? (
                                                    <span className="h-2.5 w-2.5 rounded-full bg-classic-gold" />
                                                  ) : (
                                                    <span className="h-2 w-2 rounded-full bg-premium-silver" />
                                                  )}
                                                </div>

                                                <p
                                                  className={`mt-4 text-[11px] font-semibold ${
                                                    completed ||
                                                    current
                                                      ? "text-midnight-navy"
                                                      : "text-steel-gray"
                                                  }`}
                                                >
                                                  {
                                                    step.label
                                                  }
                                                </p>

                                                <p className="mt-1 max-w-[130px] text-[9px] leading-4 text-steel-gray">
                                                  {
                                                    step.description
                                                  }
                                                </p>

                                                {current && (
                                                  <span className="mt-2 rounded-full border border-champagne-gold/30 bg-soft-cream px-2.5 py-1 text-[8px] font-semibold uppercase tracking-[0.08em] text-antique-gold">
                                                    Current
                                                  </span>
                                                )}
                                              </div>
                                            );
                                          }
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="md:hidden">
                                    {orderSteps.map(
                                      (
                                        step,
                                        index
                                      ) => {
                                        const completed =
                                          index <
                                          currentOrderStep;

                                        const current =
                                          index ===
                                          currentOrderStep;

                                        return (
                                          <div
                                            key={
                                              step.key
                                            }
                                            className="relative flex gap-4"
                                          >
                                            {index !==
                                              orderSteps.length -
                                                1 && (
                                              <div
                                                className={`absolute left-[19px] top-10 h-[calc(100%-8px)] w-px ${
                                                  completed
                                                    ? "bg-classic-gold"
                                                    : "bg-light-champagne"
                                                }`}
                                              />
                                            )}

                                            <div
                                              className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 ${
                                                completed
                                                  ? "border-midnight-navy bg-midnight-navy text-soft-white"
                                                  : current
                                                    ? "border-classic-gold bg-soft-white text-antique-gold"
                                                    : "border-light-champagne bg-soft-white text-steel-gray"
                                              }`}
                                            >
                                              {completed
                                                ? "✓"
                                                : current
                                                  ? "•"
                                                  : ""}
                                            </div>

                                            <div className="pb-7">
                                              <p
                                                className={`text-[12px] font-semibold ${
                                                  completed ||
                                                  current
                                                    ? "text-midnight-navy"
                                                    : "text-steel-gray"
                                                }`}
                                              >
                                                {
                                                  step.label
                                                }
                                              </p>

                                              <p className="mt-1 text-[10px] leading-5 text-steel-gray">
                                                {
                                                  step.description
                                                }
                                              </p>

                                              {current && (
                                                <span className="mt-2 inline-flex rounded-full border border-champagne-gold/30 bg-soft-cream px-2.5 py-1 text-[8px] font-semibold uppercase tracking-[0.08em] text-antique-gold">
                                                  Current Status
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        );
                                      }
                                    )}
                                  </div>
                                </div>
                              )}
                            </section>

                            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                              <div className="rounded-[18px] border border-light-champagne/85 bg-soft-white p-5">
                                <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-antique-gold">
                                  Payment Method
                                </p>

                                <p className="mt-3 text-[12px] font-semibold">
                                  {order.paymentMethod ===
                                  "cash_on_delivery"
                                    ? "Cash on Delivery"
                                    : "Card"}
                                </p>
                              </div>

                              <div className="rounded-[18px] border border-light-champagne/85 bg-soft-white p-5">
                                <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-antique-gold">
                                  Payment Status
                                </p>

                                <span
                                  className={`mt-3 inline-flex rounded-full border px-3 py-1.5 text-[10px] font-semibold ${getPaymentStatusStyle(
                                    order.paymentStatus
                                  )}`}
                                >
                                  {formatStatus(
                                    order.paymentStatus
                                  )}
                                </span>
                              </div>

                              <div className="rounded-[18px] border border-light-champagne/85 bg-soft-white p-5">
                                <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-antique-gold">
                                  Number of Items
                                </p>

                                <p className="mt-2 font-serif text-[1.6rem]">
                                  {order.items?.reduce(
                                    (
                                      total,
                                      item
                                    ) =>
                                      total +
                                      Number(
                                        item.quantity ||
                                          0
                                      ),
                                    0
                                  ) || 0}
                                </p>
                              </div>
                            </div>

                            <section className="mt-7">
                              <div className="mb-4">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-antique-gold">
                                  Products
                                </p>

                                <h4 className="mt-1 font-serif text-[1.45rem]">
                                  Products & Manufacturing
                                </h4>
                              </div>

                              <div className="space-y-4">
                                {order.items?.map(
                                  (
                                    item,
                                    index
                                  ) => {
                                    const manufacturingRequired =
                                      item.manufacturingStatus !==
                                      "not_required";

                                    const manufacturingIndex =
                                      getManufacturingStepIndex(
                                        item.manufacturingStatus
                                      );

                                    return (
                                      <article
                                        key={
                                          item._id ||
                                          `${order._id}-${index}`
                                        }
                                        className="rounded-[22px] border border-light-champagne/85 bg-soft-white p-5"
                                      >
                                        <div className="flex flex-col gap-5 md:flex-row">
                                          <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-[16px] border border-light-champagne bg-soft-cream">
                                            {item.image ? (
                                              <img
                                                src={getImageUrl(
                                                  item.image
                                                )}
                                                alt={
                                                  item.name
                                                }
                                                className="h-full w-full object-cover"
                                              />
                                            ) : (
                                              <span className="font-serif text-[1.5rem] text-antique-gold">
                                                ✦
                                              </span>
                                            )}
                                          </div>

                                          <div className="min-w-0 flex-1">
                                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                              <div>
                                                <h5 className="text-[14px] font-semibold">
                                                  {
                                                    item.name
                                                  }
                                                </h5>

                                                <p className="mt-1 text-[11px] text-slate-gray">
                                                  Quantity{" "}
                                                  {
                                                    item.quantity
                                                  }
                                                </p>
                                              </div>

                                              <div className="sm:text-right">
                                                <p className="text-[13px] font-semibold">
                                                  {formatMoney(
                                                    item.itemTotal
                                                  )}{" "}
                                                  EGP
                                                </p>

                                                <p className="mt-1 text-[10px] text-steel-gray">
                                                  {formatMoney(
                                                    item.unitPrice
                                                  )}{" "}
                                                  EGP each
                                                </p>
                                              </div>
                                            </div>

                                            {item.variant && (
                                              <div className="mt-4 rounded-[15px] bg-warm-ivory/60 p-4">
                                                <p className="text-[9px] font-semibold uppercase tracking-[0.17em] text-antique-gold">
                                                  Variant
                                                </p>

                                                <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-3 text-[11px] sm:grid-cols-3">
                                                  {item
                                                    .variant
                                                    .name && (
                                                    <div>
                                                      <p className="text-[9px] text-steel-gray">
                                                        Name
                                                      </p>

                                                      <p className="mt-1 font-medium">
                                                        {
                                                          item
                                                            .variant
                                                            .name
                                                        }
                                                      </p>
                                                    </div>
                                                  )}

                                                  {item
                                                    .variant
                                                    .color && (
                                                    <div>
                                                      <p className="text-[9px] text-steel-gray">
                                                        Color
                                                      </p>

                                                      <p className="mt-1 font-medium">
                                                        {
                                                          item
                                                            .variant
                                                            .color
                                                        }
                                                      </p>
                                                    </div>
                                                  )}

                                                  {item
                                                    .variant
                                                    .size && (
                                                    <div>
                                                      <p className="text-[9px] text-steel-gray">
                                                        Size
                                                      </p>

                                                      <p className="mt-1 font-medium">
                                                        {
                                                          item
                                                            .variant
                                                            .size
                                                        }
                                                      </p>
                                                    </div>
                                                  )}

                                                  {item
                                                    .variant
                                                    .material && (
                                                    <div>
                                                      <p className="text-[9px] text-steel-gray">
                                                        Material
                                                      </p>

                                                      <p className="mt-1 font-medium">
                                                        {
                                                          item
                                                            .variant
                                                            .material
                                                        }
                                                      </p>
                                                    </div>
                                                  )}

                                                  {item
                                                    .variant
                                                    .finish && (
                                                    <div>
                                                      <p className="text-[9px] text-steel-gray">
                                                        Finish
                                                      </p>

                                                      <p className="mt-1 font-medium">
                                                        {
                                                          item
                                                            .variant
                                                            .finish
                                                        }
                                                      </p>
                                                    </div>
                                                  )}

                                                  {item
                                                    .variant
                                                    .sku && (
                                                    <div>
                                                      <p className="text-[9px] text-steel-gray">
                                                        SKU
                                                      </p>

                                                      <p className="mt-1 font-mono font-medium">
                                                        {
                                                          item
                                                            .variant
                                                            .sku
                                                        }
                                                      </p>
                                                    </div>
                                                  )}
                                                </div>
                                              </div>
                                            )}

                                            {item.technologyModel && (
                                              <div className="mt-4 rounded-[15px] border border-champagne-gold/20 bg-soft-cream/60 p-4">
                                                <div className="flex items-start justify-between gap-4">
                                                  <div>
                                                    <p className="text-[9px] font-semibold uppercase tracking-[0.17em] text-antique-gold">
                                                      Smart Technology
                                                    </p>

                                                    <p className="mt-2 text-[12px] font-semibold">
                                                      {item
                                                        .technologyModel
                                                        .modelName ||
                                                        item
                                                          .technologyModel
                                                          .name ||
                                                        "Smart Technology"}
                                                    </p>

                                                    {item
                                                      .technologyModel
                                                      .technology
                                                      ?.name && (
                                                      <p className="mt-1 text-[10px] text-slate-gray">
                                                        {
                                                          item
                                                            .technologyModel
                                                            .technology
                                                            .name
                                                        }
                                                      </p>
                                                    )}
                                                  </div>

                                                  {Number(
                                                    item.technologyPrice ||
                                                      0
                                                  ) >
                                                    0 && (
                                                    <div className="text-right">
                                                      <p className="text-[9px] text-steel-gray">
                                                        Extra
                                                      </p>

                                                      <p className="mt-1 text-[12px] font-semibold">
                                                        +
                                                        {formatMoney(
                                                          item.technologyPrice
                                                        )}{" "}
                                                        EGP
                                                      </p>
                                                    </div>
                                                  )}
                                                </div>
                                              </div>
                                            )}

                                            <div className="mt-5 border-t border-light-champagne/75 pt-5">
                                              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                <div>
                                                  <p className="text-[9px] font-semibold uppercase tracking-[0.17em] text-steel-gray">
                                                    Manufacturing
                                                  </p>

                                                  <span
                                                    className={`mt-2 inline-flex rounded-full border px-3 py-1.5 text-[10px] font-semibold ${getManufacturingStatusStyle(
                                                      item.manufacturingStatus
                                                    )}`}
                                                  >
                                                    {formatStatus(
                                                      item.manufacturingStatus
                                                    )}
                                                  </span>
                                                </div>

                                                {item.smartUnit && (
                                                  <div className="sm:text-right">
                                                    <p className="text-[9px] text-steel-gray">
                                                      Smart Unit
                                                    </p>

                                                    <p className="mt-1 text-[10px] font-semibold">
                                                      {typeof item.smartUnit ===
                                                      "object"
                                                        ? item
                                                            .smartUnit
                                                            .name ||
                                                          item
                                                            .smartUnit
                                                            ._id
                                                        : item.smartUnit}
                                                    </p>
                                                  </div>
                                                )}
                                              </div>

                                              {manufacturingRequired && (
                                                <div className="mt-6">
                                                  <div className="relative hidden sm:block">
                                                    <div className="absolute left-[12.5%] right-[12.5%] top-4 h-px bg-light-champagne" />

                                                    {manufacturingIndex >
                                                      0 && (
                                                      <div
                                                        className="absolute left-[12.5%] top-4 h-px bg-classic-gold transition-all"
                                                        style={{
                                                          width: `${
                                                            (manufacturingIndex /
                                                              (manufacturingSteps.length -
                                                                1)) *
                                                            75
                                                          }%`,
                                                        }}
                                                      />
                                                    )}

                                                    <div className="relative grid grid-cols-4">
                                                      {manufacturingSteps.map(
                                                        (
                                                          step,
                                                          stepIndex
                                                        ) => {
                                                          const completed =
                                                            stepIndex <
                                                            manufacturingIndex;

                                                          const current =
                                                            stepIndex ===
                                                            manufacturingIndex;

                                                          return (
                                                            <div
                                                              key={
                                                                step.key
                                                              }
                                                              className="flex flex-col items-center"
                                                            >
                                                              <div
                                                                className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border ${
                                                                  completed
                                                                    ? "border-midnight-navy bg-midnight-navy text-soft-white"
                                                                    : current
                                                                      ? "border-classic-gold bg-soft-white text-classic-gold"
                                                                      : "border-light-champagne bg-soft-white text-steel-gray"
                                                                }`}
                                                              >
                                                                {completed
                                                                  ? "✓"
                                                                  : current
                                                                    ? "•"
                                                                    : ""}
                                                              </div>

                                                              <p
                                                                className={`mt-2 text-[9px] font-semibold ${
                                                                  completed ||
                                                                  current
                                                                    ? "text-midnight-navy"
                                                                    : "text-steel-gray"
                                                                }`}
                                                              >
                                                                {
                                                                  step.label
                                                                }
                                                              </p>
                                                            </div>
                                                          );
                                                        }
                                                      )}
                                                    </div>
                                                  </div>

                                                  <div className="sm:hidden">
                                                    <div className="h-1.5 overflow-hidden rounded-full bg-light-champagne/70">
                                                      <div
                                                        className="h-full rounded-full bg-classic-gold"
                                                        style={{
                                                          width: `${
                                                            manufacturingIndex >=
                                                            0
                                                              ? ((manufacturingIndex +
                                                                  1) /
                                                                  manufacturingSteps.length) *
                                                                100
                                                              : 0
                                                          }%`,
                                                        }}
                                                      />
                                                    </div>

                                                    <p className="mt-2 text-[9px] text-steel-gray">
                                                      {formatStatus(
                                                        item.manufacturingStatus
                                                      )}
                                                    </p>
                                                  </div>
                                                </div>
                                              )}

                                              {!manufacturingRequired && (
                                                <p className="mt-3 text-[10px] leading-5 text-steel-gray">
                                                  This product does not require a manufacturing workflow.
                                                </p>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      </article>
                                    );
                                  }
                                )}
                              </div>
                            </section>

                            <div className="mt-7 grid grid-cols-1 gap-5 lg:grid-cols-2">
                              <section className="rounded-[20px] border border-light-champagne/85 bg-soft-white p-5">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-antique-gold">
                                  Delivery
                                </p>

                                <h4 className="mt-1 font-serif text-[1.3rem]">
                                  Shipping Address
                                </h4>

                                <div className="mt-4 space-y-2 text-[11px] leading-5 text-slate-gray">
                                  <p className="text-[12px] font-semibold text-midnight-navy">
                                    {
                                      order
                                        .shippingAddress
                                        ?.firstName
                                    }{" "}
                                    {
                                      order
                                        .shippingAddress
                                        ?.lastName
                                    }
                                  </p>

                                  <p>
                                    {
                                      order
                                        .shippingAddress
                                        ?.phone
                                    }
                                  </p>

                                  <p>
                                    {
                                      order
                                        .shippingAddress
                                        ?.address
                                    }
                                  </p>

                                  <p>
                                    {
                                      order
                                        .shippingAddress
                                        ?.city
                                    }
                                    {order
                                      .shippingAddress
                                      ?.country
                                      ? `, ${order.shippingAddress.country}`
                                      : ""}
                                  </p>
                                </div>
                              </section>

                              <section className="rounded-[20px] border border-light-champagne/85 bg-soft-white p-5">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-antique-gold">
                                  Payment
                                </p>

                                <h4 className="mt-1 font-serif text-[1.3rem]">
                                  Order Total
                                </h4>

                                <div className="mt-4 space-y-3">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[11px] text-slate-gray">
                                      Subtotal
                                    </span>

                                    <span className="text-[11px] font-semibold">
                                      {formatMoney(
                                        order.subtotal
                                      )}{" "}
                                      EGP
                                    </span>
                                  </div>

                                  <div className="flex items-center justify-between">
                                    <span className="text-[11px] text-slate-gray">
                                      Shipping
                                    </span>

                                    <span className="text-[11px] font-semibold">
                                      {Number(
                                        order.shippingCost ||
                                          0
                                      ) === 0
                                        ? "Free"
                                        : `${formatMoney(
                                            order.shippingCost
                                          )} EGP`}
                                    </span>
                                  </div>

                                  <div className="flex items-end justify-between border-t border-light-champagne/80 pt-4">
                                    <span className="text-[12px] font-semibold">
                                      Total
                                    </span>

                                    <div>
                                      <span className="font-serif text-[1.6rem]">
                                        {formatMoney(
                                          order.total
                                        )}
                                      </span>

                                      <span className="ml-1 text-[9px] text-steel-gray">
                                        EGP
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </section>
                            </div>
                          </div>
                        )}
                      </article>
                    );
                  }
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
};

export default AccountPage;