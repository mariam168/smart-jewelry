import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getManufacturingOrders } from "../services/manufacturingApi";

const statusLabels = {
  pending: "Pending",
  unit_assigned: "Unit Assigned",
  experience_created: "Experience Created",
  in_production: "In Production",
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

    case "completed":
      return "border-classic-gold/30 bg-soft-cream text-antique-gold";

    case "failed":
      return "border-antique-gold/25 bg-warm-ivory text-antique-gold";

    default:
      return "border-light-champagne bg-silver-mist text-slate-gray";
  }
};

const AdminManufacturingOrdersPage = () => {
  const [manufacturingOrders, setManufacturingOrders] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState("");

  const loadManufacturingOrders = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await getManufacturingOrders();

      console.log("MANUFACTURING ORDERS:", response);

      const data =
        response?.data?.data ||
        response?.data?.manufacturingOrders ||
        response?.data ||
        [];

      setManufacturingOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Unable to load manufacturing orders:", error);

      setError(
        error?.response?.data?.message || "Unable to load manufacturing orders",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadManufacturingOrders();
  }, []);

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
              Loading manufacturing orders...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative min-h-[400px] overflow-hidden p-1">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[360px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-soft-cream blur-[100px]" />

        <div className="relative rounded-[24px] border border-antique-gold/25 bg-soft-white/85 p-8 shadow-[0_12px_35px_rgba(7,19,31,0.04)] backdrop-blur-sm">
          <p className="text-[11px] leading-6 text-antique-gold">{error}</p>
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

        <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-champagne-gold/[0.07] blur-[90px]" />

        <div className="relative z-10">
          <div className="mb-4 flex items-center gap-3">
            <span className="h-px w-8 bg-classic-gold/65" />

            <span className="text-[8px] font-semibold uppercase tracking-[0.34em] text-champagne-gold">
              Production
            </span>

            <span className="h-px w-8 bg-classic-gold/65" />
          </div>

          <h1 className="font-serif text-[2.6rem] font-normal leading-none tracking-[-0.04em] text-soft-white sm:text-[3.2rem]">
            Manufacturing Orders
          </h1>

          <p className="mt-4 text-[12px] leading-7 text-premium-silver/70 sm:text-[13px]">
            Manage your production orders.
          </p>
        </div>
      </div>

      {manufacturingOrders.length === 0 ? (
        <div className="relative overflow-hidden rounded-[28px] border border-light-champagne/90 bg-soft-white/85 p-12 text-center shadow-[0_14px_40px_rgba(7,19,31,0.045)] backdrop-blur-sm">
          <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full border border-champagne-gold/10" />

          <div className="pointer-events-none absolute -bottom-24 -left-20 h-56 w-56 rounded-full border border-champagne-gold/[0.08]" />

          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[280px] w-[380px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-soft-cream blur-[85px]" />

          <div className="relative">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-champagne-gold/25 bg-warm-ivory text-[16px] text-classic-gold shadow-[0_8px_22px_rgba(7,19,31,0.04)]">
              ✦
            </div>

            <h2 className="mt-6 font-serif text-[1.8rem] font-normal tracking-[-0.025em] text-midnight-navy">
              No Manufacturing Orders
            </h2>

            <p className="mt-3 text-[11px] leading-6 text-slate-gray">
              There are no manufacturing orders yet.
            </p>
          </div>
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-[28px] border border-light-champagne/90 bg-soft-white/85 shadow-[0_18px_50px_rgba(7,19,31,0.05)] backdrop-blur-sm">
          <div className="pointer-events-none absolute -right-28 -top-28 h-64 w-64 rounded-full bg-soft-cream blur-[80px]" />

          <div className="relative overflow-x-auto">
            <table className="w-full min-w-[850px] text-left">
              <thead>
                <tr className="border-b border-soft-white/10 bg-midnight-navy">
                  <th className="px-6 py-5 text-[7px] font-semibold uppercase tracking-[0.2em] text-champagne-gold">
                    Order
                  </th>

                  <th className="px-6 py-5 text-[7px] font-semibold uppercase tracking-[0.2em] text-champagne-gold">
                    Product
                  </th>

                  <th className="px-6 py-5 text-[7px] font-semibold uppercase tracking-[0.2em] text-champagne-gold">
                    Unit
                  </th>

                  <th className="px-6 py-5 text-[7px] font-semibold uppercase tracking-[0.2em] text-champagne-gold">
                    Status
                  </th>

                  <th className="px-6 py-5 text-[7px] font-semibold uppercase tracking-[0.2em] text-champagne-gold">
                    Created
                  </th>

                  <th className="px-6 py-5 text-right text-[7px] font-semibold uppercase tracking-[0.2em] text-champagne-gold">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-light-champagne/65">
                {manufacturingOrders.map((manufacturingOrder) => {
                  const unit = manufacturingOrder?.units?.[0];

                  const orderItem = manufacturingOrder?.order?.items?.find(
                    (item) =>
                      item?._id?.toString() === unit?.orderItemId?.toString(),
                  );

                  const product = unit?.product || orderItem?.product || null;

                  const productName =
                    product?.name || orderItem?.name || "Unknown Product";

                  const unitName =
                    unit?.smartUnit?.serialNumber ||
                    unit?.serialNumber ||
                    unit?.smartUnit?.name ||
                    "Not Assigned";

                  const status =
                    unit?.status || manufacturingOrder?.status || "pending";

                  return (
                    <tr
                      key={manufacturingOrder._id}
                      className="group transition-colors duration-300 hover:bg-warm-ivory/55"
                    >
                      <td className="px-6 py-5">
                        <div>
                          <p className="font-serif text-[1.05rem] font-normal text-midnight-navy">
                            {manufacturingOrder?.orderNumber || "N/A"}
                          </p>

                          {manufacturingOrder?.order?.orderNumber && (
                            <p className="mt-1.5 text-[8px] text-steel-gray">
                              Original Order:{" "}
                              {manufacturingOrder.order.orderNumber}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3.5">
                          {product?.image ||
                          product?.primaryImage ||
                          product?.images?.[0] ? (
                            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-[13px] border border-light-champagne/80 bg-soft-cream shadow-[0_5px_15px_rgba(7,19,31,0.03)]">
                              <img
                                src={
                                  product?.image ||
                                  product?.primaryImage ||
                                  product?.images?.[0]
                                }
                                alt={productName}
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                              />

                              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-luxury-black/10 to-transparent" />
                            </div>
                          ) : (
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[13px] border border-light-champagne/80 bg-soft-cream text-[9px] text-classic-gold">
                              ✦
                            </div>
                          )}

                          <p className="max-w-[230px] truncate text-[11px] font-semibold text-midnight-navy">
                            {productName}
                          </p>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <p className="text-[10px] font-semibold text-midnight-navy">
                          {unitName}
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex items-center rounded-full border px-3 py-1.5 text-[7px] font-semibold uppercase tracking-[0.08em] ${getStatusClasses(
                            status,
                          )}`}
                        >
                          {statusLabels[status] || status}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <p className="text-[9px] text-slate-gray">
                          {manufacturingOrder?.createdAt
                            ? new Date(
                                manufacturingOrder.createdAt,
                              ).toLocaleDateString("en-GB")
                            : "N/A"}
                        </p>
                      </td>

                      <td className="px-6 py-5 text-right">
                        <Link
                          to={`/admin/manufacturing/${manufacturingOrder._id}`}
                          className="group/action inline-flex min-h-[38px] items-center justify-center gap-2.5 rounded-full bg-midnight-navy px-4 text-[7px] font-semibold uppercase tracking-[0.1em] text-soft-white shadow-[0_7px_18px_rgba(18,38,58,0.12)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-rich-navy hover:shadow-[0_10px_24px_rgba(18,38,58,0.18)]"
                        >
                          Manage
                          <span className="text-[11px] text-champagne-gold transition-transform duration-300 group-hover/action:translate-x-1">
                            →
                          </span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="relative flex items-center justify-center gap-3 border-t border-light-champagne/70 px-6 py-4">
            <span className="h-px w-8 bg-classic-gold/30" />

            <span className="h-px w-8 bg-classic-gold/30" />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminManufacturingOrdersPage;
