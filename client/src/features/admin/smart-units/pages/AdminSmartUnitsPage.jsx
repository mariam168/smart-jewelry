import { useEffect, useState } from "react";
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

  // =========================================================
  // LOAD SMART UNITS ONLY
  // =========================================================

  const loadSmartUnits = async () => {
    try {
      setIsLoading(true);
      setError("");

      console.log("Loading Smart Units...");

      const response = await getSmartUnits();

      console.log("Smart Units response:", response);

      const units =
        response?.data?.smartUnits ||
        response?.smartUnits ||
        [];

      console.log("Smart Units:", units);

      setSmartUnits(Array.isArray(units) ? units : []);
    } catch (error) {
      console.error("Failed to load Smart Units:", error);

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to load Smart Units."
      );
    } finally {
      console.log("Finished loading Smart Units.");

      setIsLoading(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    loadSmartUnits();
  }, []);

  // =========================================================
  // LOAD INSTANCES FOR ONE SMART UNIT
  // =========================================================

  const loadInstances = async (smartUnitId) => {
    if (!smartUnitId) {
      console.error("Smart Unit ID is missing.");
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

      console.log(
        "Loading instances for Smart Unit:",
        smartUnitId
      );

      const response =
        await getSmartUnitInstances(smartUnitId);

      console.log(
        "Instances response:",
        response
      );

      const smartUnitInstances =
        response?.data?.instances ||
        response?.instances ||
        [];

      setInstances((previous) => ({
        ...previous,
        [smartUnitId]: Array.isArray(
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

  // =========================================================
  // TOGGLE INSTANCES
  // =========================================================

  const toggleInstances = async (smartUnitId) => {
    if (!smartUnitId) {
      return;
    }

    // Close
    if (expandedUnit === smartUnitId) {
      setExpandedUnit(null);
      return;
    }

    // Open
    setExpandedUnit(smartUnitId);

    // Already loaded
    if (
      Object.prototype.hasOwnProperty.call(
        instances,
        smartUnitId
      )
    ) {
      return;
    }

    // Load only when opened
    await loadInstances(smartUnitId);
  };

  // =========================================================
  // DELETE
  // =========================================================

  const handleDelete = async (id) => {
    if (!id) {
      return;
    }

    const confirmed = window.confirm(
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

  // =========================================================
  // SMART UNIT STATUS STYLE
  // =========================================================

  const getStatusStyle = (status) => {
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
        return "border-[#DDD4C8] bg-[#F8F5F0] text-[#756A5F]";
    }
  };

  // =========================================================
  // INSTANCE STATUS STYLE
  // =========================================================

  const getInstanceStatusStyle = (status) => {
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
        return "border-[#DDD4C8] bg-[#F8F5F0] text-[#756A5F]";
    }
  };

  // =========================================================
  // GET INSTANCES
  // =========================================================

  const getUnitInstances = (smartUnitId) => {
    if (!smartUnitId) {
      return [];
    }

    return instances[smartUnitId] || [];
  };

  // =========================================================
  // SERIAL NUMBER
  // =========================================================

  const getInstanceSerial = (instance) => {
    return (
      instance?.serialNumber ||
      instance?.serial ||
      instance?.deviceSerialNumber ||
      "No Serial"
    );
  };

  // =========================================================
  // INSTANCE STATUS
  // =========================================================

  const getInstanceStatus = (instance) => {
    return instance?.status || "available";
  };

  // =========================================================
  // INSTANCE COUNTS
  // =========================================================

  const getInstanceCounts = (smartUnitId) => {
    const unitInstances =
      getUnitInstances(smartUnitId);

    return {
      total: unitInstances.length,

      available: unitInstances.filter(
        (instance) =>
          getInstanceStatus(instance) ===
          "available"
      ).length,

      reserved: unitInstances.filter(
        (instance) =>
          getInstanceStatus(instance) ===
          "reserved"
      ).length,

      assigned: unitInstances.filter(
        (instance) =>
          getInstanceStatus(instance) ===
          "assigned"
      ).length,

      activated: unitInstances.filter(
        (instance) =>
          getInstanceStatus(instance) ===
          "activated"
      ).length,

      inactive: unitInstances.filter(
        (instance) =>
          getInstanceStatus(instance) ===
          "inactive"
      ).length,

      damaged: unitInstances.filter(
        (instance) =>
          getInstanceStatus(instance) ===
          "damaged"
      ).length,
    };
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="min-h-screen bg-[#F8F5F0]">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="border-b border-[#DCC18F]/20 bg-[#F8F5F0]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-7 lg:px-8">

          <div>

            <div className="mb-3 flex items-center gap-3">

              <span className="h-px w-8 bg-[#B08D57]" />

              <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#B08D57]">
                Smart Jewelry
              </span>

            </div>

            <h1 className="text-3xl font-medium tracking-tight text-[#302820] sm:text-4xl">
              Smart Units
            </h1>

            <p className="mt-2 text-sm text-[#8C8175]">
              Manage your smart jewelry units and
              their physical instances.
            </p>

          </div>

          <Link
            to="/admin/smart-units/new"
            className="
              inline-flex
              items-center
              gap-2
              rounded-full
              bg-[#302820]
              px-6
              py-3.5
              text-sm
              font-semibold
              text-white
              shadow-lg
              shadow-[#302820]/10
              transition-all
              duration-300
              hover:-translate-y-0.5
              hover:bg-[#40342A]
              hover:shadow-xl
            "
          >
            <span className="text-lg text-[#DCC18F]">
              +
            </span>

            Add Smart Unit
          </Link>

        </div>
      </header>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="mx-auto max-w-7xl px-6 py-10 lg:px-8">

        {/* ERROR */}

        {error && (
          <div
            className="
              mb-7
              rounded-2xl
              border
              border-red-200
              bg-red-50
              px-5
              py-4
              text-sm
              text-red-600
            "
          >
            {error}
          </div>
        )}

        {/* ===================================================
            LOADING
        =================================================== */}

        {isLoading ? (

          <div
            className="
              rounded-[2rem]
              border
              border-[#DCC18F]/25
              bg-white
              px-6
              py-24
              text-center
              shadow-[0_20px_60px_rgba(48,40,32,0.06)]
            "
          >

            <div
              className="
                mx-auto
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-full
                border
                border-[#DCC18F]/40
                bg-[#F8F5F0]
              "
            >

              <span
                className="
                  h-5
                  w-5
                  animate-spin
                  rounded-full
                  border-2
                  border-[#DCC18F]
                  border-t-transparent
                "
              />

            </div>

            <p className="mt-5 text-sm text-[#8C8175]">
              Loading Smart Units...
            </p>

          </div>

        ) : smartUnits.length === 0 ? (

          /* =================================================
             EMPTY
          ================================================= */

          <div
            className="
              relative
              overflow-hidden
              rounded-[2rem]
              border
              border-[#DCC18F]/25
              bg-white
              px-6
              py-16
              text-center
              shadow-[0_20px_60px_rgba(48,40,32,0.06)]
            "
          >

            <div
              className="
                pointer-events-none
                absolute
                -right-24
                -top-24
                h-64
                w-64
                rounded-full
                border
                border-[#DCC18F]/15
              "
            />

            <div
              className="
                pointer-events-none
                absolute
                -bottom-24
                -left-24
                h-64
                w-64
                rounded-full
                border
                border-[#DCC18F]/15
              "
            />

            <div className="relative z-10">

              <div
                className="
                  mx-auto
                  flex
                  h-16
                  w-16
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-[#DCC18F]/40
                  bg-[#F8F5F0]
                  text-2xl
                  text-[#B08D57]
                "
              >
                ✦
              </div>

              <h2 className="mt-6 text-xl font-medium text-[#302820]">
                No Smart Units Found
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm text-[#8C8175]">
                Start adding smart units to manage
                your inventory and smart jewelry
                devices.
              </p>

              <Link
                to="/admin/smart-units/new"
                className="
                  mt-7
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  bg-[#302820]
                  px-7
                  py-3.5
                  text-sm
                  font-semibold
                  text-white
                  transition
                  hover:bg-[#40342A]
                "
              >
                <span className="text-[#DCC18F]">
                  +
                </span>

                Add Smart Unit
              </Link>

            </div>

          </div>

        ) : (

          /* =================================================
             TABLE
          ================================================= */

          <div
            className="
              relative
              overflow-hidden
              rounded-[2rem]
              border
              border-[#DCC18F]/25
              bg-white
              shadow-[0_20px_60px_rgba(48,40,32,0.07)]
            "
          >

            <div
              className="
                pointer-events-none
                absolute
                -right-28
                -top-28
                h-72
                w-72
                rounded-full
                border
                border-[#DCC18F]/10
              "
            />

            <div
              className="
                pointer-events-none
                absolute
                -bottom-28
                -left-28
                h-72
                w-72
                rounded-full
                border
                border-[#DCC18F]/10
              "
            />

            {/* CARD HEADER */}

            <div
              className="
                relative
                z-10
                flex
                items-center
                justify-between
                border-b
                border-[#E8E0D5]
                px-7
                py-6
                sm:px-8
              "
            >

              <div className="flex items-center gap-4">

                <div
                  className="
                    flex
                    h-12
                    w-12
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-[#DCC18F]/40
                    bg-[#F8F5F0]
                    text-xl
                    text-[#B08D57]
                  "
                >
                  ✦
                </div>

                <div>

                  <p
                    className="
                      text-[10px]
                      font-semibold
                      uppercase
                      tracking-[0.25em]
                      text-[#B08D57]
                    "
                  >
                    Inventory
                  </p>

                  <h2 className="mt-1 text-xl font-medium text-[#302820]">
                    Smart Units
                  </h2>

                </div>

              </div>

              <div
                className="
                  hidden
                  rounded-full
                  border
                  border-[#DCC18F]/30
                  bg-[#F8F5F0]
                  px-4
                  py-2
                  text-xs
                  font-semibold
                  text-[#6F5940]
                  sm:block
                "
              >
                {smartUnits.length}{" "}
                {smartUnits.length === 1
                  ? "Unit"
                  : "Units"}
              </div>

            </div>

            {/* TABLE */}

            <div className="relative z-10 overflow-x-auto">

              <table className="min-w-[1250px] w-full">

                <thead>

                  <tr className="border-b border-[#E8E0D5] bg-[#FCFAF7]">

                    <th className="px-6 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8C8175]">
                      Smart Unit
                    </th>

                    <th className="px-6 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8C8175]">
                      Technology
                    </th>

                    <th className="px-6 py-4 text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8C8175]">
                      Instances
                    </th>

                    <th className="px-6 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8C8175]">
                      Serial Numbers
                    </th>

                    <th className="px-6 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8C8175]">
                      Cost Price
                    </th>

                    <th className="px-6 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8C8175]">
                      Firmware
                    </th>

                    <th className="px-6 py-4 text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8C8175]">
                      Status
                    </th>

                    <th className="px-6 py-4 text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8C8175]">
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {smartUnits.map((smartUnit) => {

                    const unitInstances =
                      getUnitInstances(
                        smartUnit._id
                      );

                    const counts =
                      getInstanceCounts(
                        smartUnit._id
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
                      <tbody
                        key={smartUnit._id}
                      >

                        {/* =================================================
                            MAIN ROW
                        ================================================= */}

                        <tr
                          className="
                            border-b
                            border-[#EEE8E0]
                            transition
                            hover:bg-[#FCFAF7]
                          "
                        >

                          {/* SMART UNIT */}

                          <td className="px-6 py-5">

                            <div className="flex items-center gap-4">

                              <div
                                className="
                                  flex
                                  h-12
                                  w-12
                                  shrink-0
                                  items-center
                                  justify-center
                                  overflow-hidden
                                  rounded-xl
                                  border
                                  border-[#DCC18F]/30
                                  bg-[#F8F5F0]
                                "
                              >

                                {smartUnit.image ? (

                                  <img
                                    src={`http://localhost:5000${smartUnit.image}`}
                                    alt={smartUnit.name}
                                    className="h-full w-full object-cover"
                                  />

                                ) : (

                                  <span className="text-lg text-[#B08D57]">
                                    ✦
                                  </span>

                                )}

                              </div>

                              <div className="min-w-0">

                                <p className="font-semibold text-[#302820]">
                                  {smartUnit.name}
                                </p>

                                {smartUnit.description ? (

                                  <p className="mt-1 max-w-[220px] truncate text-xs text-[#9A8F83]">
                                    {
                                      smartUnit.description
                                    }
                                  </p>

                                ) : (

                                  <p className="mt-1 text-xs text-[#B5AAA0]">
                                    No description
                                  </p>

                                )}

                              </div>

                            </div>

                          </td>

                          {/* TECHNOLOGY */}

                          <td className="px-6 py-5">

                            <span className="font-medium text-[#5E5043]">

                              {smartUnit
                                .technologyModel
                                ?.modelName ||
                                "—"}

                            </span>

                          </td>

                          {/* INSTANCES */}

                          <td className="px-6 py-5 text-center">

                            <button
                              type="button"
                              onClick={() =>
                                toggleInstances(
                                  smartUnit._id
                                )
                              }
                              className="
                                inline-flex
                                min-w-[90px]
                                flex-col
                                items-center
                                justify-center
                                rounded-2xl
                                border
                                border-[#DCC18F]/40
                                bg-[#FCFAF7]
                                px-4
                                py-2.5
                                transition
                                hover:border-[#B08D57]
                                hover:bg-[#F8F5F0]
                              "
                            >

                              <span className="text-lg font-semibold text-[#302820]">
                                {instances[
                                  smartUnit._id
                                ]
                                  ? counts.total
                                  : smartUnit.stock ??
                                    0}
                              </span>

                              <span className="text-[10px] uppercase tracking-wider text-[#9A8F83]">
                                Instances
                              </span>

                            </button>

                          </td>

                          {/* SERIAL NUMBERS */}

                          <td className="px-6 py-5">

                            {!instances[
                              smartUnit._id
                            ] ? (

                              <button
                                type="button"
                                onClick={() =>
                                  toggleInstances(
                                    smartUnit._id
                                  )
                                }
                                className="
                                  rounded-lg
                                  border
                                  border-[#DCC18F]/40
                                  bg-[#F8F5F0]
                                  px-3
                                  py-2
                                  text-[11px]
                                  font-semibold
                                  text-[#6F5940]
                                  transition
                                  hover:border-[#B08D57]
                                  hover:bg-[#F1EBDD]
                                "
                              >
                                View Serial Numbers
                              </button>

                            ) : unitInstances.length ===
                              0 ? (

                              <span className="text-xs text-[#B5AAA0]">
                                No instances
                              </span>

                            ) : (

                              <div className="flex max-w-[350px] flex-wrap gap-2">

                                {unitInstances
                                  .slice(0, 3)
                                  .map(
                                    (
                                      instance
                                    ) => (

                                      <span
                                        key={
                                          instance._id
                                        }
                                        className="
                                          inline-flex
                                          rounded-lg
                                          border
                                          border-[#E5DDD3]
                                          bg-[#FCFAF7]
                                          px-3
                                          py-2
                                          font-mono
                                          text-[11px]
                                          tracking-wider
                                          text-[#5E5043]
                                        "
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
                                    className="
                                      rounded-lg
                                      border
                                      border-[#DCC18F]/40
                                      bg-[#F8F5F0]
                                      px-3
                                      py-2
                                      text-[11px]
                                      font-semibold
                                      text-[#8A6A2F]
                                    "
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

                          {/* COST */}

                          <td className="px-6 py-5">

                            <span className="font-medium text-[#302820]">
                              {Number(
                                smartUnit.costPrice ||
                                  0
                              ).toLocaleString()}
                            </span>

                            <span className="ml-1 text-xs text-[#9A8F83]">
                              EGP
                            </span>

                          </td>

                          {/* FIRMWARE */}

                          <td className="px-6 py-5">

                            {smartUnit.firmwareVersion ? (

                              <span className="font-mono text-xs tracking-wide text-[#6F6256]">
                                v
                                {
                                  smartUnit.firmwareVersion
                                }
                              </span>

                            ) : (

                              <span className="text-sm text-[#B5AAA0]">
                                —
                              </span>

                            )}

                          </td>

                          {/* STATUS */}

                          <td className="px-6 py-5 text-center">

                            <div className="flex flex-col items-center gap-2">

                              <span
                                className={`
                                  inline-flex
                                  rounded-full
                                  border
                                  px-3
                                  py-1.5
                                  text-[11px]
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

                              {smartUnit.stock >
                                0 && (

                                <span className="text-[10px] text-[#9A8F83]">
                                  {smartUnit.stock}{" "}
                                  physical units
                                </span>

                              )}

                            </div>

                          </td>

                          {/* ACTIONS */}

                          <td className="px-6 py-5">

                            <div className="flex items-center justify-center gap-2">

                              <Link
                                to={`/admin/smart-units/${smartUnit._id}/edit`}
                                className="
                                  inline-flex
                                  items-center
                                  rounded-full
                                  border
                                  border-[#DCC18F]/40
                                  bg-white
                                  px-4
                                  py-2
                                  text-xs
                                  font-semibold
                                  text-[#6F5940]
                                  transition
                                  hover:border-[#B08D57]
                                  hover:bg-[#F8F5F0]
                                "
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
                                className="
                                  inline-flex
                                  items-center
                                  rounded-full
                                  border
                                  border-red-200
                                  bg-white
                                  px-4
                                  py-2
                                  text-xs
                                  font-semibold
                                  text-red-600
                                  transition
                                  hover:bg-red-50
                                "
                              >
                                Delete
                              </button>

                            </div>

                          </td>

                        </tr>

                        {/* =================================================
                            EXPANDED INSTANCES
                        ================================================= */}

                        {isExpanded && (

                          <tr className="border-b border-[#E8E0D5] bg-[#FCFAF7]">

                            <td
                              colSpan={8}
                              className="px-8 py-7"
                            >

                              <div className="rounded-2xl border border-[#DCC18F]/25 bg-white p-6">

                                {/* HEADER */}

                                <div className="mb-5 flex items-center justify-between">

                                  <div>

                                    <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#B08D57]">
                                      Physical Units
                                    </p>

                                    <h3 className="mt-1 text-lg font-medium text-[#302820]">
                                      {
                                        smartUnit.name
                                      }{" "}
                                      Instances
                                    </h3>

                                  </div>

                                  <div className="rounded-full border border-[#DCC18F]/30 bg-[#F8F5F0] px-4 py-2 text-xs font-semibold text-[#6F5940]">

                                    {instances[
                                      smartUnit._id
                                    ]
                                      ? counts.total
                                      : smartUnit.stock ??
                                        0}

                                    {" "}
                                    {(
                                      instances[
                                        smartUnit._id
                                      ]
                                        ? counts.total
                                        : smartUnit.stock ??
                                          0
                                    ) === 1
                                      ? "Instance"
                                      : "Instances"}

                                  </div>

                                </div>

                                {/* LOADING */}

                                {isLoadingUnit ? (

                                  <div className="flex flex-col items-center justify-center py-10">

                                    <span
                                      className="
                                        h-7
                                        w-7
                                        animate-spin
                                        rounded-full
                                        border-2
                                        border-[#DCC18F]
                                        border-t-transparent
                                      "
                                    />

                                    <p className="mt-3 text-xs text-[#9A8F83]">
                                      Loading serial numbers...
                                    </p>

                                  </div>

                                ) : unitError ? (

                                  <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-8 text-center">

                                    <p className="text-sm font-medium text-red-600">
                                      {unitError}
                                    </p>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        loadInstances(
                                          smartUnit._id
                                        )
                                      }
                                      className="
                                        mt-4
                                        rounded-full
                                        bg-[#302820]
                                        px-5
                                        py-2.5
                                        text-xs
                                        font-semibold
                                        text-white
                                      "
                                    >
                                      Try Again
                                    </button>

                                  </div>

                                ) : unitInstances.length ===
                                  0 ? (

                                  <div className="rounded-2xl border border-dashed border-[#DCC18F]/40 bg-[#F8F5F0] px-6 py-10 text-center">

                                    <p className="text-sm font-medium text-[#6F5940]">
                                      No physical
                                      instances found.
                                    </p>

                                    <p className="mt-1 text-xs text-[#9A8F83]">
                                      This Smart Unit
                                      does not have
                                      any registered
                                      serial numbers.
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
                                          className="
                                            rounded-2xl
                                            border
                                            border-[#E5DDD3]
                                            bg-[#FCFAF7]
                                            p-5
                                          "
                                        >

                                          <div className="flex items-start justify-between gap-4">

                                            <div className="min-w-0">

                                              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#B08D57]">
                                                Serial Number
                                              </p>

                                              <p className="mt-2 break-all font-mono text-sm font-semibold tracking-wider text-[#302820]">
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

                                            <div className="mt-4 flex items-center justify-between border-t border-[#E8E0D5] pt-4">

                                              <span className="text-xs text-[#9A8F83]">
                                                Firmware
                                              </span>

                                              <span className="font-mono text-xs font-semibold text-[#5E5043]">
                                                v
                                                {
                                                  instance.firmwareVersion
                                                }
                                              </span>

                                            </div>

                                          )}

                                          <div className="mt-3 flex items-center justify-between">

                                            <span className="text-xs text-[#9A8F83]">
                                              Instance ID
                                            </span>

                                            <span className="max-w-[180px] truncate font-mono text-[10px] text-[#B5AAA0]">
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

                                {/* COUNTS */}

                                {instances[
                                  smartUnit._id
                                ] &&
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
                                        ([, count]) =>
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
                                            {count}{" "}
                                            {status}
                                          </span>

                                        )
                                      )}

                                  </div>

                                )}

                              </div>

                            </td>

                          </tr>

                        )}

                      </tbody>
                    );
                  })}

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