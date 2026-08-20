const steps = [
  {
    number: "01",
    title: "Discover",
    description:
      "Explore jewelry designed around your style and the moments that matter to you.",
  },
  {
    number: "02",
    title: "Customize",
    description:
      "Choose the options available for your selected piece and make it truly yours.",
  },
  {
    number: "03",
    title: "Order",
    description:
      "Complete your order through a simple and secure checkout experience.",
  },
  {
    number: "04",
    title: "Activate",
    description:
      "For compatible smart pieces, activate your technology once your jewelry arrives.",
  },
  {
    number: "05",
    title: "Connect",
    description:
      "Enjoy the personal digital experience connected to your jewelry.",
  },
];

const HowItWorksSection = () => {
  return (
    <section className="relative overflow-hidden bg-soft-white py-20 sm:py-24 lg:py-28">
      <div className="pointer-events-none absolute -left-40 top-24 h-[420px] w-[420px] rounded-full bg-light-champagne/60 blur-[110px]" />

      <div className="pointer-events-none absolute -right-40 bottom-0 h-[420px] w-[420px] rounded-full bg-champagne-gold/10 blur-[110px]" />

      <div className="pointer-events-none absolute left-1/2 top-0 h-[280px] w-[700px] -translate-x-1/2 rounded-full bg-warm-ivory blur-[90px]" />

      <div className="relative mx-auto max-w-[1360px] px-6 sm:px-8 lg:px-10 xl:px-12">
        <div className="mx-auto max-w-[760px] text-center">
          <div className="mb-5 flex items-center justify-center gap-3">
            <span className="h-px w-9 bg-classic-gold/40" />

            <span className="text-[10px] font-semibold uppercase tracking-[0.34em] text-midnight-navy">
              The Experience
            </span>

            <span className="h-px w-9 bg-classic-gold/40" />
          </div>

          <h2 className="font-serif text-[2.7rem] font-normal leading-[1.03] tracking-[-0.04em] text-midnight-navy sm:text-[3.4rem] lg:text-[4rem]">
            From discovery
            <span className="ml-2 italic text-navy-soft">to connection.</span>
          </h2>

          <p className="mx-auto mt-5 max-w-[590px] text-[13px] leading-7 text-slate-gray sm:text-[14px]">
            A simple journey from choosing your perfect piece to creating a
            meaningful experience around it.
          </p>
        </div>

        <div className="relative mt-16 hidden lg:block">
          <div className="absolute left-[9%] right-[9%] top-[36px] h-px bg-gradient-to-r from-transparent via-classic-gold/35 to-transparent" />

          <div className="grid grid-cols-5 gap-5">
            {steps.map((step, index) => (
              <div key={step.number} className="group relative text-center">
                <div className="relative z-10 mx-auto">
                  <div className="absolute inset-0 rounded-full bg-classic-gold/15 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />

                  <div className="relative mx-auto flex h-[72px] w-[72px] items-center justify-center rounded-full border border-light-champagne bg-warm-ivory shadow-[0_8px_24px_rgba(7,19,31,0.05)] transition-all duration-500 group-hover:-translate-y-1 group-hover:border-classic-gold group-hover:bg-midnight-navy group-hover:shadow-[0_14px_32px_rgba(18,38,58,0.18)]">
                    <span className="text-[11px] font-semibold tracking-[0.12em] text-antique-gold transition-colors duration-500 group-hover:text-champagne-gold">
                      {step.number}
                    </span>
                  </div>

                  {index < steps.length - 1 && (
                    <span className="absolute -right-[18px] top-1/2 hidden -translate-y-1/2 text-[10px] text-classic-gold/50 xl:block">
                      ✦
                    </span>
                  )}
                </div>

                <div className="mt-7 px-2">
                  <h3 className="font-serif text-[1.45rem] font-normal tracking-[-0.02em] text-midnight-navy">
                    {step.title}
                  </h3>

                  <div className="mx-auto mt-3 h-px w-7 bg-classic-gold/50 transition-all duration-500 group-hover:w-12 group-hover:bg-classic-gold" />

                  <p className="mx-auto mt-4 max-w-[200px] text-[12px] leading-[1.8] text-slate-gray">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative mt-14 lg:hidden">
          <div className="absolute bottom-8 left-[31px] top-8 w-px bg-gradient-to-b from-classic-gold/20 via-light-champagne to-classic-gold/20" />

          <div className="space-y-7">
            {steps.map((step) => (
              <div
                key={step.number}
                className="group relative flex gap-5 rounded-[22px] border border-transparent px-1 py-2 transition-all duration-300 hover:border-light-champagne/80 hover:bg-warm-ivory/55 sm:gap-6 sm:px-3 sm:py-3"
              >
                <div className="relative z-10 flex h-[62px] w-[62px] shrink-0 items-center justify-center rounded-full border border-light-champagne bg-warm-ivory text-[11px] font-semibold tracking-[0.12em] text-antique-gold shadow-[0_7px_20px_rgba(7,19,31,0.05)] transition-all duration-300 group-hover:border-classic-gold group-hover:bg-midnight-navy group-hover:text-champagne-gold">
                  {step.number}
                </div>

                <div className="pt-1">
                  <h3 className="font-serif text-[1.45rem] font-normal tracking-[-0.02em] text-midnight-navy">
                    {step.title}
                  </h3>

                  <div className="mt-2.5 h-px w-7 bg-classic-gold/55 transition-all duration-300 group-hover:w-11" />

                  <p className="mt-3 max-w-lg text-[12px] leading-[1.8] text-slate-gray sm:text-[13px]">
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
            <span className="text-[11px] text-classic-gold">✦</span>

            <p className="mt-3 font-serif text-[1.45rem] italic text-midnight-navy sm:text-[1.7rem]">
              Every piece has a story.
            </p>

            <p className="mt-2 text-[8px] font-semibold uppercase tracking-[0.32em] text-slate-gray sm:text-[9px]">
              Make yours unforgettable
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
