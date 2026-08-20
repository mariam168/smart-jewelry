import { useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import { useCart } from "../../../context/CartContext";

import { createOrder } from "../services/orderApi";

const CheckoutPage = () => {
  const navigate = useNavigate();

  const { cart, cartTotal, isLoading: cartLoading } = useCart();

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");

  const [formValues, setFormValues] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    city: "",
    country: "Egypt",
    paymentMethod: "cash_on_delivery",
  });

  const items = cart?.items || [];

  const subtotal = Number(cartTotal || 0);

  const shippingCost = subtotal >= 1000 ? 0 : 50;

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
      return "Address is required";
    }

    if (!formValues.city.trim()) {
      return "City is required";
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
        shippingAddress: {
          firstName: formValues.firstName.trim(),

          lastName: formValues.lastName.trim(),

          phone: formValues.phone.trim(),

          address: formValues.address.trim(),

          city: formValues.city.trim(),

          country: formValues.country.trim(),
        },

        paymentMethod: formValues.paymentMethod,
      });

      const order = response?.data;

      if (!order?._id) {
        throw new Error("Order was created but no order ID was returned");
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

              <span className="text-[8px] text-champagne-gold">✦</span>
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

            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-champagne-gold/10 blur-[90px]" />

            <div className="relative z-10">
              <div className="mb-7 flex items-center justify-center gap-4">
                <span className="h-px w-10 bg-classic-gold/60" />

                <span className="text-[9px] font-semibold uppercase tracking-[0.35em] text-champagne-gold">
                  Checkout
                </span>

                <span className="h-px w-10 bg-classic-gold/60" />
              </div>

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-champagne-gold/25 bg-soft-white/[0.05] text-xl text-champagne-gold shadow-[0_14px_35px_rgba(0,0,0,0.18)] backdrop-blur-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="h-7 w-7"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437m0 0L6.75 15.75a2.25 2.25 0 002.182 1.7h6.136a2.25 2.25 0 002.182-1.7l1.444-5.478a1.125 1.125 0 00-1.088-1.412H5.106m0 0L4.5 6.75m4.432 13.5h.008v.008h-.008v-.008zm6 0h.008v.008h-.008v-.008z"
                  />
                </svg>
              </div>

              <h1 className="mt-8 font-serif text-[2.7rem] font-normal leading-[1.02] tracking-[-0.035em] text-soft-white sm:text-[3.5rem]">
                Your cart is
                <span className="mt-1 block italic text-champagne-gold">
                  still empty.
                </span>
              </h1>

              <p className="mx-auto mt-5 max-w-md text-[13px] leading-7 text-premium-silver/75 sm:text-[14px]">
                Add some products to your cart before continuing to checkout.
              </p>

              <Link
                to="/shop"
                className="group mt-9 inline-flex min-h-[52px] items-center justify-center gap-8 rounded-[13px] bg-soft-white px-8 text-[9px] font-semibold uppercase tracking-[0.12em] text-midnight-navy shadow-[0_14px_32px_rgba(0,0,0,0.16)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-warm-ivory hover:shadow-[0_18px_38px_rgba(0,0,0,0.22)]"
              >
                Continue Shopping
                <span className="text-[15px] text-classic-gold transition-transform duration-300 group-hover:translate-x-1">
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
            className="group inline-flex items-center gap-2.5 text-[8px] font-semibold uppercase tracking-[0.18em] text-slate-gray transition-colors duration-300 hover:text-antique-gold"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
              />
            </svg>
            Back to Cart
          </Link>

          <div className="mt-6">
            <div className="flex items-center gap-3">
              <span className="h-px w-9 bg-classic-gold/60" />

              <p className="text-[9px] font-semibold uppercase tracking-[0.32em] text-antique-gold">
                Secure Checkout
              </p>

              <span className="text-[8px] text-classic-gold">✦</span>
            </div>

            <h1 className="mt-4 font-serif text-[3rem] font-normal leading-none tracking-[-0.045em] text-midnight-navy sm:text-[4rem] lg:text-[4.6rem]">
              Review &
              <span className="ml-2 italic text-navy-soft">Checkout.</span>
            </h1>

            <p className="mt-5 max-w-2xl text-[13px] leading-7 text-slate-gray sm:text-[14px]">
              Review all product details, selected options and your delivery
              information before placing your order.
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

              <div className="relative border-b border-light-champagne/80 px-6 py-5 sm:px-8 sm:py-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-midnight-navy text-[9px] font-semibold tracking-[0.08em] text-champagne-gold shadow-[0_8px_20px_rgba(18,38,58,0.14)]">
                      01
                    </div>

                    <div>
                      <h2 className="font-serif text-[1.45rem] font-normal text-midnight-navy">
                        Order Details
                      </h2>

                      <p className="mt-1 text-[9px] uppercase tracking-[0.12em] text-steel-gray">
                        Everything you selected
                      </p>
                    </div>
                  </div>

                  <Link
                    to="/cart"
                    className="text-[8px] font-semibold uppercase tracking-[0.14em] text-slate-gray transition-colors duration-300 hover:text-antique-gold"
                  >
                    Edit Cart
                  </Link>
                </div>
              </div>

              <div className="relative space-y-5 p-5 sm:p-7">
                {items.map((item, index) => {
                  const product = item.product || null;

                  const variant = item.variant || null;

                  const productTechnology = item.productTechnology || null;

                  const technologyModel =
                    productTechnology?.technologyModel ||
                    item.technologyModel ||
                    null;

                  const productPrice = Number(product?.price || 0);

                  const variantPrice = Number(variant?.price || 0);

                  const technologyPrice = Number(
                    productTechnology?.extraPrice ||
                      technologyModel?.extraPrice ||
                      0,
                  );

                  const basePrice =
                    variantPrice > 0 ? variantPrice : productPrice;

                  const unitPrice = basePrice + technologyPrice;

                  const quantity = Number(item.quantity || 0);

                  const itemTotal = unitPrice * quantity;

                  const image =
                    variant?.image ||
                    product?.primaryImage ||
                    product?.image ||
                    product?.images?.[0] ||
                    "";

                  const imageUrl =
                    image?.startsWith("http://") ||
                    image?.startsWith("https://")
                      ? image
                      : image
                        ? `http://localhost:5000${image}`
                        : "";

                  const variantName =
                    variant?.name ||
                    [variant?.color, variant?.size].filter(Boolean).join(" / ");

                  const technologyName =
                    technologyModel?.modelName || technologyModel?.name || "";

                  const technologyType =
                    technologyModel?.technology?.name ||
                    technologyModel?.technology?.title ||
                    "";

                  return (
                    <div
                      key={item._id}
                      className="relative overflow-hidden rounded-[22px] border border-light-champagne/85 bg-warm-ivory/55 transition-all duration-300 hover:border-champagne-gold/50 hover:shadow-[0_15px_38px_rgba(7,19,31,0.06)]"
                    >
                      <div className="flex flex-col gap-6 p-5 sm:flex-row sm:p-6">
                        <div className="relative h-52 w-full shrink-0 overflow-hidden rounded-[17px] border border-light-champagne/70 bg-soft-cream sm:h-44 sm:w-44">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={product?.name || "Product"}
                              className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[8px] uppercase tracking-[0.16em] text-steel-gray">
                              No Image
                            </div>
                          )}

                          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-luxury-black/10 to-transparent" />
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
                                {product?.name}
                              </h3>
                            </div>

                            <div className="shrink-0 text-right">
                              <p className="text-[7px] font-semibold uppercase tracking-[0.15em] text-steel-gray">
                                Item Total
                              </p>

                              <p className="mt-1.5 font-serif text-[1.25rem] font-normal text-midnight-navy">
                                {itemTotal.toLocaleString()}{" "}
                                <span className="font-sans text-[7px] font-semibold uppercase text-slate-gray">
                                  EGP
                                </span>
                              </p>
                            </div>
                          </div>

                          {product?.description && (
                            <p className="mt-4 max-w-2xl text-[11px] leading-6 text-slate-gray">
                              {product.description}
                            </p>
                          )}

                          <div className="mt-5 flex flex-wrap items-center gap-2">
                            <span className="rounded-full border border-light-champagne bg-soft-white/80 px-3 py-1.5 text-[8px] font-medium uppercase tracking-[0.08em] text-slate-gray">
                              Quantity: {quantity}
                            </span>

                            <span className="rounded-full border border-light-champagne bg-soft-white/80 px-3 py-1.5 text-[8px] font-medium uppercase tracking-[0.08em] text-slate-gray">
                              Unit: {unitPrice.toLocaleString()} EGP
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-4 border-t border-light-champagne/80 bg-soft-white/55 p-5 sm:p-6 lg:grid-cols-2">
                        {variant && (
                          <div className="rounded-[18px] border border-light-champagne/85 bg-soft-white/90 p-5 shadow-[0_6px_20px_rgba(7,19,31,0.025)]">
                            <div className="mb-4 flex items-center justify-between">
                              <div>
                                <p className="text-[7px] font-semibold uppercase tracking-[0.2em] text-steel-gray">
                                  Selected Option
                                </p>

                                <h4 className="mt-1.5 font-serif text-[1.1rem] font-normal text-midnight-navy">
                                  Variant
                                </h4>
                              </div>

                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-soft-cream text-classic-gold">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth="1.5"
                                  stroke="currentColor"
                                  className="h-4 w-4"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M8.25 6.75h7.5M8.25 12h7.5m-7.5 5.25h7.5M5.25 3.75h13.5A1.5 1.5 0 0120.25 5.25v13.5a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5V5.25a1.5 1.5 0 011.5-1.5z"
                                  />
                                </svg>
                              </div>
                            </div>

                            <div className="space-y-3">
                              {variantName && (
                                <div className="flex justify-between gap-4 border-b border-light-champagne/70 pb-2.5">
                                  <span className="text-[9px] text-steel-gray">
                                    Name
                                  </span>

                                  <span className="text-right text-[9px] font-semibold text-midnight-navy">
                                    {variantName}
                                  </span>
                                </div>
                              )}

                              {variant.color && (
                                <div className="flex justify-between gap-4 border-b border-light-champagne/70 pb-2.5">
                                  <span className="text-[9px] text-steel-gray">
                                    Color
                                  </span>

                                  <span className="text-right text-[9px] font-semibold text-midnight-navy">
                                    {variant.color}
                                  </span>
                                </div>
                              )}

                              {variant.size && (
                                <div className="flex justify-between gap-4 border-b border-light-champagne/70 pb-2.5">
                                  <span className="text-[9px] text-steel-gray">
                                    Size
                                  </span>

                                  <span className="text-right text-[9px] font-semibold text-midnight-navy">
                                    {variant.size}
                                  </span>
                                </div>
                              )}

                              {variant.material && (
                                <div className="flex justify-between gap-4 border-b border-light-champagne/70 pb-2.5">
                                  <span className="text-[9px] text-steel-gray">
                                    Material
                                  </span>

                                  <span className="text-right text-[9px] font-semibold text-midnight-navy">
                                    {variant.material}
                                  </span>
                                </div>
                              )}

                              {variant.finish && (
                                <div className="flex justify-between gap-4 border-b border-light-champagne/70 pb-2.5">
                                  <span className="text-[9px] text-steel-gray">
                                    Finish
                                  </span>

                                  <span className="text-right text-[9px] font-semibold text-midnight-navy">
                                    {variant.finish}
                                  </span>
                                </div>
                              )}

                              {variant.sku && (
                                <div className="flex justify-between gap-4">
                                  <span className="text-[9px] text-steel-gray">
                                    SKU
                                  </span>

                                  <span className="text-right font-mono text-[9px] text-slate-gray">
                                    {variant.sku}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {technologyModel && (
                          <div className="relative overflow-hidden rounded-[18px] border border-champagne-gold/15 bg-midnight-navy p-5 text-soft-white shadow-[0_8px_24px_rgba(18,38,58,0.10)]">
                            <div className="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-champagne-gold/10 blur-[45px]" />

                            <div className="relative mb-4 flex items-center justify-between">
                              <div>
                                <p className="text-[7px] font-semibold uppercase tracking-[0.2em] text-premium-silver/45">
                                  Selected Option
                                </p>

                                <h4 className="mt-1.5 font-serif text-[1.1rem] font-normal text-soft-white">
                                  Technology
                                </h4>
                              </div>

                              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-champagne-gold/20 bg-soft-white/[0.05] text-champagne-gold">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth="1.5"
                                  stroke="currentColor"
                                  className="h-4 w-4"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M9 3v2.25M15 3v2.25M9 18.75V21m6-2.25V21M3 9h2.25M3 15h2.25M18.75 9H21m-2.25 6H21M7.5 5.25h9A2.25 2.25 0 0118.75 7.5v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9A2.25 2.25 0 017.5 5.25z"
                                  />
                                </svg>
                              </div>
                            </div>

                            <div className="relative space-y-3">
                              {technologyType && (
                                <div className="flex justify-between gap-4 border-b border-soft-white/10 pb-2.5">
                                  <span className="text-[9px] text-premium-silver/50">
                                    Type
                                  </span>

                                  <span className="text-right text-[9px] font-semibold text-soft-white">
                                    {technologyType}
                                  </span>
                                </div>
                              )}

                              {technologyName && (
                                <div className="flex justify-between gap-4 border-b border-soft-white/10 pb-2.5">
                                  <span className="text-[9px] text-premium-silver/50">
                                    Model
                                  </span>

                                  <span className="text-right text-[9px] font-semibold text-soft-white">
                                    {technologyName}
                                  </span>
                                </div>
                              )}

                              <div className="flex justify-between gap-4">
                                <span className="text-[9px] text-premium-silver/50">
                                  Extra Price
                                </span>

                                <span className="text-right text-[9px] font-semibold text-champagne-gold">
                                  {technologyPrice > 0
                                    ? `+ ${technologyPrice.toLocaleString()} EGP`
                                    : "Included"}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-4 border-t border-light-champagne/80 bg-soft-white/90 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[9px]">
                          <div>
                            <span className="text-steel-gray">Base Price</span>

                            <span className="ml-2 font-semibold text-midnight-navy">
                              {basePrice.toLocaleString()} EGP
                            </span>
                          </div>

                          {technologyPrice > 0 && (
                            <div>
                              <span className="text-steel-gray">
                                Technology
                              </span>

                              <span className="ml-2 font-semibold text-antique-gold">
                                + {technologyPrice.toLocaleString()} EGP
                              </span>
                            </div>
                          )}

                          <div>
                            <span className="text-steel-gray">Quantity</span>

                            <span className="ml-2 font-semibold text-midnight-navy">
                              × {quantity}
                            </span>
                          </div>
                        </div>

                        <div className="text-left sm:text-right">
                          <p className="text-[7px] font-semibold uppercase tracking-[0.15em] text-steel-gray">
                            Total
                          </p>

                          <p className="mt-1 font-serif text-[1.2rem] font-normal text-midnight-navy">
                            {itemTotal.toLocaleString()}{" "}
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

              <div className="relative border-b border-light-champagne/80 px-6 py-5 sm:px-8 sm:py-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-midnight-navy text-[9px] font-semibold tracking-[0.08em] text-champagne-gold shadow-[0_8px_20px_rgba(18,38,58,0.14)]">
                    02
                  </div>

                  <div>
                    <h2 className="font-serif text-[1.45rem] font-normal text-midnight-navy">
                      Shipping Information
                    </h2>

                    <p className="mt-1 text-[9px] uppercase tracking-[0.12em] text-steel-gray">
                      Enter your delivery details
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative px-6 py-6 sm:px-8 sm:py-8">
                {error && (
                  <div className="mb-6 rounded-[14px] border border-antique-gold/25 bg-soft-cream px-4 py-3 text-[11px] leading-6 text-antique-gold">
                    {error}
                  </div>
                )}

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="mb-2.5 block text-[8px] font-semibold uppercase tracking-[0.17em] text-midnight-navy"
                    >
                      First Name
                    </label>

                    <input
                      id="firstName"
                      name="firstName"
                      value={formValues.firstName}
                      onChange={handleChange}
                      placeholder="Enter your first name"
                      className="h-[52px] w-full rounded-[14px] border border-light-champagne bg-warm-ivory/65 px-4 text-[12px] text-midnight-navy outline-none transition-all duration-300 placeholder:text-steel-gray/70 hover:border-champagne-gold/60 hover:bg-soft-white focus:border-classic-gold focus:bg-soft-white focus:shadow-[0_0_0_4px_rgba(201,162,77,0.08)]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="lastName"
                      className="mb-2.5 block text-[8px] font-semibold uppercase tracking-[0.17em] text-midnight-navy"
                    >
                      Last Name
                    </label>

                    <input
                      id="lastName"
                      name="lastName"
                      value={formValues.lastName}
                      onChange={handleChange}
                      placeholder="Enter your last name"
                      className="h-[52px] w-full rounded-[14px] border border-light-champagne bg-warm-ivory/65 px-4 text-[12px] text-midnight-navy outline-none transition-all duration-300 placeholder:text-steel-gray/70 hover:border-champagne-gold/60 hover:bg-soft-white focus:border-classic-gold focus:bg-soft-white focus:shadow-[0_0_0_4px_rgba(201,162,77,0.08)]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="phone"
                      className="mb-2.5 block text-[8px] font-semibold uppercase tracking-[0.17em] text-midnight-navy"
                    >
                      Phone Number
                    </label>

                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formValues.phone}
                      onChange={handleChange}
                      placeholder="Enter your phone number"
                      className="h-[52px] w-full rounded-[14px] border border-light-champagne bg-warm-ivory/65 px-4 text-[12px] text-midnight-navy outline-none transition-all duration-300 placeholder:text-steel-gray/70 hover:border-champagne-gold/60 hover:bg-soft-white focus:border-classic-gold focus:bg-soft-white focus:shadow-[0_0_0_4px_rgba(201,162,77,0.08)]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="address"
                      className="mb-2.5 block text-[8px] font-semibold uppercase tracking-[0.17em] text-midnight-navy"
                    >
                      Delivery Address
                    </label>

                    <textarea
                      id="address"
                      name="address"
                      rows="4"
                      value={formValues.address}
                      onChange={handleChange}
                      placeholder="Street, building number, apartment..."
                      className="w-full resize-none rounded-[14px] border border-light-champagne bg-warm-ivory/65 px-4 py-3.5 text-[12px] leading-6 text-midnight-navy outline-none transition-all duration-300 placeholder:text-steel-gray/70 hover:border-champagne-gold/60 hover:bg-soft-white focus:border-classic-gold focus:bg-soft-white focus:shadow-[0_0_0_4px_rgba(201,162,77,0.08)]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="city"
                      className="mb-2.5 block text-[8px] font-semibold uppercase tracking-[0.17em] text-midnight-navy"
                    >
                      City
                    </label>

                    <input
                      id="city"
                      name="city"
                      value={formValues.city}
                      onChange={handleChange}
                      placeholder="Enter your city"
                      className="h-[52px] w-full rounded-[14px] border border-light-champagne bg-warm-ivory/65 px-4 text-[12px] text-midnight-navy outline-none transition-all duration-300 placeholder:text-steel-gray/70 hover:border-champagne-gold/60 hover:bg-soft-white focus:border-classic-gold focus:bg-soft-white focus:shadow-[0_0_0_4px_rgba(201,162,77,0.08)]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="country"
                      className="mb-2.5 block text-[8px] font-semibold uppercase tracking-[0.17em] text-midnight-navy"
                    >
                      Country
                    </label>

                    <input
                      id="country"
                      name="country"
                      value={formValues.country}
                      onChange={handleChange}
                      className="h-[52px] w-full rounded-[14px] border border-light-champagne bg-warm-ivory/65 px-4 text-[12px] text-midnight-navy outline-none transition-all duration-300 hover:border-champagne-gold/60 hover:bg-soft-white focus:border-classic-gold focus:bg-soft-white focus:shadow-[0_0_0_4px_rgba(201,162,77,0.08)]"
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="relative overflow-hidden rounded-[26px] border border-light-champagne/90 bg-soft-white/85 shadow-[0_12px_38px_rgba(7,19,31,0.045)] backdrop-blur-sm">
              <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-soft-cream blur-[70px]" />

              <div className="relative border-b border-light-champagne/80 px-6 py-5 sm:px-8 sm:py-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-midnight-navy text-[9px] font-semibold tracking-[0.08em] text-champagne-gold shadow-[0_8px_20px_rgba(18,38,58,0.14)]">
                    03
                  </div>

                  <div>
                    <h2 className="font-serif text-[1.45rem] font-normal text-midnight-navy">
                      Payment Method
                    </h2>

                    <p className="mt-1 text-[9px] uppercase tracking-[0.12em] text-steel-gray">
                      Select your preferred payment method
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative p-6 sm:p-8">
                <label className="group flex cursor-pointer items-center gap-4 rounded-[18px] border border-light-champagne bg-warm-ivory/65 p-4 transition-all duration-300 hover:border-champagne-gold hover:bg-soft-white hover:shadow-[0_10px_26px_rgba(7,19,31,0.045)]">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash_on_delivery"
                    checked={formValues.paymentMethod === "cash_on_delivery"}
                    onChange={handleChange}
                    className="h-4 w-4 accent-[#12263A]"
                  />

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-soft-cream text-midnight-navy transition-colors duration-300 group-hover:bg-midnight-navy group-hover:text-champagne-gold">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="h-5 w-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 8.25h19.5M2.25 9.75h19.5M4.5 15.75h3m-3 0a2.25 2.25 0 01-2.25-2.25V6.75A2.25 2.25 0 014.5 4.5h15a2.25 2.25 0 012.25 2.25v6.75a2.25 2.25 0 01-2.25 2.25h-15z"
                      />
                    </svg>
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
                  <div className="flex justify-between text-[11px]">
                    <span className="text-premium-silver/60">Items</span>

                    <span className="font-semibold text-soft-white">
                      {items.length}
                    </span>
                  </div>

                  <div className="flex justify-between text-[11px]">
                    <span className="text-premium-silver/60">Subtotal</span>

                    <span className="font-semibold text-soft-white">
                      {subtotal.toLocaleString()} EGP
                    </span>
                  </div>

                  <div className="flex justify-between text-[11px]">
                    <span className="text-premium-silver/60">Shipping</span>

                    <span className="font-semibold text-champagne-gold">
                      {shippingCost === 0
                        ? "Free"
                        : `${shippingCost.toLocaleString()} EGP`}
                    </span>
                  </div>
                </div>

                <div className="my-7 h-px bg-soft-white/10" />

                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[7px] font-semibold uppercase tracking-[0.24em] text-premium-silver/45">
                      Total Amount
                    </p>

                    <p className="mt-2 font-serif text-[2.3rem] italic font-normal leading-none text-champagne-gold">
                      {total.toLocaleString()}

                      <span className="ml-2 font-sans text-[8px] font-semibold not-italic uppercase tracking-[0.08em] text-premium-silver/55">
                        EGP
                      </span>
                    </p>
                  </div>

                  <span className="mb-1 text-[11px] text-classic-gold">✦</span>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="group mt-8 flex min-h-[56px] w-full items-center justify-center rounded-[13px] bg-soft-white px-6 text-[9px] font-semibold uppercase tracking-[0.12em] text-midnight-navy shadow-[0_14px_32px_rgba(0,0,0,0.16)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-warm-ivory hover:shadow-[0_18px_38px_rgba(0,0,0,0.22)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  {submitting ? (
                    <span className="flex items-center gap-3">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-midnight-navy/20 border-t-midnight-navy" />
                      Placing Order...
                    </span>
                  ) : (
                    <span className="flex items-center gap-7">
                      Place Order
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.8"
                        stroke="currentColor"
                        className="h-4 w-4 text-classic-gold transition-transform duration-300 group-hover:translate-x-1"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                        />
                      </svg>
                    </span>
                  )}
                </button>

                <div className="mt-5 flex items-start gap-3 rounded-[14px] border border-soft-white/10 bg-soft-white/[0.04] p-3.5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="mt-0.5 h-4 w-4 shrink-0 text-champagne-gold"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75L11.25 15 15 9.75m-3-7.5a9 9 0 110 18 9 9 0 010-18z"
                    />
                  </svg>

                  <p className="text-[9px] leading-5 text-premium-silver/55">
                    Your order details will be reviewed before it is processed.
                  </p>
                </div>

                <div className="mt-7 flex items-center justify-center gap-3 text-[7px] font-semibold uppercase tracking-[0.22em] text-premium-silver/30">
                  <span>Secure</span>

                  <span className="text-classic-gold/70">✦</span>

                  <span>Personal</span>

                  <span className="text-classic-gold/70">✦</span>

                  <span>Simple</span>
                </div>
              </div>
            </div>

            <Link
              to="/cart"
              className="group mt-4 flex min-h-[48px] items-center justify-center gap-3 rounded-[13px] border border-light-champagne bg-soft-white/75 text-[8px] font-semibold uppercase tracking-[0.14em] text-slate-gray shadow-[0_6px_18px_rgba(7,19,31,0.025)] backdrop-blur-sm transition-all duration-300 hover:border-champagne-gold hover:bg-soft-white hover:text-midnight-navy"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                />
              </svg>
              Continue Shopping
            </Link>
          </aside>
        </form>
      </div>
    </main>
  );
};

export default CheckoutPage;
