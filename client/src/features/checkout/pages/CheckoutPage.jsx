
import { useEffect, useMemo, useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import { useTranslation } from "react-i18next";

import { useCart } from "../../../context/CartContext";

import { createOrder } from "../services/orderApi";

import { getShippingAreas } from "../../shipping/services/shippingApi";

const getLocalizedText = (value, language = "en") => {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value[language] || value.en || value.ar || "";
  }

  return value || "";
};

const getBackendOrigin = () => {
  const explicitBackend = import.meta.env.VITE_BACKEND_URL;

  if (explicitBackend) {
    return String(explicitBackend).replace(/\/+$/, "");
  }

  const apiUrl = import.meta.env.VITE_API_URL;

  if (apiUrl && /^https?:\/\//i.test(apiUrl)) {
    return String(apiUrl)
      .replace(/\/api\/?$/i, "")
      .replace(/\/+$/, "");
  }

  if (
    typeof window !== "undefined" &&
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1"
  ) {
    return window.location.origin;
  }

  return "http://localhost:5000";
};

const BACKEND_URL = getBackendOrigin();

const getFilePath = (value) => {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value.trim();
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const path = getFilePath(item);

      if (path) {
        return path;
      }
    }

    return "";
  }

  if (typeof value === "object") {
    return (
      getFilePath(value.imageUrl) ||
      getFilePath(value.url) ||
      getFilePath(value.path) ||
      getFilePath(value.src) ||
      getFilePath(value.image) ||
      getFilePath(value.file) ||
      getFilePath(value.filename) ||
      ""
    );
  }

  return "";
};

const getImageUrl = (value) => {
  let image = getFilePath(value);

  if (!image) {
    return "";
  }

  if (
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("blob:") ||
    image.startsWith("data:")
  ) {
    return image;
  }

  if (image.startsWith("//")) {
    const protocol =
      typeof window !== "undefined" ? window.location.protocol : "https:";

    return `${protocol}${image}`;
  }

  if (image.startsWith("/api/uploads/")) {
    image = image.replace(/^\/api/, "");
  }

  if (image.startsWith("/assets/") || image.startsWith("/images/")) {
    return image;
  }

  return `${BACKEND_URL}${image.startsWith("/") ? "" : "/"}${image}`;
};

const getCartItemImage = (item) => {
  const product = item?.product || {};
  const variant = item?.variant || {};
  const productSnapshot = item?.productSnapshot || {};
  const variantSnapshot = item?.variantSnapshot || {};

  const candidates = [
    item?.image,
    item?.imageUrl,
    item?.productImage,
    item?.productImageUrl,
    item?.primaryImage,
    variant?.image,
    variant?.imageUrl,
    variant?.primaryImage,
    variant?.images?.[0],
    variant?.images,
    product?.primaryImage,
    product?.image,
    product?.imageUrl,
    product?.images?.[0],
    product?.images,
    variantSnapshot?.image,
    variantSnapshot?.imageUrl,
    variantSnapshot?.primaryImage,
    variantSnapshot?.images?.[0],
    variantSnapshot?.images,
    productSnapshot?.primaryImage,
    productSnapshot?.image,
    productSnapshot?.imageUrl,
    productSnapshot?.images?.[0],
    productSnapshot?.images,
  ];

  for (const candidate of candidates) {
    const path = getFilePath(candidate);

    if (path) {
      return path;
    }
  }

  return "";
};

const formatMoney = (value) => {
  return Number(value || 0).toLocaleString("en-EG", {
    maximumFractionDigits: 2,
  });
};

