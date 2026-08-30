import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useCart } from "../../../context/CartContext";
import { createOrder } from "../services/orderApi";
import { getShippingAreas } from "../../shipping/services/shippingApi";

const getBackendOrigin = () => {
  const explicitBackend =
    import.meta.env.VITE_BACKEND_URL;

  if (explicitBackend) {
    return String(explicitBackend).replace(/\/+$/, "");
  }

  const apiUrl = import.meta.env.VITE_API_URL;

  if (
    apiUrl &&
    /^https?:\/\//i.test(apiUrl)
  ) {
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
      typeof window !== "undefined"
        ? window.location.protocol
        : "https:";

    return `${protocol}${image}`;
  }

  if (image.startsWith("/api/uploads/")) {
    image = image.replace(/^\/api/, "");
  }

  if (
    image.startsWith("/assets/") ||
    image.startsWith("/images/")
  ) {
    return image;
  }

  return `${BACKEND_URL}${image.startsWith("/") ? "" : "/"}${image}`;
};

const getCartItemImage = (item) => {
  const product = item?.product || {};
  const variant = item?.variant || {};

  const productSnapshot =
    item?.productSnapshot || {};

  const variantSnapshot =
    item?.variantSnapshot || {};

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

  const {
    cart,
    cartTotal,
    isLoading: cartLoading,
  } = useCart();

  const [shippingAreas, setShippingAreas] = useState([]);
  const [shippingLoading, setShippingLoading] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formValues, setFormValues] = useState({
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
          Array.isArray(response?.data?.areas)
            ? response.data.areas
            : [],
        );
      } catch (error) {
        console.error("Load shipping areas error:", error);

        setError(
          error?.response?.data?.message ||
            "Unable to load shipping areas.",
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
        (area) =>
          String(area._id) ===
          String(formValues.shippingAreaId),
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
    if (!formValues.firstName.trim()) {
      return "First name is required";
    }

    if (!formValues.lastName.trim()) {
      return "Last name is required";
    }

    if (!formValues.phone.trim()) {
      return "Phone number is required";
    }

    if (!formValues.address.trim()) {
      return "Delivery address is required";
    }

    if (!formValues.shippingAreaId) {
      return "Please select your shipping area";
    }

    if (!selectedShippingArea) {
      return "Selected shipping area is not available";
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
        throw new Error(
          "Order was created but no order ID was returned",
        );
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
          "Unable to create order. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (cartLoading) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-warm-ivory">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-soft-cream blur-[120px]" />

        <div className="flex min-h-screen items-center justify-center">
          <div className="relative flex flex-col items-center text-center">
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-champagne-gold/30 bg-midnight-navy shadow-[0_16px_38px_rgba(18,38,58,0.18)]">
              <span className="absolute h-7 w-7 animate-spin rounded-full border border-champagne-gold/30 border-t-champagne-gold" />

              <span className="text-[8px] text-champagne-gold">
                ✦
              </span>
            </div>

            <p className="mt-6 text-[9px] font-semibold uppercase tracking-[0.32em] text-slate-gray">
              Loading Checkout
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-warm-ivory">
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
                  Checkout
                </span>

                <span className="h-px w-10 bg-classic-gold/60" />
              </div>

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-champagne-gold/25 bg-soft-white/[0.05] text-xl text-champagne-gold">
                ✦
              </div>

              <h1 className="mt-8 font-serif text-[2.7rem] font-normal leading-[1.02] tracking-[-0.035em] text-soft-white sm:text-[3.5rem]">
                Your cart is
                <span className="mt-1 block italic text-champagne-gold">
                  still empty.
                </span>
              </h1>

              <p className="mx-auto mt-5 max-w-md text-[13px] leading-7 text-premium-silver/75">
                Add some products to your cart before continuing
                to checkout.
              </p>

              <Link
                to="/shop"
                className="group mt-9 inline-flex min-h-[52px] items-center justify-center gap-8 rounded-[13px] bg-soft-white px-8 text-[9px] font-semibold uppercase tracking-[0.12em] text-midnight-navy"
              >
                Continue Shopping

                <span className="text-[15px] text-classic-gold">
                  →
                </span>
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-warm-ivory px-4 py-10 text-midnight-navy sm:px-6 lg:px-8 lg:py-14">
      <div className="pointer-events-none fixed -left-48 top-1/3 h-[520px] w-[520px] rounded-full bg-light-champagne/55 blur-[130px]" />

      <div className="pointer-events-none fixed -right-48 top-0 h-[520px] w-[520px] rounded-full bg-champagne-gold/[0.07] blur-[130px]" />

      <div className="relative mx-auto max-w-[1360px]">
        <div className="mb-10 lg:mb-12">
          <Link
            to="/cart"
            className="group inline-flex items-center gap-2.5 text-[8px] font-semibold uppercase tracking-[0.18em] text-slate-gray transition-colors hover:text-antique-gold"
          >
            <span className="text-sm">←</span>
            Back to Cart
          </Link>

          <div className="mt-6">
            <div className="flex items-center gap-3">
              <span className="h-px w-9 bg-classic-gold/60" />

              <p className="text-[9px] font-semibold uppercase tracking-[0.32em] text-antique-gold">
                Secure Checkout
              </p>

              <span className="text-[8px] text-classic-gold">
                ✦
              </span>
            </div>

            <h1 className="mt-4 font-serif text-[3rem] font-normal leading-none tracking-[-0.045em] text-midnight-navy sm:text-[4rem] lg:text-[4.6rem]">
              Review &
              <span className="ml-2 italic text-navy-soft">
                Checkout.
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-[13px] leading-7 text-slate-gray sm:text-[14px]">
              Review your selected pieces and complete your
              delivery information.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_390px]"
        >
          <div className="space-y-6">
            <section className="relative overflow-hidden rounded-[26px] border border-light-champagne/90 bg-soft-white/85 shadow-[0_12px_38px_rgba(7,19,31,0.045)] backdrop-blur-sm">
              <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-soft-cream blur-[70px]" />

              <SectionHeader
                number="01"
                title="Order Details"
                subtitle="Everything you selected"
                action={
                  <Link
                    to="/cart"
                    className="text-[8px] font-semibold uppercase tracking-[0.14em] text-slate-gray transition-colors hover:text-antique-gold"
                  >
                    Edit Cart
                  </Link>
                }
              />

              <div className="relative space-y-5 p-5 sm:p-7">
                {items.map((item, index) => {
                  const product = item.product || null;
                  const variant = item.variant || null;

                  const productTechnology =
                    item.productTechnology || null;

                  const technologyModel =
                    productTechnology?.technologyModel ||
                    item.technologyModel ||
                    null;

                  const productPrice = Number(
                    product?.price || 0,
                  );

                  const variantPrice = Number(
                    variant?.price || 0,
                  );

                  const technologyPrice = Number(
                    productTechnology?.extraPrice ||
                      technologyModel?.extraPrice ||
                      0,
                  );

                  const basePrice =
                    variantPrice > 0
                      ? variantPrice
                      : productPrice;

                  const unitPrice =
                    basePrice + technologyPrice;

                  const quantity = Number(
                    item.quantity || 1,
                  );

                  const itemTotal =
                    unitPrice * quantity;

                  const image =
                    getCartItemImage(item);

                  const imageUrl =
                    getImageUrl(image);

                  const variantName =
                    variant?.name ||
                    [
                      variant?.color,
                      variant?.size,
                    ]
                      .filter(Boolean)
                      .join(" / ");

                  const technologyName =
                    technologyModel?.modelName ||
                    technologyModel?.name ||
                    "";

                  const technologyType =
                    technologyModel?.technology?.name ||
                    technologyModel?.technology?.title ||
                    "";

                  return (
                    <div
                      key={
                        item._id ||
                        `${product?._id}-${index}`
                      }
                      className="overflow-hidden rounded-[22px] border border-light-champagne/85 bg-warm-ivory/55"
                    >
                      <div className="flex flex-col gap-6 p-5 sm:flex-row sm:p-6">
                        <div className="relative h-52 w-full shrink-0 overflow-hidden rounded-[17px] border border-light-champagne/70 bg-soft-cream sm:h-44 sm:w-44">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={
                                product?.name ||
                                item.name ||
                                "Product"
                              }
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[8px] uppercase tracking-[0.16em] text-steel-gray">
                              No Image
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-5">
                            <div>
                              <div className="mb-2 flex items-center gap-2.5">
                                <span className="h-px w-6 bg-classic-gold/60" />

                                <p className="text-[7px] font-semibold uppercase tracking-[0.22em] text-steel-gray">
                                  Product {index + 1}
                                </p>
                              </div>

                              <h3 className="font-serif text-[1.55rem] font-normal leading-tight tracking-[-0.02em] text-midnight-navy">
                                {product?.name ||
                                  item.name}
                              </h3>
                            </div>

                            <div className="shrink-0 text-right">
                              <p className="text-[7px] font-semibold uppercase tracking-[0.15em] text-steel-gray">
                                Item Total
                              </p>

                              <p className="mt-1.5 font-serif text-[1.25rem] text-midnight-navy">
                                {formatMoney(
                                  itemTotal,
                                )}{" "}
                                <span className="font-sans text-[7px] font-semibold uppercase text-slate-gray">
                                  EGP
                                </span>
                              </p>
                            </div>
                          </div>

                          <div className="mt-5 flex flex-wrap gap-2">
                            <Pill>
                              Quantity: {quantity}
                            </Pill>

                            <Pill>
                              Unit:{" "}
                              {formatMoney(
                                unitPrice,
                              )}{" "}
                              EGP
                            </Pill>
                          </div>
                        </div>
                      </div>

                      {(variant ||
                        technologyModel) && (
                        <div className="grid gap-4 border-t border-light-champagne/80 bg-soft-white/55 p-5 sm:p-6 lg:grid-cols-2">
                          {variant && (
                            <DetailCard
                              eyebrow="Selected Option"
                              title="Variant"
                            >
                              {variantName && (
                                <DetailRow
                                  label="Name"
                                  value={
                                    variantName
                                  }
                                />
                              )}

                              {variant.color && (
                                <DetailRow
                                  label="Color"
                                  value={
                                    variant.color
                                  }
                                />
                              )}

                              {variant.size && (
                                <DetailRow
                                  label="Size"
                                  value={
                                    variant.size
                                  }
                                />
                              )}

                              {variant.material && (
                                <DetailRow
                                  label="Material"
                                  value={
                                    variant.material
                                  }
                                />
                              )}

                              {variant.finish && (
                                <DetailRow
                                  label="Finish"
                                  value={
                                    variant.finish
                                  }
                                />
                              )}

                              {variant.sku && (
                                <DetailRow
                                  label="SKU"
                                  value={
                                    variant.sku
                                  }
                                />
                              )}
                            </DetailCard>
                          )}

                          {technologyModel && (
                            <div className="relative overflow-hidden rounded-[18px] border border-champagne-gold/15 bg-midnight-navy p-5 text-soft-white">
                              <div className="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-champagne-gold/10 blur-[45px]" />

                              <div className="relative">
                                <p className="text-[7px] font-semibold uppercase tracking-[0.2em] text-premium-silver/45">
                                  Selected Option
                                </p>

                                <h4 className="mt-1.5 font-serif text-[1.1rem] text-soft-white">
                                  Technology
                                </h4>

                                <div className="mt-4 space-y-3">
                                  {technologyType && (
                                    <DarkDetailRow
                                      label="Type"
                                      value={
                                        technologyType
                                      }
                                    />
                                  )}

                                  {technologyName && (
                                    <DarkDetailRow
                                      label="Model"
                                      value={
                                        technologyName
                                      }
                                    />
                                  )}

                                  <DarkDetailRow
                                    label="Extra Price"
                                    value={
                                      technologyPrice >
                                      0
                                        ? `+ ${formatMoney(
                                            technologyPrice,
                                          )} EGP`
                                        : "Included"
                                    }
                                    gold
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex flex-col gap-4 border-t border-light-champagne/80 bg-soft-white/90 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-[9px]">
                          <PriceDetail
                            label="Base Price"
                            value={`${formatMoney(
                              basePrice,
                            )} EGP`}
                          />

                          {technologyPrice >
                            0 && (
                            <PriceDetail
                              label="Technology"
                              value={`+ ${formatMoney(
                                technologyPrice,
                              )} EGP`}
                              gold
                            />
                          )}

                          <PriceDetail
                            label="Quantity"
                            value={`× ${quantity}`}
                          />
                        </div>

                        <div className="sm:text-right">
                          <p className="text-[7px] font-semibold uppercase tracking-[0.15em] text-steel-gray">
                            Total
                          </p>

                          <p className="mt-1 font-serif text-[1.2rem] text-midnight-navy">
                            {formatMoney(
                              itemTotal,
                            )}{" "}
                            <span className="font-sans text-[7px] font-semibold uppercase text-slate-gray">
                              EGP
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="relative overflow-hidden rounded-[26px] border border-light-champagne/90 bg-soft-white/85 shadow-[0_12px_38px_rgba(7,19,31,0.045)] backdrop-blur-sm">
              <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-soft-cream blur-[70px]" />

              <SectionHeader
                number="02"
                title="Shipping Information"
                subtitle="Select your delivery area and enter your address"
              />

              <div className="relative px-6 py-6 sm:px-8 sm:py-8">
                {error && (
                  <div className="mb-6 rounded-[14px] border border-antique-gold/25 bg-soft-cream px-4 py-3 text-[11px] leading-6 text-antique-gold">
                    {error}
                  </div>
                )}

                <div className="grid gap-5 sm:grid-cols-2">
                  <CheckoutField
                    label="First Name"
                    htmlFor="firstName"
                  >
                    <input
                      id="firstName"
                      name="firstName"
                      value={
                        formValues.firstName
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Enter your first name"
                      className="checkout-input"
                      autoComplete="given-name"
                    />
                  </CheckoutField>

                  <CheckoutField
                    label="Last Name"
                    htmlFor="lastName"
                  >
                    <input
                      id="lastName"
                      name="lastName"
                      value={
                        formValues.lastName
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Enter your last name"
                      className="checkout-input"
                      autoComplete="family-name"
                    />
                  </CheckoutField>

                  <div className="sm:col-span-2">
                    <CheckoutField
                      label="Phone Number"
                      htmlFor="phone"
                    >
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={
                          formValues.phone
                        }
                        onChange={
                          handleChange
                        }
                        placeholder="Enter your phone number"
                        className="checkout-input"
                        autoComplete="tel"
                      />
                    </CheckoutField>
                  </div>

                  <div className="sm:col-span-2">
                    <CheckoutField
                      label="Delivery Address"
                      htmlFor="address"
                    >
                      <textarea
                        id="address"
                        name="address"
                        rows={4}
                        value={
                          formValues.address
                        }
                        onChange={
                          handleChange
                        }
                        placeholder="Street, building number, floor, apartment..."
                        className="checkout-textarea"
                        autoComplete="street-address"
                      />
                    </CheckoutField>
                  </div>

                  <CheckoutField
                    label="Shipping Area"
                    htmlFor="shippingAreaId"
                  >
                    <select
                      id="shippingAreaId"
                      name="shippingAreaId"
                      value={
                        formValues.shippingAreaId
                      }
                      onChange={
                        handleChange
                      }
                      disabled={
                        shippingLoading
                      }
                      className="checkout-input cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <option value="">
                        {shippingLoading
                          ? "Loading shipping areas..."
                          : "Select your area"}
                      </option>

                      {shippingAreas.map(
                        (area) => (
                          <option
                            key={
                              area._id
                            }
                            value={
                              area._id
                            }
                          >
                            {
                              area.name
                            }{" "}
                            —{" "}
                            {formatMoney(
                              area.shippingFee,
                            )}{" "}
                            EGP
                          </option>
                        ),
                      )}
                    </select>
                  </CheckoutField>

                  <CheckoutField
                    label="Country"
                    htmlFor="country"
                  >
                    <input
                      id="country"
                      name="country"
                      value={
                        formValues.country
                      }
                      onChange={
                        handleChange
                      }
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
                                Selected Delivery Area
                              </p>

                              <p className="mt-1 font-serif text-[1.25rem] text-midnight-navy">
                                {
                                  selectedShippingArea.name
                                }
                              </p>
                            </div>
                          </div>

                          <div className="sm:text-right">
                            <p className="text-[7px] font-semibold uppercase tracking-[0.18em] text-steel-gray">
                              Shipping Fee
                            </p>

                            <p className="mt-1 font-serif text-[1.5rem] text-antique-gold">
                              {formatMoney(
                                shippingCost,
                              )}{" "}
                              <span className="font-sans text-[8px] font-semibold">
                                EGP
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {!shippingLoading &&
                    shippingAreas.length ===
                      0 && (
                      <div className="sm:col-span-2">
                        <div className="rounded-[14px] border border-antique-gold/25 bg-soft-cream px-4 py-4 text-[11px] text-antique-gold">
                          There are currently no
                          shipping areas available.
                        </div>
                      </div>
                    )}
                </div>
              </div>
            </section>

            <section className="relative overflow-hidden rounded-[26px] border border-light-champagne/90 bg-soft-white/85 shadow-[0_12px_38px_rgba(7,19,31,0.045)] backdrop-blur-sm">
              <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-soft-cream blur-[70px]" />

              <SectionHeader
                number="03"
                title="Payment Method"
                subtitle="Select your preferred payment method"
              />

              <div className="relative p-6 sm:p-8">
                <label
                  className={`group flex cursor-pointer items-center gap-4 rounded-[18px] border p-4 transition-all duration-300 ${
                    formValues.paymentMethod ===
                    "cash_on_delivery"
                      ? "border-champagne-gold bg-soft-cream/70 shadow-[0_10px_26px_rgba(7,19,31,0.045)]"
                      : "border-light-champagne bg-warm-ivory/65"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash_on_delivery"
                    checked={
                      formValues.paymentMethod ===
                      "cash_on_delivery"
                    }
                    onChange={
                      handleChange
                    }
                    className="h-4 w-4 accent-[#12263A]"
                  />

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-midnight-navy text-champagne-gold">
                    ✦
                  </div>

                  <div>
                    <p className="text-[12px] font-semibold text-midnight-navy">
                      Cash on Delivery
                    </p>

                    <p className="mt-1 text-[10px] text-slate-gray">
                      Pay when your order arrives.
                    </p>
                  </div>
                </label>
              </div>
            </section>
          </div>

          <aside className="xl:sticky xl:top-28">
            <div className="relative overflow-hidden rounded-[26px] border border-champagne-gold/15 bg-midnight-navy p-6 text-soft-white shadow-[0_25px_65px_rgba(7,19,31,0.18)] sm:p-7">
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
                      Order Summary
                    </p>

                    <h2 className="mt-1 font-serif text-[1.35rem] font-normal text-soft-white">
                      Your Total
                    </h2>
                  </div>
                </div>

                <div className="my-7 h-px bg-soft-white/10" />

                <div className="space-y-5">
                  <SummaryRow
                    label="Items"
                    value={items.reduce(
                      (total, item) =>
                        total +
                        Number(
                          item.quantity ||
                            0,
                        ),
                      0,
                    )}
                  />

                  <SummaryRow
                    label="Subtotal"
                    value={`${formatMoney(
                      subtotal,
                    )} EGP`}
                  />

                  <SummaryRow
                    label="Delivery Area"
                    value={
                      selectedShippingArea
                        ?.name ||
                      "Not selected"
                    }
                    gold={
                      Boolean(
                        selectedShippingArea,
                      )
                    }
                  />

                  <SummaryRow
                    label="Shipping"
                    value={
                      selectedShippingArea
                        ? `${formatMoney(
                            shippingCost,
                          )} EGP`
                        : "Select area"
                    }
                    gold
                  />
                </div>

                <div className="my-7 h-px bg-soft-white/10" />

                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[7px] font-semibold uppercase tracking-[0.24em] text-premium-silver/45">
                      Total Amount
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
                      Select your delivery area to
                      calculate the final order
                      total.
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={
                    submitting ||
                    shippingLoading ||
                    !formValues.shippingAreaId ||
                    !selectedShippingArea ||
                    shippingAreas.length === 0
                  }
                  className="group mt-8 flex min-h-[56px] w-full items-center justify-center rounded-[13px] bg-soft-white px-6 text-[9px] font-semibold uppercase tracking-[0.12em] text-midnight-navy shadow-[0_14px_32px_rgba(0,0,0,0.16)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-warm-ivory disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
                >
                  {submitting ? (
                    <span className="flex items-center gap-3">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-midnight-navy/20 border-t-midnight-navy" />

                      Placing Order...
                    </span>
                  ) : (
                    <span className="flex items-center gap-7">
                      Place Order

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
                    Product prices and shipping
                    costs are verified by the
                    server before your order is
                    created.
                  </p>
                </div>

                <div className="mt-7 flex items-center justify-center gap-3 text-[7px] font-semibold uppercase tracking-[0.22em] text-premium-silver/30">
                  <span>Secure</span>
                  <span className="text-classic-gold/70">
                    ✦
                  </span>
                  <span>Personal</span>
                  <span className="text-classic-gold/70">
                    ✦
                  </span>
                  <span>Simple</span>
                </div>
              </div>
            </div>

            <Link
              to="/cart"
              className="group mt-4 flex min-h-[48px] items-center justify-center gap-3 rounded-[13px] border border-light-champagne bg-soft-white/75 text-[8px] font-semibold uppercase tracking-[0.14em] text-slate-gray shadow-[0_6px_18px_rgba(7,19,31,0.025)] backdrop-blur-sm transition-all duration-300 hover:border-champagne-gold hover:bg-soft-white hover:text-midnight-navy"
            >
              ← Back to Cart
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

const SectionHeader = ({
  number,
  title,
  subtitle,
  action = null,
}) => {
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

const CheckoutField = ({
  label,
  htmlFor,
  children,
}) => {
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

const Pill = ({ children }) => {
  return (
    <span className="rounded-full border border-light-champagne bg-soft-white/80 px-3 py-1.5 text-[8px] font-medium uppercase tracking-[0.08em] text-slate-gray">
      {children}
    </span>
  );
};

const DetailCard = ({
  eyebrow,
  title,
  children,
}) => {
  return (
    <div className="rounded-[18px] border border-light-champagne/85 bg-soft-white/90 p-5">
      <p className="text-[7px] font-semibold uppercase tracking-[0.2em] text-steel-gray">
        {eyebrow}
      </p>

      <h4 className="mt-1.5 font-serif text-[1.1rem] text-midnight-navy">
        {title}
      </h4>

      <div className="mt-4 space-y-3">
        {children}
      </div>
    </div>
  );
};

const DetailRow = ({
  label,
  value,
}) => {
  return (
    <div className="flex justify-between gap-4 border-b border-light-champagne/70 pb-2.5 last:border-b-0 last:pb-0">
      <span className="text-[9px] text-steel-gray">
        {label}
      </span>

      <span className="text-right text-[9px] font-semibold text-midnight-navy">
        {value}
      </span>
    </div>
  );
};

const DarkDetailRow = ({
  label,
  value,
  gold = false,
}) => {
  return (
    <div className="flex justify-between gap-4 border-b border-soft-white/10 pb-2.5 last:border-b-0 last:pb-0">
      <span className="text-[9px] text-premium-silver/50">
        {label}
      </span>

      <span
        className={`text-right text-[9px] font-semibold ${
          gold
            ? "text-champagne-gold"
            : "text-soft-white"
        }`}
      >
        {value}
      </span>
    </div>
  );
};

const PriceDetail = ({
  label,
  value,
  gold = false,
}) => {
  return (
    <div>
      <span className="text-steel-gray">
        {label}
      </span>

      <span
        className={`ml-2 font-semibold ${
          gold
            ? "text-antique-gold"
            : "text-midnight-navy"
        }`}
      >
        {value}
      </span>
    </div>
  );
};

const SummaryRow = ({
  label,
  value,
  gold = false,
}) => {
  return (
    <div className="flex items-start justify-between gap-4 text-[11px]">
      <span className="text-premium-silver/60">
        {label}
      </span>

      <span
        className={`max-w-[190px] text-right font-semibold ${
          gold
            ? "text-champagne-gold"
            : "text-soft-white"
        }`}
      >
        {value}
      </span>
    </div>
  );
};

export default CheckoutPage;