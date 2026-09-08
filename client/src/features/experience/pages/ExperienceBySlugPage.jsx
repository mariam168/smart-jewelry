import { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";

import { useParams } from "react-router-dom";

import {
  getPublicExperience,
  unlockPublicExperience,
} from "../services/experienceApi";

import MediaGallery from "../components/MediaGallery";
import getMediaUrl from "../utils/mediaUrl";

const ExperienceBySlugPage = () => {
  const { serialNumber, slug } = useParams();

  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);

  const [experience, setExperience] = useState(null);

  const [personal, setPersonal] = useState(null);

  const [media, setMedia] = useState([]);

  const [requiresDate, setRequiresDate] = useState(false);

  const [accessDate, setAccessDate] = useState("");

  const [unlocking, setUnlocking] = useState(false);

  const [unlockError, setUnlockError] = useState("");

  const [pageError, setPageError] = useState("");

  const applyExperiencePayload = (payload) => {
    if (!payload?.experience?._id) {
      setExperience(null);

      setPersonal(null);

      setMedia([]);

      return false;
    }

    setExperience(payload.experience);

    setPersonal(payload.personal || null);

    setMedia(
      Array.isArray(payload.media)
        ? payload.media.filter((item) =>
            ["image", "video", "audio"].includes(item?.type),
          )
        : [],
    );

    return true;
  };

  const loadExperience = async () => {
    if (!serialNumber || !slug) {
      setExperience(null);

      setPersonal(null);

      setMedia([]);

      setRequiresDate(false);

      setPageError(
        t("experienceBySlug.incompleteLink"),
      );

      setLoading(false);

      return;
    }

    try {
      setLoading(true);

      setPageError("");
      setUnlockError("");
      setAccessDate("");

      const response = await getPublicExperience(
        serialNumber,
        slug,
      );

      if (response?.requiresDate === true) {
        setRequiresDate(true);

        setExperience(null);

        setPersonal(null);

        setMedia([]);

        return;
      }

      setRequiresDate(false);

      const loaded = applyExperiencePayload(
        response?.data || null,
      );

      if (!loaded) {
        setPageError(
          t("experienceBySlug.unavailableExperience"),
        );
      }
    } catch (error) {
      console.error(
        "FAILED TO LOAD PUBLIC EXPERIENCE:",
        error,
      );

      setExperience(null);

      setPersonal(null);

      setMedia([]);

      setRequiresDate(false);

      setPageError(
        error?.response?.data?.message ||
          t("experienceBySlug.unavailableExperience"),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExperience();
  }, [serialNumber, slug]);

  const handleUnlock = async (event) => {
    event.preventDefault();

    if (!accessDate) {
      setUnlockError(
        t("experienceBySlug.enterSpecialDate"),
      );

      return;
    }

    try {
      setUnlocking(true);

      setUnlockError("");

      const payload = await unlockPublicExperience(
        serialNumber,
        slug,
        accessDate,
      );

      const loaded = applyExperiencePayload(payload);

      if (!loaded) {
        setUnlockError(
          t("experienceBySlug.unableToOpen"),
        );

        return;
      }

      setRequiresDate(false);

      setAccessDate("");
    } catch (error) {
      console.error(
        "UNLOCK EXPERIENCE ERROR:",
        error,
      );

      setUnlockError(
        error?.response?.data?.message ||
          t("experienceBySlug.incorrectDate"),
      );
    } finally {
      setUnlocking(false);
    }
  };

  if (loading) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#102D45] px-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(217,188,120,0.12),transparent_28%),radial-gradient(circle_at_15%_80%,rgba(255,255,255,0.045),transparent_28%),linear-gradient(135deg,#102D45_0%,#0B2235_58%,#071A29_100%)]" />

        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#D9BC78]/[0.035]" />

        <div className="absolute left-1/2 top-1/2 h-[440px] w-[440px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-[#D9BC78]/[0.05] animate-[spin_30s_linear_infinite]" />

        <div className="absolute -left-40 top-0 h-[480px] w-[480px] rounded-full bg-[#F3ECE2]/[0.035] blur-[130px] animate-pulse" />

        <div className="absolute -right-40 bottom-0 h-[520px] w-[520px] rounded-full bg-[#C9A24D]/[0.045] blur-[140px] animate-pulse" />

        <div className="relative z-10 text-center animate-[fadeIn_1s_ease-out]">
          <div className="relative mx-auto h-32 w-32">
            <div className="absolute -inset-5 rounded-full border border-[#D9BC78]/[0.08]" />

            <div className="absolute -inset-3 rounded-full border border-dashed border-[#C9A24D]/25 animate-[spin_18s_linear_infinite]" />

            <div className="absolute -inset-1 rounded-full border border-[#D9BC78]/20" />

            <div className="absolute inset-3 rounded-full bg-[#0B2235] shadow-[0_25px_80px_rgba(0,0,0,0.4)]" />

            <div className="absolute inset-7 flex items-center justify-center rounded-full border border-[#D9BC78]/15 bg-[#102D45]">
              <span className="animate-pulse text-2xl text-[#D9BC78]">
                ✦
              </span>
            </div>
          </div>

          <div className="mt-10 flex items-center justify-center gap-4">
            <span className="h-px w-12 bg-gradient-to-r from-transparent to-[#D9BC78]/40" />

            <p className="text-[9px] font-semibold uppercase tracking-[0.5em] text-[#F3ECE2]/50">
              {t("experienceBySlug.preparingExperience")}
            </p>

            <span className="h-px w-12 bg-gradient-to-l from-transparent to-[#D9BC78]/40" />
          </div>
        </div>

        <style>
          {`
            @keyframes fadeIn {
              from {
                opacity: 0;
                transform: translateY(14px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}
        </style>
      </div>
    );
  }

  if (requiresDate) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#102D45] px-5 py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(217,188,120,0.10),transparent_30%),linear-gradient(145deg,#102D45_0%,#0B2235_60%,#071A29_100%)]" />

        <div className="pointer-events-none absolute -left-40 -top-32 h-[520px] w-[520px] rounded-full bg-[#F1E9DD]/[0.035] blur-[130px]" />

        <div className="pointer-events-none absolute -bottom-40 -right-32 h-[560px] w-[560px] rounded-full bg-[#C9A24D]/[0.045] blur-[140px]" />

        <div className="pointer-events-none absolute left-1/2 top-10 h-[330px] w-[330px] -translate-x-1/2 rounded-full border border-[#D9BC78]/[0.035]" />

        <div className="pointer-events-none absolute left-1/2 top-10 h-[280px] w-[280px] -translate-x-1/2 rounded-full border border-dashed border-[#D9BC78]/[0.045] animate-[spin_28s_linear_infinite]" />

        <div className="relative w-full max-w-[550px] animate-[unlockEnter_0.8s_ease-out]">
          <div className="absolute -inset-[1px] rounded-[42px] bg-gradient-to-b from-[#D9BC78]/35 via-[#C9A24D]/10 to-transparent" />

          <div className="relative overflow-hidden rounded-[42px] border border-[#F1E9DD]/10 bg-[#0B2235]/95 shadow-[0_50px_150px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
            <div className="absolute left-0 right-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#D9BC78] to-transparent" />

            <div className="absolute -right-32 -top-32 h-72 w-72 rounded-full bg-[#C9A24D]/[0.05] blur-[80px]" />

            <div className="absolute -left-28 bottom-0 h-64 w-64 rounded-full bg-[#F1E9DD]/[0.025] blur-[80px]" />

            <div className="relative px-8 pb-10 pt-12 text-center sm:px-12 sm:pb-11 sm:pt-14">
              <div className="flex items-center justify-center gap-4">
                <span className="h-px w-12 bg-gradient-to-r from-transparent to-[#D9BC78]/50" />

                <span className="text-[8px] font-semibold uppercase tracking-[0.5em] text-[#D9BC78]">
                  JE VORYA
                </span>

                <span className="h-px w-12 bg-gradient-to-l from-transparent to-[#D9BC78]/50" />
              </div>

              <div className="relative mx-auto mt-10 h-[108px] w-[108px]">
                <div className="absolute -inset-4 rounded-full border border-dashed border-[#C9A24D]/20 animate-[spin_20s_linear_infinite]" />

                <div className="absolute -inset-1 rounded-full border border-[#D9BC78]/30" />

                <div className="absolute inset-0 rounded-full bg-[#102D45] shadow-[0_25px_70px_rgba(0,0,0,0.35)]" />

                <div className="absolute inset-5 flex items-center justify-center rounded-full border border-[#D9BC78]/15 bg-[#0B2235]">
                  <span className="animate-pulse text-[26px] text-[#D9BC78]">
                    ✦
                  </span>
                </div>
              </div>

              <p className="mt-10 text-[9px] font-semibold uppercase tracking-[0.48em] text-[#D9BC78]">
                {t("experienceBySlug.privateJewelryExperience")}
              </p>

              <h1 className="mt-5 font-serif text-[2.9rem] font-normal leading-[0.98] tracking-[-0.055em] text-[#F8F3EC] sm:text-[3.6rem]">
                {t("experienceBySlug.specialDate")}
              </h1>

              <div className="mx-auto mt-7 flex items-center justify-center gap-3">
                <span className="h-px w-8 bg-[#D9BC78]/30" />

                <span className="text-[10px] text-[#D9BC78]/60">
                  ✦
                </span>

                <span className="h-px w-8 bg-[#D9BC78]/30" />
              </div>

              <p className="mx-auto mt-6 max-w-sm text-[13px] leading-7 text-[#F1E9DD]/65">
                {t("experienceBySlug.protectedDescription")}
              </p>
            </div>

            <form
              onSubmit={handleUnlock}
              className="relative border-t border-[#F1E9DD]/[0.07] px-8 pb-10 pt-9 sm:px-12 sm:pb-12"
            >
              <label className="mb-3 block text-[9px] font-semibold uppercase tracking-[0.3em] text-[#F1E9DD]/50">
                {t("experienceBySlug.enterSpecialDate")}
              </label>

              <div className="group relative">
                <input
                  type="date"
                  value={accessDate}
                  onChange={(event) => {
                    setAccessDate(event.target.value);

                    setUnlockError("");
                  }}
                  className="h-[64px] w-full rounded-[18px] border border-[#F1E9DD]/10 bg-[#F1E9DD]/[0.045] px-5 text-[14px] font-medium text-[#F8F3EC] outline-none transition-all duration-500 [color-scheme:dark] hover:border-[#C9A24D]/30 hover:bg-[#F1E9DD]/[0.065] focus:border-[#C9A24D]/60 focus:bg-[#F1E9DD]/[0.07] focus:ring-4 focus:ring-[#C9A24D]/10"
                />

                <div className="pointer-events-none absolute bottom-0 left-5 right-5 h-px origin-center scale-x-0 bg-gradient-to-r from-transparent via-[#D9BC78] to-transparent transition-transform duration-700 group-focus-within:scale-x-100" />
              </div>

              {unlockError && (
                <div className="mt-4 animate-[fadeIn_0.3s_ease-out] rounded-[15px] border border-red-300/15 bg-red-400/[0.07] px-4 py-3.5 text-[11px] leading-5 text-red-200">
                  {unlockError}
                </div>
              )}

              <button
                type="submit"
                disabled={unlocking}
                className="group relative mt-7 inline-flex min-h-[60px] w-full items-center justify-center gap-3 overflow-hidden rounded-[18px] bg-[#D9BC78] px-7 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#102D45] shadow-[0_20px_50px_rgba(201,162,77,0.20)] transition-all duration-500 hover:-translate-y-1 hover:bg-[#E4CA8B] hover:shadow-[0_28px_70px_rgba(201,162,77,0.28)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                <span className="absolute inset-0 -translate-x-full bg-white/20 transition-transform duration-700 group-hover:translate-x-full" />

                <span className="relative">
                  {unlocking
                    ? t("experienceBySlug.checkingDate")
                    : t("experienceBySlug.openExperience")}
                </span>

                {!unlocking && (
                  <span className="relative text-sm transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                )}
              </button>

              <div className="mt-7 flex items-center justify-center gap-3">
                <span className="h-px w-8 bg-[#D9BC78]/20" />

                <span className="text-[9px] uppercase tracking-[0.3em] text-[#F1E9DD]/25">
                  Private Experience
                </span>

                <span className="h-px w-8 bg-[#D9BC78]/20" />
              </div>
            </form>
          </div>
        </div>

        <style>
          {`
            @keyframes unlockEnter {
              from {
                opacity: 0;
                transform: translateY(24px) scale(0.97);
              }
              to {
                opacity: 1;
                transform: translateY(0) scale(1);
              }
            }

            @keyframes fadeIn {
              from {
                opacity: 0;
              }
              to {
                opacity: 1;
              }
            }
          `}
        </style>
      </div>
    );
  }

  if (!experience) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F3ECE2] px-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(201,162,77,0.10),transparent_32%)]" />

        <div className="pointer-events-none absolute -left-28 top-10 h-64 w-64 rounded-full bg-[#102D45]/[0.035] blur-[90px]" />

        <div className="pointer-events-none absolute -bottom-28 -right-20 h-72 w-72 rounded-full bg-[#C9A24D]/[0.07] blur-[100px]" />

        <div className="relative w-full max-w-lg animate-[notFoundEnter_0.7s_ease-out] overflow-hidden rounded-[40px] border border-[#D9CBB8] bg-[#FCF9F4] p-10 text-center shadow-[0_40px_120px_rgba(16,45,69,0.12)] sm:p-12">
          <div className="absolute left-1/2 top-0 h-[2px] w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-[#C9A24D]/70 to-transparent" />

          <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-[#C9A24D]/[0.05] blur-[55px]" />

          <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-[#C9A24D]/25 bg-[#102D45] text-3xl text-[#D9BC78] shadow-[0_18px_50px_rgba(16,45,69,0.18)]">
            <div className="absolute -inset-2 rounded-full border border-dashed border-[#C9A24D]/20 animate-[spin_18s_linear_infinite]" />

            <span>♡</span>
          </div>

          <p className="mt-9 text-[9px] font-semibold uppercase tracking-[0.44em] text-[#A7843E]">
            {t("experienceBySlug.smartJewelry")}
          </p>

          <h1 className="mt-5 font-serif text-[2.7rem] tracking-[-0.05em] text-[#102D45]">
            {t("experienceBySlug.experienceNotFound")}
          </h1>

          <div className="mx-auto mt-6 flex items-center justify-center gap-3">
            <span className="h-px w-10 bg-[#C9A24D]/35" />

            <span className="text-[9px] text-[#A7843E]">
              ✦
            </span>

            <span className="h-px w-10 bg-[#C9A24D]/35" />
          </div>

          <p className="mx-auto mt-6 max-w-md text-[13px] leading-7 text-[#64717B]">
            {pageError ||
              t("experienceBySlug.privateExperienceUnavailable")}
          </p>
        </div>

        <style>
          {`
            @keyframes notFoundEnter {
              from {
                opacity: 0;
                transform: translateY(18px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}
        </style>
      </div>
    );
  }

  const profileImageUrl = personal?.profileImage
    ? getMediaUrl(personal.profileImage)
    : "";

  return (
    <div className="min-h-screen overflow-hidden bg-[#F3ECE2] text-[#102D45]">
      <section className="relative overflow-hidden bg-[#102D45]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_58%_5%,rgba(217,188,120,0.12),transparent_27%),radial-gradient(circle_at_5%_70%,rgba(255,255,255,0.045),transparent_25%),linear-gradient(135deg,#102D45_0%,#0B2235_62%,#071A29_100%)]" />

        <div className="absolute -left-56 -top-48 h-[680px] w-[680px] rounded-full bg-[#F3ECE2]/[0.035] blur-[130px] animate-pulse" />

        <div className="absolute -right-60 top-0 h-[700px] w-[700px] rounded-full bg-[#C9A24D]/[0.045] blur-[140px] animate-pulse" />

        <div className="absolute left-1/2 top-0 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-[#D9BC78]/[0.025] blur-[120px]" />

        <div className="absolute left-[4%] top-[22%] hidden text-[170px] font-serif leading-none text-[#D9BC78]/[0.025] lg:block">
          ✦
        </div>

        <div className="absolute right-[5%] top-[15%] hidden text-[190px] font-serif leading-none text-[#F3ECE2]/[0.025] lg:block">
          ♡
        </div>

        <div className="absolute left-[12%] top-[58%] hidden h-1 w-1 rounded-full bg-[#D9BC78]/50 shadow-[0_0_25px_8px_rgba(217,188,120,0.08)] lg:block" />

        <div className="absolute right-[15%] top-[48%] hidden h-1 w-1 rounded-full bg-[#D9BC78]/40 shadow-[0_0_25px_8px_rgba(217,188,120,0.08)] lg:block" />

        <div className="relative mx-auto max-w-7xl px-5 pb-0 pt-14 md:px-8 md:pt-20">
          <div className="mx-auto max-w-5xl text-center">
            <div className="animate-[fadeDown_0.8s_ease-out]">
              <div className="flex items-center justify-center gap-4">
                <span className="h-px w-12 bg-gradient-to-r from-transparent to-[#D9BC78]/60 md:w-24" />

                <p className="text-[8px] font-semibold uppercase tracking-[0.52em] text-[#D9BC78]">
                  {t("experienceBySlug.privateJewelryExperience")}
                </p>

                <span className="h-px w-12 bg-gradient-to-l from-transparent to-[#D9BC78]/60 md:w-24" />
              </div>
            </div>

            <div className="mt-14 flex justify-center animate-[profileEnter_1s_ease-out]">
              <div className="relative">
                <div className="absolute -inset-9 rounded-full border border-[#D9BC78]/[0.08] animate-[spin_30s_linear_infinite]" />

                <div className="absolute -inset-7 rounded-full border border-dashed border-[#D9BC78]/15 animate-[spin_22s_linear_infinite_reverse]" />

                <div className="absolute -inset-4 rounded-full border border-[#C9A24D]/35" />

                <div className="absolute -inset-1 rounded-full bg-[#D9BC78]/[0.08] blur-md" />

                {profileImageUrl ? (
                  <img
                    src={profileImageUrl}
                    alt={
                      personal?.ownerName ||
                      t("experienceBySlug.profile")
                    }
                    className="relative h-32 w-32 rounded-full border-2 border-[#D9BC78]/85 object-cover shadow-[0_35px_90px_rgba(0,0,0,0.48)] transition-all duration-700 hover:scale-[1.04] hover:border-[#F0D99D] md:h-40 md:w-40"
                  />
                ) : (
                  <div className="relative flex h-32 w-32 items-center justify-center rounded-full border-2 border-[#D9BC78]/85 bg-[#0B2235] text-4xl text-[#D9BC78] shadow-[0_35px_90px_rgba(0,0,0,0.48)] md:h-40 md:w-40">
                    ♥
                  </div>
                )}

                <div className="absolute -right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-[#D9BC78]/30 bg-[#102D45] text-[10px] text-[#D9BC78]">
                  ✦
                </div>

                <div className="absolute -left-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-[#D9BC78]/30 bg-[#102D45] text-[10px] text-[#D9BC78]">
                  ✦
                </div>
              </div>
            </div>

            <div className="animate-[fadeUp_0.9s_0.15s_both_ease-out]">
              <p className="mt-16 text-[9px] uppercase tracking-[0.38em] text-[#F3ECE2]/45">
                {personal?.receiverName
                  ? t("experienceBySlug.createdFor")
                  : t("experienceBySlug.specialExperience")}
              </p>

              <h1 className="mx-auto mt-5 max-w-5xl font-serif text-5xl leading-[0.95] tracking-[-0.06em] text-[#FCF9F4] sm:text-6xl md:text-8xl">
                {personal?.title ||
                  t("experienceBySlug.specialExperienceTitle")}
              </h1>

              {personal?.receiverName && (
                <>
                  <div className="mx-auto mt-8 flex items-center justify-center gap-4">
                    <span className="h-px w-8 bg-[#D9BC78]/30" />

                    <span className="text-[9px] text-[#D9BC78]/60">
                      ✦
                    </span>

                    <span className="h-px w-8 bg-[#D9BC78]/30" />
                  </div>

                  <p className="mt-5 font-serif text-3xl text-[#D9BC78] md:text-5xl">
                    {personal.receiverName}
                  </p>
                </>
              )}

              {personal?.ownerName && (
                <p className="mt-9 text-[9px] uppercase tracking-[0.36em] text-[#F3ECE2]/45">
                  {t("experienceBySlug.withLoveFrom")}{" "}
                  <span className="font-semibold text-[#D9BC78]">
                    {personal.ownerName}
                  </span>
                </p>
              )}
            </div>
          </div>

          <div className="relative mt-20 h-28 overflow-hidden md:mt-24 md:h-36">
            <div className="absolute left-1/2 top-0 h-[210px] w-[140%] -translate-x-1/2 rounded-[50%_50%_0_0/100%_100%_0_0] bg-[#F3ECE2] md:h-[260px]" />

            <div className="absolute left-1/2 top-0 h-[208px] w-[140%] -translate-x-1/2 rounded-[50%_50%_0_0/100%_100%_0_0] border-t border-[#D9BC78]/25 md:h-[258px]" />

            <div className="absolute left-1/2 top-5 h-[185px] w-[136%] -translate-x-1/2 rounded-[50%_50%_0_0/100%_100%_0_0] border-t border-[#102D45]/[0.035] md:h-[235px]" />
          </div>
        </div>
      </section>

      <main className="relative mx-auto max-w-7xl px-5 pb-20 md:px-8 md:pb-28">
        <section className="relative mx-auto -mt-2 max-w-6xl overflow-hidden rounded-[36px] bg-[#102D45] shadow-[0_40px_110px_rgba(16,45,69,0.20)] animate-[contentEnter_0.9s_0.2s_both_ease-out] md:-mt-4">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_88%_8%,rgba(201,162,77,0.09),transparent_28%),radial-gradient(circle_at_0%_100%,rgba(255,255,255,0.035),transparent_25%)]" />

          <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-[#C9A24D]/[0.035] blur-[90px]" />

          <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-[#F3ECE2]/[0.025] blur-[90px]" />

          <div className="absolute right-8 top-1 font-serif text-[250px] leading-none text-[#D9BC78]/[0.045] transition-transform duration-700 hover:translate-x-2 hover:-translate-y-1">
            “
          </div>

          <div className="absolute bottom-5 left-8 text-5xl text-[#D9BC78]/[0.035]">
            ✦
          </div>

          <div className="relative z-10 px-7 py-12 md:px-14 md:py-16 lg:px-20 lg:py-20">
            <div className="flex items-center gap-4">
              <span className="h-px w-12 bg-[#D9BC78]/60" />

              <p className="text-[9px] font-semibold uppercase tracking-[0.4em] text-[#D9BC78]">
                {t("experienceBySlug.personalMessage")}
              </p>
            </div>

            <div className="mt-7 flex items-center gap-3">
              <div className="h-px w-16 bg-gradient-to-r from-[#D9BC78]/70 to-transparent" />

              <span className="text-[8px] text-[#D9BC78]/50">
                ✦
              </span>
            </div>

            <p className="mt-8 max-w-5xl whitespace-pre-wrap font-serif text-2xl font-light leading-[1.7] tracking-[-0.02em] text-[#FCF9F4] md:text-3xl lg:text-[39px]">
              {personal?.message ||
                t("experienceBySlug.defaultMessage")}
            </p>

            {personal?.ownerName && (
              <div className="mt-14 flex items-center gap-4">
                <div className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#D9BC78]/25 bg-[#0B2235] text-[12px] text-[#D9BC78]">
                  ✦
                </div>

                <div className="h-8 w-px bg-[#D9BC78]/20" />

                <div>
                  <p className="text-[8px] uppercase tracking-[0.34em] text-[#F3ECE2]/40">
                    {t("experienceBySlug.withLove")}
                  </p>

                  <p className="mt-1 font-serif text-xl text-[#D9BC78] md:text-2xl">
                    {personal.ownerName}
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {media.length > 0 && (
          <section className="relative mt-12 overflow-hidden rounded-[38px] border border-[#D9CBB8] bg-[#FCF9F4] p-6 shadow-[0_35px_100px_rgba(16,45,69,0.10)] animate-[contentEnter_0.9s_0.35s_both_ease-out] transition-all duration-700 hover:shadow-[0_45px_120px_rgba(16,45,69,0.14)] md:p-10 lg:p-14">
            <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-[#C9A24D]/[0.065] blur-[90px]" />

            <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-[#102D45]/[0.035] blur-[90px]" />

            <div className="absolute left-0 top-0 h-[2px] w-1/3 bg-gradient-to-r from-[#C9A24D]/60 to-transparent" />

            <div className="absolute bottom-0 right-0 h-[2px] w-1/3 bg-gradient-to-l from-[#C9A24D]/40 to-transparent" />

            <div className="relative z-10 mb-10 text-center">
              <div className="flex items-center justify-center gap-4">
                <span className="h-px w-12 bg-gradient-to-r from-transparent to-[#A7843E]/60" />

                <p className="text-[9px] font-semibold uppercase tracking-[0.45em] text-[#A7843E]">
                  {t("experienceBySlug.memories")}
                </p>

                <span className="h-px w-12 bg-gradient-to-l from-transparent to-[#A7843E]/60" />
              </div>

              <h2 className="mt-5 font-serif text-4xl leading-none tracking-[-0.05em] text-[#102D45] md:text-5xl lg:text-6xl">
                {t("experienceBySlug.momentsToRemember")}
              </h2>

              <div className="mx-auto mt-6 flex items-center justify-center gap-3">
                <span className="h-px w-10 bg-[#C9A24D]/35" />

                <span className="text-[9px] text-[#A7843E]">
                  ✦
                </span>

                <span className="h-px w-10 bg-[#C9A24D]/35" />
              </div>
            </div>

            <div className="relative z-10">
              <MediaGallery media={media} />
            </div>
          </section>
        )}

        <footer className="relative py-16 text-center animate-[fadeUp_1s_0.5s_both_ease-out]">
          <div className="mx-auto flex max-w-md items-center justify-center gap-4">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent to-[#A7843E]/50" />

            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#C9A24D]/25 bg-[#FCF9F4] text-[12px] text-[#A7843E]">
              ♡
            </div>

            <span className="h-px flex-1 bg-gradient-to-l from-transparent to-[#A7843E]/50" />
          </div>

          <p className="mt-7 text-[9px] font-semibold uppercase tracking-[0.4em] text-[#64717B]">
            {t("experienceBySlug.smartJewelryExperience")}
          </p>

          <p className="mt-2 text-[12px] text-[#8A9297]">
            {t("experienceBySlug.memoryMadeSpecial")}
          </p>

          <div className="mt-5 flex items-center justify-center gap-2">
            <span className="h-1 w-1 rounded-full bg-[#C9A24D]/50" />

            <span className="h-1 w-1 rounded-full bg-[#C9A24D]/30" />

            <span className="h-1 w-1 rounded-full bg-[#C9A24D]/50" />
          </div>
        </footer>
      </main>

      <style>
        {`
          @keyframes fadeDown {
            from {
              opacity: 0;
              transform: translateY(-12px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes fadeUp {
            from {
              opacity: 0;
              transform: translateY(18px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes profileEnter {
            from {
              opacity: 0;
              transform: scale(0.88);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }

          @keyframes contentEnter {
            from {
              opacity: 0;
              transform: translateY(22px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </div>
  );
};

export default ExperienceBySlugPage;