import {
  Fragment,
  useEffect,
  useState,
} from "react";

import { Link } from "react-router-dom";

import {
  getSmartUnits,
  getSmartUnitInstances,
  deleteSmartUnit,
} from "../services/smartUnitApi";

const AdminSmartUnitsPage = () => {
  const [smartUnits, setSmartUnits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [expandedUnit, setExpandedUnit] = useState(null);

  const [instances, setInstances] = useState({});
  const [loadingInstances, setLoadingInstances] = useState({});
  const [instanceErrors, setInstanceErrors] = useState({});

  const loadSmartUnits = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await getSmartUnits();

      const units =
        response?.data?.smartUnits ||
        response?.smartUnits ||
        [];

      setSmartUnits(
        Array.isArray(units) ? units : []
      );
    } catch (error) {
      console.error(
        "Failed to load Smart Units:",
        error
      );

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to load Smart Units."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSmartUnits();
  }, []);

  const loadInstances = async (smartUnitId) => {
    if (!smartUnitId) {
      return;
    }

    try {
      setLoadingInstances((previous) => ({
        ...previous,
        [smartUnitId]: true,
      }));

      setInstanceErrors((previous) => ({
        ...previous,
        [smartUnitId]: "",
      }));

      const response =
        await getSmartUnitInstances(
          smartUnitId
        );

      const smartUnitInstances =
        response?.data?.instances ||
        response?.instances ||
        [];

      setInstances((previous) => ({
        ...previous,
        [smartUnitId]:
          Array.isArray(
            smartUnitInstances
          )
            ? smartUnitInstances
            : [],
      }));
    } catch (error) {
      console.error(
        "Failed to load Smart Unit instances:",
        error
      );

      setInstanceErrors((previous) => ({
        ...previous,
        [smartUnitId]:
          error?.response?.data?.message ||
          error?.message ||
          "Failed to load instances.",
      }));
    } finally {
      setLoadingInstances((previous) => ({
        ...previous,
        [smartUnitId]: false,
      }));
    }
  };

  const toggleInstances = async (
    smartUnitId
  ) => {
    if (!smartUnitId) {
      return;
    }

    if (
      expandedUnit === smartUnitId
    ) {
      setExpandedUnit(null);
      return;
    }

    setExpandedUnit(smartUnitId);

    if (
      Object.prototype.hasOwnProperty.call(
        instances,
        smartUnitId
      )
    ) {
      return;
    }

    await loadInstances(smartUnitId);
  };

  const handleDelete = async (id) => {
    if (!id) {
      return;
    }

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this Smart Unit?"
      );

    if (!confirmed) {
      return;
    }

    try {
      await deleteSmartUnit(id);

      setSmartUnits((previous) =>
        previous.filter(
          (smartUnit) =>
            smartUnit._id !== id
        )
      );

      setInstances((previous) => {
        const next = {
          ...previous,
        };

        delete next[id];

        return next;
      });

      if (expandedUnit === id) {
        setExpandedUnit(null);
      }
    } catch (error) {
      console.error(
        "Failed to delete Smart Unit:",
        error
      );

      alert(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to delete Smart Unit."
      );
    }
  };

  const getStatusStyle = (
    status
  ) => {
    switch (status) {
      case "available":
        return "border-[#B8D8C0] bg-[#EEF8F0] text-[#467454]";

      case "reserved":
        return "border-[#E5D3A7] bg-[#FBF6E9] text-[#8A6A2F]";

      case "assigned":
        return "border-[#BFD1E8] bg-[#EEF4FB] text-[#4D6F99]";

      case "activated":
        return "border-[#D8C7E8] bg-[#F6F0FA] text-[#79538F]";

      case "inactive":
        return "border-[#D9D5D0] bg-[#F4F2F0] text-[#77716A]";

      case "damaged":
        return "border-[#E7C1C1] bg-[#FCF0F0] text-[#A65353]";

      default:
        return "border-light-champagne bg-warm-ivory text-slate-gray";
    }
  };

  const getInstanceStatusStyle = (
    status
  ) => {
    switch (status) {
      case "available":
        return "border-[#B8D8C0] bg-[#EEF8F0] text-[#467454]";

      case "reserved":
        return "border-[#E5D3A7] bg-[#FBF6E9] text-[#8A6A2F]";

      case "assigned":
        return "border-[#BFD1E8] bg-[#EEF4FB] text-[#4D6F99]";

      case "activated":
        return "border-[#D8C7E8] bg-[#F6F0FA] text-[#79538F]";

      case "inactive":
        return "border-[#D9D5D0] bg-[#F4F2F0] text-[#77716A]";

      case "damaged":
        return "border-[#E7C1C1] bg-[#FCF0F0] text-[#A65353]";

      default:
        return "border-light-champagne bg-warm-ivory text-slate-gray";
    }
  };

  const getUnitInstances = (
    smartUnitId
  ) => {
    if (!smartUnitId) {
      return [];
    }

    return (
      instances[smartUnitId] || []
    );
  };

  const getInstanceSerial = (
    instance
  ) => {
    return (
      instance?.serialNumber ||
      instance?.serial ||
      instance?.deviceSerialNumber ||
      "No Serial"
    );
  };

  const getInstanceStatus = (
    instance
  ) => {
    return (
      instance?.status ||
      "available"
    );
  };

  const getLoadedCounts = (
    smartUnitId
  ) => {
    const unitInstances =
      getUnitInstances(smartUnitId);

    return {
      total:
        unitInstances.length,

      available:
        unitInstances.filter(
          (instance) =>
            getInstanceStatus(
              instance
            ) === "available"
        ).length,

      reserved:
        unitInstances.filter(
          (instance) =>
            getInstanceStatus(
              instance
            ) === "reserved"
        ).length,

      assigned:
        unitInstances.filter(
          (instance) =>
            getInstanceStatus(
              instance
            ) === "assigned"
        ).length,

      activated:
        unitInstances.filter(
          (instance) =>
            getInstanceStatus(
              instance
            ) === "activated"
        ).length,

      inactive:
        unitInstances.filter(
          (instance) =>
            getInstanceStatus(
              instance
            ) === "inactive"
        ).length,

      damaged:
        unitInstances.filter(
          (instance) =>
            getInstanceStatus(
              instance
            ) === "damaged"
        ).length,
    };
  };

  const getBackendCounts = (
    smartUnit
  ) => {
    return {
      total: Number(
        smartUnit?.stock ?? 0
      ),

      available: Number(
        smartUnit?.availableStock ??
          0
      ),

      reserved: Number(
        smartUnit?.reservedStock ?? 0
      ),

      assigned: Number(
        smartUnit?.assignedStock ?? 0
      ),

      activated: Number(
        smartUnit?.activatedStock ?? 0
      ),

      inactive: Number(
        smartUnit?.inactiveStock ?? 0
      ),

      damaged: Number(
        smartUnit?.damagedStock ?? 0
      ),
    };
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-warm-ivory text-midnight-navy">
      <div className="pointer-events-none fixed -left-52 top-24 h-[520px] w-[520px] rounded-full bg-champagne-gold/[0.05] blur-[140px]" />

      <div className="pointer-events-none fixed -right-52 bottom-0 h-[520px] w-[520px] rounded-full bg-light-champagne/60 blur-[140px]" />

      <header className="relative border-b border-light-champagne/90 bg-soft-white/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-7 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <span className="h-px w-8 bg-classic-gold/70" />

              <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-antique-gold">
                Smart Jewelry
              </span>
            </div>

            <h1 className="font-serif text-[2.5rem] font-normal leading-none tracking-[-0.04em] text-midnight-navy sm:text-[3rem]">
              Smart Units
            </h1>

            <p className="mt-3 max-w-2xl text-[13px] leading-6 text-slate-gray">
              Manage your smart jewelry units and their physical instances.
            </p>
          </div>

          <Link
            to="/admin/smart-units/new"
            className="inline-flex min-h-[48px] w-fit shrink-0 items-center justify-center gap-2.5 rounded-[13px] bg-midnight-navy px-6 text-[11px] font-semibold text-soft-white shadow-[0_10px_26px_rgba(18,38,58,0.15)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-rich-navy hover:shadow-[0_15px_34px_rgba(18,38,58,0.21)]"
          >
            <span className="text-[16px] text-champagne-gold">
              +
            </span>

            Add Smart Unit
          </Link>
        </div>
      </header>

      <main className="relative mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-12">
        {error && (
          <div className="mb-7 rounded-[16px] border border-red-200 bg-red-50/90 px-5 py-4 text-[13px] text-red-600 shadow-[0_7px_20px_rgba(7,19,31,0.025)]">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="relative overflow-hidden rounded-[28px] border border-light-champagne/90 bg-soft-white/90 px-6 py-24 text-center shadow-[0_20px_60px_rgba(7,19,31,0.055)]">
            <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full border border-champagne-gold/[0.07]" />

            <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-soft-cream blur-[90px]" />

            <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-champagne-gold/25 bg-soft-cream">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-champagne-gold border-t-transparent" />
            </div>

            <p className="relative mt-5 text-[13px] text-slate-gray">
              Loading Smart Units...
            </p>
          </div>
        ) : smartUnits.length ===
          0 ? (
          <div className="relative overflow-hidden rounded-[28px] border border-light-champagne/90 bg-soft-white/90 px-6 py-16 text-center shadow-[0_20px_60px_rgba(7,19,31,0.055)]">
            <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full border border-champagne-gold/[0.08]" />

            <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-soft-cream blur-[90px]" />

            <div className="relative z-10">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-champagne-gold/25 bg-soft-cream text-[17px] text-antique-gold">
                ✦
              </div>

              <h2 className="mt-6 font-serif text-[1.8rem] font-normal tracking-[-0.025em] text-midnight-navy">
                No Smart Units Found
              </h2>

              <p className="mx-auto mt-3 max-w-md text-[13px] leading-6 text-slate-gray">
                Start adding smart units to manage your inventory and smart jewelry devices.
              </p>

              <Link
                to="/admin/smart-units/new"
                className="mt-7 inline-flex min-h-[48px] items-center justify-center gap-2.5 rounded-[13px] bg-midnight-navy px-7 text-[11px] font-semibold text-soft-white"
              >
                <span className="text-[14px] text-champagne-gold">
                  +
                </span>

                Add Smart Unit
              </Link>
            </div>
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-[28px] border border-light-champagne/90 bg-soft-white/90 shadow-[0_20px_60px_rgba(7,19,31,0.06)]">
            <div className="pointer-events-none absolute -right-28 -top-28 h-72 w-72 rounded-full border border-champagne-gold/[0.07]" />

            <div className="pointer-events-none absolute -bottom-28 -left-28 h-72 w-72 rounded-full bg-soft-cream blur-[95px]" />

            <div className="relative z-10 flex flex-col gap-5 border-b border-light-champagne/85 bg-warm-ivory/45 px-7 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-champagne-gold/25 bg-soft-cream text-[14px] text-antique-gold">
                  ✦
                </div>

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-antique-gold">
                    Inventory
                  </p>

                  <h2 className="mt-1 font-serif text-[1.6rem] font-normal tracking-[-0.025em] text-midnight-navy">
                    Smart Units
                  </h2>
                </div>
              </div>

              <div className="w-fit rounded-full border border-light-champagne bg-soft-white px-4 py-2 text-[11px] font-semibold text-slate-gray">
                {smartUnits.length}{" "}
                {smartUnits.length === 1
                  ? "Unit"
                  : "Units"}
              </div>
            </div>

            <div className="relative z-10 overflow-x-auto">
              <table className="w-full min-w-[1250px]">
                <thead>
                  <tr className="border-b border-light-champagne/85 bg-warm-ivory/35">
                    <th className="px-6 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.15em] text-steel-gray">
                      Smart Unit
                    </th>

                    <th className="px-6 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.15em] text-steel-gray">
                      Technology
                    </th>

                    <th className="px-6 py-4 text-center text-[10px] font-semibold uppercase tracking-[0.15em] text-steel-gray">
                      Instances
                    </th>

                    <th className="px-6 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.15em] text-steel-gray">
                      Serial Numbers
                    </th>

                    <th className="px-6 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.15em] text-steel-gray">
                      Cost Price
                    </th>

                    <th className="px-6 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.15em] text-steel-gray">
                      Firmware
                    </th>

                    <th className="px-6 py-4 text-center text-[10px] font-semibold uppercase tracking-[0.15em] text-steel-gray">
                      Status
                    </th>

                    <th className="px-6 py-4 text-center text-[10px] font-semibold uppercase tracking-[0.15em] text-steel-gray">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {smartUnits.map(
                    (smartUnit) => {
                      const hasLoadedInstances =
                        Object.prototype.hasOwnProperty.call(
                          instances,
                          smartUnit._id
                        );

                      const unitInstances =
                        getUnitInstances(
                          smartUnit._id
                        );

                      const counts =
                        hasLoadedInstances
                          ? getLoadedCounts(
                              smartUnit._id
                            )
                          : getBackendCounts(
                              smartUnit
                            );

                      const isExpanded =
                        expandedUnit ===
                        smartUnit._id;

                      const isLoadingUnit =
                        Boolean(
                          loadingInstances[
                            smartUnit._id
                          ]
                        );

                      const unitError =
                        instanceErrors[
                          smartUnit._id
                        ];

                      return (
                        <Fragment
                          key={
                            smartUnit._id
                          }
                        >
                          <tr className="border-b border-light-champagne/65 transition-colors duration-300 hover:bg-warm-ivory/45">
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[14px] border border-light-champagne bg-soft-cream">
                                  {smartUnit.image ? (
                                    <img
                                      src={`http://localhost:5000${smartUnit.image}`}
                                      alt={
                                        smartUnit.name
                                      }
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <span className="text-[14px] text-antique-gold">
                                      ✦
                                    </span>
                                  )}
                                </div>

                                <div className="min-w-0">
                                  <p className="text-[13px] font-semibold text-midnight-navy">
                                    {
                                      smartUnit.name
                                    }
                                  </p>

                                  {smartUnit.description ? (
                                    <p className="mt-1 max-w-[220px] truncate text-[11px] text-slate-gray">
                                      {
                                        smartUnit.description
                                      }
                                    </p>
                                  ) : (
                                    <p className="mt-1 text-[11px] text-steel-gray">
                                      No description
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-5">
                              <span className="text-[13px] font-medium text-slate-gray">
                                {smartUnit
                                  .technologyModel
                                  ?.modelName ||
                                  "—"}
                              </span>
                            </td>

                            <td className="px-6 py-5 text-center">
                              <button
                                type="button"
                                onClick={() =>
                                  toggleInstances(
                                    smartUnit._id
                                  )
                                }
                                className="inline-flex min-w-[92px] flex-col items-center justify-center rounded-[15px] border border-light-champagne bg-warm-ivory/55 px-4 py-2.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-champagne-gold hover:bg-soft-cream"
                              >
                                <span className="font-serif text-[1.35rem] font-normal leading-none text-midnight-navy">
                                  {
                                    counts.total
                                  }
                                </span>

                                <span className="mt-1.5 text-[10px] uppercase tracking-[0.1em] text-steel-gray">
                                  Instances
                                </span>
                              </button>
                            </td>

                            <td className="px-6 py-5">
                              {!hasLoadedInstances ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    toggleInstances(
                                      smartUnit._id
                                    )
                                  }
                                  className="rounded-[11px] border border-light-champagne bg-soft-white px-3.5 py-2.5 text-[11px] font-semibold text-slate-gray transition-all duration-300 hover:border-champagne-gold hover:bg-warm-ivory hover:text-midnight-navy"
                                >
                                  View Serial Numbers
                                </button>
                              ) : unitInstances.length ===
                                0 ? (
                                <span className="text-[11px] text-steel-gray">
                                  No instances
                                </span>
                              ) : (
                                <div className="flex max-w-[350px] flex-wrap gap-2">
                                  {unitInstances
                                    .slice(
                                      0,
                                      3
                                    )
                                    .map(
                                      (
                                        instance
                                      ) => (
                                        <span
                                          key={
                                            instance._id
                                          }
                                          className="inline-flex rounded-[10px] border border-light-champagne bg-warm-ivory/45 px-3 py-2 font-mono text-[11px] tracking-[0.04em] text-slate-gray"
                                        >
                                          {getInstanceSerial(
                                            instance
                                          )}
                                        </span>
                                      )
                                    )}

                                  {unitInstances.length >
                                    3 && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        toggleInstances(
                                          smartUnit._id
                                        )
                                      }
                                      className="rounded-[10px] border border-champagne-gold/30 bg-soft-cream px-3 py-2 text-[11px] font-semibold text-antique-gold"
                                    >
                                      +{" "}
                                      {unitInstances.length -
                                        3}{" "}
                                      more
                                    </button>
                                  )}
                                </div>
                              )}
                            </td>

                            <td className="px-6 py-5">
                              <span className="text-[13px] font-semibold text-midnight-navy">
                                {Number(
                                  smartUnit.costPrice ||
                                    0
                                ).toLocaleString()}
                              </span>

                              <span className="ml-1 text-[11px] text-steel-gray">
                                EGP
                              </span>
                            </td>

                            <td className="px-6 py-5">
                              {smartUnit.firmwareVersion ? (
                                <span className="font-mono text-[11px] font-medium tracking-[0.04em] text-slate-gray">
                                  v
                                  {
                                    smartUnit.firmwareVersion
                                  }
                                </span>
                              ) : (
                                <span className="text-[13px] text-steel-gray">
                                  —
                                </span>
                              )}
                            </td>

                            <td className="px-6 py-5 text-center">
                              <div className="flex flex-col items-center gap-2">
                                <span
                                  className={`
                                    inline-flex
                                    rounded-full
                                    border
                                    px-3
                                    py-1.5
                                    text-[10px]
                                    font-semibold
                                    capitalize
                                    ${getStatusStyle(
                                      smartUnit.status
                                    )}
                                  `}
                                >
                                  {smartUnit.status ||
                                    "available"}
                                </span>

                                {counts.total >
                                  0 && (
                                  <span className="text-[10px] text-steel-gray">
                                    {
                                      counts.available
                                    }{" "}
                                    available
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="px-6 py-5">
                              <div className="flex items-center justify-center gap-2">
                                <Link
                                  to={`/admin/smart-units/${smartUnit._id}/edit`}
                                  className="inline-flex min-h-[36px] items-center justify-center rounded-[11px] border border-light-champagne bg-soft-white px-4 text-[10px] font-semibold text-slate-gray transition-all duration-300 hover:border-champagne-gold hover:bg-warm-ivory hover:text-midnight-navy"
                                >
                                  Edit
                                </Link>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDelete(
                                      smartUnit._id
                                    )
                                  }
                                  className="inline-flex min-h-[36px] items-center justify-center rounded-[11px] border border-red-200 bg-soft-white px-4 text-[10px] font-semibold text-red-600 transition-all duration-300 hover:bg-red-50"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>

                          {isExpanded && (
                            <tr className="border-b border-light-champagne/80 bg-warm-ivory/40">
                              <td
                                colSpan={8}
                                className="px-8 py-7"
                              >
                                <div className="relative overflow-hidden rounded-[22px] border border-light-champagne/90 bg-soft-white p-6 shadow-[0_10px_32px_rgba(7,19,31,0.035)]">
                                  <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full border border-champagne-gold/[0.07]" />

                                  <div className="relative mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-antique-gold">
                                        Physical Units
                                      </p>

                                      <h3 className="mt-1.5 font-serif text-[1.4rem] font-normal tracking-[-0.02em] text-midnight-navy">
                                        {
                                          smartUnit.name
                                        }{" "}
                                        Instances
                                      </h3>
                                    </div>

                                    <div className="w-fit rounded-full border border-light-champagne bg-warm-ivory/60 px-4 py-2 text-[11px] font-semibold text-slate-gray">
                                      {
                                        counts.total
                                      }{" "}
                                      {counts.total ===
                                      1
                                        ? "Instance"
                                        : "Instances"}
                                    </div>
                                  </div>

                                  {isLoadingUnit ? (
                                    <div className="flex flex-col items-center justify-center py-10">
                                      <span className="h-7 w-7 animate-spin rounded-full border-2 border-champagne-gold border-t-transparent" />

                                      <p className="mt-3 text-[11px] text-slate-gray">
                                        Loading serial numbers...
                                      </p>
                                    </div>
                                  ) : unitError ? (
                                    <div className="rounded-[18px] border border-red-200 bg-red-50 px-6 py-8 text-center">
                                      <p className="text-[13px] font-medium text-red-600">
                                        {
                                          unitError
                                        }
                                      </p>

                                      <button
                                        type="button"
                                        onClick={() =>
                                          loadInstances(
                                            smartUnit._id
                                          )
                                        }
                                        className="mt-4 rounded-[11px] bg-midnight-navy px-5 py-2.5 text-[10px] font-semibold text-soft-white"
                                      >
                                        Try Again
                                      </button>
                                    </div>
                                  ) : unitInstances.length ===
                                    0 ? (
                                    <div className="rounded-[18px] border border-dashed border-champagne-gold/30 bg-warm-ivory/55 px-6 py-10 text-center">
                                      <p className="text-[13px] font-medium text-midnight-navy">
                                        No physical instances found.
                                      </p>

                                      <p className="mt-1.5 text-[11px] leading-5 text-slate-gray">
                                        This Smart Unit does not have any registered serial numbers.
                                      </p>
                                    </div>
                                  ) : (
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                                      {unitInstances.map(
                                        (
                                          instance
                                        ) => (
                                          <div
                                            key={
                                              instance._id
                                            }
                                            className="rounded-[18px] border border-light-champagne/90 bg-warm-ivory/40 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-champagne-gold/45 hover:bg-soft-white"
                                          >
                                            <div className="flex items-start justify-between gap-4">
                                              <div className="min-w-0">
                                                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-antique-gold">
                                                  Serial Number
                                                </p>

                                                <p className="mt-2 break-all font-mono text-[12px] font-semibold tracking-[0.05em] text-midnight-navy">
                                                  {getInstanceSerial(
                                                    instance
                                                  )}
                                                </p>
                                              </div>

                                              <span
                                                className={`
                                                  shrink-0
                                                  rounded-full
                                                  border
                                                  px-2.5
                                                  py-1
                                                  text-[10px]
                                                  font-semibold
                                                  capitalize
                                                  ${getInstanceStatusStyle(
                                                    getInstanceStatus(
                                                      instance
                                                    )
                                                  )}
                                                `}
                                              >
                                                {getInstanceStatus(
                                                  instance
                                                )}
                                              </span>
                                            </div>

                                            {instance.firmwareVersion && (
                                              <div className="mt-4 flex items-center justify-between border-t border-light-champagne/80 pt-4">
                                                <span className="text-[11px] text-slate-gray">
                                                  Firmware
                                                </span>

                                                <span className="font-mono text-[11px] font-semibold text-midnight-navy">
                                                  v
                                                  {
                                                    instance.firmwareVersion
                                                  }
                                                </span>
                                              </div>
                                            )}

                                            <div className="mt-3 flex items-center justify-between gap-4">
                                              <span className="text-[11px] text-slate-gray">
                                                Instance ID
                                              </span>

                                              <span className="max-w-[180px] truncate font-mono text-[10px] text-steel-gray">
                                                {
                                                  instance._id
                                                }
                                              </span>
                                            </div>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  )}

                                  {hasLoadedInstances &&
                                    counts.total >
                                      0 && (
                                      <div className="mt-6 flex flex-wrap gap-2">
                                        {[
                                          [
                                            "available",
                                            counts.available,
                                          ],
                                          [
                                            "reserved",
                                            counts.reserved,
                                          ],
                                          [
                                            "assigned",
                                            counts.assigned,
                                          ],
                                          [
                                            "activated",
                                            counts.activated,
                                          ],
                                          [
                                            "inactive",
                                            counts.inactive,
                                          ],
                                          [
                                            "damaged",
                                            counts.damaged,
                                          ],
                                        ]
                                          .filter(
                                            ([
                                              ,
                                              count,
                                            ]) =>
                                              count >
                                              0
                                          )
                                          .map(
                                            ([
                                              status,
                                              count,
                                            ]) => (
                                              <span
                                                key={
                                                  status
                                                }
                                                className={`
                                                  inline-flex
                                                  items-center
                                                  gap-2
                                                  rounded-full
                                                  border
                                                  px-3
                                                  py-1.5
                                                  text-[10px]
                                                  font-semibold
                                                  capitalize
                                                  ${getInstanceStatusStyle(
                                                    status
                                                  )}
                                                `}
                                              >
                                                {
                                                  count
                                                }{" "}
                                                {
                                                  status
                                                }
                                              </span>
                                            )
                                          )}
                                      </div>
                                    )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminSmartUnitsPage;