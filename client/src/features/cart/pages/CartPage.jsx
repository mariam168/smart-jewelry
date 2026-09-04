import { useState } from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { useCart } from "../../../context/CartContext";

const getBackendOrigin = () => {
  const explicitBackend =
    import.meta.env.VITE_BACKEND_URL;

  if (explicitBackend) {
    return String(
      explicitBackend,
    ).replace(/\/+$/, "");
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
    window.location.hostname !==
      "localhost" &&
    window.location.hostname !==
      "127.0.0.1"
  ) {
    return window.location.origin;
  }

  return "http://localhost:5000";
};

const API_URL =
  getBackendOrigin();

const getFilePath = (value) => {
  if (!value) {
    return "";
  }

  if (
    typeof value === "string"
  ) {
    return value.trim();
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const path =
        getFilePath(item);

      if (path) {
        return path;
      }
    }

    return "";
  }

  if (
    typeof value === "object"
  ) {
    return (
      getFilePath(
        value.imageUrl,
      ) ||
      getFilePath(value.url) ||
      getFilePath(value.path) ||
      getFilePath(value.src) ||
      getFilePath(value.image) ||
      getFilePath(value.file) ||
      getFilePath(
        value.filename,
      ) ||
      ""
    );
  }

  return "";
};

const getImageUrl = (value) => {
  let image =
    getFilePath(value);

  if (!image) {
    return "";
  }

  if (
    /^https?:\/\//i.test(
      image,
    ) ||
    image.startsWith("blob:") ||
    image.startsWith("data:")
  ) {
    return image;
  }

  if (image.startsWith("//")) {
    const protocol =
      typeof window !==
      "undefined"
        ? window.location
            .protocol
        : "https:";

    return `${protocol}${image}`;
  }

  if (
    image.startsWith(
      "/api/uploads/",
    )
  ) {
    image =
      image.replace(
        /^\/api/,
        "",
      );
  }

  if (
    image.startsWith(
      "/assets/",
    ) ||
    image.startsWith(
      "/images/",
    )
  ) {
    return image;
  }

  return `${API_URL}${
    image.startsWith("/")
      ? ""
      : "/"
  }${image}`;
};

const getCartItemImage = (
  item,
) => {
  const product =
    item?.product || {};

  const variant =
    item?.variant || {};

  const candidates = [
    item?.image,
    item?.imageUrl,

    variant?.image,
    variant?.imageUrl,
    variant?.primaryImage,

    product?.primaryImage,
    product?.image,
    product?.imageUrl,
    product?.images?.[0],
    product?.images,
  ];

  for (
    const candidate of candidates
  ) {
    const path =
      getFilePath(candidate);

    if (path) {
      return path;
    }
  }

  return "";
};

const getCartItemPricing = (
  item,
) => {
  const product =
    item?.product || null;

  const variant =
    item?.variant || null;

  const productTechnology =
    item?.productTechnology ||
    null;

  const technologyModel =
    productTechnology
      ?.technologyModel ||
    item?.technologyModel ||
    null;

  const productPrice =
    Number(
      product?.price || 0,
    );

  const productComparePrice =
    Number(
      product?.comparePrice ||
        0,
    );

  const variantPrice =
    Number(
      variant?.price || 0,
    );

  const variantComparePrice =
    Number(
      variant?.compareAtPrice ||
        0,
    );

  const technologyPrice =
    Number(
      productTechnology
        ?.extraPrice ??
        technologyModel
          ?.extraPrice ??
        0,
    );

  const basePrice =
    variantPrice > 0
      ? variantPrice
      : productPrice;

  const baseComparePrice =
    variantPrice > 0
      ? variantComparePrice >
        0
        ? variantComparePrice
        : productComparePrice
      : productComparePrice;

  const hasDiscount =
    baseComparePrice > 0 &&
    basePrice > 0 &&
    baseComparePrice >
      basePrice;

  const finalUnitPrice =
    basePrice +
    technologyPrice;

  const compareUnitPrice =
    hasDiscount
      ? baseComparePrice +
        technologyPrice
      : 0;

  const quantity =
    Number(
      item?.quantity || 1,
    );

  const itemTotal =
    finalUnitPrice *
    quantity;

  const originalItemTotal =
    hasDiscount
      ? compareUnitPrice *
        quantity
      : itemTotal;

  const itemSaving =
    originalItemTotal -
    itemTotal;

  const discountPercentage =
    hasDiscount &&
    compareUnitPrice > 0
      ? Math.round(
          ((compareUnitPrice -
            finalUnitPrice) /
            compareUnitPrice) *
            100,
        )
      : 0;

  return {
    product,
    variant,
    productTechnology,
    technologyModel,

    basePrice,
    baseComparePrice,

    technologyPrice,

    finalUnitPrice,
    compareUnitPrice,

    hasDiscount,
    discountPercentage,

    quantity,

    itemTotal,
    originalItemTotal,
    itemSaving,
  };
};

