import { Link, useNavigate } from "react-router-dom";

import { useCart } from "../../../context/CartContext";

const getBackendOrigin = () => {
  const explicitBackend =
    import.meta.env.VITE_BACKEND_URL;

  if (explicitBackend) {
    return String(explicitBackend).replace(/\/+$/, "");
  }

  const apiUrl =
    import.meta.env.VITE_API_URL;

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

const API_URL = getBackendOrigin();

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

  return `${API_URL}${image.startsWith("/") ? "" : "/"}${image}`;
};

const getCartItemImage = (item) => {
  const product =
    item?.product || {};

  const variant =
    item?.variant || {};

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
    const path =
      getFilePath(candidate);

    if (path) {
      return path;
    }
  }

  return "";
};

const CartPage = () => {
  const navigate = useNavigate();

  const {
    cart,
    isLoading,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const items =
    cart?.items || [];

  const subtotal = items.reduce(
    (total, item) => {
      const product =
        item.product || null;

      const variant =
        item.variant || null;

      const productTechnology =
        item.productTechnology ||
        null;

      const technologyModel =
        productTechnology?.technologyModel ||
        item.technologyModel ||
        null;

      const productPrice =
        Number(
          product?.price || 0,
        );

      const variantPrice =
        Number(
          variant?.price || 0,
        );

      const technologyPrice =
        Number(
          productTechnology?.extraPrice ||
            technologyModel?.extraPrice ||
            0,
        );

      const basePrice =
        variantPrice > 0
          ? variantPrice
          : productPrice;

      const finalUnitPrice =
        basePrice +
        technologyPrice;

      const quantity =
        Number(
          item.quantity || 0,
        );

      const itemTotal =
        finalUnitPrice *
        quantity;

      return total + itemTotal;
    },
    0,
  );

  if (isLoading) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-warm-ivory">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-soft-cream blur-[120px]" />

        <div className="flex min-h-screen items-center justify-center px-6">
          <div className="relative text-center">
            <div className="relative mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-champagne-gold/30 bg-midnight-navy text-lg text-champagne-gold shadow-[0_16px_36px_rgba(18,38,58,0.18)]">
              <span className="animate-pulse">
                ✦
              </span>
            </div>

            <p className="text-[9px] font-semibold uppercase tracking-[0.32em] text-slate-gray">
              Loading your cart
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-warm-ivory">
        <div className="pointer-events-none absolute -left-40 top-1/2 h-[440px] w-[440px] -translate-y-1/2 rounded-full bg-light-champagne/60 blur-[110px]" />

        <div className="pointer-events-none absolute -right-40 top-0 h-[440px] w-[440px] rounded-full bg-champagne-gold/10 blur-[110px]" />

        <div className="relative flex min-h-screen items-center justify-center px-6 py-20">
          <div className="w-full max-w-[720px]">
            <div className="relative overflow-hidden rounded-[30px] border border-champagne-gold/15 bg-midnight-navy px-8 py-16 text-center shadow-[0_30px_80px_rgba(7,19,31,0.18)] sm:px-12 sm:py-20">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-rich-navy via-midnight-navy to-luxury-black" />

              <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full border border-champagne-gold/15" />

              <div className="pointer-events-none absolute -bottom-28 -left-24 h-64 w-64 rounded-full border border-champagne-gold/10" />

              <div className="pointer-events-none absolute left-1/2 top-1/2 h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-champagne-gold/10 blur-[90px]" />

              <div className="relative z-10">
                <div className="mb-7 flex items-center justify-center gap-4">
                  <span className="h-px w-10 bg-classic-gold/60" />

                  <span className="text-[9px] font-semibold uppercase tracking-[0.35em] text-champagne-gold">
                    Your Collection
                  </span>

                  <span className="h-px w-10 bg-classic-gold/60" />
                </div>

                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-champagne-gold/25 bg-soft-white/[0.05] text-xl text-champagne-gold shadow-[0_14px_35px_rgba(0,0,0,0.18)] backdrop-blur-sm">
                  ✦
                </div>

                <h1 className="mt-8 font-serif text-[2.7rem] font-normal leading-[1.02] tracking-[-0.035em] text-soft-white sm:text-[3.5rem]">
                  Your cart is

                  <span className="mt-1 block italic text-champagne-gold">
                    waiting for you.
                  </span>
                </h1>

                <p className="mx-auto mt-5 max-w-[450px] text-[13px] leading-7 text-premium-silver/75 sm:text-[14px]">
                  You haven't added anything yet. Explore our collection and
                  find something that feels like you.
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
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-warm-ivory text-midnight-navy">
      <div className="pointer-events-none fixed -left-48 top-1/3 h-[520px] w-[520px] rounded-full bg-light-champagne/55 blur-[130px]" />

      <div className="pointer-events-none fixed -right-48 top-0 h-[520px] w-[520px] rounded-full bg-champagne-gold/[0.07] blur-[130px]" />

      <div className="relative mx-auto max-w-[1360px] px-5 py-12 sm:px-8 lg:px-10 lg:py-16 xl:px-12">
        <div className="mb-12">
          <div className="mb-5 flex items-center gap-3">
            <span className="h-px w-10 bg-classic-gold/60" />

            <span className="text-[9px] font-semibold uppercase tracking-[0.34em] text-antique-gold">
              Your Selection
            </span>

            <span className="text-[8px] text-classic-gold">
              ✦
            </span>
          </div>

          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <h1 className="font-serif text-[3rem] font-normal leading-none tracking-[-0.045em] text-midnight-navy sm:text-[4rem] lg:text-[4.8rem]">
                Shopping
                <span className="ml-2 italic text-navy-soft">
                  Cart
                </span>
              </h1>

              <p className="mt-5 max-w-[560px] text-[13px] leading-7 text-slate-gray sm:text-[14px]">
                Review your selected pieces before completing your order.
              </p>
            </div>

            <div className="inline-flex w-fit items-center gap-3 rounded-full border border-light-champagne bg-soft-white/75 px-4 py-2.5 shadow-[0_6px_18px_rgba(7,19,31,0.04)] backdrop-blur-sm">
              <span className="font-serif text-[1.3rem] italic leading-none text-midnight-navy">
                {items.length}
              </span>

              <span className="text-[8px] font-semibold uppercase tracking-[0.22em] text-steel-gray">
                {items.length === 1
                  ? "Item"
                  : "Items"}
              </span>
            </div>
          </div>
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_370px] xl:gap-10">
          <div className="space-y-5">
            {items.map((item) => {
              const product =
                item.product || null;

              const variant =
                item.variant || null;

              const productTechnology =
                item.productTechnology ||
                null;

              const technologyModel =
                productTechnology?.technologyModel ||
                item.technologyModel ||
                null;

              const productPrice =
                Number(
                  product?.price ||
                    0,
                );

              const variantPrice =
                Number(
                  variant?.price ||
                    0,
                );

              const technologyPrice =
                Number(
                  productTechnology?.extraPrice ||
                    technologyModel?.extraPrice ||
                    0,
                );

              const basePrice =
                variantPrice > 0
                  ? variantPrice
                  : productPrice;

              const finalUnitPrice =
                basePrice +
                technologyPrice;

              const quantity =
                Number(
                  item.quantity ||
                    0,
                );

              const itemTotal =
                finalUnitPrice *
                quantity;

              const image =
                getCartItemImage(
                  item,
                );

              const imageUrl =
                getImageUrl(
                  image,
                );

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
                technologyModel
                  ?.technology
                  ?.name ||
                technologyModel
                  ?.technology
                  ?.title ||
                "";

              return (
                <div
                  key={item._id}
                  className="group relative overflow-hidden rounded-[26px] border border-light-champagne/90 bg-soft-white/85 p-5 shadow-[0_10px_35px_rgba(7,19,31,0.045)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-champagne-gold/55 hover:shadow-[0_20px_48px_rgba(7,19,31,0.08)] sm:p-6"
                >
                  <div className="pointer-events-none absolute -right-20 -top-20 h-44 w-44 rounded-full bg-soft-cream blur-[65px]" />

                  <div className="absolute bottom-0 left-0 top-0 w-[3px] bg-gradient-to-b from-champagne-gold via-classic-gold to-transparent" />

                  <div className="relative flex flex-col gap-6 sm:flex-row">
                    <Link
                      to={`/shop/products/${product?._id}`}
                      className="relative h-[210px] w-full shrink-0 overflow-hidden rounded-[18px] border border-light-champagne/70 bg-soft-cream sm:h-[175px] sm:w-[155px]"
                    >
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={
                            product?.name ||
                            "Product"
                          }
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[9px] uppercase tracking-[0.16em] text-steel-gray">
                          No Image
                        </div>
                      )}

                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-luxury-black/15 to-transparent" />
                    </Link>

                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <Link
                            to={`/shop/products/${product?._id}`}
                            className="block font-serif text-[1.55rem] font-normal leading-tight tracking-[-0.025em] text-midnight-navy transition-colors duration-300 hover:text-antique-gold"
                          >
                            {
                              product?.name
                            }
                          </Link>

                          <div className="mt-2.5 flex items-center gap-2">
                            <span className="h-px w-6 bg-classic-gold/60" />

                            <span className="text-[7px] font-semibold uppercase tracking-[0.22em] text-steel-gray">
                              Selected Piece
                            </span>
                          </div>

                          {variant && (
                            <div className="mt-5 rounded-[18px] border border-light-champagne/80 bg-warm-ivory/65 p-4">
                              <div className="mb-3 flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-midnight-navy text-[8px] text-champagne-gold">
                                  ✦
                                </div>

                                <div>
                                  <p className="text-[7px] font-semibold uppercase tracking-[0.18em] text-antique-gold">
                                    Variant
                                  </p>

                                  {variantName && (
                                    <p className="mt-0.5 text-[11px] font-semibold text-midnight-navy">
                                      {
                                        variantName
                                      }
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="grid gap-x-6 gap-y-2 text-[10px] text-slate-gray sm:grid-cols-2">
                                {variant.color && (
                                  <p>
                                    <span className="font-semibold text-midnight-navy">
                                      Color:
                                    </span>{" "}
                                    {
                                      variant.color
                                    }
                                  </p>
                                )}

                                {variant.size && (
                                  <p>
                                    <span className="font-semibold text-midnight-navy">
                                      Size:
                                    </span>{" "}
                                    {
                                      variant.size
                                    }
                                  </p>
                                )}

                                {variant.material && (
                                  <p>
                                    <span className="font-semibold text-midnight-navy">
                                      Material:
                                    </span>{" "}
                                    {
                                      variant.material
                                    }
                                  </p>
                                )}

                                {variant.finish && (
                                  <p>
                                    <span className="font-semibold text-midnight-navy">
                                      Finish:
                                    </span>{" "}
                                    {
                                      variant.finish
                                    }
                                  </p>
                                )}
                              </div>

                              {variant.sku && (
                                <p className="mt-3 border-t border-light-champagne/80 pt-3 text-[8px] uppercase tracking-[0.08em] text-steel-gray">
                                  SKU:{" "}
                                  {
                                    variant.sku
                                  }
                                </p>
                              )}

                              {variantPrice >
                                0 && (
                                <p className="mt-2 text-[10px] font-semibold text-midnight-navy">
                                  Variant
                                  Price:{" "}
                                  {variantPrice.toLocaleString()}{" "}
                                  EGP
                                </p>
                              )}
                            </div>
                          )}

                          {productTechnology && (
                            <div className="relative mt-3 overflow-hidden rounded-[18px] border border-champagne-gold/15 bg-midnight-navy p-4 text-soft-white shadow-[0_10px_25px_rgba(18,38,58,0.10)]">
                              <div className="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-champagne-gold/10 blur-[40px]" />

                              <div className="relative flex items-start justify-between gap-4">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-champagne-gold/25 bg-soft-white/[0.05] text-[8px] text-champagne-gold">
                                    ✦
                                  </div>

                                  <div>
                                    <p className="text-[7px] font-semibold uppercase tracking-[0.2em] text-champagne-gold">
                                      Technology
                                    </p>

                                    {technologyName && (
                                      <p className="mt-1 text-[11px] font-semibold text-soft-white">
                                        {
                                          technologyName
                                        }
                                      </p>
                                    )}
                                  </div>
                                </div>

                                <div className="text-right">
                                  <p className="text-[7px] uppercase tracking-[0.15em] text-premium-silver/45">
                                    Extra
                                  </p>

                                  <p className="mt-1 text-[11px] font-semibold text-champagne-gold">
                                    {technologyPrice.toLocaleString()}{" "}
                                    EGP
                                  </p>
                                </div>
                              </div>

                              {technologyType && (
                                <p className="relative mt-3 border-t border-soft-white/10 pt-3 text-[10px] text-premium-silver/70">
                                  <span className="font-semibold text-champagne-gold">
                                    Type:
                                  </span>{" "}
                                  {
                                    technologyType
                                  }
                                </p>
                              )}

                              {typeof productTechnology.isSelectable !==
                                "undefined" && (
                                <p className="relative mt-2 text-[10px] text-premium-silver/65">
                                  <span className="font-semibold text-champagne-gold">
                                    Selectable:
                                  </span>{" "}
                                  {productTechnology.isSelectable
                                    ? "Yes"
                                    : "No"}
                                </p>
                              )}

                              {typeof productTechnology.isDefault !==
                                "undefined" && (
                                <p className="relative mt-2 text-[10px] text-premium-silver/65">
                                  <span className="font-semibold text-champagne-gold">
                                    Default:
                                  </span>{" "}
                                  {productTechnology.isDefault
                                    ? "Yes"
                                    : "No"}
                                </p>
                              )}

                              {productTechnology.status && (
                                <p className="relative mt-2 text-[10px] text-premium-silver/65">
                                  <span className="font-semibold text-champagne-gold">
                                    Status:
                                  </span>{" "}
                                  {
                                    productTechnology.status
                                  }
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            removeFromCart(
                              item._id,
                            )
                          }
                          className="shrink-0 rounded-full border border-transparent px-2.5 py-1.5 text-[7px] font-semibold uppercase tracking-[0.15em] text-steel-gray transition-all duration-300 hover:border-antique-gold/20 hover:bg-soft-cream hover:text-antique-gold"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="mt-6 border-t border-light-champagne/80 pt-5">
                        <div className="grid gap-4 sm:grid-cols-3">
                          <div>
                            <p className="text-[7px] font-semibold uppercase tracking-[0.18em] text-steel-gray">
                              Base Price
                            </p>

                            <p className="mt-1.5 font-serif text-[1rem] font-normal text-midnight-navy">
                              {basePrice.toLocaleString()}{" "}
                              <span className="font-sans text-[7px] font-semibold uppercase tracking-[0.08em] text-slate-gray">
                                EGP
                              </span>
                            </p>
                          </div>

                          <div>
                            <p className="text-[7px] font-semibold uppercase tracking-[0.18em] text-steel-gray">
                              Technology
                            </p>

                            <p className="mt-1.5 font-serif text-[1rem] font-normal text-antique-gold">
                              {technologyPrice.toLocaleString()}{" "}
                              <span className="font-sans text-[7px] font-semibold uppercase tracking-[0.08em] text-slate-gray">
                                EGP
                              </span>
                            </p>
                          </div>

                          <div>
                            <p className="text-[7px] font-semibold uppercase tracking-[0.18em] text-steel-gray">
                              Unit Price
                            </p>

                            <p className="mt-1.5 font-serif text-[1rem] font-normal text-midnight-navy">
                              {finalUnitPrice.toLocaleString()}{" "}
                              <span className="font-sans text-[7px] font-semibold uppercase tracking-[0.08em] text-slate-gray">
                                EGP
                              </span>
                            </p>
                          </div>
                        </div>

                        <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                          <div>
                            <p className="text-[7px] font-semibold uppercase tracking-[0.18em] text-steel-gray">
                              Quantity
                            </p>

                            <div className="mt-2.5 flex w-fit items-center overflow-hidden rounded-full border border-light-champagne bg-soft-white shadow-[0_5px_16px_rgba(7,19,31,0.035)]">
                              <button
                                type="button"
                                disabled={
                                  quantity <=
                                  1
                                }
                                onClick={() =>
                                  updateQuantity(
                                    item._id,
                                    quantity -
                                      1,
                                  )
                                }
                                className="flex h-9 w-10 items-center justify-center text-[14px] text-midnight-navy transition-all duration-300 hover:bg-midnight-navy hover:text-soft-white disabled:cursor-not-allowed disabled:opacity-30"
                              >
                                −
                              </button>

                              <span className="flex h-9 min-w-10 items-center justify-center border-x border-light-champagne px-2 text-[10px] font-semibold text-midnight-navy">
                                {quantity}
                              </span>

                              <button
                                type="button"
                                onClick={() =>
                                  updateQuantity(
                                    item._id,
                                    quantity +
                                      1,
                                  )
                                }
                                className="flex h-9 w-10 items-center justify-center text-[14px] text-midnight-navy transition-all duration-300 hover:bg-midnight-navy hover:text-soft-white"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          <div className="sm:text-right">
                            <p className="text-[7px] font-semibold uppercase tracking-[0.18em] text-steel-gray">
                              Item Total
                            </p>

                            <p className="mt-1 font-serif text-[1.65rem] font-normal tracking-[-0.02em] text-midnight-navy">
                              {itemTotal.toLocaleString()}

                              <span className="ml-1.5 font-sans text-[8px] font-semibold uppercase tracking-[0.08em] text-slate-gray">
                                EGP
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={clearCart}
                className="group flex items-center gap-2.5 text-[8px] font-semibold uppercase tracking-[0.2em] text-steel-gray transition-colors duration-300 hover:text-antique-gold"
              >
                <span className="h-px w-5 bg-current transition-all duration-300 group-hover:w-8" />

                Clear Cart
              </button>
            </div>
          </div>

          <aside className="relative overflow-hidden rounded-[26px] border border-champagne-gold/15 bg-midnight-navy p-6 text-soft-white shadow-[0_25px_65px_rgba(7,19,31,0.18)] lg:sticky lg:top-28 sm:p-7">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-rich-navy via-midnight-navy to-luxury-black" />

            <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full border border-champagne-gold/15" />

            <div className="pointer-events-none absolute -bottom-28 -left-24 h-56 w-56 rounded-full border border-champagne-gold/10" />

            <div className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-champagne-gold/10 blur-[90px]" />

            <div className="relative z-10">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-champagne-gold/25 bg-soft-white/[0.05] text-[12px] text-champagne-gold">
                  ✦
                </div>

                <div>
                  <p className="text-[7px] font-semibold uppercase tracking-[0.3em] text-champagne-gold">
                    Your Order
                  </p>

                  <h2 className="mt-1 font-serif text-[1.35rem] font-normal text-soft-white">
                    Order Summary
                  </h2>
                </div>
              </div>

              <div className="my-7 h-px bg-soft-white/10" />

              <div className="space-y-5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-premium-silver/60">
                    Subtotal
                  </span>

                  <span className="font-semibold text-soft-white">
                    {subtotal.toLocaleString()}{" "}
                    EGP
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-premium-silver/60">
                    Shipping
                  </span>

                  <span className="font-semibold text-champagne-gold">
                    Free
                  </span>
                </div>
              </div>

              <div className="my-7 h-px bg-soft-white/10" />

              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-[7px] font-semibold uppercase tracking-[0.25em] text-premium-silver/45">
                    Total
                  </p>

                  <p className="mt-2 font-serif text-[2.15rem] italic font-normal leading-none text-champagne-gold">
                    {subtotal.toLocaleString()}

                    <span className="ml-2 font-sans text-[8px] font-semibold not-italic uppercase tracking-[0.08em] text-premium-silver/55">
                      EGP
                    </span>
                  </p>
                </div>

                <span className="mb-1 text-[12px] text-classic-gold">
                  ✦
                </span>
              </div>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/checkout",
                  )
                }
                className="group mt-8 flex min-h-[54px] w-full items-center justify-center gap-8 rounded-[13px] bg-soft-white px-6 text-[9px] font-semibold uppercase tracking-[0.12em] text-midnight-navy shadow-[0_14px_32px_rgba(0,0,0,0.16)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-warm-ivory hover:shadow-[0_18px_38px_rgba(0,0,0,0.22)]"
              >
                Proceed to Checkout

                <span className="text-[15px] text-classic-gold transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </button>

              <Link
                to="/shop"
                className="mt-5 block text-center text-[8px] font-semibold uppercase tracking-[0.2em] text-premium-silver/45 transition-colors duration-300 hover:text-champagne-gold"
              >
                Continue Shopping
              </Link>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-[7px] font-semibold uppercase tracking-[0.22em] text-premium-silver/30">
                <span>
                  Elegant
                </span>

                <span className="text-classic-gold/70">
                  ✦
                </span>

                <span>
                  Personal
                </span>

                <span className="text-classic-gold/70">
                  ✦
                </span>

                <span>
                  Yours
                </span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
};

export default CartPage;