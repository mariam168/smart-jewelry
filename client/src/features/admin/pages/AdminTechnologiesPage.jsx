
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useAuth } from "../../auth/context/AuthContext.jsx";

import { getTechnologies, deleteTechnology } from "../services/technologyApi";

const AdminTechnologiesPage = () => {
  const { t } = useTranslation();

  const { user } = useAuth();

  const isSuperAdmin = user?.role?.name === "super_admin";

  const [technologies, setTechnologies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const loadTechnologies = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await getTechnologies();

      setTechnologies(response.data?.technologies || []);
    } catch (error) {
      console.error(error);

      setError(
        error?.response?.data?.message ||
          t("adminTechnologies.failedToLoadTechnologies"),
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTechnologies();
  }, []);

  const filteredTechnologies = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return technologies;
    }

    return technologies.filter((technology) => {
      const searchableValues = [
        technology?.name,
        technology?.code,
        technology?.slug,
        technology?._id,
        technology?.description,
        technology?.status,
      ];

      return searchableValues.some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(normalizedSearch),
      );
    });
  }, [technologies, searchTerm]);

  const handleDelete = async (technologyId) => {
    const confirmed = window.confirm(
      t("adminTechnologies.deleteConfirmation"),
    );

    if (!confirmed) return;

    try {
      await deleteTechnology(technologyId);

      setTechnologies((previous) =>
        previous.filter((technology) => technology._id !== technologyId),
      );
    } catch (error) {
      console.error(error);

      alert(
        error?.response?.data?.message ||
          t("adminTechnologies.failedToDeleteTechnology"),
      );
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-warm-ivory text-midnight-navy">
      <div className="pointer-events-none fixed -right-52 top-16 h-[520px] w-[520px] rounded-full bg-champagne-gold/[0.06] blur-[130px]" />

      <div className="pointer-events-none fixed -left-44 bottom-0 h-[460px] w-[460px] rounded-full bg-light-champagne/50 blur-[120px]" />

      <header className="relative border-b border-light-champagne/80 bg-soft-white/55 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1360px] flex-col gap-6 px-6 py-7 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10 xl:px-12">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <span className="h-px w-8 bg-classic-gold/60" />

              <span className="text-[8px] font-semibold uppercase tracking-[0.3em] text-antique-gold">
                {t("adminTechnologies.smartJewelry")}
              </span>

              <span className="text-[7px] text-classic-gold">✦</span>
            </div>

            <h1 className="font-serif text-[2.6rem] font-normal leading-none tracking-[-0.04em] text-midnight-navy sm:text-[3.2rem]">
              {t("adminTechnologies.technologies")}
            </h1>

            <p className="mt-4 max-w-[560px] text-[12px] leading-7 text-slate-gray sm:text-[13px]">
              {t("adminTechnologies.manageDescription")}
            </p>
          </div>

          <Link
            to="/admin/technologies/new"
            className="group inline-flex min-h-[50px] w-fit items-center justify-center gap-4 rounded-[13px] bg-midnight-navy px-6 text-[9px] font-semibold uppercase tracking-[0.12em] text-soft-white shadow-[0_12px_28px_rgba(18,38,58,0.15)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-rich-navy hover:shadow-[0_16px_35px_rgba(18,38,58,0.20)]"
          >
            <span className="text-[18px] font-light leading-none text-champagne-gold">
              +
            </span>
            {t("adminTechnologies.addTechnology")}
          </Link>
        </div>
      </header>

      <main className="relative mx-auto max-w-[1360px] px-6 py-10 sm:px-8 lg:px-10 xl:px-12">
        {error && (
          <div className="mb-7 overflow-hidden rounded-[18px] border border-antique-gold/25 bg-soft-cream/80 px-5 py-4 shadow-[0_8px_24px_rgba(7,19,31,0.035)]">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-midnight-navy text-[11px] text-champagne-gold">
                !
              </span>

              <p className="pt-1.5 text-[11px] leading-5 text-antique-gold">
                {error}
              </p>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex min-h-[420px] items-center justify-center">
            <div className="text-center">
              <div className="relative mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-champagne-gold/25 bg-soft-white shadow-[0_10px_26px_rgba(7,19,31,0.045)]">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-champagne-gold/30 border-t-classic-gold" />

                <span className="absolute text-[6px] text-classic-gold">
                  ✦
                </span>
              </div>

              <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-slate-gray">
                {t("adminTechnologies.loadingTechnologies")}
              </p>
            </div>
          </div>
        ) : technologies.length === 0 ? (
          <div className="relative overflow-hidden rounded-[28px] border border-light-champagne/90 bg-soft-white/85 px-6 py-20 text-center shadow-[0_16px_45px_rgba(7,19,31,0.045)] backdrop-blur-sm">
            <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full border border-champagne-gold/12" />

            <div className="pointer-events-none absolute -bottom-24 -left-20 h-64 w-64 rounded-full border border-champagne-gold/10" />

            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[300px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-soft-cream blur-[90px]" />

            <div className="relative z-10">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-champagne-gold/30 bg-warm-ivory text-[18px] text-classic-gold shadow-[0_10px_24px_rgba(7,19,31,0.045)]">
                ✦
              </div>

              <h2 className="mt-6 font-serif text-[2rem] font-normal tracking-[-0.03em] text-midnight-navy">
                {t("adminTechnologies.noTechnologiesFound")}
              </h2>

              <p className="mx-auto mt-3 max-w-md text-[12px] leading-7 text-slate-gray">
                {t("adminTechnologies.startBuildingDescription")}
              </p>

              <Link
                to="/admin/technologies/new"
                className="group mt-7 inline-flex min-h-[50px] items-center justify-center gap-4 rounded-[13px] bg-midnight-navy px-7 text-[9px] font-semibold uppercase tracking-[0.12em] text-soft-white shadow-[0_12px_28px_rgba(18,38,58,0.15)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-rich-navy"
              >
                <span className="text-[17px] leading-none text-champagne-gold">
                  +
                </span>

                {t("adminTechnologies.addTechnology")}
              </Link>
            </div>
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-[28px] border border-light-champagne/90 bg-soft-white/85 shadow-[0_18px_55px_rgba(7,19,31,0.055)] backdrop-blur-sm">
            <div className="pointer-events-none absolute -right-28 -top-28 h-64 w-64 rounded-full bg-soft-cream blur-[80px]" />

            <div className="relative flex flex-col gap-5 border-b border-light-champagne/80 px-6 py-6 sm:flex-row sm:items-center sm:justify-between lg:px-8">
              <div>
                <div className="flex items-center gap-3">
                  <span className="h-px w-7 bg-classic-gold/60" />

                  <span className="text-[8px] font-semibold uppercase tracking-[0.3em] text-antique-gold">
                    {t("adminTechnologies.collectionSystem")}
                  </span>

                  <span className="text-[7px] text-classic-gold">✦</span>
                </div>

                <h2 className="mt-2.5 font-serif text-[1.55rem] font-normal tracking-[-0.025em] text-midnight-navy">
                  {t("adminTechnologies.availableTechnologies")}
                </h2>
              </div>

              <div className="inline-flex w-fit items-center gap-3 rounded-full border border-light-champagne bg-warm-ivory/75 px-4 py-2.5 shadow-[0_5px_16px_rgba(7,19,31,0.025)]">
                <span className="font-serif text-[1.25rem] italic leading-none text-midnight-navy">
                  {technologies.length}
                </span>

                <span className="text-[7px] font-semibold uppercase tracking-[0.17em] text-steel-gray">
                  {t("adminTechnologies.technologies")}
                </span>
              </div>
            </div>

            <div className="relative border-b border-light-champagne/80 bg-soft-white/45 px-6 py-5 lg:px-8">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full max-w-2xl">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <svg
                      className="h-4 w-4 text-antique-gold"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    >
                      <circle cx="11" cy="11" r="7" />
                      <path d="m20 20-3.5-3.5" />
                    </svg>
                  </div>

                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder={t(
                      "adminTechnologies.searchPlaceholder",
                    )}
                    className="h-12 w-full rounded-[14px] border border-light-champagne bg-warm-ivory/60 pl-11 pr-4 text-[10px] text-midnight-navy outline-none transition-all duration-300 placeholder:text-steel-gray focus:border-champagne-gold focus:bg-soft-white focus:ring-2 focus:ring-champagne-gold/10"
                  />
                </div>

                {searchTerm.trim() && (
                  <span className="text-[8px] font-semibold uppercase tracking-[0.12em] text-slate-gray">
                    {filteredTechnologies.length}{" "}
                    {t("adminTechnologies.searchResults")}
                  </span>
                )}
              </div>
            </div>

            {searchTerm.trim() && filteredTechnologies.length === 0 ? (
              <div className="relative z-10 px-6 py-16 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-champagne-gold/25 bg-warm-ivory text-[17px] text-classic-gold">
                  ✦
                </div>

                <h2 className="mt-6 font-serif text-[2rem] font-normal text-midnight-navy">
                  {t("adminTechnologies.noMatchingTechnologies")}
                </h2>

                <p className="mx-auto mt-3 max-w-md text-[11px] leading-6 text-slate-gray">
                  {t(
                    "adminTechnologies.noMatchingTechnologiesDescription",
                  )}
                </p>
              </div>
            ) : (
              <div className="relative overflow-x-auto">
                <table className="w-full min-w-[680px]">
                  <thead>
                    <tr className="border-b border-light-champagne/80 bg-warm-ivory/55">
                      <th className="px-7 py-4.5 text-left text-[7px] font-semibold uppercase tracking-[0.2em] text-steel-gray">
                        {t("adminTechnologies.technology")}
                      </th>

                      <th className="px-7 py-4.5 text-left text-[7px] font-semibold uppercase tracking-[0.2em] text-steel-gray">
                        {t("adminTechnologies.code")}
                      </th>

                      <th className="px-7 py-4.5 text-right text-[7px] font-semibold uppercase tracking-[0.2em] text-steel-gray">
                        {t("adminTechnologies.actions")}
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredTechnologies.map((technology, index) => (
                      <tr
                        key={technology._id}
                        className="group border-b border-light-champagne/65 transition-all duration-200 last:border-0 hover:bg-warm-ivory/55"
                      >
                        <td className="px-7 py-5">
                          <div className="flex items-center gap-4">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-champagne-gold/25 bg-soft-cream text-[10px] text-classic-gold transition-all duration-300 group-hover:border-champagne-gold/55 group-hover:bg-soft-white group-hover:shadow-[0_7px_18px_rgba(7,19,31,0.04)]">
                              ✦
                            </div>

                            <div>
                              <p className="text-[12px] font-semibold text-midnight-navy">
                                {technology.name}
                              </p>

                              <p className="mt-1 text-[8px] uppercase tracking-[0.1em] text-steel-gray">
                                {t("adminTechnologies.technologyNumber", {
                                  number: String(index + 1).padStart(2, "0"),
                                })}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-7 py-5">
                          <span className="inline-flex rounded-full border border-champagne-gold/25 bg-warm-ivory/80 px-4 py-2 font-mono text-[9px] font-semibold tracking-[0.12em] text-antique-gold">
                            {technology.code}
                          </span>
                        </td>

                        <td className="px-7 py-5">
                          <div className="flex items-center justify-end gap-2.5">
                            <Link
                              to={`/admin/technologies/${technology._id}/edit`}
                              className="inline-flex min-h-[38px] items-center justify-center rounded-full border border-light-champagne bg-soft-white px-4 text-[8px] font-semibold uppercase tracking-[0.12em] text-slate-gray transition-all duration-300 hover:border-champagne-gold hover:bg-warm-ivory hover:text-midnight-navy"
                            >
                              {t("adminTechnologies.edit")}
                            </Link>

                            {isSuperAdmin && (
                              <button
                                onClick={() => handleDelete(technology._id)}
                                className="inline-flex min-h-[38px] items-center justify-center rounded-full border border-antique-gold/20 bg-transparent px-4 text-[8px] font-semibold uppercase tracking-[0.12em] text-antique-gold transition-all duration-300 hover:border-antique-gold/40 hover:bg-soft-cream hover:text-midnight-navy"
                              >
                                {t("adminTechnologies.delete")}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
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
        )}
      </main>
    </div>
  );
};

export default AdminTechnologiesPage;
