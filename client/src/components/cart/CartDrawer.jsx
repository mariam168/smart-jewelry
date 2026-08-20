import { useContext } from "react";

import { Link } from "react-router-dom";

import { CartContext } from "../../context/CartContext";

const API_URL = "http://localhost:5000";

const getImageUrl = (image) => {
  if (!image) {
    return "";
  }

  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  return `${API_URL}${image}`;
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

  if (!isCartOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100]">
      <button
        type="button"
        onClick={closeCart}
        className="absolute inset-0 bg-luxury-black/55 backdrop-blur-[3px]"
        aria-label="Close cart"
      />

      <aside className="absolute right-0 top-0 flex h-full w-full max-w-[540px] flex-col overflow-hidden border-l border-light-champagne/20 bg-warm-ivory shadow-[-25px_0_70px_rgba(7,19,31,0.20)]">
        <div className="relative overflow-hidden border-b border-champagne-gold/15 bg-midnight-navy px-6 py-6 text-soft-white sm:px-7 sm:py-7">
          <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-champagne-gold/10 blur-[70px]" />

          <div className="pointer-events-none absolute -bottom-28 -left-24 h-56 w-56 rounded-full border border-champagne-gold/10" />

          <div className="pointer-events-none absolute right-10 top-0 h-px w-24 bg-gradient-to-r from-transparent via-champagne-gold/50 to-transparent" />

          <div className="relative flex items-center justify-between gap-5">
            <div>
              <div className="mb-2.5 flex items-center gap-3">
                <span className="h-px w-8 bg-classic-gold/70" />

                <span className="text-[8px] font-semibold uppercase tracking-[0.32em] text-champagne-gold">
                  Your Selection
                </span>

                <span className="text-[7px] text-classic-gold">✦</span>
              </div>

              <h2 className="font-serif text-[1.8rem] font-normal leading-none tracking-[-0.025em] text-soft-white">
                Your Cart
              </h2>

              {cartItems.length > 0 && (
                <p className="mt-2 text-[10px] tracking-[0.03em] text-premium-silver/65">
                  {cartItems.length}{" "}
                  {cartItems.length === 1 ? "piece" : "pieces"} selected
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={closeCart}
              className="group flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-soft-white/15 bg-soft-white/[0.05] text-[22px] font-light text-premium-silver transition-all duration-300 hover:border-champagne-gold/50 hover:bg-soft-white/10 hover:text-champagne-gold"
              aria-label="Close cart"
            >
              <span className="transition-transform duration-300 group-hover:rotate-90">
                ×
              </span>
            </button>
          </div>
        </div>

        <div className="relative flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">
          <div className="pointer-events-none fixed right-0 top-32 h-72 w-72 rounded-full bg-light-champagne/45 blur-[100px]" />

          {cartItems.length === 0 ? (
            <div className="relative flex h-full flex-col items-center justify-center px-6 py-12 text-center">
              <div className="relative">
                <div className="pointer-events-none absolute inset-0 rounded-full bg-champagne-gold/15 blur-2xl" />

                <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-champagne-gold/25 bg-midnight-navy text-xl text-champagne-gold shadow-[0_16px_35px_rgba(18,38,58,0.18)]">
                  ✦
                </div>
              </div>

              <div className="mt-7 flex items-center gap-3">
                <span className="h-px w-7 bg-classic-gold/45" />

                <span className="text-[8px] font-semibold uppercase tracking-[0.32em] text-antique-gold">
                  Empty
                </span>

                <span className="h-px w-7 bg-classic-gold/45" />
              </div>

              <h3 className="mt-4 font-serif text-[2rem] font-normal tracking-[-0.03em] text-midnight-navy">
                Your cart is waiting.
              </h3>

              <p className="mt-3 max-w-[300px] text-[12px] leading-7 text-slate-gray">
                Discover something beautiful and find the piece that feels like
                you.
              </p>

              <Link
                to="/shop"
                onClick={closeCart}
                className="group mt-7 inline-flex min-h-[50px] items-center justify-center gap-7 rounded-[13px] bg-midnight-navy px-7 text-[9px] font-semibold uppercase tracking-[0.12em] text-soft-white shadow-[0_12px_28px_rgba(18,38,58,0.16)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-rich-navy hover:shadow-[0_16px_34px_rgba(18,38,58,0.22)]"
              >
                Start Shopping
                <span className="text-[15px] text-champagne-gold transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </div>
          ) : (
            <div className="relative space-y-4">
              {cartItems.map((item) => {
                const product = item.product || null;

                const variant = item.variant || null;

                const productTechnology = item.productTechnology || null;

                const technologyModel =
                  productTechnology?.technologyModel || null;

                const technology = technologyModel?.technology || null;

                const productPrice = Number(product?.price || 0);

                const variantPrice = Number(variant?.price || 0);

                const basePrice =
                  variantPrice > 0 ? variantPrice : productPrice;

                const technologyPrice = Number(
                  productTechnology?.extraPrice || 0,
                );

                const itemUnitPrice = basePrice + technologyPrice;

                const itemQuantity = Number(item.quantity || 1);

                const itemTotal = itemUnitPrice * itemQuantity;

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

                const technologyType = technology?.name || "";

                return (
                  <div
                    key={item._id}
                    className="group relative overflow-hidden rounded-[22px] border border-light-champagne/90 bg-soft-white/90 p-4 shadow-[0_8px_25px_rgba(7,19,31,0.04)] transition-all duration-300 hover:border-champagne-gold/50 hover:shadow-[0_16px_38px_rgba(7,19,31,0.08)] sm:p-5"
                  >
                    <div className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full bg-soft-cream blur-[55px]" />

                    <div className="relative flex gap-4">
                      <Link
                        to={`/shop/products/${product?._id}`}
                        onClick={closeCart}
                        className="group/image relative h-[106px] w-[92px] shrink-0 overflow-hidden rounded-[14px] border border-light-champagne/80 bg-soft-cream sm:h-[116px] sm:w-[104px]"
                      >
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={product?.name || "Product"}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover/image:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[8px] uppercase tracking-[0.15em] text-steel-gray">
                            No Image
                          </div>
                        )}

                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-luxury-black/10 to-transparent" />
                      </Link>

                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex justify-between gap-3">
                          <div className="min-w-0">
                            <Link
                              to={`/shop/products/${product?._id}`}
                              onClick={closeCart}
                              className="block truncate font-serif text-[1.15rem] font-normal leading-tight tracking-[-0.02em] text-midnight-navy transition-colors duration-300 hover:text-antique-gold"
                            >
                              {product?.name}
                            </Link>

                            {variantName && (
                              <p className="mt-1.5 truncate text-[10px] text-slate-gray">
                                {variantName}
                              </p>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => removeFromCart(item._id)}
                            className="shrink-0 self-start text-[7px] font-semibold uppercase tracking-[0.18em] text-steel-gray transition-colors duration-300 hover:text-antique-gold"
                          >
                            Remove
                          </button>
                        </div>

                        <div className="mt-auto pt-3">
                          <p className="font-serif text-[1.05rem] font-normal text-midnight-navy">
                            {itemUnitPrice.toLocaleString()}{" "}
                            <span className="font-sans text-[8px] font-semibold uppercase tracking-[0.1em] text-slate-gray">
                              EGP
                            </span>
                          </p>

                          {technologyPrice > 0 && (
                            <p className="mt-1 text-[8px] leading-4 text-steel-gray">
                              {basePrice.toLocaleString()} EGP
                              {" + "}
                              {technologyPrice.toLocaleString()} EGP
                              {" technology"}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {variant && (
                      <div className="relative mt-4 rounded-[16px] border border-light-champagne/80 bg-warm-ivory/70 p-4">
                        <div className="mb-3 flex items-center gap-2.5">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-midnight-navy text-[7px] text-champagne-gold">
                            ✦
                          </span>

                          <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-midnight-navy">
                            Variant
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                          {variant.color && (
                            <p className="text-[10px] text-slate-gray">
                              <span className="font-semibold text-midnight-navy">
                                Color:
                              </span>{" "}
                              {variant.color}
                            </p>
                          )}

                          {variant.size && (
                            <p className="text-[10px] text-slate-gray">
                              <span className="font-semibold text-midnight-navy">
                                Size:
                              </span>{" "}
                              {variant.size}
                            </p>
                          )}

                          {variant.material && (
                            <p className="text-[10px] text-slate-gray">
                              <span className="font-semibold text-midnight-navy">
                                Material:
                              </span>{" "}
                              {variant.material}
                            </p>
                          )}

                          {variant.finish && (
                            <p className="text-[10px] text-slate-gray">
                              <span className="font-semibold text-midnight-navy">
                                Finish:
                              </span>{" "}
                              {variant.finish}
                            </p>
                          )}
                        </div>

                        {variant.sku && (
                          <p className="mt-3 border-t border-light-champagne/80 pt-3 text-[8px] uppercase tracking-[0.08em] text-steel-gray">
                            SKU: {variant.sku}
                          </p>
                        )}

                        <p className="mt-3 text-[10px] font-semibold text-antique-gold">
                          Price: {basePrice.toLocaleString()} EGP
                        </p>
                      </div>
                    )}

                    {productTechnology && (
                      <div className="relative mt-3 overflow-hidden rounded-[16px] border border-champagne-gold/25 bg-soft-cream/75 p-4">
                        <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-champagne-gold/10 blur-[35px]" />

                        <div className="relative mb-3 flex items-center gap-2.5">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-midnight-navy text-[7px] text-champagne-gold">
                            ✦
                          </span>

                          <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-midnight-navy">
                            Technology
                          </p>
                        </div>

                        {technologyType && (
                          <p className="relative text-[10px] text-slate-gray">
                            <span className="font-semibold text-midnight-navy">
                              Type:
                            </span>{" "}
                            {technologyType}
                          </p>
                        )}

                        {technologyName && (
                          <p className="relative mt-1.5 text-[10px] text-slate-gray">
                            <span className="font-semibold text-midnight-navy">
                              Model:
                            </span>{" "}
                            {technologyName}
                          </p>
                        )}

                        {technologyPrice > 0 ? (
                          <p className="relative mt-2.5 text-[10px] font-semibold text-antique-gold">
                            + {technologyPrice.toLocaleString()} EGP
                          </p>
                        ) : (
                          <p className="relative mt-2.5 text-[10px] text-slate-gray">
                            Included
                          </p>
                        )}

                        <div className="relative mt-3 flex flex-wrap gap-1.5">
                          {technologyModel?.requiresBattery && (
                            <span className="rounded-full border border-champagne-gold/20 bg-champagne-gold/15 px-2.5 py-1 text-[7px] font-semibold uppercase tracking-[0.08em] text-antique-gold">
                              Battery
                            </span>
                          )}

                          {technologyModel?.requiresActivation && (
                            <span className="rounded-full border border-light-champagne bg-soft-white/70 px-2.5 py-1 text-[7px] font-semibold uppercase tracking-[0.08em] text-slate-gray">
                              Activation
                            </span>
                          )}

                          {technologyModel?.requiresSubscription && (
                            <span className="rounded-full border border-light-champagne bg-soft-white/70 px-2.5 py-1 text-[7px] font-semibold uppercase tracking-[0.08em] text-slate-gray">
                              Subscription
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="relative mt-4 flex items-end justify-between border-t border-light-champagne/80 pt-4">
                      <div>
                        {itemQuantity > 1 && (
                          <p className="mb-1 text-[8px] text-steel-gray">
                            {itemQuantity} × {itemUnitPrice.toLocaleString()}{" "}
                            EGP
                          </p>
                        )}

                        <p className="text-[7px] font-semibold uppercase tracking-[0.2em] text-steel-gray">
                          Total
                        </p>

                        <p className="mt-1 font-serif text-[1.25rem] font-normal text-midnight-navy">
                          {itemTotal.toLocaleString()}{" "}
                          <span className="font-sans text-[8px] font-semibold uppercase tracking-[0.08em] text-slate-gray">
                            EGP
                          </span>
                        </p>
                      </div>

                      <div className="flex items-center overflow-hidden rounded-full border border-light-champagne bg-soft-white shadow-[0_5px_16px_rgba(7,19,31,0.035)]">
                        <button
                          type="button"
                          disabled={itemQuantity <= 1}
                          onClick={() =>
                            updateQuantity(item._id, itemQuantity - 1)
                          }
                          className="flex h-9 w-9 items-center justify-center text-[15px] text-midnight-navy transition-all duration-300 hover:bg-midnight-navy hover:text-soft-white disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          −
                        </button>

                        <span className="flex h-9 min-w-10 items-center justify-center border-x border-light-champagne px-2 text-[10px] font-semibold text-midnight-navy">
                          {itemQuantity}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item._id, itemQuantity + 1)
                          }
                          className="flex h-9 w-9 items-center justify-center text-[15px] text-midnight-navy transition-all duration-300 hover:bg-midnight-navy hover:text-soft-white"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="relative overflow-hidden border-t border-champagne-gold/15 bg-midnight-navy px-6 py-6 text-soft-white shadow-[0_-14px_35px_rgba(7,19,31,0.08)] sm:px-7">
            <div className="pointer-events-none absolute -bottom-24 -right-20 h-48 w-48 rounded-full bg-champagne-gold/10 blur-[65px]" />

            <div className="pointer-events-none absolute -left-20 -top-20 h-40 w-40 rounded-full border border-champagne-gold/10" />

            <div className="relative">
              <div className="mb-5 flex items-end justify-between gap-5">
                <div>
                  <p className="text-[7px] font-semibold uppercase tracking-[0.3em] text-premium-silver/50">
                    Order Summary
                  </p>

                  <span className="mt-1.5 block font-serif text-[1.25rem] font-normal text-soft-white">
                    Subtotal
                  </span>
                </div>

                <span className="text-right font-serif text-[1.65rem] font-normal text-champagne-gold">
                  {Number(cartTotal || 0).toLocaleString()}{" "}
                  <span className="font-sans text-[8px] font-semibold uppercase tracking-[0.1em]">
                    EGP
                  </span>
                </span>
              </div>

              <div className="mb-5 flex items-center gap-3">
                <span className="h-px flex-1 bg-gradient-to-r from-transparent to-champagne-gold/20" />

                <span className="text-[7px] text-classic-gold">✦</span>

                <span className="h-px flex-1 bg-gradient-to-l from-transparent to-champagne-gold/20" />
              </div>

              <Link
                to="/cart"
                onClick={closeCart}
                className="group flex min-h-[52px] w-full items-center justify-center gap-8 rounded-[13px] bg-soft-white px-6 text-[9px] font-semibold uppercase tracking-[0.12em] text-midnight-navy shadow-[0_12px_30px_rgba(0,0,0,0.16)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-warm-ivory hover:shadow-[0_16px_35px_rgba(0,0,0,0.22)]"
              >
                View Cart
                <span className="text-[15px] text-classic-gold transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </Link>

              <p className="mt-4 text-center text-[7px] font-semibold uppercase tracking-[0.28em] text-premium-silver/35">
                Elegant · Personal · Smart
              </p>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
};

export default CartDrawer;
