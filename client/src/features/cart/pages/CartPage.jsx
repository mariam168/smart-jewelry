import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCart } from "../../../context/CartContext";

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

  if (image.startsWith("/assets/") || image.startsWith("/images/")) {
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
    variant?.image,
    variant?.imageUrl,
    variant?.primaryImage,
    product?.primaryImage,
    product?.image,
    product?.imageUrl,
    product?.images?.[0],
    product?.images,
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
  const stock = Number(product?.stock ?? 0);
  const variant = item?.variant || null;
  const productTechnology = item?.productTechnology || null;

  const technologyModel =
    productTechnology?.technologyModel ||
    item?.technologyModel ||
    null;

  const productPrice = Number(product?.price || 0);
  const productComparePrice = Number(product?.comparePrice || 0);
  const variantPrice = Number(variant?.price || 0);
  const variantComparePrice = Number(
    variant?.compareAtPrice || 0
  );

  const technologyPrice = Number(
    productTechnology?.extraPrice ??
      technologyModel?.extraPrice ??
      0
  );

  const basePrice =
    variantPrice > 0 ? variantPrice : productPrice;

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

  const finalUnitPrice =
    basePrice + technologyPrice;

  const compareUnitPrice = hasDiscount
    ? baseComparePrice + technologyPrice
    : 0;

  const quantity = Number(item?.quantity || 1);

  const itemTotal =
    finalUnitPrice * quantity;

  const originalItemTotal = hasDiscount
    ? compareUnitPrice * quantity
    : itemTotal;

  const itemSaving =
    originalItemTotal - itemTotal;

  const discountPercentage =
    hasDiscount && compareUnitPrice > 0
      ? Math.round(
          ((compareUnitPrice - finalUnitPrice) /
            compareUnitPrice) *
            100
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
     stock,
    itemTotal,
    originalItemTotal,
    itemSaving,
  };
};

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

