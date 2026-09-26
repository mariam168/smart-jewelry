
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
    getLocalizedText(technology?.name, language) ||
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

const ProductCard = ({
  product,
  index = 0,
}) => {
  const { t, i18n } = useTranslation();

  const isRtl = i18n.language === "ar";

  const activeLanguage = isRtl ? "ar" : "en";

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
    (hasTechnology ? technologyPrice : 0);

  const hasDiscount =
    baseComparePrice > 0 &&
    basePrice > 0 &&
    baseComparePrice > basePrice;

  const finalComparePrice = hasDiscount
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
          (saving / finalComparePrice) *
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

  const number = String(
    index + 1,
  ).padStart(2, "0");

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

  const detailsUrl = `/shop/products/${product._id}`;

  const badge = hasDiscount
    ? `${discountPercentage}% ${t(
        "productCard.off",
      )}`
    : product?.newArrival
      ? t("productCard.new")
      : product?.bestSeller
        ? t("productCard.bestseller")
        : product?.featured
          ? t("productCard.featured")
          : null;

  return (
    <article
      className="
        group
        relative
        h-full
      "
    >
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

          <div
            className={`
              absolute
              top-6
              z-20
              ${isRtl ? "right-6" : "left-6"}
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

          {badge && (
            <div
              className={`
                absolute
                top-5
                z-20
                ${isRtl ? "left-5" : "right-5"}
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
                  px-3
                  py-1.5
                  text-[6px]
                  font-bold
                  uppercase
                  tracking-[0.15em]
                  text-[#E2C681]
                  shadow-lg
                  backdrop-blur-xl
                  sm:px-4
                  sm:py-2
                  sm:text-[7px]
                  sm:tracking-[0.2em]
                "
              >
                {badge}
              </span>
            </div>
          )}

          <div
            className={`
              absolute
              bottom-6
              z-20
              ${isRtl ? "right-6" : "left-6"}
            `}
          >
            <div
              className={`
                flex
                items-center
                gap-2.5
                ${isRtl ? "flex-row-reverse" : ""}
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
                  text-[6px]
                  font-semibold
                  uppercase
                  tracking-[0.2em]
                  text-white/90
                  sm:text-[7px]
                  sm:tracking-[0.28em]
                "
              >
                {categoryName ||
                  t("productCard.jewelry")}
              </span>
            </div>
          </div>

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
              ${isRtl ? "left-5" : "right-5"}
            `}
          >
            <span
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-full
                border
                border-white/35
                bg-white/15
                text-white
                backdrop-blur-lg
                sm:h-11
                sm:w-11
              "
            >
              <FaArrowRight
                className={`
                  text-[8px]
                  sm:text-[9px]
                  ${isRtl ? "rotate-180" : ""}
                `}
              />
            </span>
          </div>
        </Link>

        <button
          type="button"
          aria-label={t(
            "productCard.addToWishlist",
          )}
          className={`
            absolute
            top-14
            z-30
            flex
            h-8
            w-8
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
            sm:top-16
            sm:h-10
            sm:w-10
            ${isRtl ? "left-5" : "right-5"}
          `}
        >
          <FaHeart className="text-[8px] sm:text-[9px]" />
        </button>

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
                px-5
                py-2.5
                text-[7px]
                font-bold
                uppercase
                tracking-[0.2em]
                text-[#07131F]
                shadow-2xl
                sm:px-8
                sm:py-3
                sm:text-[8px]
                sm:tracking-[0.3em]
              "
            >
              {t("productCard.soldOut")}
            </span>
          </div>
        )}
      </div>

      <div
        className={`
          px-0.5
          pt-4
          sm:px-1
          sm:pt-6
          ${isRtl ? "text-right" : "text-left"}
        `}
      >
        <div
          className={`
            flex
            items-center
            gap-1.5
            sm:gap-2
            ${isRtl ? "flex-row-reverse" : ""}
          `}
        >
          <span
            className="
              h-px
              w-4
              bg-[#C9A75E]
              sm:w-6
            "
          />

          <span
            className="
              text-[6px]
              font-bold
              uppercase
              tracking-[0.2em]
              text-[#9D8350]
              sm:text-[7px]
              sm:tracking-[0.3em]
            "
          >
            Jevorya
          </span>

          <span
            className="
              text-[5px]
              text-[#C9A75E]
              sm:text-[6px]
            "
          >
            ✦
          </span>
        </div>

        <div className="mt-2 sm:mt-3">
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
                text-[17px]
                font-normal
                leading-[1.15]
                tracking-[-0.025em]
                text-[#07131F]
                transition-colors
                duration-300
                group-hover:text-[#A7864C]
                sm:text-[24px]
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
            mt-2
            flex
            items-center
            justify-between
            gap-2
            sm:mt-3
            sm:gap-4
            ${isRtl ? "flex-row-reverse" : ""}
          `}
        >
          {/* Main Price */}
          <div
            className={`
              flex
              items-baseline
              gap-1.5
              sm:gap-2
              ${isRtl ? "flex-row-reverse" : ""}
            `}
          >
            <span
              className="
                text-[16px]
                font-bold
                tracking-[-0.04em]
                text-[#07131F]
                sm:text-[21px]
              "
            >
              {formatMoney(finalPrice)}
            </span>

            <span
              className="
                text-[6px]
                font-bold
                uppercase
                tracking-[0.15em]
                text-[#8D877D]
                sm:text-[7px]
                sm:tracking-[0.2em]
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
                gap-1
                sm:gap-2
                ${isRtl ? "flex-row-reverse" : ""}
              `}
            >
              <span
                className="
                  text-[7px]
                  text-[#9C968D]
                  line-through
                  sm:text-[9px]
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
                  px-1.5
                  py-0.5
                  text-[6px]
                  font-bold
                  tracking-[0.05em]
                  text-[#9A783D]
                  sm:px-2
                  sm:py-1
                  sm:text-[7px]
                  sm:tracking-[0.08em]
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
              mt-1.5
              flex
              sm:mt-2
              ${isRtl
                ? "justify-end"
                : "justify-start"}
            `}
          >
            <span
              className="
                text-[6px]
                font-semibold
                uppercase
                tracking-[0.1em]
                text-[#A7864C]
                sm:text-[7px]
                sm:tracking-[0.15em]
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
              mt-2
              line-clamp-2
              max-w-[96%]
              text-[8px]
              leading-[1.7]
              text-[#888278]
              sm:mt-3
              sm:text-[10px]
              sm:leading-[1.8]
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
              mt-4
              rounded-[14px]
              border
              border-[#E9E0D2]
              bg-[#FAF7F1]
              px-2.5
              py-2.5
              transition-all
              duration-300
              group-hover:border-[#D9C79F]
              sm:mt-5
              sm:rounded-[18px]
              sm:px-3.5
              sm:py-3
            "
          >
            <div
              className={`
                flex
                items-center
                justify-between
                gap-2
                sm:gap-3
                ${isRtl
                  ? "flex-row-reverse"
                  : ""}
              `}
            >
              <div
                className={`
                  flex
                  min-w-0
                  items-center
                  gap-2
                  sm:gap-3
                  ${isRtl
                    ? "flex-row-reverse"
                    : ""}
                `}
              >
                <span
                  className="
                    flex
                    h-7
                    w-7
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-[#07131F]
                    text-[7px]
                    text-[#D9B96E]
                    sm:h-8
                    sm:w-8
                    sm:text-[8px]
                  "
                >
                  ✦
                </span>

                <div className="min-w-0">
                  <p
                    className="
                      text-[5px]
                      font-bold
                      uppercase
                      tracking-[0.12em]
                      text-[#A7864C]
                      sm:text-[6px]
                      sm:tracking-[0.18em]
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
                      text-[8px]
                      font-medium
                      text-[#07131F]
                      sm:text-[9px]
                    "
                  >
                    {technologyLabel}
                  </p>
                </div>
              </div>

              <span
                className="
                  shrink-0
                  text-[7px]
                  font-semibold
                  text-[#777168]
                  sm:text-[8px]
                "
              >
                +{formatMoney(
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
            mt-4
            border-t
            border-[#E9E0D2]
            pt-3
            sm:mt-5
            sm:pt-4
          "
        >
          <Link
            to={detailsUrl}
            className={`
              group/discover
              flex
              items-center
              justify-between
              ${isRtl
                ? "flex-row-reverse"
                : ""}
            `}
          >
            <div
              className={`
                flex
                items-center
                gap-1.5
                sm:gap-2
                ${isRtl
                  ? "flex-row-reverse"
                  : ""}
              `}
            >
              <span
                className="
                  h-px
                  w-3
                  bg-[#C9A75E]
                  transition-all
                  duration-300
                  group-hover/discover:w-7
                  sm:w-4
                "
              />

              <span
                className="
                  text-[6px]
                  font-bold
                  uppercase
                  tracking-[0.18em]
                  text-[#07131F]
                  transition-colors
                  duration-300
                  group-hover/discover:text-[#A7864C]
                  sm:text-[7px]
                  sm:tracking-[0.25em]
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
                h-6
                w-6
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
                sm:h-7
                sm:w-7
              "
            >
              <FaArrowRight
                className={`
                  text-[6px]
                  transition-transform
                  duration-300
                  group-hover/discover:translate-x-0.5
                  sm:text-[7px]
                  ${isRtl
                    ? "rotate-180"
                    : ""}
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
