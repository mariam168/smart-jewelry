import { useTranslation } from "react-i18next";
import getMediaUrl from "../utils/mediaUrl";

const formatFileSize = (
  bytes,
) => {
  if (!bytes) {
    return "";
  }

  const mb =
    bytes /
    (1024 * 1024);

  if (
    mb >= 1
  ) {
    return `${mb.toFixed(
      2,
    )} MB`;
  }

  return `${(
    bytes / 1024
  ).toFixed(1)} KB`;
};

const MediaGallery = ({
  media = [],
}) => {
  const { t } = useTranslation();

  const visibleMedia =
    Array.isArray(
      media,
    )
      ? media.filter(
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
      : [];

  if (
    !visibleMedia.length
  ) {
    return (
      <div className="relative flex min-h-[340px] flex-col items-center justify-center overflow-hidden rounded-[32px] border border-light-champagne/80 bg-soft-cream px-6 py-16 text-center shadow-[0_25px_70px_rgba(13,34,53,0.06)]">
        <div className="pointer-events-none absolute -left-32 -top-32 h-72 w-72 rounded-full bg-champagne-gold/[0.055] blur-[90px]" />

        <div className="pointer-events-none absolute -bottom-32 -right-32 h-72 w-72 rounded-full bg-navy-soft/[0.08] blur-[90px]" />

        <div className="relative">
          <div className="absolute -inset-4 rounded-full border border-champagne-gold/10" />

          <div className="absolute -inset-7 rounded-full border border-champagne-gold/[0.05]" />

          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-champagne-gold/25 bg-warm-ivory shadow-[0_15px_40px_rgba(13,34,53,0.08)]">
            <span className="text-[21px] text-antique-gold">
              ✦
            </span>
          </div>
        </div>

        <p className="mt-9 font-serif text-[1.5rem] tracking-[-0.025em] text-deep-navy">
          {t("mediaGallery.noMemories")}
        </p>

        <p className="mt-3 max-w-sm text-[13px] leading-6 text-slate-gray">
          {t("mediaGallery.noMemoriesDescription")}
        </p>

        <div className="mt-7 flex items-center gap-3">
          <span className="h-px w-12 bg-champagne-gold/25" />

          <span className="text-[10px] text-antique-gold">
            ♡
          </span>

          <span className="h-px w-12 bg-champagne-gold/25" />
        </div>
      </div>
    );
  }

  const images =
    visibleMedia.filter(
      (
        item,
      ) =>
        item.type ===
        "image",
    );

  const videos =
    visibleMedia.filter(
      (
        item,
      ) =>
        item.type ===
        "video",
    );

  const audios =
    visibleMedia.filter(
      (
        item,
      ) =>
        item.type ===
        "audio",
    );

  return (
    <div className="space-y-24">
      {images.length >
        0 && (
        <section className="relative">
          <div className="relative z-10 mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <div className="flex items-center gap-3">
                <span className="h-px w-10 bg-gradient-to-r from-transparent to-champagne-gold/70" />

                <p className="text-[9px] font-semibold uppercase tracking-[0.4em] text-antique-gold">
                  {t("mediaGallery.memories")}
                </p>
              </div>

              <h3 className="mt-4 font-serif text-[2.5rem] leading-[0.95] tracking-[-0.045em] text-deep-navy sm:text-[3rem]">
                {t("mediaGallery.photos")}
              </h3>
            </div>

            <div className="flex items-center gap-3 sm:pb-1">
              <span className="text-[11px] tracking-[0.2em] text-antique-gold/50">
                {String(
                  images.length,
                ).padStart(
                  2,
                  "0",
                )}
              </span>

              <span className="h-px w-14 bg-champagne-gold/25" />

              <span className="text-[12px] text-antique-gold/60">
                ✦
              </span>
            </div>
          </div>

          <div className="relative">
            <div className="pointer-events-none absolute -left-28 top-16 h-64 w-64 rounded-full bg-champagne-gold/[0.045] blur-[100px]" />

            <div className="pointer-events-none absolute -bottom-20 right-0 h-72 w-72 rounded-full bg-navy-soft/[0.06] blur-[100px]" />

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-12 lg:auto-rows-[110px]">
              {images.map(
                (
                  item,
                  index,
                ) => {
                  const layouts = [
                    "lg:col-span-7 lg:row-span-5",
                    "lg:col-span-5 lg:row-span-4",
                    "lg:col-span-5 lg:row-span-5",
                    "lg:col-span-7 lg:row-span-4",
                    "lg:col-span-4 lg:row-span-4",
                    "lg:col-span-4 lg:row-span-5",
                    "lg:col-span-4 lg:row-span-4",
                    "lg:col-span-8 lg:row-span-5",
                  ];

                  const rotations = [
                    "lg:-rotate-[0.35deg]",
                    "lg:rotate-[0.3deg]",
                    "lg:-rotate-[0.25deg]",
                    "lg:rotate-[0.25deg]",
                    "lg:-rotate-[0.4deg]",
                    "lg:rotate-[0.35deg]",
                    "lg:-rotate-[0.25deg]",
                    "lg:rotate-[0.2deg]",
                  ];

                  return (
                    <div
                      key={
                        item._id
                      }
                      className={`${layouts[index % layouts.length]} group relative min-h-[300px] sm:min-h-[360px] lg:min-h-0 ${rotations[index % rotations.length]} transition-transform duration-700 hover:z-20 hover:rotate-0`}
                    >
                      <div className="absolute -inset-2 rounded-[30px] bg-champagne-gold/[0.045] opacity-0 blur-md transition-all duration-700 group-hover:opacity-100" />

                      <div className="relative h-full rounded-[27px] border border-light-champagne bg-soft-white p-2 shadow-[0_20px_50px_rgba(13,34,53,0.075)] transition-all duration-700 group-hover:-translate-y-2 group-hover:shadow-[0_35px_85px_rgba(13,34,53,0.16)]">
                        <div className="relative h-full min-h-[284px] overflow-hidden rounded-[21px] bg-soft-cream sm:min-h-[344px] lg:min-h-0">
                          <img
                            src={getMediaUrl(
                              item.url,
                            )}
                            alt={
                              t("mediaGallery.memory")
                            }
                            className="h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.08]"
                            loading="lazy"
                          />

                          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-deep-navy/45 via-transparent to-white/[0.06] opacity-70 transition-opacity duration-700 group-hover:opacity-90" />

                          <div className="pointer-events-none absolute inset-0 rounded-[21px] border border-white/20" />

                          <div className="absolute left-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/30 bg-deep-navy/20 text-[10px] text-white opacity-0 backdrop-blur-md transition-all duration-500 group-hover:opacity-100">
                            ✦
                          </div>

                          <div className="absolute right-4 top-4 text-[10px] font-medium tracking-[0.2em] text-white/70 opacity-0 transition-all duration-500 group-hover:opacity-100">
                            {String(
                              index +
                                1,
                            ).padStart(
                              2,
                              "0",
                            )}
                          </div>

                          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between opacity-0 transition-all duration-500 group-hover:opacity-100">
                            <span className="text-[9px] font-semibold uppercase tracking-[0.28em] text-white/80">
                              {t(
                                "mediaGallery.memory",
                              )}
                            </span>

                            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/30 bg-deep-navy/20 text-[12px] text-white backdrop-blur-md">
                              ♡
                            </span>
                          </div>
                        </div>

                        <div className="pointer-events-none absolute left-5 top-5 h-4 w-4 border-l border-t border-champagne-gold/50" />

                        <div className="pointer-events-none absolute bottom-5 right-5 h-4 w-4 border-b border-r border-champagne-gold/50" />
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          </div>

          <div className="mt-9 flex items-center justify-center gap-3">
            <span className="h-px w-16 bg-gradient-to-r from-transparent to-champagne-gold/25" />

            <span className="text-[9px] text-antique-gold/50">
              ✦
            </span>

            <span className="h-px w-16 bg-gradient-to-l from-transparent to-champagne-gold/25" />
          </div>
        </section>
      )}

      {audios.length >
        0 && (
        <section className="relative">
          <div className="mb-10 flex items-end justify-between gap-5">
            <div>
              <div className="flex items-center gap-3">
                <span className="h-px w-10 bg-gradient-to-r from-transparent to-champagne-gold/70" />

                <p className="text-[9px] font-semibold uppercase tracking-[0.4em] text-antique-gold">
                  {t("mediaGallery.voiceMemories")}
                </p>
              </div>

              <h3 className="mt-4 font-serif text-[2.5rem] leading-[0.95] tracking-[-0.045em] text-deep-navy sm:text-[3rem]">
                {t("mediaGallery.voiceMessages")}
              </h3>
            </div>

            <div className="hidden text-3xl text-champagne-gold/25 sm:block">
              ♫
            </div>
          </div>

          <div className="space-y-5">
            {audios.map(
              (
                item,
                index,
              ) => (
                <div
                  key={
                    item._id
                  }
                  className="group relative overflow-hidden rounded-[30px] bg-luxury-black p-[1px] shadow-[0_25px_65px_rgba(7,19,31,0.12)] transition-all duration-700 hover:-translate-y-1 hover:shadow-[0_35px_85px_rgba(7,19,31,0.19)]"
                >
                  <div className="relative overflow-hidden rounded-[29px] border border-champagne-gold/10">
                    <div className="pointer-events-none absolute -right-28 -top-28 h-72 w-72 rounded-full bg-champagne-gold/[0.055] blur-[90px]" />

                    <div className="pointer-events-none absolute -bottom-32 -left-24 h-64 w-64 rounded-full bg-navy-soft/35 blur-[90px]" />

                    <div className="relative flex flex-col gap-7 px-6 py-7 sm:flex-row sm:items-center sm:px-9 sm:py-8">
                      <div className="relative mx-auto shrink-0 sm:mx-0">
                        <div className="absolute -inset-3 animate-[spin_18s_linear_infinite] rounded-full border border-dashed border-champagne-gold/15" />

                        <div className="absolute -inset-1 rounded-full border border-champagne-gold/20" />

                        <div className="flex h-[76px] w-[76px] items-center justify-center rounded-full bg-midnight-navy shadow-[0_15px_40px_rgba(0,0,0,0.3)]">
                          <span className="text-[23px] text-champagne-gold">
                            ♫
                          </span>
                        </div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="mb-4 flex items-center justify-between gap-5">
                          <div>
                            <p className="text-[9px] font-semibold uppercase tracking-[0.3em] text-champagne-gold">
                              {t(
                                "mediaGallery.voiceMessage",
                              )}{" "}
                              {index +
                                1}
                            </p>

                            <div className="mt-3 flex h-7 items-center gap-[3px]">
                              {Array.from(
                                {
                                  length: 36,
                                },
                              ).map(
                                (
                                  _,
                                  waveIndex,
                                ) => (
                                  <span
                                    key={
                                      waveIndex
                                    }
                                    className="w-[2px] rounded-full bg-champagne-gold/30 transition-all duration-500 group-hover:bg-champagne-gold/60"
                                    style={{
                                      height: `${
                                        5 +
                                        ((waveIndex * 11) %
                                          18)
                                      }px`,
                                    }}
                                  />
                                ),
                              )}
                            </div>
                          </div>

                          {item.fileSize ? (
                            <p className="shrink-0 text-[10px] text-polished-silver/35">
                              {formatFileSize(
                                item.fileSize,
                              )}
                            </p>
                          ) : null}
                        </div>

                        <audio
                          src={getMediaUrl(
                            item.url,
                          )}
                          controls
                          preload="metadata"
                          className="w-full opacity-90"
                        />
                      </div>
                    </div>

                    <div className="pointer-events-none absolute bottom-0 left-1/2 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-champagne-gold/25 to-transparent" />
                  </div>
                </div>
              ),
            )}
          </div>
        </section>
      )}

      {videos.length >
        0 && (
        <section className="relative">
          <div className="mb-10 flex items-end justify-between gap-5">
            <div>
              <div className="flex items-center gap-3">
                <span className="h-px w-10 bg-gradient-to-r from-transparent to-champagne-gold/70" />

                <p className="text-[9px] font-semibold uppercase tracking-[0.4em] text-antique-gold">
                  {t("mediaGallery.approvedVideoMemories")}
                </p>
              </div>

              <h3 className="mt-4 font-serif text-[2.5rem] leading-[0.95] tracking-[-0.045em] text-deep-navy sm:text-[3rem]">
                {t("mediaGallery.videos")}
              </h3>
            </div>

            <div className="hidden items-center gap-3 sm:flex">
              <span className="h-px w-14 bg-champagne-gold/25" />

              <span className="text-[10px] text-antique-gold/60">
                ▶
              </span>
            </div>
          </div>

          <div className="grid gap-7 md:grid-cols-2">
            {videos.map(
              (
                item,
                index,
              ) => (
                <div
                  key={
                    item._id
                  }
                  className="group relative overflow-hidden rounded-[30px] bg-luxury-black p-1 shadow-[0_25px_60px_rgba(7,19,31,0.13)] transition-all duration-700 hover:-translate-y-1 hover:shadow-[0_35px_85px_rgba(7,19,31,0.2)]"
                >
                  <div className="relative overflow-hidden rounded-[26px] bg-black">
                    <video
                      src={getMediaUrl(
                        item.url,
                      )}
                      controls
                      preload="metadata"
                      className="max-h-[560px] w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.025]"
                    />

                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-deep-navy/30 via-transparent to-transparent opacity-70" />

                    <div className="absolute left-5 top-5 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-deep-navy/35 text-[10px] text-champagne-gold opacity-0 backdrop-blur-md transition-all duration-500 group-hover:opacity-100">
                      ✦
                    </div>

                    <div className="absolute right-5 top-5 text-[10px] font-medium tracking-[0.22em] text-white/60 opacity-0 transition-all duration-500 group-hover:opacity-100">
                      {String(
                        index +
                          1,
                      ).padStart(
                        2,
                        "0",
                      )}
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>
        </section>
      )}

      <div className="flex items-center justify-center gap-4 pt-1">
        <span className="h-px w-20 bg-gradient-to-r from-transparent to-champagne-gold/25" />

        <span className="text-[11px] text-antique-gold/55">
          ✦
        </span>

        <span className="h-px w-20 bg-gradient-to-l from-transparent to-champagne-gold/25" />
      </div>
    </div>
  );
};

export default MediaGallery;