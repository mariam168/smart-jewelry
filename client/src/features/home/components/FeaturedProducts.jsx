import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getHomeData } from "../services/homeApi";

const FeaturedProducts = () => {
  const { t, i18n } = useTranslation();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const isRtl = i18n.language === "ar";

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true);
        const response = await getHomeData();
        setProducts(response?.data?.featuredProducts || []);
      } catch (error) {
        console.error("Failed to load featured products:", error);
        setError(t("featuredProducts.error"));
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, [t]);

  return (
    <section className="bg-soft-white py-24 sm:py-32">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
        <div className={`mb-16 flex flex-col items-center text-center ${isRtl ? "lg:items-end lg:text-right" : "lg:items-start lg:text-left"}`}>
          <div className="flex items-center gap-3 mb-4">
            <span className="h-px w-8 bg-classic-gold/40" />
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-midnight-navy/60">
              {t("featuredProducts.eyebrow")}
            </p>
          </div>
          <h2 className="font-serif text-[2.6rem] font-normal leading-tight text-midnight-navy sm:text-[3.2rem] lg:text-[3.8rem]">
            {t("featuredProducts.title")}
          </h2>
        </div>

        {isLoading && (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="flex flex-col gap-4">
                <div className="aspect-[4/5] animate-pulse rounded-2xl bg-warm-ivory" />
                <div className="h-4 w-2/3 animate-pulse rounded bg-warm-ivory" />
                <div className="h-4 w-1/3 animate-pulse rounded bg-warm-ivory" />
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="flex min-h-[200px] items-center justify-center rounded-3xl bg-red-50/50 p-10 text-center text-sm font-medium text-red-600">
            {error}
          </div>
        )}

        {!isLoading && !error && products.length === 0 && (
          <div className="flex min-h-[300px] flex-col items-center justify-center rounded-[2rem] border border-dashed border-light-champagne bg-warm-ivory/20 text-center">
            <span className="text-2xl text-classic-gold/30 mb-4">✦</span>
            <p className="text-sm font-medium text-slate-gray">
              {t("featuredProducts.empty")}
            </p>
          </div>
        )}

        <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <Link
              key={product._id}
              to={`/products/${product.slug}`}
              className="group flex flex-col"
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-warm-ivory shadow-[0_10px_30px_rgba(0,0,0,0.03)] transition-all duration-700 group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] group-hover:-translate-y-2">
                <img
                  src={product.thumbnail || "/images/placeholder-product.jpg"}
                  alt={product.name}
                  className="h-full w-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-midnight-navy/0 transition-colors duration-500 group-hover:bg-midnight-navy/5" />
                
                <div className={`absolute bottom-4 ${isRtl ? 'left-4' : 'right-4'} translate-y-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100`}>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-midnight-navy shadow-xl">
                        <span className="text-lg">→</span>
                    </div>
                </div>
              </div>

              <div className={`mt-6 flex flex-col ${isRtl ? "text-right" : "text-left"}`}>
                <div className="flex items-center gap-2 mb-2">
                    <span className="h-px w-4 bg-classic-gold/40" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-classic-gold">
                        {t("featuredProducts.currency")}
                    </p>
                </div>
                
                <h3 className="font-serif text-xl font-normal text-midnight-navy transition-colors duration-300 group-hover:text-classic-gold">
                  {product.name}
                </h3>
                
                <p className="mt-2 line-clamp-1 text-[13px] leading-relaxed text-slate-gray">
                  {product.shortDescription}
                </p>
                
                <p className="mt-4 text-base font-black tracking-tight text-midnight-navy">
                  {product.price} <span className="text-[10px] font-bold">{t("featuredProducts.currency")}</span>
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;