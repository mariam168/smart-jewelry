import { Link } from "react-router-dom";
import image from "../images/image3.jpeg";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-warm-ivory">
      <div className="relative min-h-[650px] lg:min-h-[690px]">
        <div className="absolute inset-0">
          <img
            src={image}
            alt="Elegant smart jewelry collection"
            className="h-full w-full object-cover object-[68%_center] transition-transform duration-[1400ms] hover:scale-[1.01]"
          />

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-warm-ivory via-warm-ivory/95 to-warm-ivory/15 lg:via-[48%] lg:to-transparent" />

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-warm-ivory via-warm-ivory/80 to-transparent lg:from-warm-ivory lg:via-warm-ivory/55 lg:to-transparent" />

          <div className="pointer-events-none absolute inset-y-0 left-[38%] hidden w-[24%] bg-gradient-to-r from-warm-ivory/85 via-warm-ivory/35 to-transparent backdrop-blur-[1.5px] lg:block" />

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-warm-ivory/30 to-transparent" />

          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-soft-white/20 to-transparent" />
        </div>

        <div className="relative z-10 mx-auto flex min-h-[650px] max-w-[1440px] items-center px-6 py-16 sm:px-10 sm:py-20 lg:min-h-[690px] lg:px-12 xl:px-16">
          <div className="w-full max-w-[620px] lg:max-w-[650px]">
            <div className="mb-7 flex items-center gap-3">
              <span className="text-[10px] font-semibold uppercase tracking-[0.34em] text-midnight-navy sm:text-[11px]">
                Smart Jewelry
              </span>

              <span className="text-[11px] text-classic-gold">✦</span>

              <span className="h-px w-10 bg-classic-gold/35" />
            </div>

            <h1 className="max-w-[610px] font-serif text-[3.35rem] font-normal leading-[0.96] tracking-[-0.05em] text-midnight-navy sm:text-[4.2rem] lg:text-[4.8rem] xl:text-[5.25rem]">
              Jewelry that
              <span className="mt-1 block font-serif italic font-normal text-navy-soft">
                tells your story.
              </span>
            </h1>

            <p className="mt-8 max-w-[470px] text-[14px] leading-[1.9] text-midnight-navy/75 sm:text-[15px] lg:text-[16px]">
              Elegant jewelry designed to carry your most meaningful memories,
              moments, and stories — beautifully connected through smart
              technology.
            </p>

            <div className="mt-9 flex flex-wrap gap-3.5">
              <Link
                to="/shop"
                className="group inline-flex min-h-[52px] items-center justify-center gap-9 rounded-[12px] bg-midnight-navy px-7 text-[10px] font-semibold uppercase tracking-[0.07em] text-soft-white shadow-[0_12px_30px_rgba(18,38,58,0.14)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-rich-navy hover:shadow-[0_16px_34px_rgba(18,38,58,0.2)] focus:outline-none focus-visible:ring-2 focus-visible:ring-classic-gold/40"
              >
                Explore Collection
                <span className="text-[18px] font-light leading-none transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </Link>

              <Link
                to="/shop?technology=NFC"
                className="group inline-flex min-h-[52px] items-center justify-center gap-6 rounded-[12px] border border-midnight-navy/20 bg-soft-white/55 px-7 text-[10px] font-semibold uppercase tracking-[0.07em] text-midnight-navy shadow-[0_6px_18px_rgba(7,19,31,0.035)] backdrop-blur-[3px] transition-all duration-300 hover:-translate-y-0.5 hover:border-classic-gold/70 hover:bg-soft-white/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-classic-gold/40"
              >
                Discover NFC
                <span className="relative flex h-6 w-7 items-center justify-center">
                  <span className="absolute bottom-[5px] h-[5px] w-[5px] rounded-full bg-midnight-navy" />
                  <span className="absolute bottom-[4px] h-[10px] w-[15px] rounded-t-full border-t border-midnight-navy" />
                  <span className="absolute bottom-[2px] h-[16px] w-[23px] rounded-t-full border-t border-midnight-navy" />
                </span>
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 border-t border-midnight-navy/10 pt-5">
              <div className="flex items-center gap-2">
                <span className="text-[9px] text-classic-gold">✦</span>

                <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-midnight-navy/65">
                  Elegant Design
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[9px] text-classic-gold">✦</span>

                <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-midnight-navy/65">
                  Personal Memories
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[9px] text-classic-gold">✦</span>

                <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-midnight-navy/65">
                  NFC Technology
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 right-6 z-20 sm:bottom-10 sm:right-10 lg:bottom-11 lg:right-12 xl:right-16">
          <div className="flex h-[106px] w-[106px] flex-col items-center justify-center rounded-full border border-soft-white/80 bg-soft-white/90 text-center shadow-[0_18px_40px_rgba(7,19,31,0.12)] backdrop-blur-md sm:h-[116px] sm:w-[116px]">
            <div className="relative mb-1.5 flex h-8 w-10 items-center justify-center">
              <span className="absolute bottom-[3px] h-[5px] w-[5px] rounded-full bg-midnight-navy" />
              <span className="absolute bottom-[3px] h-[12px] w-[20px] rounded-t-full border-t-2 border-midnight-navy" />
              <span className="absolute bottom-[1px] h-[20px] w-[31px] rounded-t-full border-t-2 border-midnight-navy" />
            </div>

            <span className="text-[14px] font-medium uppercase tracking-[0.08em] text-midnight-navy">
              NFC
            </span>

            <span className="mt-1 text-[7px] font-semibold uppercase tracking-[0.12em] text-midnight-navy/60">
              Tap to Connect
            </span>
          </div>
        </div>
      </div>

      <div className="relative z-20 border-y border-light-champagne/90 bg-soft-white/95 backdrop-blur-md">
        <div className="mx-auto grid max-w-[1360px] grid-cols-1 divide-y divide-light-champagne/90 px-6 sm:grid-cols-3 sm:divide-x sm:divide-y-0 lg:px-8">
          <div className="flex min-h-[112px] items-center gap-5 py-5 sm:px-6 lg:px-8">
            <div className="flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-full bg-warm-ivory">
              <span className="text-[19px] text-classic-gold">✦</span>
            </div>

            <div>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.045em] text-midnight-navy">
                Elegant Design
              </span>

              <span className="mt-1.5 block max-w-[190px] text-[11px] leading-[1.65] text-slate-gray">
                Timeless details crafted for everyday elegance.
              </span>
            </div>
          </div>

          <div className="flex min-h-[112px] items-center gap-5 py-5 sm:px-6 lg:px-8">
            <div className="flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-full bg-warm-ivory">
              <span className="text-[19px] text-classic-gold">✦</span>
            </div>

            <div>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.045em] text-midnight-navy">
                Personal Memories
              </span>

              <span className="mt-1.5 block max-w-[190px] text-[11px] leading-[1.65] text-slate-gray">
                Keep meaningful moments and connections close.
              </span>
            </div>
          </div>

          <div className="flex min-h-[112px] items-center gap-5 py-5 sm:px-6 lg:px-8">
            <div className="relative flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-full bg-warm-ivory">
              <span className="absolute bottom-[17px] h-[5px] w-[5px] rounded-full bg-midnight-navy" />
              <span className="absolute bottom-[16px] h-[11px] w-[19px] rounded-t-full border-t-2 border-midnight-navy" />
              <span className="absolute bottom-[13px] h-[20px] w-[31px] rounded-t-full border-t-2 border-midnight-navy" />
            </div>

            <div>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.045em] text-midnight-navy">
                NFC Technology
              </span>

              <span className="mt-1.5 block max-w-[190px] text-[11px] leading-[1.65] text-slate-gray">
                Smart connectivity seamlessly built into jewelry.
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
