import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { FaTrashCan } from "react-icons/fa6";

import { CartContext } from "../../context/CartContext";

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

const API_URL = getBackendOrigin();

const getFilePath = (value) => {
  if (!value) return "";

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
    /^https?:\/\//i.test(image) ||
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
  const product = item?.product || {};
  const variant = item?.variant || {};

  const candidates = [
    item?.image,
    item?.imageUrl,
    item?.primaryImage,

    variant?.image,
    variant?.imageUrl,
    variant?.primaryImage,
    variant?.images?.[0],

    product?.primaryImage,
    product?.image,
    product?.imageUrl,
    product?.images?.[0],
  ];

  for (const candidate of candidates) {
    const path = getFilePath(candidate);

    if (path) {
      return path;
    }
  }

  return "";
};

const getCartItemPricing = (item) => {
  const product = item?.product || null;
  const variant = item?.variant || null;

  const productTechnology =
    item?.productTechnology || null;

  const technologyModel =
    productTechnology?.technologyModel ||
    item?.technologyModel ||
    null;

  const productPrice = Number(product?.price || 0);

  const productComparePrice = Number(
    product?.comparePrice || 0,
  );

  const variantPrice = Number(variant?.price || 0);

  const variantComparePrice = Number(
    variant?.compareAtPrice || 0,
  );

  const technologyPrice = Number(
    productTechnology?.extraPrice ??
      technologyModel?.extraPrice ??
      0,
  );

  const basePrice =
    variantPrice > 0
      ? variantPrice
      : productPrice;

  const baseComparePrice =
    variantPrice > 0
      ? variantComparePrice > 0
        ? variantComparePrice
        : productComparePrice
      : productComparePrice;

  const hasDiscount =
    baseComparePrice > 0 &&
    basePrice > 0 &&
    baseComparePrice > basePrice;

  const unitPrice =
    basePrice + technologyPrice;

  const compareUnitPrice =
    hasDiscount
      ? baseComparePrice + technologyPrice
      : 0;

  const quantity = Number(item?.quantity || 1);

  const itemTotal = unitPrice * quantity;

  const originalItemTotal =
    hasDiscount
      ? compareUnitPrice * quantity
      : itemTotal;

  const itemSaving =
    originalItemTotal - itemTotal;

  const discountPercentage =
    hasDiscount && compareUnitPrice > 0
      ? Math.round(
          ((compareUnitPrice - unitPrice) /
            compareUnitPrice) *
            100,
        )
      : 0;

  return {
    product,
    productTechnology,
    technologyModel,

    basePrice,
    technologyPrice,

    unitPrice,
    compareUnitPrice,

    hasDiscount,
    discountPercentage,

    quantity,
    itemTotal,
    originalItemTotal,
    itemSaving,
  };
};

const CartDrawer = () => {
  const {
    cartItems,
    cartTotal,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
  } = useContext(CartContext);

  const [removingItemId, setRemovingItemId] =
    useState(null);

  const handleRemoveItem = async (itemId) => {
    if (!itemId || removingItemId) {
      return;
    }

    try {
      setRemovingItemId(itemId);

      await removeFromCart(itemId);
    } catch (error) {
      console.error(
        "Remove Cart Item Error:",
        error,
      );
    } finally {
      setRemovingItemId(null);
    }
  };

  if (!isCartOpen) {
    return null;
  }

  const totalSavings = cartItems.reduce(
    (total, item) =>
      total + getCartItemPricing(item).itemSaving,
    0,
  );

  const currentCartTotal = Number(cartTotal || 0);

  return (
    <div className="fixed inset-0 z-[100]">
      <button
        type="button"
        onClick={closeCart}
        className="absolute inset-0 bg-luxury-black/55 backdrop-blur-[3px]"
        aria-label="Close cart"
      />

      <aside className="absolute right-0 top-0 flex h-full w-full max-w-[540px] flex-col overflow-hidden border-l border-light-champagne/20 bg-warm-ivory shadow-[-25px_0_70px_rgba(7,19,31,0.20)]">
        {/* HEADER */}
        <header className="relative overflow-hidden bg-midnight-navy px-6 py-7 text-soft-white">
          <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-champagne-gold/10 blur-[70px]" />

          <div className="relative flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="h-px w-8 bg-classic-gold/70" />

                <span className="text-[8px] font-semibold uppercase tracking-[0.32em] text-champagne-gold">
                  Your Selection
                </span>
              </div>

              <h2 className="mt-3 font-serif text-[1.9rem]">
                Your Cart
              </h2>

              {cartItems.length > 0 && (
                <p className="mt-2 text-[10px] text-premium-silver/60">
                  {cartItems.length}{" "}
                  {cartItems.length === 1
                    ? "piece"
                    : "pieces"}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={closeCart}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-soft-white/15 bg-soft-white/[0.05] text-[22px] text-premium-silver transition hover:border-champagne-gold/50 hover:text-champagne-gold"
            >
              ×
            </button>
          </div>
        </header>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto px-5 py-6">
          {cartItems.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-midnight-navy text-xl text-champagne-gold">
                ✦
              </div>

              <h3 className="mt-6 font-serif text-[2rem] text-midnight-navy">
                Your cart is waiting.
              </h3>

              <Link
                to="/shop"
                onClick={closeCart}
                className="mt-7 rounded-[13px] bg-midnight-navy px-7 py-4 text-[9px] font-semibold uppercase tracking-[0.15em] text-soft-white"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-5">
              {cartItems.map((item) => {
                const pricing =
                  getCartItemPricing(item);

                const {
                  product,
                  productTechnology,
                  technologyModel,

                  basePrice,
                  technologyPrice,

                  unitPrice,
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
                    getCartItemImage(item),
                  );

                const technologyName =
                  technologyModel?.modelName ||
                  technologyModel?.name ||
                  "";

                return (
                  <article
                    key={item._id}
                    className="overflow-hidden rounded-[22px] border border-light-champagne/90 bg-soft-white shadow-[0_10px_30px_rgba(7,19,31,0.05)]"
                  >
                    <div className="p-4 sm:p-5">
                      <div className="flex gap-4">
                        {/* IMAGE */}
                        <div className="relative">
                          <Link
                            to={`/shop/products/${product?._id}`}
                            onClick={closeCart}
                            className="block h-[110px] w-[100px] overflow-hidden rounded-[15px] bg-soft-cream"
                          >
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={
                                  product?.name ||
                                  "Product"
                                }
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-[8px] text-steel-gray">
                                No Image
                              </div>
                            )}
                          </Link>

                          {hasDiscount && (
                            <span className="absolute -bottom-2 left-2 rounded-full bg-midnight-navy px-2.5 py-1 text-[6px] font-semibold text-champagne-gold shadow">
                              -{discountPercentage}%
                            </span>
                          )}
                        </div>

                        {/* INFO */}
                        <div className="min-w-0 flex-1">
                          <Link
                            to={`/shop/products/${product?._id}`}
                            onClick={closeCart}
                            className="block truncate font-serif text-[1.2rem] text-midnight-navy"
                          >
                            {product?.name}
                          </Link>

                          {hasDiscount && (
                            <p className="mt-3 text-[9px] text-steel-gray line-through">
                              {compareUnitPrice.toLocaleString(
                                "en-EG",
                              )}{" "}
                              EGP
                            </p>
                          )}

                          <p className="mt-1 font-serif text-[1.2rem] text-midnight-navy">
                            {unitPrice.toLocaleString(
                              "en-EG",
                            )}{" "}
                            EGP
                          </p>

                          {technologyPrice > 0 && (
                            <p className="mt-1 text-[8px] text-steel-gray">
                              Jewelry{" "}
                              {basePrice.toLocaleString(
                                "en-EG",
                              )}{" "}
                              + Technology{" "}
                              {technologyPrice.toLocaleString(
                                "en-EG",
                              )}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* TECHNOLOGY */}
                      {productTechnology && (
                        <div className="mt-4 flex items-center justify-between rounded-[14px] bg-midnight-navy px-4 py-3 text-soft-white">
                          <div>
                            <p className="text-[6px] font-semibold uppercase tracking-[0.2em] text-champagne-gold">
                              Smart Technology
                            </p>

                            <p className="mt-1 text-[10px]">
                              {technologyName ||
                                "Included"}
                            </p>
                          </div>

                          <span className="text-[9px] font-semibold text-champagne-gold">
                            +
                            {technologyPrice.toLocaleString(
                              "en-EG",
                            )}{" "}
                            EGP
                          </span>
                        </div>
                      )}

                      {/* QUANTITY + TOTAL */}
                      <div className="mt-4 flex items-end justify-between border-t border-light-champagne pt-4">
                        <div className="flex overflow-hidden rounded-full border border-light-champagne">
                          <button
                            type="button"
                            disabled={quantity <= 1}
                            onClick={() =>
                              updateQuantity(
                                item._id,
                                quantity - 1,
                              )
                            }
                            className="h-9 w-9 transition hover:bg-midnight-navy hover:text-soft-white disabled:opacity-30"
                          >
                            −
                          </button>

                          <span className="flex h-9 min-w-10 items-center justify-center border-x border-light-champagne text-[10px] font-semibold">
                            {quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                item._id,
                                quantity + 1,
                              )
                            }
                            className="h-9 w-9 transition hover:bg-midnight-navy hover:text-soft-white"
                          >
                            +
                          </button>
                        </div>

                        <div className="text-right">
                          {hasDiscount && (
                            <p className="text-[8px] text-steel-gray line-through">
                              {originalItemTotal.toLocaleString(
                                "en-EG",
                              )}{" "}
                              EGP
                            </p>
                          )}

                          <p className="font-serif text-[1.3rem] text-midnight-navy">
                            {itemTotal.toLocaleString(
                              "en-EG",
                            )}{" "}
                            EGP
                          </p>
                        </div>
                      </div>

                      {hasDiscount && (
                        <div className="mt-3 flex justify-between rounded-[12px] bg-soft-cream px-4 py-2.5 text-[8px] text-antique-gold">
                          <span>You Save</span>

                          <strong>
                            {itemSaving.toLocaleString(
                              "en-EG",
                            )}{" "}
                            EGP
                          </strong>
                        </div>
                      )}
                    </div>

                    {/* REMOVE — ALWAYS VISIBLE */}
                    <button
                      type="button"
                      disabled={
                        removingItemId === item._id
                      }
                      onClick={() =>
                        handleRemoveItem(item._id)
                      }
                      className="flex min-h-[44px] w-full items-center justify-center gap-2 border-t border-light-champagne bg-soft-cream/45 text-[7px] font-semibold uppercase tracking-[0.18em] text-steel-gray transition-all hover:bg-midnight-navy hover:text-soft-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <FaTrashCan className="text-[9px]" />

                      {removingItemId === item._id
                        ? "Removing..."
                        : "Remove From Cart"}
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {/* SUMMARY */}
        {cartItems.length > 0 && (
          <footer className="bg-midnight-navy px-6 py-6 text-soft-white">
            {totalSavings > 0 && (
              <div className="mb-3 flex justify-between">
                <span className="text-[8px] text-premium-silver/50">
                  Savings
                </span>

                <span className="text-[10px] font-semibold text-champagne-gold">
                  -
                  {totalSavings.toLocaleString(
                    "en-EG",
                  )}{" "}
                  EGP
                </span>
              </div>
            )}

            <div className="flex items-end justify-between">
              <span className="font-serif text-[1.2rem]">
                Subtotal
              </span>

              <span className="font-serif text-[1.7rem] text-champagne-gold">
                {currentCartTotal.toLocaleString(
                  "en-EG",
                )}{" "}
                EGP
              </span>
            </div>

            <Link
              to="/cart"
              onClick={closeCart}
              className="mt-6 flex min-h-[52px] items-center justify-center rounded-[13px] bg-soft-white text-[9px] font-semibold uppercase tracking-[0.15em] text-midnight-navy"
            >
              View Cart →
            </Link>
          </footer>
        )}
      </aside>
    </div>
  );
};

export default CartDrawer;