const CartPage = () => {
  const navigate = useNavigate();
  const { i18n, t } = useTranslation();

  const activeLanguage =
    i18n.language === "ar" ? "ar" : "en";

  const {
    cart,
    isLoading,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const [removingItemId, setRemovingItemId] =
    useState(null);

  const [clearingCart, setClearingCart] =
    useState(false);

  const items = cart?.items || [];

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
        error
      );
    } finally {
      setRemovingItemId(null);
    }
  };

  const handleClearCart = async () => {
    if (clearingCart) {
      return;
    }

    try {
      setClearingCart(true);
      await clearCart();
    } catch (error) {
      console.error(
        "Clear Cart Error:",
        error
      );
    } finally {
      setClearingCart(false);
    }
  };

  const subtotal = items.reduce(
    (total, item) => {
      return (
        total +
        getCartItemPricing(item).itemTotal
      );
    },
    0
  );

  const totalSavings = items.reduce(
    (total, item) => {
      return (
        total +
        getCartItemPricing(item).itemSaving
      );
    },
    0
  );

  const originalSubtotal =
    subtotal + totalSavings;

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F7F4EE]">
        <div
          className="text-center"
          dir={
            activeLanguage === "ar"
              ? "rtl"
              : "ltr"
          }
        >
          <div className="mx-auto flex h-[74px] w-[74px] items-center justify-center rounded-full border border-[#D7C39A] bg-[#07131F] text-[#D9B96E] shadow-[0_15px_40px_rgba(7,19,31,0.15)]">
            <span className="animate-pulse text-xl">
              ✦
            </span>
          </div>

          <p className="mt-6 text-[9px] font-bold uppercase tracking-[0.34em] text-[#7C817F]">
            {t("cartPage.loading")}
          </p>
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F7F4EE] px-5 py-10">
        <div
          className="relative w-full max-w-[720px] overflow-hidden rounded-[34px] bg-[#07131F] px-7 py-16 text-center text-white shadow-[0_35px_100px_rgba(7,19,31,0.20)] sm:px-12 sm:py-20"
          dir={
            activeLanguage === "ar"
              ? "rtl"
              : "ltr"
          }
        >
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#D9B96E]/10 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-white/[0.04] blur-3xl" />

          <div className="relative">
            <div className="mx-auto flex h-[74px] w-[74px] items-center justify-center rounded-full border border-[#D9B96E]/30 bg-white/[0.04] text-xl text-[#D9B96E]">
              ✦
            </div>

            <p className="mt-7 text-[8px] font-bold uppercase tracking-[0.4em] text-[#D9B96E]">
              Jevorya
            </p>

            <h1 className="mt-4 font-serif text-[2.6rem] font-normal leading-tight sm:text-[3.6rem]">
              {t("cartPage.emptyTitleFirst")}
              <span className="block text-[#D9B96E]">
                {t("cartPage.emptyTitleSecond")}
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-[430px] text-[12px] leading-7 text-white/55">
              {t("cartPage.emptyDescription")}
            </p>

            <Link
              to="/shop"
              className="group mt-9 inline-flex min-h-[52px] items-center gap-5 rounded-full bg-white px-8 text-[8px] font-bold uppercase tracking-[0.2em] text-[#07131F] shadow-lg transition-all duration-300 hover:bg-[#D9B96E] hover:shadow-[0_15px_35px_rgba(217,185,110,0.18)]"
            >
              <span>
                {t(
                  "cartPage.continueShopping"
                )}
              </span>

              <span className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen bg-[#F7F4EE] text-[#07131F]"
      dir={
        activeLanguage === "ar"
          ? "rtl"
          : "ltr"
      }
    >
      <div className="mx-auto max-w-[1420px] px-5 py-10 sm:px-8 lg:px-10 lg:py-16">

        {/* HEADER */}
        <header className="mb-10 lg:mb-14">
          <div className="flex items-center gap-3">
            <span className="h-px w-9 bg-[#C7A85C]" />

            <span className="text-[8px] font-bold uppercase tracking-[0.35em] text-[#A38348]">
              {t("cartPage.yourSelection")}
            </span>
          </div>

          <div className="mt-5 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <h1 className="font-serif text-[2.8rem] font-normal leading-none tracking-[-0.03em] sm:text-[4rem]">
                {t("cartPage.shopping")}
                <span className="ml-2 text-[#7E8790]">
                  {t("cartPage.cart")}
                </span>
              </h1>

              <p className="mt-4 max-w-[560px] text-[11px] leading-6 text-[#81847F]">
                {items.length}{" "}
                {items.length === 1
                  ? t("cartPage.item")
                  : t("cartPage.items")}
              </p>
            </div>

            <div className="hidden items-center gap-3 pb-1 sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-[#C7A85C]" />
              <span className="text-[7px] font-bold uppercase tracking-[0.28em] text-[#8D918D]">
                Jevorya Collection
              </span>
            </div>
          </div>
        </header>

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">

          {/* ITEMS */}
          <div className="space-y-5">
            {items.map((item) => {
              const pricing =
                getCartItemPricing(item);

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
                stock,
                itemTotal,
                originalItemTotal,
                itemSaving,
              } = pricing;

              const imageUrl = getImageUrl(
                getCartItemImage(item)
              );

              const technologyName =
                getLocalizedText(
                  technologyModel?.modelName ||
                    technologyModel?.name ||
                    "",
                  activeLanguage
                );

              const productName =
                getLocalizedText(
                  product?.name,
                  activeLanguage
                );

              return (
                <div
                  key={item._id}
                  className="group relative overflow-hidden rounded-[28px] border border-[#E7DFD2] bg-white shadow-[0_10px_35px_rgba(7,19,31,0.045)] transition-all duration-500 hover:border-[#D8C9AE] hover:shadow-[0_20px_50px_rgba(7,19,31,0.075)]"
                >
                  {/* TOP ACCENT */}
                  <div className="absolute left-0 right-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#D3B66E] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                  <div className="p-4 sm:p-5 lg:p-6">
                    <div className="flex flex-col gap-6 md:flex-row">

                      {/* IMAGE */}
                      <Link
                        to={`/shop/products/${product?._id}`}
                        className="group/image relative h-[280px] w-full shrink-0 overflow-hidden rounded-[22px] bg-[#F0ECE4] md:h-[205px] md:w-[180px] lg:h-[220px] lg:w-[190px]"
                      >
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={
                              productName ||
                              t(
                                "cartPage.product"
                              )
                            }
                            className="h-full w-full object-cover transition-transform duration-1000 ease-out group-hover/image:scale-[1.045]"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-[9px] text-[#8B8D89]">
                            {t(
                              "cartPage.noImage"
                            )}
                          </div>
                        )}

                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#07131F]/35 via-transparent to-transparent opacity-70" />

                        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                          <span className="text-[7px] font-bold uppercase tracking-[0.25em] text-white/80">
                            Jevorya
                          </span>

                          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/30 bg-white/10 text-[10px] text-white backdrop-blur-md">
                            →
                          </span>
                        </div>
                      </Link>

                      {/* CONTENT */}
                      <div className="min-w-0 flex-1">

                        {/* NAME / REMOVE */}
                        <div className="flex items-start justify-between gap-5">
                          <div className="min-w-0">
                            <p className="mb-2 text-[7px] font-bold uppercase tracking-[0.3em] text-[#A6854A]">
                              {t(
                                "cartPage.jewelry"
                              )}
                            </p>

                            <Link
                              to={`/shop/products/${product?._id}`}
                              className="block font-serif text-[1.55rem] font-normal leading-tight tracking-[-0.02em] text-[#07131F] transition-colors duration-300 hover:text-[#A7864C] sm:text-[1.8rem]"
                            >
                              {productName}
                            </Link>

                            {hasDiscount && (
                              <div className="mt-3">
                                <span className="inline-flex items-center rounded-full border border-[#E3D4B5] bg-[#FAF7F0] px-3 py-1.5 text-[7px] font-bold uppercase tracking-[0.12em] text-[#A07C3E]">
                                  {discountPercentage}{" "}
                                  {t(
                                    "cartPage.off"
                                  )}
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
                                item._id
                              )
                            }
                            className="group/remove shrink-0 rounded-full border border-[#E8E1D7] px-3.5 py-2.5 text-[7px] font-bold uppercase tracking-[0.16em] text-[#8B8E8A] transition-all duration-300 hover:border-[#D7C29A] hover:bg-[#FAF7F0] hover:text-[#A7864C] disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            {removingItemId ===
                            item._id
                              ? t(
                                  "cartPage.removing"
                                )
                              : t(
                                  "cartPage.remove"
                                )}
                          </button>
                        </div>

                        {/* TECHNOLOGY */}
                        {technologyName && (
                          <div className="mt-6 flex items-center justify-between gap-4 rounded-[18px] border border-[#E9E1D5] bg-[#FAF8F3] px-4 py-3.5">
                            <div className="flex min-w-0 items-center gap-3">
                              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#07131F] text-[10px] text-[#D9B96E]">
                                ✦
                              </span>

                              <div className="min-w-0">
                                <p className="text-[6px] font-bold uppercase tracking-[0.2em] text-[#A7864C]">
                                  {t(
                                    "cartPage.technology"
                                  )}
                                </p>

                                <p className="mt-1 truncate text-[10px] font-semibold text-[#07131F]">
                                  {technologyName}
                                </p>
                              </div>
                            </div>

                            <span className="shrink-0 text-[9px] font-semibold text-[#A7864C]">
                              +
                              {technologyPrice.toLocaleString(
                                "en-EG"
                              )}{" "}
                              EGP
                            </span>
                          </div>
                        )}

                        {/* PRICE BREAKDOWN */}
                        <div className="mt-6 grid gap-3 border-t border-[#ECE5DA] pt-5 sm:grid-cols-3">
                          <div className="rounded-[15px] bg-[#FBF9F5] px-3.5 py-3">
                            <p className="text-[6px] font-bold uppercase tracking-[0.18em] text-[#92958F]">
                              {t(
                                "cartPage.jewelry"
                              )}
                            </p>

                            <p className="mt-1.5 font-serif text-[14px] text-[#07131F]">
                              {basePrice.toLocaleString(
                                "en-EG"
                              )}{" "}
                              EGP
                            </p>

                            {hasDiscount && (
                              <p className="mt-0.5 text-[8px] text-[#999B96] line-through">
                                {baseComparePrice.toLocaleString(
                                  "en-EG"
                                )}{" "}
                                EGP
                              </p>
                            )}
                          </div>

                          <div className="rounded-[15px] bg-[#FBF9F5] px-3.5 py-3">
                            <p className="text-[6px] font-bold uppercase tracking-[0.18em] text-[#92958F]">
                              {t(
                                "cartPage.technology"
                              )}
                            </p>

                            <p className="mt-1.5 font-serif text-[14px] text-[#A7864C]">
                              +
                              {technologyPrice.toLocaleString(
                                "en-EG"
                              )}{" "}
                              EGP
                            </p>
                          </div>

                          <div className="rounded-[15px] bg-[#07131F] px-3.5 py-3 text-white">
                            <p className="text-[6px] font-bold uppercase tracking-[0.18em] text-white/45">
                              {t(
                                "cartPage.unitPrice"
                              )}
                            </p>

                            <p className="mt-1.5 font-serif text-[14px] text-white">
                              {finalUnitPrice.toLocaleString(
                                "en-EG"
                              )}{" "}
                              EGP
                            </p>

                            {hasDiscount && (
                              <p className="mt-0.5 text-[8px] text-white/40 line-through">
                                {compareUnitPrice.toLocaleString(
                                  "en-EG"
                                )}{" "}
                                EGP
                              </p>
                            )}
                          </div>
                        </div>

                        {/* SAVINGS */}
                        {hasDiscount && (
                          <div className="mt-4 flex items-center justify-between rounded-[14px] border border-[#E6D8BA] bg-[#FCF9F1] px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#D9B96E] text-[7px] text-[#07131F]">
                                ✓
                              </span>

                              <span className="text-[8px] font-semibold uppercase tracking-[0.12em] text-[#A7864C]">
                                {t(
                                  "cartPage.youSave"
                                )}
                              </span>
                            </div>

                            <strong className="text-[10px] font-bold text-[#A7864C]">
                              {itemSaving.toLocaleString(
                                "en-EG"
                              )}{" "}
                              EGP
                            </strong>
                          </div>
                        )}

                        {/* QUANTITY / TOTAL */}
                        <div className="mt-6 flex flex-col gap-5 border-t border-[#ECE5DA] pt-5 sm:flex-row sm:items-end sm:justify-between">

                          {/* QUANTITY */}
                        {/* QUANTITY */}
<div>
  <p className="mb-2 text-[6px] font-bold uppercase tracking-[0.2em] text-[#92958F]">
    {t("cartPage.quantity")}
  </p>

  <div className="inline-flex overflow-hidden rounded-full border border-[#DED6C9] bg-white">
    <button
      type="button"
      disabled={quantity <= 1}
      onClick={() =>
        updateQuantity(
          item._id,
          quantity - 1
        )
      }
      className="h-10 w-11 text-[15px] text-[#07131F] transition-all duration-200 hover:bg-[#07131F] hover:text-white disabled:cursor-not-allowed disabled:opacity-25"
    >
      −
    </button>

    <span className="flex h-10 min-w-11 items-center justify-center border-x border-[#DED6C9] text-[10px] font-bold text-[#07131F]">
      {quantity}
    </span>

    <button
      type="button"
      disabled={quantity >= stock}
      onClick={() => {
        if (quantity < stock) {
          updateQuantity(
            item._id,
            quantity + 1
          );
        }
      }}
      className="h-10 w-11 text-[15px] text-[#07131F] transition-all duration-200 hover:bg-[#07131F] hover:text-white disabled:cursor-not-allowed disabled:opacity-25"
    >
      +
    </button>
  </div>

  {/* STOCK MESSAGE */}
  {stock <= 0 || quantity >= stock ? (
    <p className="mt-2 text-[8px] font-semibold text-red-600">
      Out of stock
    </p>
  ) : null}
</div>

                          <div className="sm:text-right">
                            <p className="text-[6px] font-bold uppercase tracking-[0.2em] text-[#92958F]">
                              {t(
                                "cartPage.itemTotal"
                              )}
                            </p>

                            {hasDiscount && (
                              <p className="mt-1 text-[9px] text-[#999B96] line-through">
                                {originalItemTotal.toLocaleString(
                                  "en-EG"
                                )}{" "}
                                EGP
                              </p>
                            )}

                            <p className="mt-1 font-serif text-[1.75rem] tracking-[-0.02em] text-[#07131F]">
                              {itemTotal.toLocaleString(
                                "en-EG"
                              )}{" "}
                              <span className="text-[8px] font-sans font-bold tracking-[0.12em] text-[#8B8E8A]">
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

            {/* CLEAR CART */}
            <div className="flex justify-end pt-1">
              <button
                type="button"
                disabled={clearingCart}
                onClick={handleClearCart}
                className="group flex items-center gap-2 rounded-full px-3 py-2 text-[7px] font-bold uppercase tracking-[0.2em] text-[#888B87] transition-all duration-300 hover:bg-white hover:text-[#A7864C] disabled:opacity-40"
              >
                <span className="h-px w-4 bg-current transition-all duration-300 group-hover:w-6" />

                {clearingCart
                  ? t(
                      "cartPage.clearing"
                    )
                  : t(
                      "cartPage.clearCart"
                    )}
              </button>
            </div>
          </div>

          {/* SUMMARY */}
          <aside className="sticky top-8 overflow-hidden rounded-[30px] bg-[#07131F] text-white shadow-[0_30px_75px_rgba(7,19,31,0.18)] lg:top-28">
            {/* DECORATIVE GLOW */}
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#D9B96E]/10 blur-3xl" />

            <div className="relative p-7 sm:p-8">

              {/* HEADER */}
              <div className="flex items-start justify-between gap-5">
                <div>
                  <p className="text-[7px] font-bold uppercase tracking-[0.32em] text-[#D9B96E]">
                    {t("cartPage.yourOrder")}
                  </p>

                  <h2 className="mt-2 font-serif text-[1.65rem] font-normal tracking-[-0.02em]">
                    {t(
                      "cartPage.orderSummary"
                    )}
                  </h2>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[#D9B96E]">
                  ✦
                </div>
              </div>

              {/* DIVIDER */}
              <div className="my-7 h-px bg-white/10" />

              {/* ORIGINAL */}
              {totalSavings > 0 && (
                <>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-white/45">
                      {t(
                        "cartPage.original"
                      )}
                    </span>

                    <span className="text-white/45 line-through">
                      {originalSubtotal.toLocaleString(
                        "en-EG"
                      )}{" "}
                      EGP
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between rounded-[12px] bg-[#D9B96E]/[0.08] px-3.5 py-3 text-[10px]">
                    <span className="text-[#D9B96E]">
                      {t(
                        "cartPage.discount"
                      )}
                    </span>

                    <span className="font-bold text-[#D9B96E]">
                      -
                      {totalSavings.toLocaleString(
                        "en-EG"
                      )}{" "}
                      EGP
                    </span>
                  </div>
                </>
              )}

              {/* SUBTOTAL */}
              <div className="mt-5 flex items-center justify-between text-[10px]">
                <span className="text-white/45">
                  {t(
                    "cartPage.subtotal"
                  )}
                </span>

                <span className="font-semibold text-white">
                  {subtotal.toLocaleString(
                    "en-EG"
                  )}{" "}
                  EGP
                </span>
              </div>

              {/* SHIPPING */}
              <div className="mt-5 flex items-center justify-between text-[10px]">
                <span className="text-white/45">
                  {t(
                    "cartPage.shipping"
                  )}
                </span>

                <span className="rounded-full border border-[#D9B96E]/20 bg-[#D9B96E]/[0.06] px-2.5 py-1 text-[7px] font-bold uppercase tracking-[0.08em] text-[#D9B96E]">
                  {t(
                    "cartPage.atCheckout"
                  )}
                </span>
              </div>

              {/* TOTAL */}
              <div className="my-7 h-px bg-white/10" />

              <p className="text-[7px] font-bold uppercase tracking-[0.22em] text-white/35">
                {t(
                  "cartPage.totalBeforeShipping"
                )}
              </p>

              <div className="mt-2 flex items-baseline gap-2">
                <p className="font-serif text-[2.45rem] font-normal tracking-[-0.035em] text-[#D9B96E]">
                  {subtotal.toLocaleString(
                    "en-EG"
                  )}
                </p>

                <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#D9B96E]/70">
                  EGP
                </span>
              </div>

              {/* CHECKOUT */}
              <button
                type="button"
                onClick={() =>
                  navigate("/checkout")
                }
                className="group mt-8 flex min-h-[56px] w-full items-center justify-center gap-4 rounded-[15px] bg-white text-[8px] font-bold uppercase tracking-[0.18em] text-[#07131F] shadow-[0_12px_30px_rgba(0,0,0,0.15)] transition-all duration-300 hover:bg-[#D9B96E] hover:shadow-[0_15px_35px_rgba(217,185,110,0.15)]"
              >
                <span>
                  {t(
                    "cartPage.proceedToCheckout"
                  )}
                </span>

                <span className="transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </button>

              {/* CONTINUE SHOPPING */}
              <Link
                to="/shop"
                className="group mt-5 flex items-center justify-center gap-2 text-[7px] font-bold uppercase tracking-[0.2em] text-white/35 transition-colors duration-300 hover:text-[#D9B96E]"
              >
                <span className="h-px w-4 bg-current transition-all duration-300 group-hover:w-6" />

                {t(
                  "cartPage.continueShoppingShort"
                )}

                <span className="h-px w-4 bg-current transition-all duration-300 group-hover:w-6" />
              </Link>

              {/* BOTTOM TRUST LINE */}
              <div className="mt-7 border-t border-white/10 pt-5">
                <div className="flex items-center justify-center gap-2 text-[6px] font-bold uppercase tracking-[0.22em] text-white/25">
                  <span className="text-[#D9B96E]">
                    ✦
                  </span>

                  Jevorya Smart Jewelry

                  <span className="text-[#D9B96E]">
                    ✦
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
};

export default CartPage;