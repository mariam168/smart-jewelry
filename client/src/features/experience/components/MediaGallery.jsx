const BACKEND_URL = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.replace("/api", "") 
  : "http://localhost:5000";

const getMediaUrl = (url) => {
  if (!url) {
    return "";
  }

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  if (url.startsWith("/")) {
    return `${BACKEND_URL}${url}`;
  }

  return `${BACKEND_URL}/${url}`;
};

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

const MediaGallery = ({ media = [] }) => {
  if (!media.length) {
    return (
      <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-[28px] border border-light-champagne/80 bg-soft-white/70 px-6 py-16 text-center shadow-[0_16px_45px_rgba(7,19,31,0.045)]">
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full border border-champagne-gold/10" />

        <div className="pointer-events-none absolute -bottom-28 -left-24 h-64 w-64 rounded-full bg-soft-cream blur-[85px]" />

        <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-champagne-gold/25 bg-warm-ivory shadow-[0_8px_22px_rgba(7,19,31,0.04)]">
          <span className="text-[17px] text-antique-gold">✦</span>
        </div>

        <p className="relative mt-5 font-serif text-[1.4rem] font-normal tracking-[-0.02em] text-deep-navy">
          No memories have been added yet.
        </p>

        <p className="relative mt-2 max-w-sm text-[13px] leading-6 text-slate-gray">
          Photos, videos, voice messages and files will appear here once they
          are added to this experience.
        </p>
      </div>
    );
  }

  const images = media.filter((item) => item.type === "image");

  const videos = media.filter((item) => item.type === "video");

  const audios = media.filter((item) => item.type === "audio");

  const files = media.filter((item) => item.type === "file");

  return (
    <div className="space-y-14">
      {images.length > 0 && (
        <section>
          <div className="mb-7 flex items-end justify-between gap-5">
            <div>
              <div className="flex items-center gap-3">
                <span className="h-px w-8 bg-classic-gold/70" />

                <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-antique-gold">
                  Memories
                </p>
              </div>

              <h3 className="mt-3 font-serif text-[2.25rem] font-normal tracking-[-0.035em] text-deep-navy md:text-[2.7rem]">
                Photos
              </h3>
            </div>

            <span className="hidden rounded-full border border-light-champagne bg-soft-white px-4 py-2 text-[11px] font-medium text-steel-gray sm:block">
              {images.length} {images.length === 1 ? "photo" : "photos"}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((item) => {
              const imageUrl = getMediaUrl(item.url);

              return (
                <div
                  key={item._id}
                  className="group overflow-hidden rounded-[24px] border border-light-champagne/90 bg-soft-white shadow-[0_12px_35px_rgba(13,34,53,0.055)] transition-all duration-500 hover:-translate-y-1 hover:border-champagne-gold/45 hover:shadow-[0_20px_45px_rgba(13,34,53,0.10)]"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-soft-cream">
                    <div className="absolute inset-0 z-10 bg-gradient-to-t from-deep-navy/25 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                    <img
                      src={imageUrl}
                      alt={item.fileName || "Memory"}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />

                    <div className="absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-soft-white/70 bg-soft-white/85 text-[10px] text-antique-gold opacity-0 shadow-[0_5px_15px_rgba(7,19,31,0.08)] backdrop-blur-md transition-all duration-300 group-hover:opacity-100">
                      ✦
                    </div>
                  </div>

                  {item.fileName && (
                    <div className="border-t border-light-champagne/75 bg-soft-white px-4 py-4">
                      <p className="truncate text-[13px] font-semibold text-deep-navy">
                        {item.fileName}
                      </p>

                      {item.fileSize && (
                        <p className="mt-1.5 text-[11px] text-slate-gray">
                          {formatFileSize(item.fileSize)}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {videos.length > 0 && (
        <section>
          <div className="mb-7">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-classic-gold/70" />

              <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-antique-gold">
                Memories
              </p>
            </div>

            <h3 className="mt-3 font-serif text-[2.25rem] font-normal tracking-[-0.035em] text-deep-navy md:text-[2.7rem]">
              Videos
            </h3>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {videos.map((item) => (
              <div
                key={item._id}
                className="group overflow-hidden rounded-[24px] border border-rich-navy bg-deep-navy shadow-[0_16px_40px_rgba(13,34,53,0.16)] transition-all duration-300 hover:-translate-y-1 hover:border-classic-gold/30 hover:shadow-[0_22px_50px_rgba(13,34,53,0.22)]"
              >
                <div className="relative bg-midnight-navy">
                  <video
                    src={getMediaUrl(item.url)}
                    controls
                    preload="metadata"
                    className="max-h-[500px] w-full bg-deep-navy"
                  />
                </div>

                {item.fileName && (
                  <div className="border-t border-soft-white/10 bg-gradient-to-r from-midnight-navy to-rich-navy px-5 py-4">
                    <p className="truncate text-[13px] font-semibold text-soft-white">
                      {item.fileName}
                    </p>

                    {item.fileSize && (
                      <p className="mt-1 text-[11px] text-premium-silver">
                        {formatFileSize(item.fileSize)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {audios.length > 0 && (
        <section>
          <div className="mb-7">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-classic-gold/70" />

              <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-antique-gold">
                Memories
              </p>
            </div>

            <h3 className="mt-3 font-serif text-[2.25rem] font-normal tracking-[-0.035em] text-deep-navy md:text-[2.7rem]">
              Voice Messages
            </h3>
          </div>

          <div className="space-y-4">
            {audios.map((item) => (
              <div
                key={item._id}
                className="group relative overflow-hidden rounded-[24px] border border-light-champagne/90 bg-soft-white p-5 shadow-[0_10px_30px_rgba(13,34,53,0.045)] transition-all duration-300 hover:-translate-y-0.5 hover:border-champagne-gold/45 hover:shadow-[0_16px_38px_rgba(13,34,53,0.08)]"
              >
                <div className="pointer-events-none absolute -right-20 -top-20 h-44 w-44 rounded-full bg-soft-cream blur-[60px]" />

                <div className="relative mb-5 flex items-center gap-4">
                  <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-deep-navy text-soft-white shadow-[0_8px_22px_rgba(13,34,53,0.16)]">
                    <span className="text-[16px]">🎙</span>

                    <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-soft-white bg-classic-gold" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-deep-navy">
                      {item.fileName || "Voice Message"}
                    </p>

                    {item.fileSize && (
                      <p className="mt-1 text-[11px] text-slate-gray">
                        {formatFileSize(item.fileSize)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="relative rounded-[16px] border border-light-champagne/90 bg-warm-ivory/70 p-3">
                  <audio
                    src={getMediaUrl(item.url)}
                    controls
                    className="w-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {files.length > 0 && (
        <section>
          <div className="mb-7">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-classic-gold/70" />

              <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-antique-gold">
                Memories
              </p>
            </div>

            <h3 className="mt-3 font-serif text-[2.25rem] font-normal tracking-[-0.035em] text-deep-navy md:text-[2.7rem]">
              Attachments
            </h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {files.map((item) => (
              <a
                key={item._id}
                href={getMediaUrl(item.url)}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center gap-4 rounded-[22px] border border-light-champagne/90 bg-soft-white p-5 shadow-[0_8px_24px_rgba(13,34,53,0.035)] transition-all duration-300 hover:-translate-y-1 hover:border-champagne-gold/45 hover:bg-warm-ivory hover:shadow-[0_15px_35px_rgba(13,34,53,0.075)]"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[15px] border border-premium-silver bg-silver-mist text-[15px] text-nfc-dark transition-all duration-300 group-hover:border-classic-gold/30 group-hover:bg-deep-navy group-hover:text-champagne-gold">
                  📎
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-deep-navy">
                    {item.fileName || "Attachment"}
                  </p>

                  {item.fileSize && (
                    <p className="mt-1 text-[11px] text-slate-gray">
                      {formatFileSize(item.fileSize)}
                    </p>
                  )}
                </div>

                <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-antique-gold transition-colors group-hover:text-classic-gold">
                  Open
                </span>
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default MediaGallery;
