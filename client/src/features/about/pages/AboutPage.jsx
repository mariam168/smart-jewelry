import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next"; // استيراد الترجمة

const AboutPage = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";

  return (
    <main className="overflow-hidden bg-warm-ivory text-rich-navy">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-luxury-black">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#173650_0%,#07131F_48%,#000000_100%)]" />
        <div className="absolute -left-32 top-10 h-[420px] w-[420px] rounded-full bg-classic-gold/[0.05] blur-[120px]" />
        <div className="absolute -right-40 bottom-0 h-[500px] w-[500px] rounded-full bg-champagne-gold/[0.035] blur-[140px]" />

        <div className="relative mx-auto max-w-7xl px-5 pb-24 pt-24 sm:px-8 md:pb-32 md:pt-32 lg:px-10 lg:pb-40 lg:pt-40">
          <div className="mx-auto max-w-5xl text-center">
            <div className="flex items-center justify-center gap-4">
              <span className="h-px w-10 bg-classic-gold/45 md:w-16" />
              <p className="text-[9px] font-semibold uppercase tracking-[0.48em] text-champagne-gold">
                {t("about.hero.eyebrow")}
              </p>
              <span className="h-px w-10 bg-classic-gold/45 md:w-16" />
            </div>

            <h1 className="mt-10 font-serif text-5xl font-normal leading-[0.95] tracking-[-0.055em] text-soft-white sm:text-6xl md:text-7xl lg:text-[88px]">
              {t("about.hero.title1")}
              <span className="block text-champagne-gold">
                {t("about.hero.title2")}
              </span>
            </h1>

            <p className="mx-auto mt-8 max-w-2xl text-[14px] leading-8 text-premium-silver/75 md:text-[15px]">
              {t("about.hero.description")}
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/shop"
                className="inline-flex min-h-[50px] items-center justify-center rounded-full bg-champagne-gold px-8 text-[10px] font-semibold uppercase tracking-[0.14em] text-deep-navy transition-all duration-300 hover:-translate-y-0.5 hover:bg-classic-gold"
              >
                {t("about.hero.cta_discover")}
              </Link>
              <a
                href="#our-story"
                className="inline-flex min-h-[50px] items-center justify-center rounded-full border border-soft-white/15 px-8 text-[10px] font-semibold uppercase tracking-[0.14em] text-soft-white transition-all duration-300 hover:border-classic-gold/50 hover:text-champagne-gold"
              >
                {t("about.hero.cta_story")}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section id="our-story" className="relative py-20 md:py-28 lg:py-36">
        <div className={`mx-auto grid max-w-7xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-2 lg:gap-24 lg:px-10 ${isRtl ? "text-right" : "text-left"}`}>
          <div>
            <SectionEyebrow>{t("about.story.eyebrow")}</SectionEyebrow>
            <h2 className="mt-5 max-w-xl font-serif text-4xl leading-[1.04] tracking-[-0.045em] text-rich-navy md:text-5xl lg:text-6xl">
              {t("about.story.title")}
            </h2>
          </div>
          <div className="space-y-6 text-[14px] leading-8 text-slate-gray">
            <p>{t("about.story.p1")}</p>
            <p>{t("about.story.p2")}</p>
            <p>{t("about.story.p3")}</p>
          </div>
        </div>
      </section>

      {/* Concept Section */}
      <section className="border-y border-light-champagne bg-soft-white">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 md:py-28 lg:px-10">
          <div className="mx-auto max-w-3xl text-center">
            <SectionEyebrow centered>{t("about.concept.eyebrow")}</SectionEyebrow>
            <h2 className="mt-5 font-serif text-4xl tracking-[-0.045em] md:text-5xl">
              {t("about.concept.title1")}
              <br />
              {t("about.concept.title2")}
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-[13px] leading-7 text-slate-gray">
              {t("about.concept.description")}
            </p>
          </div>

          <div className="mt-16 grid gap-5 md:grid-cols-2">
            <ConceptCard
              number="01"
              eyebrow={t("about.concept.card1.eyebrow")}
              title={t("about.concept.card1.title")}
              text={t("about.concept.card1.text")}
              isRtl={isRtl}
            />
            <ConceptCard
              dark
              number="02"
              eyebrow={t("about.concept.card2.eyebrow")}
              title={t("about.concept.card2.title")}
              text={t("about.concept.card2.text")}
              isRtl={isRtl}
            />
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 md:py-28 lg:py-36">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className={`grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24 ${isRtl ? "text-right" : "text-left"}`}>
            <div>
              <SectionEyebrow>{t("about.process.eyebrow")}</SectionEyebrow>
              <h2 className="mt-5 font-serif text-4xl leading-[1.04] tracking-[-0.045em] md:text-5xl">
                {t("about.process.title")}
              </h2>
              <p className="mt-6 max-w-md text-[13px] leading-7 text-slate-gray">
                {t("about.process.description")}
              </p>
            </div>

            <div className="border-t border-light-champagne">
              <ProcessRow
                number="01"
                title={t("about.process.step1.title")}
                text={t("about.process.step1.text")}
              />
              <ProcessRow
                number="02"
                title={t("about.process.step2.title")}
                text={t("about.process.step2.text")}
              />
              <ProcessRow
                number="03"
                title={t("about.process.step3.title")}
                text={t("about.process.step3.text")}
              />
              <ProcessRow
                number="04"
                title={t("about.process.step4.title")}
                text={t("about.process.step4.text")}
                last
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="relative overflow-hidden bg-deep-navy">
        <div className="absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-classic-gold/[0.04] blur-[130px]" />
        <div className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8 md:py-28 lg:px-10 lg:py-32">
          <div className={`grid gap-16 lg:grid-cols-2 lg:gap-28 ${isRtl ? "text-right" : "text-left"}`}>
            <div>
              <SectionEyebrow light>{t("about.values.eyebrow")}</SectionEyebrow>
              <h2 className="mt-5 max-w-xl font-serif text-4xl leading-[1.04] tracking-[-0.045em] text-soft-white md:text-5xl lg:text-6xl">
                {t("about.values.title")}
              </h2>
            </div>

            <div className="grid gap-px overflow-hidden rounded-[28px] border border-soft-white/10 bg-soft-white/10 sm:grid-cols-2">
              <ValueCard title={t("about.values.card1.title")} text={t("about.values.card1.text")} isRtl={isRtl} />
              <ValueCard title={t("about.values.card2.title")} text={t("about.values.card2.text")} isRtl={isRtl} />
              <ValueCard title={t("about.values.card3.title")} text={t("about.values.card3.text")} isRtl={isRtl} />
              <ValueCard title={t("about.values.card4.title")} text={t("about.values.card4.text")} isRtl={isRtl} />
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="bg-soft-white py-20 md:py-28 lg:py-36">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-4xl text-center">
            <SectionEyebrow centered>{t("about.philosophy.eyebrow")}</SectionEyebrow>
            <p className="mt-8 font-serif text-3xl leading-[1.45] tracking-[-0.035em] text-rich-navy md:text-4xl lg:text-[46px]">
              {t("about.philosophy.quote")}
            </p>
            <div className="mx-auto mt-10 h-px w-16 bg-classic-gold" />
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="border-t border-light-champagne bg-warm-ivory py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="relative overflow-hidden rounded-[34px] bg-luxury-black px-7 py-14 text-center md:px-14 md:py-20 lg:px-20">
            <div className="absolute left-1/2 top-1/2 h-[450px] w-[450px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-classic-gold/[0.055] blur-[120px]" />
            <div className="relative mx-auto max-w-3xl">
              <p className="text-[9px] font-semibold uppercase tracking-[0.4em] text-champagne-gold">
                {t("about.cta_section.eyebrow")}
              </p>
              <h2 className="mt-5 font-serif text-4xl tracking-[-0.045em] text-soft-white md:text-5xl lg:text-6xl">
                {t("about.cta_section.title1")}
                <span className="block text-champagne-gold">
                  {t("about.cta_section.title2")}
                </span>
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-[13px] leading-7 text-premium-silver/65">
                {t("about.cta_section.description")}
              </p>
              <Link
                to="/shop"
                className="mt-9 inline-flex min-h-[52px] items-center justify-center rounded-full bg-champagne-gold px-9 text-[10px] font-semibold uppercase tracking-[0.14em] text-deep-navy transition-all duration-300 hover:-translate-y-0.5 hover:bg-classic-gold"
              >
                {t("about.cta_section.cta")}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

// Sub-components
const SectionEyebrow = ({ children, centered = false, light = false }) => (
  <div className={`flex items-center gap-3 ${centered ? "justify-center" : ""}`}>
    <span className={`h-px w-8 ${light ? "bg-classic-gold/70" : "bg-classic-gold"}`} />
    <p className={`text-[9px] font-semibold uppercase tracking-[0.3em] ${light ? "text-champagne-gold" : "text-antique-gold"}`}>
      {children}
    </p>
  </div>
);

const ConceptCard = ({ number, eyebrow, title, text, dark = false, isRtl }) => (
  <div className={`relative overflow-hidden rounded-[30px] border p-8 md:p-12 ${isRtl ? "text-right" : "text-left"} ${dark ? "border-deep-navy bg-deep-navy text-soft-white" : "border-light-champagne bg-warm-ivory text-rich-navy"}`}>
    {dark && <div className={`absolute -top-20 h-56 w-56 rounded-full bg-classic-gold/[0.06] blur-3xl ${isRtl ? "-left-20" : "-right-20"}`} />}
    <div className="relative">
      <p className={`font-mono text-[10px] ${dark ? "text-champagne-gold" : "text-antique-gold"}`}>{number}</p>
      <p className={`mt-14 text-[9px] font-semibold uppercase tracking-[0.3em] ${dark ? "text-champagne-gold" : "text-antique-gold"}`}>{eyebrow}</p>
      <h3 className="mt-4 font-serif text-3xl tracking-[-0.035em] md:text-4xl">{title}</h3>
      <p className={`mt-5 max-w-md text-[13px] leading-7 ${dark ? "text-premium-silver/65" : "text-slate-gray"}`}>{text}</p>
    </div>
  </div>
);

const ProcessRow = ({ number, title, text, last = false }) => (
  <div className={`grid gap-5 py-8 sm:grid-cols-[70px_1fr] md:py-10 ${!last ? "border-b border-light-champagne" : ""}`}>
    <p className="font-mono text-[10px] text-antique-gold">{number}</p>
    <div>
      <h3 className="font-serif text-2xl tracking-[-0.025em] text-rich-navy md:text-3xl">{title}</h3>
      <p className="mt-3 max-w-xl text-[13px] leading-7 text-slate-gray">{text}</p>
    </div>
  </div>
);

const ValueCard = ({ title, text, isRtl }) => (
  <div className={`bg-deep-navy p-7 md:p-9 ${isRtl ? "text-right" : "text-left"}`}>
    <div className={`h-1.5 w-1.5 rounded-full bg-classic-gold ${isRtl ? "mr-0 ml-auto" : ""}`} />
    <h3 className="mt-7 font-serif text-2xl text-soft-white">{title}</h3>
    <p className="mt-4 text-[12px] leading-6 text-premium-silver/60">{text}</p>
  </div>
);

export default AboutPage;