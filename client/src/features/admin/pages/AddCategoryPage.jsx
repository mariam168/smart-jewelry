import { useEffect, useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import { createCategory, uploadImage } from "../services/categoryApi";

import { useTranslation } from "react-i18next";

const AddCategoryPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    nameEn: "",
    nameAr: "",
    descriptionEn: "",
    descriptionAr: "",
  });

  const [image, setImage] = useState(null);

  const [preview, setPreview] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    setError("");
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError(
        t("addCategory.validImageFile"),
      );

      event.target.value = "";

      return;
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      setError(
        t("addCategory.imageSizeLimit"),
      );

      event.target.value = "";

      return;
    }

    setError("");

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setImage(file);

    const imagePreview = URL.createObjectURL(file);

    setPreview(imagePreview);
  };

  const handleRemoveImage = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setImage(null);
    setPreview("");
  };

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const generateSlug = (text) => {
    return text
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "")
      .replace(/--+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    const nameEn = formData.nameEn.trim();
    const nameAr = formData.nameAr.trim();

    if (!nameEn) {
      setError(
        t("addCategory.englishNameRequired"),
      );

      return;
    }

    if (!nameAr) {
      setError(
        t("addCategory.arabicNameRequired"),
      );

      return;
    }

    const slug = generateSlug(nameEn);

    if (!slug) {
      setError(
        t("addCategory.validEnglishName"),
      );

      return;
    }

    setIsLoading(true);

    try {
      let imageUrl = "";

      if (image) {
        const imageFormData = new FormData();

        imageFormData.append("image", image);

        const uploadResponse = await uploadImage(imageFormData);

        imageUrl =
          uploadResponse?.image ||
          uploadResponse?.data?.image ||
          uploadResponse?.imageUrl ||
          uploadResponse?.data?.imageUrl ||
          uploadResponse?.url ||
          uploadResponse?.data?.url ||
          uploadResponse?.path ||
          uploadResponse?.data?.path ||
          "";

        if (!imageUrl) {
          throw new Error(
            t("addCategory.imageUrlNotReturned"),
          );
        }
      }

      await createCategory({
        name: {
          en: nameEn,
          ar: nameAr,
        },

        slug,

        description: {
          en: formData.descriptionEn.trim(),
          ar: formData.descriptionAr.trim(),
        },

        image: imageUrl,
      });

      navigate("/admin/categories");
    } catch (error) {
      console.error("Create category error:", error);

      setError(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          t("addCategory.failedToCreateCategory"),
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-warm-ivory text-midnight-navy">
      <div className="pointer-events-none fixed -right-52 top-16 h-[520px] w-[520px] rounded-full bg-champagne-gold/[0.06] blur-[130px]" />

      <div className="pointer-events-none fixed -left-44 bottom-0 h-[460px] w-[460px] rounded-full bg-light-champagne/55 blur-[120px]" />

      <header className="relative border-b border-light-champagne/80 bg-soft-white/65 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1080px] flex-col gap-6 px-6 py-7 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <span className="h-px w-8 bg-classic-gold/60" />

              <div className="text-[8px] font-semibold uppercase tracking-[0.25em] text-antique-gold">
                {t("addCategory.categoryManagement")}
              </div>
            </div>

            <h1 className="font-serif text-[2.5rem] font-normal leading-none tracking-[-0.04em] text-midnight-navy sm:text-[3rem]">
              {t("addCategory.addCategory")}
            </h1>

            <p className="mt-3 text-[11px] leading-6 text-slate-gray sm:text-[12px]">
              {t("addCategory.createNewProductCategory")}
            </p>
          </div>

          <Link
            to="/admin/categories"
            className="group inline-flex min-h-[46px] w-fit items-center justify-center gap-3 rounded-full border border-champagne-gold/30 bg-soft-white/85 px-5 text-[8px] font-semibold uppercase tracking-[0.11em] text-slate-gray shadow-[0_7px_18px_rgba(7,19,31,0.035)] transition-all duration-300 hover:-translate-y-0.5 hover:border-champagne-gold hover:bg-warm-ivory hover:text-midnight-navy"
          >
            <span className="text-[14px] text-classic-gold transition-transform duration-300 group-hover:-translate-x-1">
              ←
            </span>

            {t("addCategory.back")}
          </Link>
        </div>
      </header>

      <main className="relative mx-auto max-w-[1080px] px-6 py-10 sm:px-8 lg:px-10 lg:py-12">
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-[16px] border border-antique-gold/25 bg-soft-cream/85 p-4 text-[10px] leading-5 text-antique-gold shadow-[0_7px_20px_rgba(7,19,31,0.03)]">
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-midnight-navy font-semibold text-champagne-gold">
              !
            </div>

            <div>
              <p className="font-semibold text-midnight-navy">
                {t("addCategory.somethingWentWrong")}
              </p>

              <p className="mt-1">{error}</p>
            </div>
          </div>
        )}

        <div className="relative overflow-hidden rounded-[28px] border border-light-champagne/90 bg-soft-white/85 shadow-[0_20px_60px_rgba(7,19,31,0.055)] backdrop-blur-sm">
          <div className="relative border-b border-light-champagne/80 bg-warm-ivory/50 px-7 py-6 sm:px-9">
            <h2 className="font-serif text-[1.5rem] font-normal tracking-[-0.02em] text-midnight-navy">
              {t("addCategory.categoryInformation")}
            </h2>

            <p className="mt-2 text-[10px] leading-5 text-slate-gray">
              {t("addCategory.addInformationBothLanguages")}
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="relative space-y-8 p-7 sm:p-9"
          >
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2.5 block text-[9px] font-semibold uppercase tracking-[0.14em] text-midnight-navy">
                  {t("addCategory.categoryNameEnglish")}
                  <span className="ml-1 text-antique-gold">*</span>
                </label>

                <input
                  type="text"
                  name="nameEn"
                  value={formData.nameEn}
                  onChange={handleChange}
                  placeholder={t(
                    "addCategory.enterEnglishCategoryName",
                  )}
                  required
                  disabled={isLoading}
                  className="h-[54px] w-full rounded-[14px] border border-light-champagne bg-warm-ivory/60 px-5 text-[12px] text-midnight-navy outline-none transition-all duration-300 placeholder:text-steel-gray/65 hover:border-champagne-gold/55 hover:bg-soft-white focus:border-classic-gold focus:bg-soft-white focus:ring-4 focus:ring-classic-gold/10 disabled:cursor-not-allowed disabled:bg-silver-mist/60"
                />
              </div>

              <div>
                <label className="mb-2.5 block text-[9px] font-semibold uppercase tracking-[0.14em] text-midnight-navy">
                  {t("addCategory.categoryNameArabic")}
                  <span className="ml-1 text-antique-gold">*</span>
                </label>

                <input
                  type="text"
                  name="nameAr"
                  value={formData.nameAr}
                  onChange={handleChange}
                  placeholder={t(
                    "addCategory.enterArabicCategoryName",
                  )}
                  dir="rtl"
                  required
                  disabled={isLoading}
                  className="h-[54px] w-full rounded-[14px] border border-light-champagne bg-warm-ivory/60 px-5 text-[12px] text-midnight-navy outline-none transition-all duration-300 placeholder:text-steel-gray/65 hover:border-champagne-gold/55 hover:bg-soft-white focus:border-classic-gold focus:bg-soft-white focus:ring-4 focus:ring-classic-gold/10 disabled:cursor-not-allowed disabled:bg-silver-mist/60"
                />
              </div>
            </div>

            <div>
              <label className="mb-2.5 block text-[9px] font-semibold uppercase tracking-[0.14em] text-midnight-navy">
                {t("addCategory.slug")}
              </label>

              <div className="rounded-[14px] border border-light-champagne bg-soft-cream/65 px-5 py-4 font-mono text-[10px] tracking-[0.05em] text-slate-gray">
                {generateSlug(formData.nameEn) ||
                  t("addCategory.categorySlug")}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2.5 block text-[9px] font-semibold uppercase tracking-[0.14em] text-midnight-navy">
                  {t("addCategory.descriptionEnglish")}
                </label>

                <textarea
                  rows={5}
                  name="descriptionEn"
                  value={formData.descriptionEn}
                  onChange={handleChange}
                  placeholder={t(
                    "addCategory.writeEnglishDescription",
                  )}
                  disabled={isLoading}
                  className="w-full resize-none rounded-[14px] border border-light-champagne bg-warm-ivory/60 px-5 py-4 text-[12px] leading-6 text-midnight-navy outline-none transition-all duration-300 placeholder:text-steel-gray/65 hover:border-champagne-gold/55 hover:bg-soft-white focus:border-classic-gold focus:bg-soft-white focus:ring-4 focus:ring-classic-gold/10"
                />
              </div>

              <div>
                <label className="mb-2.5 block text-[9px] font-semibold uppercase tracking-[0.14em] text-midnight-navy">
                  {t("addCategory.descriptionArabic")}
                </label>

                <textarea
                  rows={5}
                  name="descriptionAr"
                  value={formData.descriptionAr}
                  onChange={handleChange}
                  placeholder={t(
                    "addCategory.writeArabicDescription",
                  )}
                  dir="rtl"
                  disabled={isLoading}
                  className="w-full resize-none rounded-[14px] border border-light-champagne bg-warm-ivory/60 px-5 py-4 text-[12px] leading-6 text-midnight-navy outline-none transition-all duration-300 placeholder:text-steel-gray/65 hover:border-champagne-gold/55 hover:bg-soft-white focus:border-classic-gold focus:bg-soft-white focus:ring-4 focus:ring-classic-gold/10"
                />
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[20px] border border-light-champagne/90 bg-warm-ivory/55 p-6">
              <div className="relative mb-5">
                <h3 className="font-serif text-[1.25rem] font-normal text-midnight-navy">
                  {t("addCategory.categoryImage")}
                </h3>

                <p className="mt-1.5 text-[10px] leading-5 text-slate-gray">
                  {t("addCategory.uploadCategoryImage")}
                </p>
              </div>

              {!preview ? (
                <label className="group relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[18px] border border-dashed border-champagne-gold/35 bg-soft-white/80 px-6 py-12 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-[17px] border border-champagne-gold/20 bg-soft-cream text-3xl text-classic-gold">
                    +
                  </div>

                  <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-midnight-navy">
                    {t("addCategory.clickToUploadImage")}
                  </span>

                  <span className="mt-2 text-[9px] text-slate-gray">
                    PNG, JPG, JPEG or WEBP
                  </span>

                  <span className="mt-1 text-[9px] text-steel-gray">
                    {t("addCategory.maximumSize")}
                  </span>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={isLoading}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="rounded-[18px] border border-light-champagne bg-soft-white/90 p-4">
                  <div className="relative overflow-hidden rounded-[15px] border border-light-champagne/70 bg-soft-cream">
                    <img
                      src={preview}
                      alt={t("addCategory.categoryPreview")}
                      className="mx-auto h-72 w-full object-contain p-3"
                    />

                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      disabled={isLoading}
                      className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-light-champagne bg-soft-white text-antique-gold"
                    >
                      ×
                    </button>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-semibold">
                        {image?.name}
                      </p>

                      <p className="mt-1 text-[9px] text-steel-gray">
                        {image
                          ? `${(image.size / 1024 / 1024).toFixed(2)} MB`
                          : ""}
                      </p>
                    </div>

                    <label className="cursor-pointer rounded-full border border-light-champagne px-4 py-2 text-[8px]">
                      {t("addCategory.changeImage")}

                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-light-champagne/80 pt-7 sm:flex-row sm:justify-end">
              <Link
                to="/admin/categories"
                className="inline-flex min-h-[48px] items-center justify-center rounded-[13px] border border-light-champagne bg-soft-white px-7 text-[8px] font-semibold uppercase"
              >
                {t("addCategory.cancel")}
              </Link>

              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex min-h-[48px] items-center justify-center rounded-[13px] bg-midnight-navy px-7 text-[8px] font-semibold uppercase text-soft-white disabled:opacity-50"
              >
                {isLoading
                  ? t("addCategory.creating")
                  : t("addCategory.createCategory")}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AddCategoryPage;