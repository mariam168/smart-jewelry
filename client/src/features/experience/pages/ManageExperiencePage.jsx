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
  updatePublicSlug,
  updateAccessDate,
} from "../services/experienceApi";

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
          data.media || [],
        );

        setSlug(
          data.experience
            ?.slug || "",
        );

        setAccessDate(
          data.experience
            ?.accessDate || "",
        );

        if (data.personal) {
          setForm({
            ownerName:
              data.personal
                .ownerName || "",

            receiverName:
              data.personal
                .receiverName || "",

            receiverEmail:
              data.personal
                .receiverEmail || "",

            title:
              data.personal.title ||
              "",

            message:
              data.personal
                .message || "",

            profileImage:
              data.personal
                .profileImage || "",
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
          "Failed to save personal information:",
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
      if (
        !files ||
        files.length === 0
      ) {
        return;
      }

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

        alert(
          error?.response?.data
            ?.message ||
            "Upload Failed",
        );

        throw error;
      }
    };

  const handleSaveSlug =
    async () => {
      const cleanSlug = slug
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-");

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

        setSlug(cleanSlug);

        alert(
          "Public Link Updated",
        );

        await loadExperience();
      } catch (error) {
        console.error(
          "Failed to update slug:",
          error,
        );

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
        console.error(
          "ACCESS DATE ERROR:",
          error,
        );

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

        alert(
          "Date Protection Removed",
        );

        await loadExperience();
      } catch (error) {
        console.error(
          "REMOVE ACCESS DATE ERROR:",
          error,
        );

        alert(
          error?.response?.data
            ?.message ||
            "Failed To Remove Date Protection",
        );
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
    window.location.origin;

  const publicLink =
    serialNumber &&
    experience?.slug
      ? `${clientUrl}/experience/${encodeURIComponent(
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

      try {
        await navigator.clipboard.writeText(
          publicLink,
        );

        alert(
          "Copied Successfully",
        );
      } catch (error) {
        console.error(
          "Failed to copy link:",
          error,
        );

        alert(
          "Failed To Copy Link",
        );
      }
    };

  const openPublicProfile =
    () => {
      if (!publicLink) {
        alert(
          "Please save a custom link first",
        );

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
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-warm-ivory px-4">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-soft-cream blur-[120px]" />

        <div className="relative text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-champagne-gold/25 bg-soft-white shadow-[0_12px_30px_rgba(7,19,31,0.06)]">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-premium-silver border-t-classic-gold" />
          </div>

          <p className="text-[13px] font-medium tracking-wide text-slate-gray">
            Loading your jewelry experience...
          </p>
        </div>
      </div>
    );
  }

  if (!experience) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-warm-ivory px-4">
        <div className="rounded-[28px] border border-light-champagne bg-soft-white px-10 py-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-champagne-gold/25 bg-soft-cream text-classic-gold">
            ✦
          </div>

          <h2 className="mt-5 font-serif text-[2rem] text-midnight-navy">
            Experience Not Found
          </h2>

          <p className="mt-2 text-[13px] text-slate-gray">
            We couldn't find this jewelry experience.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-warm-ivory text-midnight-navy">
      <div className="pointer-events-none fixed -left-52 top-80 h-[520px] w-[520px] rounded-full bg-champagne-gold/[0.05] blur-[140px]" />

      <div className="pointer-events-none fixed -right-48 bottom-24 h-[500px] w-[500px] rounded-full bg-light-champagne/55 blur-[130px]" />

      <header className="relative overflow-hidden border-b border-rich-navy bg-gradient-to-br from-deep-navy via-rich-navy to-luxury-black">
        <div className="pointer-events-none absolute -right-32 -top-44 h-[420px] w-[420px] rounded-full border border-champagne-gold/[0.08]" />

        <div className="relative mx-auto max-w-6xl px-5 py-9 sm:px-8 sm:py-10">
          <div className="flex flex-col gap-7 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-classic-gold">
                  ✦
                </span>

                <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-soft-white">
                  Smart Jewelry
                </span>
              </div>

              <h1 className="mt-3 font-serif text-[2.5rem] font-normal leading-none tracking-[-0.04em] text-soft-white sm:text-[3.1rem]">
                Manage Experience
              </h1>

              <p className="mt-4 max-w-xl text-[13px] leading-7 text-premium-silver">
                Personalize your jewelry experience, protect it with a special
                date, add memories, and manage your public profile.
              </p>
            </div>

            <div className="flex w-fit items-center gap-3 rounded-[18px] border border-champagne-gold/20 bg-soft-white/[0.05] px-4 py-3 backdrop-blur-sm">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-champagne-gold text-deep-navy">
                ✦
              </span>

              <div>
                <p className="text-[9px] uppercase tracking-[0.15em] text-premium-silver">
                  Experience Serial
                </p>

                <p className="mt-1 font-mono text-[12px] text-soft-white">
                  {serialNumber ||
                    "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-6xl px-5 py-9 sm:px-8 lg:py-12">
        <div className="space-y-8">
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

          <section className="overflow-hidden rounded-[28px] border border-light-champagne/90 bg-soft-white/90 shadow-[0_20px_60px_rgba(7,19,31,0.055)]">
            <div className="border-b border-light-champagne/80 bg-warm-ivory/50 px-6 py-7 sm:px-8">
              <div className="flex gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-[15px] border border-champagne-gold/20 bg-soft-cream">
                  🔗
                </div>

                <div>
                  <h2 className="font-serif text-[1.65rem]">
                    Public Profile
                  </h2>

                  <p className="mt-1.5 text-[13px] text-slate-gray">
                    Create the public link for this jewelry piece.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-7 px-6 py-7 sm:px-8">
              <div>
                <label className="mb-2.5 block text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-gray">
                  Jewelry Serial Number
                </label>

                <div className="rounded-[14px] border border-light-champagne bg-silver-mist/60 px-5 py-4">
                  <p className="font-mono text-[12px] font-semibold">
                    {serialNumber ||
                      "Not Available"}
                  </p>
                </div>
              </div>

              <div>
                <label className="mb-2.5 block text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-gray">
                  Custom Link Name
                </label>

                <div className="flex flex-col overflow-hidden rounded-[14px] border border-light-champagne bg-soft-white focus-within:border-classic-gold md:flex-row">
                  <div className="flex items-center border-b border-light-champagne bg-warm-ivory/70 px-4 py-3 text-[12px] text-slate-gray md:border-b-0 md:border-r">
                    /experience/
                    {serialNumber ||
                      "SERIAL"}
                    /
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
                    className="min-w-0 flex-1 px-4 py-3.5 text-[13px] outline-none"
                    placeholder="special-memory"
                  />
                </div>
              </div>

              {publicLink && (
                <div className="rounded-[16px] border border-light-champagne bg-warm-ivory/60 p-4">
                  <p className="break-all text-[12px]">
                    {publicLink}
                  </p>
                </div>
              )}

              <div className="flex flex-col gap-3 border-t border-light-champagne pt-6 sm:flex-row">
                <button
                  type="button"
                  onClick={
                    handleSaveSlug
                  }
                  className="min-h-[46px] rounded-[13px] bg-deep-navy px-6 text-[11px] font-semibold text-soft-white"
                >
                  Save Link
                </button>

                <button
                  type="button"
                  onClick={copyLink}
                  disabled={
                    !publicLink
                  }
                  className="min-h-[46px] rounded-[13px] border border-light-champagne bg-soft-white px-6 text-[11px] font-semibold disabled:opacity-40"
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
                  className="min-h-[46px] rounded-[13px] bg-classic-gold px-6 text-[11px] font-semibold text-deep-navy disabled:opacity-40"
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
          />

          <section className="overflow-hidden rounded-[28px] border border-light-champagne/90 bg-soft-white/90 shadow-[0_20px_60px_rgba(7,19,31,0.055)]">
            <div className="border-b border-light-champagne/80 bg-warm-ivory/50 px-6 py-7 sm:px-8">
              <h2 className="font-serif text-[1.65rem]">
                Your Memories
              </h2>

              <p className="mt-1 text-[13px] text-slate-gray">
                Photos, videos, audio and files connected to this experience.
              </p>
            </div>

            <div className="px-6 py-7 sm:px-8">
              <MediaGallery
                media={media}
              />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default ManageExperiencePage;