import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  requestMediaAllowance,
  updateMediaNote,
  deleteMedia,
  replaceMedia,
} from "../services/experienceApi";

import getMediaUrl from "../utils/mediaUrl";

const DEFAULT_LIMITS = {
  imageLimit: 5,
  videoLimit: 5,
  audioLimit: 5,
};

const WHATSAPP_NUMBER = "201554923541";

const MediaUploader = ({
  token,
  uploadFiles,
  mediaLimits = DEFAULT_LIMITS,
  mediaRequests = [],
  currentMedia = [],
  videoAccess = null,
  serialNumber = "",
  onRefresh,
}) => {
  const { t } = useTranslation();

  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const replaceInputRef = useRef(null);

  const audioRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedVideos, setSelectedVideos] = useState([]);

  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingVideos, setUploadingVideos] = useState(false);

  const [recording, setRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [uploadingAudio, setUploadingAudio] = useState(false);

  const [replaceTarget, setReplaceTarget] = useState(null);
  const [replacing, setReplacing] = useState(false);

  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingNote, setEditingNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  const [requestType, setRequestType] = useState(null);
  const [requestAmount, setRequestAmount] = useState(1);
  const [requestMessage, setRequestMessage] = useState("");
  const [requestingAllowance, setRequestingAllowance] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [requesterName, setRequesterName] = useState("");
  const [requesterPhone, setRequesterPhone] = useState("");

  const limits = useMemo(
    () => ({
      ...DEFAULT_LIMITS,
      ...(mediaLimits || {}),
    }),
    [mediaLimits],
  );

  const approvedExtras = useMemo(() => {
    const result = {
      image: 0,
      audio: 0,
      video: 0,
    };

    if (Array.isArray(mediaRequests)) {
      mediaRequests.forEach((request) => {
        if (request?.status !== "approved") {
          return;
        }

        const type = request?.mediaType;

        if (!["image", "audio", "video"].includes(type)) {
          return;
        }

        result[type] += Number(request?.approvedExtraLimit || 0);
      });
    }

    const source =
      mediaLimits?.approvedExtraLimits || mediaLimits?.approvedExtras || {};

    if (result.image === 0 && Number(source.image || 0) > 0) {
      result.image = Number(source.image);
    }

    if (result.audio === 0 && Number(source.audio || 0) > 0) {
      result.audio = Number(source.audio);
    }

    if (result.video === 0 && Number(source.video || 0) > 0) {
      result.video = Number(source.video);
    }

    if (
      result.image === 0 &&
      Number(mediaLimits?.approvedExtraImageLimit || 0) > 0
    ) {
      result.image = Number(mediaLimits.approvedExtraImageLimit);
    }

    if (
      result.audio === 0 &&
      Number(mediaLimits?.approvedExtraAudioLimit || 0) > 0
    ) {
      result.audio = Number(mediaLimits.approvedExtraAudioLimit);
    }

    if (
      result.video === 0 &&
      Number(mediaLimits?.approvedExtraVideoLimit || 0) > 0
    ) {
      result.video = Number(mediaLimits.approvedExtraVideoLimit);
    }

    if (
      result.video === 0 &&
      Number(videoAccess?.approvedExtraLimit || 0) > 0
    ) {
      result.video = Number(videoAccess.approvedExtraLimit);
    }

    if (
      result.video === 0 &&
      Number(videoAccess?.approvedVideoLimit || 0) > 0
    ) {
      result.video = Number(videoAccess.approvedVideoLimit);
    }

    return result;
  }, [mediaRequests, mediaLimits, videoAccess]);

  const effectiveLimits = useMemo(
    () => ({
      image: Number(limits.imageLimit || 0) + approvedExtras.image,
      audio: Number(limits.audioLimit || 0) + approvedExtras.audio,
      video: Number(limits.videoLimit || 0) + approvedExtras.video,
    }),
    [limits, approvedExtras],
  );

  const imageMedia = useMemo(
    () => currentMedia.filter((item) => item?.type === "image"),
    [currentMedia],
  );

  const videoMedia = useMemo(
    () => currentMedia.filter((item) => item?.type === "video"),
    [currentMedia],
  );

  const audioMedia = useMemo(
    () => currentMedia.filter((item) => item?.type === "audio"),
    [currentMedia],
  );

  const imageUsed = imageMedia.length;
  const videoUsed = videoMedia.length;
  const audioUsed = audioMedia.length;

  const imageRemaining = Math.max(effectiveLimits.image - imageUsed, 0);
  const videoRemaining = Math.max(effectiveLimits.video - videoUsed, 0);
  const audioRemaining = Math.max(effectiveLimits.audio - audioUsed, 0);

  const hasReachedImageLimit = imageRemaining <= 0;
  const hasReachedVideoLimit = videoRemaining <= 0;
  const hasReachedAudioLimit = audioRemaining <= 0;

  const videoApprovedExtra = Number(
    videoAccess?.approvedExtraLimit || approvedExtras.video || 0,
  );

  const videoStatus =
    videoAccess?.status === "approved" || videoApprovedExtra > 0
      ? "approved"
      : videoAccess?.status || null;

  const canUploadVideo = videoStatus === "approved" && videoRemaining > 0;

  useEffect(() => {
    console.log("MEDIA REQUESTS:", mediaRequests);
    console.log("APPROVED EXTRAS:", approvedExtras);
    console.log("EFFECTIVE LIMITS:", effectiveLimits);
  }, [mediaRequests, approvedExtras, effectiveLimits]);

  useEffect(() => {
    return () => {
      if (audioRecorderRef.current) {
        try {
          audioRecorderRef.current.stop();
        } catch {}
      }
    };
  }, []);

  useEffect(() => {
    if (!recording) return;

    const interval = setInterval(() => {
      setRecordingTime((previous) => previous + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [recording]);

  const clearMessages = () => {
    setMessage("");
    setError("");
  };

  const showSuccess = (text) => {
    setError("");
    setMessage(text);

    setTimeout(() => {
      setMessage("");
    }, 4000);
  };

  const showError = (text) => {
    setMessage("");
    setError(text);
  };

  const getErrorMessage = (err, fallback) =>
    err?.response?.data?.message || err?.message || fallback;

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");

    const remainingSeconds = (seconds % 60).toString().padStart(2, "0");

    return `${minutes}:${remainingSeconds}`;
  };

  const handleImageSelection = (event) => {
    clearMessages();

    const files = Array.from(event.target.files || []);

    if (!files.length) return;

    if (hasReachedImageLimit) {
      event.target.value = "";
      openRequestForm("image");
      return;
    }

    const allowedFiles = files.slice(0, imageRemaining);

    setSelectedImages(allowedFiles);

    event.target.value = "";
  };

  const handleUploadImages = async () => {
    if (!selectedImages.length) return;

    if (imageRemaining <= 0) {
      openRequestForm("image");
      return;
    }

    if (selectedImages.length > imageRemaining) {
      showError(
        t("mediaUploader.imageLimitError", {
          count: imageRemaining,
        }),
      );

      return;
    }

    try {
      setUploadingImages(true);
      clearMessages();

      await uploadFiles(selectedImages);

      setSelectedImages([]);

      showSuccess(t("mediaUploader.photosUploaded"));

      await onRefresh?.();
    } catch (err) {
      console.error(err);

      showError(
        getErrorMessage(err, t("mediaUploader.unableToUploadPhotos")),
      );
    } finally {
      setUploadingImages(false);
    }
  };

  const handleVideoSelection = (event) => {
    clearMessages();

    const files = Array.from(event.target.files || []);

    if (!files.length) return;

    if (!canUploadVideo) {
      event.target.value = "";
      openRequestForm("video");
      return;
    }

    const allowedFiles = files.slice(0, videoRemaining);

    setSelectedVideos(allowedFiles);

    event.target.value = "";
  };

  const handleUploadVideos = async () => {
    if (!selectedVideos.length) return;

    if (!canUploadVideo) {
      openRequestForm("video");
      return;
    }

    if (selectedVideos.length > videoRemaining) {
      showError(
        t("mediaUploader.videoApprovalLimitError", {
          count: videoRemaining,
        }),
      );

      return;
    }

    try {
      setUploadingVideos(true);
      clearMessages();

      await uploadFiles(selectedVideos);

      setSelectedVideos([]);

      showSuccess(t("mediaUploader.videoUploaded"));

      await onRefresh?.();
    } catch (err) {
      console.error(err);

      showError(
        getErrorMessage(err, t("mediaUploader.unableToUploadVideo")),
      );
    } finally {
      setUploadingVideos(false);
    }
  };

  const startRecording = async () => {
    clearMessages();

    if (audioRemaining <= 0) {
      openRequestForm("audio");
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      showError(t("mediaUploader.audioNotSupported"));

      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      const recorder = new MediaRecorder(stream);

      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });

        setAudioBlob(blob);

        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();

      audioRecorderRef.current = recorder;

      setRecording(true);
      setRecordingTime(0);
      setAudioBlob(null);
    } catch (err) {
      console.error(err);

      showError(
        getErrorMessage(err, t("mediaUploader.microphoneError")),
      );
    }
  };

  const stopRecording = () => {
    if (!audioRecorderRef.current) {
      return;
    }

    try {
      audioRecorderRef.current.stop();
    } catch {}

    audioRecorderRef.current = null;
    setRecording(false);
  };

  const uploadAudio = async () => {
    if (!audioBlob) return;

    if (audioRemaining <= 0) {
      openRequestForm("audio");
      return;
    }

    try {
      setUploadingAudio(true);
      clearMessages();

      const extension = audioBlob.type.includes("mp4") ? "m4a" : "webm";

      const file = new File([audioBlob], `audio-${Date.now()}.${extension}`, {
        type: audioBlob.type || "audio/webm",
      });

      await uploadFiles([file]);

      setAudioBlob(null);
      setRecordingTime(0);

      showSuccess(t("mediaUploader.voiceMessageSaved"));

      await onRefresh?.();
    } catch (err) {
      console.error(err);

      showError(
        getErrorMessage(err, t("mediaUploader.unableToSaveVoiceMessage")),
      );
    } finally {
      setUploadingAudio(false);
    }
  };

  const cancelAudio = () => {
    if (recording) {
      stopRecording();
    }

    setAudioBlob(null);
    setRecordingTime(0);
  };

  const openRequestForm = (type) => {
    clearMessages();

    setRequestType(type);
    setRequestAmount(1);
    setRequestMessage("");
  };

  const closeRequestForm = () => {
    setRequestType(null);
    setRequestAmount(1);
    setRequestMessage("");
  };

  const handleRequestAllowance = async () => {
    if (!requestType) return;

    const amount = Number(requestAmount);

    if (!amount || amount < 1) {
      showError(t("mediaUploader.validAmount"));

      return;
    }

    try {
      setRequestingAllowance(true);
      clearMessages();

      await requestMediaAllowance(token, {
        mediaType: requestType,
        requestedExtraLimit: amount,
        requesterName,
        requesterPhone,
        message: requestMessage,
      });

      closeRequestForm();

      showSuccess(t("mediaUploader.requestSentSuccessfully"));

      await onRefresh?.();
    } catch (err) {
      console.error(err);

      showError(
        getErrorMessage(err, t("mediaUploader.unableToSendRequest")),
      );
    } finally {
      setRequestingAllowance(false);
    }
  };

  const startEditingNote = (mediaItem) => {
    setEditingNoteId(mediaItem._id);
    setEditingNote(mediaItem.note || "");
    clearMessages();
  };

  const cancelEditingNote = () => {
    setEditingNoteId(null);
    setEditingNote("");
  };

  const saveNote = async (mediaId) => {
    try {
      setSavingNote(true);
      clearMessages();

      await updateMediaNote(token, mediaId, editingNote);

      setEditingNoteId(null);
      setEditingNote("");

      showSuccess(t("mediaUploader.noteSavedSuccessfully"));

      await onRefresh?.();
    } catch (err) {
      console.error(err);

      showError(
        getErrorMessage(err, t("mediaUploader.unableToSaveNote")),
      );
    } finally {
      setSavingNote(false);
    }
  };

  const handleDeleteMedia = async (mediaItem) => {
    const confirmed = window.confirm(
      t("mediaUploader.deleteMediaConfirmation"),
    );

    if (!confirmed) return;

    try {
      clearMessages();

      await deleteMedia(token, mediaItem._id);

      showSuccess(t("mediaUploader.mediaDeletedSuccessfully"));

      await onRefresh?.();
    } catch (err) {
      console.error(err);

      showError(
        getErrorMessage(err, t("mediaUploader.unableToDeleteMedia")),
      );
    }
  };

  const openReplace = (mediaItem) => {
    setReplaceTarget(mediaItem);

    clearMessages();

    setTimeout(() => {
      replaceInputRef.current?.click();
    }, 0);
  };

  const handleReplaceSelection = async (event) => {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file || !replaceTarget) {
      return;
    }

    try {
      setReplacing(true);
      clearMessages();

      await replaceMedia(token, replaceTarget._id, file);

      setReplaceTarget(null);

      showSuccess(t("mediaUploader.mediaReplacedSuccessfully"));

      await onRefresh?.();
    } catch (err) {
      console.error(err);

      showError(
        getErrorMessage(err, t("mediaUploader.unableToReplaceMedia")),
      );
    } finally {
      setReplacing(false);
    }
  };

  const openWhatsApp = () => {
    const typeLabel =
      requestType === "image"
        ? t("mediaUploader.photos")
        : requestType === "audio"
          ? t("mediaUploader.voiceMessages")
          : t("mediaUploader.videos");

    const text = encodeURIComponent(
      `${t("mediaUploader.whatsappGreeting")}\n\n${t(
        "mediaUploader.whatsappRequest",
        {
          count: requestAmount,
          type: typeLabel,
          serialNumber,
        },
      )}\n\n${t("mediaUploader.whatsappName")}: ${requesterName}\n${t(
        "mediaUploader.whatsappPhone",
      )}: ${requesterPhone}\n${t(
        "mediaUploader.whatsappMessage",
      )}: ${requestMessage}`,
    );

    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const renderMediaCard = (item) => {
    const url = getMediaUrl(item.url);

    const canReplace = item.type !== "audio";

    return (
      <div
        key={item._id}
        className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
      >
        <div className="mb-3 overflow-hidden rounded-xl bg-gray-100">
          {item.type === "image" && (
            <img
              src={url}
              alt={item.note || t("mediaUploader.experienceMedia")}
              className="h-56 w-full object-cover"
            />
          )}

          {item.type === "video" && (
            <video src={url} controls className="h-56 w-full object-cover" />
          )}

          {item.type === "audio" && (
            <div className="flex h-32 items-center justify-center p-4">
              <audio src={url} controls className="w-full" />
            </div>
          )}
        </div>

        {editingNoteId === item._id ? (
          <div className="space-y-2">
            <textarea
              value={editingNote}
              onChange={(event) => setEditingNote(event.target.value)}
              rows={3}
              className="w-full rounded-xl border border-gray-300 p-3 outline-none focus:border-gray-500"
              placeholder={t("mediaUploader.addNotePlaceholder")}
            />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => saveNote(item._id)}
                disabled={savingNote}
                className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white disabled:opacity-50"
              >
                {savingNote
                  ? t("mediaUploader.saving")
                  : t("mediaUploader.save")}
              </button>

              <button
                type="button"
                onClick={cancelEditingNote}
                disabled={savingNote}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm"
              >
                {t("mediaUploader.cancel")}
              </button>
            </div>
          </div>
        ) : (
          <>
            {item.note && (
              <p className="mb-3 text-sm text-gray-600">{item.note}</p>
            )}

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => startEditingNote(item)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                {item.note
                  ? t("mediaUploader.editNote")
                  : t("mediaUploader.addNote")}
              </button>

              {canReplace && (
                <button
                  type="button"
                  onClick={() => openReplace(item)}
                  disabled={replacing}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:opacity-50"
                >
                  {t("mediaUploader.replace")}
                </button>
              )}

              <button
                type="button"
                onClick={() => handleDeleteMedia(item)}
                className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600"
              >
                {t("mediaUploader.delete")}
              </button>
            </div>
          </>
        )}
      </div>
    );
  };

  const renderRequestForm = () => {
    if (!requestType) return null;

    const typeLabel =
      requestType === "image"
        ? t("mediaUploader.photos")
        : requestType === "audio"
          ? t("mediaUploader.voiceMessages")
          : t("mediaUploader.videos");

    return (
      <div className="mt-5 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h4 className="font-semibold text-gray-900">
              {t("mediaUploader.requestMore", {
                type: typeLabel,
              })}
            </h4>

            <p className="mt-1 text-sm text-gray-500">
              {t("mediaUploader.requestAdditionalSlots")}
            </p>
          </div>

          <button
            type="button"
            onClick={closeRequestForm}
            className="text-gray-500 hover:text-gray-900"
          >
            ✕
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {t("mediaUploader.yourName")}
            </label>

            <input
              type="text"
              value={requesterName}
              onChange={(event) => setRequesterName(event.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 outline-none focus:border-gray-500"
              placeholder={t("mediaUploader.yourNamePlaceholder")}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {t("mediaUploader.phone")}
            </label>

            <input
              type="text"
              value={requesterPhone}
              onChange={(event) => setRequesterPhone(event.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 outline-none focus:border-gray-500"
              placeholder={t("mediaUploader.phonePlaceholder")}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {t("mediaUploader.additionalSlots")}
            </label>

            <input
              type="number"
              min="1"
              value={requestAmount}
              onChange={(event) =>
                setRequestAmount(Math.max(1, Number(event.target.value) || 1))
              }
              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 outline-none focus:border-gray-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {t("mediaUploader.message")}
            </label>

            <input
              type="text"
              value={requestMessage}
              onChange={(event) => setRequestMessage(event.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 outline-none focus:border-gray-500"
              placeholder={t("mediaUploader.optionalMessage")}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleRequestAllowance}
            disabled={requestingAllowance}
            className="rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
          >
            {requestingAllowance
              ? t("mediaUploader.sending")
              : t("mediaUploader.sendRequest")}
          </button>

          <button
            type="button"
            onClick={openWhatsApp}
            className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium"
          >
            {t("mediaUploader.requestViaWhatsApp")}
          </button>
        </div>
      </div>
    );
  };

  const renderVideoStatus = () => {
    if (videoStatus === "approved") {
      return (
        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
          {t("mediaUploader.approved")}
        </span>
      );
    }

    if (videoStatus === "pending") {
      return (
        <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">
          {t("mediaUploader.approvalPending")}
        </span>
      );
    }

    if (videoStatus === "rejected") {
      return (
        <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
          {t("mediaUploader.rejected")}
        </span>
      );
    }

    return (
      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
        {t("mediaUploader.approvalRequired")}
      </span>
    );
  };

  return (
    <section className="space-y-8">
      {message && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <input
        ref={replaceInputRef}
        type="file"
        className="hidden"
        accept={replaceTarget ? `${replaceTarget.type}/*` : undefined}
        onChange={handleReplaceSelection}
      />

      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-gray-900">
                {t("mediaUploader.photos")}
              </h3>

              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                {imageUsed} {t("mediaUploader.of")} {effectiveLimits.image}{" "}
                {t("mediaUploader.used")}
              </span>
            </div>

            <p className="mt-1 text-sm text-gray-500">
              {imageRemaining} {t("mediaUploader.remaining")}
            </p>

            {approvedExtras.image > 0 && (
              <p className="mt-1 text-xs text-green-600">
                +{approvedExtras.image} {t("mediaUploader.additionalApprovedSlots")}
              </p>
            )}
          </div>

          <div>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageSelection}
            />

            <button
              type="button"
              onClick={() => {
                if (hasReachedImageLimit) {
                  openRequestForm("image");
                } else {
                  imageInputRef.current?.click();
                }
              }}
              className="rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white"
            >
              {hasReachedImageLimit
                ? t("mediaUploader.requestMorePhotos")
                : t("mediaUploader.choosePhotos")}
            </button>
          </div>
        </div>

        {selectedImages.length > 0 && (
          <div className="mt-5 rounded-xl bg-gray-50 p-4">
            <p className="mb-3 text-sm font-medium text-gray-700">
              {selectedImages.length} {t("mediaUploader.photosSelected")}
            </p>

            <div className="flex flex-wrap gap-2">
              {selectedImages.map((file) => (
                <span
                  key={`${file.name}-${file.lastModified}`}
                  className="rounded-lg bg-white px-3 py-2 text-xs text-gray-600"
                >
                  {file.name}
                </span>
              ))}
            </div>

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={handleUploadImages}
                disabled={uploadingImages}
                className="rounded-xl bg-gray-900 px-4 py-2.5 text-sm text-white disabled:opacity-50"
              >
                {uploadingImages
                  ? t("mediaUploader.uploading")
                  : t("mediaUploader.uploadPhotos")}
              </button>

              <button
                type="button"
                onClick={() => setSelectedImages([])}
                disabled={uploadingImages}
                className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm"
              >
                {t("mediaUploader.cancel")}
              </button>
            </div>
          </div>
        )}

        {requestType === "image" && renderRequestForm()}

        {imageMedia.length > 0 && (
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {imageMedia.map(renderMediaCard)}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-gray-900">
                {t("mediaUploader.voiceMessages")}
              </h3>

              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                {audioUsed} {t("mediaUploader.of")} {effectiveLimits.audio}{" "}
                {t("mediaUploader.used")}
              </span>
            </div>

            <p className="mt-1 text-sm text-gray-500">
              {audioRemaining} {t("mediaUploader.remaining")}
            </p>

            {approvedExtras.audio > 0 && (
              <p className="mt-1 text-xs text-green-600">
                +{approvedExtras.audio}{" "}
                {t("mediaUploader.additionalApprovedSlots")}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              if (hasReachedAudioLimit) {
                openRequestForm("audio");
              } else if (!recording) {
                startRecording();
              }
            }}
            disabled={recording || uploadingAudio}
            className="rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
          >
            {hasReachedAudioLimit
              ? t("mediaUploader.requestMoreVoiceMessages")
              : recording
                ? t("mediaUploader.recording")
                : t("mediaUploader.recordVoiceMessage")}
          </button>
        </div>

        {recording && (
          <div className="mt-5 rounded-xl bg-gray-50 p-5">
            <div className="mb-4 flex items-center gap-3">
              <span className="h-3 w-3 animate-pulse rounded-full bg-red-500" />

              <span className="text-sm font-medium text-gray-700">
                {t("mediaUploader.recording")} {formatTime(recordingTime)}
              </span>
            </div>

            <button
              type="button"
              onClick={stopRecording}
              className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-medium text-white"
            >
              {t("mediaUploader.stopRecording")}
            </button>
          </div>
        )}

        {audioBlob && !recording && (
          <div className="mt-5 rounded-xl bg-gray-50 p-5">
            <p className="mb-3 text-sm font-medium text-gray-700">
              {t("mediaUploader.voiceMessageReady")}
            </p>

            <audio
              controls
              src={URL.createObjectURL(audioBlob)}
              className="mb-4 w-full"
            />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={uploadAudio}
                disabled={uploadingAudio}
                className="rounded-xl bg-gray-900 px-5 py-2.5 text-sm text-white disabled:opacity-50"
              >
                {uploadingAudio
                  ? t("mediaUploader.uploading")
                  : t("mediaUploader.uploadVoiceMessage")}
              </button>

              <button
                type="button"
                onClick={cancelAudio}
                disabled={uploadingAudio}
                className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm"
              >
                {t("mediaUploader.cancel")}
              </button>
            </div>
          </div>
        )}

        {requestType === "audio" && renderRequestForm()}

        {audioMedia.length > 0 && (
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {audioMedia.map(renderMediaCard)}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-lg font-semibold text-gray-900">
                {t("mediaUploader.videos")}
              </h3>

              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                {videoUsed} {t("mediaUploader.of")} {effectiveLimits.video}{" "}
                {t("mediaUploader.used")}
              </span>

              {renderVideoStatus()}
            </div>

            <p className="mt-1 text-sm text-gray-500">
              {videoRemaining} {t("mediaUploader.remaining")}
            </p>

            {approvedExtras.video > 0 && (
              <p className="mt-1 text-xs text-green-600">
                +{approvedExtras.video}{" "}
                {t("mediaUploader.additionalApprovedSlots")}
              </p>
            )}
          </div>

          <div>
            {canUploadVideo ? (
              <>
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  multiple
                  className="hidden"
                  onChange={handleVideoSelection}
                />

                <button
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  className="rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white"
                >
                  {t("mediaUploader.chooseVideos")}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => openRequestForm("video")}
                className="rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white"
              >
                {hasReachedVideoLimit
                  ? t("mediaUploader.requestMoreVideos")
                  : videoStatus === "pending"
                    ? t("mediaUploader.approvalPending")
                    : t("mediaUploader.requestVideoApproval")}
              </button>
            )}
          </div>
        </div>

        {canUploadVideo && (
          <div className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {t("mediaUploader.videoUploadsApproved")}
          </div>
        )}

        {selectedVideos.length > 0 && (
          <div className="mt-5 rounded-xl bg-gray-50 p-4">
            <p className="mb-3 text-sm font-medium text-gray-700">
              {selectedVideos.length} {t("mediaUploader.videosSelected")}
            </p>

            <div className="flex flex-wrap gap-2">
              {selectedVideos.map((file) => (
                <span
                  key={`${file.name}-${file.lastModified}`}
                  className="rounded-lg bg-white px-3 py-2 text-xs text-gray-600"
                >
                  {file.name}
                </span>
              ))}
            </div>

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={handleUploadVideos}
                disabled={uploadingVideos}
                className="rounded-xl bg-gray-900 px-4 py-2.5 text-sm text-white disabled:opacity-50"
              >
                {uploadingVideos
                  ? t("mediaUploader.uploading")
                  : t("mediaUploader.uploadVideos")}
              </button>

              <button
                type="button"
                onClick={() => setSelectedVideos([])}
                disabled={uploadingVideos}
                className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm"
              >
                {t("mediaUploader.cancel")}
              </button>
            </div>
          </div>
        )}

        {requestType === "video" && renderRequestForm()}

        {videoMedia.length > 0 && (
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {videoMedia.map(renderMediaCard)}
          </div>
        )}
      </div>
    </section>
  );
};

export default MediaUploader;