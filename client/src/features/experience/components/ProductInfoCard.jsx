import getMediaUrl from "../utils/mediaUrl";

const ProductInfoCard = ({
  experience,
}) => {
  if (!experience) {
    return null;
  }

  const product =
    experience.product;

  const smartUnit =
    experience.smartUnit;

  const image =
    getMediaUrl(
      product?.primaryImage ||
        product?.image,
    ) ||
    "/placeholder.png";

  const isActive =
    experience.status?.toLowerCase() ===
    "active";

  return (
    <section className="relative overflow-hidden rounded-[28px] border border-light-champagne/90 bg-soft-white/90 shadow-[0_20px_60px_rgba(7,19,31,0.055)]">
      <div className="relative flex flex-col gap-5 border-b border-light-champagne/80 bg-warm-ivory/50 px-6 py-7 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10">
        <div>
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-classic-gold/70" />

            <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-antique-gold">
              Smart Jewelry
            </span>
          </div>

          <h2 className="mt-4 font-serif text-[2rem] text-rich-navy">
            Your Jewelry Experience
          </h2>

          <p className="mt-3 text-[13px] text-slate-gray">
            Product details connected to your personalized jewelry experience.
          </p>
        </div>

        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-light-champagne bg-soft-white px-4 py-2.5">
          <span
            className={`h-2 w-2 rounded-full ${
              isActive
                ? "bg-classic-gold"
                : "bg-steel-gray"
            }`}
          />

          <span className="text-[11px] font-semibold">
            {experience.status ||
              "Unknown"}
          </span>
        </div>
      </div>

      <div className="px-6 py-7 sm:px-8 lg:px-10 lg:py-10">
        <div className="grid gap-10 lg:grid-cols-[380px_minmax(0,1fr)]">
          <div className="overflow-hidden rounded-[24px] border border-light-champagne bg-soft-cream">
            <div className="flex aspect-square items-center justify-center p-8">
              <img
                src={image}
                alt={
                  product?.name ||
                  "Jewelry Product"
                }
                className="h-full w-full object-contain"
                onError={(
                  event,
                ) => {
                  event.currentTarget.src =
                    "/placeholder.png";
                }}
              />
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-antique-gold">
              Featured Piece
            </span>

            <h3 className="mt-3 font-serif text-[2.7rem] text-rich-navy">
              {product?.name ||
                "Unnamed Product"}
            </h3>

            {product?.description && (
              <p className="mt-5 text-[13px] leading-7 text-slate-gray">
                {
                  product.description
                }
              </p>
            )}

            <div className="mt-8 flex items-end gap-3">
              <span className="text-[10px] uppercase text-steel-gray">
                Price
              </span>

              <span className="font-serif text-[2rem] text-classic-gold">
                EGP{" "}
                {product?.price ??
                  "-"}
              </span>
            </div>

            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              <div className="rounded-[18px] border border-light-champagne bg-warm-ivory/45 p-5">
                <p className="text-[10px] uppercase text-steel-gray">
                  Smart Unit
                </p>

                <p className="mt-2.5 text-[13px] font-semibold text-rich-navy">
                  {smartUnit?.name ||
                    "-"}
                </p>
              </div>

              <div className="rounded-[18px] border border-light-champagne bg-warm-ivory/45 p-5">
                <p className="text-[10px] uppercase text-steel-gray">
                  Status
                </p>

                <p className="mt-2.5 text-[13px] font-semibold capitalize text-rich-navy">
                  {experience.status ||
                    "Unknown"}
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-[18px] border border-light-champagne bg-warm-ivory/55 px-5 py-4">
              <span className="text-[10px] uppercase text-steel-gray">
                Serial Number
              </span>

              <p className="mt-2 break-all font-mono text-[11px] text-rich-navy">
                {experience.serialNumber ||
                  "-"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductInfoCard;