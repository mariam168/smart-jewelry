import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
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

const getLocalizedText = (value, language = "en") => {
  if (
    value &&
    typeof value === "object" &&
    !Array.isArray(value)
  ) {
    return value[language] || value.en || value.ar || "";
  }

  return value || "";
};

const getTechnologyLabel = (
  productTechnology,
  language = "en",
) => {
  const technologyModel =
    productTechnology?.technologyModel || {};

  const technology =
    technologyModel?.technology || {};

  return (
    getLocalizedText(
      technology?.name,
      language,
    ) ||
    getLocalizedText(
      technologyModel?.modelName,
      language,
    ) ||
    getLocalizedText(
      productTechnology?.name,
      language,
    ) ||
    "Smart Technology"
  );
};

const ProductCard = ({ product, index = 0 }) => {
  const { t, i18n } = useTranslation();

  const isRtl = i18n.language === "ar";

  const activeLanguage = isRtl
    ? "ar"
    : "en";

  const productTechnologies = useMemo(() => {
    return Array.isArray(
      product?.productTechnologies,
    )
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

    return (
      activeTechnology ||
      productTechnologies[0]
    );
  }, [productTechnologies]);

  const basePrice = Number(
    product?.price || 0,
  );

  const baseComparePrice = Number(
    product?.comparePrice || 0,
  );

  const technologyPrice = Number(
    defaultTechnology?.extraPrice || 0,
  );

  const hasTechnology =
    Boolean(defaultTechnology);

  const finalPrice =
    basePrice +
    (hasTechnology
      ? technologyPrice
      : 0);

  const hasDiscount =
    baseComparePrice > 0 &&
    basePrice > 0 &&
    baseComparePrice > basePrice;

  const finalComparePrice =
    hasDiscount
      ? baseComparePrice +
        (hasTechnology
          ? technologyPrice
          : 0)
      : 0;

  const saving = hasDiscount
    ? finalComparePrice - finalPrice
    : 0;

  const discountPercentage =
    hasDiscount &&
    finalComparePrice > 0
      ? Math.round(
          (saving /
            finalComparePrice) *
            100,
        )
      : 0;

  const isOutOfStock =
    Number(product?.stock || 0) <= 0;

  const imageUrl = getImageUrl(
    product?.image ||
      product?.primaryImage ||
      product?.images,
  );

  const number = String(index + 1).padStart(
    2,
    "0",
  );

  const technologyLabel =
    getTechnologyLabel(
      defaultTechnology,
      activeLanguage,
    );

  const productName =
    getLocalizedText(
      product?.name,
      activeLanguage,
    );

  const productShortDescription =
    getLocalizedText(
      product?.shortDescription,
      activeLanguage,
    );

  const productDescription =
    getLocalizedText(
      product?.description,
      activeLanguage,
    );

  const categoryName =
    getLocalizedText(
      product?.category?.name,
      activeLanguage,
    );

  const detailsUrl =
    `/shop/products/${product._id}`;

  const badge = hasDiscount
    ? `${discountPercentage}% ${t(
        "productCard.off",
      )}`
    : product?.newArrival
      ? t("productCard.new")
      : product?.bestSeller
        ? t(
            "productCard.bestseller",
          )
        : product?.featured
          ? t(
              "productCard.featured",
            )
          : null;

  return (
    <article
      className="
        group
        relative
        h-full
      "
    >
      {/* =====================================================
          IMAGE AREA
      ===================================================== */}

      <div
        className="
          relative
          overflow-hidden
          rounded-[30px]
          bg-[#F1EDE5]
          shadow-[0_12px_35px_rgba(7,19,31,0.045)]
          transition-all
          duration-700
          group-hover:shadow-[0_22px_55px_rgba(7,19,31,0.10)]
        "
      >
        {/* Thin luxury frame */}

        <div
          className="
            pointer-events-none
            absolute
            inset-2
            z-10
            rounded-[24px]
            border
            border-white/15
            opacity-70
            transition-all
            duration-700
            group-hover:inset-3
            group-hover:border-[#D9B96E]/35
          "
        />

        <Link
          to={detailsUrl}
          className="
            relative
            block
            aspect-[4/5]
            overflow-hidden
          "
        >
          <img
            src={imageUrl}
            alt={
              productName ||
              t("productCard.jewelry")
            }
            className="
              h-full
              w-full
              object-cover
              transition-transform
              duration-[1500ms]
              ease-[cubic-bezier(.16,1,.3,1)]
              group-hover:scale-[1.055]
            "
            onError={(event) => {
              event.currentTarget.src =
                "/placeholder.png";
            }}
          />

          {/* Dark cinematic gradient */}

          <div
            className="
              pointer-events-none
              absolute
              inset-0
              bg-gradient-to-t
              from-[#07131F]/70
              via-[#07131F]/10
              to-transparent
            "
          />

          {/* Soft light */}

          <div
            className="
              pointer-events-none
              absolute
              -right-20
              -top-20
              h-48
              w-48
              rounded-full
              bg-white/10
              blur-3xl
            "
          />

          {/* =================================================
              INDEX
          ================================================= */}

          <div
            className={`
              absolute
              top-6
              z-20
              ${
                isRtl
                  ? "right-6"
                  : "left-6"
              }
            `}
          >
            <div
              className="
                flex
                items-center
                gap-2
              "
            >
              <span
                className="
                  h-px
                  w-5
                  bg-[#D9B96E]/80
                "
              />

              <span
                className="
                  font-serif
                  text-[11px]
                  tracking-[0.18em]
                  text-white/80
                "
              >
                {number}
              </span>
            </div>
          </div>

          {/* =================================================
              BADGE
          ================================================= */}

          {badge && (
            <div
              className={`
                absolute
                top-5
                z-20
                ${
                  isRtl
                    ? "left-5"
                    : "right-5"
                }
              `}
            >
              <span
                className="
                  inline-flex
                  items-center
                  rounded-full
                  border
                  border-white/30
                  bg-[#07131F]/75
                  px-4
                  py-2
                  text-[7px]
                  font-bold
                  uppercase
                  tracking-[0.2em]
                  text-[#E2C681]
                  shadow-lg
                  backdrop-blur-xl
                "
              >
                {badge}
              </span>
            </div>
          )}

          {/* =================================================
              CATEGORY
          ================================================= */}

          <div
            className={`
              absolute
              bottom-6
              z-20
              ${
                isRtl
                  ? "right-6"
                  : "left-6"
              }
            `}
          >
            <div
              className={`
                flex
                items-center
                gap-2.5
                ${
                  isRtl
                    ? "flex-row-reverse"
                    : ""
                }
              `}
            >
              <span
                className="
                  h-px
                  w-7
                  bg-[#D9B96E]
                  transition-all
                  duration-500
                  group-hover:w-12
                "
              />

              <span
                dir={
                  activeLanguage === "ar"
                    ? "rtl"
                    : "ltr"
                }
                className="
                  text-[7px]
                  font-semibold
                  uppercase
                  tracking-[0.28em]
                  text-white/90
                "
              >
                {categoryName ||
                  t("productCard.jewelry")}
              </span>
            </div>
          </div>

          {/* =================================================
              VIEW ARROW
          ================================================= */}

          <div
            className={`
              absolute
              bottom-5
              z-20
              translate-y-3
              opacity-0
              transition-all
              duration-500
              group-hover:translate-y-0
              group-hover:opacity-100
              ${
                isRtl
                  ? "left-5"
                  : "right-5"
              }
            `}
          >
            <span
              className="
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-full
                border
                border-white/35
                bg-white/15
                text-white
                backdrop-blur-lg
              "
            >
              <FaArrowRight
                className={`
                  text-[9px]
                  ${
                    isRtl
                      ? "rotate-180"
                      : ""
                  }
                `}
              />
            </span>
          </div>
        </Link>

        {/* ===================================================
            WISHLIST
        =================================================== */}

        <button
          type="button"
          aria-label={t(
            "productCard.addToWishlist",
          )}
          className={`
            absolute
            top-16
            z-30
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-full
            border
            border-white/60
            bg-white/90
            text-[#07131F]
            shadow-[0_8px_25px_rgba(7,19,31,0.15)]
            backdrop-blur-md
            transition-all
            duration-300
            hover:scale-110
            hover:border-[#07131F]
            hover:bg-[#07131F]
            hover:text-[#D9B96E]
            ${
              isRtl
                ? "left-5"
                : "right-5"
            }
          `}
        >
          <FaHeart className="text-[9px]" />
        </button>

        {/* ===================================================
            SOLD OUT
        =================================================== */}

        {isOutOfStock && (
          <div
            className="
              absolute
              inset-0
              z-40
              flex
              items-center
              justify-center
              bg-[#07131F]/55
              backdrop-blur-[3px]
            "
          >
            <span
              className="
                rounded-full
                border
                border-white/40
                bg-white
                px-8
                py-3
                text-[8px]
                font-bold
                uppercase
                tracking-[0.3em]
                text-[#07131F]
                shadow-2xl
              "
            >
              {t(
                "productCard.soldOut",
              )}
            </span>
          </div>
        )}
      </div>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div
        className={`
          px-1
          pt-6
          ${
            isRtl
              ? "text-right"
              : "text-left"
          }
        `}
      >
        {/* =================================================
            BRAND
        ================================================= */}

        <div
          className={`
            flex
            items-center
            gap-2
            ${
              isRtl
                ? "flex-row-reverse"
                : ""
            }
          `}
        >
          <span
            className="
              h-px
              w-6
              bg-[#C9A75E]
            "
          />

          <span
            className="
              text-[7px]
              font-bold
              uppercase
              tracking-[0.3em]
              text-[#9D8350]
            "
          >
            Jevorya
          </span>

          <span
            className="
              text-[6px]
              text-[#C9A75E]
            "
          >
            ✦
          </span>
        </div>

        {/* =================================================
            NAME
        ================================================= */}

        <div className="mt-3">
          <Link to={detailsUrl}>
            <h3
              dir={
                activeLanguage === "ar"
                  ? "rtl"
                  : "ltr"
              }
              className="
                line-clamp-1
                font-serif
                text-[24px]
                font-normal
                leading-[1.15]
                tracking-[-0.025em]
                text-[#07131F]
                transition-colors
                duration-300
                group-hover:text-[#A7864C]
              "
            >
              {productName}
            </h3>
          </Link>
        </div>

        {/* =================================================
            PRICE ROW
        ================================================= */}

        <div
          className={`
            mt-3
            flex
            items-center
            justify-between
            gap-4
            ${
              isRtl
                ? "flex-row-reverse"
                : ""
            }
          `}
        >
          {/* Main Price */}

          <div
            className={`
              flex
              items-baseline
              gap-2
              ${
                isRtl
                  ? "flex-row-reverse"
                  : ""
              }
            `}
          >
            <span
              className="
                text-[21px]
                font-bold
                tracking-[-0.04em]
                text-[#07131F]
              "
            >
              {formatMoney(finalPrice)}
            </span>

            <span
              className="
                text-[7px]
                font-bold
                uppercase
                tracking-[0.2em]
                text-[#8D877D]
              "
            >
              EGP
            </span>
          </div>

          {/* Discount */}

          {hasDiscount && (
            <div
              className={`
                flex
                items-center
                gap-2
                ${
                  isRtl
                    ? "flex-row-reverse"
                    : ""
                }
              `}
            >
              <span
                className="
                  text-[9px]
                  text-[#9C968D]
                  line-through
                "
              >
                {formatMoney(
                  finalComparePrice,
                )}{" "}
                EGP
              </span>

              <span
                className="
                  rounded-full
                  border
                  border-[#D6BD91]
                  bg-[#FBF7EF]
                  px-2
                  py-1
                  text-[7px]
                  font-bold
                  tracking-[0.08em]
                  text-[#9A783D]
                "
              >
                -{discountPercentage}%
              </span>
            </div>
          )}
        </div>

        {/* =================================================
            SAVING
        ================================================= */}

        {hasDiscount && (
          <div
            className={`
              mt-2
              flex
              ${
                isRtl
                  ? "justify-end"
                  : "justify-start"
              }
            `}
          >
            <span
              className="
                text-[7px]
                font-semibold
                uppercase
                tracking-[0.15em]
                text-[#A7864C]
              "
            >
              {t("productCard.save")}{" "}
              {formatMoney(saving)} EGP
            </span>
          </div>
        )}

        {/* =================================================
            DESCRIPTION
        ================================================= */}

        {(productShortDescription ||
          productDescription) && (
          <p
            dir={
              activeLanguage === "ar"
                ? "rtl"
                : "ltr"
            }
            className="
              mt-3
              line-clamp-2
              max-w-[96%]
              text-[10px]
              leading-[1.8]
              text-[#888278]
            "
          >
            {productShortDescription ||
              productDescription}
          </p>
        )}

        {/* =================================================
            SMART TECHNOLOGY
        ================================================= */}

        {hasTechnology && (
          <div
            className="
              mt-5
              rounded-[18px]
              border
              border-[#E9E0D2]
              bg-[#FAF7F1]
              px-3.5
              py-3
              transition-all
              duration-300
              group-hover:border-[#D9C79F]
            "
          >
            <div
              className={`
                flex
                items-center
                justify-between
                gap-3
                ${
                  isRtl
                    ? "flex-row-reverse"
                    : ""
                }
              `}
            >
              <div
                className={`
                  flex
                  min-w-0
                  items-center
                  gap-3
                  ${
                    isRtl
                      ? "flex-row-reverse"
                      : ""
                  }
                `}
              >
                <span
                  className="
                    flex
                    h-8
                    w-8
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-[#07131F]
                    text-[8px]
                    text-[#D9B96E]
                  "
                >
                  ✦
                </span>

                <div className="min-w-0">
                  <p
                    className="
                      text-[6px]
                      font-bold
                      uppercase
                      tracking-[0.18em]
                      text-[#A7864C]
                    "
                  >
                    {t(
                      "productCard.smartTechnologyIncluded",
                    )}
                  </p>

                  <p
                    dir={
                      activeLanguage ===
                      "ar"
                        ? "rtl"
                        : "ltr"
                    }
                    className="
                      mt-0.5
                      truncate
                      text-[9px]
                      font-medium
                      text-[#07131F]
                    "
                  >
                    {technologyLabel}
                  </p>
                </div>
              </div>

              <span
                className="
                  shrink-0
                  text-[8px]
                  font-semibold
                  text-[#777168]
                "
              >
                +
                {formatMoney(
                  technologyPrice,
                )}{" "}
                EGP
              </span>
            </div>
          </div>
        )}

        {/* =================================================
            FOOTER
        ================================================= */}

        <div
          className="
            mt-5
            border-t
            border-[#E9E0D2]
            pt-4
          "
        >
          <Link
            to={detailsUrl}
            className={`
              group/discover
              flex
              items-center
              justify-between
              ${
                isRtl
                  ? "flex-row-reverse"
                  : ""
              }
            `}
          >
            <div
              className={`
                flex
                items-center
                gap-2
                ${
                  isRtl
                    ? "flex-row-reverse"
                    : ""
                }
              `}
            >
              <span
                className="
                  h-px
                  w-4
                  bg-[#C9A75E]
                  transition-all
                  duration-300
                  group-hover/discover:w-7
                "
              />

              <span
                className="
                  text-[7px]
                  font-bold
                  uppercase
                  tracking-[0.25em]
                  text-[#07131F]
                  transition-colors
                  duration-300
                  group-hover/discover:text-[#A7864C]
                "
              >
                {t(
                  "productCard.discoverPiece",
                )}
              </span>
            </div>

            <span
              className="
                flex
                h-7
                w-7
                items-center
                justify-center
                rounded-full
                border
                border-[#DDD4C6]
                text-[#07131F]
                transition-all
                duration-300
                group-hover/discover:border-[#07131F]
                group-hover/discover:bg-[#07131F]
                group-hover/discover:text-white
              "
            >
              <FaArrowRight
                className={`
                  text-[7px]
                  transition-transform
                  duration-300
                  group-hover/discover:translate-x-0.5
                  ${
                    isRtl
                      ? "rotate-180"
                      : ""
                  }
                `}
              />
            </span>
          </Link>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;