
import { useTranslation } from "react-i18next";

const getLocalizedText = (value, language = "en") => {
  if (
    value &&
    typeof value === "object" &&
    !Array.isArray(value)
  ) {
    return value[language] || value.en || value.ar || "";
  }

  return value || "";
};

const ShopFilters = ({
  search,
  setSearch,
  category,
  setCategory,
  categories = [],
}) => {
  const { t, i18n } = useTranslation();

  const activeLanguage =
    i18n.language === "ar" ? "ar" : "en";

  const isRtl = activeLanguage === "ar";

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className="relative overflow-hidden rounded-[26px] border border-light-champagne/90 bg-soft-white/85 p-5 shadow-[0_12px_35px_rgba(7,19,31,0.045)] backdrop-blur-sm sm:p-6 lg:p-7"
    >
      <div
        className={`pointer-events-none absolute -top-20 h-48 w-48 rounded-full bg-champagne-gold/10 blur-[70px] ${
          isRtl ? "-left-20" : "-right-20"
        }`}
      />

      <div
        className={`pointer-events-none absolute -bottom-24 h-48 w-48 rounded-full bg-soft-cream/80 blur-[70px] ${
          isRtl ? "-right-20" : "-left-20"
        }`}
      />

      <div className="relative">
        <div className="mb-7 sm:mb-8">
          <div
            className={`flex items-center gap-3 ${
              isRtl ? "justify-start" : "justify-start"
            }`}
          >
            <span className="h-px w-8 bg-classic-gold/50" />

            <p className="text-[9px] font-semibold uppercase tracking-[0.3em] text-midnight-navy">
              {t("shopFilters.refine")}
            </p>

            <span className="text-[8px] text-classic-gold">
              ✦
            </span>
          </div>

          <h3
            className={`mt-4 font-serif text-[1.65rem] font-normal leading-[1.25] tracking-[-0.025em] text-midnight-navy sm:text-[1.8rem] ${
              isRtl ? "text-right" : "text-left"
            }`}
          >
            <span className="inline">
              {t("shopFilters.findPerfect")}
            </span>

            <span
              className={`inline-block ${
                isRtl ? "mr-2" : "ml-2"
              } font-serif not-italic font-normal text-navy-soft`}
            >
              {t("shopFilters.piece")}
            </span>
          </h3>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label
              className={`mb-2.5 block text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-gray ${
                isRtl ? "text-right" : "text-left"
              }`}
            >
              {t("shopFilters.searchJewelry")}
            </label>

            <div className="group relative">
              <div
                className={`pointer-events-none absolute top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-warm-ivory text-slate-gray transition-all duration-300 group-focus-within:bg-midnight-navy group-focus-within:text-champagne-gold ${
                  isRtl ? "right-4" : "left-4"
                }`}
              >
                <svg
                  className="h-3.5 w-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <circle
                    cx="11"
                    cy="11"
                    r="7"
                  />

                  <path d="m20 20-4-4" />
                </svg>
              </div>

              <input
                type="text"
                dir={isRtl ? "rtl" : "ltr"}
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder={t(
                  "shopFilters.searchPlaceholder",
                )}
                className={`h-[54px] w-full rounded-[15px] border border-light-champagne bg-warm-ivory/70 text-[13px] text-midnight-navy outline-none transition-all duration-300 placeholder:text-steel-gray/80 hover:border-champagne-gold/60 hover:bg-soft-white focus:border-classic-gold focus:bg-soft-white focus:shadow-[0_0_0_4px_rgba(201,162,77,0.08)] ${
                  isRtl
                    ? "pl-5 pr-14 text-right"
                    : "pl-14 pr-5 text-left"
                }`}
              />
            </div>
          </div>

          <div>
            <label
              className={`mb-2.5 block text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-gray ${
                isRtl ? "text-right" : "text-left"
              }`}
            >
              {t("shopFilters.category")}
            </label>

            <div className="group relative">
              <div
                className={`pointer-events-none absolute top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-warm-ivory text-classic-gold transition-all duration-300 group-focus-within:bg-midnight-navy group-focus-within:text-champagne-gold ${
                  isRtl ? "right-4" : "left-4"
                }`}
              >
                <span className="text-[9px]">
                  ✦
                </span>
              </div>

              <select
                dir={isRtl ? "rtl" : "ltr"}
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value)
                }
                className={`h-[54px] w-full appearance-none rounded-[15px] border border-light-champagne bg-warm-ivory/70 text-[13px] text-midnight-navy outline-none transition-all duration-300 hover:border-champagne-gold/60 hover:bg-soft-white focus:border-classic-gold focus:bg-soft-white focus:shadow-[0_0_0_4px_rgba(201,162,77,0.08)] ${
                  isRtl
                    ? "pl-12 pr-14 text-right"
                    : "pl-14 pr-12 text-left"
                }`}
              >
                {categories.map((item) => {
                  const value =
                    typeof item === "string"
                      ? item
                      : item.slug || item._id;

                  const label =
                    typeof item === "string"
                      ? item === "all"
                        ? t(
                            "shopFilters.allCategories",
                          )
                        : item
                      : getLocalizedText(
                          item.name,
                          activeLanguage,
                        );

                  return (
                    <option
                      key={value}
                      value={value}
                    >
                      {label}
                    </option>
                  );
                })}
              </select>

              <span
                className={`pointer-events-none absolute top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-slate-gray transition-colors duration-300 group-focus-within:text-classic-gold ${
                  isRtl ? "left-4" : "right-4"
                }`}
              >
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

