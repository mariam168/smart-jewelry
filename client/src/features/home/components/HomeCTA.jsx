import { Link } from "react-router-dom";

const HomeCTA = () => {
  return (
    <section className="relative overflow-hidden bg-warm-ivory py-20 sm:py-24 lg:py-28">
      <div className="pointer-events-none absolute -left-32 top-1/2 h-[420px] w-[420px] -translate-y-1/2 rounded-full bg-champagne-gold/10 blur-[110px]" />

      <div className="pointer-events-none absolute -right-24 top-0 h-[380px] w-[380px] rounded-full bg-light-champagne/70 blur-[100px]" />

      <div className="relative mx-auto max-w-[1320px] px-6 sm:px-8 lg:px-10">
        <div className="relative overflow-hidden rounded-[30px] border border-midnight-navy/10 bg-midnight-navy px-7 py-16 text-center shadow-[0_28px_70px_rgba(7,19,31,0.18)] sm:px-12 sm:py-20 lg:px-20 lg:py-24">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-rich-navy via-midnight-navy to-luxury-black" />

          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-champagne-gold/8 blur-[100px]" />

          <div className="pointer-events-none absolute -right-28 -top-32 h-[360px] w-[360px] rounded-full border border-champagne-gold/15" />

          <div className="pointer-events-none absolute -right-14 -top-20 h-[250px] w-[250px] rounded-full border border-champagne-gold/10" />

          <div className="pointer-events-none absolute -bottom-36 -left-28 h-[360px] w-[360px] rounded-full border border-champagne-gold/10" />

          <div className="pointer-events-none absolute left-10 top-10 h-px w-20 bg-gradient-to-r from-champagne-gold/70 to-transparent" />

          <div className="pointer-events-none absolute bottom-10 right-10 h-px w-20 bg-gradient-to-l from-champagne-gold/70 to-transparent" />

          <div className="relative z-10 mx-auto max-w-[820px]">
            <div className="mb-7 flex items-center justify-center gap-3">
              <span className="h-px w-10 bg-champagne-gold/40" />

              <span className="text-[9px] font-semibold uppercase tracking-[0.38em] text-champagne-gold sm:text-[10px]">
                Your Story
              </span>

              <span className="h-px w-10 bg-champagne-gold/40" />
            </div>

            <div className="mx-auto flex h-[58px] w-[58px] items-center justify-center rounded-full border border-champagne-gold/25 bg-soft-white/5 text-[17px] text-champagne-gold shadow-[0_12px_30px_rgba(0,0,0,0.14)] backdrop-blur-sm">
              ✦
            </div>

            <h2 className="mt-8 font-serif text-[2.7rem] font-normal leading-[1.02] tracking-[-0.04em] text-soft-white sm:text-[3.5rem] lg:text-[4.35rem]">
              Find the piece
              <span className="mt-1 block italic font-normal text-champagne-gold">
                that feels like you.
              </span>
            </h2>

            <p className="mx-auto mt-6 max-w-[610px] text-[13px] leading-7 text-premium-silver/80 sm:text-[15px] sm:leading-8">
              Explore our collection and discover jewelry designed to be
              personal, beautiful, and connected to the moments that matter
              most.
            </p>

            <div className="mt-9">
              <Link
                to="/shop"
                className="group inline-flex min-h-[52px] items-center justify-center gap-8 rounded-[12px] bg-soft-white px-8 text-[10px] font-semibold uppercase tracking-[0.09em] text-midnight-navy shadow-[0_14px_32px_rgba(0,0,0,0.16)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-warm-ivory hover:shadow-[0_18px_38px_rgba(0,0,0,0.22)] focus:outline-none focus-visible:ring-2 focus-visible:ring-champagne-gold/60"
              >
                Shop the Collection
                <span className="text-[17px] font-normal transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[8px] font-semibold uppercase tracking-[0.28em] text-premium-silver/55 sm:text-[9px]">
              <span>Elegant</span>

              <span className="text-classic-gold">✦</span>

              <span>Personal</span>

              <span className="text-classic-gold">✦</span>

              <span>Smart</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeCTA;
