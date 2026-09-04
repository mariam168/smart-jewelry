import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  requestVideoUpload,
} from "../services/experienceApi";

const DEFAULT_LIMITS = {
  imageLimit: 5,
  videoLimit: 5,
  audioLimit: 5,
};

/*
 * 01223358023
 * Egypt international WhatsApp format.
 */
const WHATSAPP_NUMBER =
  "201223358023";

const buildWhatsAppUrl = ({
  requesterName,
  requesterPhone,
  serialNumber,
  requestId,
}) => {
  const message = [
    "Hello JEVORYA, I requested video upload access for my jewelry experience.",

    requesterName
      ? `Name: ${requesterName}`
      : "",

    requesterPhone
      ? `Phone: ${requesterPhone}`
      : "",

    serialNumber
      ? `Serial: ${serialNumber}`
      : "",

    requestId
      ? `Request ID: ${requestId}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    message,
  )}`;
};

const getRecordingExtension = (
  mimeType = "",
) => {
  if (
    mimeType.includes(
      "mp4",
    )
  ) {
    return "m4a";
  }

  if (
    mimeType.includes(
      "ogg",
    )
  ) {
    return "ogg";
  }

  return "webm";
};

const getSupportedAudioMimeType =
  () => {
    if (
      typeof MediaRecorder ===
      "undefined"
    ) {
      return "";
    }

    const candidates = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/ogg;codecs=opus",
      "audio/mp4",
    ];

    return (
      candidates.find(
        (
          type,
        ) =>
          MediaRecorder.isTypeSupported(
            type,
          ),
      ) || ""
    );
  };

