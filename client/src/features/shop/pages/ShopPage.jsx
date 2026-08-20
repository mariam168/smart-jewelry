import { useEffect, useMemo, useState } from "react";

import ShopHeader from "../components/ShopHeader";
import ShopFilters from "../components/ShopFilters";
import ProductGrid from "../components/ProductGrid";

import { getShopProducts } from "../services/shopApi";

const ShopPage = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true);
        setError("");

        const response = await getShopProducts();

        console.log("Products:", response);

        setProducts(response?.products || []);
      } catch (error) {
        console.error("Shop Products Error:", error);

        setError(error?.response?.data?.message || "Failed to load products.");
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  const categories = useMemo(() => {
    return [
      "all",
      ...new Set(
        products.map((product) => product.category?.name).filter(Boolean),
      ),
    ];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const searchValue = search.toLowerCase();

      const matchesSearch =
        product.name?.toLowerCase().includes(searchValue) ||
        product.description?.toLowerCase().includes(searchValue);

      const matchesCategory =
        category === "all" ||
        product.category?.name === category ||
        product.category?._id === category;

      return matchesSearch && matchesCategory;
    });
  }, [products, search, category]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-warm-ivory text-midnight-navy">
      <div className="pointer-events-none absolute left-[-220px] top-[420px] h-[480px] w-[480px] rounded-full bg-light-champagne/55 blur-[120px]" />

      <div className="pointer-events-none absolute right-[-220px] top-[760px] h-[520px] w-[520px] rounded-full bg-champagne-gold/[0.07] blur-[130px]" />

      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute -left-40 -top-40 h-[420px] w-[420px] rounded-full border border-classic-gold/10" />

        <div className="pointer-events-none absolute -right-32 top-20 h-[350px] w-[350px] rounded-full bg-champagne-gold/[0.05] blur-[90px]" />

        <ShopHeader productsCount={filteredProducts.length} />
      </div>

      <main className="relative mx-auto max-w-[1440px] px-6 pb-24 pt-10 sm:px-8 sm:pt-12 lg:px-12 lg:pb-28 lg:pt-14">
        <section className="relative">
          <div className="mb-8 h-px w-full bg-gradient-to-r from-transparent via-light-champagne to-transparent" />

          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-3">
                <span className="h-px w-8 bg-classic-gold/60" />

                <span className="text-[9px] font-semibold uppercase tracking-[0.3em] text-antique-gold">
                  Collection
                </span>

                <span className="text-[8px] text-classic-gold">✦</span>
              </div>

              <p className="max-w-[460px] text-[13px] leading-7 text-slate-gray sm:text-[14px]">
                Discover pieces created to become part of your story.
              </p>
            </div>

            <div className="inline-flex w-fit items-center gap-3 rounded-full border border-light-champagne bg-soft-white/75 px-4 py-2.5 shadow-[0_6px_18px_rgba(7,19,31,0.035)] backdrop-blur-sm">
              <span className="font-serif text-[1.35rem] italic leading-none text-midnight-navy">
                {filteredProducts.length}
              </span>

              <span className="text-[8px] font-semibold uppercase tracking-[0.24em] text-steel-gray">
                Pieces
              </span>
            </div>
          </div>

          <div className="mt-8">
            <ShopFilters
              search={search}
              setSearch={setSearch}
              category={category}
              setCategory={setCategory}
              categories={categories}
            />
          </div>
        </section>

        {error && (
          <div className="mt-10 overflow-hidden rounded-[18px] border border-antique-gold/25 bg-soft-white/80 px-5 py-4 shadow-[0_8px_24px_rgba(7,19,31,0.04)] backdrop-blur-sm sm:px-6">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 shrink-0 rounded-full bg-antique-gold" />

              <p className="text-[12px] leading-6 text-midnight-navy/75 sm:text-[13px]">
                {error}
              </p>
            </div>
          </div>
        )}

        {isLoading ? (
          <section className="mt-14 sm:mt-16">
            <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div
                  key={item}
                  className="overflow-hidden rounded-[26px] border border-light-champagne/80 bg-soft-white shadow-[0_10px_35px_rgba(7,19,31,0.04)]"
                >
                  <div className="aspect-[3/4] animate-pulse bg-soft-cream" />

                  <div className="px-5 pb-6 pt-6 sm:px-6">
                    <div className="h-px w-10 bg-classic-gold/40" />

                    <div className="mt-5 h-6 w-2/3 animate-pulse rounded-full bg-light-champagne" />

                    <div className="mt-4 h-3 w-4/5 animate-pulse rounded-full bg-soft-cream" />

                    <div className="mt-3 h-3 w-3/5 animate-pulse rounded-full bg-soft-cream" />

                    <div className="mt-6 h-px w-full bg-light-champagne" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : filteredProducts.length === 0 ? (
          <section className="py-24 text-center sm:py-28">
            <div className="relative mx-auto max-w-[520px] overflow-hidden rounded-[28px] border border-light-champagne/85 bg-soft-white/75 px-7 py-14 shadow-[0_16px_45px_rgba(7,19,31,0.045)] backdrop-blur-sm sm:px-10 sm:py-16">
              <div className="pointer-events-none absolute left-1/2 top-[-120px] h-[250px] w-[400px] -translate-x-1/2 rounded-full bg-soft-cream blur-[80px]" />

              <div className="relative">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-light-champagne bg-warm-ivory shadow-[0_8px_24px_rgba(7,19,31,0.04)]">
                  <span className="font-serif text-[2rem] font-light italic text-classic-gold">
                    ∅
                  </span>
                </div>

                <p className="mt-6 text-[9px] font-semibold uppercase tracking-[0.3em] text-antique-gold">
                  No pieces found
                </p>

                <h3 className="mt-3 font-serif text-[2rem] font-normal leading-tight tracking-[-0.025em] text-midnight-navy sm:text-[2.3rem]">
                  Nothing matches
                  <span className="ml-2 italic text-navy-soft">
                    your search.
                  </span>
                </h3>

                <p className="mx-auto mt-4 max-w-[360px] text-[12px] leading-7 text-slate-gray sm:text-[13px]">
                  Try another search or explore another collection.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setCategory("all");
                  }}
                  className="mt-8 inline-flex min-h-[48px] items-center justify-center rounded-[12px] border border-midnight-navy bg-midnight-navy px-7 text-[9px] font-semibold uppercase tracking-[0.18em] text-soft-white shadow-[0_10px_25px_rgba(18,38,58,0.14)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-rich-navy hover:shadow-[0_14px_30px_rgba(18,38,58,0.20)] focus:outline-none focus-visible:ring-2 focus-visible:ring-classic-gold/40"
                >
                  View All Pieces
                </button>
              </div>
            </div>
          </section>
        ) : (
          <section className="mt-14 sm:mt-16">
            <ProductGrid products={filteredProducts} />
          </section>
        )}
      </main>

      <div className="relative border-t border-light-champagne/80 bg-soft-white/55 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-6 py-7 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-classic-gold/60" />

            <span className="text-[8px] font-semibold uppercase tracking-[0.3em] text-steel-gray">
              Smart Jewelry
            </span>
          </div>

          <span className="font-serif text-[14px] italic text-slate-gray">
            Designed to tell your story.
          </span>
        </div>
      </div>
    </div>
  );
};

export default ShopPage;
