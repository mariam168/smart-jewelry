import { useRef, useState } from "react";

const MediaUploader = ({ uploadFiles }) => {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  const inputRef = useRef(null);

  const handleSelect = (e) => {
    const selectedFiles = Array.from(e.target.files || []);

    if (!selectedFiles.length) {
      return;
    }

    setFiles((prev) => [...prev, ...selectedFiles]);

    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();

    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files || []);

    if (!droppedFiles.length) {
      return;
    }

    setFiles((prev) => [...prev, ...droppedFiles]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const clearFiles = () => {
    setFiles([]);
  };

  const handleUpload = async () => {
    if (!files.length) {
      alert("Please select files first");
      return;
    }

    try {
      await uploadFiles(files);

      setFiles([]);
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  const formatFileSize = (size) => {
    if (size < 1024) {
      return `${size} B`;
    }

    if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    }

    return `${(size / 1024 / 1024).toFixed(2)} MB`;
  };

  const getFileType = (file) => {
    if (file.type.startsWith("image/")) {
      return "Image";
    }

    if (file.type.startsWith("video/")) {
      return "Video";
    }

    if (file.type.startsWith("audio/")) {
      return "Audio";
    }

    return "File";
  };

  return (
    <section className="relative overflow-hidden rounded-[28px] border border-light-champagne/90 bg-soft-white/90 shadow-[0_20px_60px_rgba(7,19,31,0.06)] md:rounded-[32px]">
      <div className="pointer-events-none absolute -right-36 -top-36 h-80 w-80 rounded-full border border-champagne-gold/[0.08]" />

      <div className="pointer-events-none absolute -bottom-44 -left-36 h-96 w-96 rounded-full bg-soft-cream blur-[100px]" />

      <div className="relative overflow-hidden border-b border-light-champagne/80 bg-warm-ivory/45 px-6 py-8 sm:px-8 lg:px-10 lg:py-9">
        <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-light-champagne/60 blur-[10px]" />

        <div className="absolute right-10 top-10 text-5xl text-classic-gold/10">
          ✦
        </div>

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
            Add photos, videos, audio, or other files to make this jewelry
            experience more personal.
          </p>
        </div>
      </div>

      <div className="relative px-6 py-7 sm:px-8 sm:py-9 lg:px-10 lg:py-10">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative overflow-hidden rounded-[24px] border border-dashed px-6 py-14 text-center transition-all duration-300 ${
            isDragging
              ? "border-classic-gold bg-light-champagne/70 shadow-[0_12px_35px_rgba(201,162,77,0.08)]"
              : "border-champagne-gold/35 bg-warm-ivory/60 hover:border-classic-gold/65 hover:bg-soft-cream/80"
          }`}
        >
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-classic-gold/[0.05] blur-[90px]" />

          <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full border border-champagne-gold/[0.08]" />

          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.zip,.rar"
            onChange={handleSelect}
            className="hidden"
          />

          <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-champagne-gold/25 bg-soft-cream shadow-[0_10px_28px_rgba(7,19,31,0.04)]">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-midnight-navy text-champagne-gold shadow-[0_7px_18px_rgba(18,38,58,0.14)]">
              <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
                <path
                  d="M12 16V4"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />

                <path
                  d="M7.5 8.5L12 4L16.5 8.5"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                <path
                  d="M5 14.5V18C5 19.1 5.9 20 7 20H17C18.1 20 19 19.1 19 18V14.5"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          <h3 className="relative mt-6 font-serif text-[1.35rem] font-normal tracking-[-0.02em] text-deep-navy">
            {isDragging ? "Drop your files here" : "Add photos and memories"}
          </h3>

          <p className="relative mx-auto mt-2 max-w-md text-[13px] leading-7 text-slate-gray">
            Drag and drop your files here, or choose files from your device.
          </p>

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="relative mt-7 inline-flex min-h-[46px] items-center justify-center rounded-[13px] border border-champagne-gold/35 bg-soft-white px-7 text-[11px] font-semibold text-antique-gold shadow-[0_7px_18px_rgba(7,19,31,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:border-classic-gold hover:bg-midnight-navy hover:text-soft-white hover:shadow-[0_12px_28px_rgba(18,38,58,0.14)] active:scale-[0.98]"
          >
            Choose Files
          </button>

          <p className="relative mt-5 text-[10px] font-medium uppercase tracking-[0.16em] text-steel-gray">
            Images · Videos · Audio · Documents
          </p>
        </div>

        {files.length > 0 && (
          <div className="mt-9">
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <span className="h-px w-6 bg-classic-gold/70" />

                  <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-deep-navy">
                    Selected Files
                  </h3>
                </div>

                <p className="mt-2 text-[12px] text-slate-gray">
                  {files.length} {files.length === 1 ? "file" : "files"} ready
                  to upload
                </p>
              </div>

              <button
                type="button"
                onClick={clearFiles}
                className="w-fit text-[10px] font-semibold uppercase tracking-[0.12em] text-antique-gold transition-colors duration-300 hover:text-classic-gold"
              >
                Clear all
              </button>
            </div>

            <div className="space-y-3">
              {files.map((file, index) => {
                const isImage = file.type.startsWith("image/");

                const previewUrl = isImage ? URL.createObjectURL(file) : null;

                return (
                  <div
                    key={`${file.name}-${index}`}
                    className="group flex items-center gap-4 rounded-[20px] border border-light-champagne/90 bg-warm-ivory/55 p-3 transition-all duration-300 hover:border-champagne-gold/45 hover:bg-soft-white hover:shadow-[0_8px_24px_rgba(7,19,31,0.04)]"
                  >
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-[15px] border border-light-champagne bg-soft-cream shadow-[0_5px_15px_rgba(7,19,31,0.03)]">
                      {previewUrl ? (
                        <img
                          src={previewUrl}
                          alt={file.name}
                          className="h-full w-full object-cover"
                          onLoad={() => URL.revokeObjectURL(previewUrl)}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            className="h-6 w-6 text-antique-gold"
                          >
                            <path
                              d="M7 3H14L19 8V21H7C5.9 21 5 20.1 5 19V5C5 3.9 5.9 3 7 3Z"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinejoin="round"
                            />

                            <path
                              d="M14 3V8H19"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-deep-navy">
                        {file.name}
                      </p>

                      <div className="mt-1.5 flex flex-wrap items-center gap-2">
                        <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-antique-gold">
                          {getFileType(file)}
                        </span>

                        <span className="text-premium-silver">•</span>

                        <span className="text-[11px] text-slate-gray">
                          {formatFileSize(file.size)}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-transparent text-steel-gray transition-all duration-300 hover:border-champagne-gold/25 hover:bg-soft-cream hover:text-antique-gold"
                      aria-label={`Remove ${file.name}`}
                    >
                      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                        <path
                          d="M6 6L18 18"
                          stroke="currentColor"
                          strokeWidth="1.7"
                          strokeLinecap="round"
                        />

                        <path
                          d="M18 6L6 18"
                          stroke="currentColor"
                          strokeWidth="1.7"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="mt-7 flex flex-col gap-5 border-t border-light-champagne/80 pt-7 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-champagne-gold/25 bg-soft-cream text-[9px] text-antique-gold">
                  ✦
                </div>

                <p className="max-w-sm text-[11px] leading-5 text-slate-gray">
                  Your selected memories will be added to this jewelry
                  experience.
                </p>
              </div>

              <button
                type="button"
                onClick={handleUpload}
                className="inline-flex min-h-[48px] items-center justify-center gap-2.5 rounded-[13px] bg-midnight-navy px-7 text-[11px] font-semibold text-soft-white shadow-[0_10px_25px_rgba(18,38,58,0.15)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-rich-navy hover:shadow-[0_15px_35px_rgba(18,38,58,0.22)] active:scale-[0.98]"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-4 w-4 text-champagne-gold"
                >
                  <path
                    d="M12 16V4"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  />

                  <path
                    d="M7.5 8.5L12 4L16.5 8.5"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  <path
                    d="M5 14.5V18C5 19.1 5.9 20 7 20H17C18.1 20 19 19.1 19 18V14.5"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  />
                </svg>
                Upload Files
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default MediaUploader;
