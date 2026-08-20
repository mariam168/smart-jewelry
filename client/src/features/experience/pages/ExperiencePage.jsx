import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getPublicExperience } from "../services/experienceApi";
import MediaGallery from "../components/MediaGallery";

const BACKEND_URL = "http://localhost:5000";

const getMediaUrl = (url) => {
  if (!url) return "";

  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("blob:")
  ) {
    return url;
  }

  if (url.startsWith("/")) {
    return `${BACKEND_URL}${url}`;
  }

  return `${BACKEND_URL}/${url}`;
};

const ExperiencePage = () => {
  const { serialNumber, slug } = useParams();

  const [loading, setLoading] = useState(true);
  const [experience, setExperience] = useState(null);
  const [personal, setPersonal] = useState(null);
  const [media, setMedia] = useState([]);

  useEffect(() => {
    if (!serialNumber || !slug) {
      setExperience(null);
      setLoading(false);
      return;
    }

    loadExperience();
  }, [serialNumber, slug]);

  const loadExperience = async () => {
    try {
      setLoading(true);

      console.log("LOADING PUBLIC EXPERIENCE:", {
        serialNumber,
        slug,
      });

      const data = await getPublicExperience(serialNumber, slug);

      console.log("PUBLIC EXPERIENCE RESPONSE:", data);

      setExperience(data?.experience || null);
      setPersonal(data?.personal || null);
      setMedia(data?.media || []);
    } catch (error) {
      console.error("Failed to load public experience:", error);

      console.error("PUBLIC EXPERIENCE ERROR RESPONSE:", error?.response?.data);

      setExperience(null);
      setPersonal(null);
      setMedia([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-warm-ivory px-5">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-soft-cream blur-[120px]" />

        <div className="pointer-events-none absolute -left-36 top-20 h-72 w-72 rounded-full border border-champagne-gold/[0.08]" />

        <div className="pointer-events-none absolute -right-32 bottom-16 h-64 w-64 rounded-full border border-premium-silver/50" />

        <div className="relative text-center">
          <div className="relative mx-auto h-20 w-20">
            <div className="absolute inset-0 rounded-full border border-champagne-gold/35" />

            <div className="absolute inset-2 animate-spin rounded-full border-2 border-transparent border-t-classic-gold" />

            <div className="absolute inset-5 rounded-full border border-light-champagne" />

            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[16px] text-classic-gold">✦</span>
            </div>
          </div>

          <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-gray">
            Loading Experience
          </p>
        </div>
      </div>
    );
  }

  if (!experience) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-warm-ivory px-5">
        <div className="pointer-events-none absolute -left-40 top-14 h-[460px] w-[460px] rounded-full bg-light-champagne/70 blur-[120px]" />

        <div className="pointer-events-none absolute -right-40 bottom-0 h-[420px] w-[420px] rounded-full bg-champagne-gold/[0.06] blur-[120px]" />

        <div className="relative w-full max-w-md overflow-hidden rounded-[30px] border border-light-champagne/90 bg-soft-white/90 p-10 text-center shadow-[0_25px_75px_rgba(13,34,53,0.09)] backdrop-blur-sm">
          <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full border border-champagne-gold/[0.08]" />

          <div className="pointer-events-none absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-soft-cream blur-[80px]" />

          <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-champagne-gold/20 bg-deep-navy shadow-[0_14px_35px_rgba(7,19,31,0.18)]">
            <span className="text-3xl text-champagne-gold">♡</span>
          </div>

          <h1 className="relative mt-7 font-serif text-[2.35rem] font-normal tracking-[-0.035em] text-deep-navy">
            Experience Not Found
          </h1>

          <p className="relative mt-4 text-[13px] leading-7 text-slate-gray">
            This experience may no longer be available.
          </p>
        </div>
      </div>
    );
  }

  const productImage =
    experience.product?.primaryImage ||
    experience.product?.image ||
    "/placeholder.png";

  return (
    <div className="relative min-h-screen overflow-hidden bg-warm-ivory text-deep-navy">
      <div className="pointer-events-none fixed -left-52 top-[35%] h-[500px] w-[500px] rounded-full bg-champagne-gold/[0.045] blur-[140px]" />

      <div className="pointer-events-none fixed -right-52 bottom-0 h-[520px] w-[520px] rounded-full bg-light-champagne/60 blur-[130px]" />

      <section className="relative overflow-hidden border-b border-light-champagne/70 bg-gradient-to-b from-soft-cream via-warm-ivory to-warm-ivory">
        <div className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-champagne-gold/15 blur-3xl" />

        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-classic-gold/[0.08] blur-3xl" />

        <div className="pointer-events-none absolute left-1/2 top-16 h-[420px] w-[420px] -translate-x-1/2 rounded-full border border-champagne-gold/[0.07] md:h-[560px] md:w-[560px]" />

        <div className="pointer-events-none absolute left-1/2 top-28 h-[310px] w-[310px] -translate-x-1/2 rounded-full border border-light-champagne/60 md:h-[420px] md:w-[420px]" />

        <div className="relative mx-auto max-w-5xl px-5 pb-20 pt-14 text-center sm:px-8 md:pb-24 md:pt-20">
          <div className="flex items-center justify-center gap-4">
            <span className="h-px w-10 bg-classic-gold/65 md:w-14" />

            <p className="text-[10px] font-semibold uppercase tracking-[0.38em] text-antique-gold">
              Smart Jewelry
            </p>

            <span className="h-px w-10 bg-classic-gold/65 md:w-14" />
          </div>

          <div className="mt-11 flex justify-center">
            {personal?.profileImage ? (
              <div className="relative">
                <div className="absolute -inset-2 rounded-full border border-champagne-gold/70" />

                <img
                  src={getMediaUrl(personal.profileImage)}
                  alt={personal?.ownerName || "Profile"}
                  className="relative h-28 w-28 rounded-full border-4 border-soft-white object-cover shadow-[0_18px_45px_rgba(13,34,53,0.16)] md:h-36 md:w-36"
                />
              </div>
            ) : (
              <div className="relative">
                <div className="absolute -inset-2 rounded-full border border-champagne-gold/70" />

                <div className="relative flex h-28 w-28 items-center justify-center rounded-full border-4 border-soft-white bg-deep-navy text-4xl text-champagne-gold shadow-[0_18px_45px_rgba(13,34,53,0.16)] md:h-36 md:w-36">
                  ♥
                </div>
              </div>
            )}
          </div>

          <h1 className="mx-auto mt-10 max-w-4xl font-serif text-[2.8rem] font-normal leading-[1.02] tracking-[-0.045em] text-deep-navy sm:text-[3.7rem] md:text-[4.8rem]">
            {personal?.title || "A Special Experience"}
          </h1>

          {personal?.receiverName && (
            <p className="mt-7 text-[14px] text-slate-gray md:text-[16px]">
              Made especially for{" "}
              <span className="font-semibold text-midnight-navy">
                {personal.receiverName}
              </span>
            </p>
          )}

          {personal?.ownerName && (
            <div className="mt-4 flex items-center justify-center gap-3 text-[13px] text-slate-gray">
              <span className="h-1 w-1 rounded-full bg-classic-gold" />

              <span>
                With love from{" "}
                <strong className="font-semibold text-midnight-navy">
                  {personal.ownerName}
                </strong>
              </span>

              <span className="h-1 w-1 rounded-full bg-classic-gold" />
            </div>
          )}
        </div>
      </section>

      <main className="relative mx-auto max-w-5xl space-y-8 px-5 pb-16 pt-10 sm:px-8 md:space-y-10 md:pb-24 md:pt-12">
        <section className="relative overflow-hidden rounded-[28px] border border-light-champagne/90 bg-soft-white/90 shadow-[0_18px_55px_rgba(13,34,53,0.055)] md:rounded-[34px]">
          <div className="pointer-events-none absolute left-0 top-0 h-32 w-32 rounded-br-full bg-soft-cream/80" />

          <div className="pointer-events-none absolute bottom-0 right-0 h-40 w-40 rounded-tl-full bg-light-champagne/60" />

          <div className="relative mx-auto max-w-3xl px-7 py-12 text-center md:px-14 md:py-16">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-champagne-gold/55 bg-soft-cream shadow-[0_6px_18px_rgba(7,19,31,0.035)]">
              <span className="font-serif text-3xl text-classic-gold">“</span>
            </div>

            <p className="mt-8 whitespace-pre-wrap font-serif text-[1.35rem] font-light leading-[1.75] text-slate-gray md:text-[1.55rem]">
              {personal?.message ||
                "A special message has been created just for you."}
            </p>

            {personal?.ownerName && (
              <div className="mt-10">
                <div className="mb-5 flex items-center justify-center gap-3">
                  <span className="h-px w-10 bg-champagne-gold" />

                  <span className="text-xs text-classic-gold">✦</span>

                  <span className="h-px w-10 bg-champagne-gold" />
                </div>

                <p className="text-[10px] uppercase tracking-[0.26em] text-slate-gray">
                  With Love
                </p>

                <p className="mt-2 font-serif text-[1.25rem] text-midnight-navy">
                  {personal.ownerName}
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="overflow-hidden rounded-[28px] border border-light-champagne/90 bg-soft-white shadow-[0_18px_55px_rgba(13,34,53,0.055)] md:rounded-[34px]">
          <div className="grid md:grid-cols-2">
            <div className="relative min-h-[350px] overflow-hidden bg-silver-mist md:min-h-[500px]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,var(--color-soft-white),var(--color-soft-cream)_50%,var(--color-light-champagne)_100%)]" />

              <div className="pointer-events-none absolute left-1/2 top-1/2 h-[270px] w-[270px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-champagne-gold/15 md:h-[360px] md:w-[360px]" />

              <div className="pointer-events-none absolute left-1/2 top-1/2 h-[210px] w-[210px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-soft-white/60 blur-2xl md:h-[290px] md:w-[290px]" />

              <div className="absolute left-6 top-6 z-10 md:left-8 md:top-8">
                <span className="inline-flex items-center gap-2 rounded-full border border-soft-white/70 bg-soft-white/85 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-antique-gold shadow-[0_5px_15px_rgba(7,19,31,0.04)] backdrop-blur-md">
                  <span className="h-1.5 w-1.5 rounded-full bg-classic-gold" />
                  Your Jewelry
                </span>
              </div>

              <img
                src={getMediaUrl(productImage)}
                alt={experience.product?.name || "Smart Jewelry"}
                className="relative z-[1] h-full min-h-[350px] w-full object-contain p-8 drop-shadow-[0_28px_30px_rgba(13,34,53,0.14)] transition-transform duration-700 hover:scale-[1.025] md:min-h-[500px] md:p-12"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.png";
                }}
              />
            </div>

            <div className="relative flex flex-col justify-center p-8 md:p-12">
              <div className="pointer-events-none absolute right-0 top-0 h-36 w-36 rounded-bl-full bg-warm-ivory/75" />

              <div className="relative">
                <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-antique-gold">
                  Your Jewelry
                </p>

                <h2 className="mt-4 font-serif text-[2.25rem] font-normal leading-tight tracking-[-0.035em] text-deep-navy md:text-[2.8rem]">
                  {experience.product?.name || "Smart Jewelry"}
                </h2>

                <div className="mt-5 h-px w-12 bg-classic-gold" />

                <p className="mt-6 text-[14px] leading-8 text-slate-gray md:text-[15px]">
                  {experience.product?.description ||
                    "This jewelry piece has a special digital experience connected to it."}
                </p>

                <div className="mt-9 border-t border-light-champagne/90">
                  <div className="flex items-center justify-between gap-5 border-b border-light-champagne/90 py-5">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.18em] text-steel-gray">
                        Serial Number
                      </p>

                      <p className="mt-2 break-all font-mono text-[13px] font-semibold tracking-[0.03em] text-midnight-navy">
                        {experience.serialNumber || serialNumber || "-"}
                      </p>
                    </div>

                    <span className="text-champagne-gold">✦</span>
                  </div>

                  <div className="flex items-center justify-between gap-5 py-5">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.18em] text-steel-gray">
                        Experience
                      </p>

                      <p className="mt-2 text-[13px] font-semibold capitalize text-midnight-navy">
                        {experience.type || "personal"}
                      </p>
                    </div>

                    <span className="text-champagne-gold">♡</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {media.length > 0 && (
          <section className="relative overflow-hidden rounded-[28px] border border-light-champagne/90 bg-soft-white/90 p-7 shadow-[0_18px_55px_rgba(13,34,53,0.055)] md:rounded-[34px] md:p-10">
            <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full border border-champagne-gold/[0.08]" />

            <div className="relative mb-8 flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-champagne-gold/35 bg-soft-cream shadow-[0_5px_15px_rgba(7,19,31,0.035)]">
                <span className="text-classic-gold">✦</span>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-antique-gold">
                  Memories
                </p>

                <h2 className="mt-1 font-serif text-[1.8rem] font-normal tracking-[-0.03em] text-deep-navy">
                  Moments to Remember
                </h2>
              </div>
            </div>

            <MediaGallery media={media} />
          </section>
        )}

        <footer className="py-8 text-center">
          <div className="flex items-center justify-center gap-4">
            <span className="h-px w-16 bg-champagne-gold" />

            <span className="text-xl text-classic-gold">♡</span>

            <span className="h-px w-16 bg-champagne-gold" />
          </div>

          <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-gray">
            Smart Jewelry Experience
          </p>

          <p className="mt-2 text-[12px] text-steel-gray">
            A memory made special
          </p>
        </footer>
      </main>
    </div>
  );
};

export default ExperiencePage;
