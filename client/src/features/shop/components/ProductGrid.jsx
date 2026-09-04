import ProductCard from "./ProductCard";

const ProductGrid = ({ products = [] }) => {
  if (!Array.isArray(products) || products.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-[26px] border border-light-champagne/90 bg-soft-white/85 px-6 py-20 text-center shadow-[0_12px_35px_rgba(7,19,31,0.04)] backdrop-blur-sm sm:px-10 sm:py-24">
        <div className="pointer-events-none absolute left-1/2 top-[-120px] h-[280px] w-[480px] -translate-x-1/2 rounded-full bg-soft-cream/80 blur-[90px]" />

        <div className="pointer-events-none absolute -bottom-24 -right-20 h-[220px] w-[220px] rounded-full bg-champagne-gold/10 blur-[70px]" />

        <div className="relative mx-auto max-w-md">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-light-champagne bg-warm-ivory text-[16px] text-classic-gold shadow-[0_8px_24px_rgba(7,19,31,0.05)]">
            ✦
          </div>

          <div className="mt-6 flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-classic-gold/40" />

            <span className="text-[8px] font-semibold uppercase tracking-[0.28em] text-steel-gray">
              Collection
            </span>

            <span className="h-px w-8 bg-classic-gold/40" />
          </div>

          <h3 className="mt-4 font-serif text-[1.8rem] font-normal tracking-[-0.025em] text-midnight-navy sm:text-[2rem]">
            No products found
          </h3>

          <p className="mx-auto mt-3 max-w-sm text-[12px] leading-7 text-slate-gray sm:text-[13px]">
            Try changing your search or category filter.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-x-5 gap-y-10 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product, index) => (
        <ProductCard
          key={product._id}
          product={product}
          index={index}
        />
      ))}
    </div>
  );
};

export default ProductGrid;
