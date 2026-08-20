import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCategories } from "../services/categoryService";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const getImageUrl = (image) => {
  if (!image) return "";

  if (
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("blob:")
  ) {
    return image;
  }

  if (image.startsWith("/")) {
    return `${BACKEND_URL}${image}`;
  }

  return `${BACKEND_URL}/${image}`;
};

const CategorySection = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);

      const response = await getCategories();

      console.log("CATEGORIES RESPONSE:", response);

      const categoryList = response?.data?.categories || [];

      console.log("CATEGORIES:", categoryList);

      setCategories(categoryList);
    } catch (error) {
      console.error("Failed to load categories:", error);

      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative overflow-hidden border-t border-light-champagne/70 bg-soft-white py-16 sm:py-20 lg:py-24">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[360px] w-[760px] -translate-x-1/2 rounded-full bg-soft-cream/55 blur-[100px]" />

      <div className="pointer-events-none absolute -left-32 bottom-0 h-[300px] w-[300px] rounded-full bg-champagne-gold/5 blur-[90px]" />

      <div className="pointer-events-none absolute -right-32 top-1/3 h-[320px] w-[320px] rounded-full bg-light-champagne/60 blur-[100px]" />

      <div className="relative mx-auto max-w-[1360px] px-6 sm:px-8 lg:px-10 xl:px-12">
        <div className="mb-11 text-center sm:mb-14">
          <div className="mb-4 flex items-center justify-center gap-3">
            <span className="text-[10px] text-classic-gold">✦</span>

            <span className="text-[10px] font-semibold uppercase tracking-[0.34em] text-midnight-navy sm:text-[11px]">
              Shop Our Collection
            </span>

            <span className="text-[10px] text-classic-gold">✦</span>
          </div>

          <h2 className="mx-auto max-w-[850px] font-serif text-[2.6rem] font-normal leading-[1.04] tracking-[-0.035em] text-midnight-navy sm:text-[3.3rem] lg:text-[4rem]">
            Designed to connect.
            <span className="ml-2 italic text-navy-soft">Made to last.</span>
          </h2>

          <p className="mx-auto mt-5 max-w-[590px] text-[13px] leading-7 text-slate-gray sm:text-[14px]">
            Explore our carefully selected jewelry collections, created to
            become part of your story.
          </p>

          <div className="mt-7 flex justify-center">
            <Link
              to="/shop"
              className="group inline-flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-midnight-navy transition-colors duration-300 hover:text-classic-gold"
            >
              View All Collections
              <span className="flex h-7 w-7 items-center justify-center rounded-full border border-midnight-navy/15 transition-all duration-300 group-hover:border-classic-gold/50 group-hover:bg-warm-ivory">
                <span className="transition-transform duration-300 group-hover:translate-x-0.5">
                  →
                </span>
              </span>
            </Link>
          </div>
        </div>

        {loading && (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="overflow-hidden rounded-[22px] border border-light-champagne/80 bg-warm-ivory"
              >
                <div className="aspect-[1.45/1] animate-pulse bg-soft-cream" />

                <div className="space-y-3 px-6 py-5">
                  <div className="h-3 w-20 animate-pulse rounded-full bg-light-champagne" />

                  <div className="h-6 w-36 animate-pulse rounded-full bg-light-champagne/80" />

                  <div className="h-3 w-24 animate-pulse rounded-full bg-soft-cream" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && categories.length === 0 && (
          <div className="mx-auto max-w-2xl rounded-[24px] border border-light-champagne/80 bg-warm-ivory/70 px-8 py-14 text-center shadow-[0_12px_35px_rgba(7,19,31,0.04)]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-classic-gold/20 bg-soft-white text-lg text-classic-gold">
              ✦
            </div>

            <h3 className="mt-5 font-serif text-2xl font-normal text-midnight-navy">
              No collections yet
            </h3>

            <p className="mt-2 text-[13px] leading-6 text-slate-gray">
              Our jewelry collections will appear here soon.
            </p>
          </div>
        )}

        {!loading && categories.length > 0 && (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category, index) => {
              const imageUrl = getImageUrl(category.image);

              console.log("Category:", category.name);

              console.log("Original image:", category.image);

              console.log("Generated image URL:", imageUrl);

              return (
                <Link
                  key={category._id}
                  to={`/shop?category=${category.slug || category._id}`}
                  className="group relative isolate overflow-hidden rounded-[22px] border border-light-champagne/80 bg-warm-ivory shadow-[0_8px_28px_rgba(7,19,31,0.045)] transition-all duration-500 hover:-translate-y-1.5 hover:border-champagne-gold/55 hover:shadow-[0_22px_50px_rgba(7,19,31,0.10)]"
                >
                  <div className="relative aspect-[1.42/1] overflow-hidden bg-soft-cream">
                    {category.image ? (
                      <img
                        src={imageUrl}
                        alt={category.name}
                        className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.045]"
                        onError={(e) => {
                          console.error(
                            "CATEGORY IMAGE FAILED:",
                            category.name,
                          );

                          console.error("Original image:", category.image);

                          console.error("Generated image URL:", imageUrl);

                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-soft-cream">
                        <span className="text-4xl text-classic-gold">✦</span>
                      </div>
                    )}

                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-warm-ivory/95 via-warm-ivory/45 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-70" />

                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-luxury-black/20 to-transparent" />

                    <div className="absolute left-5 top-5 flex h-8 min-w-8 items-center justify-center rounded-full border border-soft-white/75 bg-soft-white/75 px-2.5 text-[9px] font-semibold tracking-[0.08em] text-midnight-navy shadow-sm backdrop-blur-md sm:left-6 sm:top-6">
                      {String(index + 1).padStart(2, "0")}
                    </div>

                    <div className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full border border-soft-white/80 bg-soft-white/80 text-[10px] text-classic-gold shadow-sm backdrop-blur-md transition-transform duration-500 group-hover:rotate-12 sm:right-6 sm:top-6">
                      ✦
                    </div>

                    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-5 p-5 sm:p-6">
                      <div className="max-w-[76%]">
                        <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.22em] text-midnight-navy/65">
                          Collection
                        </p>

                        <h3 className="font-serif text-[1.7rem] font-normal leading-tight tracking-[-0.025em] text-midnight-navy sm:text-[1.9rem]">
                          {category.name}
                        </h3>

                        {category.description && (
                          <p className="mt-2 line-clamp-2 max-w-[270px] text-[11px] leading-[1.6] text-midnight-navy/65">
                            {category.description}
                          </p>
                        )}
                      </div>

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-midnight-navy/15 bg-soft-white/85 text-[15px] text-midnight-navy shadow-sm backdrop-blur-md transition-all duration-300 group-hover:border-midnight-navy group-hover:bg-midnight-navy group-hover:text-soft-white">
                        <span className="transition-transform duration-300 group-hover:translate-x-0.5">
                          →
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default CategorySection;
