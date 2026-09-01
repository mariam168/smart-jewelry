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
  if (!media.length) {
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
          Photos, videos, voice messages and files will appear here once they are added.
        </p>
      </div>
    );
  }

  const images =
    media.filter(
      (item) =>
        item.type ===
        "image",
    );

  const videos =
    media.filter(
      (item) =>
        item.type ===
        "video",
    );

  const audios =
    media.filter(
      (item) =>
        item.type ===
        "audio",
    );

  const files =
    media.filter(
      (item) =>
        item.type ===
        "file",
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
              (item) => (
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

      {videos.length >
        0 && (
        <section>
          <h3 className="mb-7 font-serif text-[2.25rem] text-deep-navy">
            Videos
          </h3>

          <div className="grid gap-6 md:grid-cols-2">
            {videos.map(
              (item) => (
                <div
                  key={
                    item._id
                  }
                  className="overflow-hidden rounded-[24px] border border-rich-navy bg-deep-navy"
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

      {audios.length >
        0 && (
        <section>
          <h3 className="mb-7 font-serif text-[2.25rem] text-deep-navy">
            Voice Messages
          </h3>

          <div className="space-y-4">
            {audios.map(
              (item) => (
                <div
                  key={
                    item._id
                  }
                  className="rounded-[24px] border border-light-champagne bg-soft-white p-5"
                >
                  <p className="mb-4 text-[13px] font-semibold text-deep-navy">
                    {item.fileName ||
                      "Voice Message"}
                  </p>

                  <audio
                    src={getMediaUrl(
                      item.url,
                    )}
                    controls
                    className="w-full"
                  />
                </div>
              ),
            )}
          </div>
        </section>
      )}

      {files.length >
        0 && (
        <section>
          <h3 className="mb-7 font-serif text-[2.25rem] text-deep-navy">
            Attachments
          </h3>

          <div className="grid gap-4 sm:grid-cols-2">
            {files.map(
              (item) => (
                <a
                  key={
                    item._id
                  }
                  href={getMediaUrl(
                    item.url,
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-4 rounded-[22px] border border-light-champagne bg-soft-white p-5"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-[15px] bg-silver-mist">
                    📎
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-deep-navy">
                      {item.fileName ||
                        "Attachment"}
                    </p>

                    <p className="mt-1 text-[11px] text-slate-gray">
                      {formatFileSize(
                        item.fileSize,
                      )}
                    </p>
                  </div>

                  <span className="text-[9px] font-semibold uppercase text-antique-gold">
                    Open
                  </span>
                </a>
              ),
            )}
          </div>
        </section>
      )}
    </div>
  );
};

export default MediaGallery;