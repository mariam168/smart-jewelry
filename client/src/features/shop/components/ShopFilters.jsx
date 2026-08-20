const ShopFilters = ({
  search,
  setSearch,
  category,
  setCategory,
  categories = [],
}) => {
  return (
    <div className="relative overflow-hidden rounded-[26px] border border-light-champagne/90 bg-soft-white/85 p-5 shadow-[0_12px_35px_rgba(7,19,31,0.045)] backdrop-blur-sm sm:p-6 lg:p-7">
      <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-champagne-gold/10 blur-[70px]" />

      <div className="pointer-events-none absolute -bottom-24 -left-20 h-48 w-48 rounded-full bg-soft-cream/80 blur-[70px]" />

      <div className="relative">
        <div className="mb-6 sm:mb-7">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-classic-gold/50" />

            <p className="text-[9px] font-semibold uppercase tracking-[0.3em] text-midnight-navy">
              Refine
            </p>

            <span className="text-[8px] text-classic-gold">✦</span>
          </div>

          <h3 className="mt-3 font-serif text-[1.6rem] font-normal tracking-[-0.025em] text-midnight-navy sm:text-[1.75rem]">
            Find your perfect
            <span className="ml-1.5 italic text-navy-soft">piece.</span>
          </h3>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2.5 block text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-gray">
              Search Jewelry
            </label>

            <div className="group relative">
              <div className="pointer-events-none absolute left-4 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-warm-ivory text-slate-gray transition-all duration-300 group-focus-within:bg-midnight-navy group-focus-within:text-champagne-gold">
                <svg
                  className="h-3.5 w-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-4-4" />
                </svg>
              </div>

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name..."
                className="h-[52px] w-full rounded-[14px] border border-light-champagne bg-warm-ivory/70 pl-14 pr-5 text-[13px] text-midnight-navy outline-none transition-all duration-300 placeholder:text-steel-gray/80 hover:border-champagne-gold/60 hover:bg-soft-white focus:border-classic-gold focus:bg-soft-white focus:shadow-[0_0_0_4px_rgba(201,162,77,0.08)]"
              />
            </div>
          </div>

          <div>
            <label className="mb-2.5 block text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-gray">
              Category
            </label>

            <div className="group relative">
              <div className="pointer-events-none absolute left-4 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-warm-ivory text-classic-gold transition-all duration-300 group-focus-within:bg-midnight-navy group-focus-within:text-champagne-gold">
                <span className="text-[9px]">✦</span>
              </div>

              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="h-[52px] w-full appearance-none rounded-[14px] border border-light-champagne bg-warm-ivory/70 pl-14 pr-12 text-[13px] text-midnight-navy outline-none transition-all duration-300 hover:border-champagne-gold/60 hover:bg-soft-white focus:border-classic-gold focus:bg-soft-white focus:shadow-[0_0_0_4px_rgba(201,162,77,0.08)]"
              >
                {categories.map((item) => {
                  const value =
                    typeof item === "string" ? item : item.slug || item._id;

                  const label =
                    typeof item === "string"
                      ? item === "all"
                        ? "All Categories"
                        : item
                      : item.name;

                  return (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  );
                })}
              </select>

              <span className="pointer-events-none absolute right-4 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-slate-gray transition-colors duration-300 group-focus-within:text-classic-gold">
                <svg
                  className="h-3.5 w-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopFilters;
