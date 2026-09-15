
import { useTranslation } from "react-i18next";

import getMediaUrl from "../utils/mediaUrl";

const getLocalizedText = (
  value,
  language,
  fallback = "",
) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return fallback;
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "object") {
    return (
      value?.[language] ||
      value?.en ||
      value?.ar ||
      fallback
    );
  }

  return String(value);
};

const ProductInfoCard = ({
  experience,
}) => {
  const {
    t,
    i18n,
  } = useTranslation();

  const activeLanguage =
    i18n.language === "ar"
      ? "ar"
      : "en";

  if (!experience) {
    return null;
  }

  const product =
    experience.product;

  const image =
    getMediaUrl(
      product?.primaryImage ||
        product?.image,
    ) ||
    "/placeholder.png";

  return (
    <section className="relative overflow-hidden rounded-[32px] border border-light-champagne/80 bg-soft-white/90 shadow-[0_24px_70px_rgba(7,19,31,0.07)]">
      <div className="relative flex items-center justify-between border-b border-light-champagne/70 bg-warm-ivory/45 px-6 py-5 sm:px-8">
        <div className="flex items-center gap-3">
          <span className="h-px w-8 bg-classic-gold/70" />

          <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-antique-gold">
            {t("manageExperience.smartJewelry")}
          </span>
        </div>
      </div>

      <div className="p-5 sm:p-8 lg:p-10">
        <div className="group relative overflow-hidden rounded-[26px] border border-light-champagne bg-soft-cream">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.9),rgba(248,245,240,0.25)_55%,rgba(216,196,160,0.12))]" />

          <div className="relative flex aspect-[4/3] items-center justify-center p-8 sm:p-12 lg:p-16">
            <img
              src={image}
              alt={getLocalizedText(
                product?.name,
                activeLanguage,
                t("manageExperience.jewelryProduct"),
              )}
              className="h-full w-full object-contain drop-shadow-[0_22px_28px_rgba(7,19,31,0.14)] transition-transform duration-700 ease-out group-hover:scale-[1.035]"
              onError={(
                event,
              ) => {
                event.currentTarget.src =
                  "/placeholder.png";
              }}
            />
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-rich-navy/5 to-transparent" />
        </div>
      </div>
    </section>
  );
};

export default ProductInfoCard;
