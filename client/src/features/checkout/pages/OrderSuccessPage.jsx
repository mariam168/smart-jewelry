import { Link, useLocation, useParams } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.replace("/api", "") 
  : "http://localhost:5000";

const getImageUrl = (image) => {
  if (!image) {
    return "";
  }

  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  return `${API_URL}${image}`;
};

const formatPrice = (price) => {
  return Number(price || 0).toLocaleString();
};

const OrderSuccessPage = () => {
  const { orderId } = useParams();

  const location = useLocation();

  const order = location.state?.order;

  const items = order?.items || [];

  const subtotal = Number(order?.subtotal ?? order?.itemsPrice ?? 0);

  const shipping = Number(order?.shippingPrice ?? order?.shippingCost ?? 0);

  const tax = Number(order?.taxPrice ?? order?.tax ?? 0);

  const total = Number(
    order?.total ?? order?.totalPrice ?? subtotal + shipping + tax,
  );

  const shippingAddress = order?.shippingAddress || {};

  const paymentMethod = order?.paymentMethod || "cash_on_delivery";

  const orderStatus = order?.status || "pending";

  return (
    <main className="relative min-h-screen overflow-hidden bg-warm-ivory px-4 py-10 text-midnight-navy sm:px-6 lg:px-8 lg:py-14">
      <div className="pointer-events-none fixed -left-48 top-1/3 h-[520px] w-[520px] rounded-full bg-light-champagne/55 blur-[130px]" />

      <div className="pointer-events-none fixed -right-48 top-0 h-[520px] w-[520px] rounded-full bg-champagne-gold/[0.07] blur-[130px]" />

      <div className="relative mx-auto max-w-[1360px]">
        <section className="relative overflow-hidden rounded-[30px] border border-champagne-gold/15 bg-midnight-navy shadow-[0_30px_80px_rgba(7,19,31,0.17)]">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-rich-navy via-midnight-navy to-luxury-black" />

          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border border-champagne-gold/15" />

          <div className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full border border-champagne-gold/10" />

          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-champagne-gold/[0.08] blur-[100px]" />

          <div className="relative px-6 py-12 text-center sm:px-10 sm:py-16">
            <div className="mb-7 flex items-center justify-center gap-4">
              <span className="h-px w-10 bg-classic-gold/55" />

              <span className="text-[8px] font-semibold uppercase tracking-[0.34em] text-champagne-gold">
                Order Confirmed
              </span>

              <span className="h-px w-10 bg-classic-gold/55" />
            </div>

            <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-champagne-gold/30 bg-soft-white/[0.06] shadow-[0_15px_38px_rgba(0,0,0,0.16)] backdrop-blur-sm">
              <div className="absolute inset-2 rounded-full border border-champagne-gold/15" />

              <span className="relative text-[2rem] font-light text-champagne-gold">
                ✓
              </span>
            </div>

            <h1 className="mt-8 font-serif text-[2.7rem] font-normal leading-[1.02] tracking-[-0.04em] text-soft-white sm:text-[3.7rem] lg:text-[4.2rem]">
              Order Placed
              <span className="ml-2 italic text-champagne-gold">
                Successfully.
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-[620px] text-[13px] leading-7 text-premium-silver/70 sm:text-[14px]">
              Thank you for your order. Your order has been received
              successfully and is now being processed.
            </p>

            {order?.orderNumber && (
              <div className="mx-auto mt-8 inline-flex flex-col items-center rounded-[18px] border border-champagne-gold/20 bg-soft-white/[0.05] px-8 py-4 backdrop-blur-md">
                <span className="text-[7px] font-semibold uppercase tracking-[0.24em] text-premium-silver/50">
                  Order Number
                </span>

                <span className="mt-1.5 font-serif text-[1.3rem] font-normal tracking-[0.06em] text-champagne-gold">
                  {order.orderNumber}
                </span>
              </div>
            )}
          </div>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="relative overflow-hidden rounded-[20px] border border-light-champagne/90 bg-soft-white/85 p-5 shadow-[0_8px_24px_rgba(7,19,31,0.04)] backdrop-blur-sm">
            <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-soft-cream blur-[40px]" />

            <div className="relative">
              <p className="text-[7px] font-semibold uppercase tracking-[0.2em] text-steel-gray">
                Order Status
              </p>

              <div className="mt-3 flex items-center gap-2.5">
                <span className="h-2 w-2 rounded-full bg-classic-gold shadow-[0_0_0_4px_rgba(201,162,77,0.10)]" />

                <span className="text-[12px] font-semibold capitalize text-midnight-navy">
                  {String(orderStatus).replaceAll("_", " ")}
                </span>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[20px] border border-light-champagne/90 bg-soft-white/85 p-5 shadow-[0_8px_24px_rgba(7,19,31,0.04)] backdrop-blur-sm">
            <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-soft-cream blur-[40px]" />

            <div className="relative">
              <p className="text-[7px] font-semibold uppercase tracking-[0.2em] text-steel-gray">
                Payment Method
              </p>

              <p className="mt-3 text-[12px] font-semibold capitalize text-midnight-navy">
                {paymentMethod === "cash_on_delivery"
                  ? "Cash on Delivery"
                  : String(paymentMethod).replaceAll("_", " ")}
              </p>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[20px] border border-light-champagne/90 bg-soft-white/85 p-5 shadow-[0_8px_24px_rgba(7,19,31,0.04)] backdrop-blur-sm">
            <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-soft-cream blur-[40px]" />

            <div className="relative">
              <p className="text-[7px] font-semibold uppercase tracking-[0.2em] text-steel-gray">
                Order Total
              </p>

              <p className="mt-2 font-serif text-[1.6rem] font-normal text-midnight-navy">
                {formatPrice(total)}{" "}
                <span className="font-sans text-[8px] font-semibold uppercase tracking-[0.08em] text-slate-gray">
                  EGP
                </span>
              </p>
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_370px]">
          <section className="relative overflow-hidden rounded-[26px] border border-light-champagne/90 bg-soft-white/85 shadow-[0_12px_38px_rgba(7,19,31,0.045)] backdrop-blur-sm">
            <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-soft-cream blur-[75px]" />

            <div className="relative flex items-center justify-between border-b border-light-champagne/80 px-6 py-5 sm:px-7 sm:py-6">
              <div>
                <div className="flex items-center gap-3">
                  <span className="h-px w-8 bg-classic-gold/60" />

                  <span className="text-[7px] font-semibold uppercase tracking-[0.22em] text-antique-gold">
                    Your Order
                  </span>
                </div>

                <h2 className="mt-2 font-serif text-[1.55rem] font-normal text-midnight-navy">
                  Order Items
                </h2>

                <p className="mt-1 text-[10px] text-slate-gray">
                  {items.length} {items.length === 1 ? "item" : "items"} in your
                  order
                </p>
              </div>

              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-soft-cream text-[9px] text-classic-gold">
                ✦
              </span>
            </div>

            <div className="relative divide-y divide-light-champagne/75">
              {items.length > 0 ? (
                items.map((item) => {
                  const product = item.product || null;

                  const variant = item.variant || null;

                  const productTechnology = item.productTechnology || null;

                  const technologyModel =
                    productTechnology?.technologyModel ||
                    item.technologyModel ||
                    null;

                  const technology = technologyModel?.technology || null;

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

                  const quantity = Number(item.quantity || 1);

                  const itemTotal = unitPrice * quantity;

                  const image =
                    variant?.image ||
                    product?.primaryImage ||
                    product?.image ||
                    product?.images?.[0] ||
                    "";

                  const imageUrl = getImageUrl(image);

                  const variantName =
                    variant?.name ||
                    [variant?.color, variant?.size].filter(Boolean).join(" / ");

                  const technologyName =
                    technologyModel?.modelName || technologyModel?.name || "";

                  const technologyType =
                    technology?.name || technology?.title || "";

                  return (
                    <div key={item._id} className="px-5 py-6 sm:px-7 sm:py-7">
                      <div className="flex flex-col gap-5 sm:flex-row">
                        <Link
                          to={`/shop/products/${product?._id}`}
                          className="group relative h-[210px] w-full shrink-0 overflow-hidden rounded-[18px] border border-light-champagne/75 bg-soft-cream sm:h-[132px] sm:w-[132px]"
                        >
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={product?.name || "Product"}
                              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[8px] uppercase tracking-[0.16em] text-steel-gray">
                              No Image
                            </div>
                          )}

                          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-luxury-black/10 to-transparent" />
                        </Link>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col justify-between gap-3 sm:flex-row">
                            <div>
                              <Link
                                to={`/shop/products/${product?._id}`}
                                className="font-serif text-[1.45rem] font-normal leading-tight tracking-[-0.02em] text-midnight-navy transition-colors duration-300 hover:text-antique-gold"
                              >
                                {product?.name || "Product"}
                              </Link>

                              <p className="mt-2 text-[9px] text-slate-gray">
                                Quantity:{" "}
                                <span className="font-semibold text-midnight-navy">
                                  {quantity}
                                </span>
                              </p>
                            </div>

                            <div className="text-left sm:text-right">
                              <p className="text-[7px] font-semibold uppercase tracking-[0.15em] text-steel-gray">
                                Item Total
                              </p>

                              <p className="mt-1 font-serif text-[1.25rem] font-normal text-midnight-navy">
                                {formatPrice(itemTotal)}{" "}
                                <span className="font-sans text-[7px] font-semibold uppercase text-slate-gray">
                                  EGP
                                </span>
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 grid gap-4 md:grid-cols-2">
                        {variant && (
                          <div className="rounded-[18px] border border-light-champagne/85 bg-warm-ivory/65 p-4">
                            <div className="flex items-center justify-between gap-4">
                              <div>
                                <p className="text-[7px] font-semibold uppercase tracking-[0.18em] text-steel-gray">
                                  Selected Option
                                </p>

                                <h3 className="mt-1 font-serif text-[1.1rem] font-normal text-midnight-navy">
                                  Product Variant
                                </h3>
                              </div>

                              <span className="rounded-full border border-champagne-gold/25 bg-soft-white/80 px-3 py-1 text-[7px] font-semibold uppercase tracking-[0.12em] text-antique-gold">
                                Selected
                              </span>
                            </div>

                            <div className="mt-4 space-y-2.5">
                              {variantName && (
                                <div className="flex justify-between gap-3 border-b border-light-champagne/70 pb-2">
                                  <span className="text-[9px] text-steel-gray">
                                    Name
                                  </span>

                                  <span className="text-right text-[9px] font-semibold text-midnight-navy">
                                    {variantName}
                                  </span>
                                </div>
                              )}

                              {variant.color && (
                                <div className="flex justify-between gap-3 border-b border-light-champagne/70 pb-2">
                                  <span className="text-[9px] text-steel-gray">
                                    Color
                                  </span>

                                  <span className="text-[9px] font-semibold text-midnight-navy">
                                    {variant.color}
                                  </span>
                                </div>
                              )}

                              {variant.size && (
                                <div className="flex justify-between gap-3 border-b border-light-champagne/70 pb-2">
                                  <span className="text-[9px] text-steel-gray">
                                    Size
                                  </span>

                                  <span className="text-[9px] font-semibold text-midnight-navy">
                                    {variant.size}
                                  </span>
                                </div>
                              )}

                              {variant.material && (
                                <div className="flex justify-between gap-3 border-b border-light-champagne/70 pb-2">
                                  <span className="text-[9px] text-steel-gray">
                                    Material
                                  </span>

                                  <span className="text-[9px] font-semibold text-midnight-navy">
                                    {variant.material}
                                  </span>
                                </div>
                              )}

                              {variant.finish && (
                                <div className="flex justify-between gap-3 border-b border-light-champagne/70 pb-2">
                                  <span className="text-[9px] text-steel-gray">
                                    Finish
                                  </span>

                                  <span className="text-[9px] font-semibold text-midnight-navy">
                                    {variant.finish}
                                  </span>
                                </div>
                              )}

                              {variant.sku && (
                                <div className="flex justify-between gap-3">
                                  <span className="text-[9px] text-steel-gray">
                                    SKU
                                  </span>

                                  <span className="font-mono text-[8px] text-slate-gray">
                                    {variant.sku}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {technologyModel && (
                          <div className="relative overflow-hidden rounded-[18px] border border-champagne-gold/15 bg-midnight-navy p-4 text-soft-white shadow-[0_8px_24px_rgba(18,38,58,0.10)]">
                            <div className="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-champagne-gold/10 blur-[45px]" />

                            <div className="relative flex items-center justify-between gap-4">
                              <div>
                                <p className="text-[7px] font-semibold uppercase tracking-[0.18em] text-premium-silver/45">
                                  Selected Option
                                </p>

                                <h3 className="mt-1 font-serif text-[1.1rem] font-normal text-soft-white">
                                  Technology
                                </h3>
                              </div>

                              <span className="rounded-full border border-champagne-gold/20 bg-soft-white/[0.05] px-3 py-1 text-[7px] font-semibold uppercase tracking-[0.12em] text-champagne-gold">
                                Selected
                              </span>
                            </div>

                            <div className="relative mt-4 space-y-2.5">
                              {technologyType && (
                                <div className="flex justify-between gap-3 border-b border-soft-white/10 pb-2">
                                  <span className="text-[9px] text-premium-silver/50">
                                    Type
                                  </span>

                                  <span className="text-[9px] font-semibold text-soft-white">
                                    {technologyType}
                                  </span>
                                </div>
                              )}

                              {technologyName && (
                                <div className="flex justify-between gap-3 border-b border-soft-white/10 pb-2">
                                  <span className="text-[9px] text-premium-silver/50">
                                    Model
                                  </span>

                                  <span className="text-right text-[9px] font-semibold text-soft-white">
                                    {technologyName}
                                  </span>
                                </div>
                              )}

                              <div className="flex justify-between gap-3 border-t border-soft-white/10 pt-2">
                                <span className="text-[9px] text-premium-silver/50">
                                  Extra Price
                                </span>

                                <span className="text-[9px] font-semibold text-champagne-gold">
                                  {technologyPrice > 0
                                    ? `${formatPrice(technologyPrice)} EGP`
                                    : "Included"}
                                </span>
                              </div>

                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {technologyModel.requiresBattery && (
                                  <span className="inline-flex rounded-full border border-champagne-gold/20 bg-champagne-gold/10 px-2.5 py-1 text-[7px] font-semibold uppercase tracking-[0.08em] text-champagne-gold">
                                    Battery
                                  </span>
                                )}

                                {technologyModel.requiresActivation && (
                                  <span className="inline-flex rounded-full border border-soft-white/10 bg-soft-white/[0.05] px-2.5 py-1 text-[7px] font-semibold uppercase tracking-[0.08em] text-premium-silver/70">
                                    Activation
                                  </span>
                                )}

                                {technologyModel.requiresSubscription && (
                                  <span className="inline-flex rounded-full border border-soft-white/10 bg-soft-white/[0.05] px-2.5 py-1 text-[7px] font-semibold uppercase tracking-[0.08em] text-premium-silver/70">
                                    Subscription
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="mt-5 rounded-[16px] border border-light-champagne/75 bg-soft-white/80 p-4">
                        <div className="grid gap-4 sm:grid-cols-3">
                          <div>
                            <p className="text-[7px] font-semibold uppercase tracking-[0.15em] text-steel-gray">
                              Base Price
                            </p>

                            <p className="mt-1 font-serif text-[1rem] font-normal text-midnight-navy">
                              {formatPrice(basePrice)}{" "}
                              <span className="font-sans text-[7px] font-semibold uppercase text-slate-gray">
                                EGP
                              </span>
                            </p>
                          </div>

                          <div>
                            <p className="text-[7px] font-semibold uppercase tracking-[0.15em] text-steel-gray">
                              Technology Extra
                            </p>

                            <p className="mt-1 font-serif text-[1rem] font-normal text-antique-gold">
                              {technologyPrice > 0
                                ? `+${formatPrice(technologyPrice)} EGP`
                                : "Included"}
                            </p>
                          </div>

                          <div>
                            <p className="text-[7px] font-semibold uppercase tracking-[0.15em] text-steel-gray">
                              Unit Price
                            </p>

                            <p className="mt-1 font-serif text-[1rem] font-normal text-midnight-navy">
                              {formatPrice(unitPrice)}{" "}
                              <span className="font-sans text-[7px] font-semibold uppercase text-slate-gray">
                                EGP
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="px-6 py-12 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-soft-cream text-[10px] text-classic-gold">
                    ✦
                  </div>

                  <p className="mt-4 text-[11px] text-slate-gray">
                    No order items found.
                  </p>
                </div>
              )}
            </div>
          </section>

          <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            <section className="relative overflow-hidden rounded-[26px] border border-champagne-gold/15 bg-midnight-navy p-6 text-soft-white shadow-[0_25px_65px_rgba(7,19,31,0.17)]">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-rich-navy via-midnight-navy to-luxury-black" />

              <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full border border-champagne-gold/15" />

              <div className="pointer-events-none absolute -bottom-24 -left-20 h-52 w-52 rounded-full border border-champagne-gold/10" />

              <div className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-champagne-gold/[0.08] blur-[90px]" />

              <div className="relative">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-champagne-gold/20 bg-soft-white/[0.05] text-[9px] text-champagne-gold">
                    ✦
                  </span>

                  <div>
                    <p className="text-[7px] font-semibold uppercase tracking-[0.24em] text-champagne-gold">
                      Your Order
                    </p>

                    <h2 className="mt-1 font-serif text-[1.35rem] font-normal text-soft-white">
                      Order Summary
                    </h2>
                  </div>
                </div>

                <div className="my-6 h-px bg-soft-white/10" />

                <div className="space-y-4">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-premium-silver/55">Subtotal</span>

                    <span className="font-semibold text-soft-white">
                      {formatPrice(subtotal)} EGP
                    </span>
                  </div>

                  <div className="flex justify-between text-[11px]">
                    <span className="text-premium-silver/55">Shipping</span>

                    <span className="font-semibold text-champagne-gold">
                      {shipping === 0 ? "Free" : `${formatPrice(shipping)} EGP`}
                    </span>
                  </div>

                  {tax > 0 && (
                    <div className="flex justify-between text-[11px]">
                      <span className="text-premium-silver/55">Tax</span>

                      <span className="font-semibold text-soft-white">
                        {formatPrice(tax)} EGP
                      </span>
                    </div>
                  )}
                </div>

                <div className="my-6 h-px bg-soft-white/10" />

                <div className="flex items-end justify-between gap-4">
                  <div>
                    <span className="text-[7px] font-semibold uppercase tracking-[0.22em] text-premium-silver/45">
                      Total
                    </span>

                    <p className="mt-2 font-serif text-[2.2rem] italic font-normal leading-none text-champagne-gold">
                      {formatPrice(total)}

                      <span className="ml-2 font-sans text-[8px] font-semibold not-italic uppercase tracking-[0.08em] text-premium-silver/55">
                        EGP
                      </span>
                    </p>
                  </div>

                  <span className="mb-1 text-[10px] text-classic-gold">✦</span>
                </div>
              </div>
            </section>

            <section className="relative overflow-hidden rounded-[26px] border border-light-champagne/90 bg-soft-white/85 p-6 shadow-[0_12px_38px_rgba(7,19,31,0.045)] backdrop-blur-sm">
              <div className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full bg-soft-cream blur-[50px]" />

              <div className="relative">
                <div className="flex items-center gap-3">
                  <span className="h-px w-8 bg-classic-gold/60" />

                  <p className="text-[7px] font-semibold uppercase tracking-[0.2em] text-antique-gold">
                    Delivery
                  </p>
                </div>

                <h2 className="mt-2 font-serif text-[1.35rem] font-normal text-midnight-navy">
                  Shipping Details
                </h2>

                {shippingAddress && Object.keys(shippingAddress).length > 0 ? (
                  <div className="mt-5 space-y-4">
                    {(shippingAddress.firstName ||
                      shippingAddress.lastName) && (
                      <div className="border-b border-light-champagne/70 pb-3">
                        <p className="text-[7px] font-semibold uppercase tracking-[0.14em] text-steel-gray">
                          Name
                        </p>

                        <p className="mt-1.5 text-[11px] font-semibold text-midnight-navy">
                          {shippingAddress.firstName} {shippingAddress.lastName}
                        </p>
                      </div>
                    )}

                    {shippingAddress.phone && (
                      <div className="border-b border-light-champagne/70 pb-3">
                        <p className="text-[7px] font-semibold uppercase tracking-[0.14em] text-steel-gray">
                          Phone
                        </p>

                        <p className="mt-1.5 text-[11px] font-semibold text-midnight-navy">
                          {shippingAddress.phone}
                        </p>
                      </div>
                    )}

                    {shippingAddress.address && (
                      <div className="border-b border-light-champagne/70 pb-3">
                        <p className="text-[7px] font-semibold uppercase tracking-[0.14em] text-steel-gray">
                          Address
                        </p>

                        <p className="mt-1.5 text-[11px] leading-6 text-slate-gray">
                          {shippingAddress.address}
                        </p>
                      </div>
                    )}

                    {shippingAddress.city && (
                      <div className="border-b border-light-champagne/70 pb-3">
                        <p className="text-[7px] font-semibold uppercase tracking-[0.14em] text-steel-gray">
                          City
                        </p>

                        <p className="mt-1.5 text-[11px] font-semibold text-midnight-navy">
                          {shippingAddress.city}
                        </p>
                      </div>
                    )}

                    {shippingAddress.country && (
                      <div>
                        <p className="text-[7px] font-semibold uppercase tracking-[0.14em] text-steel-gray">
                          Country
                        </p>

                        <p className="mt-1.5 text-[11px] font-semibold text-midnight-navy">
                          {shippingAddress.country}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="mt-4 text-[11px] leading-6 text-slate-gray">
                    Shipping information is not available.
                  </p>
                )}
              </div>
            </section>
          </aside>
        </div>

        <section className="relative mt-6 overflow-hidden rounded-[24px] border border-light-champagne/90 bg-soft-white/80 p-5 shadow-[0_10px_30px_rgba(7,19,31,0.035)] backdrop-blur-sm sm:p-6">
          <div className="pointer-events-none absolute left-1/2 top-0 h-32 w-96 -translate-x-1/2 rounded-full bg-soft-cream blur-[60px]" />

          <div className="relative flex flex-col gap-3 sm:flex-row">
            <Link
              to={`/account/orders/${orderId}`}
              className="group flex min-h-[52px] flex-1 items-center justify-center gap-7 rounded-[13px] bg-midnight-navy px-6 text-[9px] font-semibold uppercase tracking-[0.12em] text-soft-white shadow-[0_12px_28px_rgba(18,38,58,0.15)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-rich-navy hover:shadow-[0_16px_35px_rgba(18,38,58,0.21)]"
            >
              View Full Order
              <span className="text-[14px] text-champagne-gold transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </Link>

            <Link
              to="/shop"
              className="group flex min-h-[52px] flex-1 items-center justify-center gap-7 rounded-[13px] border border-light-champagne bg-warm-ivory/70 px-6 text-[9px] font-semibold uppercase tracking-[0.12em] text-midnight-navy transition-all duration-300 hover:-translate-y-0.5 hover:border-champagne-gold hover:bg-soft-white"
            >
              Continue Shopping
              <span className="text-[14px] text-classic-gold transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>
        </section>

        <div className="mt-8 pb-4 text-center">
          <div className="mb-3 flex items-center justify-center gap-3">
            <span className="h-px w-7 bg-classic-gold/35" />

            <span className="text-[7px] text-classic-gold">✦</span>

            <span className="h-px w-7 bg-classic-gold/35" />
          </div>

          <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-steel-gray">
            Thank you for shopping with us. We appreciate your order.
          </p>
        </div>
      </div>
    </main>
  );
};

export default OrderSuccessPage;
