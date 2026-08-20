const ShopHeader = ({ productsCount }) => {
  return (
    <section className="relative overflow-hidden border-b border-light-champagne/80 bg-warm-ivory">
      <div className="pointer-events-none absolute left-1/2 top-[-180px] h-[420px] w-[760px] -translate-x-1/2 rounded-full bg-soft-cream/80 blur-[110px]" />

      <div className="pointer-events-none absolute -left-32 bottom-[-180px] h-[360px] w-[360px] rounded-full bg-champagne-gold/10 blur-[100px]" />

      <div className="pointer-events-none absolute -right-32 top-10 h-[360px] w-[360px] rounded-full bg-light-champagne/70 blur-[100px]" />

      <div className="relative mx-auto max-w-[1360px] px-6 py-16 text-center sm:px-8 sm:py-20 lg:px-10 lg:py-24 xl:px-12">
        <div className="mx-auto max-w-[820px]">
          <div className="mb-5 flex items-center justify-center gap-3">
            <span className="h-px w-10 bg-classic-gold/45" />

            <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-midnight-navy">
              Smart Jewelry
            </p>

            <span className="h-px w-10 bg-classic-gold/45" />
          </div>

          <h1 className="font-serif text-[3rem] font-normal leading-[1.02] tracking-[-0.045em] text-midnight-navy sm:text-[3.8rem] lg:text-[4.6rem]">
            Discover Your
            <span className="ml-2 italic text-navy-soft">Jewelry.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-[620px] text-[13px] leading-7 text-slate-gray sm:text-[15px] sm:leading-8">
            Explore our collection of smart jewelry designed to combine
            elegance, technology, and meaningful connections.
          </p>

          <div className="mt-7 flex justify-center">
            <div className="inline-flex items-center gap-3 rounded-full border border-light-champagne bg-soft-white/75 px-4 py-2.5 shadow-[0_6px_18px_rgba(7,19,31,0.04)] backdrop-blur-sm">
              <span className="text-[9px] text-classic-gold">✦</span>

              <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-gray">
                {productsCount} products available
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShopHeader;
