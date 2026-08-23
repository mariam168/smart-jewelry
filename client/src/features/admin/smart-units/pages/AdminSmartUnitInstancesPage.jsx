import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useParams,
} from "react-router-dom";

import {
  getSmartUnit,
  getSmartUnitInstances,
} from "../services/smartUnitApi";

const AdminSmartUnitInstancesPage =
  () => {
    const { smartUnitId } =
      useParams();

    const [
      smartUnit,
      setSmartUnit,
    ] = useState(null);

    const [
      instances,
      setInstances,
    ] = useState([]);

    const [
      isLoading,
      setIsLoading,
    ] = useState(true);

    const [
      error,
      setError,
    ] = useState("");

    useEffect(() => {
      const loadData =
        async () => {
          try {
            setIsLoading(true);
            setError("");

            const [
              smartUnitResponse,
              instancesResponse,
            ] =
              await Promise.all([
                getSmartUnit(
                  smartUnitId
                ),

                getSmartUnitInstances(
                  smartUnitId
                ),
              ]);

            const loadedSmartUnit =
              smartUnitResponse
                ?.data
                ?.smartUnit ||
              smartUnitResponse
                ?.smartUnit ||
              null;

            const loadedInstances =
              instancesResponse
                ?.data
                ?.instances ||
              instancesResponse
                ?.instances ||
              [];

            setSmartUnit(
              loadedSmartUnit
            );

            setInstances(
              Array.isArray(
                loadedInstances
              )
                ? loadedInstances
                : []
            );
          } catch (error) {
            console.error(
              error
            );

            setError(
              error?.response
                ?.data
                ?.message ||
                "Failed to load Smart Unit instances."
            );
          } finally {
            setIsLoading(
              false
            );
          }
        };

      if (smartUnitId) {
        loadData();
      }
    }, [smartUnitId]);

    const counts =
      useMemo(() => {
        return {
          total:
            instances.length,

          available:
            instances.filter(
              (item) =>
                item.status ===
                "available"
            ).length,

          reserved:
            instances.filter(
              (item) =>
                item.status ===
                "reserved"
            ).length,

          assigned:
            instances.filter(
              (item) =>
                item.status ===
                "assigned"
            ).length,

          activated:
            instances.filter(
              (item) =>
                item.status ===
                "activated"
            ).length,

          inactive:
            instances.filter(
              (item) =>
                item.status ===
                "inactive"
            ).length,

          damaged:
            instances.filter(
              (item) =>
                item.status ===
                "damaged"
            ).length,
        };
      }, [instances]);

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

    return (
      <div className="min-h-screen bg-warm-ivory text-midnight-navy">
        <header className="border-b border-light-champagne bg-soft-white/80">
          <div className="mx-auto max-w-7xl px-6 py-7">
            <Link
              to="/admin/smart-units"
              className="mb-6 inline-flex text-[12px] font-semibold text-antique-gold"
            >
              ← Back to Smart Units
            </Link>

            <div className="flex items-end justify-between">
              <div>
                <h1 className="font-serif text-[2.7rem] tracking-[-0.04em]">
                  Physical Units
                </h1>

                <p className="mt-2 text-[13px] text-slate-gray">
                  {smartUnit?.name ||
                    "Smart Unit"}{" "}
                  — Serial Numbers
                </p>
              </div>

              {!isLoading && (
                <div className="rounded-full border border-light-champagne px-5 py-2 text-[12px]">
                  {counts.total}{" "}
                  {counts.total ===
                  1
                    ? "Unit"
                    : "Units"}
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-6 py-10">
          {error && (
            <div className="mb-6 rounded-[16px] border border-red-200 bg-red-50 px-5 py-4 text-[13px] text-red-600">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="rounded-[28px] border border-light-champagne bg-soft-white py-24 text-center">
              <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-light-champagne border-t-classic-gold" />

              <p className="mt-4 text-[13px] text-slate-gray">
                Loading physical units...
              </p>
            </div>
          ) : (
            <>
              <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="rounded-[20px] border border-light-champagne bg-soft-white p-5">
                  <p className="text-[11px] text-slate-gray">
                    Total
                  </p>

                  <p className="mt-2 font-serif text-[2rem]">
                    {counts.total}
                  </p>
                </div>

                <div className="rounded-[20px] border border-[#B8D8C0] bg-[#EEF8F0] p-5">
                  <p className="text-[11px] text-[#467454]">
                    Available
                  </p>

                  <p className="mt-2 text-[2rem] text-[#467454]">
                    {
                      counts.available
                    }
                  </p>
                </div>

                <div className="rounded-[20px] border border-[#BFD1E8] bg-[#EEF4FB] p-5">
                  <p className="text-[11px] text-[#4D6F99]">
                    Assigned
                  </p>

                  <p className="mt-2 text-[2rem] text-[#4D6F99]">
                    {
                      counts.assigned
                    }
                  </p>
                </div>

                <div className="rounded-[20px] border border-[#D8C7E8] bg-[#F6F0FA] p-5">
                  <p className="text-[11px] text-[#79538F]">
                    Activated
                  </p>

                  <p className="mt-2 text-[2rem] text-[#79538F]">
                    {
                      counts.activated
                    }
                  </p>
                </div>
              </div>

              <div className="overflow-hidden rounded-[28px] border border-light-champagne bg-soft-white">
                <div className="border-b border-light-champagne px-7 py-6">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-antique-gold">
                    Inventory
                  </p>

                  <h2 className="mt-1 font-serif text-[1.6rem]">
                    Serial Numbers
                  </h2>

                  {smartUnit
                    ?.technologyModel
                    ?.modelName && (
                    <p className="mt-2 text-[12px] text-slate-gray">
                      Technology:{" "}
                      {
                        smartUnit
                          .technologyModel
                          .modelName
                      }
                    </p>
                  )}
                </div>

                {instances.length ===
                0 ? (
                  <div className="py-16 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-champagne-gold/25 bg-soft-cream text-antique-gold">
                      ✦
                    </div>

                    <h3 className="mt-5 font-serif text-[1.5rem]">
                      No Physical Units
                    </h3>

                    <p className="mt-2 text-[13px] text-slate-gray">
                      No serial numbers have been generated for this Smart Unit.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px]">
                      <thead>
                        <tr className="border-b border-light-champagne bg-warm-ivory/40">
                          <th className="px-7 py-4 text-left text-[10px] uppercase text-steel-gray">
                            #
                          </th>

                          <th className="px-7 py-4 text-left text-[10px] uppercase text-steel-gray">
                            Serial Number
                          </th>

                          <th className="px-7 py-4 text-left text-[10px] uppercase text-steel-gray">
                            Status
                          </th>

                          <th className="px-7 py-4 text-left text-[10px] uppercase text-steel-gray">
                            Firmware
                          </th>

                          <th className="px-7 py-4 text-left text-[10px] uppercase text-steel-gray">
                            Created
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {instances.map(
                          (
                            instance,
                            index
                          ) => (
                            <tr
                              key={
                                instance._id
                              }
                              className="border-b border-light-champagne/70 last:border-0"
                            >
                              <td className="px-7 py-5 text-[12px] text-slate-gray">
                                {String(
                                  index +
                                    1
                                ).padStart(
                                  2,
                                  "0"
                                )}
                              </td>

                              <td className="px-7 py-5">
                                <span className="rounded-[10px] border border-light-champagne bg-warm-ivory px-3 py-2 font-mono text-[13px] font-semibold">
                                  {
                                    instance.serialNumber
                                  }
                                </span>
                              </td>

                              <td className="px-7 py-5">
                                <span
                                  className={`rounded-full border px-3 py-1.5 text-[10px] font-semibold capitalize ${getStatusStyle(
                                    instance.status
                                  )}`}
                                >
                                  {
                                    instance.status
                                  }
                                </span>
                              </td>

                              <td className="px-7 py-5 font-mono text-[12px] text-slate-gray">
                                {instance.firmwareVersion
                                  ? `v${instance.firmwareVersion}`
                                  : "—"}
                              </td>

                              <td className="px-7 py-5 text-[12px] text-slate-gray">
                                {instance.createdAt
                                  ? new Date(
                                      instance.createdAt
                                    ).toLocaleDateString()
                                  : "—"}
                              </td>
                            </tr>
                          )
                        )}
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