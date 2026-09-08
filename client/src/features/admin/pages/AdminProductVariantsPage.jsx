import { useEffect, useState } from "react";

import { Link, useParams } from "react-router-dom";

import { useTranslation } from "react-i18next";

import {
  getProduct,
  getProductVariants,
  deleteVariant,
} from "../services/productApi";

const AdminProductVariantsPage = () => {
  const { id } = useParams();

  const { t } = useTranslation();

  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);

  const [activeLanguage, setActiveLanguage] = useState("en");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [deletingId, setDeletingId] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [productResponse, variantResponse] = await Promise.all([
        getProduct(id),
        getProductVariants(id),
      ]);

      const loadedProduct =
        productResponse?.data?.product || productResponse?.product || null;

      const loadedVariants =
        variantResponse?.data?.variants || variantResponse?.variants || [];

      setProduct(loadedProduct);

      setVariants(Array.isArray(loadedVariants) ? loadedVariants : []);
    } catch (error) {
      console.error(error);

      setError(
        error?.response?.data?.message ||
          error?.message ||
          t("adminProductVariants.failedToLoadVariants"),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const handleDelete = async (variantId) => {
    const confirmed = window.confirm(
      t("adminProductVariants.deleteConfirmation"),
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(variantId);
      setError("");

      await deleteVariant(variantId);

      setVariants((previous) =>
        previous.filter((variant) => variant._id !== variantId),
      );
    } catch (error) {
      console.error(error);

      setError(
        error?.response?.data?.message ||
          error?.message ||
          t("adminProductVariants.failedToDeleteVariant"),
      );
    } finally {
      setDeletingId("");
    }
  };

  /*
   * Supports both:
   *
   * New localized data:
   * {
   *   en: "Gold",
   *   ar: "ذهبي"
   * }
   *
   * Old data:
   * "Gold"
   */
  const getLocalizedText = (value, language = "en") => {
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

  const getImageUrl = (image) => {
    if (!image) {
      return "/placeholder.png";
    }

    if (
      image.startsWith("http://") ||
      image.startsWith("https://") ||
      image.startsWith("data:")
    ) {
      return image;
    }

    if (image.startsWith("/")) {
      return `http://localhost:5000${image}`;
    }

    return `http://localhost:5000/${image}`;
  };

  if (loading) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-warm-ivory text-midnight-navy">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-soft-cream blur-[120px]" />

        <div className="flex min-h-screen items-center justify-center px-6">
          <div className="relative text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-champagne-gold/25 bg-midnight-navy text-[18px] text-champagne-gold shadow-[0_12px_30px_rgba(18,38,58,0.15)]">
              ✦
            </div>

            <p className="mt-5 text-[11px] font-semibold text-slate-gray">
              {t("adminProductVariants.loadingVariants")}
            </p>

            <p className="mt-1.5 text-[10px] text-steel-gray">
              {t("adminProductVariants.preparingProductVariants")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-warm-ivory text-midnight-navy">
      <div className="pointer-events-none fixed -left-48 top-28 h-[520px] w-[520px] rounded-full bg-champagne-gold/[0.06] blur-[135px]" />

      <div className="pointer-events-none fixed -right-48 bottom-0 h-[500px] w-[500px] rounded-full bg-light-champagne/55 blur-[130px]" />

      <header className="sticky top-0 z-40 border-b border-light-champagne/80 bg-soft-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-5 px-6 py-5 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-champagne-gold/25 bg-midnight-navy text-[11px] text-champagne-gold shadow-[0_7px_18px_rgba(18,38,58,0.12)]">
              ✦
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-[8px] font-semibold uppercase tracking-[0.28em] text-antique-gold">
                  {t("adminProductVariants.collection")}
                </span>

                <span className="h-px w-7 bg-classic-gold/55" />

                <span className="text-[8px] font-semibold uppercase tracking-[0.18em] text-steel-gray">
                  {t("adminProductVariants.variants")}
                </span>
              </div>

              <h1 className="mt-1 font-serif text-[1.75rem] font-normal tracking-[-0.03em] text-midnight-navy">
                {t("adminProductVariants.productVariants")}
              </h1>

              {product?.name && (
                <p
                  className="mt-1 truncate text-[11px] text-slate-gray"
                  dir={activeLanguage === "ar" ? "rtl" : "ltr"}
                >
                  {getLocalizedText(
                    product.name,
                    activeLanguage,
                  )}
                </p>
              )}
            </div>
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
                {t("adminProductVariants.arabic")}
              </button>
            </div>

            <Link
              to="/admin/products"
              className="group inline-flex min-h-[46px] items-center justify-center gap-3 rounded-full border border-light-champagne bg-soft-white px-5 text-[8px] font-semibold uppercase tracking-[0.1em] text-slate-gray shadow-[0_6px_18px_rgba(7,19,31,0.035)] transition-all duration-300 hover:-translate-y-0.5 hover:border-champagne-gold hover:bg-warm-ivory hover:text-midnight-navy"
            >
              <span className="text-[13px] text-classic-gold transition-transform duration-300 group-hover:-translate-x-1">
                ←
              </span>

              {t("adminProductVariants.backToProducts")}
            </Link>

            <Link
              to={`/admin/products/${id}/variants/new`}
              className="group inline-flex min-h-[46px] items-center justify-center gap-3 rounded-[13px] bg-midnight-navy px-6 text-[8px] font-semibold uppercase tracking-[0.1em] text-soft-white shadow-[0_10px_24px_rgba(18,38,58,0.14)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-rich-navy hover:shadow-[0_14px_30px_rgba(18,38,58,0.2)]"
            >
              <span className="text-[14px] text-champagne-gold">
                +
              </span>

              {t("adminProductVariants.addVariant")}
            </Link>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-[1500px] px-6 py-10 sm:px-8 lg:px-10 lg:py-12">
        {error && (
          <div className="relative mb-8 flex items-center justify-between gap-4 rounded-[16px] border border-antique-gold/25 bg-soft-cream/85 px-5 py-4 text-[11px] text-antique-gold shadow-[0_7px_20px_rgba(7,19,31,0.025)]">
            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
              className="ml-4 shrink-0 font-semibold text-antique-gold transition-colors hover:text-midnight-navy"
            >
              ×
            </button>
          </div>
        )}

        <section className="relative mb-8 overflow-hidden rounded-[28px] bg-gradient-to-br from-midnight-navy via-rich-navy to-luxury-black text-soft-white shadow-[0_22px_60px_rgba(7,19,31,0.16)]">
          <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full border border-champagne-gold/10" />

          <div className="pointer-events-none absolute -bottom-28 -left-20 h-64 w-64 rounded-full border border-champagne-gold/[0.08]" />

          <div className="pointer-events-none absolute right-[18%] top-1/2 h-48 w-48 -translate-y-1/2 rounded-full bg-champagne-gold/[0.05] blur-[70px]" />

          <div className="relative px-7 py-8 sm:px-9 sm:py-10">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="mb-5 flex items-center gap-3">
                  <span className="h-px w-8 bg-classic-gold/70" />

                  <span className="text-[8px] font-semibold uppercase tracking-[0.28em] text-champagne-gold">
                    {t("adminProductVariants.productConfiguration")}
                  </span>
                </div>

                <h2 className="font-serif text-[2.3rem] font-normal leading-tight tracking-[-0.035em] sm:text-[2.8rem]">
                  {t("adminProductVariants.manageYour")}
                  <span className="ml-2 italic text-champagne-gold">
                    {t("adminProductVariants.variants")}
                  </span>
                </h2>

                <p className="mt-4 max-w-2xl text-[11px] leading-6 text-premium-silver">
                  {t("adminProductVariants.manageDescription")}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="min-w-[110px] rounded-[18px] border border-soft-white/10 bg-soft-white/[0.05] px-5 py-4 backdrop-blur-sm">
                  <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-premium-silver">
                    {t("adminProductVariants.variants")}
                  </p>

                  <p className="mt-2 font-serif text-[1.75rem] text-soft-white">
                    {variants.length}
                  </p>
                </div>

                <div className="min-w-[110px] rounded-[18px] border border-soft-white/10 bg-soft-white/[0.05] px-5 py-4 backdrop-blur-sm">
                  <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-premium-silver">
                    {t("adminProductVariants.active")}
                  </p>

                  <p className="mt-2 font-serif text-[1.75rem] text-champagne-gold">
                    {
                      variants.filter(
                        (variant) => variant.isActive,
                      ).length
                    }
                  </p>
                </div>

                <div className="col-span-2 min-w-[110px] rounded-[18px] border border-soft-white/10 bg-soft-white/[0.05] px-5 py-4 backdrop-blur-sm sm:col-span-1">
                  <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-premium-silver">
                    {t("adminProductVariants.stock")}
                  </p>

                  <p className="mt-2 font-serif text-[1.75rem] text-soft-white">
                    {variants.reduce(
                      (total, variant) =>
                        total + Number(variant.stock || 0),
                      0,
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {variants.length === 0 ? (
          <section className="relative overflow-hidden rounded-[28px] border border-light-champagne/90 bg-soft-white/85 shadow-[0_18px_55px_rgba(7,19,31,0.05)] backdrop-blur-sm">
            <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full border border-champagne-gold/10" />

            <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full border border-champagne-gold/[0.08]" />

            <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border border-champagne-gold/25 bg-soft-cream text-[20px] text-classic-gold shadow-[0_9px_24px_rgba(7,19,31,0.04)]">
                ✦
              </div>

              <h2 className="mt-7 font-serif text-[2rem] font-normal tracking-[-0.025em] text-midnight-navy">
                {t("adminProductVariants.noVariantsFound")}
              </h2>

              <p className="mt-3 max-w-md text-[11px] leading-6 text-slate-gray">
                {t("adminProductVariants.noVariantsDescription")}
              </p>

              <Link
                to={`/admin/products/${id}/variants/new`}
                className="mt-7 inline-flex min-h-[48px] items-center justify-center gap-3 rounded-[13px] bg-midnight-navy px-7 text-[8px] font-semibold uppercase tracking-[0.1em] text-soft-white shadow-[0_11px_26px_rgba(18,38,58,0.14)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-rich-navy hover:shadow-[0_15px_32px_rgba(18,38,58,0.2)]"
              >
                <span className="text-[12px] text-champagne-gold">
                  +
                </span>

                {t("adminProductVariants.createFirstVariant")}

                <span className="text-[11px] text-champagne-gold">
                  →
                </span>
              </Link>
            </div>
          </section>
        ) : (
          <>
            <section className="relative overflow-hidden rounded-[28px] border border-light-champagne/90 bg-soft-white/85 shadow-[0_18px_55px_rgba(7,19,31,0.055)] backdrop-blur-sm">
              <div className="pointer-events-none absolute -right-28 -top-28 h-72 w-72 rounded-full border border-champagne-gold/[0.08]" />

              <div className="border-b border-light-champagne/80 bg-warm-ivory/50 px-7 py-6 sm:px-9">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-serif text-[12px] text-classic-gold">
                        01
                      </span>

                      <span className="h-px w-8 bg-classic-gold/60" />

                      <span className="text-[8px] font-semibold uppercase tracking-[0.28em] text-steel-gray">
                        {t("adminProductVariants.productVariants")}
                      </span>
                    </div>

                    <h2 className="mt-3 font-serif text-[1.75rem] font-normal tracking-[-0.025em] text-midnight-navy">
                      {t("adminProductVariants.availableVariations")}
                    </h2>

                    <p className="mt-2 text-[10px] leading-5 text-slate-gray">
                      {t("adminProductVariants.reviewDescription")}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="rounded-full border border-light-champagne bg-soft-white px-4 py-2 text-[8px] font-semibold uppercase tracking-[0.08em] text-slate-gray">
                      {variants.length}{" "}
                      {variants.length === 1
                        ? t("adminProductVariants.variant")
                        : t("adminProductVariants.variants")}
                    </div>

                    <Link
                      to={`/admin/products/${id}/variants/new`}
                      className="inline-flex min-h-[36px] items-center gap-2 rounded-full border border-champagne-gold/30 bg-soft-cream px-4 text-[8px] font-semibold uppercase tracking-[0.08em] text-antique-gold transition-all duration-300 hover:-translate-y-0.5 hover:border-champagne-gold hover:bg-warm-ivory hover:text-midnight-navy"
                    >
                      <span>+</span>
                      {t("adminProductVariants.addNew")}
                    </Link>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px]">
                  <thead>
                    <tr className="border-b border-light-champagne/80 bg-warm-ivory/40">
                      <th className="px-6 py-4 text-left text-[8px] font-semibold uppercase tracking-[0.14em] text-steel-gray">
                        {t("adminProductVariants.image")}
                      </th>

                      <th className="px-6 py-4 text-left text-[8px] font-semibold uppercase tracking-[0.14em] text-steel-gray">
                        {t("adminProductVariants.variant")}
                      </th>

                      <th className="px-6 py-4 text-left text-[8px] font-semibold uppercase tracking-[0.14em] text-steel-gray">
                        {t("adminProductVariants.sku")}
                      </th>

                      <th className="px-6 py-4 text-left text-[8px] font-semibold uppercase tracking-[0.14em] text-steel-gray">
                        {t("adminProductVariants.options")}
                      </th>

                      <th className="px-6 py-4 text-left text-[8px] font-semibold uppercase tracking-[0.14em] text-steel-gray">
                        {t("adminProductVariants.price")}
                      </th>

                      <th className="px-6 py-4 text-left text-[8px] font-semibold uppercase tracking-[0.14em] text-steel-gray">
                        {t("adminProductVariants.stock")}
                      </th>

                      <th className="px-6 py-4 text-left text-[8px] font-semibold uppercase tracking-[0.14em] text-steel-gray">
                        {t("adminProductVariants.status")}
                      </th>

                      <th className="px-6 py-4 text-left text-[8px] font-semibold uppercase tracking-[0.14em] text-steel-gray">
                        {t("adminProductVariants.actions")}
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-light-champagne/65">
                    {variants.map((variant) => {
                      const imageUrl = getImageUrl(
                        variant.image,
                      );

                      const isDeleting =
                        deletingId === variant._id;

                      const variantName =
                        getLocalizedText(
                          variant.name,
                          activeLanguage,
                        );

                      const material =
                        getLocalizedText(
                          variant.material,
                          activeLanguage,
                        );

                      const finish =
                        getLocalizedText(
                          variant.finish,
                          activeLanguage,
                        );

                      const color =
                        getLocalizedText(
                          variant.color,
                          activeLanguage,
                        );

                      const size =
                        getLocalizedText(
                          variant.size,
                          activeLanguage,
                        );

                      return (
                        <tr
                          key={variant._id}
                          className="group transition-colors duration-300 hover:bg-warm-ivory/50"
                        >
                          {/* Image */}
                          <td className="px-6 py-5">
                            <div className="relative h-20 w-20 overflow-hidden rounded-[17px] border border-light-champagne bg-soft-cream shadow-[0_7px_20px_rgba(7,19,31,0.035)]">
                              <img
                                src={imageUrl}
                                alt={
                                  variantName ||
                                  variant.sku
                                }
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                onError={(event) => {
                                  event.currentTarget.src =
                                    "/placeholder.png";
                                }}
                              />
                            </div>
                          </td>

                          {/* Variant */}
                          <td className="px-6 py-5">
                            <div
                              dir={
                                activeLanguage === "ar"
                                  ? "rtl"
                                  : "ltr"
                              }
                            >
                              <p className="font-serif text-[1.05rem] font-normal text-midnight-navy">
                                {variantName ||
                                  t(
                                    "adminProductVariants.unnamedVariant",
                                  )}
                              </p>

                              {material && (
                                <p className="mt-1 text-[9px] text-slate-gray">
                                  {material}
                                </p>
                              )}

                              {finish && (
                                <span className="mt-2 inline-flex rounded-full border border-champagne-gold/25 bg-soft-cream px-2.5 py-1 text-[7px] font-semibold tracking-[0.08em] text-antique-gold">
                                  {finish}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* SKU */}
                          <td className="px-6 py-5">
                            <span className="rounded-full border border-light-champagne bg-warm-ivory/75 px-3 py-1.5 font-mono text-[8px] font-semibold uppercase tracking-[0.08em] text-slate-gray">
                              {variant.sku}
                            </span>
                          </td>

                          {/* Options */}
                          <td className="px-6 py-5">
                            <div
                              className={`flex max-w-[230px] flex-wrap gap-2 ${
                                activeLanguage === "ar"
                                  ? "justify-end"
                                  : ""
                              }`}
                              dir={
                                activeLanguage === "ar"
                                  ? "rtl"
                                  : "ltr"
                              }
                            >
                              {color && (
                                <span className="rounded-full border border-light-champagne bg-soft-white px-3 py-1.5 text-[9px] text-slate-gray">
                                  <span className="font-medium">
                                    {t(
                                      "adminProductVariants.color",
                                    )}
                                    :
                                  </span>{" "}
                                  <strong className="font-semibold text-midnight-navy">
                                    {color}
                                  </strong>
                                </span>
                              )}

                              {size && (
                                <span className="rounded-full border border-light-champagne bg-soft-white px-3 py-1.5 text-[9px] text-slate-gray">
                                  <span className="font-medium">
                                    {t(
                                      "adminProductVariants.size",
                                    )}
                                    :
                                  </span>{" "}
                                  <strong className="font-semibold text-midnight-navy">
                                    {size}
                                  </strong>
                                </span>
                              )}

                              {!color && !size && (
                                <span className="text-[9px] text-steel-gray">
                                  {t(
                                    "adminProductVariants.noOptions",
                                  )}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Price */}
                          <td className="px-6 py-5">
                            <div>
                              <p className="text-[11px] font-semibold text-antique-gold">
                                {Number(
                                  variant.price || 0,
                                ).toFixed(2)}{" "}
                                EGP
                              </p>

                              {variant.compareAtPrice !==
                                null &&
                                variant.compareAtPrice !==
                                  undefined &&
                                Number(
                                  variant.compareAtPrice,
                                ) > 0 && (
                                  <p className="mt-1 text-[9px] text-steel-gray line-through">
                                    {Number(
                                      variant.compareAtPrice,
                                    ).toFixed(2)}{" "}
                                    EGP
                                  </p>
                                )}
                            </div>
                          </td>

                          {/* Stock */}
                          <td className="px-6 py-5">
                            <div>
                              <span
                                className={`text-[11px] font-semibold ${
                                  Number(
                                    variant.stock || 0,
                                  ) === 0
                                    ? "text-antique-gold"
                                    : Number(
                                          variant.stock || 0,
                                        ) <= 5
                                      ? "text-classic-gold"
                                      : "text-midnight-navy"
                                }`}
                              >
                                {variant.stock}
                              </span>

                              <p className="mt-1 text-[7px] uppercase tracking-[0.08em] text-steel-gray">
                                {t("adminProductVariants.units")}
                              </p>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="px-6 py-5">
                            <span
                              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[7px] font-semibold uppercase tracking-[0.08em] ${
                                variant.isActive
                                  ? "border-classic-gold/25 bg-soft-cream text-antique-gold"
                                  : "border-light-champagne bg-warm-ivory text-steel-gray"
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  variant.isActive
                                    ? "bg-classic-gold"
                                    : "bg-steel-gray"
                                }`}
                              />

                              {variant.isActive
                                ? t(
                                    "adminProductVariants.active",
                                  )
                                : t(
                                    "adminProductVariants.inactive",
                                  )}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2">
                              <Link
                                to={`/admin/variants/${variant._id}/edit`}
                                className="inline-flex min-h-[36px] items-center justify-center rounded-full border border-light-champagne bg-soft-white px-4 text-[7px] font-semibold uppercase tracking-[0.09em] text-slate-gray transition-all duration-300 hover:-translate-y-0.5 hover:border-champagne-gold hover:bg-warm-ivory hover:text-midnight-navy"
                              >
                                {t(
                                  "adminProductVariants.edit",
                                )}
                              </Link>

                              <button
                                type="button"
                                disabled={isDeleting}
                                onClick={() =>
                                  handleDelete(
                                    variant._id,
                                  )
                                }
                                className="inline-flex min-h-[36px] items-center justify-center rounded-full border border-antique-gold/20 bg-soft-white px-4 text-[7px] font-semibold uppercase tracking-[0.09em] text-antique-gold transition-all duration-300 hover:-translate-y-0.5 hover:border-antique-gold/40 hover:bg-soft-cream hover:text-midnight-navy disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                              >
                                {isDeleting
                                  ? t(
                                      "adminProductVariants.deleting",
                                    )
                                  : t(
                                      "adminProductVariants.delete",
                                    )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Information Cards */}
            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="rounded-[24px] border border-light-champagne/90 bg-soft-white/85 p-6 shadow-[0_14px_40px_rgba(7,19,31,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(7,19,31,0.06)]">
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-champagne-gold/20 bg-soft-cream text-[11px] text-classic-gold">
                  ✦
                </div>

                <h3 className="mt-5 font-serif text-[1.2rem] font-normal text-midnight-navy">
                  {t("adminProductVariants.variantOptions")}
                </h3>

                <p className="mt-2 text-[10px] leading-6 text-slate-gray">
                  {t(
                    "adminProductVariants.variantOptionsDescription",
                  )}
                </p>
              </div>

              <div className="rounded-[24px] border border-light-champagne/90 bg-soft-white/85 p-6 shadow-[0_14px_40px_rgba(7,19,31,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(7,19,31,0.06)]">
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-champagne-gold/20 bg-soft-cream text-[12px] text-classic-gold">
                  ₤
                </div>

                <h3 className="mt-5 font-serif text-[1.2rem] font-normal text-midnight-navy">
                  {t("adminProductVariants.individualPricing")}
                </h3>

                <p className="mt-2 text-[10px] leading-6 text-slate-gray">
                  {t(
                    "adminProductVariants.individualPricingDescription",
                  )}
                </p>
              </div>

              <div className="rounded-[24px] border border-light-champagne/90 bg-soft-white/85 p-6 shadow-[0_14px_40px_rgba(7,19,31,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(7,19,31,0.06)]">
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-champagne-gold/20 bg-soft-cream text-[11px] text-classic-gold">
                  ✓
                </div>

                <h3 className="mt-5 font-serif text-[1.2rem] font-normal text-midnight-navy">
                  {t("adminProductVariants.activeStatus")}
                </h3>

                <p className="mt-2 text-[10px] leading-6 text-slate-gray">
                  {t(
                    "adminProductVariants.activeStatusDescription",
                  )}
                </p>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default AdminProductVariantsPage;