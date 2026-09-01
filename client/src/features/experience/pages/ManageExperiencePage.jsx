import {
  useEffect,
  useState,
} from "react";

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
  updatePublicSlug,
  updateAccessDate,
} from "../services/experienceApi";

const DEFAULT_MEDIA_LIMITS = {
  imageLimit: 5,
  videoLimit: 5,
  audioLimit: 5,
  fileLimit: 5,
};

const ManageExperiencePage = () => {
  const { token } =
    useParams();

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
    slug,
    setSlug,
  ] = useState("");

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

  useEffect(() => {
    loadExperience();
  }, [token]);

  const loadExperience =
    async () => {
      try {
        setLoading(true);

        const data =
          await getExperience(
            token,
          );

        setExperience(
          data.experience,
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

        setSlug(
          data.experience
            ?.slug || "",
        );

        setAccessDate(
          data.experience
            ?.accessDate || "",
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
      } catch (error) {
        console.error(
          "Failed to load experience:",
          error,
        );

        alert(
          error?.response?.data
            ?.message ||
            "Failed To Load Experience",
        );
      } finally {
        setLoading(false);
      }
    };

  const handleChange = (
    event,
  ) => {
    setForm(
      (previous) => ({
        ...previous,

        [event.target.name]:
          event.target.value,
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
      } catch (error) {
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
    async (files) => {
      try {
        await uploadMedia(
          token,
          files,
        );

        alert(
          "Files Uploaded Successfully",
        );

        await loadExperience();
      } catch (error) {
        console.error(
          "UPLOAD ERROR:",
          error,
        );

        throw error;
      }
    };

  const handleSaveSlug =
    async () => {
      const cleanSlug =
        slug
          .trim()
          .toLowerCase()
          .replace(
            /\s+/g,
            "-",
          );

      if (!cleanSlug) {
        alert(
          "Please enter a link name",
        );

        return;
      }

      try {
        await updatePublicSlug(
          token,
          cleanSlug,
        );

        setSlug(
          cleanSlug,
        );

        alert(
          "Public Link Updated",
        );

        await loadExperience();
      } catch (error) {
        alert(
          error?.response?.data
            ?.message ||
            "Failed To Update Public Link",
        );
      }
    };

  const handleSaveAccessDate =
    async () => {
      if (!accessDate) {
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
      } catch (error) {
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
      } finally {
        setSavingAccessDate(
          false,
        );
      }
    };

  const serialNumber =
    experience?.serialNumber ||
    "";

  const clientUrl =
    typeof window !==
    "undefined"
      ? window.location.origin
      : "";

  const publicLink =
    serialNumber &&
    experience?.slug
      ? `${clientUrl}/experience/public/${encodeURIComponent(
          serialNumber,
        )}/${encodeURIComponent(
          experience.slug,
        )}`
      : "";

  const copyLink =
    async () => {
      if (!publicLink) {
        alert(
          "Please save a custom link first",
        );

        return;
      }

      await navigator.clipboard.writeText(
        publicLink,
      );

      alert(
        "Copied Successfully",
      );
    };

  const openPublicProfile =
    () => {
      if (!publicLink) {
        return;
      }

      window.open(
        publicLink,
        "_blank",
        "noopener,noreferrer",
      );
    };

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

  if (!experience) {
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

        <section className="overflow-hidden rounded-[28px] border border-light-champagne bg-soft-white">
          <div className="border-b border-light-champagne bg-warm-ivory/50 px-6 py-7 sm:px-8">
            <h2 className="font-serif text-[1.65rem]">
              Public Profile
            </h2>
          </div>

          <div className="space-y-7 px-6 py-7 sm:px-8">
            <div>
              <label className="mb-2 block text-[10px] uppercase text-slate-gray">
                Jewelry Serial Number
              </label>

              <div className="rounded-[14px] border border-light-champagne bg-silver-mist/60 px-5 py-4 font-mono text-[12px]">
                {serialNumber}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-[10px] uppercase text-slate-gray">
                Custom Link Name
              </label>

              <div className="flex overflow-hidden rounded-[14px] border border-light-champagne">
                <div className="hidden items-center bg-warm-ivory/70 px-4 text-[11px] text-slate-gray md:flex">
                  /experience/public/
                  {serialNumber}/
                </div>

                <input
                  type="text"
                  value={slug}
                  onChange={(
                    event,
                  ) =>
                    setSlug(
                      event.target.value
                        .toLowerCase()
                        .replace(
                          /\s+/g,
                          "-",
                        ),
                    )
                  }
                  className="min-w-0 flex-1 px-4 py-3.5 outline-none"
                  placeholder="special-memory"
                />
              </div>
            </div>

            {publicLink && (
              <div className="break-all rounded-[16px] bg-warm-ivory p-4 text-[12px]">
                {publicLink}
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={
                  handleSaveSlug
                }
                className="rounded-[13px] bg-deep-navy px-6 py-3 text-[11px] font-semibold text-white"
              >
                Save Link
              </button>

              <button
                type="button"
                onClick={
                  copyLink
                }
                disabled={
                  !publicLink
                }
                className="rounded-[13px] border border-light-champagne px-6 py-3 text-[11px] disabled:opacity-40"
              >
                Copy Link
              </button>

              <button
                type="button"
                onClick={
                  openPublicProfile
                }
                disabled={
                  !publicLink
                }
                className="rounded-[13px] bg-classic-gold px-6 py-3 text-[11px] disabled:opacity-40"
              >
                Open Profile
              </button>
            </div>
          </div>
        </section>

        <PersonalInfoForm
          form={form}
          handleChange={
            handleChange
          }
          handleSave={
            handleSave
          }
          saving={saving}
        />

        <MediaUploader
          uploadFiles={
            handleUpload
          }
          mediaLimits={
            mediaLimits
          }
          currentMedia={
            media
          }
        />

        <section className="rounded-[28px] border border-light-champagne bg-soft-white p-6 sm:p-8">
          <h2 className="mb-6 font-serif text-[1.65rem]">
            Your Memories
          </h2>

          <MediaGallery
            media={media}
          />
        </section>
      </main>
    </div>
  );
};

export default ManageExperiencePage;