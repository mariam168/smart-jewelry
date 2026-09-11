
import { useTranslation } from "react-i18next";

const HowItWorksSection = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";

  const steps = [
    {
      number: "01",
      title: t("howItWorks.steps.discover.title"),
      description: t("howItWorks.steps.discover.desc"),
    },
    {
      number: "02",
      title: t("howItWorks.steps.customize.title"),
      description: t("howItWorks.steps.customize.desc"),
    },
    {
      number: "03",
      title: t("howItWorks.steps.order.title"),
      description: t("howItWorks.steps.order.desc"),
    },
    {
      number: "04",
      title: t("howItWorks.steps.activate.title"),
      description: t("howItWorks.steps.activate.desc"),
    },
    {
      number: "05",
      title: t("howItWorks.steps.connect.title"),
      description: t("howItWorks.steps.connect.desc"),
    },
  ];

  return (
    <section className="relative overflow-hidden bg-soft-white py-20 sm:py-24 lg:py-28">
      <div
        className={`pointer-events-none absolute top-24 h-[420px] w-[420px] rounded-full bg-light-champagne/60 blur-[110px] ${
          isRtl ? "-right-40" : "-left-40"
        }`}
      />

      <div
        className={`pointer-events-none absolute bottom-0 h-[420px] w-[420px] rounded-full bg-champagne-gold/10 blur-[110px] ${
          isRtl ? "-left-40" : "-right-40"
        }`}
      />

      <div className="pointer-events-none absolute left-1/2 top-0 h-[280px] w-[700px] -translate-x-1/2 rounded-full bg-warm-ivory blur-[90px]" />

      <div className="relative mx-auto max-w-[1360px] px-6 sm:px-8 lg:px-10 xl:px-12">
        <div className="mx-auto max-w-[760px] text-center">
          <div className="mb-5 flex items-center justify-center gap-3">
            <span className="h-px w-9 bg-classic-gold/40" />

            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-midnight-navy">
              {t("howItWorks.eyebrow")}
            </span>

            <span className="h-px w-9 bg-classic-gold/40" />
          </div>

<h2 className="font-sans text-[2.7rem] font-medium leading-[1.35] tracking-normal text-midnight-navy sm:text-[3.4rem] lg:text-[4rem]">
  {t("howItWorks.titlePart1")}
  {" "}
  <span className="font-sans font-medium tracking-normal text-navy-soft">
    {t("howItWorks.titlePart2")}
  </span>
</h2>


          <p className="mx-auto mt-5 max-w-[590px] text-[13px] leading-7 tracking-normal text-slate-gray sm:text-[14px]">
            {t("howItWorks.description")}
          </p>
        </div>

        <div className="relative mt-16 hidden lg:block">
          <div className="absolute left-[9%] right-[9%] top-[36px] h-px bg-gradient-to-r from-transparent via-classic-gold/35 to-transparent" />

          <div className="grid grid-cols-5 gap-5">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className="group relative text-center"
              >
                <div className="relative z-10 mx-auto">
                  <div className="absolute inset-0 rounded-full bg-classic-gold/15 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />

                  <div className="relative mx-auto flex h-[72px] w-[72px] items-center justify-center rounded-full border border-light-champagne bg-warm-ivory shadow-[0_8px_24px_rgba(7,19,31,0.05)] transition-all duration-500 group-hover:-translate-y-1 group-hover:border-classic-gold group-hover:bg-midnight-navy group-hover:shadow-[0_14px_32px_rgba(18,38,58,0.18)]">
                    <span className="text-[11px] font-semibold tracking-[0.08em] text-antique-gold transition-colors duration-500 group-hover:text-champagne-gold">
                      {step.number}
                    </span>
                  </div>

                  {index < steps.length - 1 && (
                    <span
                      className={`absolute top-1/2 hidden -translate-y-1/2 text-[10px] text-classic-gold/50 xl:block ${
                        isRtl ? "-left-[18px]" : "-right-[18px]"
                      }`}
                    >
                      ✦
                    </span>
                  )}
                </div>

                <div className="mt-7 px-2">
                  <h3 className="font-sans text-[1.4rem] font-medium leading-[1.35] tracking-normal text-midnight-navy">
                    {step.title}
                  </h3>

                  <div className="mx-auto mt-3 h-px w-7 bg-classic-gold/50 transition-all duration-500 group-hover:w-12 group-hover:bg-classic-gold" />

                  <p className="mx-auto mt-4 max-w-[200px] text-[12px] leading-[1.8] tracking-normal text-slate-gray">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative mt-14 lg:hidden">
          <div
            className={`absolute bottom-8 top-8 w-px bg-gradient-to-b from-classic-gold/20 via-light-champagne to-classic-gold/20 ${
              isRtl ? "right-[31px]" : "left-[31px]"
            }`}
          />

          <div className="space-y-7">
            {steps.map((step) => (
              <div
                key={step.number}
                className="group relative flex gap-5 rounded-[22px] border border-transparent px-1 py-2 transition-all duration-300 hover:border-light-champagne/80 hover:bg-warm-ivory/55 sm:gap-6 sm:px-3 sm:py-3"
              >
                <div className="relative z-10 flex h-[62px] w-[62px] shrink-0 items-center justify-center rounded-full border border-light-champagne bg-warm-ivory text-[11px] font-semibold tracking-[0.08em] text-antique-gold shadow-[0_7px_20px_rgba(7,19,31,0.05)] transition-all duration-300 group-hover:border-classic-gold group-hover:bg-midnight-navy group-hover:text-champagne-gold">
                  {step.number}
                </div>

                <div className="pt-1">
                  <h3 className="font-sans text-[1.4rem] font-medium leading-[1.4] tracking-normal text-midnight-navy">
                    {step.title}
                  </h3>

                  <div
                    className={`mt-2.5 h-px w-7 bg-classic-gold/55 transition-all duration-300 group-hover:w-11 ${
                      isRtl ? "mr-0" : "ml-0"
                    }`}
                  />

                  <p className="mt-3 max-w-lg text-[12px] leading-[1.8] tracking-normal text-slate-gray sm:text-[13px]">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative mt-16 overflow-hidden rounded-[24px] border border-light-champagne/80 bg-warm-ivory/70 px-6 py-8 text-center shadow-[0_10px_35px_rgba(7,19,31,0.035)] sm:mt-20 sm:px-10 sm:py-10">
          <div className="pointer-events-none absolute left-1/2 top-0 h-[180px] w-[420px] -translate-x-1/2 rounded-full bg-champagne-gold/8 blur-[60px]" />

          <div className="relative">
            <span className="text-[11px] text-classic-gold">
              ✦
            </span>

            <p className="mt-3 font-sans text-[1.45rem] font-medium leading-[1.5] tracking-normal text-midnight-navy sm:text-[1.7rem]">
              {t("howItWorks.footer.text")}
            </p>

            <p className="mt-2 text-[8px] font-semibold uppercase tracking-[0.2em] text-slate-gray sm:text-[9px]">
              {t("howItWorks.footer.subtext")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
