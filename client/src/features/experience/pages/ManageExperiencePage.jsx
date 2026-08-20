import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import ProductInfoCard from "../components/ProductInfoCard";
import PersonalInfoForm from "../components/PersonalInfoForm";
import MediaUploader from "../components/MediaUploader";
import MediaGallery from "../components/MediaGallery";

import {
  getExperience,
  updatePersonal,
  uploadMedia,
  updatePublicSlug,
} from "../services/experienceApi";

const API_URL = "http://localhost:5173";

const ManageExperiencePage = () => {
  const { token } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [experience, setExperience] = useState(null);
  const [media, setMedia] = useState([]);

  const [slug, setSlug] = useState("");

  const [form, setForm] = useState({
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

  const loadExperience = async () => {
    try {
      setLoading(true);

      const data = await getExperience(token);

      console.log("MANAGE EXPERIENCE DATA:", data);

      setExperience(data.experience);
      setMedia(data.media || []);

      setSlug(data.experience?.slug || "");

      if (data.personal) {
        setForm({
          ownerName: data.personal.ownerName || "",
          receiverName: data.personal.receiverName || "",
          receiverEmail: data.personal.receiverEmail || "",
          title: data.personal.title || "",
          message: data.personal.message || "",
          profileImage: data.personal.profileImage || "",
        });
      }
    } catch (error) {
      console.error("Failed to load experience:", error);

      console.error("STATUS:", error?.response?.status);

      console.error("RESPONSE:", error?.response?.data);

      alert("Failed To Load Experience");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      await updatePersonal(token, form);

      alert("Saved Successfully");

      await loadExperience();
    } catch (error) {
      console.error("Failed to save personal information:", error);

      console.error("STATUS:", error?.response?.status);

      console.error("RESPONSE:", error?.response?.data);

      alert(error?.response?.data?.message || "Failed To Save");
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (files) => {
    if (!files || files.length === 0) {
      return;
    }

    try {
      await uploadMedia(token, files);

      alert("Files Uploaded Successfully");

      await loadExperience();
    } catch (error) {
      console.error("UPLOAD ERROR:", error);

      console.error("STATUS:", error?.response?.status);

      console.error("RESPONSE DATA:", error?.response?.data);

      console.error("RESPONSE HEADERS:", error?.response?.headers);

      alert(error?.response?.data?.message || "Upload Failed");
    }
  };

  const handleSaveSlug = async () => {
    const cleanSlug = slug.trim().toLowerCase().replace(/\s+/g, "-");

    if (!cleanSlug) {
      alert("Please enter a link name");
      return;
    }

    try {
      await updatePublicSlug(token, cleanSlug);

      setSlug(cleanSlug);

      alert("Public Link Updated");

      await loadExperience();
    } catch (error) {
      console.error("Failed to update slug:", error);

      console.error("STATUS:", error?.response?.status);

      console.error("RESPONSE:", error?.response?.data);

      alert(error?.response?.data?.message || "Failed To Update Public Link");
    }
  };

  const serialNumber = experience?.serialNumber || "";

  const publicLink =
    serialNumber && experience?.slug
      ? `${API_URL}/experience/${encodeURIComponent(
          serialNumber,
        )}/${encodeURIComponent(experience.slug)}`
      : "";

  const copyLink = async () => {
    if (!publicLink) {
      alert("Please save a custom link first");

      return;
    }

    try {
      await navigator.clipboard.writeText(publicLink);

      alert("Copied Successfully");
    } catch (error) {
      console.error("Failed to copy link:", error);

      alert("Failed To Copy Link");
    }
  };

  const openPublicProfile = () => {
    if (!publicLink) {
      alert("Please save a custom link first");

      return;
    }

    window.open(publicLink, "_blank", "noopener,noreferrer");
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
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-warm-ivory px-4">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-soft-cream blur-[120px]" />

        <div className="relative overflow-hidden rounded-[28px] border border-light-champagne/90 bg-soft-white/90 px-10 py-12 text-center shadow-[0_20px_60px_rgba(7,19,31,0.06)]">
          <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full border border-champagne-gold/10" />

          <div className="relative mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-champagne-gold/25 bg-soft-cream text-[17px] text-classic-gold">
            ✦
          </div>

          <h2 className="relative font-serif text-[2rem] font-normal tracking-[-0.03em] text-midnight-navy">
            Experience Not Found
          </h2>

          <p className="relative mt-2 text-[13px] leading-6 text-slate-gray">
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

        <div className="pointer-events-none absolute -bottom-40 left-[18%] h-80 w-80 rounded-full bg-champagne-gold/[0.04] blur-[100px]" />

        <div className="relative mx-auto max-w-6xl px-5 py-9 sm:px-8 sm:py-10">
          <div className="flex flex-col gap-7 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-[15px] text-classic-gold">✦</span>

                <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-soft-white">
                  Smart Jewelry
                </span>
              </div>

              <h1 className="mt-3 font-serif text-[2.5rem] font-normal leading-none tracking-[-0.04em] text-soft-white sm:text-[3.1rem]">
                Manage Experience
              </h1>

              <p className="mt-4 max-w-xl text-[13px] leading-7 text-premium-silver">
                Personalize your jewelry experience, add memories, and manage
                your public profile.
              </p>
            </div>

            <div className="flex w-fit items-center gap-3 rounded-[18px] border border-champagne-gold/20 bg-soft-white/[0.05] px-4 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.08)] backdrop-blur-sm">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-champagne-gold/20 bg-champagne-gold text-[10px] text-deep-navy">
                ✦
              </span>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-premium-silver">
                  Experience Serial
                </p>

                <p className="mt-1 font-mono text-[12px] font-medium tracking-[0.04em] text-soft-white">
                  {experience.serialNumber || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-6xl px-5 py-9 sm:px-8 lg:py-12">
        <div className="space-y-8">
          <section>
            <ProductInfoCard experience={experience} />
          </section>

          <section className="relative overflow-hidden rounded-[28px] border border-light-champagne/90 bg-soft-white/90 shadow-[0_20px_60px_rgba(7,19,31,0.055)]">
            <div className="pointer-events-none absolute -right-28 -top-28 h-72 w-72 rounded-full border border-champagne-gold/[0.08]" />

            <div className="border-b border-light-champagne/80 bg-warm-ivory/50 px-6 py-7 sm:px-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] border border-champagne-gold/20 bg-soft-cream text-[17px] text-deep-navy shadow-[0_6px_16px_rgba(7,19,31,0.035)]">
                    🔗
                  </div>

                  <div>
                    <h2 className="font-serif text-[1.65rem] font-normal tracking-[-0.025em] text-midnight-navy">
                      Public Profile
                    </h2>

                    <p className="mt-1.5 max-w-xl text-[13px] leading-6 text-slate-gray">
                      Create a custom link for this specific jewelry piece.
                    </p>
                  </div>
                </div>

                {experience.slug && (
                  <span className="inline-flex w-fit items-center gap-2 rounded-full border border-champagne-gold/25 bg-soft-cream px-3.5 py-2 text-[10px] font-semibold text-antique-gold">
                    <span className="h-1.5 w-1.5 rounded-full bg-classic-gold" />
                    Published
                  </span>
                )}
              </div>
            </div>

            <div className="relative space-y-7 px-6 py-7 sm:px-8 sm:py-8">
              <div>
                <label className="mb-2.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-midnight-navy">
                  Jewelry Serial Number
                </label>

                <div className="rounded-[14px] border border-light-champagne bg-silver-mist/60 px-5 py-4">
                  <p className="break-all font-mono text-[12px] font-semibold tracking-[0.05em] text-midnight-navy">
                    {serialNumber || "Serial Number Not Available"}
                  </p>
                </div>

                <p className="mt-2 text-[11px] leading-5 text-slate-gray">
                  This serial number uniquely identifies this physical jewelry
                  piece.
                </p>
              </div>

              <div>
                <label className="mb-2.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-midnight-navy">
                  Custom Link Name
                </label>

                <div className="flex flex-col overflow-hidden rounded-[14px] border border-light-champagne bg-soft-white transition-all duration-300 focus-within:border-classic-gold focus-within:ring-4 focus-within:ring-classic-gold/10 md:flex-row">
                  <div className="flex items-center border-b border-light-champagne bg-warm-ivory/70 px-4 py-3 text-[12px] text-slate-gray md:border-b-0 md:border-r">
                    <span className="whitespace-nowrap font-mono">
                      /experience/
                      {serialNumber || "SERIAL"}/
                    </span>
                  </div>

                  <input
                    type="text"
                    value={slug}
                    onChange={(e) =>
                      setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))
                    }
                    className="min-w-0 flex-1 bg-transparent px-4 py-3.5 text-[13px] text-midnight-navy outline-none placeholder:text-steel-gray"
                    placeholder="marioma"
                  />
                </div>

                <p className="mt-2 text-[11px] leading-5 text-slate-gray">
                  Your final link will look like:
                  <span className="ml-1 font-medium text-antique-gold">
                    /experience/
                    {serialNumber || "SU-XXXXXXXX-XXXXXX"}
                    /marioma
                  </span>
                </p>
              </div>

              <div>
                <label className="mb-2.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-midnight-navy">
                  Current Public Link
                </label>

                {publicLink ? (
                  <div className="flex flex-col gap-3 rounded-[16px] border border-light-champagne bg-warm-ivory/60 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="break-all text-[12px] font-medium leading-6 text-midnight-navy">
                        {publicLink}
                      </p>
                    </div>

                    <span className="shrink-0 rounded-full border border-champagne-gold/25 bg-soft-cream px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-antique-gold">
                      Public
                    </span>
                  </div>
                ) : (
                  <div className="rounded-[16px] border border-dashed border-light-champagne bg-warm-ivory/60 p-5">
                    <p className="text-[13px] font-semibold text-midnight-navy">
                      No public link yet.
                    </p>

                    <p className="mt-1.5 text-[11px] leading-5 text-slate-gray">
                      Enter a custom link name above and save it.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3 border-t border-light-champagne/80 pt-6 sm:flex-row">
                <button
                  onClick={handleSaveSlug}
                  className="inline-flex min-h-[46px] items-center justify-center rounded-[13px] bg-deep-navy px-6 text-[11px] font-semibold text-soft-white shadow-[0_9px_22px_rgba(13,34,53,0.13)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-midnight-navy hover:shadow-[0_13px_28px_rgba(13,34,53,0.19)] active:scale-[0.98]"
                >
                  Save Link
                </button>

                <button
                  onClick={copyLink}
                  disabled={!publicLink}
                  className={`inline-flex min-h-[46px] items-center justify-center rounded-[13px] px-6 text-[11px] font-semibold transition-all duration-300 active:scale-[0.98] ${
                    publicLink
                      ? "border border-light-champagne bg-soft-white text-midnight-navy hover:-translate-y-0.5 hover:border-champagne-gold hover:bg-warm-ivory"
                      : "cursor-not-allowed border border-light-champagne bg-silver-mist text-steel-gray"
                  }`}
                >
                  Copy Link
                </button>

                <button
                  onClick={openPublicProfile}
                  disabled={!publicLink}
                  className={`inline-flex min-h-[46px] items-center justify-center rounded-[13px] px-6 text-[11px] font-semibold transition-all duration-300 active:scale-[0.98] ${
                    publicLink
                      ? "bg-classic-gold text-deep-navy shadow-[0_8px_20px_rgba(201,162,77,0.13)] hover:-translate-y-0.5 hover:bg-champagne-gold"
                      : "cursor-not-allowed bg-silver-mist text-steel-gray"
                  }`}
                >
                  Open Profile
                </button>
              </div>
            </div>
          </section>

          <section className="relative overflow-hidden rounded-[28px] border border-light-champagne/90 bg-soft-white/90 shadow-[0_20px_60px_rgba(7,19,31,0.055)]">
            <div className="border-b border-light-champagne/80 bg-warm-ivory/50 px-6 py-7 sm:px-8">
              <div className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] border border-champagne-gold/20 bg-soft-cream text-[17px] text-deep-navy shadow-[0_6px_16px_rgba(7,19,31,0.035)]">
                  💌
                </div>

                <div>
                  <h2 className="font-serif text-[1.65rem] font-normal tracking-[-0.025em] text-midnight-navy">
                    Personal Message
                  </h2>

                  <p className="mt-1.5 text-[13px] leading-6 text-slate-gray">
                    Add a personal touch to the jewelry experience.
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-7 sm:px-8">
              <PersonalInfoForm
                form={form}
                handleChange={handleChange}
                handleSave={handleSave}
                saving={saving}
              />
            </div>
          </section>

          <section className="relative overflow-hidden rounded-[28px] border border-light-champagne/90 bg-soft-white/90 shadow-[0_20px_60px_rgba(7,19,31,0.055)]">
            <div className="border-b border-light-champagne/80 bg-warm-ivory/50 px-6 py-7 sm:px-8">
              <div className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] border border-champagne-gold/20 bg-soft-cream text-[17px] text-deep-navy shadow-[0_6px_16px_rgba(7,19,31,0.035)]">
                  📷
                </div>

                <div>
                  <h2 className="font-serif text-[1.65rem] font-normal tracking-[-0.025em] text-midnight-navy">
                    Add Memories
                  </h2>

                  <p className="mt-1.5 text-[13px] leading-6 text-slate-gray">
                    Upload photos, videos, audio messages, or other memories.
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-7 sm:px-8">
              <MediaUploader uploadFiles={handleUpload} />
            </div>
          </section>

          <section className="relative overflow-hidden rounded-[28px] border border-light-champagne/90 bg-soft-white/90 shadow-[0_20px_60px_rgba(7,19,31,0.055)]">
            <div className="border-b border-light-champagne/80 bg-warm-ivory/50 px-6 py-7 sm:px-8">
              <div className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] border border-champagne-gold/20 bg-soft-cream text-[17px] text-deep-navy shadow-[0_6px_16px_rgba(7,19,31,0.035)]">
                  ✨
                </div>

                <div>
                  <h2 className="font-serif text-[1.65rem] font-normal tracking-[-0.025em] text-midnight-navy">
                    Your Memories
                  </h2>

                  <p className="mt-1.5 text-[13px] leading-6 text-slate-gray">
                    All the photos and memories connected to this experience.
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-7 sm:px-8">
              <MediaGallery media={media} />
            </div>
          </section>
        </div>
      </main>

      <footer className="relative overflow-hidden border-t border-rich-navy bg-gradient-to-r from-deep-navy via-rich-navy to-deep-navy">
        <div className="mx-auto max-w-6xl px-5 py-7 text-center sm:px-8">
          <p className="text-[11px] tracking-wide text-premium-silver">
            Crafted with care for your special jewelry experience
            <span className="mx-2 text-classic-gold">✦</span>
            Smart Jewelry
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ManageExperiencePage;