const CheckoutPage = () => {
  const navigate = useNavigate();

  const { i18n, t } = useTranslation();

  const activeLanguage = i18n.language === "ar" ? "ar" : "en";

  const { cart, cartTotal, isLoading: cartLoading, clearCart } = useCart();

  const [shippingAreas, setShippingAreas] = useState([]);

  const [shippingLoading, setShippingLoading] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");

  const [formValues, setFormValues] = useState({
    manufacturingName: "",
    ordererName: "",
    manufacturingNotes: "",
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    shippingAreaId: "",
    country: "Egypt",
    paymentMethod: "cash_on_delivery",
  });

  const items = cart?.items || [];

  const subtotal = Number(cartTotal || 0);

  useEffect(() => {
    const loadShippingAreas = async () => {
      try {
        setShippingLoading(true);

        const response = await getShippingAreas();

        setShippingAreas(
          Array.isArray(response?.data?.areas) ? response.data.areas : [],
        );
      } catch (error) {
        console.error("Load shipping areas error:", error);

        setError(
          error?.response?.data?.message ||
            t("checkout.unableToLoadShippingAreas"),
        );
      } finally {
        setShippingLoading(false);
      }
    };

    loadShippingAreas();
  }, []);

  const selectedShippingArea = useMemo(() => {
    return (
      shippingAreas.find(
        (area) => String(area._id) === String(formValues.shippingAreaId),
      ) || null
    );
  }, [shippingAreas, formValues.shippingAreaId]);

  const shippingCost = selectedShippingArea
    ? Number(selectedShippingArea.shippingFee || 0)
    : 0;

  const total = subtotal + shippingCost;

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormValues((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  const validateForm = () => {
    if (!formValues.manufacturingName.trim()) {
      return t("checkout.manufacturingNameRequired");
    }

    if (formValues.manufacturingName.trim().length > 120) {
      return t("checkout.manufacturingNameMax");
    }

    if (formValues.manufacturingNotes.trim().length > 1000) {
      return t("checkout.manufacturingNotesMax");
    }

    if (!formValues.firstName.trim()) {
      return t("checkout.firstNameRequired");
    }

    if (!formValues.lastName.trim()) {
      return t("checkout.lastNameRequired");
    }

    if (!formValues.phone.trim()) {
      return t("checkout.phoneRequired");
    }

    if (!formValues.address.trim()) {
      return t("checkout.addressRequired");
    }

    if (!formValues.shippingAreaId) {
      return t("checkout.shippingAreaRequired");
    }

    if (!selectedShippingArea) {
      return t("checkout.shippingAreaUnavailable");
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);

      return;
    }

    try {
      setSubmitting(true);

      setError("");

      const response = await createOrder({
        manufacturingName: formValues.manufacturingName.trim(),
         ordererName: formValues.ordererName.trim(),
        manufacturingNotes: formValues.manufacturingNotes.trim(),
        shippingAreaId: formValues.shippingAreaId,
        shippingAddress: {
          firstName: formValues.firstName.trim(),
          lastName: formValues.lastName.trim(),
          phone: formValues.phone.trim(),
          address: formValues.address.trim(),
          city: selectedShippingArea.name,
          country: formValues.country.trim() || "Egypt",
        },
        paymentMethod: formValues.paymentMethod,
      });

      const order = response?.data;

      if (!order?._id) {
        throw new Error(t("checkout.orderCreatedNoId"));
      }

      try {
        await clearCart();
      } catch (cartError) {
        console.error("Cart sync after order error:", cartError);
      }

      navigate(`/order-success/${order._id}`, {
        state: {
          order,
        },
      });
    } catch (error) {
      console.error("Create Order Error:", error);

      setError(
        error?.response?.data?.message ||
          error?.message ||
          t("checkout.unableToCreateOrder"),
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (cartLoading) {
    return (
      <main
        dir={activeLanguage === "ar" ? "rtl" : "ltr"}
        className="relative min-h-screen overflow-hidden bg-warm-ivory"
      >
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-soft-cream blur-[120px]" />

        <div className="flex min-h-screen items-center justify-center">
          <div className="relative flex flex-col items-center text-center">
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-champagne-gold/30 bg-midnight-navy shadow-[0_16px_38px_rgba(18,38,58,0.18)]">
              <span className="absolute h-7 w-7 animate-spin rounded-full border border-champagne-gold/30 border-t-champagne-gold" />

              <span className="text-[8px] text-champagne-gold">✦</span>
            </div>

            <p className="mt-6 text-[9px] font-semibold uppercase tracking-[0.32em] text-slate-gray">
              {t("checkout.loadingCheckout")}
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main
        dir={activeLanguage === "ar" ? "rtl" : "ltr"}
        className="relative min-h-screen overflow-hidden bg-warm-ivory"
      >
        <div className="pointer-events-none absolute -left-40 top-1/2 h-[460px] w-[460px] -translate-y-1/2 rounded-full bg-light-champagne/60 blur-[115px]" />

        <div className="pointer-events-none absolute -right-40 top-0 h-[460px] w-[460px] rounded-full bg-champagne-gold/10 blur-[115px]" />

        <div className="relative mx-auto flex min-h-screen max-w-3xl items-center justify-center px-6 py-20">
          <div className="relative w-full overflow-hidden rounded-[30px] border border-champagne-gold/15 bg-midnight-navy px-8 py-16 text-center shadow-[0_30px_80px_rgba(7,19,31,0.18)] sm:px-12 sm:py-20">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-rich-navy via-midnight-navy to-luxury-black" />

            <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full border border-champagne-gold/15" />

            <div className="pointer-events-none absolute -bottom-28 -left-24 h-64 w-64 rounded-full border border-champagne-gold/10" />

            <div className="relative z-10">
              <div className="mb-7 flex items-center justify-center gap-4">
                <span className="h-px w-10 bg-classic-gold/60" />

                <span className="text-[9px] font-semibold uppercase tracking-[0.35em] text-champagne-gold">
                  {t("checkout.checkout")}
                </span>

                <span className="h-px w-10 bg-classic-gold/60" />
              </div>

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-champagne-gold/25 bg-soft-white/[0.05] text-xl text-champagne-gold">
                ✦
              </div>

              <h1 className="mt-8 font-serif text-[2.7rem] font-normal leading-[1.02] tracking-[-0.035em] text-soft-white sm:text-[3.5rem]">
                {t("checkout.yourCartIs")}

                <span className="mt-1 block italic text-champagne-gold">
                  {t("checkout.stillEmpty")}
                </span>
              </h1>

              <p className="mx-auto mt-5 max-w-md text-[13px] leading-7 text-premium-silver/75">
                {t("checkout.emptyDescription")}
              </p>

              <Link
                to="/shop"
                className="group mt-9 inline-flex min-h-[52px] items-center justify-center gap-8 rounded-[13px] bg-soft-white px-8 text-[9px] font-semibold uppercase tracking-[0.12em] text-midnight-navy"
              >
                {t("checkout.continueShopping")}

                <span className="text-[15px] text-classic-gold">→</span>
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const firstProductId =
    items[0]?.product?._id ||
    items[0]?.product?.id ||
    items[0]?.productId ||
    null;

  return (
    <main
      dir={activeLanguage === "ar" ? "rtl" : "ltr"}
      className="relative min-h-screen overflow-hidden bg-warm-ivory px-4 py-10 text-midnight-navy sm:px-6 lg:px-8 lg:py-14"
    >
      <div className="pointer-events-none fixed -left-48 top-1/3 h-[520px] w-[520px] rounded-full bg-light-champagne/55 blur-[130px]" />

      <div className="pointer-events-none fixed -right-48 top-0 h-[520px] w-[520px] rounded-full bg-champagne-gold/[0.07] blur-[130px]" />

      <div className="relative mx-auto max-w-[1360px]">
        <div className="mb-10 lg:mb-12">
          <Link
            to="/cart"
            className="group inline-flex items-center gap-2.5 text-[8px] font-semibold uppercase tracking-[0.18em] text-slate-gray transition-colors hover:text-antique-gold"
          >
            <span className="text-sm">←</span>

            {t("checkout.backToCart")}
          </Link>

          <div className="mt-6">
            <div className="flex items-center gap-3">
              <span className="h-px w-9 bg-classic-gold/60" />

              <p className="text-[9px] font-semibold uppercase tracking-[0.32em] text-antique-gold">
                {t("checkout.secureCheckout")}
              </p>

              <span className="text-[8px] text-classic-gold">✦</span>
            </div>

            <h1 className="mt-4 font-serif text-[3rem] font-normal leading-[1.15] tracking-[-0.02em] text-midnight-navy sm:text-[4rem] lg:text-[4.6rem]">
              {t("checkout.review")}

              <span className="ml-4 text-navy-soft sm:ml-5">
                {t("checkout.checkout")}
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-[13px] leading-7 text-slate-gray sm:text-[14px]">
              {t("checkout.reviewDescription")}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="relative overflow-hidden rounded-[26px] border border-light-champagne/90 bg-soft-white/85 shadow-[0_12px_38px_rgba(7,19,31,0.045)] backdrop-blur-sm">
            <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-soft-cream blur-[70px]" />

            <SectionHeader
              number="01"
              title={t("checkout.orderDetails")}
              subtitle={t("checkout.everythingSelected")}
              action={
                <Link
                  to="/cart"
                  className="text-[8px] font-semibold uppercase tracking-[0.14em] text-slate-gray transition-colors hover:text-antique-gold"
                >
                  {t("checkout.editCart")}
                </Link>
              }
            />

            <div className="relative p-6 sm:p-8">
              <div className="rounded-[22px] border border-champagne-gold/20 bg-soft-cream/55 p-6 sm:p-7">
                <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
                  <div>
                    <div className="mb-3 flex items-center gap-2.5">
                      <span className="h-px w-7 bg-classic-gold/60" />

                      <p className="text-[7px] font-semibold uppercase tracking-[0.22em] text-steel-gray">
                        {t("checkout.orderDetails")}
                      </p>
                    </div>

                    <h3 className="font-serif text-[1.7rem] font-normal text-midnight-navy">
                      {t("checkout.everythingSelected")}
                    </h3>

                    <p className="mt-2 text-[10px] leading-6 text-slate-gray">
                      {items.length}{" "}
                      {activeLanguage === "ar"
                        ? "منتج في طلبك"
                        : "item(s) in your order"}
                    </p>
                  </div>

                  {firstProductId && (
                    <Link
                      to={`/shop/products/${firstProductId}`}
                      className="group inline-flex min-h-[48px] items-center justify-center gap-5 rounded-[13px] border border-champagne-gold/35 bg-midnight-navy px-6 text-[8px] font-semibold uppercase tracking-[0.15em] text-champagne-gold shadow-[0_10px_25px_rgba(18,38,58,0.12)] transition-all duration-300 hover:-translate-y-0.5 hover:border-champagne-gold hover:bg-rich-navy"
                    >
                      {activeLanguage === "ar"
                        ? "العودة للمنتج"
                        : "Back to product"}

                      <span className="text-[13px] transition-transform duration-300 group-hover:translate-x-1">
                        →
                      </span>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="relative overflow-hidden rounded-[26px] border border-champagne-gold/20 bg-soft-white/90 shadow-[0_12px_38px_rgba(7,19,31,0.045)] backdrop-blur-sm">
            <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-champagne-gold/[0.08] blur-[70px]" />

            <SectionHeader
              number="02"
              title={t("checkout.manufacturingDetails")}
              subtitle={t("checkout.manufacturingSubtitle")}
            />

            <div className="relative p-6 sm:p-8">
              <div className="mb-6 rounded-[18px] border border-champagne-gold/25 bg-soft-cream/70 p-5">
                <div className="flex items-start gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-midnight-navy text-[10px] text-champagne-gold">
                    ✦
                  </span>

                  <div>
                    <p className="text-[10px] font-semibold text-midnight-navy">
                      {t("checkout.manufacturingReference")}
                    </p>

                    <p className="mt-1.5 max-w-2xl text-[10px] leading-6 text-slate-gray">
                      {t("checkout.manufacturingReferenceDescription")}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="manufacturingName"
                  className="mb-2 block text-[8px] font-semibold uppercase tracking-[0.18em] text-midnight-navy"
                >
                  {t("checkout.nameForManufacturing")}

                  <span className="ml-1 text-antique-gold">*</span>
                </label>

                <input
                  id="manufacturingName"
                  type="text"
                  name="manufacturingName"
                  value={formValues.manufacturingName}
                  onChange={handleChange}
                  required
                  maxLength={120}
                  autoComplete="off"
                  placeholder="e.g. Mariam"
                  className="checkout-input"
                />

                <p className="mt-2 text-[8px] leading-5 text-steel-gray">
                  {t("checkout.manufacturingNameHelp")}
                </p>
              </div>
              <div>
  <label
    htmlFor="ordererName"
    className="mb-2 block text-sm font-medium text-[#332a22]"
  >
    {t("checkout.ordererName")}
    <span className="ml-1 text-xs font-normal text-[#7f7265]">
      ({t("common.optional")})
    </span>
  </label>

  <input
    id="ordererName"
    type="text"
    name="ordererName"
    value={formValues.ordererName}
    onChange={handleChange}
    maxLength={120}
    autoComplete="name"
    placeholder={t("checkout.ordererNamePlaceholder")}
    className="checkout-input"
  />

  <p className="mt-2 text-xs leading-5 text-[#7f7265]">
    {t("checkout.ordererNameHelp")}
  </p>
</div>
            </div>
          </section>

          <section className="relative overflow-hidden rounded-[26px] border border-light-champagne/90 bg-soft-white/85 shadow-[0_12px_38px_rgba(7,19,31,0.045)] backdrop-blur-sm">
            <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-soft-cream blur-[70px]" />

            <SectionHeader
              number="03"
              title={t("checkout.shippingInformation")}
              subtitle={t("checkout.shippingSubtitle")}
            />

            <div className="relative px-6 py-6 sm:px-8 sm:py-8">
              {error && (
                <div className="mb-6 rounded-[14px] border border-antique-gold/25 bg-soft-cream px-4 py-3 text-[11px] leading-6 text-antique-gold">
                  {error}
                </div>
              )}

              <div className="grid gap-5 sm:grid-cols-2">
                <CheckoutField
                  label={t("checkout.firstName")}
                  htmlFor="firstName"
                >
                  <input
                    id="firstName"
                    name="firstName"
                    value={formValues.firstName}
                    onChange={handleChange}
                    placeholder={t("checkout.firstNamePlaceholder")}
                    className="checkout-input"
                    autoComplete="given-name"
                  />
                </CheckoutField>

                <CheckoutField
                  label={t("checkout.lastName")}
                  htmlFor="lastName"
                >
                  <input
                    id="lastName"
                    name="lastName"
                    value={formValues.lastName}
                    onChange={handleChange}
                    placeholder={t("checkout.lastNamePlaceholder")}
                    className="checkout-input"
                    autoComplete="family-name"
                  />
                </CheckoutField>

                <div className="sm:col-span-2">
                  <CheckoutField
                    label={t("checkout.phoneNumber")}
                    htmlFor="phone"
                  >
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formValues.phone}
                      onChange={handleChange}
                      placeholder={t("checkout.phonePlaceholder")}
                      className="checkout-input"
                      autoComplete="tel"
                    />
                  </CheckoutField>
                </div>

                <div className="sm:col-span-2">
                  <CheckoutField
                    label={t("checkout.deliveryAddress")}
                    htmlFor="address"
                  >
                    <textarea
                      id="address"
                      name="address"
                      rows={4}
                      value={formValues.address}
                      onChange={handleChange}
                      placeholder={t("checkout.addressPlaceholder")}
                      className="checkout-textarea"
                      autoComplete="street-address"
                    />
                  </CheckoutField>
                </div>

                <CheckoutField
                  label={t("checkout.shippingArea")}
                  htmlFor="shippingAreaId"
                >
                  <select
                    id="shippingAreaId"
                    name="shippingAreaId"
                    value={formValues.shippingAreaId}
                    onChange={handleChange}
                    disabled={shippingLoading}
                    className="checkout-input cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <option value="">
                      {shippingLoading
                        ? t("checkout.loadingShippingAreas")
                        : t("checkout.selectYourArea")}
                    </option>

                    {shippingAreas.map((area) => (
                      <option key={area._id} value={area._id}>
                        {getLocalizedText(area.name, activeLanguage)} —{" "}
                        {formatMoney(area.shippingFee)} EGP
                      </option>
                    ))}
                  </select>
                </CheckoutField>

                <CheckoutField
                  label={t("checkout.country")}
                  htmlFor="country"
                >
                  <input
                    id="country"
                    name="country"
                    value={formValues.country}
                    onChange={handleChange}
                    className="checkout-input"
                    autoComplete="country-name"
                  />
                </CheckoutField>

                {selectedShippingArea && (
                  <div className="sm:col-span-2">
                    <div className="relative overflow-hidden rounded-[18px] border border-champagne-gold/20 bg-soft-cream/80 p-5">
                      <div className="pointer-events-none absolute -right-14 -top-14 h-32 w-32 rounded-full bg-champagne-gold/10 blur-[40px]" />

                      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-midnight-navy text-[10px] text-champagne-gold">
                            ✦
                          </div>

                          <div>
                            <p className="text-[7px] font-semibold uppercase tracking-[0.2em] text-antique-gold">
                              {t("checkout.selectedDeliveryArea")}
                            </p>

                            <p className="mt-1 font-serif text-[1.25rem] text-midnight-navy">
                              {getLocalizedText(
                                selectedShippingArea.name,
                                activeLanguage,
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="sm:text-right">
                          <p className="text-[7px] font-semibold uppercase tracking-[0.18em] text-steel-gray">
                            {t("checkout.shippingFee")}
                          </p>

                          <p className="mt-1 font-serif text-[1.5rem] text-antique-gold">
                            {formatMoney(shippingCost)}{" "}
                            <span className="font-sans text-[8px] font-semibold">
                              EGP
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {!shippingLoading && shippingAreas.length === 0 && (
                  <div className="sm:col-span-2">
                    <div className="rounded-[14px] border border-antique-gold/25 bg-soft-cream px-4 py-4 text-[11px] text-antique-gold">
                      {t("checkout.noShippingAreas")}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="relative overflow-hidden rounded-[26px] border border-light-champagne/90 bg-soft-white/85 shadow-[0_12px_38px_rgba(7,19,31,0.045)] backdrop-blur-sm">
            <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-soft-cream blur-[70px]" />

            <SectionHeader
              number="04"
              title={t("checkout.paymentMethod")}
              subtitle={t("checkout.paymentSubtitle")}
            />

            <div className="relative p-6 sm:p-8">
              <label
                className={`group flex cursor-pointer items-center gap-4 rounded-[18px] border p-4 transition-all duration-300 ${
                  formValues.paymentMethod === "cash_on_delivery"
                    ? "border-champagne-gold bg-soft-cream/70 shadow-[0_10px_26px_rgba(7,19,31,0.045)]"
                    : "border-light-champagne bg-warm-ivory/65"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cash_on_delivery"
                  checked={
                    formValues.paymentMethod === "cash_on_delivery"
                  }
                  onChange={handleChange}
                  className="h-4 w-4 accent-[#12263A]"
                />

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-midnight-navy text-champagne-gold">
                  ✦
                </div>

                <div>
                  <p className="text-[12px] font-semibold text-midnight-navy">
                    {t("checkout.cashOnDelivery")}
                  </p>

                  <p className="mt-1 text-[10px] text-slate-gray">
                    {t("checkout.payWhenOrderArrives")}
                  </p>
                </div>
              </label>
            </div>
          </section>

          <aside className="w-full">
            <div className="relative overflow-hidden rounded-[26px] border border-champagne-gold/15 bg-midnight-navy p-6 text-soft-white shadow-[0_25px_65px_rgba(7,19,31,0.18)] sm:p-8 lg:p-10">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-rich-navy via-midnight-navy to-luxury-black" />

              <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full border border-champagne-gold/15" />

              <div className="pointer-events-none absolute -bottom-28 -left-24 h-56 w-56 rounded-full border border-champagne-gold/10" />

              <div className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-champagne-gold/10 blur-[90px]" />

              <div className="relative z-10">
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full border border-champagne-gold/25 bg-soft-white/[0.05] text-[11px] text-champagne-gold">
                    ✦
                  </div>

                  <div>
                    <p className="text-[7px] font-semibold uppercase tracking-[0.28em] text-champagne-gold">
                      {t("checkout.orderSummary")}
                    </p>

                    <h2 className="mt-1 font-serif text-[1.35rem] font-normal text-soft-white">
                      {t("checkout.yourTotal")}
                    </h2>
                  </div>
                </div>

                <div className="my-7 h-px bg-soft-white/10" />

                <div className="space-y-5">
                  <SummaryRow
                    label={t("checkout.items")}
                    value={items.reduce(
                      (total, item) => total + Number(item.quantity || 0),
                      0,
                    )}
                  />

                  <SummaryRow
                    label={t("checkout.subtotal")}
                    value={`${formatMoney(subtotal)} EGP`}
                  />

                  <SummaryRow
                    label={t("checkout.deliveryArea")}
                    value={
                      selectedShippingArea
                        ? getLocalizedText(
                            selectedShippingArea.name,
                            activeLanguage,
                          )
                        : t("checkout.notSelected")
                    }
                    gold={Boolean(selectedShippingArea)}
                  />

                  <SummaryRow
                    label={t("checkout.shipping")}
                    value={
                      selectedShippingArea
                        ? `${formatMoney(shippingCost)} EGP`
                        : t("checkout.selectArea")
                    }
                    gold
                  />
                </div>

                <div className="my-7 h-px bg-soft-white/10" />

                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[7px] font-semibold uppercase tracking-[0.24em] text-premium-silver/45">
                      {t("checkout.totalAmount")}
                    </p>

                    <p className="mt-2 font-serif text-[2.3rem] italic font-normal leading-none text-champagne-gold">
                      {formatMoney(total)}

                      <span className="ml-2 font-sans text-[8px] font-semibold not-italic uppercase tracking-[0.08em] text-premium-silver/55">
                        EGP
                      </span>
                    </p>
                  </div>

                  <span className="mb-1 text-[11px] text-classic-gold">
                    ✦
                  </span>
                </div>

                {!selectedShippingArea && (
                  <div className="mt-5 rounded-[13px] border border-champagne-gold/15 bg-soft-white/[0.04] px-4 py-3">
                    <p className="text-[9px] leading-5 text-premium-silver/55">
                      {t("checkout.selectDeliveryToCalculate")}
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={
                    submitting ||
                    shippingLoading ||
                    !formValues.manufacturingName.trim() ||
                    !formValues.shippingAreaId ||
                    !selectedShippingArea ||
                    shippingAreas.length === 0
                  }
                  className="group mt-8 flex min-h-[56px] w-full items-center justify-center rounded-[13px] bg-soft-white px-6 text-[9px] font-semibold uppercase tracking-[0.12em] text-midnight-navy shadow-[0_14px_32px_rgba(0,0,0,0.16)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-warm-ivory disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
                >
                  {submitting ? (
                    <span className="flex items-center gap-3">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-midnight-navy/20 border-t-midnight-navy" />

                      {t("checkout.placingOrder")}
                    </span>
                  ) : (
                    <span className="flex items-center gap-7">
                      {t("checkout.placeOrder")}

                      <span className="text-[15px] text-classic-gold transition-transform duration-300 group-hover:translate-x-1">
                        →
                      </span>
                    </span>
                  )}
                </button>

                <div className="mt-5 flex items-start gap-3 rounded-[14px] border border-soft-white/10 bg-soft-white/[0.04] p-3.5">
                  <span className="mt-0.5 text-[9px] text-champagne-gold">
                    ✓
                  </span>

                  <p className="text-[9px] leading-5 text-premium-silver/55">
                    {t("checkout.serverVerification")}
                  </p>
                </div>

                <div className="mt-7 flex items-center justify-center gap-3 text-[7px] font-semibold uppercase tracking-[0.22em] text-premium-silver/30">
                  <span>{t("checkout.secure")}</span>

                  <span className="text-classic-gold/70">✦</span>

                  <span>{t("checkout.personal")}</span>

                  <span className="text-classic-gold/70">✦</span>

                  <span>{t("checkout.simple")}</span>
                </div>
              </div>
            </div>

            <Link
              to="/cart"
              className="group mt-4 flex min-h-[48px] items-center justify-center gap-3 rounded-[13px] border border-light-champagne bg-soft-white/75 text-[8px] font-semibold uppercase tracking-[0.14em] text-slate-gray shadow-[0_6px_18px_rgba(7,19,31,0.025)] backdrop-blur-sm transition-all duration-300 hover:border-champagne-gold hover:bg-soft-white hover:text-midnight-navy"
            >
              ← {t("checkout.backToCart")}
            </Link>
          </aside>
        </form>
      </div>

      <style>
        {`
          .checkout-input {
            height: 52px;
            width: 100%;
            border-radius: 14px;
            border: 1px solid #EDE5D9;
            background: rgba(248, 245, 239, 0.65);
            padding-left: 16px;
            padding-right: 16px;
            font-size: 12px;
            color: #12263A;
            outline: none;
            transition: all 0.3s ease;
          }

          .checkout-input::placeholder {
            color: rgba(138, 147, 156, 0.7);
          }

          .checkout-input:hover {
            border-color: rgba(227, 196, 122, 0.6);
            background: #F9F7F2;
          }

          .checkout-input:focus {
            border-color: #C9A24D;
            background: #F9F7F2;
            box-shadow: 0 0 0 4px rgba(201, 162, 77, 0.08);
          }

          .checkout-textarea {
            width: 100%;
            resize: none;
            border-radius: 14px;
            border: 1px solid #EDE5D9;
            background: rgba(248, 245, 239, 0.65);
            padding: 14px 16px;
            font-size: 12px;
            line-height: 24px;
            color: #12263A;
            outline: none;
            transition: all 0.3s ease;
          }

          .checkout-textarea::placeholder {
            color: rgba(138, 147, 156, 0.7);
          }

          .checkout-textarea:hover {
            border-color: rgba(227, 196, 122, 0.6);
            background: #F9F7F2;
          }

          .checkout-textarea:focus {
            border-color: #C9A24D;
            background: #F9F7F2;
            box-shadow: 0 0 0 4px rgba(201, 162, 77, 0.08);
          }
        `}
      </style>
    </main>
  );
};

const SectionHeader = ({ number, title, subtitle, action = null }) => {
  return (
    <div className="relative border-b border-light-champagne/80 px-6 py-5 sm:px-8 sm:py-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-midnight-navy text-[9px] font-semibold tracking-[0.08em] text-champagne-gold shadow-[0_8px_20px_rgba(18,38,58,0.14)]">
            {number}
          </div>

          <div>
            <h2 className="font-serif text-[1.45rem] font-normal text-midnight-navy">
              {title}
            </h2>

            <p className="mt-1 text-[9px] uppercase tracking-[0.12em] text-steel-gray">
              {subtitle}
            </p>
          </div>
        </div>

        {action}
      </div>
    </div>
  );
};

const CheckoutField = ({ label, htmlFor, children }) => {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-2.5 block text-[8px] font-semibold uppercase tracking-[0.17em] text-midnight-navy"
      >
        {label}
      </label>

      {children}
    </div>
  );
};

const SummaryRow = ({ label, value, gold = false }) => {
  return (
    <div className="flex items-start justify-between gap-4 text-[11px]">
      <span className="text-premium-silver/60">{label}</span>

      <span
        className={`max-w-[190px] text-right font-semibold ${
          gold ? "text-champagne-gold" : "text-soft-white"
        }`}
      >
        {value}
      </span>
    </div>
  );
};

export default CheckoutPage;
