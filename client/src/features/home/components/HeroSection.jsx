import { Link } from "react-router-dom";

import image from "../images/hero2.png";

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

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-warm-ivory">
      {/* HERO */}
      <div className="relative min-h-[740px] sm:min-h-[720px] lg:min-h-[690px]">
        {/* BACKGROUND */}
        <div className="absolute inset-0">
          <img
            src={image}
            alt="Elegant smart jewelry collection"
            className="
              h-full
              w-full
              object-cover
              object-[66%_center]
              transition-transform
              duration-[1400ms]

              sm:object-[68%_center]
              md:object-[69%_center]
              lg:object-[68%_center]

              lg:hover:scale-[1.01]
            "
          />

          {/* MOBILE LIGHT WASH */}
          <div
            className="
              pointer-events-none
              absolute
              inset-0
              bg-warm-ivory/20
              sm:bg-warm-ivory/15
              lg:hidden
            "
          />

          {/* MOBILE READABILITY GRADIENT */}
          <div
            className="
              pointer-events-none
              absolute
              inset-0
              bg-gradient-to-b
              from-warm-ivory/55
              via-warm-ivory/25
              to-warm-ivory/32

              sm:from-warm-ivory/42
              sm:via-warm-ivory/18
              sm:to-warm-ivory/24

              lg:hidden
            "
          />

          {/* MOBILE SOFT TEXT AREA */}
          <div
            className="
              pointer-events-none
              absolute
              left-1/2
              top-[42%]
              h-[500px]
              w-[115%]
              -translate-x-1/2
              -translate-y-1/2
              rounded-[50%]
              bg-warm-ivory/16
              blur-[75px]

              sm:bg-warm-ivory/10
              lg:hidden
            "
          />

          {/* DESKTOP LEFT GRADIENT */}
          <div
            className="
              pointer-events-none
              absolute
              inset-0
              hidden
              bg-gradient-to-r
              from-warm-ivory
              via-warm-ivory/90
              to-transparent

              lg:block
              lg:via-[47%]
            "
          />

          {/* DESKTOP TRANSITION */}
          <div
            className="
              pointer-events-none
              absolute
              inset-y-0
              left-[37%]
              hidden
              w-[27%]
              bg-gradient-to-r
              from-warm-ivory/85
              via-warm-ivory/35
              to-transparent
              backdrop-blur-[1px]

              lg:block
            "
          />

          {/* TOP LIGHT */}
          <div
            className="
              pointer-events-none
              absolute
              inset-x-0
              top-0
              h-24
              bg-gradient-to-b
              from-soft-white/18
              to-transparent

              sm:h-28
            "
          />

          {/* BOTTOM BLEND */}
          <div
            className="
              pointer-events-none
              absolute
              inset-x-0
              bottom-0
              h-36
              bg-gradient-to-t
              from-warm-ivory/28
              to-transparent

              sm:h-40
              sm:from-warm-ivory/20

              lg:h-44
              lg:from-warm-ivory/18
            "
          />

          {/* MOBILE LEFT EDGE */}
          <div
            className="
              pointer-events-none
              absolute
              inset-0
              bg-gradient-to-r
              from-warm-ivory/22
              via-transparent
              to-transparent

              sm:from-warm-ivory/12
              lg:hidden
            "
          />
        </div>

        {/* CONTENT */}
        <div
          className="
            relative
            z-10
            mx-auto
            flex
            min-h-[740px]
            max-w-[1440px]
            items-center
            justify-center
            px-5
            pb-36
            pt-16

            sm:min-h-[720px]
            sm:px-8
            sm:pb-32
            sm:pt-20

            lg:min-h-[690px]
            lg:justify-start
            lg:px-12
            lg:py-20

            xl:px-16
          "
        >
          <div
            className="
              mx-auto
              w-full
              max-w-[610px]
              text-center

              lg:mx-0
              lg:max-w-[650px]
              lg:text-left
            "
          >
            {/* EYEBROW */}
            <div
              className="
                mb-6
                flex
                items-center
                justify-center
                gap-3

                sm:mb-7
                lg:justify-start
              "
            >
              <span className="hidden h-px w-8 bg-classic-gold/35 sm:block lg:hidden" />

              <span
                className="
                  text-[9px]
                  font-semibold
                  uppercase
                  tracking-[0.32em]
                  text-midnight-navy

                  sm:text-[10px]
                  sm:tracking-[0.36em]

                  lg:text-[11px]
                "
              >
                Smart Jewelry
              </span>

              <span className="text-[10px] text-classic-gold">✦</span>

              <span className="h-px w-8 bg-classic-gold/40 sm:w-10" />
            </div>

            {/* TITLE */}
            <h1
              className="
                mx-auto
                max-w-[580px]
                font-serif
                text-[3rem]
                font-normal
                leading-[0.98]
                tracking-[-0.045em]
                text-midnight-navy
                drop-shadow-[0_1px_1px_rgba(255,255,255,0.45)]

                min-[390px]:text-[3.35rem]

                sm:text-[4.1rem]
                sm:leading-[0.96]

                lg:mx-0
                lg:max-w-[610px]
                lg:text-[4.8rem]
                lg:drop-shadow-none

                xl:text-[5.25rem]
              "
            >
              Jewelry that
              <span
                className="
                  mt-1.5
                  block
                  font-serif
                  italic
                  font-normal
                  text-navy-soft

                  sm:mt-2
                "
              >
                tells your story.
              </span>
            </h1>

            {/* DESCRIPTION */}
            <p
              className="
                mx-auto
                mt-7
                max-w-[460px]
                text-[13px]
                leading-[1.9]
                text-midnight-navy/85

                sm:mt-8
                sm:text-[14px]
                sm:leading-[1.95]

                lg:mx-0
                lg:max-w-[480px]
                lg:text-[16px]
                lg:text-midnight-navy/75
              "
            >
              Elegant jewelry designed to carry your most meaningful memories,
              moments, and stories — beautifully connected through smart
              technology.
            </p>

            {/* PRIMARY CTA */}
            <div
              className="
                mx-auto
                mt-8
                flex
                w-full
                max-w-[300px]
                justify-center

                sm:mt-9
                sm:max-w-none

                lg:mx-0
                lg:justify-start
              "
            >
              <Link
                to="/shop"
                className="
                  group
                  relative
                  inline-flex
                  min-h-[56px]
                  w-full
                  items-center
                  justify-between
                  overflow-hidden
                  rounded-[14px]
                  bg-midnight-navy
                  px-7
                  text-[9px]
                  font-semibold
                  uppercase
                  tracking-[0.1em]
                  text-soft-white
                  shadow-[0_15px_36px_rgba(18,38,58,0.2)]
                  transition-all
                  duration-300

                  before:pointer-events-none
                  before:absolute
                  before:inset-y-0
                  before:left-0
                  before:w-16
                  before:bg-gradient-to-r
                  before:from-soft-white/[0.06]
                  before:to-transparent

                  hover:-translate-y-0.5
                  hover:bg-rich-navy
                  hover:shadow-[0_20px_44px_rgba(18,38,58,0.25)]

                  focus:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-classic-gold/40

                  sm:w-auto
                  sm:min-w-[245px]
                  sm:text-[10px]

                  lg:min-w-[255px]
                "
              >
                <span className="relative z-10">Explore Collection</span>

                <span
                  className="
                    relative
                    z-10
                    flex
                    h-8
                    w-8
                    items-center
                    justify-center
                    rounded-full
                    bg-soft-white/[0.08]
                    text-[17px]
                    font-light
                    leading-none
                    text-champagne-gold
                    transition-all
                    duration-300

                    group-hover:translate-x-1
                    group-hover:bg-soft-white/[0.12]
                  "
                >
                  →
                </span>
              </Link>
            </div>

            {/* MINI FEATURES */}
            <div
              className="
                mx-auto
                mt-8
                max-w-[520px]
                border-t
                border-midnight-navy/10
                pt-5

                sm:mt-10

                lg:mx-0
              "
            >
              <div
                className="
                  flex
                  flex-wrap
                  items-center
                  justify-center
                  gap-x-5
                  gap-y-3

                  sm:gap-x-7

                  lg:justify-start
                "
              >
                <div className="flex items-center gap-2">
                  <span className="text-[8px] text-classic-gold">✦</span>

                  <span className="text-[8px] font-medium uppercase tracking-[0.09em] text-midnight-navy/70 sm:text-[9px] lg:text-[10px]">
                    Elegant Design
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[8px] text-classic-gold">✦</span>

                  <span className="text-[8px] font-medium uppercase tracking-[0.09em] text-midnight-navy/70 sm:text-[9px] lg:text-[10px]">
                    Personal Memories
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[8px] text-classic-gold">✦</span>

                  <span className="text-[8px] font-medium uppercase tracking-[0.09em] text-midnight-navy/70 sm:text-[9px] lg:text-[10px]">
                    NFC Technology
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* NFC FLOATING BADGE */}
        <div
          className="
            absolute
            bottom-5
            left-1/2
            z-20
            -translate-x-1/2

            sm:bottom-8
            sm:left-auto
            sm:right-8
            sm:translate-x-0

            lg:bottom-10
            lg:right-12

            xl:right-16
          "
        >
          <div
            className="
              group
              flex
              h-[92px]
              w-[92px]
              flex-col
              items-center
              justify-center
              rounded-full
              border
              border-soft-white/90
              bg-soft-white/90
              text-center
              shadow-[0_18px_45px_rgba(7,19,31,0.14)]
              backdrop-blur-xl
              transition-all
              duration-300

              hover:-translate-y-1
              hover:border-champagne-gold/50
              hover:bg-soft-white
              hover:shadow-[0_22px_50px_rgba(7,19,31,0.16)]

              sm:h-[106px]
              sm:w-[106px]

              lg:h-[116px]
              lg:w-[116px]
            "
          >
            <NfcIcon className="mb-1 text-midnight-navy" />

            <span className="text-[12px] font-medium uppercase tracking-[0.09em] text-midnight-navy sm:text-[13px] lg:text-[14px]">
              NFC
            </span>

            <span className="mt-1 text-[6px] font-semibold uppercase tracking-[0.12em] text-midnight-navy/55 sm:text-[7px]">
              Tap to Connect
            </span>
          </div>
        </div>
      </div>

      {/* BENEFITS BAR */}
      <div className="relative z-20 border-y border-light-champagne/90 bg-soft-white/95 backdrop-blur-md">
        <div
          className="
            mx-auto
            grid
            max-w-[1360px]
            grid-cols-1
            divide-y
            divide-light-champagne/90
            px-5

            sm:grid-cols-3
            sm:divide-x
            sm:divide-y-0
            sm:px-6

            lg:px-8
          "
        >
          {/* ITEM 1 */}
          <div
            className="
              flex
              min-h-[130px]
              flex-col
              items-center
              justify-center
              gap-3
              py-6
              text-center

              sm:min-h-[120px]
              sm:px-5

              lg:min-h-[112px]
              lg:flex-row
              lg:justify-start
              lg:gap-5
              lg:px-8
              lg:text-left
            "
          >
            <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full border border-light-champagne/80 bg-warm-ivory shadow-[0_6px_18px_rgba(7,19,31,0.035)] lg:h-[54px] lg:w-[54px]">
              <span className="text-[18px] text-classic-gold">✦</span>
            </div>

            <div>
              <span className="block text-[9px] font-semibold uppercase tracking-[0.06em] text-midnight-navy lg:text-[10px]">
                Elegant Design
              </span>

              <span className="mx-auto mt-1.5 block max-w-[220px] text-[10px] leading-[1.7] text-slate-gray lg:mx-0 lg:max-w-[190px] lg:text-[11px]">
                Timeless details crafted for everyday elegance.
              </span>
            </div>
          </div>

          {/* ITEM 2 */}
          <div
            className="
              flex
              min-h-[130px]
              flex-col
              items-center
              justify-center
              gap-3
              py-6
              text-center

              sm:min-h-[120px]
              sm:px-5

              lg:min-h-[112px]
              lg:flex-row
              lg:justify-start
              lg:gap-5
              lg:px-8
              lg:text-left
            "
          >
            <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full border border-light-champagne/80 bg-warm-ivory shadow-[0_6px_18px_rgba(7,19,31,0.035)] lg:h-[54px] lg:w-[54px]">
              <span className="text-[18px] text-classic-gold">♡</span>
            </div>

            <div>
              <span className="block text-[9px] font-semibold uppercase tracking-[0.06em] text-midnight-navy lg:text-[10px]">
                Personal Memories
              </span>

              <span className="mx-auto mt-1.5 block max-w-[220px] text-[10px] leading-[1.7] text-slate-gray lg:mx-0 lg:max-w-[190px] lg:text-[11px]">
                Keep meaningful moments and connections close.
              </span>
            </div>
          </div>

          {/* ITEM 3 */}
          <div
            className="
              flex
              min-h-[130px]
              flex-col
              items-center
              justify-center
              gap-3
              py-6
              text-center

              sm:min-h-[120px]
              sm:px-5

              lg:min-h-[112px]
              lg:flex-row
              lg:justify-start
              lg:gap-5
              lg:px-8
              lg:text-left
            "
          >
            <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full border border-light-champagne/80 bg-warm-ivory shadow-[0_6px_18px_rgba(7,19,31,0.035)] lg:h-[54px] lg:w-[54px]">
              <NfcIcon className="text-midnight-navy" />
            </div>

            <div>
              <span className="block text-[9px] font-semibold uppercase tracking-[0.06em] text-midnight-navy lg:text-[10px]">
                NFC Technology
              </span>

              <span className="mx-auto mt-1.5 block max-w-[220px] text-[10px] leading-[1.7] text-slate-gray lg:mx-0 lg:max-w-[190px] lg:text-[11px]">
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
