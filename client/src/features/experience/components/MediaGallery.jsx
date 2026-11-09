import { useState } from "react";
import { useTranslation } from "react-i18next";
import getMediaUrl from "../utils/mediaUrl";

const formatFileSize = (bytes) => {
  if (!bytes) {
    return "";
  }

  const mb = bytes / (1024 * 1024);

  if (mb >= 1) {
    return `${mb.toFixed(2)} MB`;
  }

  return `${(bytes / 1024).toFixed(1)} KB`;
};

const MediaGallery = ({ media = [], musicLink = "" }) => {
  const { t } = useTranslation();

  const [flippedImage, setFlippedImage] = useState(null);

  const visibleMedia = Array.isArray(media)
    ? media.filter((item) =>
        ["image", "video", "audio"].includes(item?.type)
      )
    : [];

  const hasNote = (item) => Boolean(item?.note?.trim());

 if (!visibleMedia.length && !musicLink?.trim()) {
    return (
      <div className="relative flex min-h-[300px] flex-col items-center justify-center overflow-hidden rounded-[28px] border border-light-champagne/80 bg-soft-cream px-5 py-12 text-center shadow-[0_20px_60px_rgba(13,34,53,0.06)] sm:min-h-[340px] sm:rounded-[34px] sm:px-6 sm:py-16">
        <div className="pointer-events-none absolute -left-32 -top-32 h-64 w-64 rounded-full bg-champagne-gold/[0.055] blur-[80px] sm:h-72 sm:w-72" />

        <div className="pointer-events-none absolute -bottom-32 -right-32 h-64 w-64 rounded-full bg-navy-soft/[0.08] blur-[80px] sm:h-72 sm:w-72" />

        <div className="relative">
          <div className="absolute -inset-3 rounded-full border border-champagne-gold/10 sm:-inset-4" />

          <div className="absolute -inset-6 rounded-full border border-champagne-gold/[0.05] sm:-inset-7" />

          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-champagne-gold/25 bg-warm-ivory shadow-[0_15px_40px_rgba(13,34,53,0.08)] sm:h-20 sm:w-20">
            <span className="text-[17px] text-antique-gold sm:text-[21px]">
              ✦
            </span>
          </div>
        </div>

        <p className="mt-8 font-serif text-[1.15rem] tracking-[-0.025em] text-deep-navy sm:mt-9 sm:text-[1.5rem]">
          {t("mediaGallery.noMemories")}
        </p>

        <p className="mt-2 max-w-xs text-[10px] leading-5 text-slate-gray sm:mt-3 sm:max-w-sm sm:text-[13px] sm:leading-6">
          {t("mediaGallery.noMemoriesDescription")}
        </p>

        <div className="mt-6 flex items-center gap-3 sm:mt-7">
          <span className="h-px w-9 bg-champagne-gold/25 sm:w-12" />

          <span className="text-[9px] text-antique-gold sm:text-[10px]">
            ♡
          </span>

          <span className="h-px w-9 bg-champagne-gold/25 sm:w-12" />
        </div>
      </div>
    );
  }

  const images = visibleMedia.filter((item) => item.type === "image");
  const videos = visibleMedia.filter((item) => item.type === "video");
  const audios = visibleMedia.filter((item) => item.type === "audio");

  return (
    <div className="space-y-16 sm:space-y-20 lg:space-y-24">
      {images.length > 0 && (
        <section className="relative">
          <div className="relative z-10 mb-8 flex items-end justify-between gap-4 sm:mb-10 lg:mb-12">
            <div>
              <div className="flex items-center gap-2.5 sm:gap-3">
                <span className="h-px w-7 bg-gradient-to-r from-transparent to-champagne-gold/70 sm:w-11" />

                <p className="text-[7px] font-semibold uppercase tracking-[0.3em] text-antique-gold sm:text-[9px] sm:tracking-[0.4em]">
                  {t("mediaGallery.memories")}
                </p>
              </div>

              <h3 className="mt-3 font-serif text-[1.6rem] leading-none tracking-[-0.05em] text-deep-navy sm:mt-4 sm:text-[2.25rem] lg:text-[3rem]">
                {t("mediaGallery.photos")}
              </h3>
            </div>

            <div className="flex shrink-0 items-center gap-2 pb-0.5 sm:gap-3">
              <span className="text-[8px] tracking-[0.16em] text-antique-gold/50 sm:text-[11px] sm:tracking-[0.2em]">
                {String(images.length).padStart(2, "0")}
              </span>

              <span className="h-px w-7 bg-champagne-gold/25 sm:w-14" />

              <span className="text-[9px] text-antique-gold/60 sm:text-[12px]">
                ✦
              </span>
            </div>
          </div>

          <div className="relative px-1 pb-4 sm:px-3 sm:pb-8">
            <div className="pointer-events-none absolute -left-20 top-20 h-56 w-56 rounded-full bg-champagne-gold/[0.045] blur-[90px] sm:h-72 sm:w-72" />

            <div className="pointer-events-none absolute -bottom-20 right-0 h-64 w-64 rounded-full bg-navy-soft/[0.06] blur-[90px] sm:h-80 sm:w-80" />

           <div className="relative grid grid-cols-1 gap-y-12 sm:grid-cols-2 sm:gap-x-9 sm:gap-y-16 lg:grid-cols-3 lg:gap-x-12 lg:gap-y-20">  {images.map((item, index) => {
                const isFlipped = flippedImage === item._id;

                const rotations = [
                  "-rotate-[1.1deg]",
                  "rotate-[0.9deg]",
                  "-rotate-[0.65deg]",
                  "rotate-[1deg]",
                  "-rotate-[0.8deg]",
                  "rotate-[0.65deg]",
                ];

                const blueRotations = [
                  "rotate-[5deg]",
                  "-rotate-[4deg]",
                  "rotate-[3.8deg]",
                  "-rotate-[5deg]",
                  "rotate-[4.5deg]",
                  "-rotate-[3.5deg]",
                ];

                const cyanRotations = [
                  "-rotate-[2.5deg]",
                  "rotate-[2deg]",
                  "-rotate-[3deg]",
                  "rotate-[2.5deg]",
                  "-rotate-[2deg]",
                  "rotate-[3deg]",
                ];

                return (
                  <div
                    key={item._id}
                    className={`group relative min-w-0 ${rotations[index % rotations.length]} transition-all duration-700 hover:z-30 hover:-translate-y-2 hover:rotate-0`}
                  >
                    <div className="pointer-events-none absolute -inset-3 rounded-[2px] bg-champagne-gold/[0.025] opacity-0 blur-xl transition-opacity duration-700 group-hover:opacity-100 sm:-inset-5" />

                    <div
                      className={`pointer-events-none absolute -bottom-3 left-1/2 z-0 h-[91%] w-[88%] -translate-x-1/2 ${blueRotations[index % blueRotations.length]} bg-[#56B6D0] shadow-[0_14px_28px_rgba(13,34,53,0.09)] transition-transform duration-700 group-hover:translate-y-1`}
                    />

                    <div
                      className={`pointer-events-none absolute -bottom-2 left-[44%] z-0 h-[93%] w-[91%] -translate-x-1/2 ${cyanRotations[index % cyanRotations.length]} bg-[#D9F1F5] shadow-[0_10px_25px_rgba(13,34,53,0.06)]`}
                    />

                    <div className="pointer-events-none absolute -bottom-3 left-1/2 z-0 h-3 w-[82%] -translate-x-1/2 rounded-full bg-deep-navy/10 blur-[7px]" />

                    <div className="pointer-events-none absolute -top-[25px] left-1/2 z-40 h-[57px] w-[25px] -translate-x-1/2 sm:-top-[31px] sm:h-[70px] sm:w-[29px]">
                      <div className="absolute left-1/2 top-0 h-[46px] w-[15px] -translate-x-1/2 rounded-t-[10px] border-[3px] border-[#126F9D] border-b-0 bg-transparent shadow-[1px_2px_2px_rgba(13,34,53,0.16)] sm:h-[56px] sm:w-[18px]" />

                      <div className="absolute left-1/2 top-[25px] h-[30px] w-[15px] -translate-x-[16%] rounded-b-[9px] border-[3px] border-[#126F9D] border-t-0 bg-transparent shadow-[1px_2px_2px_rgba(13,34,53,0.16)] sm:top-[30px] sm:h-[37px] sm:w-[18px]" />

                      <div className="absolute left-1/2 top-[23px] h-[7px] w-[18px] -translate-x-1/2 rounded-full bg-[#126F9D] shadow-[0_2px_2px_rgba(13,34,53,0.15)] sm:top-[28px] sm:h-[8px] sm:w-[21px]" />

                      <div className="absolute left-[4px] top-[2px] h-[17px] w-[3px] rounded-full bg-white/60 blur-[0.5px] sm:left-[5px] sm:h-[20px]" />
                    </div>

                    <div
                      className="relative z-10 bg-[#FEFEFC] p-[7px] shadow-[0_18px_38px_rgba(13,34,53,0.13)] transition-all duration-700 group-hover:shadow-[0_25px_50px_rgba(13,34,53,0.18)] sm:p-[10px] lg:p-[11px]"
                      style={{
                        perspective: "1400px",
                      }}
                    >
                      <div className="pointer-events-none absolute inset-0 border border-[#EAE7E0]" />

                      <div className="pointer-events-none absolute left-2 top-2 h-3 w-3 border-l border-t border-champagne-gold/20 sm:left-3 sm:top-3 sm:h-4 sm:w-4" />

                      <div className="pointer-events-none absolute right-2 top-2 h-3 w-3 border-r border-t border-champagne-gold/20 sm:right-3 sm:top-3 sm:h-4 sm:w-4" />

                      <div className="pointer-events-none absolute bottom-2 left-2 h-3 w-3 border-b border-l border-champagne-gold/20 sm:bottom-3 sm:left-3 sm:h-4 sm:w-4" />

                      <div className="pointer-events-none absolute bottom-2 right-2 h-3 w-3 border-b border-r border-champagne-gold/20 sm:bottom-3 sm:right-3 sm:h-4 sm:w-4" />

                      <div
  className="relative aspect-[4/5] w-full cursor-pointer overflow-hidden"
  onClick={() =>
    setFlippedImage(isFlipped ? null : item._id)
  }
>
                        <div
                          className="relative h-full w-full transition-transform duration-700 ease-in-out"
                          style={{
                            transformStyle: "preserve-3d",
                            transform: isFlipped
                              ? "rotateY(180deg)"
                              : "rotateY(0deg)",
                          }}
                        >
                          <div
                            className="absolute inset-0 overflow-hidden bg-[#F3F1EC]"
                            style={{
                              backfaceVisibility: "hidden",
                              WebkitBackfaceVisibility: "hidden",
                            }}
                          >
                           <img
  src={getMediaUrl(item.url)}
  alt={t("mediaGallery.memory")}
  className="h-full w-full object-contain bg-[#F3F1EC] transition-transform duration-[1200ms] ease-out group-hover:scale-[1.015]"
  loading="lazy"
/>

                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-deep-navy/45 via-transparent to-white/[0.08]" />

                            <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/30" />

                            <div className="absolute left-3 top-3 flex h-5 w-5 items-center justify-center rounded-full border border-white/30 bg-deep-navy/20 text-[6px] text-white/90 backdrop-blur-md sm:left-4 sm:top-4 sm:h-7 sm:w-7 sm:text-[8px]">
                              {String(index + 1).padStart(2, "0")}
                            </div>

                            <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between sm:bottom-4 sm:left-4 sm:right-4">
                              <div className="min-w-0">
                                <div className="mb-1 h-px w-5 bg-white/60 sm:w-7" />

                                <span className="block max-w-[95px] truncate text-[6px] font-semibold uppercase tracking-[0.18em] text-white/85 sm:max-w-[130px] sm:text-[8px] sm:tracking-[0.28em]">
                                  {t("mediaGallery.memory")}
                                </span>
                              </div>

                              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/30 bg-deep-navy/20 text-[7px] text-white backdrop-blur-md sm:h-8 sm:w-8 sm:text-[10px]">
                                ✦
                              </span>
                            </div>
                          </div>

                          <div
                            className="absolute inset-0 flex h-full w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#07192D] via-[#0D2A47] to-[#123B5D] px-3 py-4 text-center sm:px-6 sm:py-7"
                            style={{
                              backfaceVisibility: "hidden",
                              WebkitBackfaceVisibility: "hidden",
                              transform: "rotateY(180deg)",
                            }}
                          >
                            <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-champagne-gold/[0.08] blur-[65px]" />

                            <div className="pointer-events-none absolute -bottom-24 -left-20 h-52 w-52 rounded-full bg-navy-soft/40 blur-[70px]" />

                            <div className="relative mb-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-champagne-gold/25 bg-white/[0.04] text-champagne-gold sm:mb-5 sm:h-13 sm:w-13">
                              <span className="text-[11px] sm:text-[16px]">
                                ✦
                              </span>
                            </div>

                            <p className="relative text-[6px] font-semibold uppercase tracking-[0.25em] text-champagne-gold sm:text-[8px] sm:tracking-[0.35em]">
                              {t("mediaGallery.note")}
                            </p>

                            <div className="relative mt-2 h-px w-8 bg-gradient-to-r from-transparent via-champagne-gold/50 to-transparent sm:mt-4 sm:w-14" />

                            <p className="relative mt-3 max-h-[90px] max-w-full overflow-y-auto whitespace-pre-wrap break-words px-1 font-serif text-[9px] leading-4 text-soft-white sm:mt-5 sm:max-h-[175px] sm:text-[16px] sm:leading-7">
                              {hasNote(item)
                                ? item.note
                                : t("mediaGallery.noNote")}
                            </p>

                            <div className="relative mt-3 flex max-w-full items-center gap-1 text-[5px] uppercase tracking-[0.1em] text-premium-silver/40 sm:mt-6 sm:gap-2 sm:text-[7px] sm:tracking-[0.22em]">
                              <span className="h-px w-3 bg-champagne-gold/20 sm:w-6" />

                              <span className="truncate">
                                {t("mediaGallery.tapToReturn")}
                              </span>

                              <span className="h-px w-3 bg-champagne-gold/20 sm:w-6" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pointer-events-none absolute -bottom-4 left-1/2 z-0 h-4 w-[70%] -translate-x-1/2 bg-deep-navy/[0.07] blur-[8px]" />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-9 flex items-center justify-center gap-2.5 sm:mt-12 sm:gap-3">
            <span className="h-px w-10 bg-gradient-to-r from-transparent to-champagne-gold/25 sm:w-16" />

            <span className="text-[8px] text-antique-gold/50 sm:text-[9px]">
              ✦
            </span>

            <span className="h-px w-10 bg-gradient-to-l from-transparent to-champagne-gold/25 sm:w-16" />
          </div>
        </section>
      )}

{musicLink?.trim() && (
  <div className="relative mt-7 flex justify-center">
    <a
      href={musicLink}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex w-full items-center gap-4 overflow-hidden rounded-2xl border border-[#DCC18F]/40 bg-gradient-to-r from-[#07192D] via-[#102B45] to-[#07192D] p-4 text-left shadow-[0_12px_30px_rgba(7,25,45,0.18)] transition-all duration-300 hover:-translate-y-1 hover:border-[#DCC18F]/80 hover:shadow-[0_18px_35px_rgba(7,25,45,0.28)] sm:p-5"
    >
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-[#DCC18F]/30 bg-[#DCC18F]/10 transition-colors duration-300 group-hover:bg-[#DCC18F]/20">
        <span className="text-3xl text-[#DCC18F]">♫</span>
      </div>

      <div className="min-w-0 flex-1">
        <p className="mb-1 text-[9px] font-semibold uppercase tracking-[0.25em] text-[#DCC18F]/80">
          {t("mediaGallery.music")}
        </p>

        <h3 className="font-serif text-lg text-white sm:text-xl">
          {t("mediaGallery.musicTitle")}
        </h3>

        <p className="mt-1 text-xs text-white/60">
          {t("mediaGallery.openMusic")}
        </p>
      </div>

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 text-[#DCC18F] transition-all duration-300 group-hover:border-[#DCC18F]/50 group-hover:bg-[#DCC18F]/10">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13 5h6v6M19 5l-9 9"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M18 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"
          />
        </svg>
      </div>

      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#DCC18F]/[0.06] blur-2xl transition-all duration-300 group-hover:bg-[#DCC18F]/[0.12]" />
    </a>
  </div>
)}
   
{audios.length > 0 && (

  <section className="relative">

    <div className="relative z-10 mb-8 flex items-end justify-between gap-4 sm:mb-10 lg:mb-12">

      <div>

        <div className="flex items-center gap-2.5 sm:gap-3">

          <span className="h-px w-7 bg-gradient-to-r from-transparent to-champagne-gold/70 sm:w-11" />

          <p className="text-[7px] font-semibold uppercase tracking-[0.3em] text-antique-gold sm:text-[9px] sm:tracking-[0.4em]">

            {t("mediaGallery.voiceMemories")}

          </p>

        </div>

        <h3 className="mt-3 font-serif text-[1.6rem] leading-none tracking-[-0.05em] text-deep-navy sm:mt-4 sm:text-[2.25rem] lg:text-[3rem]">

          {t("mediaGallery.voiceMessages")}

        </h3>

      </div>

      <div className="flex items-center gap-2 sm:gap-3">

        <span className="text-[8px] tracking-[0.16em] text-antique-gold/50 sm:text-[11px] sm:tracking-[0.2em]">

          {String(audios.length).padStart(2, "0")}

        </span>

        <span className="h-px w-7 bg-champagne-gold/25 sm:w-14" />

        <span className="text-[13px] text-antique-gold/55 sm:text-[16px]">

          ♫

        </span>

      </div>

    </div>

    <div className="relative px-1 pb-5 sm:px-3 sm:pb-8">

      <div className="pointer-events-none absolute -left-20 top-10 h-64 w-64 rounded-full bg-deep-navy/[0.055] blur-[90px] sm:h-80 sm:w-80" />

      <div className="pointer-events-none absolute -bottom-20 right-0 h-64 w-64 rounded-full bg-champagne-gold/[0.055] blur-[90px] sm:h-80 sm:w-80" />

      <div className="relative space-y-10 sm:space-y-14">

        {audios.map((item, index) => {

          const rotations = [

            "-rotate-[0.45deg]",

            "rotate-[0.35deg]",

            "-rotate-[0.3deg]",

            "rotate-[0.4deg]",

          ];

          const blueRotations = [

            "rotate-[2.5deg]",

            "-rotate-[2deg]",

            "rotate-[2.2deg]",

            "-rotate-[2.5deg]",

          ];

          return (

            <div

              key={item._id}

              className={`group relative ${rotations[index % rotations.length]} transition-all duration-700 hover:z-20 hover:-translate-y-2 hover:rotate-0`}

            >

              <div

                className={`pointer-events-none absolute -bottom-3 left-1/2 h-[92%] w-[94%] -translate-x-1/2 ${blueRotations[index % blueRotations.length]} rounded-[24px] bg-[#56B6D0] shadow-[0_18px_35px_rgba(13,34,53,0.10)] transition-transform duration-700 group-hover:translate-y-1 sm:rounded-[30px]`}

              />

              <div className="pointer-events-none absolute -bottom-2 left-[48%] h-[94%] w-[96%] -translate-x-1/2 rotate-[1deg] rounded-[24px] bg-[#D9F1F5] shadow-[0_12px_28px_rgba(13,34,53,0.06)] sm:rounded-[30px]" />

              <div className="pointer-events-none absolute -bottom-5 left-1/2 h-5 w-[78%] -translate-x-1/2 rounded-full bg-deep-navy/10 blur-[9px]" />

              <div className="relative z-10 overflow-hidden rounded-[22px] border border-[#EAE7E0] bg-[#FEFEFC] p-2 shadow-[0_20px_45px_rgba(13,34,53,0.12)] transition-all duration-700 group-hover:shadow-[0_28px_60px_rgba(13,34,53,0.18)] sm:rounded-[28px] sm:p-3">

                <div className="relative overflow-hidden rounded-[17px] bg-gradient-to-br from-[#07192D] via-[#0D2A47] to-[#123B5D] px-4 py-6 sm:rounded-[22px] sm:px-7 sm:py-8">

                  <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-champagne-gold/[0.10] blur-[75px]" />

                  <div className="pointer-events-none absolute -bottom-28 -left-24 h-64 w-64 rounded-full bg-[#56B6D0]/[0.10] blur-[80px]" />

                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.035] via-transparent to-black/[0.12]" />

                  <div className="relative flex flex-col gap-7 sm:flex-row sm:items-center sm:gap-8">

                    <div className="relative mx-auto shrink-0 sm:mx-0">

                      <div className="absolute -inset-3 rounded-full border border-champagne-gold/15 sm:-inset-4" />

                      <div className="absolute -inset-6 rounded-full border border-white/[0.06] sm:-inset-7" />

                      <div className="absolute inset-0 rounded-full bg-champagne-gold/[0.08] blur-xl" />

                      <div className="relative flex h-[78px] w-[78px] items-center justify-center rounded-full border border-champagne-gold/35 bg-warm-ivory shadow-[0_15px_35px_rgba(0,0,0,0.25)] sm:h-[94px] sm:w-[94px]">

                        <div className="absolute inset-[6px] rounded-full border border-antique-gold/20" />

                        <span className="relative text-[27px] text-antique-gold sm:text-[32px]">

                          ♫

                        </span>

                      </div>

                    </div>

                    <div className="min-w-0 flex-1">

                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">

                        <div className="min-w-0">

                          <p className="text-[7px] font-semibold uppercase tracking-[0.3em] text-champagne-gold/80 sm:text-[9px] sm:tracking-[0.38em]">

                            {t("mediaGallery.voiceMessage")}{" "}

                            {index + 1}

                          </p>

                          <div className="mt-4 flex h-9 items-center gap-[3px] overflow-hidden sm:mt-5 sm:h-11">

                            {Array.from({ length: 42 }).map(

                              (_, waveIndex) => (

                                <span

                                  key={waveIndex}

                                  className="w-[2px] shrink-0 rounded-full bg-champagne-gold/35 transition-all duration-500 group-hover:bg-champagne-gold/65"

                                  style={{

                                    height: `${8 + ((waveIndex * 11) % 27)}px`,

                                  }}

                                />

                              )

                            )}

                          </div>

                        </div>

                        {item.fileSize ? (

                          <div className="flex shrink-0 items-center gap-2 self-start">

                            <span className="h-1 w-1 rounded-full bg-champagne-gold/50" />

                            <p className="text-[8px] tracking-[0.08em] text-premium-silver/55 sm:text-[10px]">

                              {formatFileSize(item.fileSize)}

                            </p>

                          </div>

                        ) : null}

                      </div>

                      <div className="mt-5 rounded-[16px] border border-white/10 bg-black/20 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] sm:mt-6 sm:rounded-[19px] sm:p-2.5">

                        <audio

                          src={getMediaUrl(item.url)}

                          controls

                          preload="metadata"

                          className="h-9 w-full opacity-95 sm:h-10"

                        />

                      </div>

                    </div>

                  </div>

                  <div className="relative mt-7 border-t border-white/10 pt-5 sm:mt-8 sm:pt-6">

                    <div className="flex items-start gap-3 sm:gap-4">

                      <div className="relative mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-champagne-gold/30 bg-champagne-gold/[0.08] text-[8px] text-champagne-gold sm:h-8 sm:w-8 sm:text-[9px]">

                        <span>✦</span>

                      </div>

                      <div className="min-w-0 flex-1">

                        <p className="text-[7px] font-semibold uppercase tracking-[0.25em] text-champagne-gold/65 sm:text-[8px] sm:tracking-[0.32em]">

                          {t("mediaGallery.note")}

                        </p>

                        <p className="mt-2 whitespace-pre-wrap break-words font-serif text-[11px] leading-5 text-soft-white/80 sm:mt-2.5 sm:text-[14px] sm:leading-6">

                          {hasNote(item)

                            ? item.note

                            : t("mediaGallery.noNote")}

                        </p>

                      </div>

                    </div>

                  </div>

                  <div className="pointer-events-none absolute bottom-0 left-1/2 h-px w-1/2 -translate-x-1/2 bg-gradient-to-r from-transparent via-champagne-gold/35 to-transparent" />

                </div>

                <div className="flex items-center justify-center gap-2 py-2 sm:py-3">

                  <span className="h-px w-8 bg-gradient-to-r from-transparent to-champagne-gold/25 sm:w-12" />

                  <span className="text-[7px] text-antique-gold/45 sm:text-[8px]">

                    ✦

                  </span>

                  <span className="h-px w-8 bg-gradient-to-l from-transparent to-champagne-gold/25 sm:w-12" />

                </div>

              </div>

            </div>

          );

        })}

      </div>

    </div>

    <div className="mt-9 flex items-center justify-center gap-2.5 sm:mt-12 sm:gap-3">

      <span className="h-px w-10 bg-gradient-to-r from-transparent to-champagne-gold/25 sm:w-16" />

      <span className="text-[8px] text-antique-gold/50 sm:text-[9px]">

        ✦

      </span>

      <span className="h-px w-10 bg-gradient-to-l from-transparent to-champagne-gold/25 sm:w-16" />

    </div>

  </section>

)}


      {videos.length > 0 && (
        <section className="relative">
          <div className="relative z-10 mb-8 flex items-end justify-between gap-4 sm:mb-10 lg:mb-12">
            <div>
              <div className="flex items-center gap-2.5 sm:gap-3">
                <span className="h-px w-7 bg-gradient-to-r from-transparent to-champagne-gold/70 sm:w-11" />

                <p className="text-[7px] font-semibold uppercase tracking-[0.3em] text-antique-gold sm:text-[9px] sm:tracking-[0.4em]">
                  {t("mediaGallery.approvedVideoMemories")}
                </p>
              </div>

              <h3 className="mt-3 font-serif text-[1.6rem] leading-none tracking-[-0.05em] text-deep-navy sm:mt-4 sm:text-[2.25rem] lg:text-[3rem]">
                {t("mediaGallery.videos")}
              </h3>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-[8px] tracking-[0.16em] text-antique-gold/50 sm:text-[11px] sm:tracking-[0.2em]">
                {String(videos.length).padStart(2, "0")}
              </span>

              <span className="h-px w-7 bg-champagne-gold/25 sm:w-14" />

              <span className="text-[10px] text-antique-gold/55 sm:text-[13px]">
                ▶
              </span>
            </div>
          </div>

          <div className="relative px-1 pb-5 sm:px-3 sm:pb-8">
            <div className="pointer-events-none absolute -left-20 top-16 h-56 w-56 rounded-full bg-[#56B6D0]/[0.06] blur-[90px] sm:h-72 sm:w-72" />

            <div className="pointer-events-none absolute -bottom-20 right-0 h-64 w-64 rounded-full bg-champagne-gold/[0.045] blur-[90px] sm:h-80 sm:w-80" />

            <div className="relative grid gap-12 md:grid-cols-2 md:gap-x-9 md:gap-y-16 lg:gap-x-12 lg:gap-y-20">
              {videos.map((item, index) => {
                const rotations = [
                  "-rotate-[0.9deg]",
                  "rotate-[0.8deg]",
                  "-rotate-[0.65deg]",
                  "rotate-[0.75deg]",
                ];

                const blueRotations = [
                  "rotate-[4deg]",
                  "-rotate-[4deg]",
                  "rotate-[3.5deg]",
                  "-rotate-[3.5deg]",
                ];

                return (
                  <div
                    key={item._id}
                    className={`group relative min-w-0 ${rotations[index % rotations.length]} transition-all duration-700 hover:z-20 hover:-translate-y-2 hover:rotate-0`}
                  >
                    <div
                      className={`pointer-events-none absolute -bottom-3 left-1/2 h-[87%] w-[91%] -translate-x-1/2 ${blueRotations[index % blueRotations.length]} bg-[#56B6D0] shadow-[0_14px_28px_rgba(13,34,53,0.09)]`}
                    />

                    <div className="pointer-events-none absolute -bottom-2 left-[44%] h-[89%] w-[94%] -translate-x-1/2 rotate-[1.5deg] bg-[#D9F1F5] shadow-[0_10px_25px_rgba(13,34,53,0.06)]" />

                    <div className="pointer-events-none absolute -bottom-4 left-1/2 h-4 w-[75%] -translate-x-1/2 rounded-full bg-deep-navy/10 blur-[8px]" />

                    <div className="pointer-events-none absolute -top-[22px] left-1/2 z-30 h-[50px] w-[23px] -translate-x-1/2 sm:-top-[27px] sm:h-[62px] sm:w-[27px]">
                      <div className="absolute left-1/2 top-0 h-[40px] w-[14px] -translate-x-1/2 rounded-t-[9px] border-[3px] border-[#126F9D] border-b-0 sm:h-[49px] sm:w-[17px]" />

                      <div className="absolute left-1/2 top-[22px] h-[26px] w-[14px] -translate-x-[16%] rounded-b-[8px] border-[3px] border-[#126F9D] border-t-0 sm:top-[26px] sm:h-[33px] sm:w-[17px]" />

                      <div className="absolute left-1/2 top-[20px] h-[6px] w-[17px] -translate-x-1/2 rounded-full bg-[#126F9D] sm:top-[24px] sm:h-[7px] sm:w-[20px]" />

                      <div className="absolute left-[4px] top-[2px] h-[15px] w-[3px] rounded-full bg-white/60 blur-[0.5px] sm:h-[18px]" />
                    </div>

                    <div className="relative z-10 bg-[#FEFEFC] p-2 shadow-[0_18px_38px_rgba(13,34,53,0.13)] transition-all duration-700 group-hover:shadow-[0_25px_50px_rgba(13,34,53,0.18)] sm:p-3">
                      <div className="pointer-events-none absolute inset-0 border border-[#EAE7E0]" />

                      <div className="pointer-events-none absolute left-3 top-3 h-4 w-4 border-l border-t border-champagne-gold/20" />

                      <div className="pointer-events-none absolute right-3 top-3 h-4 w-4 border-r border-t border-champagne-gold/20" />

                      <div className="pointer-events-none absolute bottom-3 left-3 h-4 w-4 border-b border-l border-champagne-gold/20" />

                      <div className="pointer-events-none absolute bottom-3 right-3 h-4 w-4 border-b border-r border-champagne-gold/20" />

                      <div className="relative overflow-hidden bg-[#F8F6F1] p-2 sm:p-3">
                        <div className="relative overflow-hidden bg-deep-navy shadow-[0_12px_28px_rgba(13,34,53,0.15)]">
                          <video
                            src={getMediaUrl(item.url)}
                            controls
                            preload="metadata"
                            className="aspect-[4/3] max-h-[500px] w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.018] sm:aspect-video"
                          />

                          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-deep-navy/25 via-transparent to-transparent" />

                          <div className="pointer-events-none absolute left-3 top-3 flex h-6 w-6 items-center justify-center rounded-full border border-white/30 bg-deep-navy/25 text-[7px] text-white/90 backdrop-blur-md sm:left-4 sm:top-4 sm:h-8 sm:w-8 sm:text-[9px]">
                            ▶
                          </div>

                          <div className="pointer-events-none absolute right-3 top-3 text-[7px] font-medium tracking-[0.18em] text-white/70 sm:right-4 sm:top-4 sm:text-[9px] sm:tracking-[0.22em]">
                            {String(index + 1).padStart(2, "0")}
                          </div>
                        </div>

                        <div className="relative mt-4 flex items-start gap-2.5 border-t border-[#DED8CC] pt-4 sm:mt-5 sm:gap-3 sm:pt-5">
                          <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-champagne-gold/30 bg-champagne-gold/[0.08] text-[8px] text-antique-gold sm:h-7 sm:w-7 sm:text-[9px]">
                            ✦
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="text-[7px] font-semibold uppercase tracking-[0.24em] text-antique-gold/75 sm:text-[8px] sm:tracking-[0.3em]">
                              {t("mediaGallery.note")}
                            </p>

                            <p className="mt-1.5 whitespace-pre-wrap break-words font-serif text-[11px] leading-5 text-deep-navy/70 sm:mt-2 sm:text-[14px] sm:leading-6">
                              {hasNote(item)
                                ? item.note
                                : t("mediaGallery.noNote")}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-center gap-2 sm:mt-5">
                          <span className="h-px w-8 bg-champagne-gold/20 sm:w-12" />

                          <span className="text-[7px] text-antique-gold/45 sm:text-[8px]">
                            ✦
                          </span>

                          <span className="h-px w-8 bg-champagne-gold/20 sm:w-12" />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-9 flex items-center justify-center gap-2.5 sm:mt-12 sm:gap-3">
            <span className="h-px w-10 bg-gradient-to-r from-transparent to-champagne-gold/25 sm:w-16" />

            <span className="text-[8px] text-antique-gold/50 sm:text-[9px]">
              ✦
            </span>

            <span className="h-px w-10 bg-gradient-to-l from-transparent to-champagne-gold/25 sm:w-16" />
          </div>
        </section>
      )}

      <div className="flex items-center justify-center gap-3 pt-0.5 sm:gap-4 sm:pt-1">
        <span className="h-px w-12 bg-gradient-to-r from-transparent to-champagne-gold/25 sm:w-20" />

        <span className="text-[9px] text-antique-gold/55 sm:text-[11px]">
          ✦
        </span>

        <span className="h-px w-12 bg-gradient-to-l from-transparent to-champagne-gold/25 sm:w-20" />
      </div>
    </div>
  );
};

export default MediaGallery;