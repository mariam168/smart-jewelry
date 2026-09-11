import { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";

import {
  getAdminHero,
  updateAdminHero,
} from "../../home/services/homeApi";

const emptyLocalized = {
  en: "",
  ar: "",
};

const createEmptyHero = () => ({
  eyebrow: { ...emptyLocalized },
  titlePart1: { ...emptyLocalized },
  titlePart2: { ...emptyLocalized },
  description: { ...emptyLocalized },
  cta: { ...emptyLocalized },
  image: "",
  imageAlt: { ...emptyLocalized },
  badge: {
    nfc: { ...emptyLocalized },
    subtext: { ...emptyLocalized },
  },
  features: {
    design: {
      title: { ...emptyLocalized },
      desc: { ...emptyLocalized },
    },
    memories: {
      title: { ...emptyLocalized },
      desc: { ...emptyLocalized },
    },
    nfc: {
      title: { ...emptyLocalized },
      desc: { ...emptyLocalized },
    },
  },
  isActive: true,
});

const AdminHeroSectionPage = () => {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === "ar";

  const [form, setForm] = useState(
    createEmptyHero(),
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadHero = async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await getAdminHero();

        if (response?.success && response.data) {
          setForm({
            ...createEmptyHero(),
            ...response.data,
            eyebrow: {
              ...emptyLocalized,
              ...response.data.eyebrow,
            },
            titlePart1: {
              ...emptyLocalized,
              ...response.data.titlePart1,
            },
            titlePart2: {
              ...emptyLocalized,
              ...response.data.titlePart2,
            },
            description: {
              ...emptyLocalized,
              ...response.data.description,
            },
            cta: {
              ...emptyLocalized,
              ...response.data.cta,
            },
            imageAlt: {
              ...emptyLocalized,
              ...response.data.imageAlt,
            },
            badge: {
              nfc: {
                ...emptyLocalized,
                ...response.data.badge?.nfc,
              },
              subtext: {
                ...emptyLocalized,
                ...response.data.badge?.subtext,
              },
            },
            features: {
              design: {
                title: {
                  ...emptyLocalized,
                  ...response.data.features?.design?.title,
                },
                desc: {
                  ...emptyLocalized,
                  ...response.data.features?.design?.desc,
                },
              },
              memories: {
                title: {
                  ...emptyLocalized,
                  ...response.data.features?.memories?.title,
                },
                desc: {
                  ...emptyLocalized,
                  ...response.data.features?.memories?.desc,
                },
              },
              nfc: {
                title: {
                  ...emptyLocalized,
                  ...response.data.features?.nfc?.title,
                },
                desc: {
                  ...emptyLocalized,
                  ...response.data.features?.nfc?.desc,
                },
              },
            },
          });
        }
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            "Failed to load hero section",
        );
      } finally {
        setLoading(false);
      }
    };

    loadHero();
  }, []);

  const updateLocalized = (
    section,
    language,
    value,
  ) => {
    setForm((current) => ({
      ...current,
      [section]: {
        ...current[section],
        [language]: value,
      },
    }));
  };

  const updateBadge = (
    section,
    language,
    value,
  ) => {
    setForm((current) => ({
      ...current,
      badge: {
        ...current.badge,
        [section]: {
          ...current.badge[section],
          [language]: value,
        },
      },
    }));
  };

  const updateFeature = (
    feature,
    field,
    language,
    value,
  ) => {
    setForm((current) => ({
      ...current,
      features: {
        ...current.features,
        [feature]: {
          ...current.features[feature],
          [field]: {
            ...current.features[feature][field],
            [language]: value,
          },
        },
      },
    }));
  };

  const getBackendUrl = () => {
    const apiUrl =
      import.meta.env.VITE_API_URL;

    const backendUrl =
      import.meta.env.VITE_BACKEND_URL;

    if (backendUrl) {
      return backendUrl.replace(/\/$/, "");
    }

    if (apiUrl) {
      return apiUrl
        .replace(/\/api\/?$/, "")
        .replace(/\/$/, "");
    }

    return "http://localhost:5000";
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

    return `${getBackendUrl()}/${image.replace(/^\/+/, "")}`;
  };

  const handleImageChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setSelectedImage(file);
    setMessage("");
    setError("");

    try {
      setUploadingImage(true);

      const formData = new FormData();
      formData.append("image", file);

      const apiUrl =
        import.meta.env.VITE_API_URL ||
        `${getBackendUrl()}/api`;

      const uploadUrl =
        `${apiUrl.replace(/\/$/, "")}/upload`;

      const response = await fetch(
        uploadUrl,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        },
      );

      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(
          data?.message ||
            (isRtl
              ? "فشل رفع الصورة"
              : "Failed to upload image"),
        );
      }

      setForm((current) => ({
        ...current,
        image: data.image,
      }));

      setMessage(
        isRtl
          ? "تم رفع الصورة بنجاح"
          : "Image uploaded successfully",
      );
    } catch (err) {
      setError(
        err?.message ||
          (isRtl
            ? "حدث خطأ أثناء رفع الصورة"
            : "Failed to upload image"),
      );
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setMessage("");
      setError("");

      const response =
        await updateAdminHero(form);

      if (response?.success) {
        setForm(response.data);

        setMessage(
          isRtl
            ? "تم حفظ الـ Hero بنجاح"
            : "Hero section saved successfully",
        );
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          (isRtl
            ? "حدث خطأ أثناء الحفظ"
            : "Failed to save hero section"),
      );
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "h-11 w-full rounded-xl border border-midnight-navy/10 bg-white px-4 text-sm text-midnight-navy outline-none transition focus:border-classic-gold focus:ring-2 focus:ring-classic-gold/10";

  const textareaClass =
    "min-h-[110px] w-full resize-y rounded-xl border border-midnight-navy/10 bg-white px-4 py-3 text-sm leading-7 text-midnight-navy outline-none transition focus:border-classic-gold focus:ring-2 focus:ring-classic-gold/10";

  const localizedField = (
    title,
    section,
    type = "input",
  ) => (
    <div className="rounded-2xl border border-light-champagne/60 bg-soft-white p-5">
      <h3 className="mb-4 text-sm font-semibold text-midnight-navy">
        {title}
      </h3>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] text-midnight-navy/50">
            English
          </label>

          {type === "textarea" ? (
            <textarea
              value={form[section]?.en || ""}
              onChange={(event) =>
                updateLocalized(
                  section,
                  "en",
                  event.target.value,
                )
              }
              className={textareaClass}
            />
          ) : (
            <input
              value={form[section]?.en || ""}
              onChange={(event) =>
                updateLocalized(
                  section,
                  "en",
                  event.target.value,
                )
              }
              className={inputClass}
            />
          )}
        </div>

        <div>
          <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] text-midnight-navy/50">
            العربية
          </label>

          {type === "textarea" ? (
            <textarea
              dir="rtl"
              value={form[section]?.ar || ""}
              onChange={(event) =>
                updateLocalized(
                  section,
                  "ar",
                  event.target.value,
                )
              }
              className={textareaClass}
            />
          ) : (
            <input
              dir="rtl"
              value={form[section]?.ar || ""}
              onChange={(event) =>
                updateLocalized(
                  section,
                  "ar",
                  event.target.value,
                )
              }
              className={inputClass}
            />
          )}
        </div>
      </div>
    </div>
  );

  const featureField = (
    feature,
    title,
  ) => (
    <div className="rounded-2xl border border-light-champagne/60 bg-soft-white p-5">
      <h3 className="mb-5 text-sm font-semibold text-midnight-navy">
        {title}
      </h3>

      <div className="grid gap-5">
        <div>
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-midnight-navy/50">
            Title
          </p>

          <div className="grid gap-4 lg:grid-cols-2">
            <input
              value={
                form.features?.[feature]?.title?.en ||
                ""
              }
              onChange={(event) =>
                updateFeature(
                  feature,
                  "title",
                  "en",
                  event.target.value,
                )
              }
              placeholder="English"
              className={inputClass}
            />

            <input
              dir="rtl"
              value={
                form.features?.[feature]?.title?.ar ||
                ""
              }
              onChange={(event) =>
                updateFeature(
                  feature,
                  "title",
                  "ar",
                  event.target.value,
                )
              }
              placeholder="العربية"
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-midnight-navy/50">
            Description
          </p>

          <div className="grid gap-4 lg:grid-cols-2">
            <textarea
              value={
                form.features?.[feature]?.desc?.en ||
                ""
              }
              onChange={(event) =>
                updateFeature(
                  feature,
                  "desc",
                  "en",
                  event.target.value,
                )
              }
              placeholder="English"
              className={textareaClass}
            />

            <textarea
              dir="rtl"
              value={
                form.features?.[feature]?.desc?.ar ||
                ""
              }
              onChange={(event) =>
                updateFeature(
                  feature,
                  "desc",
                  "ar",
                  event.target.value,
                )
              }
              placeholder="العربية"
              className={textareaClass}
            />
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-classic-gold/20 border-t-classic-gold" />
      </div>
    );
  }

  return (
    <section
      dir={isRtl ? "rtl" : "ltr"}
      className="min-h-screen bg-soft-white p-5 text-midnight-navy lg:p-8"
    >
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-8">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.28em] text-classic-gold">
            JEVORYA
          </p>

          <h1 className="font-serif text-4xl font-normal text-midnight-navy">
            Hero Section
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-7 text-midnight-navy/55">
            Manage the main hero content shown on
            the home page in English and Arabic.
          </p>
        </div>

        {message && (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <div className="rounded-3xl border border-light-champagne/70 bg-warm-ivory p-6 lg:p-8">
            <div className="mb-6">
              <h2 className="font-serif text-2xl font-normal">
                Main Content
              </h2>

              <p className="mt-1 text-xs text-midnight-navy/50">
                English and Arabic content
              </p>
            </div>

            <div className="space-y-4">
              {localizedField(
                "Eyebrow",
                "eyebrow",
              )}

              {localizedField(
                "Title Part 1",
                "titlePart1",
              )}

              {localizedField(
                "Title Part 2",
                "titlePart2",
              )}

              {localizedField(
                "Description",
                "description",
                "textarea",
              )}

              {localizedField(
                "CTA",
                "cta",
              )}

              {localizedField(
                "Image Alt",
                "imageAlt",
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-light-champagne/70 bg-warm-ivory p-6 lg:p-8">
            <h2 className="mb-2 font-serif text-2xl font-normal">
              Hero Image
            </h2>

            <p className="mb-5 text-xs text-midnight-navy/50">
              Choose the hero image from your computer.
            </p>

            <div className="rounded-2xl border border-dashed border-classic-gold/50 bg-soft-white p-5">
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-light-champagne bg-warm-ivory px-6 py-8 text-center transition hover:border-classic-gold hover:bg-light-champagne/20">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-midnight-navy text-soft-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 16V4m0 0L8 8m4-4 4 4M5 20h14"
                    />
                  </svg>
                </div>

                <span className="text-sm font-semibold text-midnight-navy">
                  {uploadingImage
                    ? "Uploading..."
                    : "Choose Hero Image"}
                </span>

                <span className="mt-1 text-xs text-midnight-navy/50">
                  JPG, PNG or WEBP
                </span>

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  disabled={uploadingImage}
                  className="hidden"
                />
              </label>

              {selectedImage && (
                <div className="mt-4 rounded-xl border border-light-champagne bg-white px-4 py-3">
                  <p className="text-xs font-semibold text-midnight-navy">
                    {selectedImage.name}
                  </p>

                  <p className="mt-1 text-[11px] text-midnight-navy/50">
                    {(
                      selectedImage.size /
                      1024 /
                      1024
                    ).toFixed(2)}{" "}
                    MB
                  </p>
                </div>
              )}
            </div>

            {form.image && (
              <div className="mt-5 overflow-hidden rounded-2xl border border-light-champagne/70 bg-midnight-navy">
                <img
                  src={getImageUrl(form.image)}
                  alt="Hero preview"
                  className="h-[280px] w-full object-cover"
                />
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-light-champagne/70 bg-warm-ivory p-6 lg:p-8">
            <h2 className="mb-6 font-serif text-2xl font-normal">
              NFC Badge
            </h2>

            <div className="space-y-4">
              <div className="rounded-2xl border border-light-champagne/60 bg-soft-white p-5">
                <h3 className="mb-4 text-sm font-semibold">
                  NFC Text
                </h3>

                <div className="grid gap-4 lg:grid-cols-2">
                  <input
                    value={
                      form.badge?.nfc?.en ||
                      ""
                    }
                    onChange={(event) =>
                      updateBadge(
                        "nfc",
                        "en",
                        event.target.value,
                      )
                    }
                    placeholder="English"
                    className={inputClass}
                  />

                  <input
                    dir="rtl"
                    value={
                      form.badge?.nfc?.ar ||
                      ""
                    }
                    onChange={(event) =>
                      updateBadge(
                        "nfc",
                        "ar",
                        event.target.value,
                      )
                    }
                    placeholder="العربية"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-light-champagne/60 bg-soft-white p-5">
                <h3 className="mb-4 text-sm font-semibold">
                  Badge Subtext
                </h3>

                <div className="grid gap-4 lg:grid-cols-2">
                  <input
                    value={
                      form.badge?.subtext?.en ||
                      ""
                    }
                    onChange={(event) =>
                      updateBadge(
                        "subtext",
                        "en",
                        event.target.value,
                      )
                    }
                    placeholder="English"
                    className={inputClass}
                  />

                  <input
                    dir="rtl"
                    value={
                      form.badge?.subtext?.ar ||
                      ""
                    }
                    onChange={(event) =>
                      updateBadge(
                        "subtext",
                        "ar",
                        event.target.value,
                      )
                    }
                    placeholder="العربية"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-light-champagne/70 bg-warm-ivory p-6 lg:p-8">
            <h2 className="mb-6 font-serif text-2xl font-normal">
              Features
            </h2>

            <div className="space-y-4">
              {featureField(
                "design",
                "Design Feature",
              )}

              {featureField(
                "memories",
                "Memories Feature",
              )}

              {featureField(
                "nfc",
                "NFC Feature",
              )}
            </div>
          </div>

          <div className="sticky bottom-4 z-20 flex justify-end">
            <button
              type="submit"
              disabled={
                saving ||
                uploadingImage
              }
              className="min-w-[190px] rounded-xl bg-midnight-navy px-7 py-3.5 text-xs font-bold uppercase tracking-[0.12em] text-soft-white shadow-xl transition hover:-translate-y-0.5 hover:bg-rich-navy disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default AdminHeroSectionPage;