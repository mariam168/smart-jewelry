const API_BASE_URL = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.replace("/api", "") 
  : "http://localhost:5000";

const getImageUrl = (image) => {
  if (!image) {
    return "/placeholder.png";
  }

  if (
    image.startsWith("http://") ||
    image.startsWith("https://")
  ) {
    return image;
  }

  if (image.startsWith("/")) {
    return `${API_BASE_URL}${image}`;
  }

  return `${API_BASE_URL}/${image}`;
};

const ProductInfoCard = ({ experience }) => {
  if (!experience) {
    return null;
  }

  const product = experience.product;
  const smartUnit = experience.smartUnit;

  const image = getImageUrl(
    product?.primaryImage || product?.image
  );

  const isActive =
    experience.status?.toLowerCase() === "active";

  return (
    <section className="relative overflow-hidden rounded-[28px] border border-light-champagne/90 bg-soft-white/90 shadow-[0_20px_60px_rgba(7,19,31,0.055)]">
      <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full border border-champagne-gold/[0.08]" />

      <div className="pointer-events-none absolute -bottom-36 -left-32 h-80 w-80 rounded-full bg-soft-cream blur-[100px]" />

      <div className="relative flex flex-col gap-5 border-b border-light-champagne/80 bg-warm-ivory/50 px-6 py-7 sm:px-8 sm:py-8 lg:flex-row lg:items-center lg:justify-between lg:px-10">
        <div>
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-classic-gold/70" />

            <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-antique-gold">
              Smart Jewelry
            </span>
          </div>

          <h2 className="mt-4 font-serif text-[2rem] font-normal leading-tight tracking-[-0.035em] text-rich-navy sm:text-[2.4rem]">
            Your Jewelry Experience
          </h2>

          <p className="mt-3 max-w-2xl text-[13px] leading-7 text-slate-gray">
            Product details connected to your
            personalized jewelry experience.
          </p>
        </div>

        <div
          className={`
            inline-flex
            w-fit
            shrink-0
            items-center
            gap-2.5
            rounded-full
            border
            px-4
            py-2.5
            shadow-[0_5px_15px_rgba(7,19,31,0.03)]

            ${
              isActive
                ? "border-champagne-gold/30 bg-soft-cream text-antique-gold"
                : "border-light-champagne bg-soft-white text-steel-gray"
            }
          `}
        >
          <span
            className={`
              h-2
              w-2
              rounded-full

              ${
                isActive
                  ? "bg-classic-gold"
                  : "bg-steel-gray"
              }
            `}
          />

          <span className="text-[11px] font-semibold tracking-wide">
            {experience.status || "Unknown"}
          </span>
        </div>
      </div>

      <div className="relative px-6 py-7 sm:px-8 sm:py-9 lg:px-10 lg:py-10">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[380px_minmax(0,1fr)] lg:gap-12">
          <div>
            <div className="group relative overflow-hidden rounded-[24px] border border-light-champagne/70 bg-soft-cream shadow-[0_12px_35px_rgba(7,19,31,0.045)]">
              <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-light-champagne/75 blur-2xl" />

              <div className="pointer-events-none absolute -bottom-20 -left-20 h-52 w-52 rounded-full bg-silver-mist/85 blur-3xl" />

              <div className="pointer-events-none absolute inset-x-8 top-8 h-px bg-gradient-to-r from-transparent via-champagne-gold/35 to-transparent" />

              <div className="relative flex aspect-square items-center justify-center p-8 sm:p-10">
                <img
                  src={image}
                  alt={product?.name || "Jewelry Product"}
                  className="relative z-10 h-full w-full object-contain transition-transform duration-500 ease-out group-hover:scale-[1.035]"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.png";
                  }}
                />

                <div className="absolute bottom-5 left-5 z-20 rounded-full border border-light-champagne bg-soft-white/90 px-4 py-2 shadow-[0_6px_16px_rgba(7,19,31,0.05)] backdrop-blur">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-steel-gray">
                    Jewelry Piece
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex min-w-0 flex-col justify-center">
            <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-antique-gold">
              Featured Piece
            </span>

            <h3 className="mt-3 max-w-2xl font-serif text-[2.15rem] font-normal leading-[1.1] tracking-[-0.04em] text-rich-navy sm:text-[2.7rem]">
              {product?.name || "Unnamed Product"}
            </h3>

            {product?.description && (
              <p className="mt-5 max-w-2xl text-[13px] leading-7 text-slate-gray">
                {product.description}
              </p>
            )}

            <div className="mt-8 flex flex-wrap items-end gap-3">
              <span className="pb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-steel-gray">
                Price
              </span>

              <span className="font-serif text-[2rem] font-normal leading-none tracking-[-0.03em] text-classic-gold">
                ${product?.price ?? "-"}
              </span>
            </div>

            <div className="my-8 h-px w-full bg-light-champagne/90" />

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="rounded-[18px] border border-light-champagne/80 bg-warm-ivory/45 p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-steel-gray">
                  Smart Unit
                </p>

                <p className="mt-2.5 text-[13px] font-semibold text-rich-navy">
                  {smartUnit?.name || "-"}
                </p>
              </div>

              <div className="rounded-[18px] border border-light-champagne/80 bg-warm-ivory/45 p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-steel-gray">
                  Status
                </p>

                <div className="mt-2.5 flex items-center gap-2">
                  <span
                    className={`
                      h-1.5
                      w-1.5
                      rounded-full

                      ${
                        isActive
                          ? "bg-classic-gold"
                          : "bg-steel-gray"
                      }
                    `}
                  />

                  <span className="text-[13px] font-semibold capitalize text-rich-navy">
                    {experience.status || "Unknown"}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-[18px] border border-light-champagne/85 bg-warm-ivory/55 px-5 py-4">
              <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-steel-gray">
                  Serial Number
                </span>

                <span className="break-all font-mono text-[11px] font-medium tracking-[0.06em] text-rich-navy">
                  {experience.serialNumber || "-"}
                </span>
              </div>
            </div>

            <div className="mt-7 flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-champagne-gold/25 bg-soft-cream shadow-[0_5px_14px_rgba(7,19,31,0.03)]">
                <span className="h-1.5 w-1.5 rounded-full bg-classic-gold" />
              </div>

              <p className="text-[12px] leading-5 text-slate-gray">
                This jewelry piece is connected to
                your smart jewelry experience.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductInfoCard;