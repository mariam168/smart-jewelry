import { useMemo } from "react";
import { Link } from "react-router-dom";
import { FaArrowRight, FaHeart } from "react-icons/fa6";

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
  if (!value) return "";

  if (typeof value === "string") {
    return value.trim();
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const result = getFilePath(item);

      if (result) {
        return result;
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
      getFilePath(value.secure_url) ||
      getFilePath(value.filename) ||
      ""
    );
  }

  return "";
};

const getImageUrl = (value) => {
  let imagePath = getFilePath(value);

  if (!imagePath) {
    return "/placeholder.png";
  }

  if (
    /^https?:\/\/localhost:5000/i.test(imagePath) ||
    /^https?:\/\/127\.0\.0\.1:5000/i.test(imagePath)
  ) {
    imagePath = imagePath.replace(
      /^https?:\/\/(?:localhost|127\.0\.0\.1):5000/i,
      "",
    );
  } else if (/^https?:\/\//i.test(imagePath)) {
    return imagePath;
  }

  if (imagePath.startsWith("//")) {
    const protocol =
      typeof window !== "undefined"
        ? window.location.protocol
        : "https:";

    return `${protocol}${imagePath}`;
  }

  if (imagePath.startsWith("/api/uploads/")) {
    imagePath = imagePath.replace(/^\/api/, "");
  }

  if (
    imagePath.startsWith("/assets/") ||
    imagePath.startsWith("/images/")
  ) {
    return imagePath;
  }

  if (!imagePath.startsWith("/")) {
    imagePath = `/${imagePath}`;
  }

  return `${BACKEND_URL}${imagePath}`;
};

const formatMoney = (value) => {
  return Number(value || 0).toLocaleString("en-EG", {
    maximumFractionDigits: 2,
  });
};

const getTechnologyLabel = (productTechnology) => {
  const technologyModel =
    productTechnology?.technologyModel || {};

  const technology =
    technologyModel?.technology || {};

  return (
    technology?.name ||
    technologyModel?.modelName ||
    productTechnology?.name ||
    "Smart Technology"
  );
};

const ProductCard = ({ product, index = 0 }) => {
  const productTechnologies = useMemo(() => {
    return Array.isArray(product?.productTechnologies)
      ? product.productTechnologies
      : [];
  }, [product?.productTechnologies]);

  const defaultTechnology = useMemo(() => {
    if (productTechnologies.length === 0) {
      return null;
    }

    const activeTechnology =
      productTechnologies.find((item) => {
        const technologyModel =
          item?.technologyModel;

        return (
          item?.isActive !== false &&
          technologyModel?.isActive !== false
        );
      });

    return activeTechnology || productTechnologies[0];
  }, [productTechnologies]);

  const basePrice = Number(product?.price || 0);

  const baseComparePrice = Number(
    product?.comparePrice || 0,
  );

  const technologyPrice = Number(
    defaultTechnology?.extraPrice || 0,
  );

  const hasTechnology =
    Boolean(defaultTechnology);

  /*
   * CARD PRICE ALWAYS INCLUDES
   * THE DEFAULT TECHNOLOGY.
   */
  const finalPrice =
    basePrice +
    (hasTechnology ? technologyPrice : 0);

  const hasDiscount =
    baseComparePrice > 0 &&
    basePrice > 0 &&
    baseComparePrice > basePrice;

  const finalComparePrice = hasDiscount
    ? baseComparePrice +
      (hasTechnology ? technologyPrice : 0)
    : 0;

  const saving = hasDiscount
    ? finalComparePrice - finalPrice
    : 0;

  const discountPercentage =
    hasDiscount && finalComparePrice > 0
      ? Math.round(
          (saving / finalComparePrice) * 100,
        )
      : 0;

  const isOutOfStock =
    Number(product?.stock || 0) <= 0;

  const imageUrl = getImageUrl(
    product?.image ||
      product?.primaryImage ||
      product?.images,
  );

  const number = String(index + 1).padStart(2, "0");

  const technologyLabel =
    getTechnologyLabel(defaultTechnology);

  const detailsUrl =
    `/shop/products/${product._id}`;

  const badge = hasDiscount
    ? `${discountPercentage}% OFF`
    : product?.newArrival
      ? "New"
      : product?.bestSeller
        ? "Bestseller"
        : product?.featured
          ? "Featured"
          : null;

  return (
    <article className="group relative h-full">
      <div className="flex h-full flex-col">
        {/* =========================================
            IMAGE
        ========================================== */}
        <div className="relative overflow-hidden rounded-[22px] bg-soft-cream">
          <Link
            to={detailsUrl}
            className="relative block"
          >
            <div className="aspect-[4/5] overflow-hidden">
              <img
                src={imageUrl}
                alt={
                  product?.name ||
                  "Jevorya jewelry"
                }
                className="h-full w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.045]"
                onError={(event) => {
                  event.currentTarget.src =
                    "/placeholder.png";
                }}
              />
            </div>

            {/* subtle luxury overlay */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-luxury-black/45 via-transparent to-luxury-black/[0.08]" />

            {/* INDEX */}
            <div className="absolute left-5 top-5">
              <span className="font-serif text-[27px] font-light italic text-soft-white/90">
                {number}
              </span>
            </div>

            {/* BADGE */}
            {badge && (
              <div className="absolute right-5 top-5">
                <span className="inline-flex items-center rounded-full border border-soft-white/30 bg-midnight-navy/80 px-3 py-1.5 text-[7px] font-semibold uppercase tracking-[0.17em] text-champagne-gold backdrop-blur-lg">
                  {badge}
                </span>
              </div>
            )}

            {/* CATEGORY */}
            <div className="absolute bottom-5 left-5">
              <div className="flex items-center gap-2.5">
                <span className="h-px w-6 bg-champagne-gold" />

                <span className="text-[7px] font-medium uppercase tracking-[0.28em] text-soft-white/90">
                  {product?.category?.name ||
                    "Jewelry"}
                </span>
              </div>
            </div>

            {/* HOVER DISCOVER */}
            <div className="absolute bottom-5 right-5 translate-y-2 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-soft-white/30 bg-soft-white/10 text-soft-white backdrop-blur-md">
                <FaArrowRight className="text-[10px]" />
              </span>
            </div>
          </Link>

          {/* WISHLIST */}
          <button
            type="button"
            aria-label="Add to wishlist"
            className="absolute right-5 top-[4.6rem] z-10 flex h-9 w-9 items-center justify-center rounded-full border border-soft-white/60 bg-soft-white/90 text-midnight-navy shadow-[0_8px_22px_rgba(7,19,31,0.1)] backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-midnight-navy hover:bg-midnight-navy hover:text-champagne-gold"
          >
            <FaHeart className="text-[9px]" />
          </button>

          {/* SOLD OUT */}
          {isOutOfStock && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-luxury-black/45 backdrop-blur-[1px]">
              <span className="rounded-full border border-soft-white/50 bg-soft-white/95 px-6 py-2.5 text-[8px] font-semibold uppercase tracking-[0.24em] text-midnight-navy">
                Sold Out
              </span>
            </div>
          )}
        </div>

        {/* =========================================
            PRODUCT INFO
        ========================================== */}
        <div className="flex flex-1 flex-col px-1 pb-2 pt-5">
          {/* SMALL EYEBROW */}
          <div className="flex items-center gap-2.5">
            <span className="h-px w-5 bg-classic-gold/75" />

            <span className="text-[7px] font-semibold uppercase tracking-[0.27em] text-antique-gold">
              Jevorya
            </span>
          </div>

          {/* NAME + PRICE */}
          <div className="mt-3 flex items-start justify-between gap-5">
            <Link
              to={detailsUrl}
              className="min-w-0"
            >
              <h3 className="font-serif text-[1.55rem] font-normal leading-[1.12] tracking-[-0.025em] text-midnight-navy transition-colors duration-300 group-hover:text-navy-soft">
                {product?.name}
              </h3>
            </Link>

            <div className="shrink-0 text-right">
              <span className="block font-serif text-[1.22rem] leading-none text-midnight-navy">
                {formatMoney(finalPrice)}
              </span>

              <span className="mt-1 block text-[7px] font-medium uppercase tracking-[0.16em] text-antique-gold">
                EGP
              </span>
            </div>
          </div>

          {/* OLD PRICE */}
          {hasDiscount && (
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[8px] uppercase tracking-[0.13em] text-antique-gold">
                Save {formatMoney(saving)} EGP
              </span>

              <span className="text-[9px] text-steel-gray/80 line-through">
                {formatMoney(finalComparePrice)} EGP
              </span>
            </div>
          )}

          {/* DESCRIPTION */}
          {(product?.shortDescription ||
            product?.description) && (
            <p className="mt-3 line-clamp-2 text-[10px] leading-[1.75] text-slate-gray/80">
              {product.shortDescription ||
                product.description}
            </p>
          )}

          {/* =========================================
              SMART TECHNOLOGY
          ========================================== */}
          {hasTechnology && (
            <div className="mt-4 border-y border-light-champagne/65 py-3.5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-midnight-navy text-[8px] text-champagne-gold">
                    ✦
                  </span>

                  <div className="min-w-0">
                    <p className="text-[6px] font-semibold uppercase tracking-[0.18em] text-antique-gold">
                      Smart Technology Included
                    </p>

                    <p className="mt-1 truncate text-[9px] font-medium text-midnight-navy">
                      {technologyLabel}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <span className="text-[8px] text-steel-gray">
                    +
                    {formatMoney(
                      technologyPrice,
                    )}
                  </span>

                  <span className="ml-1 text-[6px] uppercase tracking-[0.1em] text-steel-gray">
                    EGP
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* =========================================
              FOOTER
          ========================================== */}
          <div className="mt-auto pt-4">
            <div className="flex items-center justify-between">
              {/* STOCK */}
              <div className="flex items-center gap-2">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    isOutOfStock
                      ? "bg-steel-gray"
                      : Number(
                            product?.stock || 0,
                          ) <= 5
                        ? "bg-antique-gold"
                        : "bg-classic-gold"
                  }`}
                />

                <span className="text-[7px] font-medium uppercase tracking-[0.16em] text-steel-gray">
                  {isOutOfStock
                    ? "Unavailable"
                    : Number(
                          product?.stock || 0,
                        ) <= 5
                      ? `Only ${product.stock} left`
                      : "Available"}
                </span>
              </div>

              {/* PERSONALIZED */}
              {product?.isCustomizable && (
                <span className="text-[6px] font-semibold uppercase tracking-[0.16em] text-antique-gold">
                  Personalized
                </span>
              )}
            </div>

            {/* DISCOVER LINK */}
            <Link
              to={detailsUrl}
              className="mt-4 flex items-center justify-between border-t border-light-champagne/70 pt-4 transition-colors duration-300"
            >
              <span className="text-[7px] font-semibold uppercase tracking-[0.22em] text-midnight-navy">
                Discover Piece
              </span>

              <FaArrowRight className="text-[9px] text-antique-gold transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;