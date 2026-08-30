import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getManufacturingOrders } from "../services/manufacturingApi";

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

const AdminManufacturingOrdersPage = () => {
  const [manufacturingOrders, setManufacturingOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

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
          "Unable to load manufacturing orders",
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
              Production
            </span>

            <span className="h-px w-8 bg-classic-gold/65" />
          </div>

          <h1 className="font-serif text-[2.6rem] font-normal leading-none tracking-[-0.04em] text-soft-white sm:text-[3.2rem]">
            Manufacturing Orders
          </h1>

          <p className="mt-4 text-[12px] leading-7 text-premium-silver/70 sm:text-[13px]">
            Smart unit assembly, production and packaging workflow.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-[20px] border border-antique-gold/25 bg-soft-cream p-5 text-[11px] text-antique-gold">
          {error}

          <button
            type="button"
            onClick={loadManufacturingOrders}
            className="ml-4 font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}

      {manufacturingOrders.length === 0 ? (
        <div className="relative overflow-hidden rounded-[28px] border border-light-champagne/90 bg-soft-white/85 p-12 text-center shadow-[0_14px_40px_rgba(7,19,31,0.045)]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-champagne-gold/25 bg-warm-ivory text-classic-gold">
            ✦
          </div>

          <h2 className="mt-6 font-serif text-[1.8rem] text-midnight-navy">
            No Manufacturing Orders
          </h2>

          <p className="mt-3 text-[11px] text-slate-gray">
            There are no manufacturing orders yet.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[28px] border border-light-champagne/90 bg-soft-white/85 shadow-[0_18px_50px_rgba(7,19,31,0.05)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead>
                <tr className="bg-midnight-navy">
                  <th className="px-6 py-5 text-[7px] font-semibold uppercase tracking-[0.2em] text-champagne-gold">
                    Order
                  </th>

                  <th className="px-6 py-5 text-[7px] font-semibold uppercase tracking-[0.2em] text-champagne-gold">
                    Product
                  </th>

                  <th className="px-6 py-5 text-[7px] font-semibold uppercase tracking-[0.2em] text-champagne-gold">
                    Smart Unit
                  </th>

                  <th className="px-6 py-5 text-[7px] font-semibold uppercase tracking-[0.2em] text-champagne-gold">
                    Units
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

                  const product = unit?.product || null;

                  const productName =
                    product?.name || "Unknown Product";

                  const unitName =
                    unit?.smartUnitInstance?.serialNumber ||
                    unit?.serialNumber ||
                    unit?.smartUnit?.name ||
                    "Not Assigned";

                  const status =
                    unit?.status ||
                    manufacturingOrder?.status ||
                    "pending";

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
                          {manufacturingOrder.units?.length || 0}
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1.5 text-[7px] font-semibold uppercase tracking-[0.08em] ${getStatusClasses(
                            status,
                          )}`}
                        >
                          {statusLabels[status] || status}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <p className="text-[9px] text-slate-gray">
                          {formatDate(manufacturingOrder.createdAt)}
                        </p>
                      </td>

                      <td className="px-6 py-5 text-right">
                        <Link
                          to={`/admin/manufacturing/${manufacturingOrder._id}`}
                          className="inline-flex min-h-[38px] items-center justify-center gap-3 rounded-full bg-midnight-navy px-5 text-[7px] font-semibold uppercase tracking-[0.1em] text-soft-white transition hover:bg-rich-navy"
                        >
                          Manage
                          <span className="text-champagne-gold">→</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

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