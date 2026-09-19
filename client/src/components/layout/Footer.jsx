import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import {
FaInstagram,
FaFacebookF,
FaTiktok,
} from "react-icons/fa6";

const Footer = () => {
const { t, i18n } = useTranslation();

const isRtl = i18n.language === "ar";

const exploreLinks = [
{
to: "/",
label: t("footer.links.home"),
},
{
to: "/shop",
label: t("footer.links.shop"),
},
{
to: "/about",
label: t("footer.links.about"),
},
{
to: "/contact",
label: t("footer.links.contact"),
},
];

const accountLinks = [
{
to: "/account",
label: t("footer.links.account"),
},
{
to: "/account/orders",
label: t("footer.links.orders"),
},
];

const socialLinks = [
{
name: "Instagram",
href: "https://www.instagram.com/jevorya/",
icon: FaInstagram,
},
{
name: "Facebook",
href: "https://www.facebook.com/profile.php?id=61593138991320",
icon: FaFacebookF,
},
{
name: "TikTok",
href: "https://www.tiktok.com/@jevorya?_r=1&_t=ZS-99pewF7Fiqr",
icon: FaTiktok,
},
];

return ( <footer className="relative overflow-hidden bg-luxury-black text-soft-white"> <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-rich-navy via-luxury-black to-midnight-navy" />


  <div
    className={`pointer-events-none absolute -top-40 h-[460px] w-[460px] rounded-full border border-champagne-gold/10 ${
      isRtl ? "-left-40" : "-right-40"
    }`}
  />

  <div
    className={`pointer-events-none absolute -top-24 h-[300px] w-[300px] rounded-full border border-champagne-gold/10 ${
      isRtl ? "-left-24" : "-right-24"
    }`}
  />

  <div
    className={`pointer-events-none absolute -bottom-48 h-[500px] w-[500px] rounded-full bg-classic-gold/5 blur-[120px] ${
      isRtl ? "-right-40" : "-left-40"
    }`}
  />

  <div className="pointer-events-none absolute left-1/2 top-0 h-[320px] w-[700px] -translate-x-1/2 rounded-full bg-navy-soft/20 blur-[120px]" />

  <div className="relative mx-auto max-w-[1360px] px-6 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24 xl:px-12">
    <div className="grid gap-14 md:grid-cols-2 lg:grid-cols-[1.55fr_0.8fr_0.8fr_1fr] lg:gap-10 xl:gap-16">
      <div className="max-w-[410px]">
        <Link
          to="/"
          className="group inline-flex items-center gap-4"
        >
          <span className="relative flex h-12 w-12 items-center justify-center rounded-full border border-champagne-gold/20 bg-soft-white/5 text-[15px] text-champagne-gold shadow-[0_8px_24px_rgba(0,0,0,0.14)] backdrop-blur-sm transition-all duration-300 group-hover:border-champagne-gold/50 group-hover:bg-champagne-gold group-hover:text-luxury-black">
            ✦
          </span>

          <div
            className={
              isRtl
                ? "text-right"
                : "text-left"
            }
          >
            <p className="text-[19px] font-semibold tracking-[0.19em] text-soft-white">
              Jevorya
            </p>

            <p className="-mt-0.5 text-[8px] font-semibold tracking-[0.42em] text-champagne-gold/75">
              SMART JEWELRY
            </p>
          </div>
        </Link>

        <p
          className={`mt-7 max-w-[360px] text-[13px] leading-[1.9] text-premium-silver/65 ${
            isRtl
              ? "text-right"
              : "text-left"
          }`}
        >
          {t("footer.description")}
        </p>

        <div
          className={`mt-8 flex items-center gap-3 ${
            isRtl
              ? "flex-row-reverse"
              : ""
          }`}
        >
          <span
            className={`h-px w-10 bg-gradient-to-r from-classic-gold to-champagne-gold/30 ${
              isRtl
                ? "rotate-180"
                : ""
            }`}
          />

          <span className="text-[9px] text-champagne-gold">
            ✦
          </span>

          <span
            className={`h-px w-6 bg-gradient-to-r from-champagne-gold/30 to-transparent ${
              isRtl
                ? "rotate-180"
                : ""
            }`}
          />
        </div>
      </div>

      <div
        className={
          isRtl
            ? "text-right"
            : "text-left"
        }
      >
        <h3 className="text-[9px] font-semibold uppercase tracking-[0.3em] text-champagne-gold">
          {t("footer.titles.explore")}
        </h3>

        <div className="mt-7 flex flex-col gap-4">
          {exploreLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`group flex w-fit items-center text-[13px] text-premium-silver/65 transition-colors duration-300 hover:text-soft-white ${
                isRtl
                  ? "flex-row-reverse"
                  : ""
              }`}
            >
              <span
                className={`overflow-hidden text-classic-gold opacity-0 transition-all duration-300 group-hover:w-3 group-hover:opacity-100 ${
                  isRtl
                    ? "ml-0 w-0 group-hover:ml-2"
                    : "mr-0 w-0 group-hover:mr-2"
                }`}
              >
                {isRtl
                  ? "←"
                  : "→"}
              </span>

              {link.label}
            </Link>
          ))}
        </div>
      </div>

      <div
        className={
          isRtl
            ? "text-right"
            : "text-left"
        }
      >
        <h3 className="text-[9px] font-semibold uppercase tracking-[0.3em] text-champagne-gold">
          {t("footer.titles.care")}
        </h3>

        <div className="mt-7 flex flex-col gap-4">
          {accountLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`group flex w-fit items-center text-[13px] text-premium-silver/65 transition-colors duration-300 hover:text-soft-white ${
                isRtl
                  ? "flex-row-reverse"
                  : ""
              }`}
            >
              <span
                className={`overflow-hidden text-classic-gold opacity-0 transition-all duration-300 group-hover:w-3 group-hover:opacity-100 ${
                  isRtl
                    ? "ml-0 w-0 group-hover:ml-2"
                    : "mr-0 w-0 group-hover:mr-2"
                }`}
              >
                {isRtl
                  ? "←"
                  : "→"}
              </span>

              {link.label}
            </Link>
          ))}
        </div>
      </div>

      <div
        className={
          isRtl
            ? "text-right"
            : "text-left"
        }
      >
        <h3 className="text-[9px] font-semibold uppercase tracking-[0.3em] text-champagne-gold">
          {t("footer.titles.connect")}
        </h3>

        <p className="mt-7 max-w-[240px] text-[13px] leading-[1.9] text-premium-silver/65">
          {t("footer.connectDesc")}
        </p>

        <div
          className={`mt-6 flex gap-2.5 ${
            isRtl
              ? "flex-row-reverse justify-end"
              : "justify-start"
          }`}
        >
          {socialLinks.map((social) => {
            const Icon = social.icon;

            return (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.name}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-premium-silver/15 bg-soft-white/[0.03] text-premium-silver/75 transition-all duration-300 hover:-translate-y-1 hover:border-champagne-gold/60 hover:bg-champagne-gold hover:text-luxury-black"
              >
                <Icon className="text-sm" />
              </a>
            );
          })}
        </div>
      </div>
    </div>

    <div className="my-12 h-px bg-gradient-to-r from-transparent via-premium-silver/15 to-transparent sm:my-14" />

    <div
      className={`flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between ${
        isRtl
          ? "sm:flex-row-reverse"
          : ""
      }`}
    >
      <p className="text-[10px] leading-5 text-premium-silver/40">
        © {new Date().getFullYear()} Jevorya.{" "}
        {t("footer.copyright")}
      </p>

      <div
        className={`flex flex-wrap items-center gap-x-4 gap-y-2 ${
          isRtl
            ? "sm:flex-row-reverse"
            : ""
        }`}
      >
        <span className="text-[8px] font-semibold uppercase tracking-[0.25em] text-premium-silver/35">
          {t("footer.keywords.elegant")}
        </span>

        <span className="text-[8px] text-classic-gold/70">
          ✦
        </span>

        <span className="text-[8px] font-semibold uppercase tracking-[0.25em] text-premium-silver/35">
          {t("footer.keywords.personal")}
        </span>

        <span className="text-[8px] text-classic-gold/70">
          ✦
        </span>

        <span className="text-[8px] font-semibold uppercase tracking-[0.25em] text-premium-silver/35">
          {t("footer.keywords.smart")}
        </span>
      </div>
    </div>
  </div>
</footer>


);
};

export default Footer;
