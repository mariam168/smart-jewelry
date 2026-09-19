import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import ProductInfoCard from "../components/ProductInfoCard";
import PersonalInfoForm from "../components/PersonalInfoForm";
import MediaUploader from "../components/MediaUploader";
import MediaGallery from "../components/MediaGallery";
import ExperienceAccessDateCard from "../components/ExperienceAccessDateCard";

import {
  getExperience,
  updatePersonal,
  uploadMedia,
  updateAccessDate,
} from "../services/experienceApi";

const DEFAULT_MEDIA_LIMITS = {
  imageLimit: 5,
  videoLimit: 5,
  audioLimit: 5,
};

const DEFAULT_VIDEO_ACCESS = {
  status: "not_requested",
  approvedVideoLimit: 0,
  approvedExtraLimit: 0,
  requesterName: "",
  requesterPhone: "",
  message: "",
  adminNote: "",
};

const normalizeMediaRequests = (requests) => {
  if (!Array.isArray(requests)) {
    return [];
  }

  return requests.map((request) => ({
    ...request,

    mediaType: request?.mediaType || request?.type || null,

    approvedExtraLimit: Number(request?.approvedExtraLimit || 0),

    requestedExtraLimit: Number(request?.requestedExtraLimit || 0),

    approvedVideoLimit: Number(request?.approvedVideoLimit || 0),
  }));
};

const normalizeApprovedExtraLimits = (requests) => {
  const result = {
    image: 0,
    audio: 0,
    video: 0,
  };

  if (!Array.isArray(requests)) {
    return result;
  }

  requests.forEach((request) => {
    if (request?.status !== "approved") {
      return;
    }

    const mediaType = request?.mediaType;

    if (!["image", "audio", "video"].includes(mediaType)) {
      return;
    }

    const approvedExtra = Number(request?.approvedExtraLimit || 0);

    result[mediaType] += approvedExtra;
  });

  return result;
};

const normalizeVideoAccess = (data, mediaRequests) => {
  const requests = Array.isArray(mediaRequests) ? mediaRequests : [];

  const videoRequests = requests.filter(
    (request) => request?.mediaType === "video",
  );

  const latestVideoRequest =
    [...videoRequests]
      .sort((a, b) => {
        const aDate = new Date(a?.requestedAt || a?.createdAt || 0).getTime();

        const bDate = new Date(b?.requestedAt || b?.createdAt || 0).getTime();

        return aDate - bDate;
      })
      .at(-1) || null;

  const approvedVideoRequests = videoRequests.filter(
    (request) => request?.status === "approved",
  );

  const totalApprovedExtraLimit = approvedVideoRequests.reduce(
    (total, request) => total + Number(request?.approvedExtraLimit || 0),
    0,
  );

  const totalApprovedVideoLimit = approvedVideoRequests.reduce(
    (total, request) => total + Number(request?.approvedVideoLimit || 0),
    0,
  );

  const oldVideoAccess = data?.videoAccess || data?.mediaAccess?.video || {};

  let status =
    latestVideoRequest?.status || oldVideoAccess?.status || "not_requested";

  if (totalApprovedExtraLimit > 0) {
    status = "approved";
  }

  const approvedVideoLimit =
    totalApprovedVideoLimit > 0
      ? totalApprovedVideoLimit
      : totalApprovedExtraLimit > 0
        ? totalApprovedExtraLimit
        : Number(oldVideoAccess?.approvedVideoLimit || 0);

  return {
    ...DEFAULT_VIDEO_ACCESS,
    ...oldVideoAccess,

    status,

    approvedExtraLimit: totalApprovedExtraLimit,

    approvedVideoLimit,

    requesterName:
      latestVideoRequest?.requesterName || oldVideoAccess?.requesterName || "",

    requesterPhone:
      latestVideoRequest?.requesterPhone ||
      oldVideoAccess?.requesterPhone ||
      "",

    message: latestVideoRequest?.message || oldVideoAccess?.message || "",

    adminNote: latestVideoRequest?.adminNote || oldVideoAccess?.adminNote || "",

    requestCount: videoRequests.length,

    approvedRequestCount: approvedVideoRequests.length,
  };
};

