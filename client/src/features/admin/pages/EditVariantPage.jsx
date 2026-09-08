import { useEffect, useState } from "react";

import { Link, useNavigate, useParams } from "react-router-dom";

import { useTranslation } from "react-i18next";

import {
  getVariant,
  updateVariant,
  uploadImage,
} from "../services/productApi";

const normalizeLocalizedField = (value) => {
  if (value && typeof value === "object" && !Array.isArray(value)) {
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

const EditVariantPage = () => {
  const { id } = useParams();

  const navigate = useNavigate();

  const { t } = useTranslation();

  const [activeLanguage, setActiveLanguage] = useState("en");

  const [image, setImage] = useState(null);

  const [preview, setPreview] = useState("");

  const [isLoading, setIsLoading] = useState(true);

  const [isSaving, setIsSaving] = useState(false);

  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    sku: "",

    name: {
      en: "",
      ar: "",
    },

    color: {
      en: "",
      ar: "",
    },

    size: {
      en: "",
      ar: "",
    },

    material: {
      en: "",
      ar: "",
    },

    finish: {
      en: "",
      ar: "",
    },

    price: "",

    compareAtPrice: "",

    stock: "",

    image: "",

    isActive: true,
  });

  useEffect(() => {
    loadVariant();
  }, [id]);

  const loadVariant = async () => {
    try {
      const response = await getVariant(id);

      const variant = response.data.variant;

      setFormData({
        sku: variant.sku || "",

        name: normalizeLocalizedField(variant.name),

        color: normalizeLocalizedField(variant.color),

        size: normalizeLocalizedField(variant.size),

        material: normalizeLocalizedField(variant.material),

        finish: normalizeLocalizedField(variant.finish),

        price: variant.price ?? "",

        compareAtPrice: variant.compareAtPrice ?? "",

        stock: variant.stock ?? "",

        image: variant.image || "",

        isActive: variant.isActive ?? true,
      });

      if (variant.image) {
        if (
          variant.image.startsWith("http://") ||
          variant.image.startsWith("https://") ||
          variant.image.startsWith("data:") ||
          variant.image.startsWith("blob:")
        ) {
          setPreview(variant.image);
        } else {
          setPreview(`http://localhost:5000${variant.image}`);
        }
      }
    } catch (error) {
      console.log(error);

      setError(
        error?.response?.data?.message ||
          t("editVariant.failedToLoadVariant"),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((previous) => ({
      ...previous,

      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleLocalizedChange = (field, value) => {
    setFormData((previous) => ({
      ...previous,

      [field]: {
        ...previous[field],

        [activeLanguage]: value,
      },
    }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];

    if (!file) return;

    setImage(file);

    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!formData.name.en.trim() || !formData.name.ar.trim()) {
      setError(
        t("editVariant.variantNameRequired"),
      );

      setActiveLanguage(
        !formData.name.en.trim() ? "en" : "ar",
      );

      return;
    }

    setIsSaving(true);

    try {
      let imageUrl = formData.image;

      if (image) {
        const form = new FormData();

        form.append("image", image);

        const upload = await uploadImage(form);

        imageUrl = upload.image;
      }

      await updateVariant(id, {
        sku: formData.sku.trim(),

        name: {
          en: formData.name.en.trim(),
          ar: formData.name.ar.trim(),
        },

        color: {
          en: formData.color.en.trim(),
          ar: formData.color.ar.trim(),
        },

        size: {
          en: formData.size.en.trim(),
          ar: formData.size.ar.trim(),
        },

        material: {
          en: formData.material.en.trim(),
          ar: formData.material.ar.trim(),
        },

        finish: {
          en: formData.finish.en.trim(),
          ar: formData.finish.ar.trim(),
        },

        price: Number(formData.price),

        compareAtPrice:
          formData.compareAtPrice === ""
            ? null
            : Number(formData.compareAtPrice),

        stock: Number(formData.stock),

        image: imageUrl,

        isActive: formData.isActive,
      });

      navigate(-1);
    } catch (error) {
      console.log(error);

      setError(
        error?.response?.data?.message ||
          t("editVariant.failedToUpdateVariant"),
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-warm-ivory">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-soft-cream blur-[120px]" />

        <div className="relative rounded-[22px] border border-light-champagne/80 bg-soft-white/80 px-10 py-8 shadow-[0_18px_50px_rgba(7,19,31,0.05)] backdrop-blur-sm">
          <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-gray">
            {t("editVariant.loading")}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-warm-ivory text-midnight-navy">
      <div className="pointer-events-none fixed -left-48 top-24 h-[500px] w-[500px] rounded-full bg-champagne-gold/[0.06] blur-[130px]" />

      <div className="pointer-events-none fixed -right-48 bottom-0 h-[500px] w-[500px] rounded-full bg-light-champagne/55 blur-[130px]" />

      <header className="relative border-b border-light-champagne/80 bg-soft-white/65 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1080px] flex-col gap-5 px-6 py-7 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
          <div>
            <h1 className="font-serif text-[2.5rem] font-normal leading-none tracking-[-0.04em] text-midnight-navy sm:text-[3rem]">
              {t("editVariant.editVariant")}
            </h1>

            <p className="mt-3 text-[11px] leading-6 text-slate-gray sm:text-[12px]">
              {t("editVariant.updateVariantInformation")}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Language Toggle */}
            <div className="flex w-fit rounded-full border border-light-champagne bg-soft-white p-1">
              <button
                type="button"
                onClick={() => setActiveLanguage("en")}
                className={`rounded-full px-4 py-2 text-[8px] font-semibold uppercase tracking-[0.12em] transition ${
                  activeLanguage === "en"
                    ? "bg-midnight-navy text-champagne-gold"
                    : "text-steel-gray hover:bg-warm-ivory"
                }`}
              >
                EN
              </button>

              <button
                type="button"
                onClick={() => setActiveLanguage("ar")}
                className={`rounded-full px-4 py-2 text-[8px] font-semibold transition ${
                  activeLanguage === "ar"
                    ? "bg-midnight-navy text-champagne-gold"
                    : "text-steel-gray hover:bg-warm-ivory"
                }`}
              >
                العربية
              </button>
            </div>

            <Link
              to={-1}
              className="inline-flex min-h-[46px] w-fit items-center justify-center rounded-full border border-light-champagne bg-soft-white/85 px-6 text-[8px] font-semibold uppercase tracking-[0.11em] text-slate-gray shadow-[0_7px_18px_rgba(7,19,31,0.035)] transition-all duration-300 hover:-translate-y-0.5 hover:border-champagne-gold hover:bg-warm-ivory hover:text-midnight-navy"
            >
              {t("editVariant.back")}
            </Link>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-[1080px] px-6 py-10 sm:px-8 lg:px-10 lg:py-12">
        <div className="relative overflow-hidden rounded-[28px] border border-light-champagne/90 bg-soft-white/85 p-7 shadow-[0_20px_60px_rgba(7,19,31,0.055)] backdrop-blur-sm sm:p-9">
          <div className="pointer-events-none absolute -right-28 -top-28 h-72 w-72 rounded-full border border-champagne-gold/10" />

          <div className="pointer-events-none absolute -bottom-28 -left-28 h-72 w-72 rounded-full border border-champagne-gold/[0.08]" />

          <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-soft-cream blur-[90px]" />

          {error && (
            <div className="relative mb-7 rounded-[16px] border border-antique-gold/25 bg-soft-cream/85 px-5 py-4 text-[10px] leading-5 text-antique-gold shadow-[0_7px_20px_rgba(7,19,31,0.025)]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="relative space-y-7">
            {/* SKU */}
            <div>
              <label className="mb-2.5 block text-[9px] font-semibold uppercase tracking-[0.14em] text-midnight-navy">
                SKU
              </label>

              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                className="h-[54px] w-full rounded-[14px] border border-light-champagne bg-warm-ivory/60 px-5 text-[12px] text-midnight-navy outline-none transition-all duration-300 hover:border-champagne-gold/55 hover:bg-soft-white focus:border-classic-gold focus:bg-soft-white focus:ring-4 focus:ring-classic-gold/10"
              />
            </div>

            {/* Variant Name */}
            <div>
              <div className="mb-2.5 flex items-center justify-between gap-3">
                <label className="block text-[9px] font-semibold uppercase tracking-[0.14em] text-midnight-navy">
                  {t("editVariant.variantName")}
                </label>

                <span className="rounded-full bg-warm-ivory px-3 py-1 text-[7px] font-semibold uppercase tracking-[0.1em] text-slate-gray">
                  {activeLanguage === "en"
                    ? t("editVariant.english")
                    : "العربية"}
                </span>
              </div>

              <input
                type="text"
                value={formData.name[activeLanguage]}
                onChange={(event) =>
                  handleLocalizedChange(
                    "name",
                    event.target.value,
                  )
                }
                dir={activeLanguage === "ar" ? "rtl" : "ltr"}
                placeholder={
                  activeLanguage === "en"
                    ? t("editVariant.enterVariantNameEnglish")
                    : t("editVariant.enterVariantNameArabic")
                }
                required
                className="h-[54px] w-full rounded-[14px] border border-light-champagne bg-warm-ivory/60 px-5 text-[12px] text-midnight-navy outline-none transition-all duration-300 hover:border-champagne-gold/55 hover:bg-soft-white focus:border-classic-gold focus:bg-soft-white focus:ring-4 focus:ring-classic-gold/10"
              />
            </div>

            {/* Color + Size */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="mb-2.5 block text-[9px] font-semibold uppercase tracking-[0.14em] text-midnight-navy">
                  {t("editVariant.color")}
                </label>

                <input
                  type="text"
                  value={formData.color[activeLanguage]}
                  onChange={(event) =>
                    handleLocalizedChange(
                      "color",
                      event.target.value,
                    )
                  }
                  dir={activeLanguage === "ar" ? "rtl" : "ltr"}
                  placeholder={
                    activeLanguage === "en"
                      ? t("editVariant.enterColor")
                      : t("editVariant.enterColorArabic")
                  }
                  className="h-[54px] w-full rounded-[14px] border border-light-champagne bg-warm-ivory/60 px-5 text-[12px] text-midnight-navy outline-none transition-all duration-300 hover:border-champagne-gold/55 hover:bg-soft-white focus:border-classic-gold focus:bg-soft-white focus:ring-4 focus:ring-classic-gold/10"
                />
              </div>

              <div>
                <label className="mb-2.5 block text-[9px] font-semibold uppercase tracking-[0.14em] text-midnight-navy">
                  {t("editVariant.size")}
                </label>

                <input
                  type="text"
                  value={formData.size[activeLanguage]}
                  onChange={(event) =>
                    handleLocalizedChange(
                      "size",
                      event.target.value,
                    )
                  }
                  dir={activeLanguage === "ar" ? "rtl" : "ltr"}
                  placeholder={
                    activeLanguage === "en"
                      ? t("editVariant.enterSize")
                      : t("editVariant.enterSizeArabic")
                  }
                  className="h-[54px] w-full rounded-[14px] border border-light-champagne bg-warm-ivory/60 px-5 text-[12px] text-midnight-navy outline-none transition-all duration-300 hover:border-champagne-gold/55 hover:bg-soft-white focus:border-classic-gold focus:bg-soft-white focus:ring-4 focus:ring-classic-gold/10"
                />
              </div>
            </div>

            {/* Material + Finish */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="mb-2.5 block text-[9px] font-semibold uppercase tracking-[0.14em] text-midnight-navy">
                  {t("editVariant.material")}
                </label>

                <input
                  type="text"
                  value={formData.material[activeLanguage]}
                  onChange={(event) =>
                    handleLocalizedChange(
                      "material",
                      event.target.value,
                    )
                  }
                  dir={activeLanguage === "ar" ? "rtl" : "ltr"}
                  placeholder={
                    activeLanguage === "en"
                      ? t("editVariant.enterMaterial")
                      : t("editVariant.enterMaterialArabic")
                  }
                  className="h-[54px] w-full rounded-[14px] border border-light-champagne bg-warm-ivory/60 px-5 text-[12px] text-midnight-navy outline-none transition-all duration-300 hover:border-champagne-gold/55 hover:bg-soft-white focus:border-classic-gold focus:bg-soft-white focus:ring-4 focus:ring-classic-gold/10"
                />
              </div>

              <div>
                <label className="mb-2.5 block text-[9px] font-semibold uppercase tracking-[0.14em] text-midnight-navy">
                  {t("editVariant.finish")}
                </label>

                <input
                  type="text"
                  value={formData.finish[activeLanguage]}
                  onChange={(event) =>
                    handleLocalizedChange(
                      "finish",
                      event.target.value,
                    )
                  }
                  dir={activeLanguage === "ar" ? "rtl" : "ltr"}
                  placeholder={
                    activeLanguage === "en"
                      ? t("editVariant.enterFinish")
                      : t("editVariant.enterFinishArabic")
                  }
                  className="h-[54px] w-full rounded-[14px] border border-light-champagne bg-warm-ivory/60 px-5 text-[12px] text-midnight-navy outline-none transition-all duration-300 hover:border-champagne-gold/55 hover:bg-soft-white focus:border-classic-gold focus:bg-soft-white focus:ring-4 focus:ring-classic-gold/10"
                />
              </div>
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div>
                <label className="mb-2.5 block text-[9px] font-semibold uppercase tracking-[0.14em] text-midnight-navy">
                  {t("editVariant.price")}
                </label>

                <input
                  type="number"
                  min="0"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  className="h-[54px] w-full rounded-[14px] border border-light-champagne bg-warm-ivory/60 px-5 text-[12px] text-midnight-navy outline-none transition-all duration-300 hover:border-champagne-gold/55 hover:bg-soft-white focus:border-classic-gold focus:bg-soft-white focus:ring-4 focus:ring-classic-gold/10"
                />
              </div>

              <div>
                <label className="mb-2.5 block text-[9px] font-semibold uppercase tracking-[0.14em] text-midnight-navy">
                  {t("editVariant.comparePrice")}
                </label>

                <input
                  type="number"
                  min="0"
                  name="compareAtPrice"
                  value={formData.compareAtPrice}
                  onChange={handleChange}
                  className="h-[54px] w-full rounded-[14px] border border-light-champagne bg-warm-ivory/60 px-5 text-[12px] text-midnight-navy outline-none transition-all duration-300 hover:border-champagne-gold/55 hover:bg-soft-white focus:border-classic-gold focus:bg-soft-white focus:ring-4 focus:ring-classic-gold/10"
                />
              </div>

              <div>
                <label className="mb-2.5 block text-[9px] font-semibold uppercase tracking-[0.14em] text-midnight-navy">
                  {t("editVariant.stock")}
                </label>

                <input
                  type="number"
                  min="0"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  required
                  className="h-[54px] w-full rounded-[14px] border border-light-champagne bg-warm-ivory/60 px-5 text-[12px] text-midnight-navy outline-none transition-all duration-300 hover:border-champagne-gold/55 hover:bg-soft-white focus:border-classic-gold focus:bg-soft-white focus:ring-4 focus:ring-classic-gold/10"
                />
              </div>
            </div>

            {/* Image */}
            <div>
              <label className="mb-2.5 block text-[9px] font-semibold uppercase tracking-[0.14em] text-midnight-navy">
                {t("editVariant.variantImage")}
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full cursor-pointer rounded-[14px] border border-light-champagne bg-warm-ivory/60 p-3 text-[10px] text-slate-gray transition-all duration-300 file:mr-4 file:cursor-pointer file:rounded-full file:border-0 file:bg-midnight-navy file:px-5 file:py-2.5 file:text-[8px] file:font-semibold file:uppercase file:tracking-[0.1em] file:text-soft-white hover:border-champagne-gold/55 hover:bg-soft-white hover:file:bg-rich-navy"
              />
            </div>

            {preview && (
              <div className="relative overflow-hidden rounded-[18px] border border-light-champagne/90 bg-warm-ivory/55 p-4">
                <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-champagne-gold/[0.06] blur-[50px]" />

                <div className="relative h-48 w-full max-w-[280px] overflow-hidden rounded-[16px] border border-light-champagne bg-soft-cream shadow-[0_8px_22px_rgba(7,19,31,0.04)]">
                  <img
                    src={preview}
                    alt={
                      formData.name.en ||
                      formData.name.ar ||
                      t("editVariant.variant")
                    }
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            )}

            {/* Active */}
            <div className="rounded-[18px] border border-light-champagne/90 bg-warm-ivory/60 p-5">
              <label className="flex cursor-pointer items-center justify-between gap-5">
                <span className="text-[11px] font-semibold text-midnight-navy">
                  {t("editVariant.activeVariant")}
                </span>

                <div className="relative shrink-0">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="peer sr-only"
                  />

                  <div className="h-7 w-12 rounded-full bg-premium-silver transition-colors duration-300 peer-checked:bg-midnight-navy" />

                  <div className="absolute left-1 top-1 h-5 w-5 rounded-full bg-soft-white shadow-[0_2px_8px_rgba(7,19,31,0.18)] transition-transform duration-300 peer-checked:translate-x-5" />
                </div>
              </label>
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse gap-3 border-t border-light-champagne/80 pt-7 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex min-h-[48px] items-center justify-center rounded-[13px] border border-light-champagne bg-soft-white px-7 text-[8px] font-semibold uppercase tracking-[0.11em] text-slate-gray transition-all duration-300 hover:-translate-y-0.5 hover:border-champagne-gold hover:bg-warm-ivory hover:text-midnight-navy"
              >
                {t("editVariant.cancel")}
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex min-h-[48px] items-center justify-center rounded-[13px] bg-midnight-navy px-8 text-[8px] font-semibold uppercase tracking-[0.11em] text-soft-white shadow-[0_11px_26px_rgba(18,38,58,0.14)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-rich-navy hover:shadow-[0_15px_32px_rgba(18,38,58,0.2)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {isSaving
                  ? t("editVariant.updating")
                  : t("editVariant.updateVariant")}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default EditVariantPage;