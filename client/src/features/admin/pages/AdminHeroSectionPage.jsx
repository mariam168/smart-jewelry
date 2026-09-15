
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

const createEmptySlide = () => ({
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

const createEmptyHero = () => ({
  slides: [createEmptySlide()],
  isActive: true,
});

const normalizeSlide = (slide = {}) => {
  const empty = createEmptySlide();

  return {
    ...empty,
    ...slide,
    eyebrow: {
      ...empty.eyebrow,
      ...slide.eyebrow,
    },
    titlePart1: {
      ...empty.titlePart1,
      ...slide.titlePart1,
    },
    titlePart2: {
      ...empty.titlePart2,
      ...slide.titlePart2,
    },
    description: {
      ...empty.description,
      ...slide.description,
    },
    cta: {
      ...empty.cta,
      ...slide.cta,
    },
    imageAlt: {
      ...empty.imageAlt,
      ...slide.imageAlt,
    },
    badge: {
      nfc: {
        ...empty.badge.nfc,
        ...slide.badge?.nfc,
      },
      subtext: {
        ...empty.badge.subtext,
        ...slide.badge?.subtext,
      },
    },
    features: {
      design: {
        title: {
          ...empty.features.design.title,
          ...slide.features?.design?.title,
        },
        desc: {
          ...empty.features.design.desc,
          ...slide.features?.design?.desc,
        },
      },
      memories: {
        title: {
          ...empty.features.memories.title,
          ...slide.features?.memories?.title,
        },
        desc: {
          ...empty.features.memories.desc,
          ...slide.features?.memories?.desc,
        },
      },
      nfc: {
        title: {
          ...empty.features.nfc.title,
          ...slide.features?.nfc?.title,
        },
        desc: {
          ...empty.features.nfc.desc,
          ...slide.features?.nfc?.desc,
        },
      },
    },
    isActive:
      slide.isActive === undefined
        ? true
        : slide.isActive,
  };
};

const AdminHeroSectionPage = () => {
  const { i18n } = useTranslation();

  const isRtl =
    i18n.language === "ar";

  const [form, setForm] = useState(
    createEmptyHero(),
  );

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [uploadingImage, setUploadingImage] =
    useState(false);

  const [selectedImages, setSelectedImages] =
    useState({});

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  useEffect(() => {
    const loadHero = async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await getAdminHero();

        if (
          response?.success &&
          response.data
        ) {
          const slides =
            Array.isArray(
              response.data.slides,
            ) &&
            response.data.slides.length > 0
              ? response.data.slides.map(
                  normalizeSlide,
                )
              : [
                  createEmptySlide(),
                ];

          setForm({
            slides,
            isActive:
              response.data.isActive !== false,
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

  const updateSlide = (
    slideIndex,
    section,
    language,
    value,
  ) => {
    setForm((current) => ({
      ...current,
      slides: current.slides.map(
        (slide, index) =>
          index === slideIndex
            ? {
                ...slide,
                [section]: {
                  ...slide[section],
                  [language]: value,
                },
              }
            : slide,
      ),
    }));
  };

  const updateSlideField = (
    slideIndex,
    field,
    value,
  ) => {
    setForm((current) => ({
      ...current,
      slides: current.slides.map(
        (slide, index) =>
          index === slideIndex
            ? {
                ...slide,
                [field]: value,
              }
            : slide,
      ),
    }));
  };

  const updateBadge = (
    slideIndex,
    section,
    language,
    value,
  ) => {
    setForm((current) => ({
      ...current,
      slides: current.slides.map(
        (slide, index) =>
          index === slideIndex
            ? {
                ...slide,
                badge: {
                  ...slide.badge,
                  [section]: {
                    ...slide.badge[section],
                    [language]: value,
                  },
                },
              }
            : slide,
      ),
    }));
  };

  const updateFeature = (
    slideIndex,
    feature,
    field,
    language,
    value,
  ) => {
    setForm((current) => ({
      ...current,
      slides: current.slides.map(
        (slide, index) =>
          index === slideIndex
            ? {
                ...slide,
                features: {
                  ...slide.features,
                  [feature]: {
                    ...slide.features[feature],
                    [field]: {
                      ...slide.features[feature][field],
                      [language]: value,
                    },
                  },
                },
              }
            : slide,
      ),
    }));
  };

  const addSlide = () => {
    setForm((current) => ({
      ...current,
      slides: [
        ...current.slides,
        createEmptySlide(),
      ],
    }));
  };

  const removeSlide = (slideIndex) => {
    setForm((current) => {
      if (current.slides.length <= 1) {
        return current;
      }

      return {
        ...current,
        slides: current.slides.filter(
          (_, index) =>
            index !== slideIndex,
        ),
      };
    });

    setSelectedImages((current) => {
      const next = {};

      Object.entries(current).forEach(
        ([key, value]) => {
          const index = Number(key);

          if (index < slideIndex) {
            next[index] = value;
          }

          if (index > slideIndex) {
            next[index - 1] = value;
          }
        },
      );

      return next;
    });
  };

  const getBackendUrl = () => {
    const apiUrl =
      import.meta.env.VITE_API_URL;

    const backendUrl =
      import.meta.env.VITE_BACKEND_URL;

    if (backendUrl) {
      return backendUrl.replace(
        /\/$/,
        "",
      );
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

    return `${getBackendUrl()}/${image.replace(
      /^\/+/,
      "",
    )}`;
  };

  const handleImageChange = async (
    event,
    slideIndex,
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    setSelectedImages((current) => ({
      ...current,
      [slideIndex]: file,
    }));

    setMessage("");
    setError("");

    try {
      setUploadingImage(true);

      const formData =
        new FormData();

      formData.append(
        "image",
        file,
      );

      const apiUrl =
        import.meta.env.VITE_API_URL ||
        `${getBackendUrl()}/api`;

      const uploadUrl =
        `${apiUrl.replace(
          /\/$/,
          "",
        )}/upload`;

      const response =
        await fetch(
          uploadUrl,
          {
            method: "POST",
            credentials: "include",
            body: formData,
          },
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data?.success
      ) {
        throw new Error(
          data?.message ||
            (isRtl
              ? "فشل رفع الصورة"
              : "Failed to upload image"),
        );
      }

      updateSlideField(
        slideIndex,
        "image",
        data.image,
      );

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

  const handleSubmit = async (
    event,
  ) => {
    event.preventDefault();

    try {
      setSaving(true);
      setMessage("");
      setError("");

      const payload = {
        ...form,
        slides: form.slides.map(
          normalizeSlide,
        ),
      };

      const response =
        await updateAdminHero(
          payload,
        );

      if (response?.success) {
        setForm({
          slides:
            response.data?.slides?.map(
              normalizeSlide,
            ) || [],
          isActive:
            response.data?.isActive !==
            false,
        });

        setSelectedImages({});

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
    slideIndex,
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
              value={
                form.slides[
                  slideIndex
                ]?.[section]?.en ||
                ""
              }
              onChange={(event) =>
                updateSlide(
                  slideIndex,
                  section,
                  "en",
                  event.target.value,
                )
              }
              className={textareaClass}
            />
          ) : (
            <input
              value={
                form.slides[
                  slideIndex
                ]?.[section]?.en ||
                ""
              }
              onChange={(event) =>
                updateSlide(
                  slideIndex,
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
              value={
                form.slides[
                  slideIndex
                ]?.[section]?.ar ||
                ""
              }
              onChange={(event) =>
                updateSlide(
                  slideIndex,
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
              value={
                form.slides[
                  slideIndex
                ]?.[section]?.ar ||
                ""
              }
              onChange={(event) =>
                updateSlide(
                  slideIndex,
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
    slideIndex,
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
                form.slides[
                  slideIndex
                ]?.features?.[
                  feature
                ]?.title?.en || ""
              }
              onChange={(event) =>
                updateFeature(
                  slideIndex,
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
                form.slides[
                  slideIndex
                ]?.features?.[
                  feature
                ]?.title?.ar || ""
              }
              onChange={(event) =>
                updateFeature(
                  slideIndex,
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
                form.slides[
                  slideIndex
                ]?.features?.[
                  feature
                ]?.desc?.en || ""
              }
              onChange={(event) =>
                updateFeature(
                  slideIndex,
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
                form.slides[
                  slideIndex
                ]?.features?.[
                  feature
                ]?.desc?.ar || ""
              }
              onChange={(event) =>
                updateFeature(
                  slideIndex,
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
            Hero Slider
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-7 text-midnight-navy/55">
            Manage multiple hero slides with separate images and content for English and Arabic.
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
          className="space-y-8"
        >
          {form.slides.map(
            (slide, slideIndex) => (
              <div
                key={
                  slide._id ||
                  `slide-${slideIndex}`
                }
                className="overflow-hidden rounded-3xl border border-light-champagne/70 bg-warm-ivory shadow-[0_20px_60px_rgba(18,38,58,0.05)]"
              >
                <div className="flex flex-col gap-4 border-b border-light-champagne/70 bg-soft-cream px-6 py-5 sm:flex-row sm:items-center sm:justify-between lg:px-8">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-classic-gold">
                      Slide {slideIndex + 1}
                    </p>

                    <h2 className="mt-1 font-serif text-2xl font-normal text-midnight-navy">
                      Hero Slide
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      removeSlide(
                        slideIndex,
                      )
                    }
                    disabled={
                      form.slides.length <=
                      1
                    }
                    className="inline-flex min-h-[42px] items-center justify-center rounded-xl border border-red-200 bg-white px-5 text-xs font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Remove Slide
                  </button>
                </div>

                <div className="space-y-6 p-6 lg:p-8">
                  <div className="rounded-2xl border border-light-champagne/60 bg-soft-white p-5">
                    <div className="mb-5">
                      <h3 className="font-serif text-xl font-normal text-midnight-navy">
                        Hero Image
                      </h3>

                      <p className="mt-1 text-xs text-midnight-navy/50">
                        Choose the image for this slide.
                      </p>
                    </div>

                    <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-classic-gold/50 bg-warm-ivory px-6 py-8 text-center transition hover:border-classic-gold hover:bg-light-champagne/20">
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
                          : "Choose Slide Image"}
                      </span>

                      <span className="mt-1 text-xs text-midnight-navy/50">
                        JPG, PNG or WEBP
                      </span>

                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(
                          event,
                        ) =>
                          handleImageChange(
                            event,
                            slideIndex,
                          )
                        }
                        disabled={
                          uploadingImage
                        }
                        className="hidden"
                      />
                    </label>

                    {selectedImages[
                      slideIndex
                    ] && (
                      <div className="mt-4 rounded-xl border border-light-champagne bg-white px-4 py-3">
                        <p className="text-xs font-semibold text-midnight-navy">
                          {
                            selectedImages[
                              slideIndex
                            ].name
                          }
                        </p>

                        <p className="mt-1 text-[11px] text-midnight-navy/50">
                          {(
                            selectedImages[
                              slideIndex
                            ].size /
                            1024 /
                            1024
                          ).toFixed(
                            2,
                          )}{" "}
                          MB
                        </p>
                      </div>
                    )}

                    {slide.image && (
                      <div className="mt-5 overflow-hidden rounded-2xl border border-light-champagne/70 bg-midnight-navy">
                        <img
                          src={getImageUrl(
                            slide.image,
                          )}
                          alt="Hero preview"
                          className="h-[280px] w-full object-cover"
                        />
                      </div>
                    )}
                  </div>

                  <div className="rounded-2xl border border-light-champagne/60 bg-soft-white p-5">
                    <h3 className="mb-5 font-serif text-xl font-normal text-midnight-navy">
                      Main Content
                    </h3>

                    <div className="space-y-4">
                      {localizedField(
                        "Eyebrow",
                        slideIndex,
                        "eyebrow",
                      )}

                      {localizedField(
                        "Title Part 1",
                        slideIndex,
                        "titlePart1",
                      )}

                      {localizedField(
                        "Title Part 2",
                        slideIndex,
                        "titlePart2",
                      )}

                      {localizedField(
                        "Description",
                        slideIndex,
                        "description",
                        "textarea",
                      )}

                      {localizedField(
                        "CTA",
                        slideIndex,
                        "cta",
                      )}

                      {localizedField(
                        "Image Alt",
                        slideIndex,
                        "imageAlt",
                      )}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-light-champagne/60 bg-soft-white p-5">
                    <h3 className="mb-5 font-serif text-xl font-normal text-midnight-navy">
                      NFC Badge
                    </h3>

                    <div className="space-y-4">
                      <div className="rounded-2xl border border-light-champagne/60 bg-warm-ivory p-5">
                        <h4 className="mb-4 text-sm font-semibold text-midnight-navy">
                          NFC Text
                        </h4>

                        <div className="grid gap-4 lg:grid-cols-2">
                          <input
                            value={
                              slide.badge
                                ?.nfc
                                ?.en ||
                              ""
                            }
                            onChange={(
                              event,
                            ) =>
                              updateBadge(
                                slideIndex,
                                "nfc",
                                "en",
                                event
                                  .target
                                  .value,
                              )
                            }
                            placeholder="English"
                            className={inputClass}
                          />

                          <input
                            dir="rtl"
                            value={
                              slide.badge
                                ?.nfc
                                ?.ar ||
                              ""
                            }
                            onChange={(
                              event,
                            ) =>
                              updateBadge(
                                slideIndex,
                                "nfc",
                                "ar",
                                event
                                  .target
                                  .value,
                              )
                            }
                            placeholder="العربية"
                            className={inputClass}
                          />
                        </div>
                      </div>

                      <div className="rounded-2xl border border-light-champagne/60 bg-warm-ivory p-5">
                        <h4 className="mb-4 text-sm font-semibold text-midnight-navy">
                          Badge Subtext
                        </h4>

                        <div className="grid gap-4 lg:grid-cols-2">
                          <input
                            value={
                              slide.badge
                                ?.subtext
                                ?.en ||
                              ""
                            }
                            onChange={(
                              event,
                            ) =>
                              updateBadge(
                                slideIndex,
                                "subtext",
                                "en",
                                event
                                  .target
                                  .value,
                              )
                            }
                            placeholder="English"
                            className={inputClass}
                          />

                          <input
                            dir="rtl"
                            value={
                              slide.badge
                                ?.subtext
                                ?.ar ||
                              ""
                            }
                            onChange={(
                              event,
                            ) =>
                              updateBadge(
                                slideIndex,
                                "subtext",
                                "ar",
                                event
                                  .target
                                  .value,
                              )
                            }
                            placeholder="العربية"
                            className={inputClass}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-light-champagne/60 bg-soft-white p-5">
                    <h3 className="mb-5 font-serif text-xl font-normal text-midnight-navy">
                      Features
                    </h3>

                    <div className="space-y-4">
                      {featureField(
                        slideIndex,
                        "design",
                        "Design Feature",
                      )}

                      {featureField(
                        slideIndex,
                        "memories",
                        "Memories Feature",
                      )}

                      {featureField(
                        slideIndex,
                        "nfc",
                        "NFC Feature",
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ),
          )}

          <button
            type="button"
            onClick={addSlide}
            className="flex w-full items-center justify-center gap-3 rounded-2xl border border-dashed border-classic-gold/50 bg-warm-ivory px-6 py-5 text-sm font-semibold text-midnight-navy transition hover:border-classic-gold hover:bg-light-champagne/20"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-midnight-navy text-lg text-soft-white">
              +
            </span>

            Add New Hero Slide
          </button>

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
