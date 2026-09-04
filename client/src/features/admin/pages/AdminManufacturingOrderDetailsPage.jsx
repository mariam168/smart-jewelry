import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import api from "../../../lib/axios";

import {
  getManufacturingOrderById,
  assignSmartUnit,
  updateAssemblyCost,
  createExperienceForUnit,
  startProductionUnit,
  completeProductionUnit,
  startPackaging,
  completePackaging,
  cancelManufacturingOrder,
} from "../services/manufacturingApi";

import {
  getSmartUnits,
  getSmartUnitInstances,
} from "../smart-units/services/smartUnitApi";

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

const statusClasses = {
  pending:
    "border-champagne-gold/30 bg-champagne-gold/10 text-antique-gold",

  unit_assigned:
    "border-light-champagne bg-silver-mist text-navy-soft",

  experience_created:
    "border-classic-gold/30 bg-soft-cream text-antique-gold",

  in_production:
    "border-navy-soft/20 bg-silver-mist text-navy-soft",

  ready_for_packaging:
    "border-champagne-gold/30 bg-warm-ivory text-antique-gold",

  packaging:
    "border-classic-gold/30 bg-champagne-gold/10 text-antique-gold",

  completed:
    "border-classic-gold/30 bg-soft-cream text-antique-gold",

  failed:
    "border-antique-gold/25 bg-warm-ivory text-antique-gold",
};

const formatDate = (value) => {
  if (!value) {
    return "N/A";
  }

  return new Date(value).toLocaleString(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  );
};

const formatMoney = (value) => {
  return `${Number(
    value || 0,
  ).toLocaleString()} EGP`;
};

const getImageUrl = (image) => {
  if (!image) {
    return "";
  }

  if (
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("blob:")
  ) {
    return image;
  }

  const backendUrl =
    import.meta.env
      .VITE_BACKEND_URL || "";

  const normalizedImage =
    image.startsWith("/")
      ? image
      : `/${image}`;

  return `${backendUrl}${normalizedImage}`;
};

const getProductImage = (product) => {
  return (
    product?.image ||
    product?.primaryImage ||
    product?.images?.[0] ||
    ""
  );
};

const getFrontendOrigin = () => {
  if (
    typeof window !== "undefined" &&
    window.location?.origin
  ) {
    return window.location.origin.replace(/\/+$/, "");
  }

  return String(
    import.meta.env.VITE_FRONTEND_URL ||
      "https://jevorya.com",
  ).replace(/\/+$/, "");
};

const FRONTEND_ORIGIN =
  getFrontendOrigin();

/*
 * WhatsApp needs the Egyptian number in
 * international format without + or spaces.
 * 01223358023 -> 201223358023
 */
const WHATSAPP_NUMBER =
  "201223358023";

const formatSlugInput = (value) => {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\u0600-\u06FF-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
};

const getManageExperienceUrl = (
  experience,
) => {
  if (!experience?.manageToken) {
    return "";
  }

  return `${FRONTEND_ORIGIN}/experience/manage/${encodeURIComponent(
    experience.manageToken,
  )}`;
};

const getPublicExperienceUrl = (
  experience,
) => {
  if (
    !experience?.serialNumber ||
    !experience?.slug
  ) {
    return "";
  }

  return `${FRONTEND_ORIGIN}/experience/public/${encodeURIComponent(
    experience.serialNumber,
  )}/${encodeURIComponent(
    experience.slug,
  )}`;
};

