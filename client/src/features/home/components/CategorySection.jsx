import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getCategories } from "../services/categoryService";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const getImageUrl = (image) => {
  if (!image) return "";
  if (image.startsWith("http://") || image.startsWith("https://") || image.startsWith("blob:")) {
    return image;
  }
  if (image.startsWith("/")) {
    return `${BACKEND_URL}${image}`;
  }
  return `${BACKEND_URL}/${image}`;
};

const getLocalizedText = (value, language = "en") => {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value[language] || value.en || value.ar || "";
  }
  return value || "";
};

const CategorySection = () => {
  const { t, i18n } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const isRtl = i18n.language === "ar";
  const activeLanguage = isRtl ? "ar" : "en";

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await getCategories();
      const categoryList = response?.data?.categories || [];
      setCategories(categoryList);
    } catch (error) {
      console.error("Failed to load categories:", error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative bg-soft-white py-16 lg:py-20">
      <div className="relative mx-auto max-w-[1300px] px-6 lg:px-10">
        
        <div className={`mb-12 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between ${isRtl ? 'text-right' : 'text-left'}`}>
          <div className="max-w-[600px]">
            <div className={`mb-3 flex items-center gap-2 ${isRtl ? 'justify-end' : 'justify-start'}`}>
              <span className="h-px w-6 bg-classic-gold/40" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-classic-gold">
                {t("categorySection.shopCollection")}
              </span>
            </div>
            <h2 className="font-serif text-3xl leading-[1.2] text-midnight-navy sm:text-4xl lg:text-5xl">
              {t("categorySection.titleFirst")}{" "}
              <span className={`text-navy-soft ${isRtl ? "not-italic" : "italic"}`}>
                {t("categorySection.titleSecond")}
              </span>
            </h2>
          </div>
          <Link
            to="/shop"
            className="group inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-midnight-navy transition-all hover:text-classic-gold"
          >
            <span className="border-b border-midnight-navy/20 pb-1 group-hover:border-classic-gold">
              {t("categorySection.viewAll")}
            </span>
            <span className={`text-sm transition-transform duration-300 ${isRtl ? 'group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`}>
              {isRtl ? "←" : "→"}
            </span>
          </Link>
        </div>

        {loading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="aspect-[4/5] animate-pulse rounded-2xl bg-warm-ivory" />
            ))}
          </div>
        )}

        {!loading && categories.length === 0 && (
          <div className="rounded-3xl border border-light-champagne/40 bg-warm-ivory/30 py-20 text-center">
            <p className="text-sm font-medium text-slate-gray">{t("categorySection.emptyTitle")}</p>
          </div>
        )}

        {!loading && categories.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => {
              const imageUrl = getImageUrl(category.image);
              const categoryName = getLocalizedText(category.name, activeLanguage);
              const categoryDescription = getLocalizedText(category.description, activeLanguage);

              return (
                <Link
                  key={category._id}
                  to={`/shop?category=${category.slug || category._id}`}
                  className="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-warm-ivory"
                >
                  {category.image ? (
                    <img
                      src={imageUrl}
                      alt={categoryName}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      onError={(e) => { e.currentTarget.style.display = "none"; }}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-classic-gold/20">✦</div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-midnight-navy/80 via-transparent to-transparent opacity-60 transition-opacity group-hover:opacity-90" />

                  <div className={`absolute bottom-0 w-full p-6 text-white ${isRtl ? 'text-right' : 'text-left'}`}>
                    <span className="mb-2 block text-[9px] font-bold uppercase tracking-[0.2em] text-classic-gold">
                      {t("categorySection.collection")}
                    </span>
                    <h3 className="font-serif text-2xl tracking-wide sm:text-3xl">
                      {categoryName}
                    </h3>
                    
                    <div className="grid grid-rows-[0fr] transition-all duration-500 group-hover:grid-rows-[1fr]">
                      <div className="overflow-hidden">
                        {categoryDescription && (
                          <p className="mt-3 line-clamp-2 text-[11px] leading-relaxed text-white/70">
                            {categoryDescription}
                          </p>
                        )}
                        <div className={`mt-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-tighter ${isRtl ? 'flex-row-reverse' : ''}`}>
                          <span>{t("categorySection.viewAll")}</span>
                          <span className="text-lg">→</span>
                        </div>
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