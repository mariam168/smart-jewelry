import {
  Link,
  useLocation,
} from "react-router-dom";

const NotFoundPage = () => {
  const location =
    useLocation();

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-luxury-black px-5 py-20 text-soft-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,#173650_0%,#07131F_48%,#000000_100%)]" />

      <div className="absolute -left-40 top-0 h-[500px] w-[500px] rounded-full bg-classic-gold/[0.045] blur-[130px]" />

      <div className="absolute -right-40 bottom-0 h-[520px] w-[520px] rounded-full bg-champagne-gold/[0.035] blur-[150px]" />

      <div className="pointer-events-none absolute left-[8%] top-[14%] h-48 w-48 rounded-full border border-classic-gold/[0.07]" />

      <div className="pointer-events-none absolute bottom-[10%] right-[8%] h-72 w-72 rounded-full border border-soft-white/[0.035]" />

      <div className="relative z-10 mx-auto w-full max-w-4xl text-center">
        <div className="flex items-center justify-center gap-4">
          <span className="h-px w-10 bg-classic-gold/50 md:w-16" />

          <p className="text-[9px] font-semibold uppercase tracking-[0.45em] text-champagne-gold">
            JEVORYA
          </p>

          <span className="h-px w-10 bg-classic-gold/50 md:w-16" />
        </div>

        <div className="relative mx-auto mt-12 flex h-28 w-28 items-center justify-center rounded-full border border-classic-gold/20 bg-soft-white/[0.025] md:h-32 md:w-32">
          <div className="absolute inset-3 rounded-full border border-soft-white/[0.05]" />

          <span className="relative font-serif text-4xl text-champagne-gold">
            ✦
          </span>
        </div>

        <p className="mt-12 font-serif text-[90px] leading-none tracking-[-0.08em] text-soft-white sm:text-[120px] md:text-[150px]">
          404
        </p>

        <p className="-mt-2 text-[9px] font-semibold uppercase tracking-[0.38em] text-champagne-gold">
          Page Not Found
        </p>

        <h1 className="mx-auto mt-7 max-w-2xl font-serif text-4xl leading-[1.05] tracking-[-0.045em] text-soft-white sm:text-5xl md:text-6xl">
          This story doesn&apos;t
          <span className="block text-champagne-gold">
            exist here.
          </span>
        </h1>

        <p className="mx-auto mt-7 max-w-xl text-[13px] leading-7 text-premium-silver/60">
          The page you&apos;re looking for may have moved, changed, or never
          existed.
        </p>

        <div className="mx-auto mt-7 max-w-xl overflow-hidden rounded-[16px] border border-soft-white/[0.07] bg-soft-white/[0.03] px-5 py-4">
          <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-premium-silver/35">
            Requested Route
          </p>

          <p className="mt-2 break-all font-mono text-[10px] text-premium-silver/65">
            {location.pathname}
          </p>
        </div>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to="/"
            className="inline-flex min-h-[52px] w-full items-center justify-center rounded-full bg-champagne-gold px-9 text-[10px] font-semibold uppercase tracking-[0.14em] text-deep-navy transition-all duration-300 hover:-translate-y-0.5 hover:bg-classic-gold sm:w-auto"
          >
            Back Home
          </Link>

          <Link
            to="/shop"
            className="inline-flex min-h-[52px] w-full items-center justify-center rounded-full border border-soft-white/15 px-9 text-[10px] font-semibold uppercase tracking-[0.14em] text-soft-white transition-all duration-300 hover:border-classic-gold/45 hover:text-champagne-gold sm:w-auto"
          >
            Explore Collection
          </Link>
        </div>

        <div className="mt-14 flex items-center justify-center gap-4">
          <span className="h-px w-12 bg-classic-gold/20" />

          <span className="text-[12px] text-classic-gold">
            ♡
          </span>

          <span className="h-px w-12 bg-classic-gold/20" />
        </div>

        <p className="mt-5 text-[8px] font-semibold uppercase tracking-[0.25em] text-premium-silver/25">
          Wear the piece · Keep the story
        </p>
      </div>
    </main>
  );
};

export default NotFoundPage;