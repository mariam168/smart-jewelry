import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  getSmartUnitInstances,
} from "../services/smartUnitApi";

const AdminSmartUnitInstancesPage = () => {
  const { smartUnitId } = useParams();

  const [instances, setInstances] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadInstances = async () => {
      try {
        setIsLoading(true);
        setError("");

        const response =
          await getSmartUnitInstances(smartUnitId);

        const data =
          response.data?.instances ||
          response.instances ||
          [];

        setInstances(data);
      } catch (error) {
        console.error(error);

        setError(
          error?.response?.data?.message ||
            "Failed to load Smart Unit instances."
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (smartUnitId) {
      loadInstances();
    }
  }, [smartUnitId]);

  const smartUnit = instances[0]?.smartUnit;

  const counts = useMemo(() => {
    return {
      total: instances.length,

      available: instances.filter(
        (item) => item.status === "available"
      ).length,

      reserved: instances.filter(
        (item) => item.status === "reserved"
      ).length,

      assigned: instances.filter(
        (item) => item.status === "assigned"
      ).length,

      activated: instances.filter(
        (item) => item.status === "activated"
      ).length,

      inactive: instances.filter(
        (item) => item.status === "inactive"
      ).length,

      damaged: instances.filter(
        (item) => item.status === "damaged"
      ).length,
    };
  }, [instances]);

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

  return (
    <div className="min-h-screen bg-[#F8F5F0]">

      {/* HEADER */}

      <header className="border-b border-[#DCC18F]/20 bg-[#F8F5F0]">
        <div className="mx-auto max-w-7xl px-6 py-7 lg:px-8">

          <Link
            to="/admin/smart-units"
            className="
              mb-6
              inline-flex
              items-center
              gap-2
              text-sm
              font-medium
              text-[#8A6A2F]
              transition
              hover:text-[#B08D57]
            "
          >
            ← Back to Smart Units
          </Link>

          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

            <div>

              <div className="mb-3 flex items-center gap-3">
                <span className="h-px w-8 bg-[#B08D57]" />

                <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#B08D57]">
                  Smart Jewelry
                </span>
              </div>

              <h1 className="text-3xl font-medium tracking-tight text-[#302820] sm:text-4xl">
                Physical Units
              </h1>

              <p className="mt-2 text-sm text-[#8C8175]">
                {smartUnit?.name || "Smart Unit"} — Serial Numbers
              </p>

            </div>

            {!isLoading && (
              <div
                className="
                  rounded-full
                  border
                  border-[#DCC18F]/30
                  bg-white
                  px-5
                  py-2.5
                  text-sm
                  font-semibold
                  text-[#6F5940]
                "
              >
                {counts.total}{" "}
                {counts.total === 1
                  ? "Unit"
                  : "Units"}
              </div>
            )}

          </div>
        </div>
      </header>

      {/* MAIN */}

      <main className="mx-auto max-w-7xl px-6 py-10 lg:px-8">

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

        {/* LOADING */}

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
              Loading physical units...
            </p>
          </div>

        ) : (

          <>

            {/* SUMMARY */}

            <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">

              <div className="rounded-2xl border border-[#DCC18F]/25 bg-white p-5">
                <p className="text-xs text-[#9A8F83]">
                  Total
                </p>

                <p className="mt-2 text-2xl font-semibold text-[#302820]">
                  {counts.total}
                </p>
              </div>

              <div className="rounded-2xl border border-[#B8D8C0] bg-[#EEF8F0] p-5">
                <p className="text-xs text-[#467454]">
                  Available
                </p>

                <p className="mt-2 text-2xl font-semibold text-[#467454]">
                  {counts.available}
                </p>
              </div>

              <div className="rounded-2xl border border-[#BFD1E8] bg-[#EEF4FB] p-5">
                <p className="text-xs text-[#4D6F99]">
                  Assigned
                </p>

                <p className="mt-2 text-2xl font-semibold text-[#4D6F99]">
                  {counts.assigned}
                </p>
              </div>

              <div className="rounded-2xl border border-[#D8C7E8] bg-[#F6F0FA] p-5">
                <p className="text-xs text-[#79538F]">
                  Activated
                </p>

                <p className="mt-2 text-2xl font-semibold text-[#79538F]">
                  {counts.activated}
                </p>
              </div>

            </div>

            {/* INSTANCES */}

            <div
              className="
                overflow-hidden
                rounded-[2rem]
                border
                border-[#DCC18F]/25
                bg-white
                shadow-[0_20px_60px_rgba(48,40,32,0.07)]
              "
            >

              <div className="border-b border-[#E8E0D5] px-7 py-6">

                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#B08D57]">
                  Inventory
                </p>

                <h2 className="mt-1 text-xl font-medium text-[#302820]">
                  Serial Numbers
                </h2>

                {smartUnit?.technologyModel?.modelName && (
                  <p className="mt-1 text-sm text-[#8C8175]">
                    Technology:{" "}
                    {smartUnit.technologyModel.modelName}
                  </p>
                )}

              </div>

              {instances.length === 0 ? (

                <div className="px-6 py-16 text-center">
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

                  <h3 className="mt-5 text-lg font-medium text-[#302820]">
                    No Physical Units
                  </h3>

                  <p className="mt-2 text-sm text-[#8C8175]">
                    No serial numbers have been generated for this Smart Unit.
                  </p>
                </div>

              ) : (

                <div className="overflow-x-auto">

                  <table className="w-full min-w-[850px]">

                    <thead>
                      <tr className="border-b border-[#E8E0D5] bg-[#FCFAF7]">

                        <th className="px-7 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8C8175]">
                          #
                        </th>

                        <th className="px-7 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8C8175]">
                          Serial Number
                        </th>

                        <th className="px-7 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8C8175]">
                          Status
                        </th>

                        <th className="px-7 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8C8175]">
                          Firmware
                        </th>

                        <th className="px-7 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8C8175]">
                          Created
                        </th>

                      </tr>
                    </thead>

                    <tbody>

                      {instances.map((instance, index) => (

                        <tr
                          key={instance._id}
                          className="
                            border-b
                            border-[#EEE8E0]
                            transition
                            last:border-b-0
                            hover:bg-[#FCFAF7]
                          "
                        >

                          <td className="px-7 py-5">
                            <span className="text-sm text-[#9A8F83]">
                              {String(index + 1).padStart(2, "0")}
                            </span>
                          </td>

                          <td className="px-7 py-5">

                            <div
                              className="
                                inline-flex
                                rounded-xl
                                border
                                border-[#DCC18F]/30
                                bg-[#FCFAF7]
                                px-4
                                py-2.5
                              "
                            >
                              <span
                                className="
                                  font-mono
                                  text-sm
                                  font-semibold
                                  tracking-wider
                                  text-[#302820]
                                "
                              >
                                {instance.serialNumber}
                              </span>
                            </div>

                          </td>

                          <td className="px-7 py-5">

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
                                  instance.status
                                )}
                              `}
                            >
                              {instance.status}
                            </span>

                          </td>

                          <td className="px-7 py-5">

                            {instance.firmwareVersion ? (
                              <span className="font-mono text-xs text-[#5E5043]">
                                v{instance.firmwareVersion}
                              </span>
                            ) : (
                              <span className="text-sm text-[#B5AAA0]">
                                —
                              </span>
                            )}

                          </td>

                          <td className="px-7 py-5">

                            <span className="text-xs text-[#8C8175]">
                              {instance.createdAt
                                ? new Date(
                                    instance.createdAt
                                  ).toLocaleDateString()
                                : "—"}
                            </span>

                          </td>

                        </tr>

                      ))}

                    </tbody>

                  </table>

                </div>

              )}

            </div>

          </>
        )}

      </main>
    </div>
  );
};

export default AdminSmartUnitInstancesPage;