const ManageExperiencePage = () => {
  const { token } = useParams();
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingAccessDate, setSavingAccessDate] = useState(false);

  const [experience, setExperience] = useState(null);

  const [media, setMedia] = useState([]);

  const [mediaLimits, setMediaLimits] = useState(DEFAULT_MEDIA_LIMITS);

  const [mediaRequests, setMediaRequests] = useState([]);

  const [videoAccess, setVideoAccess] = useState(DEFAULT_VIDEO_ACCESS);

  const [accessDate, setAccessDate] = useState("");

  const [form, setForm] = useState({
    ownerName: "",
    receiverName: "",
    message: "",
    profileImage: "",
  });

  const loadExperience = async ({ showLoader = false } = {}) => {
    try {
      if (showLoader) {
        setLoading(true);
      }

      const data = await getExperience(token);

      console.log(
        "EXPERIENCE MEDIA RESPONSE JSON:",
        JSON.stringify(data, null, 2),
      );

      setExperience(data?.experience || null);

      setMedia(Array.isArray(data?.media) ? data.media : []);

      const baseMediaLimits = {
        ...DEFAULT_MEDIA_LIMITS,
        ...(data?.mediaLimits || {}),
      };

      const normalizedRequests = normalizeMediaRequests(data?.mediaRequests);

      setMediaRequests(normalizedRequests);

      const approvedExtraLimits =
        normalizeApprovedExtraLimits(normalizedRequests);

   setMediaLimits({
  ...baseMediaLimits,
  approvedExtraLimits,
  approvedExtraImageLimit: approvedExtraLimits.image,
  approvedExtraAudioLimit: approvedExtraLimits.audio,
  approvedExtraVideoLimit: approvedExtraLimits.video,
});

      const normalizedVideoAccess = normalizeVideoAccess(
        data,
        normalizedRequests,
      );

      console.log("NORMALIZED MEDIA REQUESTS:", normalizedRequests);

      console.log("APPROVED EXTRA LIMITS:", approvedExtraLimits);

      console.log("NORMALIZED VIDEO ACCESS:", normalizedVideoAccess);

      setVideoAccess(normalizedVideoAccess);

      setAccessDate(data?.experience?.accessDate || "");

      const order = data?.experience?.order || {};

      const manufacturingName = order?.manufacturingName || "";

      const shippingAddress = order?.shippingAddress || {};

      const shippingReceiverName = [
        shippingAddress?.firstName,
        shippingAddress?.lastName,
      ]
        .filter(Boolean)
        .join(" ");

      const receiverName = order?.ordererName?.trim() || shippingReceiverName;

      setForm({
        ownerName: manufacturingName,
        receiverName,
        message: data?.personal?.message || "",
        profileImage: data?.personal?.profileImage || "",
      });
    } catch (error) {
      console.error("Failed to load experience:", error);

      if (showLoader) {
        alert(
          error?.response?.data?.message ||
            t("manageExperience.failedToLoadExperience"),
        );
      }
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (!token) return;

    loadExperience({
      showLoader: true,
    });
  }, [token]);

  const handleChange = (event) => {
    setForm((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      await updatePersonal(token, form);

      alert(t("manageExperience.savedSuccessfully"));

      await loadExperience();
    } catch (error) {
      console.error(error);

      alert(
        error?.response?.data?.message || t("manageExperience.failedToSave"),
      );
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (files) => {
    return uploadMedia(token, files);
  };

  const handleSaveAccessDate = async () => {
    if (!accessDate) {
      alert(t("manageExperience.pleaseChooseDate"));

      return;
    }

    try {
      setSavingAccessDate(true);

      await updateAccessDate(token, accessDate);

      alert(t("manageExperience.dateProtectionEnabled"));

      await loadExperience();
    } catch (error) {
      console.error(error);

      alert(
        error?.response?.data?.message ||
          t("manageExperience.failedToSaveAccessDate"),
      );
    } finally {
      setSavingAccessDate(false);
    }
  };

  const handleRemoveAccessDate = async () => {
    try {
      setSavingAccessDate(true);

      await updateAccessDate(token, "");

      setAccessDate("");

      await loadExperience();
    } catch (error) {
      console.error(error);

      alert(
        error?.response?.data?.message ||
          t("manageExperience.failedToRemoveAccessDate"),
      );
    } finally {
      setSavingAccessDate(false);
    }
  };

  const serialNumber = experience?.serialNumber || "";

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-sm text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!experience) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
          {t("manageExperience.experienceNotFound") || "Experience not found."}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F5F0]">
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 md:px-6 lg:px-8">
        <div>
        <h1 className="text-2xl font-semibold text-[#302820]">
{t("manageExperience.title")}
</h1>

          {serialNumber && (
            <p className="mt-1 text-sm text-gray-500">{serialNumber}</p>
          )}
        </div>

        <ProductInfoCard experience={experience} />

       <PersonalInfoForm
  form={form}
  handleChange={handleChange}
  handleSave={handleSave}
  saving={saving}
/>

        <MediaUploader
          token={token}
          uploadFiles={handleUpload}
          mediaLimits={mediaLimits}
          mediaRequests={mediaRequests}
          currentMedia={media}
          videoAccess={videoAccess}
          serialNumber={serialNumber}
          onRefresh={loadExperience}
        />

        <MediaGallery media={media} serialNumber={serialNumber} />

        <ExperienceAccessDateCard
          accessDate={accessDate}
          setAccessDate={setAccessDate}
          onSave={handleSaveAccessDate}
          onRemove={handleRemoveAccessDate}
          saving={savingAccessDate}
        />
      </div>
    </div>
  );
};

export default ManageExperiencePage;