const getWhatsAppShareUrl = (
  publicUrl,
  requestedName = "",
) => {
  if (!publicUrl) {
    return "";
  }

  const lines = [
    "JEVORYA",
    requestedName
      ? `Name: ${requestedName}`
      : "",
    "Your smart jewelry experience is ready:",
    publicUrl,
  ].filter(Boolean);

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    lines.join("\n"),
  )}`;
};

const InfoRow = ({
  label,
  value,
}) => {
  return (
    <div className="border-b border-light-champagne/70 py-3 last:border-none">
      <p className="text-[8px] font-semibold uppercase tracking-[0.16em] text-steel-gray">
        {label}
      </p>

      <p className="mt-1.5 break-words text-[11px] text-midnight-navy">
        {value !== undefined &&
        value !== null &&
        value !== ""
          ? value
          : "N/A"}
      </p>
    </div>
  );
};

const AdminManufacturingOrderDetailsPage =
  () => {
    const { id } = useParams();

    const [
      manufacturingOrder,
      setManufacturingOrder,
    ] = useState(null);

    const [
      customerOrder,
      setCustomerOrder,
    ] = useState(null);

    const [
      smartUnits,
      setSmartUnits,
    ] = useState([]);

    const [
      unitForms,
      setUnitForms,
    ] = useState({});

    const [
      instancesByUnit,
      setInstancesByUnit,
    ] = useState({});

    const [
      loading,
      setLoading,
    ] = useState(true);

    const [
      workingKey,
      setWorkingKey,
    ] = useState("");

    const [
      error,
      setError,
    ] = useState("");

    const syncForms = (order) => {
      const next = {};

      for (
        const unit of
          order?.units || []
      ) {
        next[unit._id] = {
          smartUnitId:
            unit.smartUnit?._id ||
            unit.smartUnit ||
            "",

          smartUnitInstanceId:
            unit
              .smartUnitInstance
              ?._id ||
            unit.smartUnitInstance ||
            "",

          assemblyCost:
            unit.assemblyCost ??
            0,

          packagingCost:
            unit.packagingCost ??
            0,

          packagingNotes:
            unit.packagingNotes ||
            "",

          productionNotes:
            unit.notes || "",

          experienceSlug:
            unit.experience?.slug ||
            "",
        };
      }

      setUnitForms(next);
    };

    const loadOrder = async () => {
      try {
        setLoading(true);

        setError("");

        const response =
          await getManufacturingOrderById(
            id,
          );

        const data =
          response?.data ??
          response;

        if (!data?._id) {
          throw new Error(
            "Manufacturing order was not found",
          );
        }

        setManufacturingOrder(
          data,
        );

        syncForms(data);

        const orderId =
          data?.order?._id ||
          data?.order ||
          null;

        if (orderId) {
          const orderResponse =
            await api.get(
              `/orders/admin/${orderId}`,
            );

          const fullOrder =
            orderResponse?.data?.data ??
            orderResponse?.data ??
            null;

          setCustomerOrder(
            fullOrder,
          );
        } else {
          setCustomerOrder(null);
        }
      } catch (error) {
        console.error(
          "LOAD MANUFACTURING ORDER ERROR:",
          error,
        );

        setError(
          error?.response?.data
            ?.message ||
            error?.message ||
            "Unable to load manufacturing order",
        );
      } finally {
        setLoading(false);
      }
    };

    const loadSmartUnits =
      async () => {
        try {
          const response =
            await getSmartUnits();

          const data =
            response?.data
              ?.smartUnits ||
            response?.data?.data
              ?.smartUnits ||
            response?.smartUnits ||
            response?.data ||
            [];

          setSmartUnits(
            Array.isArray(data)
              ? data
              : [],
          );
        } catch (error) {
          console.error(
            "LOAD SMART UNITS ERROR:",
            error,
          );
        }
      };

    useEffect(() => {
      if (!id) return;

      loadOrder();

      loadSmartUnits();
    }, [id]);

    const updateUnitForm = (
      unitId,
      field,
      value,
    ) => {
      setUnitForms(
        (previous) => ({
          ...previous,

          [unitId]: {
            ...previous[
              unitId
            ],

            [field]:
              value,
          },
        }),
      );
    };

    const loadInstances =
      async (
        unitId,
        smartUnitId,
      ) => {
        if (!smartUnitId) {
          setInstancesByUnit(
            (previous) => ({
              ...previous,

              [unitId]:
                [],
            }),
          );

          return;
        }

        try {
          const response =
            await getSmartUnitInstances(
              smartUnitId,
            );

          const data =
            response?.data
              ?.instances ||
            response?.data
              ?.smartUnitInstances ||
            response?.data?.data
              ?.instances ||
            response?.instances ||
            response?.data ||
            [];

          const instances =
            Array.isArray(data)
              ? data.filter(
                  (
                    instance,
                  ) =>
                    instance.status ===
                    "available",
                )
              : [];

          setInstancesByUnit(
            (previous) => ({
              ...previous,

              [unitId]:
                instances,
            }),
          );
        } catch (error) {
          console.error(
            "LOAD SMART UNIT INSTANCES ERROR:",
            error,
          );

          setInstancesByUnit(
            (previous) => ({
              ...previous,

              [unitId]:
                [],
            }),
          );
        }
      };

    const handleSmartUnitChange =
      async (
        unitId,
        smartUnitId,
      ) => {
        updateUnitForm(
          unitId,
          "smartUnitId",
          smartUnitId,
        );

        updateUnitForm(
          unitId,
          "smartUnitInstanceId",
          "",
        );

        await loadInstances(
          unitId,
          smartUnitId,
        );
      };

    const runAction = async (
      key,
      callback,
    ) => {
      try {
        setWorkingKey(key);

        setError("");

        const response =
          await callback();

        const data =
          response?.data ??
          response;

        if (data?._id) {
          setManufacturingOrder(
            data,
          );

          syncForms(data);
        } else {
          await loadOrder();
        }
      } catch (error) {
        console.error(
          "MANUFACTURING ACTION ERROR:",
          error,
        );

        setError(
          error?.response
            ?.data?.message ||
            error?.message ||
            "Operation failed",
        );
      } finally {
        setWorkingKey("");
      }
    };

    const handleAssignSmartUnit =
      async (unit) => {
        const form =
          unitForms[
            unit._id
          ] || {};

        if (
          !form.smartUnitId
        ) {
          setError(
            "Please select a Smart Unit.",
          );

          return;
        }

        if (
          !form.smartUnitInstanceId
        ) {
          setError(
            "Please select a physical Smart Unit instance.",
          );

          return;
        }

        await runAction(
          `assign-${unit._id}`,
          () =>
            assignSmartUnit(
              id,
              unit._id,
              form.smartUnitId,
              form.smartUnitInstanceId,
              Number(
                form.assemblyCost ||
                  0,
              ),
            ),
        );
      };

    const handleSaveAssemblyCost =
      async (unit) => {
        const form =
          unitForms[
            unit._id
          ] || {};

        await runAction(
          `assembly-${unit._id}`,
          () =>
            updateAssemblyCost(
              id,
              unit._id,
              Number(
                form.assemblyCost ||
                  0,
              ),
            ),
        );
      };

    const handleCreateExperience =
      async (unit) => {
        await runAction(
          `experience-${unit._id}`,
          () =>
            createExperienceForUnit(
              id,
              unit._id,
              {
                type:
                  "personal",
              },
            ),
        );
      };

    const handleUseCustomerName = (
      unitId,
    ) => {
      const requestedName =
        customerOrder?.manufacturingName ||
        "";

      const slug =
        formatSlugInput(
          requestedName,
        );

      if (!slug) {
        setError(
          "The customer manufacturing name is missing or cannot be used as a URL name.",
        );

        return;
      }

      setError("");

      updateUnitForm(
        unitId,
        "experienceSlug",
        slug,
      );
    };

    const handleSaveExperienceSlug =
      async (unit) => {
        const experience =
          unit?.experience ||
          null;

        if (
          !experience?.manageToken
        ) {
          setError(
            "Experience management token is missing.",
          );

          return;
        }

        const form =
          unitForms[
            unit._id
          ] || {};

        const slug =
          formatSlugInput(
            form.experienceSlug,
          );

        if (!slug) {
          setError(
            "Please enter a valid public URL name.",
          );

          return;
        }

        await runAction(
          `slug-${unit._id}`,
          async () => {
            await api.put(
              `/experience/manage/${encodeURIComponent(
                experience.manageToken,
              )}/slug`,
              {
                slug,
              },
            );

            return getManufacturingOrderById(
              id,
            );
          },
        );
      };

    const handleCopyPublicLink =
      async (publicUrl) => {
        if (!publicUrl) {
          return;
        }

        try {
          await navigator.clipboard.writeText(
            publicUrl,
          );
        } catch (error) {
          console.error(
            "COPY PUBLIC LINK ERROR:",
            error,
          );

          window.prompt(
            "Copy this public link:",
            publicUrl,
          );
        }
      };

    const handleStartProduction =
      async (unit) => {
        await runAction(
          `start-${unit._id}`,
          () =>
            startProductionUnit(
              id,
              unit._id,
            ),
        );
      };

    const handleCompleteProduction =
      async (unit) => {
        const form =
          unitForms[
            unit._id
          ] || {};

        await runAction(
          `production-complete-${unit._id}`,
          () =>
            completeProductionUnit(
              id,
              unit._id,
              form.productionNotes ||
                "",
            ),
        );
      };

    const handleStartPackaging =
      async (unit) => {
        await runAction(
          `packaging-start-${unit._id}`,
          () =>
            startPackaging(
              id,
              unit._id,
            ),
        );
      };

    const handleCompletePackaging =
      async (unit) => {
        const form =
          unitForms[
            unit._id
          ] || {};

        await runAction(
          `packaging-complete-${unit._id}`,
          () =>
            completePackaging(
              id,
              unit._id,
              Number(
                form.packagingCost ||
                  0,
              ),
              form.packagingNotes ||
                "",
            ),
        );
      };

    const handleCancelOrder =
      async () => {
        const confirmed =
          window.confirm(
            "Are you sure you want to cancel this manufacturing order?",
          );

        if (!confirmed) {
          return;
        }

        await runAction(
          "cancel-order",
          () =>
            cancelManufacturingOrder(
              id,
            ),
        );
      };

    if (loading) {
      return (
        <div className="flex min-h-[500px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-light-champagne border-t-classic-gold" />

            <p className="mt-5 text-[9px] font-semibold uppercase tracking-[0.25em] text-steel-gray">
              Loading
              Manufacturing
            </p>
          </div>
        </div>
      );
    }

    if (
      !manufacturingOrder
    ) {
      return (
        <div className="rounded-[24px] border border-light-champagne bg-soft-white p-10 text-center">
          <p className="text-antique-gold">
            {error ||
              "Manufacturing order not found"}
          </p>

          <Link
            to="/admin/manufacturing"
            className="mt-5 inline-flex rounded-full bg-midnight-navy px-5 py-3 text-[9px] font-semibold uppercase text-soft-white"
          >
            Back
          </Link>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        <div>
          <Link
            to="/admin/manufacturing"
            className="text-[9px] font-semibold uppercase tracking-[0.13em] text-steel-gray transition hover:text-midnight-navy"
          >
            ← Manufacturing
            Orders
          </Link>
        </div>

        <div className="relative overflow-hidden rounded-[28px] bg-midnight-navy px-7 py-8 text-soft-white shadow-[0_24px_65px_rgba(7,19,31,0.16)] sm:px-9">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-rich-navy via-midnight-navy to-luxury-black" />

          <div className="relative">
            <div className="mb-3 flex items-center gap-3">
              <span className="h-px w-8 bg-classic-gold" />

              <span className="text-[8px] font-semibold uppercase tracking-[0.3em] text-champagne-gold">
                Manufacturing
              </span>
            </div>

            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h1 className="font-serif text-[2.6rem] tracking-[-0.04em]">
                  #
                  {
                    manufacturingOrder.orderNumber
                  }
                </h1>

                <p className="mt-3 text-[11px] text-premium-silver/70">
                  Smart unit,
                  experience,
                  production and
                  packaging
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-champagne-gold/20 bg-white/5 px-4 py-2 text-[8px] font-semibold uppercase tracking-[0.12em] text-champagne-gold">
                  {manufacturingOrder.status?.replaceAll(
                    "_",
                    " ",
                  )}
                </span>

                {manufacturingOrder.status !==
                  "completed" &&
                  manufacturingOrder.status !==
                    "cancelled" && (
                    <button
                      type="button"
                      onClick={
                        handleCancelOrder
                      }
                      disabled={
                        workingKey ===
                        "cancel-order"
                      }
                      className="rounded-full border border-white/15 px-4 py-2 text-[8px] font-semibold uppercase tracking-[0.1em] text-soft-white transition hover:border-champagne-gold/50 disabled:opacity-50"
                    >
                      {workingKey ===
                      "cancel-order"
                        ? "Cancelling..."
                        : "Cancel"}
                    </button>
                  )}
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-[18px] border border-antique-gold/25 bg-soft-cream px-5 py-4 text-[11px] text-antique-gold">
            {error}
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-3">
          <div className="rounded-[22px] border border-light-champagne bg-soft-white p-5">
            <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-steel-gray">
              Production Units
            </p>

            <p className="mt-3 font-serif text-[2rem] text-midnight-navy">
              {manufacturingOrder
                .units?.length ||
                0}
            </p>
          </div>

          <div className="rounded-[22px] border border-light-champagne bg-soft-white p-5">
            <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-steel-gray">
              Started
            </p>

            <p className="mt-3 text-[11px] text-midnight-navy">
              {formatDate(
                manufacturingOrder.startedAt,
              )}
            </p>
          </div>

          <div className="rounded-[22px] border border-light-champagne bg-soft-white p-5">
            <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-steel-gray">
              Completed
            </p>

            <p className="mt-3 text-[11px] text-midnight-navy">
              {formatDate(
                manufacturingOrder.completedAt,
              )}
            </p>
          </div>
        </div>

        <div className="space-y-7">
          {manufacturingOrder.units?.map(
            (
              unit,
              index,
            ) => {
              const form =
                unitForms[
                  unit._id
                ] || {};

              const orderItem =
                manufacturingOrder.order?.items?.find(
                  (
                    item,
                  ) =>
                    item._id?.toString() ===
                    unit.orderItemId?.toString(),
                ) || null;

              const product =
                unit.product ||
                orderItem?.product ||
                null;

              const productImage =
                getProductImage(
                  product,
                );

              const experience =
                unit.experience ||
                null;

              const manageExperienceUrl =
                getManageExperienceUrl(
                  experience,
                );

              const publicExperienceUrl =
                getPublicExperienceUrl(
                  experience,
                );

              const requestedName =
                customerOrder?.manufacturingName ||
                "";

              const manufacturingNotes =
                customerOrder?.manufacturingNotes ||
                "";

              const whatsappShareUrl =
                getWhatsAppShareUrl(
                  publicExperienceUrl,
                  requestedName,
                );

              const selectedInstances =
                instancesByUnit[
                  unit._id
                ] || [];

              const status =
                unit.status ||
                "pending";

              return (
                <section
                  key={
                    unit._id
                  }
                  className="overflow-hidden rounded-[28px] border border-light-champagne bg-soft-white shadow-[0_14px_40px_rgba(7,19,31,0.045)]"
                >
                  <div className="flex flex-col gap-5 border-b border-light-champagne bg-warm-ivory/50 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-[8px] font-semibold uppercase tracking-[0.24em] text-antique-gold">
                        Production Unit{" "}
                        {index +
                          1}
                      </p>

                      <h2 className="mt-2 font-serif text-[1.55rem] text-midnight-navy">
                        {product?.name ||
                          "Product"}
                      </h2>
                    </div>

                    <span
                      className={`inline-flex w-fit rounded-full border px-4 py-2 text-[8px] font-semibold uppercase tracking-[0.08em] ${
                        statusClasses[
                          status
                        ] ||
                        statusClasses.pending
                      }`}
                    >
                      {statusLabels[
                        status
                      ] ||
                        status}
                    </span>
                  </div>

                  <div className="grid gap-8 p-6 lg:grid-cols-[310px_minmax(0,1fr)]">
                    <div className="space-y-5">
                      <div className="overflow-hidden rounded-[22px] border border-light-champagne bg-warm-ivory">
                        {productImage ? (
                          <img
                            src={getImageUrl(
                              productImage,
                            )}
                            alt={
                              product?.name ||
                              "Product"
                            }
                            className="aspect-square w-full object-cover"
                          />
                        ) : (
                          <div className="flex aspect-square items-center justify-center text-2xl text-classic-gold">
                            ✦
                          </div>
                        )}
                      </div>

                      <div className="rounded-[20px] border border-light-champagne bg-warm-ivory/55 p-5">
                        <p className="mb-3 text-[8px] font-semibold uppercase tracking-[0.2em] text-antique-gold">
                          Product
                          Information
                        </p>

                        <InfoRow
                          label="Product"
                          value={
                            product?.name
                          }
                        />

                        <InfoRow
                          label="SKU"
                          value={
                            product?.sku
                          }
                        />

                        <InfoRow
                          label="Material"
                          value={
                            orderItem
                              ?.variant
                              ?.material ||
                            product?.material
                          }
                        />

                        <InfoRow
                          label="Color"
                          value={
                            orderItem
                              ?.variant
                              ?.color ||
                            product?.color
                          }
                        />

                        <InfoRow
                          label="Variant"
                          value={
                            orderItem
                              ?.variant
                              ?.name ||
                            "Standard"
                          }
                        />

                        <InfoRow
                          label="Technology"
                          value={
                            orderItem
                              ?.technologyModel
                              ?.modelName ||
                            orderItem
                              ?.technologyModel
                              ?.name ||
                            "N/A"
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="rounded-[22px] border border-light-champagne p-5">
                        <div className="mb-5 flex items-center justify-between">
                          <div>
                            <p className="text-[8px] font-semibold uppercase tracking-[0.22em] text-antique-gold">
                              Step 01
                            </p>

                            <h3 className="mt-2 font-serif text-[1.3rem] text-midnight-navy">
                              Smart
                              Unit
                              Assembly
                            </h3>
                          </div>

                          <span className="text-classic-gold">
                            ✦
                          </span>
                        </div>

                        {!unit.smartUnit ? (
                          <div className="grid gap-4 md:grid-cols-2">
                            <div>
                              <label className="mb-2 block text-[8px] font-semibold uppercase tracking-[0.14em] text-steel-gray">
                                Smart
                                Unit
                                Model
                              </label>

                              <select
                                value={
                                  form.smartUnitId ||
                                  ""
                                }
                                onChange={(
                                  event,
                                ) =>
                                  handleSmartUnitChange(
                                    unit._id,
                                    event
                                      .target
                                      .value,
                                  )
                                }
                                className="w-full rounded-[13px] border border-light-champagne bg-warm-ivory px-4 py-3 text-[11px] outline-none focus:border-classic-gold"
                              >
                                <option value="">
                                  Select
                                  Smart
                                  Unit
                                </option>

                                {smartUnits.map(
                                  (
                                    smartUnit,
                                  ) => (
                                    <option
                                      key={
                                        smartUnit._id
                                      }
                                      value={
                                        smartUnit._id
                                      }
                                    >
                                      {
                                        smartUnit.name
                                      }
                                    </option>
                                  ),
                                )}
                              </select>
                            </div>

                            <div>
                              <label className="mb-2 block text-[8px] font-semibold uppercase tracking-[0.14em] text-steel-gray">
                                Physical
                                Unit
                              </label>

                              <select
                                value={
                                  form.smartUnitInstanceId ||
                                  ""
                                }
                                onChange={(
                                  event,
                                ) =>
                                  updateUnitForm(
                                    unit._id,
                                    "smartUnitInstanceId",
                                    event
                                      .target
                                      .value,
                                  )
                                }
                                disabled={
                                  !form.smartUnitId
                                }
                                className="w-full rounded-[13px] border border-light-champagne bg-warm-ivory px-4 py-3 text-[11px] outline-none disabled:opacity-50"
                              >
                                <option value="">
                                  Select
                                  Serial
                                  Number
                                </option>

                                {selectedInstances.map(
                                  (
                                    instance,
                                  ) => (
                                    <option
                                      key={
                                        instance._id
                                      }
                                      value={
                                        instance._id
                                      }
                                    >
                                      {
                                        instance.serialNumber
                                      }
                                    </option>
                                  ),
                                )}
                              </select>
                            </div>

                            <div className="md:col-span-2">
                              <label className="mb-2 block text-[8px] font-semibold uppercase tracking-[0.14em] text-steel-gray">
                                Smart
                                Unit
                                Installation
                                Cost
                              </label>

                              <div className="relative max-w-sm">
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={
                                    form.assemblyCost ??
                                    0
                                  }
                                  onChange={(
                                    event,
                                  ) =>
                                    updateUnitForm(
                                      unit._id,
                                      "assemblyCost",
                                      event
                                        .target
                                        .value,
                                    )
                                  }
                                  className="w-full rounded-[13px] border border-light-champagne bg-warm-ivory px-4 py-3 pr-14 text-[11px] outline-none focus:border-classic-gold"
                                />

                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-semibold text-antique-gold">
                                  EGP
                                </span>
                              </div>
                            </div>

                            <div className="md:col-span-2">
                              <button
                                type="button"
                                onClick={() =>
                                  handleAssignSmartUnit(
                                    unit,
                                  )
                                }
                                disabled={
                                  workingKey ===
                                  `assign-${unit._id}`
                                }
                                className="inline-flex rounded-[13px] bg-midnight-navy px-6 py-3 text-[8px] font-semibold uppercase tracking-[0.12em] text-soft-white transition hover:bg-rich-navy disabled:opacity-50"
                              >
                                {workingKey ===
                                `assign-${unit._id}`
                                  ? "Assigning..."
                                  : "Assign Smart Unit"}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="grid gap-4 md:grid-cols-3">
                              <InfoRow
                                label="Smart Unit"
                                value={
                                  unit
                                    .smartUnit
                                    ?.name ||
                                  "Assigned"
                                }
                              />

                              <InfoRow
                                label="Serial Number"
                                value={
                                  unit
                                    .smartUnitInstance
                                    ?.serialNumber ||
                                  unit.serialNumber
                                }
                              />

                              <InfoRow
                                label="Unit Status"
                                value={
                                  unit
                                    .smartUnitInstance
                                    ?.status ||
                                  "N/A"
                                }
                              />
                            </div>

                            <div className="mt-5">
                              <label className="mb-2 block text-[8px] font-semibold uppercase tracking-[0.14em] text-steel-gray">
                                Smart
                                Unit
                                Installation
                                Cost
                              </label>

                              <div className="flex max-w-md gap-3">
                                <div className="relative flex-1">
                                  <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={
                                      form.assemblyCost ??
                                      0
                                    }
                                    onChange={(
                                      event,
                                    ) =>
                                      updateUnitForm(
                                        unit._id,
                                        "assemblyCost",
                                        event
                                          .target
                                          .value,
                                      )
                                    }
                                    className="w-full rounded-[13px] border border-light-champagne bg-warm-ivory px-4 py-3 pr-14 text-[11px] outline-none focus:border-classic-gold"
                                  />

                                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-semibold text-antique-gold">
                                    EGP
                                  </span>
                                </div>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleSaveAssemblyCost(
                                      unit,
                                    )
                                  }
                                  disabled={
                                    workingKey ===
                                    `assembly-${unit._id}`
                                  }
                                  className="rounded-[13px] bg-midnight-navy px-5 text-[8px] font-semibold uppercase tracking-[0.1em] text-soft-white disabled:opacity-50"
                                >
                                  {workingKey ===
                                  `assembly-${unit._id}`
                                    ? "Saving..."
                                    : "Save"}
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="rounded-[22px] border border-champagne-gold/30 bg-soft-cream/35 p-5">
                        <div className="mb-5 flex items-center justify-between">
                          <div>
                            <p className="text-[8px] font-semibold uppercase tracking-[0.22em] text-antique-gold">
                              Step 02
                            </p>

                            <h3 className="mt-2 font-serif text-[1.3rem] text-midnight-navy">
                              Experience
                            </h3>
                          </div>

                          <span className="text-classic-gold">
                            ✦
                          </span>
                        </div>

                        <div className="mb-5 grid gap-4 md:grid-cols-2">
                          <div className="rounded-[16px] border border-champagne-gold/25 bg-soft-white p-4">
                            <p className="text-[7px] font-semibold uppercase tracking-[0.18em] text-antique-gold">
                              Customer Requested Name
                            </p>

                            <p className="mt-2 font-serif text-[1.15rem] text-midnight-navy">
                              {requestedName ||
                                "Not provided"}
                            </p>
                          </div>

                          <div className="rounded-[16px] border border-light-champagne bg-soft-white p-4">
                            <p className="text-[7px] font-semibold uppercase tracking-[0.18em] text-steel-gray">
                              Customer Notes
                            </p>

                            <p className="mt-2 whitespace-pre-wrap text-[10px] leading-5 text-slate-gray">
                              {manufacturingNotes ||
                                "No manufacturing notes"}
                            </p>
                          </div>
                        </div>

                        {experience ? (
                          <div>
                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                              <InfoRow
                                label="Serial"
                                value={
                                  experience.serialNumber
                                }
                              />

                              <InfoRow
                                label="Current Slug"
                                value={
                                  experience.slug
                                }
                              />

                              <InfoRow
                                label="Type"
                                value={
                                  experience.type
                                }
                              />

                              <InfoRow
                                label="Status"
                                value={
                                  experience.status
                                }
                              />
                            </div>

                            <div className="mt-5 rounded-[18px] border border-champagne-gold/25 bg-soft-white p-5">
                              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                  <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-antique-gold">
                                    Admin Public URL Name
                                  </p>

                                  <p className="mt-1 text-[9px] leading-5 text-steel-gray">
                                    Only the admin can change this URL name. You can use the name the customer entered at checkout or type another one.
                                  </p>
                                </div>
                              </div>

                              <div className="mt-4 flex flex-col gap-3 xl:flex-row">
                                <input
                                  type="text"
                                  value={
                                    form.experienceSlug ||
                                    ""
                                  }
                                  onChange={(
                                    event,
                                  ) =>
                                    updateUnitForm(
                                      unit._id,
                                      "experienceSlug",
                                      event.target.value,
                                    )
                                  }
                                  placeholder="e.g. mariam"
                                  className="min-h-[44px] flex-1 rounded-[13px] border border-light-champagne bg-warm-ivory px-4 text-[11px] text-midnight-navy outline-none focus:border-classic-gold"
                                />

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleUseCustomerName(
                                      unit._id,
                                    )
                                  }
                                  disabled={
                                    !requestedName
                                  }
                                  className="min-h-[44px] rounded-[13px] border border-champagne-gold/35 bg-soft-cream px-5 text-[8px] font-semibold uppercase tracking-[0.08em] text-antique-gold transition hover:border-classic-gold disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                  Use Customer Name
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleSaveExperienceSlug(
                                      unit,
                                    )
                                  }
                                  disabled={
                                    workingKey ===
                                    `slug-${unit._id}`
                                  }
                                  className="min-h-[44px] rounded-[13px] bg-midnight-navy px-5 text-[8px] font-semibold uppercase tracking-[0.08em] text-soft-white transition hover:bg-rich-navy disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  {workingKey ===
                                  `slug-${unit._id}`
                                    ? "Saving..."
                                    : "Save URL"}
                                </button>
                              </div>
                            </div>

                            {publicExperienceUrl && (
                              <div className="mt-5 rounded-[18px] border border-classic-gold/25 bg-midnight-navy p-5 text-soft-white">
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                  <div className="min-w-0 flex-1">
                                    <p className="text-[7px] font-semibold uppercase tracking-[0.2em] text-champagne-gold">
                                      Full Public Experience Link
                                    </p>

                                    <a
                                      href={
                                        publicExperienceUrl
                                      }
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="mt-2 block break-all font-mono text-[10px] leading-5 text-soft-white underline decoration-champagne-gold/40 underline-offset-4 transition hover:text-champagne-gold"
                                    >
                                      {publicExperienceUrl}
                                    </a>
                                  </div>

                                  <div className="flex shrink-0 flex-wrap gap-2">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleCopyPublicLink(
                                          publicExperienceUrl,
                                        )
                                      }
                                      className="inline-flex min-h-[40px] items-center justify-center rounded-full border border-soft-white/15 bg-soft-white/[0.06] px-4 text-[8px] font-semibold uppercase tracking-[0.08em] text-soft-white transition hover:border-champagne-gold/50 hover:text-champagne-gold"
                                    >
                                      Copy Link
                                    </button>

                                    {whatsappShareUrl && (
                                      <a
                                        href={
                                          whatsappShareUrl
                                        }
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex min-h-[40px] items-center justify-center rounded-full bg-[#25D366] px-4 text-[8px] font-semibold uppercase tracking-[0.08em] text-white transition hover:opacity-90"
                                      >
                                        Send WhatsApp
                                      </a>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}

                            <div className="mt-5 flex flex-wrap gap-3">
                              {manageExperienceUrl && (
                                <a
                                  href={
                                    manageExperienceUrl
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-full bg-midnight-navy px-5 text-[8px] font-semibold uppercase tracking-[0.1em] text-soft-white transition hover:bg-rich-navy"
                                >
                                  Manage Experience

                                  <span className="text-champagne-gold">
                                    →
                                  </span>
                                </a>
                              )}

                              {publicExperienceUrl && (
                                <a
                                  href={
                                    publicExperienceUrl
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-full border border-champagne-gold/40 bg-soft-white px-5 text-[8px] font-semibold uppercase tracking-[0.1em] text-antique-gold transition hover:border-classic-gold"
                                >
                                  Open Public Experience

                                  <span>
                                    ↗
                                  </span>
                                </a>
                              )}
                            </div>
                          </div>
                        ) : unit.smartUnit ? (
                          <button
                            type="button"
                            onClick={() =>
                              handleCreateExperience(
                                unit,
                              )
                            }
                            disabled={
                              workingKey ===
                              `experience-${unit._id}`
                            }
                            className="rounded-[13px] bg-midnight-navy px-5 py-3 text-[8px] font-semibold uppercase tracking-[0.1em] text-soft-white disabled:opacity-50"
                          >
                            {workingKey ===
                            `experience-${unit._id}`
                              ? "Creating..."
                              : "Create Experience"}
                          </button>
                        ) : (
                          <p className="text-[11px] text-steel-gray">
                            Assign a Smart Unit first.
                          </p>
                        )}
                      </div>

                      <div className="rounded-[22px] border border-light-champagne p-5">
                        <div className="mb-5">
                          <p className="text-[8px] font-semibold uppercase tracking-[0.22em] text-antique-gold">
                            Step 03
                          </p>

                          <h3 className="mt-2 font-serif text-[1.3rem] text-midnight-navy">
                            Production
                          </h3>
                        </div>

                        {status ===
                          "experience_created" ||
                        status ===
                          "unit_assigned" ? (
                          <button
                            type="button"
                            onClick={() =>
                              handleStartProduction(
                                unit,
                              )
                            }
                            disabled={
                              workingKey ===
                              `start-${unit._id}`
                            }
                            className="rounded-[13px] bg-midnight-navy px-6 py-3 text-[8px] font-semibold uppercase tracking-[0.11em] text-soft-white disabled:opacity-50"
                          >
                            {workingKey ===
                            `start-${unit._id}`
                              ? "Starting..."
                              : "Start Production"}
                          </button>
                        ) : status ===
                          "in_production" ? (
                          <div className="space-y-4">
                            <textarea
                              rows={
                                3
                              }
                              value={
                                form.productionNotes ||
                                ""
                              }
                              onChange={(
                                event,
                              ) =>
                                updateUnitForm(
                                  unit._id,
                                  "productionNotes",
                                  event
                                    .target
                                    .value,
                                )
                              }
                              placeholder="Production notes..."
                              className="w-full resize-none rounded-[13px] border border-light-champagne bg-warm-ivory px-4 py-3 text-[11px] outline-none focus:border-classic-gold"
                            />

                            <button
                              type="button"
                              onClick={() =>
                                handleCompleteProduction(
                                  unit,
                                )
                              }
                              disabled={
                                workingKey ===
                                `production-complete-${unit._id}`
                              }
                              className="rounded-[13px] bg-midnight-navy px-6 py-3 text-[8px] font-semibold uppercase tracking-[0.11em] text-soft-white disabled:opacity-50"
                            >
                              {workingKey ===
                              `production-complete-${unit._id}`
                                ? "Completing..."
                                : "Complete Production"}
                            </button>
                          </div>
                        ) : (
                          <div className="grid gap-4 sm:grid-cols-2">
                            <InfoRow
                              label="Started"
                              value={formatDate(
                                unit.startedAt,
                              )}
                            />

                            <InfoRow
                              label="Production Status"
                              value={
                                statusLabels[
                                  status
                                ] ||
                                status
                              }
                            />
                          </div>
                        )}
                      </div>

                      <div className="rounded-[22px] border border-champagne-gold/25 bg-soft-cream/45 p-5">
                        <div className="mb-5">
                          <p className="text-[8px] font-semibold uppercase tracking-[0.22em] text-antique-gold">
                            Step 04
                          </p>

                          <h3 className="mt-2 font-serif text-[1.3rem] text-midnight-navy">
                            Packaging
                          </h3>
                        </div>

                        {status ===
                        "ready_for_packaging" ? (
                          <div>
                            <p className="mb-4 text-[11px] leading-6 text-slate-gray">
                              Production
                              is
                              complete.
                              This
                              unit is
                              ready
                              for
                              packaging.
                            </p>

                            <button
                              type="button"
                              onClick={() =>
                                handleStartPackaging(
                                  unit,
                                )
                              }
                              disabled={
                                workingKey ===
                                `packaging-start-${unit._id}`
                              }
                              className="rounded-[13px] bg-midnight-navy px-6 py-3 text-[8px] font-semibold uppercase tracking-[0.11em] text-soft-white disabled:opacity-50"
                            >
                              {workingKey ===
                              `packaging-start-${unit._id}`
                                ? "Starting..."
                                : "Start Packaging"}
                            </button>
                          </div>
                        ) : status ===
                          "packaging" ? (
                          <div className="space-y-5">
                            <div>
                              <label className="mb-2 block text-[8px] font-semibold uppercase tracking-[0.14em] text-steel-gray">
                                Packaging
                                Cost
                              </label>

                              <div className="relative max-w-sm">
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={
                                    form.packagingCost ??
                                    0
                                  }
                                  onChange={(
                                    event,
                                  ) =>
                                    updateUnitForm(
                                      unit._id,
                                      "packagingCost",
                                      event
                                        .target
                                        .value,
                                    )
                                  }
                                  className="w-full rounded-[13px] border border-light-champagne bg-soft-white px-4 py-3 pr-14 text-[11px] outline-none focus:border-classic-gold"
                                />

                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-semibold text-antique-gold">
                                  EGP
                                </span>
                              </div>
                            </div>

                            <div>
                              <label className="mb-2 block text-[8px] font-semibold uppercase tracking-[0.14em] text-steel-gray">
                                Packaging
                                Notes
                              </label>

                              <textarea
                                rows={
                                  3
                                }
                                value={
                                  form.packagingNotes ||
                                  ""
                                }
                                onChange={(
                                  event,
                                ) =>
                                  updateUnitForm(
                                    unit._id,
                                    "packagingNotes",
                                    event
                                      .target
                                      .value,
                                  )
                                }
                                placeholder="Packaging notes..."
                                className="w-full resize-none rounded-[13px] border border-light-champagne bg-soft-white px-4 py-3 text-[11px] outline-none focus:border-classic-gold"
                              />
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                handleCompletePackaging(
                                  unit,
                                )
                              }
                              disabled={
                                workingKey ===
                                `packaging-complete-${unit._id}`
                              }
                              className="rounded-[13px] bg-midnight-navy px-6 py-3 text-[8px] font-semibold uppercase tracking-[0.11em] text-soft-white disabled:opacity-50"
                            >
                              {workingKey ===
                              `packaging-complete-${unit._id}`
                                ? "Completing..."
                                : "Complete Packaging"}
                            </button>
                          </div>
                        ) : status ===
                          "completed" ? (
                          <div className="grid gap-4 sm:grid-cols-2">
                            <InfoRow
                              label="Packaging Started"
                              value={formatDate(
                                unit.packagingStartedAt,
                              )}
                            />

                            <InfoRow
                              label="Packaging Completed"
                              value={formatDate(
                                unit.packagingCompletedAt,
                              )}
                            />

                            <InfoRow
                              label="Packaging Cost"
                              value={formatMoney(
                                unit.packagingCost,
                              )}
                            />

                            <InfoRow
                              label="Packaging Status"
                              value="Completed"
                            />

                            <div className="sm:col-span-2">
                              <InfoRow
                                label="Packaging Notes"
                                value={
                                  unit.packagingNotes ||
                                  "No notes"
                                }
                              />
                            </div>
                          </div>
                        ) : (
                          <p className="text-[11px] leading-6 text-steel-gray">
                            Complete
                            production
                            before
                            packaging.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </section>
              );
            },
          )}
        </div>
      </div>
    );
  };

export default AdminManufacturingOrderDetailsPage;