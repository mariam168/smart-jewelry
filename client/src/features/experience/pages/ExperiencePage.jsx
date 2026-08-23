import {
  useEffect,
  useState,
} from "react";

import {
  useParams,
} from "react-router-dom";

import {
  getPublicExperience,
  unlockPublicExperience,
} from "../services/experienceApi";

import MediaGallery from "../components/MediaGallery";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

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

  return `${API_URL}${
    url.startsWith("/")
      ? ""
      : "/"
  }${url}`;
};

const ExperiencePage = () => {
  const {
    serialNumber,
    slug,
  } = useParams();

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    experience,
    setExperience,
  ] = useState(null);

  const [
    personal,
    setPersonal,
  ] = useState(null);

  const [
    media,
    setMedia,
  ] = useState([]);

  const [
    requiresDate,
    setRequiresDate,
  ] = useState(false);

  const [
    accessDate,
    setAccessDate,
  ] = useState("");

  const [
    unlocking,
    setUnlocking,
  ] = useState(false);

  const [
    unlockError,
    setUnlockError,
  ] = useState("");

  useEffect(() => {
    if (
      !serialNumber ||
      !slug
    ) {
      setExperience(null);
      setRequiresDate(false);
      setLoading(false);

      return;
    }

    loadExperience();
  }, [serialNumber, slug]);

  const applyPayload = (
    payload,
  ) => {
    setExperience(
      payload?.experience ||
        null,
    );

    setPersonal(
      payload?.personal ||
        null,
    );

    setMedia(
      Array.isArray(
        payload?.media,
      )
        ? payload.media
        : [],
    );
  };

  const loadExperience =
    async () => {
      try {
        setLoading(true);

        setUnlockError("");

        setAccessDate("");

        const response =
          await getPublicExperience(
            serialNumber,
            slug,
          );

        if (
          response?.requiresDate
        ) {
          setRequiresDate(
            true,
          );

          setExperience(null);
          setPersonal(null);
          setMedia([]);

          return;
        }

        setRequiresDate(false);

        applyPayload(
          response?.data,
        );
      } catch (error) {
        console.error(
          "PUBLIC EXPERIENCE ERROR:",
          error,
        );

        setExperience(null);
        setPersonal(null);
        setMedia([]);
        setRequiresDate(false);
      } finally {
        setLoading(false);
      }
    };

  const handleUnlock =
    async (event) => {
      event.preventDefault();

      if (!accessDate) {
        setUnlockError(
          "Please enter the special date.",
        );

        return;
      }

      try {
        setUnlocking(true);

        setUnlockError("");

        const payload =
          await unlockPublicExperience(
            serialNumber,
            slug,
            accessDate,
          );

        applyPayload(
          payload,
        );

        setRequiresDate(false);
      } catch (error) {
        console.error(
          "UNLOCK EXPERIENCE ERROR:",
          error,
        );

        setUnlockError(
          error?.response?.data
            ?.message ||
            "The date you entered is incorrect.",
        );
      } finally {
        setUnlocking(false);
      }
    };

  if (loading) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-luxury-black px-6">
        <div className="absolute left-1/2 top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-classic-gold/[0.045] blur-[130px]" />

        <div className="relative z-10 text-center">
          <div className="relative mx-auto h-24 w-24">
            <div className="absolute inset-0 rounded-full border border-classic-gold/20" />

            <div className="absolute inset-2 animate-spin rounded-full border border-transparent border-t-classic-gold" />

            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl text-champagne-gold">
                ✦
              </span>
            </div>
          </div>

          <p className="mt-8 text-[10px] font-semibold uppercase tracking-[0.42em] text-polished-silver/55">
            Preparing Your Experience
          </p>
        </div>
      </div>
    );
  }

  if (requiresDate) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-luxury-black px-5">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-classic-gold/[0.055] blur-[150px]" />

        <div className="pointer-events-none absolute left-[8%] top-[12%] h-56 w-56 rounded-full border border-classic-gold/[0.08]" />

        <div className="pointer-events-none absolute bottom-[8%] right-[10%] h-72 w-72 rounded-full border border-polished-silver/[0.04]" />

        <div className="relative w-full max-w-[490px] overflow-hidden rounded-[34px] border border-classic-gold/15 bg-deep-navy/90 p-8 shadow-[0_35px_100px_rgba(0,0,0,0.38)] backdrop-blur-xl sm:p-11">
          <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-classic-gold/[0.06] blur-3xl" />

          <div className="relative text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-classic-gold/30 bg-midnight-navy text-[22px] text-champagne-gold shadow-[0_15px_40px_rgba(0,0,0,0.25)]">
              ✦
            </div>

            <p className="mt-7 text-[9px] font-semibold uppercase tracking-[0.4em] text-champagne-gold">
              Private Jewelry Experience
            </p>

            <h1 className="mt-4 font-serif text-[2.6rem] font-normal leading-tight tracking-[-0.04em] text-soft-white">
              Remember the Date?
            </h1>

            <p className="mx-auto mt-4 max-w-sm text-[13px] leading-7 text-premium-silver">
              This experience is protected by a special date. Enter the date to
              reveal the story connected to this jewelry piece.
            </p>

            <form
              onSubmit={
                handleUnlock
              }
              className="mt-8"
            >
              <label className="mb-3 block text-left text-[9px] font-semibold uppercase tracking-[0.22em] text-premium-silver/70">
                Special Date
              </label>

              <input
                type="date"
                value={
                  accessDate
                }
                onChange={(
                  event,
                ) => {
                  setAccessDate(
                    event.target
                      .value,
                  );

                  setUnlockError(
                    "",
                  );
                }}
                className="h-[58px] w-full rounded-[14px] border border-soft-white/10 bg-soft-white/[0.06] px-5 text-[14px] text-soft-white outline-none transition-all [color-scheme:dark] focus:border-classic-gold/60 focus:bg-soft-white/[0.09] focus:ring-4 focus:ring-classic-gold/10"
              />

              {unlockError && (
                <div className="mt-4 rounded-[13px] border border-red-400/20 bg-red-400/10 px-4 py-3 text-left text-[11px] leading-5 text-red-200">
                  {
                    unlockError
                  }
                </div>
              )}

              <button
                type="submit"
                disabled={
                  unlocking
                }
                className="mt-6 inline-flex min-h-[52px] w-full items-center justify-center rounded-[14px] bg-champagne-gold px-7 text-[11px] font-semibold text-deep-navy shadow-[0_12px_30px_rgba(201,162,77,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-classic-gold disabled:cursor-not-allowed disabled:opacity-60"
              >
                {unlocking
                  ? "Checking Date..."
                  : "Open Experience"}
              </button>
            </form>

            <div className="mt-8 flex items-center justify-center gap-3">
              <span className="h-px w-12 bg-classic-gold/20" />

              <span className="text-[11px] text-classic-gold">
                ♡
              </span>

              <span className="h-px w-12 bg-classic-gold/20" />
            </div>

            <p className="mt-5 text-[9px] uppercase tracking-[0.2em] text-polished-silver/30">
              Smart Jewelry
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!experience) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-warm-ivory px-5">
        <div className="relative w-full max-w-lg rounded-[32px] border border-light-champagne bg-soft-white p-10 text-center shadow-[0_30px_100px_rgba(13,34,53,0.10)]">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-champagne-gold/20 bg-deep-navy text-3xl text-champagne-gold">
            ♡
          </div>

          <p className="mt-8 text-[10px] font-semibold uppercase tracking-[0.38em] text-antique-gold">
            Smart Jewelry
          </p>

          <h1 className="mt-4 font-serif text-[2.5rem] tracking-[-0.04em] text-rich-navy">
            Experience Not Found
          </h1>

          <p className="mt-5 text-[13px] leading-7 text-slate-gray">
            This private experience does not exist or is no longer available.
          </p>
        </div>
      </div>
    );
  }

  const productImage =
    experience.product
      ?.primaryImage ||
    experience.product?.image ||
    experience.product
      ?.images?.[0] ||
    "/placeholder.png";

  return (
    <div className="min-h-screen overflow-hidden bg-warm-ivory text-rich-navy">
      <section className="relative overflow-hidden bg-luxury-black">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,var(--color-navy-soft),var(--color-luxury-black)_55%,var(--color-deep-navy)_100%)]" />

        <div className="absolute -left-48 -top-40 h-[600px] w-[600px] rounded-full bg-classic-gold/[0.04] blur-[110px]" />

        <div className="relative mx-auto max-w-7xl px-5 pb-32 pt-14 md:px-8 md:pb-44 md:pt-20">
          <div className="mx-auto max-w-5xl text-center">
            <div className="flex items-center justify-center gap-4">
              <span className="h-px w-10 bg-classic-gold/50 md:w-16" />

              <p className="text-[9px] font-semibold uppercase tracking-[0.48em] text-champagne-gold">
                Private Jewelry Experience
              </p>

              <span className="h-px w-10 bg-classic-gold/50 md:w-16" />
            </div>

            <div className="mt-14 flex justify-center">
              <div className="relative">
                <div className="absolute -inset-3 rounded-full border border-classic-gold/40" />

                {personal?.profileImage ? (
                  <img
                    src={getMediaUrl(
                      personal.profileImage,
                    )}
                    alt={
                      personal.ownerName ||
                      "Profile"
                    }
                    className="relative h-28 w-28 rounded-full border-2 border-champagne-gold/80 object-cover md:h-36 md:w-36"
                  />
                ) : (
                  <div className="relative flex h-28 w-28 items-center justify-center rounded-full border-2 border-champagne-gold/80 bg-midnight-navy text-4xl text-champagne-gold md:h-36 md:w-36">
                    ♥
                  </div>
                )}
              </div>
            </div>

            <p className="mt-14 text-[10px] uppercase tracking-[0.32em] text-polished-silver/55">
              {personal?.receiverName
                ? "A special experience created for"
                : "A special experience"}
            </p>

            <h1 className="mt-5 font-serif text-5xl leading-[0.98] tracking-[-0.045em] text-soft-white sm:text-6xl md:text-8xl">
              {personal?.title ||
                experience.product
                  ?.name ||
                "Your Experience"}
            </h1>

            {personal?.receiverName && (
              <p className="mt-8 font-serif text-3xl text-champagne-gold md:text-5xl">
                {
                  personal.receiverName
                }
              </p>
            )}

            {personal?.ownerName && (
              <p className="mt-9 text-[9px] uppercase tracking-[0.3em] text-polished-silver/55">
                With love from{" "}
                <span className="font-semibold text-champagne-gold">
                  {
                    personal.ownerName
                  }
                </span>
              </p>
            )}
          </div>
        </div>
      </section>

      <main className="relative mx-auto -mt-14 max-w-7xl space-y-8 px-5 pb-20 md:-mt-20 md:px-8 md:pb-28">
        <section className="overflow-hidden rounded-[30px] border border-light-champagne/90 bg-soft-white shadow-[0_35px_100px_rgba(13,34,53,0.12)]">
          <div className="grid lg:grid-cols-[1.12fr_0.88fr]">
            <div className="relative min-h-[440px] bg-light-champagne md:min-h-[650px]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,var(--color-soft-white),var(--color-warm-ivory)_48%,var(--color-light-champagne)_100%)]" />

              <img
                src={getMediaUrl(
                  productImage,
                )}
                alt={
                  experience.product
                    ?.name ||
                  "Smart Jewelry"
                }
                className="relative z-10 h-full min-h-[440px] w-full object-contain p-10 md:min-h-[650px] md:p-20"
                onError={(
                  event,
                ) => {
                  event.currentTarget.src =
                    "/placeholder.png";
                }}
              />
            </div>

            <div className="relative flex flex-col justify-center bg-soft-white p-8 md:p-14 lg:p-16">
              <p className="text-[9px] font-semibold uppercase tracking-[0.38em] text-antique-gold">
                The Piece
              </p>

              <h2 className="mt-5 font-serif text-4xl leading-[1.05] tracking-[-0.035em] md:text-5xl">
                {experience.product
                  ?.name ||
                  "Smart Jewelry"}
              </h2>

              <div className="mt-7 h-px w-14 bg-classic-gold" />

              <p className="mt-8 text-[14px] leading-8 text-slate-gray">
                {experience.product
                  ?.description ||
                  "This jewelry piece has a special digital experience connected to it."}
              </p>

              <div className="mt-10 border-y border-light-champagne">
                <div className="border-b border-light-champagne py-5">
                  <p className="text-[9px] uppercase tracking-[0.25em] text-steel-gray">
                    Serial Number
                  </p>

                  <p className="mt-2 break-all font-mono text-[13px] font-semibold">
                    {experience.serialNumber ||
                      serialNumber}
                  </p>
                </div>

                <div className="py-5">
                  <p className="text-[9px] uppercase tracking-[0.25em] text-steel-gray">
                    Experience Type
                  </p>

                  <p className="mt-2 text-[13px] font-semibold capitalize">
                    {experience.type ||
                      "personal"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden rounded-[30px] bg-luxury-black px-7 py-12 shadow-[0_35px_90px_rgba(7,19,31,0.18)] md:px-14 md:py-16 lg:px-20">
          <p className="text-[9px] font-semibold uppercase tracking-[0.38em] text-champagne-gold">
            A Personal Message
          </p>

          <p className="mt-7 whitespace-pre-wrap font-serif text-2xl font-light leading-[1.65] text-soft-white md:text-3xl lg:text-[38px]">
            {personal?.message ||
              "A special message has been created just for you."}
          </p>

          {personal?.ownerName && (
            <div className="mt-12">
              <p className="text-[9px] uppercase tracking-[0.3em] text-polished-silver/45">
                With Love
              </p>

              <p className="mt-1 font-serif text-xl text-champagne-gold md:text-2xl">
                {
                  personal.ownerName
                }
              </p>
            </div>
          )}
        </section>

        {media.length > 0 && (
          <section className="overflow-hidden rounded-[30px] border border-light-champagne/90 bg-soft-white p-7 shadow-[0_30px_80px_rgba(13,34,53,0.09)] md:p-12">
            <div className="mb-8">
              <p className="text-[9px] font-semibold uppercase tracking-[0.38em] text-antique-gold">
                Memories
              </p>

              <h2 className="mt-3 font-serif text-4xl tracking-[-0.035em] md:text-5xl">
                Moments to Remember
              </h2>
            </div>

            <MediaGallery
              media={media}
            />
          </section>
        )}

        <footer className="py-10 text-center">
          <div className="flex items-center justify-center gap-4">
            <span className="h-px w-16 bg-champagne-gold" />

            <span className="text-xl text-classic-gold">
              ♡
            </span>

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