const CartPage = () => {
  const navigate =
    useNavigate();

  const {
    cart,
    isLoading,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const [
    removingItemId,
    setRemovingItemId,
  ] = useState(null);

  const [
    clearingCart,
    setClearingCart,
  ] = useState(false);

  const items =
    cart?.items || [];

  const handleRemoveItem =
    async (itemId) => {
      if (
        !itemId ||
        removingItemId
      ) {
        return;
      }

      try {
        setRemovingItemId(
          itemId,
        );

        await removeFromCart(
          itemId,
        );
      } catch (error) {
        console.error(
          "Remove Cart Item Error:",
          error,
        );
      } finally {
        setRemovingItemId(
          null,
        );
      }
    };

  const handleClearCart =
    async () => {
      if (clearingCart) {
        return;
      }

      try {
        setClearingCart(true);

        await clearCart();
      } catch (error) {
        console.error(
          "Clear Cart Error:",
          error,
        );
      } finally {
        setClearingCart(false);
      }
    };

  const subtotal =
    items.reduce(
      (total, item) => {
        return (
          total +
          getCartItemPricing(
            item,
          ).itemTotal
        );
      },
      0,
    );

  const totalSavings =
    items.reduce(
      (total, item) => {
        return (
          total +
          getCartItemPricing(
            item,
          ).itemSaving
        );
      },
      0,
    );

  const originalSubtotal =
    subtotal +
    totalSavings;

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-warm-ivory">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-midnight-navy text-champagne-gold">
            <span className="animate-pulse">
              ✦
            </span>
          </div>

          <p className="mt-5 text-[9px] font-semibold uppercase tracking-[0.3em] text-slate-gray">
            Loading your cart
          </p>
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-warm-ivory px-6">
        <div className="w-full max-w-[700px] rounded-[30px] bg-midnight-navy px-8 py-16 text-center text-soft-white shadow-[0_30px_80px_rgba(7,19,31,0.18)]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-champagne-gold/30 text-xl text-champagne-gold">
            ✦
          </div>

          <h1 className="mt-7 font-serif text-[3rem]">
            Your cart is
            <span className="block italic text-champagne-gold">
              waiting for you.
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-[420px] text-[13px] leading-7 text-premium-silver/70">
            Explore our collection
            and find something that
            feels like you.
          </p>

          <Link
            to="/shop"
            className="mt-8 inline-flex rounded-[13px] bg-soft-white px-8 py-4 text-[9px] font-semibold uppercase tracking-[0.12em] text-midnight-navy"
          >
            Continue Shopping →
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-warm-ivory text-midnight-navy">
      <div className="mx-auto max-w-[1360px] px-5 py-12 sm:px-8 lg:px-10 lg:py-16">
        {/* HEADER */}
        <div className="mb-12">
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-classic-gold/60" />

            <span className="text-[9px] font-semibold uppercase tracking-[0.34em] text-antique-gold">
              Your Selection
            </span>
          </div>

          <h1 className="mt-5 font-serif text-[3rem] sm:text-[4rem]">
            Shopping
            <span className="ml-2 italic text-navy-soft">
              Cart
            </span>
          </h1>
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_370px]">
          {/* ITEMS */}
          <div className="space-y-5">
            {items.map(
              (item) => {
                const pricing =
                  getCartItemPricing(
                    item,
                  );

                const {
                  product,
                  technologyModel,

                  basePrice,
                  baseComparePrice,

                  technologyPrice,

                  finalUnitPrice,
                  compareUnitPrice,

                  hasDiscount,
                  discountPercentage,

                  quantity,

                  itemTotal,
                  originalItemTotal,
                  itemSaving,
                } = pricing;

                const imageUrl =
                  getImageUrl(
                    getCartItemImage(
                      item,
                    ),
                  );

                const technologyName =
                  technologyModel
                    ?.modelName ||
                  technologyModel
                    ?.name ||
                  "";

                return (
                  <div
                    key={
                      item._id
                    }
                    className="relative overflow-hidden rounded-[26px] border border-light-champagne/90 bg-soft-white/90 p-5 shadow-[0_10px_35px_rgba(7,19,31,0.045)] sm:p-6"
                  >
                    <div className="flex flex-col gap-6 sm:flex-row">
                      {/* IMAGE */}
                      <Link
                        to={`/shop/products/${product?._id}`}
                        className="h-[210px] w-full shrink-0 overflow-hidden rounded-[18px] bg-soft-cream sm:h-[175px] sm:w-[155px]"
                      >
                        {imageUrl ? (
                          <img
                            src={
                              imageUrl
                            }
                            alt={
                              product
                                ?.name ||
                              "Product"
                            }
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-[9px] text-steel-gray">
                            No Image
                          </div>
                        )}
                      </Link>

                      <div className="min-w-0 flex-1">
                        {/* NAME / REMOVE */}
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <Link
                              to={`/shop/products/${product?._id}`}
                              className="font-serif text-[1.55rem] text-midnight-navy"
                            >
                              {
                                product?.name
                              }
                            </Link>

                            {hasDiscount && (
                              <div className="mt-2">
                                <span className="rounded-full bg-midnight-navy px-3 py-1.5 text-[7px] font-semibold text-champagne-gold">
                                  {
                                    discountPercentage
                                  }
                                  % OFF
                                </span>
                              </div>
                            )}
                          </div>

                          {/* REMOVE */}
                          <button
                            type="button"
                            disabled={
                              removingItemId ===
                              item._id
                            }
                            onClick={() =>
                              handleRemoveItem(
                                item._id,
                              )
                            }
                            className="shrink-0 rounded-full border border-transparent px-3 py-2 text-[7px] font-semibold uppercase tracking-[0.16em] text-steel-gray transition-all hover:border-antique-gold/20 hover:bg-soft-cream hover:text-antique-gold disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            {removingItemId ===
                            item._id
                              ? "Removing..."
                              : "Remove"}
                          </button>
                        </div>

                        {/* TECHNOLOGY */}
                        {technologyName && (
                          <div className="mt-5 rounded-[16px] bg-midnight-navy p-4 text-soft-white">
                            <p className="text-[7px] font-semibold uppercase tracking-[0.18em] text-champagne-gold">
                              Technology
                            </p>

                            <p className="mt-1 text-[11px]">
                              {
                                technologyName
                              }
                            </p>

                            <p className="mt-2 text-[10px] text-champagne-gold">
                              +
                              {technologyPrice.toLocaleString(
                                "en-EG",
                              )}{" "}
                              EGP
                            </p>
                          </div>
                        )}

                        {/* PRICE BREAKDOWN */}
                        <div className="mt-5 grid gap-4 border-t border-light-champagne pt-5 sm:grid-cols-3">
                          <div>
                            <p className="text-[7px] uppercase tracking-[0.16em] text-steel-gray">
                              Jewelry
                            </p>

                            <p className="mt-1 font-serif">
                              {basePrice.toLocaleString(
                                "en-EG",
                              )}{" "}
                              EGP
                            </p>

                            {hasDiscount && (
                              <p className="text-[8px] text-steel-gray line-through">
                                {baseComparePrice.toLocaleString(
                                  "en-EG",
                                )}{" "}
                                EGP
                              </p>
                            )}
                          </div>

                          <div>
                            <p className="text-[7px] uppercase tracking-[0.16em] text-steel-gray">
                              Technology
                            </p>

                            <p className="mt-1 font-serif text-antique-gold">
                              +
                              {technologyPrice.toLocaleString(
                                "en-EG",
                              )}{" "}
                              EGP
                            </p>
                          </div>

                          <div>
                            <p className="text-[7px] uppercase tracking-[0.16em] text-steel-gray">
                              Unit Price
                            </p>

                            <p className="mt-1 font-serif">
                              {finalUnitPrice.toLocaleString(
                                "en-EG",
                              )}{" "}
                              EGP
                            </p>

                            {hasDiscount && (
                              <p className="text-[8px] text-steel-gray line-through">
                                {compareUnitPrice.toLocaleString(
                                  "en-EG",
                                )}{" "}
                                EGP
                              </p>
                            )}
                          </div>
                        </div>

                        {hasDiscount && (
                          <div className="mt-5 flex justify-between rounded-[13px] bg-soft-cream px-4 py-3 text-[9px] text-antique-gold">
                            <span>
                              You Save
                            </span>

                            <strong>
                              {itemSaving.toLocaleString(
                                "en-EG",
                              )}{" "}
                              EGP
                            </strong>
                          </div>
                        )}

                        {/* QUANTITY / TOTAL */}
                        <div className="mt-6 flex items-end justify-between border-t border-light-champagne pt-5">
                          <div className="flex overflow-hidden rounded-full border border-light-champagne">
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
                              className="h-9 w-10 hover:bg-midnight-navy hover:text-white disabled:opacity-30"
                            >
                              −
                            </button>

                            <span className="flex h-9 min-w-10 items-center justify-center border-x border-light-champagne text-[10px] font-semibold">
                              {
                                quantity
                              }
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
                              className="h-9 w-10 hover:bg-midnight-navy hover:text-white"
                            >
                              +
                            </button>
                          </div>

                          <div className="text-right">
                            <p className="text-[7px] uppercase tracking-[0.16em] text-steel-gray">
                              Item Total
                            </p>

                            {hasDiscount && (
                              <p className="mt-1 text-[9px] text-steel-gray line-through">
                                {originalItemTotal.toLocaleString(
                                  "en-EG",
                                )}{" "}
                                EGP
                              </p>
                            )}

                            <p className="mt-1 font-serif text-[1.6rem]">
                              {itemTotal.toLocaleString(
                                "en-EG",
                              )}{" "}
                              EGP
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              },
            )}

            {/* CLEAR CART */}
            <div className="flex justify-end">
              <button
                type="button"
                disabled={
                  clearingCart
                }
                onClick={
                  handleClearCart
                }
                className="text-[8px] font-semibold uppercase tracking-[0.2em] text-steel-gray hover:text-antique-gold disabled:opacity-40"
              >
                {clearingCart
                  ? "Clearing..."
                  : "Clear Cart"}
              </button>
            </div>
          </div>

          {/* SUMMARY */}
          <aside className="sticky top-28 rounded-[26px] bg-midnight-navy p-7 text-soft-white shadow-[0_25px_65px_rgba(7,19,31,0.18)]">
            <p className="text-[7px] font-semibold uppercase tracking-[0.3em] text-champagne-gold">
              Your Order
            </p>

            <h2 className="mt-1 font-serif text-[1.4rem]">
              Order Summary
            </h2>

            <div className="my-7 h-px bg-soft-white/10" />

            {totalSavings > 0 && (
              <>
                <div className="flex justify-between text-[11px]">
                  <span className="text-premium-silver/60">
                    Original
                  </span>

                  <span className="line-through opacity-50">
                    {originalSubtotal.toLocaleString(
                      "en-EG",
                    )}{" "}
                    EGP
                  </span>
                </div>

                <div className="mt-4 flex justify-between text-[11px]">
                  <span className="text-champagne-gold">
                    Discount
                  </span>

                  <span className="font-semibold text-champagne-gold">
                    -
                    {totalSavings.toLocaleString(
                      "en-EG",
                    )}{" "}
                    EGP
                  </span>
                </div>
              </>
            )}

            <div className="mt-5 flex justify-between text-[11px]">
              <span className="text-premium-silver/60">
                Subtotal
              </span>

              <span className="font-semibold">
                {subtotal.toLocaleString(
                  "en-EG",
                )}{" "}
                EGP
              </span>
            </div>

            <div className="mt-5 flex justify-between text-[11px]">
              <span className="text-premium-silver/60">
                Shipping
              </span>

              <span className="text-champagne-gold">
                At checkout
              </span>
            </div>

            <div className="my-7 h-px bg-soft-white/10" />

            <p className="text-[7px] uppercase tracking-[0.2em] text-premium-silver/50">
              Total Before Shipping
            </p>

            <p className="mt-2 font-serif text-[2.2rem] italic text-champagne-gold">
              {subtotal.toLocaleString(
                "en-EG",
              )}{" "}
              <span className="text-[9px] not-italic">
                EGP
              </span>
            </p>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/checkout",
                )
              }
              className="mt-8 flex min-h-[54px] w-full items-center justify-center rounded-[13px] bg-soft-white text-[9px] font-semibold uppercase tracking-[0.12em] text-midnight-navy"
            >
              Proceed to Checkout →
            </button>

            <Link
              to="/shop"
              className="mt-5 block text-center text-[8px] uppercase tracking-[0.18em] text-premium-silver/50 hover:text-champagne-gold"
            >
              Continue Shopping
            </Link>
          </aside>
        </div>
      </div>
    </main>
  );
};

export default CartPage;