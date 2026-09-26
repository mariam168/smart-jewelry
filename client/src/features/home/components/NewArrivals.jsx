
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";

import { getNewArrivalProducts } from "../services/homeApi";
import getMediaUrl from "../../../lib/imageUrl";

const NewArrivals = () => {
  const { t, i18n } = useTranslation();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const isArabic = i18n.language === "ar";

  useEffect(() => {
    const loadNewArrivals = async () => {
      try {
        setLoading(true);

        const response = await getNewArrivalProducts();

        console.log("NEW ARRIVALS RESPONSE:", response);

        const newArrivals =
          response?.data?.products || [];

        setProducts(newArrivals);
      } catch (error) {
        console.error(
          "Failed to load new arrival products:",
          error,
        );

        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadNewArrivals();
  }, []);

  if (!loading && products.length === 0) {
    return null;
  }

  return (
    <section className="bg-soft-white px-5 py-20 sm:px-8 lg:px-16">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-10 flex items-end justify-between gap-6">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-champagne-gold">
              {t("newArrivals.label")}
            </p>

            <h2 className="font-serif text-3xl font-medium text-midnight-navy sm:text-4xl lg:text-5xl">
              {t("newArrivals.title")}
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-7 text-midnight-navy/60 sm:text-base">
              {t("newArrivals.description")}
            </p>
          </div>

          <Link
            to="/shop"
            className="hidden items-center gap-3 border-b border-champagne-gold pb-2 text-sm font-medium text-midnight-navy transition-colors duration-300 hover:text-champagne-gold sm:flex"
          >
            {t("newArrivals.shopAll")}

            <FaArrowRight
              size={12}
              className={isArabic ? "rotate-180" : ""}
            />
          </Link>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
            {[1, 2, 3, 4].map((item) => (
              <div key={item}>
                <div className="aspect-[4/5] animate-pulse bg-midnight-navy/5" />

                <div className="mt-4 h-4 w-3/4 animate-pulse bg-midnight-navy/5" />

                <div className="mt-3 h-4 w-1/3 animate-pulse bg-midnight-navy/5" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Products */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
              {products.slice(0, 8).map((product) => {
                const productName =
                  product.name?.[i18n.language] ||
                  product.name?.en ||
                  product.name?.ar ||
                  "";

                const image =
                  product.image ||
                  product.primaryImage ||
                  product.images?.[0] ||
                  "";

                return (
                  <Link
                    key={product._id}
                    to={`/shop/products/${product._id}`}
                    className="group block"
                  >
                    {/* Image */}
                    <div className="relative aspect-[4/5] overflow-hidden bg-[#F3F0EB]">
                      <img
                        src={getMediaUrl(image)}
                        alt={productName}
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.onerror = null;
                          event.currentTarget.src =
                            "/placeholder.png";
                        }}
                        className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-105"
                      />

                      {/* New Badge */}
                      <div className="absolute left-3 top-3 bg-midnight-navy px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-soft-white">
                        {t("newArrivals.new")}
                      </div>

                      {/* Sold Out */}
                      {Number(product.stock || 0) <= 0 && (
                        <div className="absolute inset-0 flex items-center justify-center bg-midnight-navy/30">
                          <span className="bg-soft-white px-4 py-2 text-xs font-medium uppercase tracking-[0.15em] text-midnight-navy">
                            {t("newArrivals.soldOut")}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="pt-4">
                      <h3 className="line-clamp-1 text-sm font-medium text-midnight-navy transition-colors duration-300 group-hover:text-champagne-gold sm:text-base">
                        {productName}
                      </h3>

                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span className="text-sm font-medium text-midnight-navy">
                          {Number(product.price || 0).toLocaleString(
                            "en-EG",
                          )}{" "}
                          EGP
                        </span>

                        {Number(product.comparePrice || 0) >
                          Number(product.price || 0) && (
                          <span className="text-xs text-midnight-navy/40 line-through">
                            {Number(
                              product.comparePrice,
                            ).toLocaleString("en-EG")}{" "}
                            EGP
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Mobile Shop All */}
            <div className="mt-10 flex justify-center sm:hidden">
              <Link
                to="/shop"
                className="flex items-center gap-3 border-b border-champagne-gold pb-2 text-sm font-medium text-midnight-navy transition-colors duration-300 hover:text-champagne-gold"
              >
                {t("newArrivals.shopAll")}

                <FaArrowRight
                  size={12}
                  className={isArabic ? "rotate-180" : ""}
                />
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default NewArrivals;
