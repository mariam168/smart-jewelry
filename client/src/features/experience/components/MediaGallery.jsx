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
      <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-[28px] border border-light-champagne/80 bg-soft-white/70 px-6 py-16 text-center shadow-[0_16px_45px_rgba(7,19,31,0.045)]">
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-champagne-gold/25 bg-warm-ivory">
          <span className="text-[17px] text-antique-gold">
            ✦
          </span>
        </div>

        <p className="mt-5 font-serif text-[1.4rem] text-deep-navy">
          No memories have been added yet.
        </p>

        <p className="mt-2 max-w-sm text-[13px] leading-6 text-slate-gray">
          Photos, voice messages and approved videos will appear here.
        </p>
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
    <div className="space-y-14">
      {images.length >
        0 && (
        <section>
          <div className="mb-7">
            <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-antique-gold">
              Memories
            </p>

            <h3 className="mt-3 font-serif text-[2.25rem] text-deep-navy">
              Photos
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {images.map(
              (
                item,
              ) => (
                <div
                  key={
                    item._id
                  }
                  className="overflow-hidden rounded-[24px] border border-light-champagne bg-soft-white shadow-[0_12px_35px_rgba(13,34,53,0.055)]"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-soft-cream">
                    <img
                      src={getMediaUrl(
                        item.url,
                      )}
                      alt={
                        item.fileName ||
                        "Memory"
                      }
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  {item.fileName && (
                    <div className="border-t border-light-champagne px-4 py-4">
                      <p className="truncate text-[13px] font-semibold text-deep-navy">
                        {
                          item.fileName
                        }
                      </p>

                      <p className="mt-1 text-[11px] text-slate-gray">
                        {formatFileSize(
                          item.fileSize,
                        )}
                      </p>
                    </div>
                  )}
                </div>
              ),
            )}
          </div>
        </section>
      )}

      {audios.length >
        0 && (
        <section>
          <div className="mb-7">
            <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-antique-gold">
              Voice Memories
            </p>

            <h3 className="mt-3 font-serif text-[2.25rem] text-deep-navy">
              Voice Messages
            </h3>
          </div>

          <div className="space-y-4">
            {audios.map(
              (
                item,
                index,
              ) => (
                <div
                  key={
                    item._id
                  }
                  className="rounded-[24px] border border-light-champagne bg-soft-white p-5 shadow-[0_10px_30px_rgba(13,34,53,0.04)]"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-midnight-navy text-champagne-gold">
                      ♫
                    </div>

                    <div>
                      <p className="text-[13px] font-semibold text-deep-navy">
                        Voice Message{" "}
                        {index +
                          1}
                      </p>

                      {item.fileSize ? (
                        <p className="mt-1 text-[10px] text-slate-gray">
                          {formatFileSize(
                            item.fileSize,
                          )}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <audio
                    src={getMediaUrl(
                      item.url,
                    )}
                    controls
                    preload="metadata"
                    className="w-full"
                  />
                </div>
              ),
            )}
          </div>
        </section>
      )}

      {videos.length >
        0 && (
        <section>
          <div className="mb-7">
            <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-antique-gold">
              Approved Video Memories
            </p>

            <h3 className="mt-3 font-serif text-[2.25rem] text-deep-navy">
              Videos
            </h3>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {videos.map(
              (
                item,
              ) => (
                <div
                  key={
                    item._id
                  }
                  className="overflow-hidden rounded-[24px] border border-rich-navy bg-deep-navy shadow-[0_14px_35px_rgba(7,19,31,0.12)]"
                >
                  <video
                    src={getMediaUrl(
                      item.url,
                    )}
                    controls
                    preload="metadata"
                    className="max-h-[500px] w-full"
                  />

                  {item.fileName && (
                    <div className="px-5 py-4 text-soft-white">
                      <p className="truncate text-[13px] font-semibold">
                        {
                          item.fileName
                        }
                      </p>
                    </div>
                  )}
                </div>
              ),
            )}
          </div>
        </section>
      )}
    </div>
  );
};

export default MediaGallery;