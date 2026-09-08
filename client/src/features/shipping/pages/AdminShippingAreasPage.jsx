import {
  useEffect,
  useState,
} from "react";

import { useTranslation } from "react-i18next";

import {
  createShippingArea,
  deleteShippingArea,
  getAdminShippingAreas,
  updateShippingArea,
} from "../services/shippingApi";

const normalizeLocalizedField = (
  value,
) => {
  if (
    value &&
    typeof value === "object" &&
    !Array.isArray(value)
  ) {
    return {
      en: value.en || "",
      ar: value.ar || "",
    };
  }

  const fallback = value || "";

  return {
    en: fallback,
    ar: fallback,
  };
};

const getLocalizedText = (
  value,
  language = "en",
) => {
  if (
    value &&
    typeof value === "object" &&
    !Array.isArray(value)
  ) {
    return (
      value[language] ||
      value.en ||
      value.ar ||
      ""
    );
  }

  return value || "";
};

const AdminShippingAreasPage = () => {
  const { t } = useTranslation();

  const [
    areas,
    setAreas,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    editingId,
    setEditingId,
  ] = useState(null);

  const [
    activeLanguage,
    setActiveLanguage,
  ] = useState("en");

  const [
    form,
    setForm,
  ] = useState({
    name: {
      en: "",
      ar: "",
    },
    shippingFee: "",
    isActive: true,
  });

  const loadAreas =
    async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await getAdminShippingAreas();

        setAreas(
          response?.data?.areas ||
            [],
        );
      } catch (error) {
        setError(
          error?.response?.data
            ?.message ||
            t(
              "adminShippingAreas.failedToLoadShippingAreas",
            ),
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadAreas();
  }, []);

  const resetForm = () => {
    setEditingId(null);

    setForm({
      name: {
        en: "",
        ar: "",
      },
      shippingFee: "",
      isActive: true,
    });

    setActiveLanguage("en");
  };

  const handleChange =
    (event) => {
      const {
        name,
        value,
        type,
        checked,
      } =
        event.target;

      setForm(
        (previous) => ({
          ...previous,

          [name]:
            type ===
            "checkbox"
              ? checked
              : value,
        }),
      );
    };

  const handleNameChange =
    (event) => {
      const {
        value,
      } = event.target;

      setForm(
        (previous) => ({
          ...previous,

          name: {
            ...previous.name,

            [activeLanguage]:
              value,
          },
        }),
      );
    };

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      const englishName =
        form.name.en.trim();

      const arabicName =
        form.name.ar.trim();

      if (!englishName) {
        setError(
          t(
            "adminShippingAreas.englishNameRequired",
          ),
        );

        setActiveLanguage("en");

        return;
      }

      if (!arabicName) {
        setError(
          t(
            "adminShippingAreas.arabicNameRequired",
          ),
        );

        setActiveLanguage("ar");

        return;
      }

      if (
        form.shippingFee ===
          "" ||
        Number(
          form.shippingFee,
        ) < 0
      ) {
        setError(
          t(
            "adminShippingAreas.validShippingFee",
          ),
        );

        return;
      }

      try {
        setSaving(true);
        setError("");

        const payload = {
          name: {
            en: englishName,
            ar: arabicName,
          },

          shippingFee:
            Number(
              form.shippingFee,
            ),

          isActive:
            form.isActive,
        };

        if (editingId) {
          await updateShippingArea(
            editingId,
            payload,
          );
        } else {
          await createShippingArea(
            payload,
          );
        }

        resetForm();

        await loadAreas();
      } catch (error) {
        setError(
          error?.response?.data
            ?.message ||
            t(
              "adminShippingAreas.failedToSaveShippingArea",
            ),
        );
      } finally {
        setSaving(false);
      }
    };

  const startEdit = (
    area,
  ) => {
    setEditingId(
      area._id,
    );

    setForm({
      name:
        normalizeLocalizedField(
          area.name,
        ),

      shippingFee:
        area.shippingFee ??
        "",

      isActive:
        area.isActive !==
        false,
    });

    setActiveLanguage("en");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const toggleArea =
    async (
      area,
    ) => {
      try {
        setError("");

        await updateShippingArea(
          area._id,
          {
            isActive:
              !area.isActive,
          },
        );

        await loadAreas();
      } catch (error) {
        setError(
          error?.response?.data
            ?.message ||
            t(
              "adminShippingAreas.failedToUpdateArea",
            ),
        );
      }
    };

  const removeArea =
    async (
      area,
    ) => {
      const areaName =
        getLocalizedText(
          area.name,
          activeLanguage,
        );

      const confirmed =
        window.confirm(
          `${t(
            "adminShippingAreas.delete",
          )} ${areaName}?`,
        );

      if (!confirmed) {
        return;
      }

      try {
        setError("");

        await deleteShippingArea(
          area._id,
        );

        if (
          editingId ===
          area._id
        ) {
          resetForm();
        }

        await loadAreas();
      } catch (error) {
        setError(
          error?.response?.data
            ?.message ||
            t(
              "adminShippingAreas.failedToDeleteShippingArea",
            ),
        );
      }
    };

  return (
    <main className="min-h-screen bg-warm-ivory text-rich-navy">
      <header className="border-b border-light-champagne bg-soft-white">
        <div className="mx-auto max-w-6xl px-5 py-8 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="h-px w-9 bg-classic-gold" />

            <p className="text-[9px] font-semibold uppercase tracking-[0.32em] text-antique-gold">
              {t(
                "adminShippingAreas.administration",
              )}
            </p>
          </div>

          <h1 className="mt-3 font-serif text-5xl font-normal tracking-[-0.045em]">
            {t(
              "adminShippingAreas.shippingAreas",
            )}
          </h1>

          <p className="mt-3 text-[13px] leading-6 text-slate-gray">
            {t(
              "adminShippingAreas.headerDescription",
            )}
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-8 lg:px-8">
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-[12px] text-red-700">
            {error}
          </div>
        )}

        <section className="rounded-[26px] border border-light-champagne bg-soft-white shadow-[0_15px_50px_rgba(7,19,31,0.04)]">
          <div className="border-b border-light-champagne px-6 py-5">
            <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-antique-gold">
              {editingId
                ? t(
                    "adminShippingAreas.editLocation",
                  )
                : t(
                    "adminShippingAreas.newLocation",
                  )}
            </p>

            <h2 className="mt-1 font-serif text-2xl">
              {editingId
                ? t(
                    "adminShippingAreas.updateShippingArea",
                  )
                : t(
                    "adminShippingAreas.addShippingArea",
                  )}
            </h2>
          </div>

          <form
            onSubmit={
              handleSubmit
            }
            className="grid gap-5 p-6 md:grid-cols-[1fr_220px_170px]"
          >
            <label>
              <div className="mb-2 flex items-center justify-between">
                <span className="block text-[9px] font-semibold uppercase tracking-[0.18em] text-steel-gray">
                  {t(
                    "adminShippingAreas.place",
                  )}
                </span>

                <div className="flex overflow-hidden rounded-full border border-light-champagne bg-warm-ivory">
                  <button
                    type="button"
                    onClick={() =>
                      setActiveLanguage(
                        "en",
                      )
                    }
                    className={`px-3 py-1.5 text-[8px] font-semibold uppercase tracking-[0.1em] transition ${
                      activeLanguage ===
                      "en"
                        ? "bg-deep-navy text-white"
                        : "text-slate-gray hover:bg-white"
                    }`}
                  >
                    EN
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setActiveLanguage(
                        "ar",
                      )
                    }
                    className={`px-3 py-1.5 text-[8px] font-semibold transition ${
                      activeLanguage ===
                      "ar"
                        ? "bg-deep-navy text-white"
                        : "text-slate-gray hover:bg-white"
                    }`}
                  >
                    العربية
                  </button>
                </div>
              </div>

              <input
                type="text"
                value={
                  form.name[
                    activeLanguage
                  ]
                }
                onChange={
                  handleNameChange
                }
                dir={
                  activeLanguage ===
                  "ar"
                    ? "rtl"
                    : "ltr"
                }
                placeholder={
                  activeLanguage ===
                  "ar"
                    ? "القاهرة الجديدة"
                    : "New Cairo"
                }
                className="h-12 w-full rounded-xl border border-light-champagne bg-white px-4 text-[12px] outline-none transition focus:border-classic-gold focus:ring-4 focus:ring-classic-gold/10"
              />
            </label>

            <label>
              <span className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.18em] text-steel-gray">
                {t(
                  "adminShippingAreas.shippingFee",
                )}
              </span>

              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  name="shippingFee"
                  value={
                    form.shippingFee
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="80"
                  className="h-12 w-full rounded-xl border border-light-champagne bg-white px-4 pr-14 text-[12px] outline-none transition focus:border-classic-gold focus:ring-4 focus:ring-classic-gold/10"
                />

                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-semibold text-steel-gray">
                  EGP
                </span>
              </div>
            </label>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={
                  saving
                }
                className="h-12 w-full rounded-xl bg-deep-navy px-5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-midnight-navy disabled:opacity-50"
              >
                {saving
                  ? t(
                      "adminShippingAreas.saving",
                    )
                  : editingId
                    ? t(
                        "adminShippingAreas.saveChanges",
                      )
                    : t(
                        "adminShippingAreas.addPlace",
                      )}
              </button>
            </div>

            <div className="md:col-span-3">
              <label className="inline-flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={
                    form.isActive
                  }
                  onChange={
                    handleChange
                  }
                  className="h-4 w-4 accent-[#12263A]"
                />

                <span className="text-[11px] text-slate-gray">
                  {t(
                    "adminShippingAreas.availableForCustomers",
                  )}
                </span>
              </label>
            </div>

            {editingId && (
              <div className="md:col-span-3">
                <button
                  type="button"
                  onClick={
                    resetForm
                  }
                  className="text-[10px] font-semibold text-slate-gray underline"
                >
                  {t(
                    "adminShippingAreas.cancelEditing",
                  )}
                </button>
              </div>
            )}
          </form>
        </section>

        <section className="mt-7 overflow-hidden rounded-[26px] border border-light-champagne bg-soft-white">
          <div className="flex items-center justify-between border-b border-light-champagne px-6 py-5">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-antique-gold">
                {t(
                  "adminShippingAreas.delivery",
                )}
              </p>

              <h2 className="mt-1 font-serif text-2xl">
                {t(
                  "adminShippingAreas.shippingPrices",
                )}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex overflow-hidden rounded-full border border-light-champagne bg-warm-ivory">
                <button
                  type="button"
                  onClick={() =>
                    setActiveLanguage(
                      "en",
                    )
                  }
                  className={`px-3 py-1.5 text-[8px] font-semibold uppercase tracking-[0.1em] transition ${
                    activeLanguage ===
                    "en"
                      ? "bg-deep-navy text-white"
                      : "text-slate-gray hover:bg-white"
                  }`}
                >
                  EN
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setActiveLanguage(
                      "ar",
                    )
                  }
                  className={`px-3 py-1.5 text-[8px] font-semibold transition ${
                    activeLanguage ===
                    "ar"
                      ? "bg-deep-navy text-white"
                      : "text-slate-gray hover:bg-white"
                  }`}
                >
                  العربية
                </button>
              </div>

              <div className="rounded-full border border-light-champagne bg-warm-ivory px-4 py-2">
                <span className="text-[9px] font-semibold text-slate-gray">
                  {areas.length}{" "}
                  {t(
                    "adminShippingAreas.places",
                  )}
                </span>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-[220px] items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-light-champagne border-t-classic-gold" />
            </div>
          ) : areas.length ===
            0 ? (
            <div className="px-6 py-20 text-center">
              <p className="font-serif text-2xl text-rich-navy">
                {t(
                  "adminShippingAreas.noShippingPlacesYet",
                )}
              </p>

              <p className="mt-2 text-[11px] text-steel-gray">
                {t(
                  "adminShippingAreas.addFirstDeliveryLocation",
                )}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-light-champagne">
              {areas.map(
                (area) => (
                  <div
                    key={
                      area._id
                    }
                    className="flex flex-col gap-5 px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full border border-classic-gold/20 bg-soft-cream text-classic-gold">
                        ✦
                      </div>

                      <div>
                        <p
                          dir={
                            activeLanguage ===
                            "ar"
                              ? "rtl"
                              : "ltr"
                          }
                          className="text-[13px] font-semibold text-rich-navy"
                        >
                          {getLocalizedText(
                            area.name,
                            activeLanguage,
                          )}
                        </p>

                        <div className="mt-1 flex items-center gap-2">
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              area.isActive
                                ? "bg-emerald-500"
                                : "bg-steel-gray"
                            }`}
                          />

                          <span className="text-[9px] text-steel-gray">
                            {area.isActive
                              ? t(
                                  "adminShippingAreas.available",
                                )
                              : t(
                                  "adminShippingAreas.disabled",
                                )}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <div className="mr-3 text-right">
                        <p className="font-serif text-[1.6rem] text-rich-navy">
                          {Number(
                            area.shippingFee ||
                              0,
                          ).toLocaleString(
                            "en-EG",
                          )}
                        </p>

                        <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-steel-gray">
                          {t(
                            "adminShippingAreas.egpShipping",
                          )}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          toggleArea(
                            area,
                          )
                        }
                        className="rounded-xl border border-light-champagne px-4 py-2.5 text-[9px] font-semibold text-slate-gray transition hover:bg-warm-ivory"
                      >
                        {area.isActive
                          ? t(
                              "adminShippingAreas.disable",
                            )
                          : t(
                              "adminShippingAreas.enable",
                            )}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          startEdit(
                            area,
                          )
                        }
                        className="rounded-xl border border-light-champagne px-4 py-2.5 text-[9px] font-semibold text-rich-navy transition hover:border-classic-gold"
                      >
                        {t(
                          "adminShippingAreas.edit",
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          removeArea(
                            area,
                          )
                        }
                        className="rounded-xl border border-red-200 px-4 py-2.5 text-[9px] font-semibold text-red-600 transition hover:bg-red-50"
                      >
                        {t(
                          "adminShippingAreas.delete",
                        )}
                      </button>
                    </div>
                  </div>
                ),
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default AdminShippingAreasPage;