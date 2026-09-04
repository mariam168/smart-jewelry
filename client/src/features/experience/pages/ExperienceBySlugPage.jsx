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
import getMediaUrl from "../utils/mediaUrl";

const ExperienceBySlugPage = () => {
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

  const [
    pageError,
    setPageError,
  ] = useState("");

  const applyExperiencePayload = (
    payload,
  ) => {
    if (
      !payload?.experience
        ?._id
    ) {
      setExperience(
        null,
      );

      setPersonal(
        null,
      );

      setMedia([]);

      return false;
    }

    setExperience(
      payload.experience,
    );

    setPersonal(
      payload.personal ||
        null,
    );

    setMedia(
      Array.isArray(
        payload.media,
      )
        ? payload.media.filter(
            (
              item,
            ) =>
              [
                "image",
                "video",
                "audio",
              ].includes(
                item?.type,
              ),
          )
        : [],
    );

    return true;
  };

  const loadExperience =
    async () => {
      if (
        !serialNumber ||
        !slug
      ) {
        setExperience(
          null,
        );

        setPersonal(
          null,
        );

        setMedia([]);

        setRequiresDate(
          false,
        );

        setPageError(
          "The experience link is incomplete.",
        );

        setLoading(
          false,
        );

        return;
      }

      try {
        setLoading(
          true,
        );

        setPageError("");
        setUnlockError("");
        setAccessDate("");

        const response =
          await getPublicExperience(
            serialNumber,
            slug,
          );

        if (
          response?.requiresDate ===
          true
        ) {
          setRequiresDate(
            true,
          );

          setExperience(
            null,
          );

          setPersonal(
            null,
          );

          setMedia([]);

          return;
        }

        setRequiresDate(
          false,
        );

        const loaded =
          applyExperiencePayload(
            response?.data ||
              null,
          );

        if (
          !loaded
        ) {
          setPageError(
            "This experience does not exist or is no longer available.",
          );
        }
      } catch (
        error
      ) {
        console.error(
          "FAILED TO LOAD PUBLIC EXPERIENCE:",
          error,
        );

        setExperience(
          null,
        );

        setPersonal(
          null,
        );

        setMedia([]);

        setRequiresDate(
          false,
        );

        setPageError(
          error?.response?.data
            ?.message ||
            "This experience does not exist or is no longer available.",
        );
      } finally {
        setLoading(
          false,
        );
      }
    };

  useEffect(() => {
    loadExperience();
  }, [
    serialNumber,
    slug,
  ]);

  const handleUnlock =
    async (
      event,
    ) => {
      event.preventDefault();

      if (
        !accessDate
      ) {
        setUnlockError(
          "Please enter the special date.",
        );

        return;
      }

      try {
        setUnlocking(
          true,
        );

        setUnlockError(
          "",
        );

        const payload =
          await unlockPublicExperience(
            serialNumber,
            slug,
            accessDate,
          );

        const loaded =
          applyExperiencePayload(
            payload,
          );

        if (
          !loaded
        ) {
          setUnlockError(
            "Unable to open this experience.",
          );

          return;
        }

        setRequiresDate(
          false,
        );

        setAccessDate(
          "",
        );
      } catch (
        error
      ) {
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
        setUnlocking(
          false,
        );
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

  if (
    requiresDate
  ) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-luxury-black px-5 py-12">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[760px] w-[760px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-classic-gold/[0.055] blur-[160px]" />

        <div className="relative w-full max-w-[500px] overflow-hidden rounded-[36px] border border-classic-gold/15 bg-deep-navy/90 shadow-[0_40px_120px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          <div className="border-b border-soft-white/[0.07] px-8 py-8 text-center sm:px-11">
            <div className="mx-auto flex h-[74px] w-[74px] items-center justify-center rounded-full border border-classic-gold/30 bg-midnight-navy">
              <span className="text-[20px] text-champagne-gold">
                ✦
              </span>
            </div>

            <p className="mt-7 text-[9px] font-semibold uppercase tracking-[0.42em] text-champagne-gold">
              Private Jewelry Experience
            </p>

            <h1 className="mt-4 font-serif text-[2.7rem] font-normal leading-[1.02] tracking-[-0.045em] text-soft-white sm:text-[3.1rem]">
              A Special Date
            </h1>

            <p className="mx-auto mt-6 max-w-sm text-[13px] leading-7 text-premium-silver/80">
              This experience is protected by a meaningful date. Enter the
              special date to reveal the private story.
            </p>
          </div>

          <form
            onSubmit={
              handleUnlock
            }
            className="relative px-8 pb-9 pt-8 sm:px-11 sm:pb-11"
          >
            <label className="mb-3 block text-[9px] font-semibold uppercase tracking-[0.24em] text-premium-silver/60">
              Enter The Special Date
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
              className="h-[60px] w-full rounded-[15px] border border-soft-white/10 bg-soft-white/[0.055] px-5 text-[14px] font-medium text-soft-white outline-none transition-all duration-300 [color-scheme:dark] hover:border-classic-gold/30 focus:border-classic-gold/60 focus:ring-4 focus:ring-classic-gold/10"
            />

            {unlockError && (
              <div className="mt-4 rounded-[14px] border border-red-400/20 bg-red-400/[0.08] px-4 py-3.5 text-[11px] leading-5 text-red-200">
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
              className="mt-6 inline-flex min-h-[54px] w-full items-center justify-center gap-3 rounded-[15px] bg-champagne-gold px-7 text-[11px] font-semibold text-deep-navy shadow-[0_14px_35px_rgba(201,162,77,0.20)] transition-all duration-300 hover:bg-classic-gold disabled:cursor-not-allowed disabled:opacity-60"
            >
              {unlocking
                ? "Checking Date..."
                : "Open Experience ✦"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (
    !experience
  ) {
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
            {pageError ||
              "This private experience does not exist or is no longer available."}
          </p>
        </div>
      </div>
    );
  }

  const profileImageUrl =
    personal?.profileImage
      ? getMediaUrl(
          personal.profileImage,
        )
      : "";

  return (
    <div className="min-h-screen overflow-hidden bg-warm-ivory text-rich-navy">
      <section className="relative overflow-hidden bg-luxury-black">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,var(--color-navy-soft),var(--color-luxury-black)_55%,var(--color-deep-navy)_100%)]" />

        <div className="absolute -left-48 -top-40 h-[600px] w-[600px] rounded-full bg-classic-gold/[0.04] blur-[110px]" />

        <div className="absolute -right-48 top-20 h-[550px] w-[550px] rounded-full bg-navy-soft/35 blur-[110px]" />

        <div className="relative mx-auto max-w-7xl px-5 pb-28 pt-14 md:px-8 md:pb-36 md:pt-20">
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

                {profileImageUrl ? (
                  <img
                    src={
                      profileImageUrl
                    }
                    alt={
                      personal?.ownerName ||
                      "Profile"
                    }
                    className="relative h-28 w-28 rounded-full border-2 border-champagne-gold/80 object-cover shadow-[0_25px_70px_rgba(0,0,0,0.45)] md:h-36 md:w-36"
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
                "A Special Experience"}
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

      <main className="relative mx-auto -mt-10 max-w-6xl space-y-8 px-5 pb-20 md:-mt-14 md:px-8 md:pb-28">
        <section className="relative overflow-hidden rounded-[30px] bg-luxury-black px-7 py-12 shadow-[0_35px_90px_rgba(7,19,31,0.18)] md:px-14 md:py-16 lg:px-20">
          <div className="absolute -right-5 -top-12 font-serif text-[220px] leading-none text-classic-gold/[0.045]">
            “
          </div>

          <div className="relative z-10">
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
          </div>
        </section>

        {media.length >
          0 && (
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
              media={
                media
              }
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

export default ExperienceBySlugPage;