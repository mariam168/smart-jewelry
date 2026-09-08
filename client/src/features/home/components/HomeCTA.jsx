
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const HomeCTA = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";

  return (
    <section className="relative overflow-hidden bg-soft-white py-20 sm:py-24 lg:py-32">
      <div className={`pointer-events-none absolute top-1/2 h-[460px] w-[460px] -translate-y-1/2 rounded-full bg-champagne-gold/10 blur-[120px] ${isRtl ? "-right-40" : "-left-40"}`} />

      <div className={`pointer-events-none absolute top-0 h-[400px] w-[400px] rounded-full bg-light-champagne/60 blur-[110px] ${isRtl ? "-left-32" : "-right-32"}`} />

      <div className="relative mx-auto max-w-[1380px] px-5 sm:px-8 lg:px-10">
        <div className="relative overflow-hidden rounded-[4px] border border-champagne-gold/20 bg-midnight-navy px-7 py-16 text-center shadow-[0_30px_80px_rgba(7,19,31,0.18)] sm:px-12 sm:py-20 lg:px-20 lg:py-24">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-rich-navy via-midnight-navy to-luxury-black" />

          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-champagne-gold/10" />

          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-soft-white/5" />

          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-champagne-gold/5 blur-[100px]" />

          <div className={`pointer-events-none absolute -top-32 h-[360px] w-[360px] rounded-full border border-champagne-gold/15 ${isRtl ? "-left-28" : "-right-28"}`} />

          <div className={`pointer-events-none absolute -top-20 h-[250px] w-[250px] rounded-full border border-champagne-gold/10 ${isRtl ? "-left-14" : "-right-14"}`} />

          <div className={`pointer-events-none absolute -bottom-36 h-[360px] w-[360px] rounded-full border border-champagne-gold/10 ${isRtl ? "-right-28" : "-left-28"}`} />

          <div className={`pointer-events-none absolute top-10 h-px w-24 bg-gradient-to-r from-champagne-gold/70 to-transparent ${isRtl ? "right-10 rotate-180" : "left-10"}`} />

          <div className={`pointer-events-none absolute bottom-10 h-px w-24 bg-gradient-to-l from-champagne-gold/70 to-transparent ${isRtl ? "left-10 rotate-180" : "right-10"}`} />

          <div className="relative z-10 mx-auto max-w-[850px]">
            <div className="mb-7 flex items-center justify-center gap-4">
              <span className="h-px w-14 bg-champagne-gold/40 sm:w-20" />

              <span className="text-[9px] font-semibold uppercase tracking-[0.4em] text-champagne-gold sm:text-[10px]">
                {t("homeCTA.eyebrow")}
              </span>

              <span className="h-px w-14 bg-champagne-gold/40 sm:w-20" />
            </div>

            <div className="mx-auto flex h-[66px] w-[66px] items-center justify-center rounded-full border border-champagne-gold/30 bg-soft-white/[0.04] text-[18px] text-champagne-gold shadow-[0_15px_35px_rgba(0,0,0,0.16)] backdrop-blur-sm transition-all duration-700 hover:rotate-45 hover:border-champagne-gold/60">
              ✦
            </div>

            <h2 className="mt-9 font-serif text-[2.8rem] font-normal leading-[1.02] tracking-[-0.045em] text-soft-white sm:text-[3.7rem] lg:text-[4.6rem]">
              {t("homeCTA.titlePart1")}
              <span className="mt-2 block font-normal text-champagne-gold">
                {t("homeCTA.titlePart2")}
              </span>
            </h2>

            <p className="mx-auto mt-7 max-w-[620px] text-[13px] leading-7 text-premium-silver/75 sm:text-[15px] sm:leading-8">
              {t("homeCTA.description")}
            </p>

            <div className="mt-10">
              <Link
                to="/shop"
                className="group inline-flex min-h-[54px] items-center justify-center gap-7 border border-soft-white/20 bg-soft-white px-9 text-[10px] font-semibold uppercase tracking-[0.12em] text-midnight-navy shadow-[0_15px_35px_rgba(0,0,0,0.18)] transition-all duration-500 hover:-translate-y-1 hover:border-champagne-gold hover:bg-warm-ivory hover:shadow-[0_22px_45px_rgba(0,0,0,0.25)] focus:outline-none focus-visible:ring-2 focus-visible:ring-champagne-gold/60"
              >
                {t("homeCTA.cta")}

                <span className={`flex h-7 w-7 items-center justify-center rounded-full border border-midnight-navy/15 text-[15px] font-normal transition-all duration-500 group-hover:border-classic-gold group-hover:bg-classic-gold ${isRtl ? "group-hover:-translate-x-1" : "group-hover:translate-x-1"}`}>
                  {isRtl ? "←" : "→"}
                </span>
              </Link>
            </div>

            <div className="mt-11 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-[8px] font-semibold uppercase tracking-[0.3em] text-premium-silver/50 sm:text-[9px]">
              <span>{t("homeCTA.keywords.elegant")}</span>

              <span className="text-classic-gold">✦</span>

              <span>{t("homeCTA.keywords.personal")}</span>

              <span className="text-classic-gold">✦</span>

              <span>{t("homeCTA.keywords.smart")}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeCTA;
