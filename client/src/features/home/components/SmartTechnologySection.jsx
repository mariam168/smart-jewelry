import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const SmartTechnologySection = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";

  const technologies = [
    {
      name: t("smartTech.tech.nfc.name"),
      number: "01",
      title: t("smartTech.tech.nfc.title"),
      description: t("smartTech.tech.nfc.desc"),
    },
    {
      name: t("smartTech.tech.qr.name"),
      number: "02",
      title: t("smartTech.tech.qr.title"),
      description: t("smartTech.tech.qr.desc"),
    },
    {
      name: t("smartTech.tech.bluetooth.name"),
      number: "03",
      title: t("smartTech.tech.bluetooth.title"),
      description: t("smartTech.tech.bluetooth.desc"),
    },
  ];

  return (
    <section className="relative overflow-hidden bg-warm-ivory py-24 lg:py-32">
      <div className={`pointer-events-none absolute top-[-140px] h-[460px] w-[460px] rounded-full bg-champagne-gold/10 blur-[120px] ${isRtl ? "-right-40" : "-left-40"}`} />
      <div className={`pointer-events-none absolute bottom-[-160px] h-[460px] w-[460px] rounded-full bg-light-champagne/70 blur-[120px] ${isRtl ? "-left-40" : "-right-40"}`} />
      <div className="pointer-events-none absolute left-1/2 top-0 h-[360px] w-[760px] -translate-x-1/2 rounded-full bg-soft-cream/70 blur-[110px]" />

      <div className="relative mx-auto max-w-[1400px] px-6 lg:px-12">
        <div className="grid items-end gap-12 lg:grid-cols-2 lg:gap-20">
          <div className={isRtl ? "text-right" : "text-left"}>
            <div className={`mb-6 flex items-center gap-3 ${isRtl ? "justify-start" : "justify-start"}`}>
              <span className="h-px w-12 bg-classic-gold" />
              <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-midnight-navy/80">
                {t("smartTech.eyebrow")}
              </span>
            </div>

            <h2 className="font-serif text-[2.8rem] font-normal leading-[1.1] tracking-tight text-midnight-navy sm:text-[3.8rem] lg:text-[4.6rem]">
              {t("smartTech.titlePart1")}
              <span className={`mt-2 block font-normal text-navy-soft ${isRtl ? "not-italic" : "italic"}`}>
                {t("smartTech.titlePart2")}
              </span>
            </h2>
          </div>

          <div className={`max-w-[500px] ${isRtl ? "lg:mr-auto lg:text-right" : "lg:ml-auto lg:text-left"}`}>
            <p className="text-[15px] leading-[1.8] text-slate-gray sm:text-[16px]">
              {t("smartTech.description")}
            </p>

            <Link
              to="/shop"
              className="group mt-10 inline-flex items-center gap-5 text-[11px] font-bold uppercase tracking-[0.2em] text-midnight-navy transition-all duration-300 hover:text-classic-gold"
            >
              <span className="border-b border-midnight-navy/20 pb-1 group-hover:border-classic-gold">
                {t("smartTech.cta")}
              </span>
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-midnight-navy/10 bg-white shadow-sm transition-all duration-500 group-hover:bg-midnight-navy group-hover:text-white">
                <span className={`text-lg transition-transform duration-500 ${isRtl ? "group-hover:-translate-x-1" : "group-hover:translate-x-1"}`}>
                  {isRtl ? "←" : "→"}
                </span>
              </span>
            </Link>
          </div>
        </div>

        <div className="my-20 h-px w-full bg-gradient-to-r from-transparent via-light-champagne to-transparent" />

        <div className="grid gap-8 lg:grid-cols-3">
          {technologies.map((tech, index) => (
            <div
              key={tech.name}
              className={`group relative overflow-hidden rounded-[32px] border border-light-champagne/60 bg-white/60 p-8 shadow-[0_15px_45px_rgba(0,0,0,0.03)] backdrop-blur-md transition-all duration-700 hover:-translate-y-4 hover:border-classic-gold/30 hover:bg-white hover:shadow-[0_30px_70px_rgba(7,19,31,0.1)] lg:p-10 ${
                index === 1 ? "lg:-translate-y-8" : ""
              }`}
            >
              <span className={`pointer-events-none absolute -top-10 select-none font-serif text-[140px] leading-none text-warm-ivory transition-all duration-700 group-hover:scale-110 group-hover:text-soft-cream/80 ${isRtl ? "-left-4" : "-right-4"}`}>
                {tech.number}
              </span>

              <div className="relative flex items-center justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-warm-ivory text-xl text-classic-gold transition-all duration-700 group-hover:rotate-[360deg] group-hover:bg-midnight-navy group-hover:text-white">
                  ✦
                </div>
                <span className="text-[12px] font-black tracking-widest text-classic-gold/40">
                  {tech.number}
                </span>
              </div>

              <div className={`relative mt-16 ${isRtl ? "text-right" : "text-left"}`}>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-gray/60">
                  {t("smartTech.connectedBy")}
                </p>

                <h3 className="mt-3 font-serif text-3xl font-normal tracking-wide text-midnight-navy sm:text-4xl">
                  {tech.name}
                </h3>

                <div className={`mt-6 h-1 w-10 bg-classic-gold transition-all duration-500 group-hover:w-20 ${isRtl ? "mr-0" : "ml-0"}`} />

                <h4 className="mt-8 text-base font-bold tracking-tight text-midnight-navy">
                  {tech.title}
                </h4>

                <p className="mt-4 min-h-[80px] text-[13px] leading-[1.7] text-slate-gray">
                  {tech.description}
                </p>
              </div>

              <div className="relative mt-8 flex items-center justify-between border-t border-light-champagne/50 pt-6">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-gray/50">
                  {t("smartTech.subBadge")}
                </span>

                <span className={`flex h-10 w-10 items-center justify-center rounded-full bg-warm-ivory/50 text-midnight-navy transition-all duration-500 group-hover:bg-midnight-navy group-hover:text-white ${isRtl ? "group-hover:-translate-x-1" : "group-hover:translate-x-1"}`}>
                  {isRtl ? "←" : "→"}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="relative mt-20 overflow-hidden rounded-[32px] border border-light-champagne/40 bg-white/40 px-8 py-12 text-center backdrop-blur-sm lg:mt-32 lg:px-16 lg:py-16">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-champagne-gold/5 via-transparent to-light-champagne/10" />
          
          <div className="relative">
            <div className="mx-auto mb-8 flex items-center justify-center gap-6">
              <span className="h-px w-16 bg-classic-gold/30" />
              <span className="text-xl text-classic-gold">✦</span>
              <span className="h-px w-16 bg-classic-gold/30" />
            </div>

            <p className={`font-serif text-[1.8rem] leading-[1.3] text-midnight-navy sm:text-[2.2rem] lg:text-[2.6rem] ${isRtl ? "not-italic" : "italic"}`}>
              {t("smartTech.quote")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SmartTechnologySection;