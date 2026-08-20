import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getPublicExperience } from "../services/experienceApi";
import MediaGallery from "../components/MediaGallery";

const BACKEND_URL = "http://localhost:5000";

const getMediaUrl = (url) => {
  if (!url) {
    return "";
  }

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

const ExperienceBySlugPage = () => {
  const { serialNumber, slug } = useParams();

  const [loading, setLoading] = useState(true);
  const [experience, setExperience] = useState(null);
  const [personal, setPersonal] = useState(null);
  const [media, setMedia] = useState([]);

  useEffect(() => {
    loadExperience();
  }, [serialNumber, slug]);

  const loadExperience = async () => {
    if (!serialNumber || !slug) {
      console.error("Missing serialNumber or slug:", {
        serialNumber,
        slug,
      });

      setExperience(null);
      setPersonal(null);
      setMedia([]);
      setLoading(false);

      return;
    }

    try {
      setLoading(true);

      console.log("Loading public experience:", {
        serialNumber,
        slug,
      });

      const response = await getPublicExperience(serialNumber, slug);

      console.log("PUBLIC EXPERIENCE RESPONSE:", response);

      const payload =
        response?.data?.experience ||
        response?.data?.data ||
        response?.experience ||
        response?.data ||
        response;

      console.log("PUBLIC EXPERIENCE PAYLOAD:", payload);

      if (!payload || !payload._id) {
        console.error("Invalid public experience payload:", payload);

        setExperience(null);
        setPersonal(null);
        setMedia([]);

        return;
      }

      setExperience(payload);

      setPersonal(payload.personal || payload.personalData || null);

      setMedia(
        Array.isArray(payload.media)
          ? payload.media
          : Array.isArray(payload.mediaFiles)
            ? payload.mediaFiles
            : [],
      );
    } catch (error) {
      console.error("Failed to load public experience:", error);

      console.error("STATUS:", error?.response?.status);

      console.error("RESPONSE:", error?.response?.data);

      setExperience(null);
      setPersonal(null);
      setMedia([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-luxury-black px-6">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-classic-gold/[0.045] blur-[130px]" />

          <div className="absolute left-[10%] top-[15%] h-40 w-40 rounded-full border border-classic-gold/[0.08]" />

          <div className="absolute bottom-[10%] right-[10%] h-56 w-56 rounded-full border border-polished-silver/[0.04]" />

          <div className="absolute left-1/2 top-1/2 h-[330px] w-[330px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-classic-gold/[0.04]" />
        </div>

        <div className="relative z-10 text-center">
          <div className="relative mx-auto h-24 w-24">
            <div className="absolute inset-0 rounded-full border border-classic-gold/20" />

            <div className="absolute inset-2 animate-spin rounded-full border border-transparent border-t-classic-gold" />

            <div className="absolute inset-5 rounded-full border border-polished-silver/10" />

            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl text-champagne-gold">✦</span>
            </div>
          </div>

          <p className="mt-8 text-[10px] font-semibold uppercase tracking-[0.42em] text-polished-silver/55">
            Preparing Your Experience
          </p>
        </div>
      </div>
    );
  }

  if (!experience) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-warm-ivory px-5">
        <div className="pointer-events-none absolute -left-40 top-16 h-[460px] w-[460px] rounded-full bg-light-champagne/70 blur-[120px]" />

        <div className="pointer-events-none absolute -right-40 bottom-0 h-[420px] w-[420px] rounded-full bg-champagne-gold/[0.06] blur-[120px]" />

        <div className="relative w-full max-w-lg overflow-hidden rounded-[32px] border border-light-champagne/90 bg-soft-white/90 p-10 text-center shadow-[0_30px_100px_rgba(13,34,53,0.10)] backdrop-blur-sm md:p-14">
          <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-classic-gold/[0.07] blur-3xl" />

          <div className="absolute -bottom-24 -left-24 h-56 w-56 rounded-full border border-champagne-gold/[0.08]" />

          <div className="relative z-10">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-champagne-gold/20 bg-deep-navy shadow-[0_15px_40px_rgba(7,19,31,0.18)]">
              <span className="text-3xl text-champagne-gold">♡</span>
            </div>

            <p className="mt-8 text-[10px] font-semibold uppercase tracking-[0.38em] text-antique-gold">
              Smart Jewelry
            </p>

            <h1 className="mt-4 font-serif text-[2.5rem] font-normal tracking-[-0.04em] text-rich-navy">
              Experience Not Found
            </h1>

            <p className="mx-auto mt-5 max-w-sm text-[13px] leading-7 text-slate-gray">
              This private experience does not exist or is no longer available.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const productImage =
    experience.product?.primaryImage ||
    experience.product?.image ||
    "/placeholder.png";

  return (
    <div className="min-h-screen overflow-hidden bg-warm-ivory text-rich-navy">
      <section className="relative overflow-hidden bg-luxury-black">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,var(--color-navy-soft),var(--color-luxury-black)_55%,var(--color-deep-navy)_100%)]" />

        <div className="absolute -left-48 -top-40 h-[600px] w-[600px] rounded-full bg-classic-gold/[0.04] blur-[110px]" />

        <div className="absolute -right-48 top-20 h-[550px] w-[550px] rounded-full bg-navy-soft/35 blur-[110px]" />

        <div className="absolute left-1/2 top-[120px] h-[520px] w-[520px] -translate-x-1/2 rounded-full border border-classic-gold/[0.055] md:h-[720px] md:w-[720px]" />

        <div className="absolute left-1/2 top-[180px] h-[400px] w-[400px] -translate-x-1/2 rounded-full border border-polished-silver/[0.03] md:h-[560px] md:w-[560px]" />

        <div className="absolute left-1/2 top-[240px] h-[280px] w-[280px] -translate-x-1/2 rounded-full border border-classic-gold/[0.03] md:h-[400px] md:w-[400px]" />

        <span className="absolute left-[8%] top-[28%] text-sm text-classic-gold/30">
          ✦
        </span>

        <span className="absolute right-[10%] top-[35%] text-lg text-classic-gold/20">
          ✦
        </span>

        <span className="absolute bottom-[18%] left-[15%] text-xs text-polished-silver/10">
          ✦
        </span>

        <span className="absolute bottom-[25%] right-[18%] text-xs text-classic-gold/15">
          ✦
        </span>

        <div className="relative mx-auto max-w-7xl px-5 pb-32 pt-14 md:px-8 md:pb-44 md:pt-20">
          <div className="mx-auto max-w-5xl text-center">
            <div className="flex items-center justify-center gap-4">
              <span className="h-px w-10 bg-classic-gold/50 md:w-16" />

              <p className="text-[9px] font-semibold uppercase tracking-[0.48em] text-champagne-gold">
                Private Jewelry Experience
              </p>

              <span className="h-px w-10 bg-classic-gold/50 md:w-16" />
            </div>

            <div className="mt-14 flex justify-center md:mt-16">
              <div className="relative">
                <div className="absolute -inset-3 rounded-full border border-classic-gold/40" />

                <div className="absolute -inset-7 rounded-full border border-polished-silver/[0.045]" />

                <div className="absolute -inset-10 rounded-full border border-classic-gold/[0.05]" />

                <div className="absolute -inset-14 rounded-full border border-polished-silver/[0.025]" />

                {personal?.profileImage ? (
                  <img
                    src={getMediaUrl(personal.profileImage)}
                    alt={personal?.ownerName || "Profile"}
                    className="relative h-28 w-28 rounded-full border-2 border-champagne-gold/80 object-cover shadow-[0_25px_70px_rgba(0,0,0,0.45)] md:h-36 md:w-36"
                  />
                ) : (
                  <div className="relative flex h-28 w-28 items-center justify-center rounded-full border-2 border-champagne-gold/80 bg-midnight-navy text-4xl text-champagne-gold shadow-[0_25px_70px_rgba(0,0,0,0.45)] md:h-36 md:w-36">
                    ♥
                  </div>
                )}
              </div>
            </div>

            <p className="mt-14 text-[10px] font-medium uppercase tracking-[0.32em] text-polished-silver/55">
              {personal?.receiverName
                ? "A special experience created for"
                : "A special experience"}
            </p>

            <h1 className="mt-5 font-serif text-5xl font-normal leading-[0.98] tracking-[-0.045em] text-soft-white sm:text-6xl md:text-8xl lg:text-[100px]">
              {personal?.title || experience.product?.name || "Your Experience"}
            </h1>

            {personal?.receiverName && (
              <div className="mt-8">
                <p className="font-serif text-3xl font-normal text-champagne-gold md:text-5xl">
                  {personal.receiverName}
                </p>
              </div>
            )}

            {personal?.ownerName && (
              <div className="mt-9 flex items-center justify-center gap-4">
                <span className="h-px w-8 bg-classic-gold/50 md:w-12" />

                <p className="text-[9px] uppercase tracking-[0.3em] text-polished-silver/55">
                  With love from{" "}
                  <span className="font-semibold text-champagne-gold">
                    {personal.ownerName}
                  </span>
                </p>

                <span className="h-px w-8 bg-classic-gold/50 md:w-12" />
              </div>
            )}

            <div className="mt-14 flex items-center justify-center gap-3">
              <span className="h-px w-16 bg-gradient-to-r from-transparent to-classic-gold/40" />

              <span className="text-sm text-classic-gold">✦</span>

              <span className="h-px w-16 bg-gradient-to-l from-transparent to-classic-gold/40" />
            </div>
          </div>
        </div>
      </section>

      <main className="relative mx-auto -mt-14 max-w-7xl space-y-8 px-5 pb-20 md:-mt-20 md:space-y-10 md:px-8 md:pb-28">
        <section className="relative overflow-hidden rounded-[30px] border border-light-champagne/90 bg-soft-white shadow-[0_35px_100px_rgba(13,34,53,0.12)] md:rounded-[40px]">
          <div className="grid lg:grid-cols-[1.12fr_0.88fr]">
            <div className="relative min-h-[440px] overflow-hidden bg-light-champagne md:min-h-[650px]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,var(--color-soft-white),var(--color-warm-ivory)_48%,var(--color-light-champagne)_100%)]" />

              <div className="absolute left-1/2 top-1/2 h-[330px] w-[330px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-classic-gold/15 md:h-[470px] md:w-[470px]" />

              <div className="absolute left-1/2 top-1/2 h-[250px] w-[250px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-soft-white/70 blur-2xl md:h-[350px] md:w-[350px]" />

              <div className="absolute left-1/2 top-1/2 h-[180px] w-[180px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-classic-gold/10 md:h-[260px] md:w-[260px]" />

              <div className="absolute left-7 top-7 z-20 md:left-10 md:top-10">
                <div className="flex items-center gap-3 rounded-full border border-rich-navy/10 bg-soft-white/85 px-4 py-2.5 shadow-sm backdrop-blur-xl">
                  <span className="h-1.5 w-1.5 rounded-full bg-classic-gold" />

                  <span className="text-[9px] font-semibold uppercase tracking-[0.26em] text-rich-navy">
                    Your Jewelry
                  </span>
                </div>
              </div>

              <div className="absolute bottom-7 left-7 z-20 md:bottom-10 md:left-10">
                <p className="text-[9px] uppercase tracking-[0.3em] text-rich-navy/45">
                  Connected to your story
                </p>
              </div>

              <img
                src={getMediaUrl(productImage)}
                alt={experience.product?.name || "Smart Jewelry"}
                className="relative z-10 h-full min-h-[440px] w-full object-contain p-10 drop-shadow-[0_35px_35px_rgba(13,34,53,0.16)] transition-transform duration-700 hover:scale-[1.025] md:min-h-[650px] md:p-20"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.png";
                }}
              />
            </div>

            <div className="relative flex flex-col justify-center bg-soft-white p-8 md:p-14 lg:p-16">
              <div className="absolute right-0 top-0 h-40 w-40 rounded-bl-full bg-warm-ivory" />

              <div className="absolute bottom-0 left-0 h-40 w-40 rounded-tr-full bg-soft-cream/40" />

              <div className="relative z-10">
                <p className="text-[9px] font-semibold uppercase tracking-[0.38em] text-antique-gold">
                  The Piece
                </p>

                <h2 className="mt-5 max-w-lg font-serif text-4xl font-normal leading-[1.05] tracking-[-0.035em] text-rich-navy md:text-5xl">
                  {experience.product?.name || "Smart Jewelry"}
                </h2>

                <div className="mt-7 flex items-center gap-3">
                  <span className="h-px w-14 bg-classic-gold" />

                  <span className="text-xs text-classic-gold">✦</span>

                  <span className="h-px w-6 bg-classic-gold/30" />
                </div>

                <p className="mt-8 text-[14px] leading-8 text-slate-gray md:text-[15px]">
                  {experience.product?.description ||
                    "This jewelry piece has a special digital experience connected to it."}
                </p>

                <div className="mt-11 border-y border-light-champagne/90">
                  <div className="flex items-center justify-between gap-5 border-b border-light-champagne/90 py-6">
                    <div className="min-w-0">
                      <p className="text-[9px] font-semibold uppercase tracking-[0.26em] text-steel-gray">
                        Serial Number
                      </p>

                      <p className="mt-2 break-all font-mono text-[13px] font-semibold tracking-[0.03em] text-rich-navy">
                        {experience.serialNumber || serialNumber || "-"}
                      </p>
                    </div>

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-classic-gold/35 bg-soft-cream text-sm text-antique-gold">
                      ✦
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-5 py-6">
                    <div>
                      <p className="text-[9px] font-semibold uppercase tracking-[0.26em] text-steel-gray">
                        Experience Type
                      </p>

                      <p className="mt-2 text-[13px] font-semibold capitalize text-rich-navy">
                        {experience.type || "personal"}
                      </p>
                    </div>

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-classic-gold/35 bg-soft-cream text-sm text-antique-gold">
                      ♡
                    </div>
                  </div>
                </div>

                <div className="mt-9 flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full border border-classic-gold/30 bg-soft-cream p-2">
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-deep-navy text-[8px] text-champagne-gold">
                      ✦
                    </div>
                  </div>

                  <p className="text-[10px] uppercase tracking-[0.22em] text-steel-gray">
                    A piece made personal
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden rounded-[30px] bg-luxury-black shadow-[0_35px_90px_rgba(7,19,31,0.18)] md:rounded-[40px]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(201,162,77,0.1),transparent_30%),radial-gradient(circle_at_10%_90%,rgba(23,54,80,0.6),transparent_40%)]" />

          <div className="absolute -right-5 -top-12 font-serif text-[220px] leading-none text-classic-gold/[0.045] md:-right-2 md:-top-20 md:text-[320px]">
            “
          </div>

          <div className="absolute left-0 top-0 h-px w-1/3 bg-gradient-to-r from-classic-gold/60 to-transparent" />

          <div className="absolute bottom-0 right-0 h-px w-1/3 bg-gradient-to-l from-classic-gold/30 to-transparent" />

          <div className="relative grid gap-10 px-7 py-12 md:px-14 md:py-16 lg:grid-cols-[150px_1fr] lg:gap-14 lg:px-20 lg:py-20">
            <div className="hidden lg:block">
              <div className="flex h-24 w-24 items-center justify-center rounded-full border border-classic-gold/25 bg-midnight-navy font-serif text-6xl text-classic-gold shadow-[0_20px_50px_rgba(0,0,0,0.2)]">
                “
              </div>

              <div className="mt-5 h-px w-16 bg-classic-gold/40" />
            </div>

            <div className="max-w-5xl">
              <div className="flex items-center gap-4">
                <span className="h-px w-10 bg-classic-gold" />

                <p className="text-[9px] font-semibold uppercase tracking-[0.38em] text-champagne-gold">
                  A Personal Message
                </p>
              </div>

              <p className="mt-7 whitespace-pre-wrap font-serif text-2xl font-light leading-[1.65] text-soft-white md:text-3xl lg:text-[38px] lg:leading-[1.55]">
                {personal?.message ||
                  "A special message has been created just for you."}
              </p>

              {personal?.ownerName && (
                <div className="mt-12 flex items-center gap-5">
                  <span className="h-px w-14 bg-classic-gold" />

                  <div>
                    <p className="text-[9px] uppercase tracking-[0.3em] text-polished-silver/45">
                      With Love
                    </p>

                    <p className="mt-1 font-serif text-xl text-champagne-gold md:text-2xl">
                      {personal.ownerName}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {media.length > 0 && (
          <section className="overflow-hidden rounded-[30px] border border-light-champagne/90 bg-soft-white shadow-[0_30px_80px_rgba(13,34,53,0.09)] md:rounded-[40px]">
            <div className="relative overflow-hidden px-7 pb-8 pt-10 md:px-12 md:pb-10 md:pt-12">
              <div className="absolute right-0 top-0 h-48 w-48 rounded-bl-full bg-warm-ivory" />

              <div className="absolute -left-24 -top-24 h-56 w-56 rounded-full border border-champagne-gold/[0.07]" />

              <div className="relative z-10 flex flex-col justify-between gap-7 md:flex-row md:items-end">
                <div>
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full border border-classic-gold/30 bg-soft-cream text-antique-gold">
                      ✦
                    </div>

                    <p className="text-[9px] font-semibold uppercase tracking-[0.38em] text-antique-gold">
                      Memories
                    </p>
                  </div>

                  <h2 className="mt-5 font-serif text-4xl font-normal tracking-[-0.035em] text-rich-navy md:text-5xl">
                    Moments to Remember
                  </h2>

                  <div className="mt-5 flex items-center gap-3">
                    <span className="h-px w-12 bg-classic-gold" />

                    <span className="text-xs text-classic-gold">✦</span>

                    <span className="h-px w-5 bg-classic-gold/30" />
                  </div>
                </div>

                <p className="max-w-sm text-[13px] leading-7 text-slate-gray md:text-right">
                  Every photo, video and message becomes part of the story
                  connected to this piece.
                </p>
              </div>
            </div>

            <div className="border-t border-light-champagne/90 bg-warm-ivory/45 p-7 md:p-12">
              <MediaGallery media={media} />
            </div>
          </section>
        )}

        <footer className="px-5 pb-5 pt-8 text-center">
          <div className="mx-auto flex max-w-sm items-center justify-center gap-4">
            <span className="h-px flex-1 bg-rich-navy/10" />

            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-classic-gold/30 bg-soft-cream text-xs text-antique-gold">
              ✦
            </div>

            <span className="h-px flex-1 bg-rich-navy/10" />
          </div>

          <p className="mt-7 text-[9px] font-semibold uppercase tracking-[0.42em] text-rich-navy/50">
            Smart Jewelry Experience
          </p>

          <p className="mt-3 font-serif text-lg text-antique-gold">
            A memory made special
          </p>

          <p className="mt-2 text-[11px] text-steel-gray">
            Crafted for one special story
          </p>
        </footer>
      </main>
    </div>
  );
};

export default ExperienceBySlugPage;
