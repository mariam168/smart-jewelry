import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="relative overflow-hidden bg-luxury-black text-soft-white">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-rich-navy via-luxury-black to-midnight-navy" />

      <div className="pointer-events-none absolute -right-40 -top-40 h-[460px] w-[460px] rounded-full border border-champagne-gold/10" />

      <div className="pointer-events-none absolute -right-24 -top-24 h-[300px] w-[300px] rounded-full border border-champagne-gold/10" />

      <div className="pointer-events-none absolute -bottom-48 -left-40 h-[500px] w-[500px] rounded-full bg-classic-gold/5 blur-[120px]" />

      <div className="pointer-events-none absolute left-1/2 top-0 h-[320px] w-[700px] -translate-x-1/2 rounded-full bg-navy-soft/20 blur-[120px]" />

      <div className="relative mx-auto max-w-[1360px] px-6 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24 xl:px-12">
        <div className="grid gap-14 md:grid-cols-2 lg:grid-cols-[1.55fr_0.8fr_1fr_1fr] lg:gap-10 xl:gap-16">
          <div className="max-w-[410px]">
            <Link to="/" className="group inline-flex items-center gap-4">
              <span className="relative flex h-12 w-12 items-center justify-center rounded-full border border-champagne-gold/20 bg-soft-white/5 text-[15px] text-champagne-gold shadow-[0_8px_24px_rgba(0,0,0,0.14)] backdrop-blur-sm transition-all duration-300 group-hover:border-champagne-gold/50 group-hover:bg-champagne-gold group-hover:text-luxury-black">
                ✦
              </span>

              <div>
                <p className="text-[19px] font-semibold tracking-[0.19em] text-soft-white">
                  SMART
                </p>

                <p className="-mt-0.5 text-[8px] font-semibold tracking-[0.42em] text-champagne-gold/75">
                  JEWELRY
                </p>
              </div>
            </Link>

            <p className="mt-7 max-w-[360px] text-[13px] leading-[1.9] text-premium-silver/65">
              Beautiful jewelry designed to carry something meaningful — your
              memories, your moments, and your story.
            </p>

            <div className="mt-8 flex items-center gap-3">
              <span className="h-px w-10 bg-gradient-to-r from-classic-gold to-champagne-gold/30" />

              <span className="text-[9px] text-champagne-gold">✦</span>

              <span className="h-px w-6 bg-gradient-to-r from-champagne-gold/30 to-transparent" />
            </div>
          </div>

          <div>
            <h3 className="text-[9px] font-semibold uppercase tracking-[0.3em] text-champagne-gold">
              Explore
            </h3>

            <div className="mt-7 flex flex-col gap-4">
              <Link
                to="/"
                className="group flex w-fit items-center text-[13px] text-premium-silver/65 transition-colors duration-300 hover:text-soft-white"
              >
                <span className="mr-0 w-0 overflow-hidden text-classic-gold opacity-0 transition-all duration-300 group-hover:mr-2 group-hover:w-3 group-hover:opacity-100">
                  →
                </span>
                Home
              </Link>

              <Link
                to="/shop"
                className="group flex w-fit items-center text-[13px] text-premium-silver/65 transition-colors duration-300 hover:text-soft-white"
              >
                <span className="mr-0 w-0 overflow-hidden text-classic-gold opacity-0 transition-all duration-300 group-hover:mr-2 group-hover:w-3 group-hover:opacity-100">
                  →
                </span>
                Shop
              </Link>

              <Link
                to="/about"
                className="group flex w-fit items-center text-[13px] text-premium-silver/65 transition-colors duration-300 hover:text-soft-white"
              >
                <span className="mr-0 w-0 overflow-hidden text-classic-gold opacity-0 transition-all duration-300 group-hover:mr-2 group-hover:w-3 group-hover:opacity-100">
                  →
                </span>
                About Us
              </Link>

              <Link
                to="/contact"
                className="group flex w-fit items-center text-[13px] text-premium-silver/65 transition-colors duration-300 hover:text-soft-white"
              >
                <span className="mr-0 w-0 overflow-hidden text-classic-gold opacity-0 transition-all duration-300 group-hover:mr-2 group-hover:w-3 group-hover:opacity-100">
                  →
                </span>
                Contact
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-[9px] font-semibold uppercase tracking-[0.3em] text-champagne-gold">
              Customer Care
            </h3>

            <div className="mt-7 flex flex-col gap-4">
              <Link
                to="/account"
                className="group flex w-fit items-center text-[13px] text-premium-silver/65 transition-colors duration-300 hover:text-soft-white"
              >
                <span className="mr-0 w-0 overflow-hidden text-classic-gold opacity-0 transition-all duration-300 group-hover:mr-2 group-hover:w-3 group-hover:opacity-100">
                  →
                </span>
                My Account
              </Link>

              <Link
                to="/orders"
                className="group flex w-fit items-center text-[13px] text-premium-silver/65 transition-colors duration-300 hover:text-soft-white"
              >
                <span className="mr-0 w-0 overflow-hidden text-classic-gold opacity-0 transition-all duration-300 group-hover:mr-2 group-hover:w-3 group-hover:opacity-100">
                  →
                </span>
                My Orders
              </Link>

              <Link
                to="/shipping"
                className="group flex w-fit items-center text-[13px] text-premium-silver/65 transition-colors duration-300 hover:text-soft-white"
              >
                <span className="mr-0 w-0 overflow-hidden text-classic-gold opacity-0 transition-all duration-300 group-hover:mr-2 group-hover:w-3 group-hover:opacity-100">
                  →
                </span>
                Shipping & Returns
              </Link>

              <Link
                to="/privacy"
                className="group flex w-fit items-center text-[13px] text-premium-silver/65 transition-colors duration-300 hover:text-soft-white"
              >
                <span className="mr-0 w-0 overflow-hidden text-classic-gold opacity-0 transition-all duration-300 group-hover:mr-2 group-hover:w-3 group-hover:opacity-100">
                  →
                </span>
                Privacy Policy
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-[9px] font-semibold uppercase tracking-[0.3em] text-champagne-gold">
              Connect
            </h3>

            <p className="mt-7 max-w-[240px] text-[13px] leading-[1.9] text-premium-silver/65">
              Follow our latest pieces, stories, and inspiration.
            </p>

            <div className="mt-6 flex gap-2.5">
              <a
                href="#"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-premium-silver/15 bg-soft-white/[0.03] text-[9px] font-semibold tracking-[0.08em] text-premium-silver/75 transition-all duration-300 hover:-translate-y-1 hover:border-champagne-gold/60 hover:bg-champagne-gold hover:text-luxury-black"
              >
                IG
              </a>

              <a
                href="#"
                aria-label="Facebook"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-premium-silver/15 bg-soft-white/[0.03] text-[9px] font-semibold tracking-[0.08em] text-premium-silver/75 transition-all duration-300 hover:-translate-y-1 hover:border-champagne-gold/60 hover:bg-champagne-gold hover:text-luxury-black"
              >
                FB
              </a>

              <a
                href="#"
                aria-label="TikTok"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-premium-silver/15 bg-soft-white/[0.03] text-[9px] font-semibold tracking-[0.08em] text-premium-silver/75 transition-all duration-300 hover:-translate-y-1 hover:border-champagne-gold/60 hover:bg-champagne-gold hover:text-luxury-black"
              >
                TT
              </a>
            </div>
          </div>
        </div>

        <div className="my-12 h-px bg-gradient-to-r from-transparent via-premium-silver/15 to-transparent sm:my-14" />

        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[10px] leading-5 text-premium-silver/40">
            © {new Date().getFullYear()} Smart Jewelry. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="text-[8px] font-semibold uppercase tracking-[0.25em] text-premium-silver/35">
              Elegant
            </span>

            <span className="text-[8px] text-classic-gold/70">✦</span>

            <span className="text-[8px] font-semibold uppercase tracking-[0.25em] text-premium-silver/35">
              Personal
            </span>

            <span className="text-[8px] text-classic-gold/70">✦</span>

            <span className="text-[8px] font-semibold uppercase tracking-[0.25em] text-premium-silver/35">
              Smart
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
