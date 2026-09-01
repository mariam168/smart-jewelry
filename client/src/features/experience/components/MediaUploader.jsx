import {
  useMemo,
  useRef,
  useState,
} from "react";

const DEFAULT_LIMITS = {
  imageLimit: 5,
  videoLimit: 5,
  audioLimit: 5,
  fileLimit: 5,
};

const getFileType = (file) => {
  const type =
    String(
      file?.type || "",
    );

  if (
    type.startsWith(
      "image/",
    )
  ) {
    return "image";
  }

  if (
    type.startsWith(
      "video/",
    )
  ) {
    return "video";
  }

  if (
    type.startsWith(
      "audio/",
    )
  ) {
    return "audio";
  }

  return "file";
};

const getLimitKey = (type) => {
  switch (type) {
    case "image":
      return "imageLimit";

    case "video":
      return "videoLimit";

    case "audio":
      return "audioLimit";

    default:
      return "fileLimit";
  }
};

const getTypeLabel = (type) => {
  switch (type) {
    case "image":
      return "Images";

    case "video":
      return "Videos";

    case "audio":
      return "Audio";

    default:
      return "Files";
  }
};

const MediaUploader = ({
  uploadFiles,
  mediaLimits = DEFAULT_LIMITS,
  currentMedia = [],
}) => {
  const [
    files,
    setFiles,
  ] = useState([]);

  const [
    isDragging,
    setIsDragging,
  ] = useState(false);

  const [
    limitMessage,
    setLimitMessage,
  ] = useState("");

  const [
    uploading,
    setUploading,
  ] = useState(false);

  const inputRef =
    useRef(null);

  const limits = {
    ...DEFAULT_LIMITS,
    ...(mediaLimits || {}),
  };

  const currentCounts =
    useMemo(() => {
      const counts = {
        image: 0,
        video: 0,
        audio: 0,
        file: 0,
      };

      if (
        !Array.isArray(
          currentMedia,
        )
      ) {
        return counts;
      }

      currentMedia.forEach(
        (item) => {
          const type =
            item?.type;

          if (
            Object.prototype.hasOwnProperty.call(
              counts,
              type,
            )
          ) {
            counts[type] += 1;
          }
        },
      );

      return counts;
    }, [currentMedia]);

  const selectedCounts =
    useMemo(() => {
      const counts = {
        image: 0,
        video: 0,
        audio: 0,
        file: 0,
      };

      files.forEach(
        (file) => {
          counts[
            getFileType(file)
          ] += 1;
        },
      );

      return counts;
    }, [files]);

  const addFiles = (
    newFiles,
  ) => {
    if (
      !newFiles.length
    ) {
      return;
    }

    const runningCounts = {
      image:
        currentCounts.image +
        selectedCounts.image,

      video:
        currentCounts.video +
        selectedCounts.video,

      audio:
        currentCounts.audio +
        selectedCounts.audio,

      file:
        currentCounts.file +
        selectedCounts.file,
    };

    const accepted = [];

    const rejected = [];

    newFiles.forEach(
      (file) => {
        const type =
          getFileType(file);

        const limitKey =
          getLimitKey(type);

        const limit =
          Number(
            limits[
              limitKey
            ] ?? 0,
          );

        if (
          runningCounts[
            type
          ] >= limit
        ) {
          rejected.push(
            `${file.name} (${getTypeLabel(
              type,
            )} limit: ${limit})`,
          );

          return;
        }

        runningCounts[
          type
        ] += 1;

        accepted.push(
          file,
        );
      },
    );

    if (
      accepted.length
    ) {
      setFiles(
        (previous) => [
          ...previous,
          ...accepted,
        ],
      );
    }

    if (
      rejected.length
    ) {
      setLimitMessage(
        `${rejected.length} file(s) were not added because the Admin media limit has been reached.`,
      );
    } else {
      setLimitMessage("");
    }
  };

  const handleSelect = (
    event,
  ) => {
    const selected =
      Array.from(
        event.target.files ||
          [],
      );

    addFiles(
      selected,
    );

    event.target.value =
      "";
  };

  const handleDrop = (
    event,
  ) => {
    event.preventDefault();

    setIsDragging(false);

    const dropped =
      Array.from(
        event.dataTransfer
          .files || [],
      );

    addFiles(
      dropped,
    );
  };

  const handleDragOver = (
    event,
  ) => {
    event.preventDefault();

    setIsDragging(true);
  };

  const handleDragLeave = (
    event,
  ) => {
    event.preventDefault();

    setIsDragging(false);
  };

  const removeFile = (
    index,
  ) => {
    setFiles(
      (previous) =>
        previous.filter(
          (_, itemIndex) =>
            itemIndex !== index,
        ),
    );

    setLimitMessage("");
  };

  const clearFiles = () => {
    setFiles([]);

    setLimitMessage("");
  };

  const handleUpload = async () => {
    if (!files.length) {
      alert(
        "Please select files first",
      );

      return;
    }

    try {
      setUploading(true);

      await uploadFiles(
        files,
      );

      setFiles([]);

      setLimitMessage("");
    } catch (error) {
      console.error(
        "Upload failed:",
        error,
      );

      const message =
        error?.response?.data
          ?.message ||
        "Upload failed.";

      setLimitMessage(
        message,
      );
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (
    size,
  ) => {
    if (
      size < 1024
    ) {
      return `${size} B`;
    }

    if (
      size <
      1024 * 1024
    ) {
      return `${(
        size / 1024
      ).toFixed(1)} KB`;
    }

    return `${(
      size /
      1024 /
      1024
    ).toFixed(2)} MB`;
  };

  const limitCards = [
    {
      type: "image",
      label: "Images",
      current:
        currentCounts.image,
      selected:
        selectedCounts.image,
      limit:
        Number(
          limits.imageLimit ??
            0,
        ),
    },

    {
      type: "video",
      label: "Videos",
      current:
        currentCounts.video,
      selected:
        selectedCounts.video,
      limit:
        Number(
          limits.videoLimit ??
            0,
        ),
    },

    {
      type: "audio",
      label: "Audio",
      current:
        currentCounts.audio,
      selected:
        selectedCounts.audio,
      limit:
        Number(
          limits.audioLimit ??
            0,
        ),
    },

    {
      type: "file",
      label: "Files",
      current:
        currentCounts.file,
      selected:
        selectedCounts.file,
      limit:
        Number(
          limits.fileLimit ??
            0,
        ),
    },
  ];

  return (
    <section className="relative overflow-hidden rounded-[28px] border border-light-champagne/90 bg-soft-white/90 shadow-[0_20px_60px_rgba(7,19,31,0.06)] md:rounded-[32px]">
      <div className="pointer-events-none absolute -right-36 -top-36 h-80 w-80 rounded-full border border-champagne-gold/[0.08]" />

      <div className="pointer-events-none absolute -bottom-44 -left-36 h-96 w-96 rounded-full bg-soft-cream blur-[100px]" />

      <div className="relative overflow-hidden border-b border-light-champagne/80 bg-warm-ivory/45 px-6 py-8 sm:px-8 lg:px-10 lg:py-9">
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-classic-gold/70" />

            <span className="text-[10px] font-semibold uppercase tracking-[0.32em] text-antique-gold">
              Memories
            </span>
          </div>

          <h2 className="mt-4 font-serif text-[2.25rem] font-normal leading-tight tracking-[-0.035em] text-deep-navy sm:text-[2.7rem]">
            Add Your Media
          </h2>

          <p className="mt-3 max-w-2xl text-[13px] leading-7 text-slate-gray">
            Add photos, videos, audio, or documents to your jewelry experience.
          </p>
        </div>
      </div>

      <div className="relative px-6 py-7 sm:px-8 sm:py-9 lg:px-10 lg:py-10">
        <div className="mb-7 grid grid-cols-2 gap-3 md:grid-cols-4">
          {limitCards.map(
            (item) => {
              const used =
                item.current +
                item.selected;

              const full =
                used >=
                item.limit;

              return (
                <div
                  key={
                    item.type
                  }
                  className={`rounded-[16px] border p-4 ${
                    full
                      ? "border-antique-gold/30 bg-soft-cream"
                      : "border-light-champagne bg-warm-ivory/50"
                  }`}
                >
                  <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-steel-gray">
                    {
                      item.label
                    }
                  </p>

                  <div className="mt-2 flex items-end gap-1">
                    <span className="font-serif text-[1.45rem] text-midnight-navy">
                      {used}
                    </span>

                    <span className="pb-1 text-[10px] text-steel-gray">
                      /{" "}
                      {
                        item.limit
                      }
                    </span>
                  </div>

                  {item.selected >
                    0 && (
                    <p className="mt-1 text-[8px] text-antique-gold">
                      +
                      {
                        item.selected
                      }{" "}
                      selected
                    </p>
                  )}
                </div>
              );
            },
          )}
        </div>

        {limitMessage && (
          <div className="mb-6 rounded-[15px] border border-antique-gold/25 bg-soft-cream px-4 py-3 text-[11px] leading-5 text-antique-gold">
            {limitMessage}
          </div>
        )}

        <div
          onDragOver={
            handleDragOver
          }
          onDragLeave={
            handleDragLeave
          }
          onDrop={
            handleDrop
          }
          className={`relative overflow-hidden rounded-[24px] border border-dashed px-6 py-14 text-center transition-all duration-300 ${
            isDragging
              ? "border-classic-gold bg-light-champagne/70"
              : "border-champagne-gold/35 bg-warm-ivory/60 hover:border-classic-gold/65 hover:bg-soft-cream/80"
          }`}
        >
          <input
            ref={
              inputRef
            }
            type="file"
            multiple
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.zip,.rar"
            onChange={
              handleSelect
            }
            className="hidden"
          />

          <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-champagne-gold/25 bg-soft-cream">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-midnight-navy text-champagne-gold">
              ↑
            </div>
          </div>

          <h3 className="mt-6 font-serif text-[1.35rem] text-deep-navy">
            {isDragging
              ? "Drop your files here"
              : "Add photos and memories"}
          </h3>

          <p className="mx-auto mt-2 max-w-md text-[13px] leading-7 text-slate-gray">
            The maximum number of each media type is controlled by the administrator.
          </p>

          <button
            type="button"
            onClick={() =>
              inputRef.current?.click()
            }
            className="mt-7 inline-flex min-h-[46px] items-center justify-center rounded-[13px] border border-champagne-gold/35 bg-soft-white px-7 text-[11px] font-semibold text-antique-gold transition-all hover:bg-midnight-navy hover:text-soft-white"
          >
            Choose Files
          </button>
        </div>

        {files.length > 0 && (
          <div className="mt-9">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-deep-navy">
                  Selected Files
                </h3>

                <p className="mt-2 text-[12px] text-slate-gray">
                  {
                    files.length
                  }{" "}
                  file(s) ready
                </p>
              </div>

              <button
                type="button"
                onClick={
                  clearFiles
                }
                className="text-[10px] font-semibold uppercase text-antique-gold"
              >
                Clear all
              </button>
            </div>

            <div className="space-y-3">
              {files.map(
                (
                  file,
                  index,
                ) => {
                  const type =
                    getFileType(
                      file,
                    );

                  return (
                    <div
                      key={`${file.name}-${index}`}
                      className="flex items-center gap-4 rounded-[18px] border border-light-champagne bg-warm-ivory/55 p-4"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[13px] bg-midnight-navy text-[9px] uppercase text-champagne-gold">
                        {
                          type
                        }
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[12px] font-semibold text-deep-navy">
                          {
                            file.name
                          }
                        </p>

                        <p className="mt-1 text-[10px] text-slate-gray">
                          {formatFileSize(
                            file.size,
                          )}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          removeFile(
                            index,
                          )
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-full text-steel-gray hover:bg-soft-cream hover:text-antique-gold"
                      >
                        ×
                      </button>
                    </div>
                  );
                },
              )}
            </div>

            <button
              type="button"
              onClick={
                handleUpload
              }
              disabled={
                uploading
              }
              className="mt-7 inline-flex min-h-[48px] w-full items-center justify-center rounded-[13px] bg-midnight-navy px-7 text-[11px] font-semibold text-soft-white disabled:opacity-50"
            >
              {uploading
                ? "Uploading..."
                : "Upload Files"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default MediaUploader;