const MediaUploader = ({
  token,
  uploadFiles,
  mediaLimits = DEFAULT_LIMITS,
  currentMedia = [],
  videoAccess = null,
  serialNumber = "",
  onRefresh,
}) => {
  const [
    selectedImages,
    setSelectedImages,
  ] = useState([]);

  const [
    selectedVideos,
    setSelectedVideos,
  ] = useState([]);

  const [
    uploadingImages,
    setUploadingImages,
  ] = useState(false);

  const [
    uploadingVideo,
    setUploadingVideo,
  ] = useState(false);

  const [
    uploadingAudio,
    setUploadingAudio,
  ] = useState(false);

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  const [
    isRecording,
    setIsRecording,
  ] = useState(false);

  const [
    recordingSeconds,
    setRecordingSeconds,
  ] = useState(0);

  const [
    audioBlob,
    setAudioBlob,
  ] = useState(null);

  const [
    audioUrl,
    setAudioUrl,
  ] = useState("");

  const [
    videoRequestForm,
    setVideoRequestForm,
  ] = useState({
    requesterName:
      videoAccess
        ?.requesterName ||
      "",

    requesterPhone:
      videoAccess
        ?.requesterPhone ||
      "",

    message:
      videoAccess
        ?.message ||
      "",
  });

  const [
    requestingVideo,
    setRequestingVideo,
  ] = useState(false);

  const imageInputRef =
    useRef(null);

  const videoInputRef =
    useRef(null);

  const mediaRecorderRef =
    useRef(null);

  const recordingStreamRef =
    useRef(null);

  const recordedChunksRef =
    useRef([]);

  const timerRef =
    useRef(null);

  const limits = {
    ...DEFAULT_LIMITS,
    ...(mediaLimits ||
      {}),
  };

  const counts =
    useMemo(() => {
      const result = {
        image: 0,
        audio: 0,
        video: 0,
      };

      if (
        !Array.isArray(
          currentMedia,
        )
      ) {
        return result;
      }

      currentMedia.forEach(
        (
          item,
        ) => {
          if (
            Object.prototype.hasOwnProperty.call(
              result,
              item?.type,
            )
          ) {
            result[
              item.type
            ] += 1;
          }
        },
      );

      return result;
    }, [currentMedia]);

  const approvedVideoLimit =
    Number(
      videoAccess
        ?.approvedVideoLimit ||
        0,
    );

  const effectiveVideoLimit =
    Math.min(
      Number(
        limits.videoLimit ||
          0,
      ),
      approvedVideoLimit,
    );

  const canUploadVideo =
    videoAccess?.status ===
      "approved" &&
    effectiveVideoLimit >
      0;

  const imageRemaining =
    Math.max(
      Number(
        limits.imageLimit ||
          0,
      ) -
        counts.image,
      0,
    );

  const audioRemaining =
    Math.max(
      Number(
        limits.audioLimit ||
          0,
      ) -
        counts.audio,
      0,
    );

  const videoRemaining =
    canUploadVideo
      ? Math.max(
          effectiveVideoLimit -
            counts.video,
          0,
        )
      : 0;

  useEffect(() => {
    setVideoRequestForm(
      (
        previous,
      ) => ({
        requesterName:
          videoAccess
            ?.requesterName ??
          previous.requesterName,

        requesterPhone:
          videoAccess
            ?.requesterPhone ??
          previous.requesterPhone,

        message:
          videoAccess
            ?.message ??
          previous.message,
      }),
    );
  }, [
    videoAccess
      ?.requesterName,

    videoAccess
      ?.requesterPhone,

    videoAccess
      ?.message,
  ]);

  useEffect(() => {
    return () => {
      if (
        audioUrl
      ) {
        URL.revokeObjectURL(
          audioUrl,
        );
      }

      if (
        timerRef.current
      ) {
        window.clearInterval(
          timerRef.current,
        );
      }

      if (
        recordingStreamRef.current
      ) {
        recordingStreamRef.current
          .getTracks()
          .forEach(
            (
              track,
            ) =>
              track.stop(),
          );
      }
    };
  }, [audioUrl]);

  const clearAlerts =
    () => {
      setMessage("");
      setError("");
    };

  const handleImageSelection =
    (
      event,
    ) => {
      clearAlerts();

      const selected =
        Array.from(
          event.target
            .files ||
            [],
        ).filter(
          (
            file,
          ) =>
            String(
              file.type ||
                "",
            ).startsWith(
              "image/",
            ),
        );

      if (
        selected.length >
        imageRemaining
      ) {
        setError(
          `You can add only ${imageRemaining} more photo(s) to this experience.`,
        );

        event.target.value =
          "";

        return;
      }

      setSelectedImages(
        selected,
      );

      event.target.value =
        "";
    };

  const handleUploadImages =
    async () => {
      if (
        !selectedImages.length
      ) {
        return;
      }

      try {
        setUploadingImages(
          true,
        );

        clearAlerts();

        await uploadFiles(
          selectedImages,
        );

        setSelectedImages(
          [],
        );

        setMessage(
          "Photos uploaded successfully.",
        );

        if (
          onRefresh
        ) {
          await onRefresh();
        }
      } catch (
        uploadError
      ) {
        setError(
          uploadError?.response
            ?.data
            ?.message ||
            uploadError
              ?.message ||
            "Unable to upload photos.",
        );
      } finally {
        setUploadingImages(
          false,
        );
      }
    };

  const startRecording =
    async () => {
      clearAlerts();

      if (
        audioRemaining <=
        0
      ) {
        setError(
          "You have reached the voice-message limit.",
        );

        return;
      }

      if (
        typeof navigator ===
          "undefined" ||
        !navigator
          .mediaDevices
          ?.getUserMedia ||
        typeof MediaRecorder ===
          "undefined"
      ) {
        setError(
          "Audio recording is not supported by this browser. Please use a current browser and allow microphone access.",
        );

        return;
      }

      try {
        if (
          audioUrl
        ) {
          URL.revokeObjectURL(
            audioUrl,
          );
        }

        setAudioUrl("");
        setAudioBlob(null);

        setRecordingSeconds(
          0,
        );

        recordedChunksRef.current =
          [];

        const stream =
          await navigator.mediaDevices.getUserMedia(
            {
              audio: true,
            },
          );

        recordingStreamRef.current =
          stream;

        const mimeType =
          getSupportedAudioMimeType();

        const recorder =
          mimeType
            ? new MediaRecorder(
                stream,
                {
                  mimeType,
                },
              )
            : new MediaRecorder(
                stream,
              );

        mediaRecorderRef.current =
          recorder;

        recorder.ondataavailable =
          (
            event,
          ) => {
            if (
              event.data &&
              event.data
                .size > 0
            ) {
              recordedChunksRef.current.push(
                event.data,
              );
            }
          };

        recorder.onstop =
          () => {
            const finalMimeType =
              recorder.mimeType ||
              recordedChunksRef
                .current?.[0]
                ?.type ||
              "audio/webm";

            const blob =
              new Blob(
                recordedChunksRef.current,
                {
                  type:
                    finalMimeType,
                },
              );

            const previewUrl =
              URL.createObjectURL(
                blob,
              );

            setAudioBlob(
              blob,
            );

            setAudioUrl(
              previewUrl,
            );

            setIsRecording(
              false,
            );

            if (
              timerRef.current
            ) {
              window.clearInterval(
                timerRef.current,
              );

              timerRef.current =
                null;
            }

            if (
              recordingStreamRef.current
            ) {
              recordingStreamRef.current
                .getTracks()
                .forEach(
                  (
                    track,
                  ) =>
                    track.stop(),
                );

              recordingStreamRef.current =
                null;
            }
          };

        recorder.start(
          250,
        );

        setIsRecording(
          true,
        );

        timerRef.current =
          window.setInterval(
            () => {
              setRecordingSeconds(
                (
                  seconds,
                ) =>
                  seconds +
                  1,
              );
            },
            1000,
          );
      } catch (
        recordingError
      ) {
        console.error(
          "AUDIO RECORDING ERROR:",
          recordingError,
        );

        setError(
          "Microphone access could not be started. Please allow microphone permission and try again.",
        );
      }
    };

  const stopRecording =
    () => {
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current
          .state !==
          "inactive"
      ) {
        mediaRecorderRef.current.stop();
      }
    };

  const discardRecording =
    () => {
      if (
        audioUrl
      ) {
        URL.revokeObjectURL(
          audioUrl,
        );
      }

      setAudioUrl("");
      setAudioBlob(null);

      setRecordingSeconds(
        0,
      );
    };

  const uploadRecording =
    async () => {
      if (
        !audioBlob
      ) {
        return;
      }

      try {
        setUploadingAudio(
          true,
        );

        clearAlerts();

        const extension =
          getRecordingExtension(
            audioBlob.type,
          );

        const audioFile =
          new File(
            [audioBlob],

            `voice-message-${Date.now()}.${extension}`,

            {
              type:
                audioBlob.type ||
                "audio/webm",
            },
          );

        await uploadFiles([
          audioFile,
        ]);

        discardRecording();

        setMessage(
          "Voice message saved successfully.",
        );

        if (
          onRefresh
        ) {
          await onRefresh();
        }
      } catch (
        uploadError
      ) {
        setError(
          uploadError?.response
            ?.data
            ?.message ||
            uploadError
              ?.message ||
            "Unable to save voice message.",
        );
      } finally {
        setUploadingAudio(
          false,
        );
      }
    };

  const handleVideoRequestChange =
    (
      event,
    ) => {
      const {
        name,
        value,
      } = event.target;

      setVideoRequestForm(
        (
          previous,
        ) => ({
          ...previous,

          [name]:
            value,
        }),
      );
    };

  const handleRequestVideo =
    async (
      event,
    ) => {
      event.preventDefault();

      clearAlerts();

      if (
        !videoRequestForm.requesterName.trim()
      ) {
        setError(
          "Please enter your name for the video request.",
        );

        return;
      }

      if (
        !videoRequestForm.requesterPhone.trim()
      ) {
        setError(
          "Please enter a phone number for the video request.",
        );

        return;
      }

      try {
        setRequestingVideo(
          true,
        );

        const request =
          await requestVideoUpload(
            token,
            {
              requesterName:
                videoRequestForm.requesterName,

              requesterPhone:
                videoRequestForm.requesterPhone,

              message:
                videoRequestForm.message,
            },
          );

        setMessage(
          "Your request was sent to the admin dashboard. WhatsApp will open so you can contact JEVORYA directly.",
        );

        if (
          onRefresh
        ) {
          await onRefresh();
        }

        const whatsappUrl =
          buildWhatsAppUrl({
            requesterName:
              videoRequestForm.requesterName,

            requesterPhone:
              videoRequestForm.requesterPhone,

            serialNumber,

            requestId:
              request?.requestId,
          });

        window.open(
          whatsappUrl,
          "_blank",
          "noopener,noreferrer",
        );
      } catch (
        requestError
      ) {
        setError(
          requestError?.response
            ?.data
            ?.message ||
            requestError
              ?.message ||
            "Unable to send video upload request.",
        );
      } finally {
        setRequestingVideo(
          false,
        );
      }
    };

  const handleVideoSelection =
    (
      event,
    ) => {
      clearAlerts();

      const selected =
        Array.from(
          event.target
            .files ||
            [],
        ).filter(
          (
            file,
          ) =>
            String(
              file.type ||
                "",
            ).startsWith(
              "video/",
            ),
        );

      if (
        selected.length >
        videoRemaining
      ) {
        setError(
          `Your approval allows only ${videoRemaining} more video(s).`,
        );

        event.target.value =
          "";

        return;
      }

      setSelectedVideos(
        selected,
      );

      event.target.value =
        "";
    };

  const handleUploadVideos =
    async () => {
      if (
        !selectedVideos.length
      ) {
        return;
      }

      try {
        setUploadingVideo(
          true,
        );

        clearAlerts();

        await uploadFiles(
          selectedVideos,
        );

        setSelectedVideos(
          [],
        );

        setMessage(
          "Approved video uploaded successfully.",
        );

        if (
          onRefresh
        ) {
          await onRefresh();
        }
      } catch (
        uploadError
      ) {
        setError(
          uploadError?.response
            ?.data
            ?.message ||
            uploadError
              ?.message ||
            "Unable to upload video.",
        );
      } finally {
        setUploadingVideo(
          false,
        );
      }
    };

  const formatRecordingTime =
    (
      seconds,
    ) => {
      const minutes =
        Math.floor(
          seconds / 60,
        )
          .toString()
          .padStart(
            2,
            "0",
          );

      const remainingSeconds =
        (
          seconds %
          60
        )
          .toString()
          .padStart(
            2,
            "0",
          );

      return `${minutes}:${remainingSeconds}`;
    };

  return (
    <section className="relative overflow-hidden rounded-[28px] border border-light-champagne/90 bg-soft-white/90 shadow-[0_20px_60px_rgba(7,19,31,0.06)] md:rounded-[32px]">
      <div className="border-b border-light-champagne/80 bg-warm-ivory/45 px-6 py-8 sm:px-8 lg:px-10">
        <div className="flex items-center gap-3">
          <span className="h-px w-8 bg-classic-gold/70" />

          <span className="text-[10px] font-semibold uppercase tracking-[0.32em] text-antique-gold">
            Memories
          </span>
        </div>

        <h2 className="mt-4 font-serif text-[2.25rem] font-normal tracking-[-0.035em] text-deep-navy sm:text-[2.7rem]">
          Add Your Memories
        </h2>

        <p className="mt-3 max-w-2xl text-[13px] leading-7 text-slate-gray">
          Add photos, record a voice message directly, or request approval for
          video uploads.
        </p>
      </div>

      <div className="space-y-7 px-6 py-7 sm:px-8 sm:py-9 lg:px-10 lg:py-10">
        {error && (
          <div className="rounded-[15px] border border-red-200 bg-red-50 px-4 py-3 text-[11px] leading-5 text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="rounded-[15px] border border-champagne-gold/30 bg-soft-cream px-4 py-3 text-[11px] leading-5 text-antique-gold">
            {message}
          </div>
        )}

        <section className="rounded-[22px] border border-light-champagne bg-warm-ivory/45 p-5 sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-antique-gold">
                Photos
              </p>

              <h3 className="mt-2 font-serif text-[1.65rem] text-deep-navy">
                Upload Photos
              </h3>

              <p className="mt-2 text-[11px] leading-5 text-slate-gray">
                {counts.image} of{" "}
                {limits.imageLimit} used ·{" "}
                {imageRemaining} remaining
              </p>
            </div>

            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={
                handleImageSelection
              }
              className="hidden"
            />

            <button
              type="button"
              onClick={() =>
                imageInputRef.current?.click()
              }
              disabled={
                imageRemaining <=
                  0 ||
                uploadingImages
              }
              className="min-h-[44px] rounded-[13px] bg-midnight-navy px-6 text-[10px] font-semibold text-soft-white transition hover:bg-rich-navy disabled:cursor-not-allowed disabled:opacity-45"
            >
              Choose Photos
            </button>
          </div>

          {selectedImages.length >
            0 && (
            <div className="mt-5 rounded-[16px] border border-light-champagne bg-soft-white p-4">
              <p className="text-[10px] font-semibold text-deep-navy">
                {selectedImages.length} photo(s) selected
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {selectedImages.map(
                  (
                    file,
                    index,
                  ) => (
                    <span
                      key={`${file.name}-${index}`}
                      className="max-w-full truncate rounded-full bg-warm-ivory px-3 py-1.5 text-[9px] text-slate-gray"
                    >
                      {file.name}
                    </span>
                  ),
                )}
              </div>

              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={
                    handleUploadImages
                  }
                  disabled={
                    uploadingImages
                  }
                  className="rounded-[12px] bg-classic-gold px-5 py-2.5 text-[10px] font-semibold text-deep-navy disabled:opacity-50"
                >
                  {uploadingImages
                    ? "Uploading..."
                    : "Upload Photos"}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedImages(
                      [],
                    )
                  }
                  disabled={
                    uploadingImages
                  }
                  className="rounded-[12px] border border-light-champagne px-5 py-2.5 text-[10px] text-slate-gray"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </section>

        <section className="rounded-[22px] border border-light-champagne bg-soft-white p-5 sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-antique-gold">
                Voice Message
              </p>

              <h3 className="mt-2 font-serif text-[1.65rem] text-deep-navy">
                Record Your Voice
              </h3>

              <p className="mt-2 text-[11px] leading-5 text-slate-gray">
                Voice messages must be recorded here. Audio-file upload is not
                available.
              </p>

              <p className="mt-1 text-[10px] text-steel-gray">
                {counts.audio} of{" "}
                {limits.audioLimit} used ·{" "}
                {audioRemaining} remaining
              </p>
            </div>

            {!isRecording ? (
              <button
                type="button"
                onClick={
                  startRecording
                }
                disabled={
                  audioRemaining <=
                    0 ||
                  uploadingAudio
                }
                className="min-h-[44px] rounded-[13px] bg-midnight-navy px-6 text-[10px] font-semibold text-soft-white transition hover:bg-rich-navy disabled:cursor-not-allowed disabled:opacity-45"
              >
                Start Recording
              </button>
            ) : (
              <button
                type="button"
                onClick={
                  stopRecording
                }
                className="min-h-[44px] rounded-[13px] bg-red-600 px-6 text-[10px] font-semibold text-white"
              >
                Stop ·{" "}
                {formatRecordingTime(
                  recordingSeconds,
                )}
              </button>
            )}
          </div>

          {audioUrl &&
            audioBlob && (
            <div className="mt-5 rounded-[16px] border border-champagne-gold/25 bg-warm-ivory/60 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-antique-gold">
                Recording Preview
              </p>

              <audio
                src={audioUrl}
                controls
                className="mt-4 w-full"
              />

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={
                    uploadRecording
                  }
                  disabled={
                    uploadingAudio
                  }
                  className="rounded-[12px] bg-classic-gold px-5 py-2.5 text-[10px] font-semibold text-deep-navy disabled:opacity-50"
                >
                  {uploadingAudio
                    ? "Saving..."
                    : "Save Voice Message"}
                </button>

                <button
                  type="button"
                  onClick={
                    discardRecording
                  }
                  disabled={
                    uploadingAudio
                  }
                  className="rounded-[12px] border border-light-champagne bg-soft-white px-5 py-2.5 text-[10px] text-slate-gray"
                >
                  Discard
                </button>
              </div>
            </div>
          )}
        </section>

        <section className="rounded-[22px] border border-champagne-gold/25 bg-deep-navy p-5 text-soft-white sm:p-6">
          <div className="flex items-start justify-between gap-5">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-champagne-gold">
                Video Memories
              </p>

              <h3 className="mt-2 font-serif text-[1.65rem] text-soft-white">
                Video Upload Requires Approval
              </h3>

              <p className="mt-2 max-w-2xl text-[11px] leading-6 text-premium-silver/80">
                Videos are not available as a normal upload. Send a request
                first. The request appears in the admin dashboard, and JEVORYA
                can enable video upload for this experience.
              </p>
            </div>

            <span className="rounded-full border border-champagne-gold/25 bg-soft-white/[0.06] px-3 py-1.5 text-[8px] font-semibold uppercase tracking-[0.12em] text-champagne-gold">
              {videoAccess?.status ===
              "approved"
                ? "Approved"
                : videoAccess?.status ===
                    "pending"
                  ? "Pending"
                  : videoAccess?.status ===
                      "rejected"
                    ? "Not Approved"
                    : "Approval Required"}
            </span>
          </div>

          {canUploadVideo ? (
            <div className="mt-6 rounded-[17px] border border-champagne-gold/20 bg-soft-white/[0.055] p-5">
              <p className="text-[11px] font-semibold text-soft-white">
                Video upload is enabled for this experience.
              </p>

              <p className="mt-2 text-[10px] text-premium-silver/70">
                {counts.video} of{" "}
                {effectiveVideoLimit} approved video(s) used ·{" "}
                {videoRemaining} remaining
              </p>

              <input
                ref={
                  videoInputRef
                }
                type="file"
                accept="video/*"
                multiple
                onChange={
                  handleVideoSelection
                }
                className="hidden"
              />

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() =>
                    videoInputRef.current?.click()
                  }
                  disabled={
                    videoRemaining <=
                      0 ||
                    uploadingVideo
                  }
                  className="rounded-[12px] bg-champagne-gold px-5 py-2.5 text-[10px] font-semibold text-deep-navy disabled:opacity-45"
                >
                  Choose Approved Video
                </button>
              </div>

              {selectedVideos.length >
                0 && (
                <div className="mt-4 rounded-[14px] border border-soft-white/10 bg-soft-white/[0.04] p-4">
                  <p className="text-[10px] text-premium-silver">
                    {selectedVideos.length} video(s) selected
                  </p>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={
                        handleUploadVideos
                      }
                      disabled={
                        uploadingVideo
                      }
                      className="rounded-[12px] bg-classic-gold px-5 py-2.5 text-[10px] font-semibold text-deep-navy disabled:opacity-50"
                    >
                      {uploadingVideo
                        ? "Uploading..."
                        : "Upload Video"}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setSelectedVideos(
                          [],
                        )
                      }
                      disabled={
                        uploadingVideo
                      }
                      className="rounded-[12px] border border-soft-white/15 px-5 py-2.5 text-[10px] text-premium-silver"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <form
              onSubmit={
                handleRequestVideo
              }
              className="mt-6 grid gap-4 rounded-[17px] border border-soft-white/10 bg-soft-white/[0.045] p-5 md:grid-cols-2"
            >
              <div>
                <label className="mb-2 block text-[8px] font-semibold uppercase tracking-[0.16em] text-premium-silver/70">
                  Your Name
                </label>

                <input
                  name="requesterName"
                  value={
                    videoRequestForm.requesterName
                  }
                  onChange={
                    handleVideoRequestChange
                  }
                  placeholder="Your name"
                  className="h-[46px] w-full rounded-[12px] border border-soft-white/10 bg-soft-white/[0.06] px-4 text-[11px] text-soft-white outline-none placeholder:text-premium-silver/35 focus:border-champagne-gold/50"
                />
              </div>

              <div>
                <label className="mb-2 block text-[8px] font-semibold uppercase tracking-[0.16em] text-premium-silver/70">
                  WhatsApp / Phone
                </label>

                <input
                  name="requesterPhone"
                  value={
                    videoRequestForm.requesterPhone
                  }
                  onChange={
                    handleVideoRequestChange
                  }
                  placeholder="01xxxxxxxxx"
                  className="h-[46px] w-full rounded-[12px] border border-soft-white/10 bg-soft-white/[0.06] px-4 text-[11px] text-soft-white outline-none placeholder:text-premium-silver/35 focus:border-champagne-gold/50"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-[8px] font-semibold uppercase tracking-[0.16em] text-premium-silver/70">
                  Note
                </label>

                <textarea
                  name="message"
                  rows={3}
                  value={
                    videoRequestForm.message
                  }
                  onChange={
                    handleVideoRequestChange
                  }
                  placeholder="Tell us briefly what video you would like to add."
                  className="w-full resize-none rounded-[12px] border border-soft-white/10 bg-soft-white/[0.06] px-4 py-3 text-[11px] leading-5 text-soft-white outline-none placeholder:text-premium-silver/35 focus:border-champagne-gold/50"
                />
              </div>

              {videoAccess?.status ===
                "pending" && (
                <div className="md:col-span-2 rounded-[12px] border border-champagne-gold/20 bg-champagne-gold/[0.06] px-4 py-3 text-[10px] leading-5 text-champagne-gold">
                  Your previous request is pending. Sending again will update
                  the request information and keep it pending for admin review.
                </div>
              )}

              {videoAccess?.status ===
                "rejected" && (
                <div className="md:col-span-2 rounded-[12px] border border-red-300/15 bg-red-300/[0.06] px-4 py-3 text-[10px] leading-5 text-red-100">
                  The previous request was not approved. You can update the
                  information and submit another request.
                  {videoAccess?.adminNote
                    ? ` Admin note: ${videoAccess.adminNote}`
                    : ""}
                </div>
              )}

              <div className="md:col-span-2 flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  disabled={
                    requestingVideo
                  }
                  className="min-h-[44px] rounded-[12px] bg-champagne-gold px-6 text-[10px] font-semibold text-deep-navy disabled:opacity-50"
                >
                  {requestingVideo
                    ? "Sending Request..."
                    : "Request Video Access + WhatsApp"}
                </button>

                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[44px] rounded-[12px] border border-soft-white/15 px-6 py-3 text-[10px] font-semibold text-premium-silver transition hover:border-champagne-gold/40 hover:text-champagne-gold"
                >
                  Contact JEVORYA on WhatsApp
                </a>
              </div>
            </form>
          )}
        </section>
      </div>
    </section>
  );
};

export default MediaUploader;