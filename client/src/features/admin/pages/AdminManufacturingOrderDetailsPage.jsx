import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  getManufacturingOrderById,
  startManufacturing,
  assignSmartUnit,
  createExperienceForUnit,
  startProductionUnit,
  completeProductionUnit,
  cancelManufacturingOrder,
} from "../services/manufacturingApi";

import {
  getSmartUnits,
  getSmartUnitInstances,
} from "../smart-units/services/smartUnitApi";

const manufacturingStatusLabels = {
  pending: "Pending",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

const unitStatusLabels = {
  pending: "Pending",
  unit_assigned: "Unit Assigned",
  experience_created: "Experience Created",
  in_production: "In Production",
  completed: "Completed",
  failed: "Failed",
};

const getManufacturingStatusClasses = (status) => {
  switch (status) {
    case "pending":
      return "border-champagne-gold/30 bg-champagne-gold/10 text-antique-gold";

    case "in_progress":
      return "border-navy-soft/20 bg-silver-mist text-navy-soft";

    case "completed":
      return "border-classic-gold/30 bg-soft-cream text-antique-gold";

    case "cancelled":
      return "border-antique-gold/25 bg-warm-ivory text-antique-gold";

    default:
      return "border-light-champagne bg-silver-mist text-slate-gray";
  }
};

const getUnitStatusClasses = (status) => {
  switch (status) {
    case "pending":
      return "border-champagne-gold/30 bg-champagne-gold/10 text-antique-gold";

    case "unit_assigned":
      return "border-navy-soft/20 bg-silver-mist text-navy-soft";

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

const getObjectId = (value) => {
  if (!value) {
    return null;
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number") {
    return value.toString();
  }

  if (value?._id) {
    return value._id.toString();
  }

  if (value?.id) {
    return value.id.toString();
  }

  return value?.toString?.() || null;
};

const extractArray = (response, possibleKeys = []) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  for (const key of possibleKeys) {
    if (Array.isArray(response?.[key])) {
      return response[key];
    }

    if (Array.isArray(response?.data?.[key])) {
      return response.data[key];
    }

    if (Array.isArray(response?.data?.data?.[key])) {
      return response.data.data[key];
    }
  }

  return [];
};

const AdminManufacturingOrderDetailsPage = () => {
  const { id } = useParams();

  const [manufacturingOrder, setManufacturingOrder] = useState(null);

  const [smartUnits, setSmartUnits] = useState([]);

  const [smartUnitInstances, setSmartUnitInstances] = useState([]);

  const [selectedSmartUnits, setSelectedSmartUnits] = useState({});

  const [notes, setNotes] = useState({});

  const [isLoading, setIsLoading] = useState(true);

  const [actionLoading, setActionLoading] = useState("");

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [instancesLoading, setInstancesLoading] = useState(false);

  const loadManufacturingOrder = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await getManufacturingOrderById(id);

      console.log("MANUFACTURING ORDER RESPONSE:", response);

      const orderData =
        response?.data?.data ||
        response?.data?.manufacturingOrder ||
        response?.data;

      setManufacturingOrder(orderData || null);
    } catch (err) {
      console.error("Unable to load manufacturing order:", err);

      setError(
        err?.response?.data?.message || "Unable to load manufacturing order",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const loadSmartUnits = async () => {
    try {
      setInstancesLoading(true);

      const response = await getSmartUnits();

      console.log("SMART UNITS API RESPONSE:", response);

      const units = extractArray(response, ["smartUnits", "units"]);

      console.log("SMART UNITS ARRAY:", units);

      setSmartUnits(units);

      const allInstances = [];

      await Promise.all(
        units.map(async (smartUnit) => {
          const smartUnitId = getObjectId(smartUnit?._id);

          if (!smartUnitId) {
            return;
          }

          try {
            const instanceResponse = await getSmartUnitInstances(smartUnitId);

            console.log("SMART UNIT INSTANCES RESPONSE:", {
              smartUnitId,
              name: smartUnit?.name,
              response: instanceResponse,
            });

            const instances = extractArray(instanceResponse, [
              "instances",
              "smartUnitInstances",
            ]);

            console.log("SMART UNIT INSTANCES:", {
              smartUnitId,
              name: smartUnit?.name,
              instances,
            });

            instances.forEach((instance) => {
              const instanceId = getObjectId(instance?._id);

              if (!instanceId) {
                return;
              }

              allInstances.push({
                ...instance,

                smartUnitId,

                smartUnit,

                technologyModel:
                  instance?.technologyModel ||
                  smartUnit?.technologyModel ||
                  null,
              });
            });
          } catch (err) {
            console.error(
              "Unable to load instances for Smart Unit:",
              smartUnitId,
              err,
            );
          }
        }),
      );

      console.log("ALL SMART UNIT INSTANCES:", allInstances);

      const availableInstances = allInstances.filter(
        (instance) => instance?.status === "available",
      );

      console.log("AVAILABLE SMART UNIT INSTANCES:", availableInstances);

      setSmartUnitInstances(availableInstances);
    } catch (err) {
      console.error("Unable to load smart units:", err);

      setSmartUnits([]);
      setSmartUnitInstances([]);
    } finally {
      setInstancesLoading(false);
    }
  };

  useEffect(() => {
    if (!id) {
      return;
    }

    loadManufacturingOrder();
    loadSmartUnits();
  }, [id]);

  const refreshData = async () => {
    await Promise.all([loadManufacturingOrder(), loadSmartUnits()]);
  };

  const handleStartManufacturing = async () => {
    try {
      setActionLoading("start-manufacturing");

      setError("");
      setSuccess("");

      await startManufacturing(id);

      setSuccess("Manufacturing started successfully.");

      await refreshData();
    } catch (err) {
      console.error("Unable to start manufacturing:", err);

      setError(err?.response?.data?.message || "Unable to start manufacturing");
    } finally {
      setActionLoading("");
    }
  };

  const handleSmartUnitChange = (unitId, instanceId) => {
    const selectedInstance = smartUnitInstances.find(
      (instance) => getObjectId(instance?._id) === getObjectId(instanceId),
    );

    console.log("SELECTED INSTANCE:", selectedInstance);

    if (!selectedInstance) {
      setSelectedSmartUnits((previous) => ({
        ...previous,

        [unitId]: {
          smartUnitId: "",
          smartUnitInstanceId: "",
        },
      }));

      return;
    }

    const smartUnitId = getObjectId(
      selectedInstance?.smartUnitId || selectedInstance?.smartUnit?._id,
    );

    const smartUnitInstanceId = getObjectId(selectedInstance?._id);

    console.log("SELECTED ASSIGN DATA:", {
      unitId,
      smartUnitId,
      smartUnitInstanceId,
    });

    setSelectedSmartUnits((previous) => ({
      ...previous,

      [unitId]: {
        smartUnitId,
        smartUnitInstanceId,
      },
    }));

    setError("");
    setSuccess("");
  };

  const handleAssignSmartUnit = async (unitId) => {
    const selection = selectedSmartUnits[unitId];

    const smartUnitId = selection?.smartUnitId;

    const smartUnitInstanceId = selection?.smartUnitInstanceId;

    console.log("ASSIGN CLICK:", {
      manufacturingOrderId: id,
      unitId,
      smartUnitId,
      smartUnitInstanceId,
    });

    if (!smartUnitId) {
      setError("Please select a Smart Unit Instance first.");
      return;
    }

    if (!smartUnitInstanceId) {
      setError("Selected Smart Unit Instance is invalid.");
      return;
    }

    try {
      setActionLoading("assign-" + unitId);

      setError("");
      setSuccess("");

      console.log("SENDING ASSIGN REQUEST:", {
        manufacturingOrderId: id,
        unitId,
        smartUnitId,
        smartUnitInstanceId,
      });

      const response = await assignSmartUnit(
        id,
        unitId,
        smartUnitId,
        smartUnitInstanceId,
      );

      console.log("ASSIGN SMART UNIT RESPONSE:", response);

      setSuccess("Smart Unit Instance assigned successfully.");

      setSelectedSmartUnits((previous) => ({
        ...previous,

        [unitId]: {
          smartUnitId: "",
          smartUnitInstanceId: "",
        },
      }));

      await refreshData();
    } catch (err) {
      console.error("Unable to assign smart unit:", err);

      console.error("ASSIGN ERROR STATUS:", err?.response?.status);

      console.error("ASSIGN ERROR DATA:", err?.response?.data);

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Unable to assign smart unit",
      );
    } finally {
      setActionLoading("");
    }
  };

  const handleCreateExperience = async (unitId) => {
    try {
      setActionLoading("experience-" + unitId);

      setError("");
      setSuccess("");

      console.log("CREATE EXPERIENCE:", {
        manufacturingOrderId: id,
        productionUnitId: unitId,
      });

      const response = await createExperienceForUnit(id, unitId, {
        type: "personal",
      });

      console.log("CREATE EXPERIENCE RESPONSE:", response);

      setSuccess("Experience created successfully.");

      await refreshData();
    } catch (err) {
      console.error("Unable to create experience:", err);

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Unable to create experience",
      );
    } finally {
      setActionLoading("");
    }
  };

  const handleStartProduction = async (unitId) => {
    try {
      setActionLoading("start-" + unitId);

      setError("");
      setSuccess("");

      await startProductionUnit(id, unitId);

      setSuccess("Production started successfully.");

      await refreshData();
    } catch (err) {
      console.error("Unable to start production:", err);

      setError(err?.response?.data?.message || "Unable to start production");
    } finally {
      setActionLoading("");
    }
  };

  const handleCompleteProduction = async (unitId) => {
    try {
      setActionLoading("complete-" + unitId);

      setError("");
      setSuccess("");

      await completeProductionUnit(id, unitId, notes[unitId] || "");

      setSuccess("Production unit completed successfully.");

      await refreshData();
    } catch (err) {
      console.error("Unable to complete production:", err);

      setError(err?.response?.data?.message || "Unable to complete production");
    } finally {
      setActionLoading("");
    }
  };

  const handleCancelManufacturing = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this manufacturing order?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading("cancel-manufacturing");

      setError("");
      setSuccess("");

      await cancelManufacturingOrder(id);

      setSuccess("Manufacturing order cancelled successfully.");

      await refreshData();
    } catch (err) {
      console.error("Unable to cancel manufacturing order:", err);

      setError(
        err?.response?.data?.message || "Unable to cancel manufacturing order",
      );
    } finally {
      setActionLoading("");
    }
  };

  if (isLoading) {
    return (
      <div className="relative flex min-h-[440px] items-center justify-center overflow-hidden p-8">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-soft-cream blur-[100px]" />

        <div className="relative text-center">
          <div className="relative mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-champagne-gold/25 bg-midnight-navy shadow-[0_12px_30px_rgba(18,38,58,0.15)]">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-champagne-gold/20 border-t-champagne-gold" />
          </div>

          <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-slate-gray">
            Loading manufacturing order...
          </p>
        </div>
      </div>
    );
  }

  if (!manufacturingOrder) {
    return (
      <div className="relative overflow-hidden rounded-[26px] border border-light-champagne/90 bg-soft-white/85 p-10 text-center shadow-[0_14px_40px_rgba(7,19,31,0.045)]">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[260px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-soft-cream blur-[80px]" />

        <div className="relative">
          <p className="text-[11px] text-antique-gold">
            {error || "Manufacturing order not found"}
          </p>

          <Link
            to="/admin/manufacturing"
            className="mt-5 inline-flex min-h-[42px] items-center justify-center rounded-[12px] bg-midnight-navy px-5 text-[8px] font-semibold uppercase tracking-[0.12em] text-soft-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-rich-navy"
          >
            Back to Manufacturing
          </Link>
        </div>
      </div>
    );
  }

  const units = Array.isArray(manufacturingOrder.units)
    ? manufacturingOrder.units
    : [];

  const totalUnits = units.length;

  const completedUnits = units.filter(
    (unit) => unit.status === "completed",
  ).length;

  const progress =
    totalUnits > 0 ? Math.round((completedUnits / totalUnits) * 100) : 0;

  const getOrderItemForUnit = (unit) => {
    return (
      manufacturingOrder.order?.items?.find(
        (item) => getObjectId(item?._id) === getObjectId(unit?.orderItemId),
      ) || null
    );
  };

  return (
    <div className="relative space-y-8 pb-10">
      <Link
        to="/admin/manufacturing"
        className="group inline-flex items-center gap-2.5 text-[8px] font-semibold uppercase tracking-[0.15em] text-slate-gray transition-colors duration-300 hover:text-antique-gold"
      >
        <span className="transition-transform duration-300 group-hover:-translate-x-1">
          ←
        </span>
        Back to Manufacturing
      </Link>

      <div className="relative overflow-hidden rounded-[28px] border border-champagne-gold/15 bg-midnight-navy px-6 py-7 shadow-[0_24px_65px_rgba(7,19,31,0.16)] sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-rich-navy via-midnight-navy to-luxury-black" />

        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full border border-champagne-gold/10" />

        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full border border-champagne-gold/[0.08]" />

        <div className="pointer-events-none absolute -bottom-24 -left-20 h-52 w-52 rounded-full bg-champagne-gold/[0.06] blur-[70px]" />

        <div className="relative flex flex-col justify-between gap-7 md:flex-row md:items-start">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <span className="h-px w-8 bg-classic-gold/65" />

              <span className="text-[8px] font-semibold uppercase tracking-[0.28em] text-champagne-gold">
                Manufacturing Order
              </span>
            </div>

            <h1 className="font-serif text-[2.4rem] font-normal leading-none tracking-[-0.035em] text-soft-white sm:text-[3rem]">
              Manufacturing Order
            </h1>

            <p className="mt-3 font-serif text-[1.25rem] italic text-champagne-gold">
              {manufacturingOrder.orderNumber}
            </p>

            <p className="mt-3 text-[9px] leading-5 text-premium-silver/55">
              Created:{" "}
              {manufacturingOrder.createdAt
                ? new Date(manufacturingOrder.createdAt).toLocaleString()
                : "N/A"}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <span
              className={
                "inline-flex min-h-[40px] items-center rounded-full border px-4 text-[8px] font-semibold uppercase tracking-[0.1em] " +
                getManufacturingStatusClasses(manufacturingOrder.status)
              }
            >
              {manufacturingStatusLabels[manufacturingOrder.status] ||
                manufacturingOrder.status}
            </span>

            {manufacturingOrder.status !== "completed" &&
              manufacturingOrder.status !== "cancelled" && (
                <>
                  {manufacturingOrder.status === "pending" && (
                    <button
                      onClick={handleStartManufacturing}
                      disabled={actionLoading === "start-manufacturing"}
                      className="inline-flex min-h-[42px] items-center justify-center rounded-[12px] bg-soft-white px-5 text-[8px] font-semibold uppercase tracking-[0.1em] text-midnight-navy shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-warm-ivory disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                    >
                      {actionLoading === "start-manufacturing"
                        ? "Starting..."
                        : "Start Manufacturing"}
                    </button>
                  )}

                  <button
                    onClick={handleCancelManufacturing}
                    disabled={actionLoading === "cancel-manufacturing"}
                    className="inline-flex min-h-[42px] items-center justify-center rounded-[12px] border border-champagne-gold/25 bg-soft-white/[0.04] px-5 text-[8px] font-semibold uppercase tracking-[0.1em] text-champagne-gold transition-all duration-300 hover:-translate-y-0.5 hover:bg-soft-white/[0.08] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                  >
                    {actionLoading === "cancel-manufacturing"
                      ? "Cancelling..."
                      : "Cancel"}
                  </button>
                </>
              )}
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-[16px] border border-antique-gold/25 bg-soft-cream/80 p-4 text-[10px] leading-5 text-antique-gold shadow-[0_7px_20px_rgba(7,19,31,0.03)]">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-[16px] border border-classic-gold/30 bg-soft-cream/80 p-4 text-[10px] leading-5 text-antique-gold shadow-[0_7px_20px_rgba(7,19,31,0.03)]">
          {success}
        </div>
      )}

      <div className="relative overflow-hidden rounded-[24px] border border-light-champagne/90 bg-soft-white/85 p-6 shadow-[0_10px_32px_rgba(7,19,31,0.04)] backdrop-blur-sm">
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-soft-cream blur-[55px]" />

        <div className="relative flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-[7px] font-semibold uppercase tracking-[0.22em] text-steel-gray">
              Production Progress
            </p>

            <h2 className="mt-1.5 font-serif text-[1.4rem] font-normal text-midnight-navy">
              Production Progress
            </h2>

            <p className="mt-2 text-[10px] text-slate-gray">
              {completedUnits} of {totalUnits} units completed
            </p>
          </div>

          <p className="font-serif text-[2.2rem] font-normal leading-none text-midnight-navy">
            {progress}%
          </p>
        </div>

        <div className="relative mt-6 h-2.5 overflow-hidden rounded-full bg-light-champagne/70">
          <div
            className="h-full rounded-full bg-gradient-to-r from-classic-gold to-champagne-gold transition-all duration-500"
            style={{
              width: progress + "%",
            }}
          />
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="relative overflow-hidden rounded-[22px] border border-light-champagne/90 bg-soft-white/85 p-6 shadow-[0_9px_28px_rgba(7,19,31,0.04)]">
          <div className="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-soft-cream blur-[45px]" />

          <h2 className="relative font-serif text-[1.25rem] font-normal text-midnight-navy">
            Customer
          </h2>

          <div className="relative mt-5 space-y-3 text-[10px] leading-5 text-slate-gray">
            <p>
              <span className="font-semibold text-midnight-navy">Email:</span>{" "}
              {manufacturingOrder.customer?.email || "Unknown"}
            </p>

            {manufacturingOrder.customer?.firstName && (
              <p>
                <span className="font-semibold text-midnight-navy">Name:</span>{" "}
                {manufacturingOrder.customer.firstName}{" "}
                {manufacturingOrder.customer.lastName || ""}
              </p>
            )}
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[22px] border border-light-champagne/90 bg-soft-white/85 p-6 shadow-[0_9px_28px_rgba(7,19,31,0.04)]">
          <div className="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-soft-cream blur-[45px]" />

          <h2 className="relative font-serif text-[1.25rem] font-normal text-midnight-navy">
            Original Order
          </h2>

          <div className="relative mt-5 space-y-3 text-[10px] leading-5 text-slate-gray">
            <p>
              <span className="font-semibold text-midnight-navy">Order:</span>{" "}
              {manufacturingOrder.order?.orderNumber}
            </p>

            <p>
              <span className="font-semibold text-midnight-navy">Status:</span>{" "}
              {manufacturingOrder.order?.orderStatus}
            </p>

            <p>
              <span className="font-semibold text-midnight-navy">Payment:</span>{" "}
              {manufacturingOrder.order?.paymentStatus}
            </p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[22px] border border-champagne-gold/15 bg-midnight-navy p-6 text-soft-white shadow-[0_14px_35px_rgba(18,38,58,0.13)]">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-rich-navy to-midnight-navy" />

          <div className="pointer-events-none absolute -right-14 -top-14 h-32 w-32 rounded-full bg-champagne-gold/10 blur-[45px]" />

          <h2 className="relative font-serif text-[1.25rem] font-normal text-soft-white">
            Order Total
          </h2>

          <p className="relative mt-5 font-serif text-[2rem] font-normal text-champagne-gold">
            {manufacturingOrder.order?.total || 0}{" "}
            <span className="font-sans text-[8px] font-semibold uppercase tracking-[0.08em] text-premium-silver/55">
              EGP
            </span>
          </p>
        </div>
      </div>

      <div>
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <span className="h-px w-7 bg-classic-gold/60" />

              <span className="text-[7px] font-semibold uppercase tracking-[0.22em] text-antique-gold">
                Production Units
              </span>
            </div>

            <h2 className="font-serif text-[1.7rem] font-normal tracking-[-0.025em] text-midnight-navy">
              Production Units
            </h2>

            <p className="mt-2 text-[10px] leading-5 text-slate-gray">
              Every physical product has its own Smart Unit and Experience.
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-6">
          {units.map((unit) => {
            const orderItem = getOrderItemForUnit(unit);

            const product = unit?.product || orderItem?.product || null;

            const selectedSmartUnit = unit?.smartUnit || null;

            const technologyModel =
              selectedSmartUnit?.technologyModel ||
              product?.technologyModel ||
              orderItem?.technologyModel ||
              null;

            const experience = unit?.experience || null;

            const isAssigned = Boolean(selectedSmartUnit);

            const hasExperience = Boolean(experience);

            const isCompleted = unit?.status === "completed";

            const availableInstances = smartUnitInstances;

            const selectedInstanceId =
              selectedSmartUnits[unit?._id]?.smartUnitInstanceId || "";

            return (
              <div
                key={unit._id}
                className="relative overflow-hidden rounded-[26px] border border-light-champagne/90 bg-soft-white/85 shadow-[0_14px_42px_rgba(7,19,31,0.045)] backdrop-blur-sm"
              >
                <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-soft-cream blur-[75px]" />

                <div className="relative border-b border-light-champagne/80 bg-warm-ivory/60 p-6">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="font-serif text-[1.35rem] font-normal text-midnight-navy">
                      {product?.name || orderItem?.name || "Product"}

                      {" — Unit #"}
                      {unit.unitNumber}
                    </h3>

                    <span
                      className={
                        "inline-flex rounded-full border px-3 py-1.5 text-[7px] font-semibold uppercase tracking-[0.08em] " +
                        getUnitStatusClasses(unit.status)
                      }
                    >
                      {unitStatusLabels[unit.status] || unit.status}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[9px] text-slate-gray">
                    <span>
                      Product:{" "}
                      <strong className="font-semibold text-midnight-navy">
                        {product?.name || orderItem?.name || "Unknown"}
                      </strong>
                    </span>

                    <span>
                      Unit:{" "}
                      <strong className="font-semibold text-midnight-navy">
                        {unit.unitNumber}
                      </strong>
                    </span>

                    <span>
                      Serial:{" "}
                      <strong className="font-semibold text-midnight-navy">
                        {unit.serialNumber ||
                          selectedSmartUnit?.serialNumber ||
                          "Not assigned"}
                      </strong>
                    </span>
                  </div>
                </div>

                <div className="relative grid gap-4 p-6 md:grid-cols-3">
                  <div className="rounded-[18px] border border-light-champagne/85 bg-soft-white p-5 shadow-[0_6px_20px_rgba(7,19,31,0.025)]">
                    <h4 className="font-serif text-[1.1rem] font-normal text-midnight-navy">
                      Product
                    </h4>

                    <div className="mt-4">
                      {product?.image ||
                      product?.primaryImage ||
                      product?.images?.[0] ? (
                        <img
                          src={
                            product?.image ||
                            product?.primaryImage ||
                            product?.images?.[0]
                          }
                          alt={product?.name || orderItem?.name || "Product"}
                          className="h-36 w-full rounded-[15px] border border-light-champagne/70 bg-soft-cream object-cover"
                        />
                      ) : (
                        <div className="flex h-36 items-center justify-center rounded-[15px] border border-light-champagne/70 bg-soft-cream text-[9px] text-steel-gray">
                          No image
                        </div>
                      )}

                      <h5 className="mt-4 text-[12px] font-semibold text-midnight-navy">
                        {product?.name || orderItem?.name || "Unknown Product"}
                      </h5>

                      <p className="mt-1.5 text-[9px] text-slate-gray">
                        Quantity in order: {orderItem?.quantity || 1}
                      </p>

                      {orderItem?.variant?.name && (
                        <p className="mt-1 text-[9px] text-slate-gray">
                          Variant: {orderItem.variant.name}
                        </p>
                      )}

                      {technologyModel && (
                        <div className="mt-4 rounded-[14px] border border-champagne-gold/20 bg-soft-cream p-4">
                          <p className="text-[7px] font-semibold uppercase tracking-[0.16em] text-antique-gold">
                            Technology
                          </p>

                          <p className="mt-1.5 text-[11px] font-semibold text-midnight-navy">
                            {technologyModel.modelName ||
                              technologyModel.name ||
                              "Unknown"}
                          </p>

                          {technologyModel.modelCode && (
                            <p className="mt-1 text-[8px] text-slate-gray">
                              Code: {technologyModel.modelCode}
                            </p>
                          )}

                          {technologyModel.manufacturer && (
                            <p className="mt-1 text-[8px] text-slate-gray">
                              Manufacturer: {technologyModel.manufacturer}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-[18px] border border-light-champagne/85 bg-warm-ivory/65 p-5">
                    <h4 className="font-serif text-[1.1rem] font-normal text-midnight-navy">
                      Smart Unit
                    </h4>

                    {selectedSmartUnit ? (
                      <div className="mt-4 space-y-3 text-[9px] leading-5 text-slate-gray">
                        <div className="rounded-[14px] border border-champagne-gold/20 bg-soft-cream p-4">
                          <p className="text-[7px] font-semibold uppercase tracking-[0.16em] text-antique-gold">
                            Assigned To
                          </p>

                          <p className="mt-1.5 font-serif text-[1.2rem] font-normal text-midnight-navy">
                            {product?.name || orderItem?.name || "Product"}
                          </p>

                          <p className="mt-1 text-[8px] text-slate-gray">
                            Production Unit #{unit.unitNumber}
                          </p>
                        </div>

                        <p>
                          <span className="font-semibold text-midnight-navy">
                            Name:
                          </span>{" "}
                          {selectedSmartUnit.name || "N/A"}
                        </p>

                        <p>
                          <span className="font-semibold text-midnight-navy">
                            Serial:
                          </span>{" "}
                          {selectedSmartUnit.serialNumber || "N/A"}
                        </p>

                        <p>
                          <span className="font-semibold text-midnight-navy">
                            Status:
                          </span>{" "}
                          {selectedSmartUnit.status || "N/A"}
                        </p>

                        {selectedSmartUnit.manufacturer && (
                          <p>
                            <span className="font-semibold text-midnight-navy">
                              Manufacturer:
                            </span>{" "}
                            {selectedSmartUnit.manufacturer}
                          </p>
                        )}

                        {selectedSmartUnit.technologyModel && (
                          <div className="rounded-[14px] border border-light-champagne bg-soft-white p-4">
                            <p className="text-[7px] font-semibold uppercase tracking-[0.16em] text-antique-gold">
                              Technology
                            </p>

                            <p className="mt-1.5 text-[11px] font-semibold text-midnight-navy">
                              {selectedSmartUnit.technologyModel.modelName ||
                                selectedSmartUnit.technologyModel.name ||
                                "Unknown"}
                            </p>

                            {selectedSmartUnit.technologyModel.modelCode && (
                              <p className="mt-1 text-[8px] text-slate-gray">
                                Code:{" "}
                                {selectedSmartUnit.technologyModel.modelCode}
                              </p>
                            )}
                          </div>
                        )}

                        <div className="rounded-[12px] border border-classic-gold/20 bg-soft-cream p-3 text-[8px] text-antique-gold">
                          ✓ Smart Unit is linked to this physical product.
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4">
                        <p className="text-[9px] leading-5 text-steel-gray">
                          No Smart Unit assigned to this product yet.
                        </p>

                        {!isCompleted &&
                          manufacturingOrder.status !== "cancelled" && (
                            <div className="mt-4">
                              {instancesLoading ? (
                                <div className="rounded-[14px] border border-light-champagne bg-soft-white p-4 text-center text-[9px] text-slate-gray">
                                  Loading Smart Unit Instances...
                                </div>
                              ) : (
                                <>
                                  <select
                                    value={selectedInstanceId}
                                    onChange={(event) =>
                                      handleSmartUnitChange(
                                        unit._id,
                                        event.target.value,
                                      )
                                    }
                                    className="h-[48px] w-full rounded-[12px] border border-light-champagne bg-soft-white px-4 text-[9px] text-midnight-navy outline-none transition-all duration-300 hover:border-champagne-gold/60 focus:border-classic-gold focus:shadow-[0_0_0_4px_rgba(201,162,77,0.08)]"
                                  >
                                    <option value="">
                                      Select Available Smart Unit Instance
                                    </option>

                                    {availableInstances.length === 0 ? (
                                      <option disabled value="">
                                        No available Smart Unit Instances
                                      </option>
                                    ) : (
                                      availableInstances.map((instance) => (
                                        <option
                                          key={instance._id}
                                          value={instance._id}
                                        >
                                          {instance?.smartUnit?.name ||
                                            "Unnamed Smart Unit"}

                                          {" — Instance: "}

                                          {instance?.serialNumber ||
                                            instance?.instanceNumber ||
                                            instance?._id}
                                        </option>
                                      ))
                                    )}
                                  </select>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleAssignSmartUnit(unit._id)
                                    }
                                    disabled={
                                      !selectedInstanceId ||
                                      instancesLoading ||
                                      actionLoading === "assign-" + unit._id
                                    }
                                    className="mt-3 min-h-[46px] w-full rounded-[12px] bg-midnight-navy px-4 text-[8px] font-semibold uppercase tracking-[0.1em] text-soft-white shadow-[0_8px_20px_rgba(18,38,58,0.12)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-rich-navy disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                                  >
                                    {actionLoading === "assign-" + unit._id
                                      ? "Assigning..."
                                      : "Assign Smart Unit"}
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                      </div>
                    )}
                  </div>

                  <div className="rounded-[18px] border border-light-champagne/85 bg-warm-ivory/65 p-5">
                    <h4 className="font-serif text-[1.1rem] font-normal text-midnight-navy">
                      Experience
                    </h4>

                    {experience ? (
                      <div className="mt-4 space-y-3 text-[9px] leading-5 text-slate-gray">
                        <div className="rounded-[14px] border border-champagne-gold/20 bg-soft-cream p-4">
                          <p className="text-[7px] font-semibold uppercase tracking-[0.16em] text-antique-gold">
                            Belongs To
                          </p>

                          <p className="mt-1.5 text-[11px] font-semibold text-midnight-navy">
                            {product?.name || orderItem?.name || "Product"}
                          </p>
                        </div>

                        <p>
                          <span className="font-semibold text-midnight-navy">
                            Serial:
                          </span>{" "}
                          {experience.serialNumber || "N/A"}
                        </p>

                        <p>
                          <span className="font-semibold text-midnight-navy">
                            Status:
                          </span>{" "}
                          {experience.status || "N/A"}
                        </p>

                        {experience.slug && (
                          <p>
                            <span className="font-semibold text-midnight-navy">
                              Slug:
                            </span>{" "}
                            {experience.slug}
                          </p>
                        )}

                        {experience.manageToken && (
                          <div className="mt-4 rounded-[14px] border border-light-champagne bg-soft-white p-4">
                            <p className="text-[7px] font-semibold uppercase tracking-[0.16em] text-antique-gold">
                              Owner Management
                            </p>

                            <a
                              href={
                                "/experience/manage/" + experience.manageToken
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-3 flex min-h-[44px] w-full items-center justify-center rounded-[11px] bg-midnight-navy px-4 text-center text-[8px] font-semibold uppercase tracking-[0.1em] text-soft-white transition-all duration-300 hover:bg-rich-navy"
                            >
                              Open Manage Page
                            </a>

                            <p className="mt-3 break-all text-[8px] text-steel-gray">
                              /manage/
                              {experience.manageToken}
                            </p>
                          </div>
                        )}

                        <div className="rounded-[12px] border border-classic-gold/20 bg-soft-cream p-3 text-[8px] text-antique-gold">
                          ✓ Experience belongs to this product unit.
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4">
                        <p className="text-[9px] leading-5 text-steel-gray">
                          No Experience created.
                        </p>

                        {isAssigned &&
                          !hasExperience &&
                          !isCompleted &&
                          manufacturingOrder.status !== "cancelled" && (
                            <button
                              type="button"
                              onClick={() => handleCreateExperience(unit._id)}
                              disabled={
                                actionLoading === "experience-" + unit._id
                              }
                              className="mt-4 min-h-[46px] w-full rounded-[12px] bg-midnight-navy px-4 text-[8px] font-semibold uppercase tracking-[0.1em] text-soft-white shadow-[0_8px_20px_rgba(18,38,58,0.12)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-rich-navy disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                            >
                              {actionLoading === "experience-" + unit._id
                                ? "Creating..."
                                : "Create Experience"}
                            </button>
                          )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="relative border-t border-light-champagne/80 p-6">
                  <h4 className="font-serif text-[1.1rem] font-normal text-midnight-navy">
                    Production Actions
                  </h4>

                  <div className="mt-4">
                    {unit.status === "experience_created" &&
                      manufacturingOrder.status !== "cancelled" && (
                        <button
                          type="button"
                          onClick={() => handleStartProduction(unit._id)}
                          disabled={actionLoading === "start-" + unit._id}
                          className="min-h-[48px] w-full rounded-[12px] bg-midnight-navy px-5 text-[8px] font-semibold uppercase tracking-[0.1em] text-soft-white shadow-[0_9px_22px_rgba(18,38,58,0.13)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-rich-navy disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                        >
                          {actionLoading === "start-" + unit._id
                            ? "Starting..."
                            : "Start Production"}
                        </button>
                      )}

                    {unit.status === "in_production" && (
                      <div>
                        <textarea
                          value={notes[unit._id] || ""}
                          onChange={(event) =>
                            setNotes((previous) => ({
                              ...previous,

                              [unit._id]: event.target.value,
                            }))
                          }
                          placeholder="Production notes (optional)"
                          rows={3}
                          className="w-full resize-none rounded-[12px] border border-light-champagne bg-warm-ivory/65 px-4 py-3 text-[10px] leading-5 text-midnight-navy outline-none transition-all duration-300 placeholder:text-steel-gray/70 hover:border-champagne-gold/60 focus:border-classic-gold focus:bg-soft-white focus:shadow-[0_0_0_4px_rgba(201,162,77,0.08)]"
                        />

                        <button
                          type="button"
                          onClick={() => handleCompleteProduction(unit._id)}
                          disabled={actionLoading === "complete-" + unit._id}
                          className="mt-3 min-h-[48px] w-full rounded-[12px] bg-midnight-navy px-5 text-[8px] font-semibold uppercase tracking-[0.1em] text-soft-white shadow-[0_9px_22px_rgba(18,38,58,0.13)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-rich-navy disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                        >
                          {actionLoading === "complete-" + unit._id
                            ? "Completing..."
                            : "Complete Production"}
                        </button>
                      </div>
                    )}

                    {unit.status === "completed" && (
                      <div className="rounded-[14px] border border-classic-gold/20 bg-soft-cream p-4 text-[9px] text-antique-gold">
                        ✓ This production unit has been completed successfully.
                      </div>
                    )}
                  </div>
                </div>

                <div className="relative grid gap-4 border-t border-light-champagne/80 bg-warm-ivory/45 p-6 text-[9px] text-slate-gray md:grid-cols-2">
                  <div>
                    <span className="font-semibold text-midnight-navy">
                      Started:
                    </span>{" "}
                    {unit.startedAt
                      ? new Date(unit.startedAt).toLocaleString()
                      : "Not started"}
                  </div>

                  <div>
                    <span className="font-semibold text-midnight-navy">
                      Completed:
                    </span>{" "}
                    {unit.completedAt
                      ? new Date(unit.completedAt).toLocaleString()
                      : "Not completed"}
                  </div>
                </div>

                {unit.notes && (
                  <div className="relative border-t border-light-champagne/80 bg-soft-cream/60 p-4 text-[9px] leading-5 text-slate-gray">
                    <span className="font-semibold text-midnight-navy">
                      Notes:
                    </span>{" "}
                    {unit.notes}
                  </div>
                )}
              </div>
            );
          })}

          {units.length === 0 && (
            <div className="relative overflow-hidden rounded-[24px] border border-light-champagne/90 bg-soft-white/85 p-10 text-center shadow-[0_10px_30px_rgba(7,19,31,0.04)]">
              <div className="pointer-events-none absolute left-1/2 top-1/2 h-[240px] w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-soft-cream blur-[75px]" />

              <p className="relative text-[10px] text-slate-gray">
                No production units found.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminManufacturingOrderDetailsPage;
