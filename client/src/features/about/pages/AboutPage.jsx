import {
  Link,
} from "react-router-dom";

const AboutPage = () => {
  return (
    <main className="overflow-hidden bg-warm-ivory text-rich-navy">
      <section className="relative overflow-hidden bg-luxury-black">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#173650_0%,#07131F_48%,#000000_100%)]" />

        <div className="absolute -left-32 top-10 h-[420px] w-[420px] rounded-full bg-classic-gold/[0.05] blur-[120px]" />

        <div className="absolute -right-40 bottom-0 h-[500px] w-[500px] rounded-full bg-champagne-gold/[0.035] blur-[140px]" />

        <div className="relative mx-auto max-w-7xl px-5 pb-24 pt-24 sm:px-8 md:pb-32 md:pt-32 lg:px-10 lg:pb-40 lg:pt-40">
          <div className="mx-auto max-w-5xl text-center">
            <div className="flex items-center justify-center gap-4">
              <span className="h-px w-10 bg-classic-gold/45 md:w-16" />

              <p className="text-[9px] font-semibold uppercase tracking-[0.48em] text-champagne-gold">
                About JEVORYA
              </p>

              <span className="h-px w-10 bg-classic-gold/45 md:w-16" />
            </div>

            <h1 className="mt-10 font-serif text-5xl font-normal leading-[0.95] tracking-[-0.055em] text-soft-white sm:text-6xl md:text-7xl lg:text-[88px]">
              Jewelry That
              <span className="block text-champagne-gold">
                Holds More.
              </span>
            </h1>

            <p className="mx-auto mt-8 max-w-2xl text-[14px] leading-8 text-premium-silver/75 md:text-[15px]">
              JEVORYA brings together meaningful jewelry and personal digital
              experiences, creating pieces that can carry more than their
              physical form.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/shop"
                className="inline-flex min-h-[50px] items-center justify-center rounded-full bg-champagne-gold px-8 text-[10px] font-semibold uppercase tracking-[0.14em] text-deep-navy transition-all duration-300 hover:-translate-y-0.5 hover:bg-classic-gold"
              >
                Discover The Collection
              </Link>

              <a
                href="#our-story"
                className="inline-flex min-h-[50px] items-center justify-center rounded-full border border-soft-white/15 px-8 text-[10px] font-semibold uppercase tracking-[0.14em] text-soft-white transition-all duration-300 hover:border-classic-gold/50 hover:text-champagne-gold"
              >
                Our Story
              </a>
            </div>
          </div>
        </div>
      </section>

      <section
        id="our-story"
        className="relative py-20 md:py-28 lg:py-36"
      >
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-2 lg:gap-24 lg:px-10">
          <div>
            <SectionEyebrow>
              Our Story
            </SectionEyebrow>

            <h2 className="mt-5 max-w-xl font-serif text-4xl leading-[1.04] tracking-[-0.045em] text-rich-navy md:text-5xl lg:text-6xl">
              Some things deserve to be remembered differently.
            </h2>
          </div>

          <div className="space-y-6 text-[14px] leading-8 text-slate-gray">
            <p>
              Jewelry has always carried meaning. A gift can represent a
              person, a moment, a promise, or a chapter of life that deserves
              to stay close.
            </p>

            <p>
              JEVORYA was created around a simple idea: what if a jewelry piece
              could hold the story behind that meaning too?
            </p>

            <p>
              We connect selected pieces with a private digital experience,
              allowing memories, words, media and meaningful details to live
              alongside the physical object.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-light-champagne bg-soft-white">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 md:py-28 lg:px-10">
          <div className="mx-auto max-w-3xl text-center">
            <SectionEyebrow centered>
              The Idea
            </SectionEyebrow>

            <h2 className="mt-5 font-serif text-4xl tracking-[-0.045em] md:text-5xl">
              One piece.
              <br />
              Two dimensions.
            </h2>

            <p className="mx-auto mt-6 max-w-xl text-[13px] leading-7 text-slate-gray">
              A physical piece designed to be worn, and a digital layer
              designed to hold what makes it personal.
            </p>
          </div>

          <div className="mt-16 grid gap-5 md:grid-cols-2">
            <ConceptCard
              number="01"
              eyebrow="The Physical"
              title="A piece you keep close"
              text="Modern jewelry with a refined, minimal approach designed to feel personal without being overcomplicated."
            />

            <ConceptCard
              dark
              number="02"
              eyebrow="The Digital"
              title="A story that lives with it"
              text="A private experience connected to the piece, giving it a deeper layer of meaning beyond the jewelry itself."
            />
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28 lg:py-36">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
            <div>
              <SectionEyebrow>
                How It Works
              </SectionEyebrow>

              <h2 className="mt-5 font-serif text-4xl leading-[1.04] tracking-[-0.045em] md:text-5xl">
                From jewelry to experience.
              </h2>

              <p className="mt-6 max-w-md text-[13px] leading-7 text-slate-gray">
                The technology stays in the background. What matters is the
                moment the piece reveals something meaningful.
              </p>
            </div>

            <div className="border-t border-light-champagne">
              <ProcessRow
                number="01"
                title="Choose your piece"
                text="Start with a JEVORYA jewelry piece that fits the person, moment or memory."
              />

              <ProcessRow
                number="02"
                title="Connect the experience"
                text="The selected smart piece is prepared with its own unique digital identity."
              />

              <ProcessRow
                number="03"
                title="Make it personal"
                text="Add the words, names, memories and media that make the experience yours."
              />

              <ProcessRow
                number="04"
                title="Keep the memory close"
                text="The physical piece becomes a lasting connection to the experience attached to it."
                last
              />
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-deep-navy">
        <div className="absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-classic-gold/[0.04] blur-[130px]" />

        <div className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8 md:py-28 lg:px-10 lg:py-32">
          <div className="grid gap-16 lg:grid-cols-2 lg:gap-28">
            <div>
              <SectionEyebrow light>
                Designed With Intention
              </SectionEyebrow>

              <h2 className="mt-5 max-w-xl font-serif text-4xl leading-[1.04] tracking-[-0.045em] text-soft-white md:text-5xl lg:text-6xl">
                Technology should add meaning, not noise.
              </h2>
            </div>

            <div className="grid gap-px overflow-hidden rounded-[28px] border border-soft-white/10 bg-soft-white/10 sm:grid-cols-2">
              <ValueCard
                title="Personal"
                text="Every experience belongs to a specific piece and story."
              />

              <ValueCard
                title="Simple"
                text="The technology stays discreet so the jewelry remains the focus."
              />

              <ValueCard
                title="Meaningful"
                text="Built around memories, messages and moments worth keeping."
              />

              <ValueCard
                title="Private"
                text="Personal experiences are designed to be accessed intentionally, not exposed like ordinary social content."
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-soft-white py-20 md:py-28 lg:py-36">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-4xl text-center">
            <SectionEyebrow centered>
              Our Philosophy
            </SectionEyebrow>

            <p className="mt-8 font-serif text-3xl leading-[1.45] tracking-[-0.035em] text-rich-navy md:text-4xl lg:text-[46px]">
              “The value of a piece is not only in what it is made from,
              but in what it comes to mean.”
            </p>

            <div className="mx-auto mt-10 h-px w-16 bg-classic-gold" />
          </div>
        </div>
      </section>

      <section className="border-t border-light-champagne bg-warm-ivory py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="relative overflow-hidden rounded-[34px] bg-luxury-black px-7 py-14 text-center md:px-14 md:py-20 lg:px-20">
            <div className="absolute left-1/2 top-1/2 h-[450px] w-[450px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-classic-gold/[0.055] blur-[120px]" />

            <div className="relative mx-auto max-w-3xl">
              <p className="text-[9px] font-semibold uppercase tracking-[0.4em] text-champagne-gold">
                JEVORYA
              </p>

              <h2 className="mt-5 font-serif text-4xl tracking-[-0.045em] text-soft-white md:text-5xl lg:text-6xl">
                Wear the piece.
                <span className="block text-champagne-gold">
                  Keep the story.
                </span>
              </h2>

              <p className="mx-auto mt-6 max-w-xl text-[13px] leading-7 text-premium-silver/65">
                Discover jewelry designed to carry something more personal.
              </p>

              <Link
                to="/shop"
                className="mt-9 inline-flex min-h-[52px] items-center justify-center rounded-full bg-champagne-gold px-9 text-[10px] font-semibold uppercase tracking-[0.14em] text-deep-navy transition-all duration-300 hover:-translate-y-0.5 hover:bg-classic-gold"
              >
                Explore JEVORYA
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

const SectionEyebrow = ({
  children,
  centered = false,
  light = false,
}) => {
  return (
    <div
      className={`flex items-center gap-3 ${
        centered
          ? "justify-center"
          : ""
      }`}
    >
      <span
        className={`h-px w-8 ${
          light
            ? "bg-classic-gold/70"
            : "bg-classic-gold"
        }`}
      />

      <p
        className={`text-[9px] font-semibold uppercase tracking-[0.3em] ${
          light
            ? "text-champagne-gold"
            : "text-antique-gold"
        }`}
      >
        {children}
      </p>
    </div>
  );
};

const ConceptCard = ({
  number,
  eyebrow,
  title,
  text,
  dark = false,
}) => {
  return (
    <div
      className={`relative overflow-hidden rounded-[30px] border p-8 md:p-12 ${
        dark
          ? "border-deep-navy bg-deep-navy text-soft-white"
          : "border-light-champagne bg-warm-ivory text-rich-navy"
      }`}
    >
      {dark && (
        <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-classic-gold/[0.06] blur-3xl" />
      )}

      <div className="relative">
        <p
          className={`font-mono text-[10px] ${
            dark
              ? "text-champagne-gold"
              : "text-antique-gold"
          }`}
        >
          {number}
        </p>

        <p
          className={`mt-14 text-[9px] font-semibold uppercase tracking-[0.3em] ${
            dark
              ? "text-champagne-gold"
              : "text-antique-gold"
          }`}
        >
          {eyebrow}
        </p>

        <h3 className="mt-4 font-serif text-3xl tracking-[-0.035em] md:text-4xl">
          {title}
        </h3>

        <p
          className={`mt-5 max-w-md text-[13px] leading-7 ${
            dark
              ? "text-premium-silver/65"
              : "text-slate-gray"
          }`}
        >
          {text}
        </p>
      </div>
    </div>
  );
};

const ProcessRow = ({
  number,
  title,
  text,
  last = false,
}) => {
  return (
    <div
      className={`grid gap-5 py-8 sm:grid-cols-[70px_1fr] md:py-10 ${
        !last
          ? "border-b border-light-champagne"
          : ""
      }`}
    >
      <p className="font-mono text-[10px] text-antique-gold">
        {number}
      </p>

      <div>
        <h3 className="font-serif text-2xl tracking-[-0.025em] text-rich-navy md:text-3xl">
          {title}
        </h3>

        <p className="mt-3 max-w-xl text-[13px] leading-7 text-slate-gray">
          {text}
        </p>
      </div>
    </div>
  );
};

const ValueCard = ({
  title,
  text,
}) => {
  return (
    <div className="bg-deep-navy p-7 md:p-9">
      <div className="h-1.5 w-1.5 rounded-full bg-classic-gold" />

      <h3 className="mt-7 font-serif text-2xl text-soft-white">
        {title}
      </h3>

      <p className="mt-4 text-[12px] leading-6 text-premium-silver/60">
        {text}
      </p>
    </div>
  );
};

export default AboutPage;