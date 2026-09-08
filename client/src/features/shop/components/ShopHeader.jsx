import { useTranslation } from "react-i18next";

const ShopHeader = ({ productsCount }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  const activeLanguage = isRtl ? "ar" : "en";

  return (
    <section className="relative overflow-hidden border-b border-light-champagne/40 bg-warm-ivory">
      <div className={`pointer-events-none absolute top-[-150px] h-[450px] w-[450px] rounded-full bg-champagne-gold/10 blur-[120px] ${isRtl ? '-right-20' : '-left-20'}`} />
      <div className={`pointer-events-none absolute bottom-[-150px] h-[450px] w-[450px] rounded-full bg-light-champagne/60 blur-[120px] ${isRtl ? '-left-20' : '-right-20'}`} />
      <div className="pointer-events-none absolute left-1/2 top-0 h-[300px] w-full -translate-x-1/2 rounded-full bg-white/40 blur-[100px]" />

      <div className="relative mx-auto max-w-[1400px] px-6 py-20 sm:py-28 lg:px-12">
        <div className="flex flex-col items-center text-center">
          <div className="mb-8 flex items-center gap-4">
            <span className="h-[1px] w-12 bg-classic-gold/30" />
            <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-midnight-navy/70">
              {t("shopHeader.smartJewelry")}
            </p>
            <span className="h-[1px] w-12 bg-classic-gold/30" />
          </div>

          <h1
            dir={activeLanguage === "ar" ? "rtl" : "ltr"}
            className="font-serif text-[2.8rem] font-normal leading-[1.1] tracking-tight text-midnight-navy sm:text-[4rem] lg:text-[5.2rem]"
          >
            {t("shopHeader.titleFirst")}
            <span className={`block lg:inline lg:ml-4 text-navy-soft ${isRtl ? "not-italic" : "italic"}`}>
              {t("shopHeader.titleSecond")}
            </span>
          </h1>

          <div className="mt-8 h-1 w-20 bg-classic-gold" />

          <p
            dir={activeLanguage === "ar" ? "rtl" : "ltr"}
            className="mx-auto mt-10 max-w-[680px] text-[15px] font-medium leading-[1.8] text-slate-gray sm:text-[17px]"
          >
            {t("shopHeader.description")}
          </p>

          <div className="mt-12">
            <div className="inline-flex items-center gap-4 rounded-full border border-light-champagne/60 bg-white/80 px-6 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.04)] backdrop-blur-md">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-midnight-navy text-[10px] text-classic-gold">
                ✦
              </div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-midnight-navy">
                {productsCount} <span className="text-slate-gray/60 ml-1">{t("shopHeader.productsAvailable")}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-light-champagne to-transparent" />
    </section>
  );
};

export default ShopHeader;