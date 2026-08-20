import { Link } from "react-router-dom";

const technologies = [
  {
    name: "NFC",
    number: "01",
    title: "Tap. Connect. Remember.",
    description:
      "A simple tap turns your jewelry into a gateway to a personal digital experience.",
  },
  {
    name: "QR",
    number: "02",
    title: "Scan your story.",
    description:
      "A beautifully simple way to connect your jewelry with memories, messages, photos, and more.",
  },
  {
    name: "Bluetooth",
    number: "03",
    title: "Stay connected.",
    description:
      "Smart connectivity designed for compatible jewelry experiences and future possibilities.",
  },
];

const SmartTechnologySection = () => {
  return (
    <section className="relative overflow-hidden bg-warm-ivory py-20 sm:py-24 lg:py-28">
      <div className="pointer-events-none absolute -left-40 top-[-140px] h-[460px] w-[460px] rounded-full bg-champagne-gold/10 blur-[120px]" />

      <div className="pointer-events-none absolute -right-40 bottom-[-160px] h-[460px] w-[460px] rounded-full bg-light-champagne/70 blur-[120px]" />

      <div className="pointer-events-none absolute left-1/2 top-0 h-[360px] w-[760px] -translate-x-1/2 rounded-full bg-soft-cream/70 blur-[110px]" />

      <div className="relative mx-auto max-w-[1360px] px-6 sm:px-8 lg:px-10 xl:px-12">
        <div className="grid gap-10 lg:grid-cols-[1fr_0.85fr] lg:items-end lg:gap-16">
          <div>
            <div className="mb-5 flex items-center gap-3">
              <span className="h-px w-10 bg-classic-gold/50" />

              <span className="text-[10px] font-semibold uppercase tracking-[0.34em] text-midnight-navy">
                Smart Technology
              </span>

              <span className="text-[9px] text-classic-gold">✦</span>
            </div>

            <h2 className="max-w-[760px] font-serif text-[2.8rem] font-normal leading-[1.01] tracking-[-0.04em] text-midnight-navy sm:text-[3.6rem] lg:text-[4.4rem]">
              Jewelry with a
              <span className="mt-1 block italic font-normal text-navy-soft">
                hidden connection.
              </span>
            </h2>
          </div>

          <div className="max-w-[540px] lg:ml-auto lg:pb-1">
            <p className="text-[14px] leading-8 text-slate-gray sm:text-[15px]">
              Your jewelry can be more than something beautiful. Connect it with
              your memories, your message, and the moments you never want to
              forget.
            </p>

            <Link
              to="/shop"
              className="group mt-7 inline-flex items-center gap-4 text-[10px] font-semibold uppercase tracking-[0.13em] text-midnight-navy transition-colors duration-300 hover:text-classic-gold"
            >
              Explore Smart Jewelry
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-midnight-navy/15 bg-soft-white/70 text-[14px] transition-all duration-300 group-hover:border-midnight-navy group-hover:bg-midnight-navy group-hover:text-soft-white">
                <span className="transition-transform duration-300 group-hover:translate-x-0.5">
                  →
                </span>
              </span>
            </Link>
          </div>
        </div>

        <div className="my-12 h-px bg-gradient-to-r from-transparent via-classic-gold/35 to-transparent sm:my-14 lg:my-16" />

        <div className="grid gap-5 lg:grid-cols-3">
          {technologies.map((technology, index) => (
            <div
              key={technology.name}
              className={`group relative overflow-hidden rounded-[26px] border border-light-champagne/90 bg-soft-white/75 p-6 shadow-[0_10px_35px_rgba(7,19,31,0.045)] backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 hover:border-champagne-gold/70 hover:bg-soft-white hover:shadow-[0_26px_60px_rgba(7,19,31,0.10)] sm:p-7 lg:p-8 ${
                index === 1 ? "lg:-translate-y-5" : ""
              }`}
            >
              <span className="pointer-events-none absolute -right-2 -top-8 select-none font-serif text-[118px] leading-none text-soft-cream transition-all duration-500 group-hover:text-light-champagne/90 sm:text-[132px]">
                {technology.number}
              </span>

              <div className="pointer-events-none absolute left-0 top-0 h-[2px] w-0 bg-gradient-to-r from-classic-gold to-champagne-gold transition-all duration-500 group-hover:w-full" />

              <div className="relative flex items-center justify-between">
                <span className="text-[10px] font-semibold tracking-[0.22em] text-antique-gold">
                  {technology.number}
                </span>

                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-light-champagne bg-warm-ivory text-[15px] text-classic-gold transition-all duration-500 group-hover:border-midnight-navy group-hover:bg-midnight-navy group-hover:text-champagne-gold">
                  ✦
                </div>
              </div>

              <div className="relative mt-12">
                <p className="text-[9px] font-semibold uppercase tracking-[0.3em] text-steel-gray">
                  Connected by
                </p>

                <h3 className="mt-2.5 font-serif text-[2.1rem] font-normal tracking-[-0.03em] text-midnight-navy sm:text-[2.35rem]">
                  {technology.name}
                </h3>

                <div className="mt-5 h-px w-10 bg-classic-gold/60 transition-all duration-500 group-hover:w-16 group-hover:bg-classic-gold" />

                <h4 className="mt-6 text-[15px] font-semibold tracking-[-0.01em] text-midnight-navy">
                  {technology.title}
                </h4>

                <p className="mt-3 min-h-[78px] text-[12px] leading-[1.8] text-slate-gray sm:text-[13px]">
                  {technology.description}
                </p>
              </div>

              <div className="relative mt-7 flex items-center justify-between border-t border-light-champagne/90 pt-5">
                <span className="text-[8px] font-semibold uppercase tracking-[0.25em] text-steel-gray">
                  Smart Jewelry
                </span>

                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-transparent text-[14px] text-classic-gold transition-all duration-300 group-hover:border-midnight-navy/10 group-hover:bg-warm-ivory group-hover:translate-x-0.5 group-hover:text-midnight-navy">
                  →
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="relative mt-16 overflow-hidden rounded-[24px] border border-light-champagne/80 bg-soft-white/70 px-6 py-9 text-center shadow-[0_10px_35px_rgba(7,19,31,0.035)] backdrop-blur-sm sm:mt-20 sm:px-10 sm:py-11">
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[220px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-champagne-gold/8 blur-[70px]" />

          <div className="relative">
            <div className="mx-auto mb-5 flex items-center justify-center gap-4">
              <span className="h-px w-12 bg-classic-gold/30 sm:w-16" />

              <span className="text-[10px] text-classic-gold">✦</span>

              <span className="h-px w-12 bg-classic-gold/30 sm:w-16" />
            </div>

            <p className="font-serif text-[1.55rem] italic leading-snug text-midnight-navy sm:text-[1.9rem] lg:text-[2.2rem]">
              "Beautiful enough to wear. Smart enough to remember."
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SmartTechnologySection;
