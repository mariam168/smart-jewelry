
import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import { useTranslation } from "react-i18next";

import { getHomeData } from "../services/homeApi";

const NfcIcon = ({ className = "" }) => {
  return (
    <span
      className={`relative flex h-7 w-8 items-center justify-center ${className}`}
      aria-hidden="true"
    >
      <span className="absolute bottom-[5px] h-[5px] w-[5px] rounded-full bg-current" />
      <span className="absolute bottom-[4px] h-[11px] w-[17px] rounded-t-full border-t-2 border-current" />
      <span className="absolute bottom-[1px] h-[18px] w-[27px] rounded-t-full border-t-2 border-current" />
    </span>
  );
};

const getLocalizedValue = (value, language) => {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  return value[language] || value.en || value.ar || "";
};

const getImageUrl = (image) => {
  if (!image) {
    return "";
  }

  if (
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("data:") ||
    image.startsWith("blob:")
  ) {
    return image;
  }

  const apiUrl =
    import.meta.env.VITE_BACKEND_URL ||
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000";

  const backendUrl = apiUrl
    .replace(/\/api\/?$/, "")
    .replace(/\/$/, "");

  return `${backendUrl}/${image.replace(/^\/+/, "")}`;
};

const HeroSection = () => {
  const { i18n } = useTranslation();

  const isRtl = i18n.language === "ar";

  const [hero, setHero] = useState(null);

  useEffect(() => {
    const loadHero = async () => {
      try {
        const response = await getHomeData();

        if (response?.success) {
          setHero(response.data?.hero || null);
        }
      } catch (error) {
        console.error("Failed to load hero section:", error);
      }
    };

    loadHero();
  }, []);

  if (!hero) {
    return null;
  }

  const imageUrl = getImageUrl(hero.image);

  return (
    <section className="relative overflow-hidden bg-warm-ivory">
      <div className="relative min-h-[740px] sm:min-h-[720px] lg:min-h-[690px]">
        <div className="absolute inset-0">
          {imageUrl && (
            <img
              src={imageUrl}
              alt={getLocalizedValue(hero.imageAlt, i18n.language)}
              className={`h-full w-full object-cover duration-0 transition-transform lg:hover:scale-[1.01] lg:hover:duration-[1400ms] ${
                isRtl ? "-scale-x-100" : "scale-x-100"
              }`}
              style={{
                objectPosition: "center center",
              }}
            />
          )}

          <div className="pointer-events-none absolute inset-0 bg-warm-ivory/20 lg:hidden" />

          <div
            className={`pointer-events-none absolute inset-0 hidden lg:block ${
              isRtl
                ? "bg-gradient-to-l from-warm-ivory via-warm-ivory/95 via-[45%] to-transparent"
                : "bg-gradient-to-r from-warm-ivory via-warm-ivory/95 via-[45%] to-transparent"
            }`}
          />

          <div
            className={`pointer-events-none absolute inset-y-0 hidden w-[35%] backdrop-blur-[1px] lg:block ${
              isRtl
                ? "right-0 bg-gradient-to-l from-warm-ivory/90 to-transparent"
                : "left-0 bg-gradient-to-r from-warm-ivory/90 to-transparent"
            }`}
          />

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-warm-ivory via-warm-ivory/20 to-transparent" />
        </div>

        <div className="relative z-10 mx-auto flex min-h-[740px] max-w-[1440px] items-center px-5 pb-36 pt-16 sm:px-8 lg:min-h-[690px] lg:px-12 xl:px-16">
          <div
            className={`w-full max-w-[610px] text-center ${
              isRtl
                ? "lg:mr-0 lg:ml-auto lg:text-right"
                : "lg:ml-0 lg:mr-auto lg:text-left"
            }`}
          >
            <div
              className={`mb-6 flex items-center justify-center gap-3 sm:mb-7 ${
                isRtl ? "lg:justify-start" : "lg:justify-start"
              }`}
            >
              <span className="hidden h-px w-8 bg-classic-gold/35 sm:block lg:hidden" />

              <span className="text-[9px] font-semibold uppercase tracking-[0.32em] text-midnight-navy sm:text-[10px] lg:text-[11px]">
                {getLocalizedValue(hero.eyebrow, i18n.language)}
              </span>

              <span className="text-[10px] text-classic-gold">
                ✦
              </span>

              <span className="h-px w-8 bg-classic-gold/40 sm:w-10" />
            </div>

            <h1 className="font-serif text-[3rem] font-normal leading-[1.1] tracking-[-0.045em] text-midnight-navy min-[390px]:text-[3.35rem] sm:text-[4.1rem] lg:text-[4.8rem] xl:text-[5.25rem]">
              {getLocalizedValue(hero.titlePart1, i18n.language)}

              <span
                className={`mt-1.5 block font-serif font-normal text-navy-soft sm:mt-2 ${
                  isRtl ? "not-italic" : "italic"
                }`}
              >
                {getLocalizedValue(hero.titlePart2, i18n.language)}
              </span>
            </h1>

            <p className="mx-auto mt-7 max-w-[460px] text-[13px] leading-[1.9] text-midnight-navy/85 sm:mt-8 sm:text-[14px] lg:mx-0 lg:max-w-[480px] lg:text-[16px]">
              {getLocalizedValue(hero.description, i18n.language)}
            </p>

            <div className="mt-8 flex justify-center sm:mt-9 lg:justify-start">
              <Link
                to="/shop"
                className="group relative inline-flex min-h-[56px] w-full items-center justify-between overflow-hidden rounded-[14px] bg-midnight-navy px-7 text-[10px] font-semibold uppercase tracking-[0.1em] text-soft-white shadow-lg transition-all hover:-translate-y-0.5 sm:w-auto sm:min-w-[245px]"
              >
                <span>
                  {getLocalizedValue(hero.cta, i18n.language)}
                </span>

                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full bg-soft-white/[0.1] text-[17px] transition-transform ${
                    isRtl
                      ? "group-hover:-translate-x-1"
                      : "group-hover:translate-x-1"
                  }`}
                >
                  {isRtl ? "←" : "→"}
                </span>
              </Link>
            </div>
          </div>
        </div>

        <div
          className={`absolute bottom-8 z-20 transition-all duration-500 max-sm:left-1/2 max-sm:-translate-x-1/2 ${
            isRtl
              ? "left-8 lg:left-12 xl:left-16"
              : "right-8 lg:right-12 xl:right-16"
          }`}
        >
          <div className="flex h-[100px] w-[100px] flex-col items-center justify-center rounded-full border border-soft-white/90 bg-soft-white/90 shadow-xl backdrop-blur-md sm:h-[116px] sm:w-[116px]">
            <NfcIcon className="mb-1 text-midnight-navy" />

            <span className="text-[13px] font-medium uppercase tracking-[0.09em] text-midnight-navy">
              {getLocalizedValue(hero.badge?.nfc, i18n.language)}
            </span>

            <span className="text-[7px] font-semibold uppercase opacity-60">
              {getLocalizedValue(hero.badge?.subtext, i18n.language)}
            </span>
          </div>
        </div>
      </div>

      <div className="border-y border-light-champagne/90 bg-soft-white/95">
        <div className="mx-auto grid max-w-[1360px] grid-cols-1 divide-y divide-light-champagne/90 px-5 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:rtl:divide-x-reverse lg:px-8">
          <BenefitItem
            icon="✦"
            title={getLocalizedValue(
              hero.features?.design?.title,
              i18n.language,
            )}
            desc={getLocalizedValue(
              hero.features?.design?.desc,
              i18n.language,
            )}
            isRtl={isRtl}
          />

          <BenefitItem
            icon="♡"
            title={getLocalizedValue(
              hero.features?.memories?.title,
              i18n.language,
            )}
            desc={getLocalizedValue(
              hero.features?.memories?.desc,
              i18n.language,
            )}
            isRtl={isRtl}
          />

          <BenefitItem
            icon={<NfcIcon className="text-midnight-navy" />}
            title={getLocalizedValue(
              hero.features?.nfc?.title,
              i18n.language,
            )}
            desc={getLocalizedValue(
              hero.features?.nfc?.desc,
              i18n.language,
            )}
            isRtl={isRtl}
          />
        </div>
      </div>
    </section>
  );
};

const BenefitItem = ({
  icon,
  title,
  desc,
  isRtl,
}) => (
  <div
    className={`flex flex-col items-center justify-center gap-3 py-8 text-center sm:px-5 lg:flex-row lg:gap-5 lg:px-8 ${
      isRtl ? "lg:text-right" : "lg:text-left"
    }`}
  >
    <div className="flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-full border border-light-champagne/80 bg-warm-ivory text-classic-gold">
      {icon}
    </div>

    <div>
      <span className="block text-[10px] font-semibold uppercase text-midnight-navy">
        {title}
      </span>

      <p className="mt-1 text-[11px] leading-[1.6] text-slate-gray">
        {desc}
      </p>
    </div>
  </div>
);

export default HeroSection;
