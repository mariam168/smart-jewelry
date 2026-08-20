import { Link } from "react-router-dom";
import { FaHeart, FaArrowRight, FaPlus } from "react-icons/fa6";

const ProductCard = ({ product, index = 0 }) => {
  const isOutOfStock = product.stock <= 0;

  const imageUrl = product.image
    ? `http://localhost:5000${product.image}`
    : "/placeholder.png";

  const number = String(index + 1).padStart(2, "0");

  const badge = product.newArrival
    ? "New"
    : product.bestSeller
      ? "Bestseller"
      : product.featured
        ? "Featured"
        : null;

  return (
    <article className="group relative">
      <div className="relative overflow-hidden rounded-[26px] border border-light-champagne/80 bg-soft-white shadow-[0_10px_35px_rgba(7,19,31,0.045)] transition-all duration-500 group-hover:-translate-y-1.5 group-hover:border-champagne-gold/60 group-hover:shadow-[0_24px_55px_rgba(7,19,31,0.11)]">
        <div className="relative">
          <Link
            to={`/shop/products/${product._id}`}
            className="relative block overflow-hidden bg-soft-cream"
          >
            <div className="aspect-[3/4] overflow-hidden">
              <img
                src={imageUrl}
                alt={product.name}
                className="h-full w-full object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.055]"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.png";
                }}
              />
            </div>

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-luxury-black/75 via-luxury-black/5 to-transparent opacity-35 transition-opacity duration-700 group-hover:opacity-75" />

            <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-luxury-black/20 to-transparent" />

            <div className="absolute left-5 top-5 sm:left-6 sm:top-6">
              <span className="font-serif text-[2.6rem] font-light italic leading-none text-soft-white/80 drop-shadow-sm transition-all duration-500 group-hover:text-soft-white sm:text-[3rem]">
                {number}
              </span>
            </div>

            <div className="absolute left-5 top-[5.1rem] sm:left-6 sm:top-[5.5rem]">
              <div className="flex items-center gap-2">
                <span className="h-px w-5 bg-champagne-gold" />

                <span className="text-[8px] font-semibold uppercase tracking-[0.28em] text-soft-white/80">
                  {product.category?.name || "Jewelry"}
                </span>
              </div>
            </div>

            {badge && (
              <div className="absolute right-5 top-5 sm:right-6 sm:top-6">
                <span className="inline-flex min-h-[30px] items-center rounded-full border border-soft-white/40 bg-soft-white/15 px-3.5 text-[8px] font-semibold uppercase tracking-[0.18em] text-soft-white shadow-sm backdrop-blur-md">
                  {badge}
                </span>
              </div>
            )}

            <div className="absolute bottom-6 right-6 translate-y-3 opacity-0 transition-all duration-700 group-hover:translate-y-0 group-hover:opacity-100">
              <div className="text-right">
                <span className="block text-[7px] font-semibold uppercase tracking-[0.25em] text-soft-white/60">
                  Price
                </span>

                <span className="mt-1 block font-serif text-[1.45rem] font-normal text-soft-white">
                  ${product.price}
                </span>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 translate-y-full border-t border-soft-white/15 bg-luxury-black/80 px-5 py-4 backdrop-blur-xl transition-transform duration-700 group-hover:translate-y-0 sm:px-6 sm:py-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[7px] font-semibold uppercase tracking-[0.25em] text-champagne-gold">
                    Discover
                  </p>

                  <p className="mt-1 text-[11px] text-soft-white/75">
                    View this piece
                  </p>
                </div>

                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-soft-white/25 bg-soft-white/5 text-soft-white transition-all duration-300 group-hover:border-champagne-gold/50 group-hover:bg-champagne-gold group-hover:text-luxury-black">
                  <FaArrowRight className="text-[10px]" />
                </div>
              </div>
            </div>
          </Link>

          <button
            type="button"
            aria-label="Add to wishlist"
            onClick={(e) => e.preventDefault()}
            className="absolute right-5 top-[4.6rem] z-10 flex h-10 w-10 items-center justify-center rounded-full border border-soft-white/70 bg-soft-white/90 text-midnight-navy shadow-[0_8px_24px_rgba(7,19,31,0.12)] backdrop-blur-md transition-all duration-500 hover:scale-110 hover:border-champagne-gold hover:bg-midnight-navy hover:text-champagne-gold sm:right-6"
          >
            <FaHeart className="text-[11px]" />
          </button>

          {isOutOfStock && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-luxury-black/45 backdrop-blur-[1px]">
              <div className="rounded-full border border-soft-white/70 bg-soft-white/95 px-7 py-3 shadow-lg backdrop-blur-md">
                <span className="text-[8px] font-semibold uppercase tracking-[0.25em] text-midnight-navy">
                  Sold Out
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="relative bg-soft-white px-5 pb-6 pt-6 sm:px-6 sm:pb-7">
          <div className="mb-5 flex items-center gap-3">
            <span className="h-px w-8 bg-classic-gold/70 transition-all duration-700 group-hover:w-14 group-hover:bg-classic-gold" />

            <span className="text-[7px] font-semibold uppercase tracking-[0.28em] text-steel-gray">
              Collection
            </span>
          </div>

          <div className="flex items-start justify-between gap-5">
            <div className="min-w-0">
              <Link to={`/shop/products/${product._id}`}>
                <h3 className="max-w-[260px] font-serif text-[1.65rem] font-normal leading-[1.08] tracking-[-0.025em] text-midnight-navy transition-colors duration-300 group-hover:text-navy-soft sm:text-[1.75rem]">
                  {product.name}
                </h3>
              </Link>
            </div>

            <div className="shrink-0 text-right">
              <span className="font-serif text-[1.2rem] font-normal text-midnight-navy">
                ${product.price}
              </span>

              {product.comparePrice > product.price && (
                <span className="mt-1 block text-[9px] text-steel-gray line-through">
                  ${product.comparePrice}
                </span>
              )}
            </div>
          </div>

          {(product.shortDescription || product.description) && (
            <p className="mt-4 line-clamp-2 max-w-[88%] text-[11px] leading-[1.8] text-slate-gray sm:text-[12px]">
              {product.shortDescription || product.description}
            </p>
          )}

          <div className="mt-5 flex items-center justify-between gap-3 border-t border-light-champagne/75 pt-4">
            <div className="flex items-center gap-2">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isOutOfStock
                    ? "bg-steel-gray"
                    : product.stock <= 5
                      ? "bg-antique-gold"
                      : "bg-classic-gold"
                }`}
              />

              <span className="text-[7px] font-semibold uppercase tracking-[0.18em] text-steel-gray">
                {isOutOfStock
                  ? "Unavailable"
                  : product.stock <= 5
                    ? `Only ${product.stock} left`
                    : "Available"}
              </span>
            </div>

            {product.isCustomizable && (
              <span className="rounded-full border border-champagne-gold/30 bg-warm-ivory px-2.5 py-1 text-[7px] font-semibold uppercase tracking-[0.17em] text-antique-gold">
                Personalized
              </span>
            )}
          </div>

          <div className="mt-5 h-px w-full overflow-hidden bg-light-champagne">
            <div className="h-px w-0 bg-gradient-to-r from-classic-gold to-champagne-gold transition-all duration-700 group-hover:w-full" />
          </div>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
