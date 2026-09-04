import {
  useEffect,
  useState,
} from "react";

import {
  useParams,
} from "react-router-dom";

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
  status:
    "not_requested",

  approvedVideoLimit:
    0,

  requesterName:
    "",

  requesterPhone:
    "",

  message: "",

  adminNote:
    "",
};

const ManageExperiencePage = () => {
  const {
    token,
  } = useParams();

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    savingAccessDate,
    setSavingAccessDate,
  ] = useState(false);

  const [
    experience,
    setExperience,
  ] = useState(null);

  const [
    media,
    setMedia,
  ] = useState([]);

  const [
    mediaLimits,
    setMediaLimits,
  ] = useState(
    DEFAULT_MEDIA_LIMITS,
  );

  const [
    videoAccess,
    setVideoAccess,
  ] = useState(
    DEFAULT_VIDEO_ACCESS,
  );

  const [
    accessDate,
    setAccessDate,
  ] = useState("");

  const [
    form,
    setForm,
  ] = useState({
    ownerName: "",
    receiverName: "",
    receiverEmail: "",
    title: "",
    message: "",
    profileImage: "",
  });

  const loadExperience = async ({
    showLoader = false,
  } = {}) => {
    try {
      if (
        showLoader
      ) {
        setLoading(true);
      }

      const data =
        await getExperience(
          token,
        );

      setExperience(
        data.experience ||
          null,
      );

      setMedia(
        Array.isArray(
          data.media,
        )
          ? data.media
          : [],
      );

      setMediaLimits({
        ...DEFAULT_MEDIA_LIMITS,
        ...(data.mediaLimits ||
          {}),
      });

      setVideoAccess({
        ...DEFAULT_VIDEO_ACCESS,
        ...(data.videoAccess ||
          {}),
      });

      setAccessDate(
        data.experience
          ?.accessDate ||
          "",
      );

      if (
        data.personal
      ) {
        setForm({
          ownerName:
            data.personal
              .ownerName ||
            "",

          receiverName:
            data.personal
              .receiverName ||
            "",

          receiverEmail:
            data.personal
              .receiverEmail ||
            "",

          title:
            data.personal
              .title ||
            "",

          message:
            data.personal
              .message ||
            "",

          profileImage:
            data.personal
              .profileImage ||
            "",
        });
      }
    } catch (
      error
    ) {
      console.error(
        "Failed to load experience:",
        error,
      );

      if (
        showLoader
      ) {
        alert(
          error?.response?.data
            ?.message ||
            "Failed To Load Experience",
        );
      }
    } finally {
      if (
        showLoader
      ) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadExperience({
      showLoader:
        true,
    });
  }, [token]);

  const handleChange = (
    event,
  ) => {
    setForm(
      (
        previous,
      ) => ({
        ...previous,

        [event.target
          .name]:
          event.target
            .value,
      }),
    );
  };

  const handleSave =
    async () => {
      try {
        setSaving(true);

        await updatePersonal(
          token,
          form,
        );

        alert(
          "Saved Successfully",
        );

        await loadExperience();
      } catch (
        error
      ) {
        console.error(
          error,
        );

        alert(
          error?.response?.data
            ?.message ||
            "Failed To Save",
        );
      } finally {
        setSaving(false);
      }
    };

  const handleUpload =
    async (
      files,
    ) => {
      return uploadMedia(
        token,
        files,
      );
    };

  const handleSaveAccessDate =
    async () => {
      if (
        !accessDate
      ) {
        alert(
          "Please choose a date",
        );

        return;
      }

      try {
        setSavingAccessDate(
          true,
        );

        await updateAccessDate(
          token,
          accessDate,
        );

        alert(
          "Date Protection Enabled",
        );

        await loadExperience();
      } catch (
        error
      ) {
        alert(
          error?.response?.data
            ?.message ||
            "Failed To Save Access Date",
        );
      } finally {
        setSavingAccessDate(
          false,
        );
      }
    };

  const handleRemoveAccessDate =
    async () => {
      try {
        setSavingAccessDate(
          true,
        );

        await updateAccessDate(
          token,
          "",
        );

        setAccessDate("");

        await loadExperience();
      } catch (
        error
      ) {
        alert(
          error?.response?.data
            ?.message ||
            "Failed To Remove Access Date",
        );
      } finally {
        setSavingAccessDate(
          false,
        );
      }
    };

  const serialNumber =
    experience
      ?.serialNumber ||
    "";

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-warm-ivory">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-light-champagne border-t-classic-gold" />

          <p className="mt-5 text-[13px] text-slate-gray">
            Loading your jewelry experience...
          </p>
        </div>
      </div>
    );
  }

  if (
    !experience
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-warm-ivory">
        <h2 className="font-serif text-[2rem]">
          Experience Not Found
        </h2>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-warm-ivory text-midnight-navy">
      <header className="bg-gradient-to-br from-deep-navy via-rich-navy to-luxury-black">
        <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
          <p className="text-[10px] uppercase tracking-[0.25em] text-champagne-gold">
            ✦ Smart Jewelry
          </p>

          <h1 className="mt-3 font-serif text-[3rem] text-soft-white">
            Manage Experience
          </h1>

          <p className="mt-4 font-mono text-[12px] text-premium-silver">
            Serial:{" "}
            {
              serialNumber
            }
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-5 py-10 sm:px-8">
        <ProductInfoCard
          experience={
            experience
          }
        />

        <ExperienceAccessDateCard
          accessDate={
            accessDate
          }
          setAccessDate={
            setAccessDate
          }
          hasSavedDate={Boolean(
            experience.accessDate,
          )}
          onSave={
            handleSaveAccessDate
          }
          onRemove={
            handleRemoveAccessDate
          }
          saving={
            savingAccessDate
          }
        />

        <PersonalInfoForm
          form={form}
          handleChange={
            handleChange
          }
          handleSave={
            handleSave
          }
          saving={
            saving
          }
        />

        <MediaUploader
          token={token}
          uploadFiles={
            handleUpload
          }
          mediaLimits={
            mediaLimits
          }
          currentMedia={
            media
          }
          videoAccess={
            videoAccess
          }
          serialNumber={
            serialNumber
          }
          onRefresh={
            loadExperience
          }
        />

        <section className="rounded-[28px] border border-light-champagne bg-soft-white p-6 sm:p-8">
          <h2 className="mb-6 font-serif text-[1.65rem]">
            Your Memories
          </h2>

          <MediaGallery
            media={
              media
            }
          />
        </section>
      </main>
    </div>
  );
};

export default ManageExperiencePage;