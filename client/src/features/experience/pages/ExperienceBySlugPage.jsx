import { useEffect, useMemo, useState } from "react";

import { useTranslation } from "react-i18next";

import { useParams } from "react-router-dom";

import {
  getPublicExperience,
  unlockPublicExperience,
} from "../services/experienceApi";

import MediaGallery from "../components/MediaGallery";
import getMediaUrl from "../utils/mediaUrl";
const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const isArabic = i18n.language?.startsWith("ar");

  const handleLanguageChange = (language) => {
    i18n.changeLanguage(language);
  };

  return (
  <div className="absolute right-4 top-4 z-[100] flex items-center gap-1 rounded-full border border-[#D9BC78]/30 bg-white/90 p-1 shadow-[0_8px_25px_rgba(54,67,101,0.12)] backdrop-blur-md sm:right-6 sm:top-6">  <button
        type="button"
        onClick={() => handleLanguageChange("ar")}
        className={`rounded-full px-3 py-1.5 text-[9px] font-semibold tracking-wider transition-all ${
          isArabic
            ? "bg-[#364365] text-white"
            : "text-[#536174] hover:bg-[#364365]/[0.07]"
        }`}
      >
        AR
      </button>

      <button
        type="button"
        onClick={() => handleLanguageChange("en")}
        className={`rounded-full px-3 py-1.5 text-[9px] font-semibold tracking-wider transition-all ${
          !isArabic
            ? "bg-[#364365] text-white"
            : "text-[#536174] hover:bg-[#364365]/[0.07]"
        }`}
      >
        EN
      </button>
    </div>
  );
};
const ExperienceBySlugPage = () => {
  const { serialNumber, slug } = useParams();

  const { t, i18n } = useTranslation();

const isArabic = i18n.language?.startsWith("ar");
const locale = isArabic ? "ar-EG" : "en-US";

  const [loading, setLoading] = useState(true);

  const [experience, setExperience] = useState(null);

  const [personal, setPersonal] = useState(null);

  const [media, setMedia] = useState([]);

  const [requiresDate, setRequiresDate] = useState(false);

  const [accessDate, setAccessDate] = useState("");

  const [unlocking, setUnlocking] = useState(false);

  const [unlockError, setUnlockError] = useState("");

  const [pageError, setPageError] = useState("");

  const [calendarDate, setCalendarDate] = useState(() => new Date());
const [showYearPicker, setShowYearPicker] = useState(false);
const [selectedYear, setSelectedYear] = useState(
  () => new Date().getFullYear(),
);

const [yearRangeStart, setYearRangeStart] = useState(
  () => new Date().getFullYear() - 6,
);
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

      setPageError(t("experienceBySlug.incompleteLink"));

      setLoading(false);

      return;
    }

    try {
      setLoading(true);

      setPageError("");
      setUnlockError("");
      setAccessDate("");

      const response = await getPublicExperience(serialNumber, slug);

      if (response?.requiresDate === true) {
        setRequiresDate(true);

        setExperience(null);

        setPersonal(null);

        setMedia([]);

        return;
      }

      setRequiresDate(false);

      const loaded = applyExperiencePayload(response?.data || null);

      if (!loaded) {
        setPageError(t("experienceBySlug.unavailableExperience"));
      }
    } catch (error) {
      console.error("FAILED TO LOAD PUBLIC EXPERIENCE:", error);

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
      setUnlockError(t("experienceBySlug.enterSpecialDate"));

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
        setUnlockError(t("experienceBySlug.unableToOpen"));

        return;
      }

      setRequiresDate(false);

      setAccessDate("");
    } catch (error) {
      console.error("UNLOCK EXPERIENCE ERROR:", error);

      setUnlockError(
        error?.response?.data?.message || t("experienceBySlug.incorrectDate"),
      );
    } finally {
      setUnlocking(false);
    }
  };

const calendarMonthLabel = useMemo(() => {
  return new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
  }).format(calendarDate);
}, [calendarDate, locale]);

  const calendarDays = useMemo(() => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const firstDayIndex = firstDay.getDay();

    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const daysInPreviousMonth = new Date(year, month, 0).getDate();

    const days = [];

    for (let index = firstDayIndex - 1; index >= 0; index -= 1) {
      days.push({
        day: daysInPreviousMonth - index,
        month,
        year,
        currentMonth: false,
      });
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      days.push({
        day,
        month,
        year,
        currentMonth: true,
      });
    }

    let nextDay = 1;

    while (days.length < 42) {
      days.push({
        day: nextDay,
        month: month + 2,
        year,
        currentMonth: false,
      });

      nextDay += 1;
    }

    return days;
  }, [calendarDate]);

  const selectedDateObject = useMemo(() => {
    if (!accessDate) {
      return null;
    }

    const [year, month, day] = accessDate.split("-").map(Number);

    if (!year || !month || !day) {
      return null;
    }

    return new Date(year, month - 1, day);
  }, [accessDate]);

  const isSelectedDate = (dayData) => {
    if (!selectedDateObject || !dayData.currentMonth) {
      return false;
    }

    return (
      selectedDateObject.getFullYear() === dayData.year &&
      selectedDateObject.getMonth() === calendarDate.getMonth() &&
      selectedDateObject.getDate() === dayData.day
    );
  };

  const isToday = (dayData) => {
    const today = new Date();

    return (
      dayData.currentMonth &&
      today.getFullYear() === dayData.year &&
      today.getMonth() === calendarDate.getMonth() &&
      today.getDate() === dayData.day
    );
  };

  const handleCalendarDateSelect = (dayData) => {
    if (!dayData.currentMonth || unlocking) {
      return;
    }

    const month = String(calendarDate.getMonth() + 1).padStart(2, "0");

    const day = String(dayData.day).padStart(2, "0");

    const formattedDate = `${calendarDate.getFullYear()}-${month}-${day}`;

    setAccessDate(formattedDate);

    setUnlockError("");
  };

  const goToPreviousMonth = () => {
    if (unlocking) {
      return;
    }

    setCalendarDate(
      (currentDate) =>
        new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
    );
  };

  const goToNextMonth = () => {
    if (unlocking) {
      return;
    }

    setCalendarDate(
      (currentDate) =>
        new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
    );
  };

 const formattedSelectedDate = useMemo(() => {
  if (!selectedDateObject) {
    return "";
  }

  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(selectedDateObject);
}, [selectedDateObject, locale]);

  if (loading) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#102D45] px-6">
          <LanguageSwitcher />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(217,188,120,0.12),transparent_28%),radial-gradient(circle_at_15%_80%,rgba(255,255,255,0.045),transparent_28%),linear-gradient(135deg,#102D45_0%,#0B2235_58%,#071A29_100%)]" />

        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#D9BC78]/[0.035]" />

        <div className="absolute left-1/2 top-1/2 h-[440px] w-[440px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-[#C9A24D]/[0.05] animate-[spin_30s_linear_infinite]" />

        <div className="absolute -left-40 top-0 h-[480px] w-[480px] rounded-full bg-[#F3ECE2]/[0.035] blur-[130px] animate-pulse" />

        <div className="absolute -right-40 bottom-0 h-[520px] w-[520px] rounded-full bg-[#C9A24D]/[0.045] blur-[140px] animate-pulse" />

        <div className="relative z-10 text-center animate-[fadeIn_1s_ease-out]">
          <div className="relative mx-auto h-32 w-32">
            <div className="absolute -inset-5 rounded-full border border-[#D9BC78]/[0.08]" />

            <div className="absolute -inset-3 rounded-full border border-dashed border-[#C9A24D]/25 animate-[spin_18s_linear_infinite]" />

            <div className="absolute -inset-1 rounded-full border border-[#D9BC78]/20" />

            <div className="absolute inset-3 rounded-full bg-[#0B2235] shadow-[0_25px_80px_rgba(0,0,0,0.4)]" />

            <div className="absolute inset-7 flex items-center justify-center rounded-full border border-[#D9BC78]/15 bg-[#102D45]">
              <span className="animate-pulse text-2xl text-[#D9BC78]">✦</span>
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
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#EAF1F7] px-4 py-8 sm:px-6">
        <LanguageSwitcher />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(255,255,255,0.95),transparent_30%),radial-gradient(circle_at_85%_85%,rgba(54,67,101,0.12),transparent_34%),linear-gradient(135deg,#F8FBFD_0%,#EAF1F7_48%,#DDE8F1_100%)]" />

        <div className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-white/70 blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-[#364365]/10 blur-[110px]" />

        <div className="relative w-full max-w-[520px] animate-[unlockEnter_0.7s_ease-out]">
          <div className="overflow-hidden rounded-[30px] border border-white/80 bg-white shadow-[0_30px_90px_rgba(54,67,101,0.18)] sm:rounded-[38px]">
            <div className="h-[5px] bg-gradient-to-r from-[#24334F] via-[#52688F] to-[#24334F]" />

            <div className="relative overflow-hidden bg-gradient-to-br from-[#364365] via-[#3F5277] to-[#263650] px-5 pb-9 pt-9 text-center sm:px-9 sm:pb-10 sm:pt-10">
              <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-white/[0.07] blur-2xl" />
              <div className="absolute -bottom-24 -left-16 h-48 w-48 rounded-full bg-[#9FB4CE]/[0.10] blur-3xl" />

              <div className="relative flex items-center justify-center gap-3">
                <span className="h-px w-9 bg-white/30 sm:w-12" />

                <span className="text-[9px] font-medium uppercase tracking-[0.42em] text-white/80">
                  JE VORYA
                </span>

                <span className="h-px w-9 bg-white/30 sm:w-12" />
              </div>

              <div className="relative mx-auto mt-7 flex h-[76px] w-[76px] items-center justify-center rounded-full border border-white/20 bg-white/[0.10] shadow-[0_18px_45px_rgba(0,0,0,0.18)] backdrop-blur-sm sm:mt-8 sm:h-[84px] sm:w-[84px]">
                <div className="flex h-[56px] w-[56px] items-center justify-center rounded-full border border-white/15 bg-white shadow-[0_8px_25px_rgba(0,0,0,0.12)] sm:h-[62px] sm:w-[62px]">
                  <span className="text-xl text-[#364365] sm:text-2xl">
                    ✦
                  </span>
                </div>
              </div>

              <p className="relative mt-6 text-[8px] font-semibold uppercase tracking-[0.38em] text-white/60">
                {t("experienceBySlug.privateJewelryExperience")}
              </p>

              <h1 className="relative mt-3 font-serif text-[2.25rem] font-normal leading-tight tracking-[-0.045em] text-white sm:text-[2.85rem]">
                {t("experienceBySlug.specialDate")}
              </h1>

              <div className="relative mx-auto mt-4 h-px w-12 bg-white/30" />

              <p className="relative mx-auto mt-4 max-w-[370px] text-[12px] leading-6 text-white/65 sm:text-[13px]">
                {t("experienceBySlug.protectedDescription")}
              </p>
            </div>

          <form
  onSubmit={handleUnlock}
  dir={isArabic ? "rtl" : "ltr"}
  className="bg-white px-5 pb-7 pt-7 sm:px-9 sm:pb-9 sm:pt-8"
>
              <label className="mb-3 block text-center text-[8px] font-semibold uppercase tracking-[0.28em] text-[#536174] sm:text-[9px]">
                {t("experienceBySlug.enterSpecialDate")}
              </label>

              <div className="rounded-[22px] border border-[#D8E1EA] bg-[#F7FAFC] p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] sm:rounded-[25px] sm:p-5">
                <div className="flex items-center justify-between px-1">
                  <button
                    type="button"
                    onClick={goToPreviousMonth}
                    disabled={unlocking}
                    aria-label="Previous month"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[#D5DEE8] bg-white text-xl text-[#364365] shadow-[0_4px_12px_rgba(54,67,101,0.06)] transition-all duration-200 hover:border-[#8EA2BC] hover:bg-[#F8FBFD] disabled:cursor-not-allowed disabled:opacity-40 sm:h-10 sm:w-10"
                  >
                    ‹
                  </button>

                <div className="relative text-center">
  <button
    type="button"
    onClick={() => {
      setSelectedYear(calendarDate.getFullYear());
      setYearRangeStart(calendarDate.getFullYear() - 6);
      setShowYearPicker((previous) => !previous);
    }}
    disabled={unlocking}
    className="group flex items-center gap-2 font-serif text-[19px] tracking-[-0.02em] text-[#263650] transition-colors hover:text-[#52688F] disabled:opacity-50 sm:text-[21px]"
  >
    {calendarMonthLabel}

    <span
      className={`text-[10px] text-[#52688F] transition-transform duration-300 ${
        showYearPicker ? "rotate-180" : ""
      }`}
    >
      ▼
    </span>
  </button>

  <div className="mx-auto mt-1.5 h-[2px] w-8 rounded-full bg-[#364365]/30" />

  {showYearPicker && (
    <div className="absolute left-1/2 top-full z-50 mt-3 w-[270px] -translate-x-1/2 rounded-2xl border border-[#D8E1EA] bg-white p-4 shadow-[0_18px_50px_rgba(54,67,101,0.18)]">
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setYearRangeStart((year) => year - 12)}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-[#D5DEE8] text-[#364365] transition hover:bg-[#F0F4F8]"
        >
          ‹
        </button>

        <span className="text-xs font-semibold tracking-wider text-[#364365]">
          {yearRangeStart} – {yearRangeStart + 11}
        </span>

        <button
          type="button"
          onClick={() => setYearRangeStart((year) => year + 12)}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-[#D5DEE8] text-[#364365] transition hover:bg-[#F0F4F8]"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 12 }, (_, index) => {
          const year = yearRangeStart + index;
          const isSelected = selectedYear === year;

          return (
            <button
              key={year}
              type="button"
              onClick={() => {
                setSelectedYear(year);

                setCalendarDate(
                  (currentDate) =>
                    new Date(
                      year,
                      currentDate.getMonth(),
                      1,
                    ),
                );

                setShowYearPicker(false);
              }}
              className={`rounded-xl py-2.5 text-sm font-medium transition-all duration-200 ${
                isSelected
                  ? "bg-[#364365] text-white shadow-md"
                  : "text-[#43536A] hover:bg-[#364365]/[0.07]"
              }`}
            >
              {year}
            </button>
          );
        })}
      </div>
    </div>
  )}
</div>

                  <button
                    type="button"
                    onClick={goToNextMonth}
                    disabled={unlocking}
                    aria-label="Next month"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[#D5DEE8] bg-white text-xl text-[#364365] shadow-[0_4px_12px_rgba(54,67,101,0.06)] transition-all duration-200 hover:border-[#8EA2BC] hover:bg-[#F8FBFD] disabled:cursor-not-allowed disabled:opacity-40 sm:h-10 sm:w-10"
                  >
                    ›
                  </button>
                </div>

                <div className="mt-5 grid grid-cols-7 border-b border-[#DCE4EC] pb-2.5">
                {(
  isArabic
    ? ["أحد", "إثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"]
    : ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]
).map( (day) => (
                      <div
                        key={day}
                        className="text-center text-[7px] font-semibold tracking-[0.12em] text-[#718096] sm:text-[8px]"
                      >
                        {day}
                      </div>
                    ),
                  )}
                </div>

                <div className="mt-2 grid grid-cols-7 gap-1 sm:gap-1.5">
                  {calendarDays.map((dayData, index) => {
                    const selected = isSelectedDate(dayData);
                    const today = isToday(dayData);

                    return (
                      <button
                        key={`${dayData.year}-${dayData.month}-${dayData.day}-${index}`}
                        type="button"
                        onClick={() => handleCalendarDateSelect(dayData)}
                        disabled={!dayData.currentMonth || unlocking}
                        className={[
                          "relative flex aspect-square items-center justify-center rounded-xl text-[11px] font-medium transition-all duration-200 sm:text-[12px]",
                          dayData.currentMonth
                            ? "text-[#43536A] hover:bg-[#364365]/[0.07] hover:text-[#263650]"
                            : "cursor-default text-[#9AA7B5]/35",
                          selected
                            ? "bg-[#364365] font-semibold text-white shadow-[0_7px_18px_rgba(54,67,101,0.25)] hover:bg-[#364365] hover:text-white"
                            : "",
                          today && !selected
                            ? "border border-[#7F93AE] text-[#364365]"
                            : "border border-transparent",
                        ].join(" ")}
                      >
                        {today && !selected && (
                          <span className="absolute bottom-1.5 h-1 w-1 rounded-full bg-[#52688F]" />
                        )}

                        {selected && (
                          <span className="absolute inset-1 rounded-lg border border-white/20" />
                        )}

                        <span className="relative z-10">{dayData.day}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 flex min-h-[44px] items-center justify-center rounded-xl border border-[#D7E0E9] bg-white px-3 shadow-[0_4px_14px_rgba(54,67,101,0.04)]">
                  {formattedSelectedDate ? (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-[#52688F]">✦</span>

                      <span className="text-[9px] font-medium tracking-[0.08em] text-[#536174]">
                        {formattedSelectedDate}
                      </span>
                    </div>
                  ) : (
                   <span className="text-[8px] uppercase tracking-[0.16em] text-[#9AA4AF]">
  {isArabic ? "اختاري تاريخك المميز" : "Select your special date"}
</span>
                  )}
                </div>
              </div>

              {unlockError && (
                <div className="mt-4 rounded-xl border border-[#B85C5C]/15 bg-[#B85C5C]/[0.055] px-3 py-3 text-center text-[10px] leading-5 text-[#8F4747]">
                  {unlockError}
                </div>
              )}

              <button
                type="submit"
                disabled={unlocking}
                className="group relative mt-5 inline-flex min-h-[54px] w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-[#364365] px-5 text-[9px] font-semibold uppercase tracking-[0.2em] text-white shadow-[0_14px_32px_rgba(54,67,101,0.20)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#2D3957] hover:shadow-[0_18px_40px_rgba(54,67,101,0.25)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 sm:min-h-[57px]"
              >
                <span className="absolute inset-0 -translate-x-full bg-white/10 transition-transform duration-700 group-hover:translate-x-full" />

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

              <div className="mt-5 flex items-center justify-center gap-3">
                <span className="h-px w-8 bg-[#364365]/15" />

                <span className="text-[7px] uppercase tracking-[0.25em] text-[#8995A3]">
                  Private Experience
                </span>

                <span className="h-px w-8 bg-[#364365]/15" />
              </div>
            </form>
          </div>
        </div>

        <style>
          {`
            @keyframes unlockEnter {
              from {
                opacity: 0;
                transform: translateY(16px);
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

  if (!experience) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#EAF1F7] px-5">
      <LanguageSwitcher />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(82,104,143,0.10),transparent_32%),linear-gradient(135deg,#F8FBFD_0%,#EAF1F7_55%,#DDE8F1_100%)]" />

        <div className="pointer-events-none absolute -left-28 top-10 h-64 w-64 rounded-full bg-[#364365]/[0.035] blur-[90px]" />

        <div className="pointer-events-none absolute -bottom-28 -right-20 h-72 w-72 rounded-full bg-[#52688F]/[0.07] blur-[100px]" />

        <div className="relative w-full max-w-lg animate-[notFoundEnter_0.7s_ease-out] overflow-hidden rounded-[40px] border border-white/80 bg-white/75 p-10 text-center shadow-[0_40px_120px_rgba(54,67,101,0.12)] backdrop-blur-xl sm:p-12">
          <div className="absolute left-1/2 top-0 h-[2px] w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-[#52688F]/70 to-transparent" />

          <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-[#52688F]/[0.05] blur-[55px]" />

          <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-[#52688F]/25 bg-[#364365] text-3xl text-white shadow-[0_18px_50px_rgba(54,67,101,0.18)]">
            <div className="absolute -inset-2 rounded-full border border-dashed border-[#52688F]/25 animate-[spin_18s_linear_infinite]" />

            <span>♡</span>
          </div>

          <p className="mt-9 text-[9px] font-semibold uppercase tracking-[0.44em] text-[#52688F]">
            {t("experienceBySlug.smartJewelry")}
          </p>

          <h1 className="mt-5 font-serif text-[2.7rem] tracking-[-0.05em] text-[#263650]">
            {t("experienceBySlug.experienceNotFound")}
          </h1>

          <div className="mx-auto mt-6 flex items-center justify-center gap-3">
            <span className="h-px w-10 bg-[#52688F]/35" />

            <span className="text-[9px] text-[#52688F]">✦</span>

            <span className="h-px w-10 bg-[#52688F]/35" />
          </div>

          <p className="mx-auto mt-6 max-w-md text-[13px] leading-7 text-[#64717B]">
            {pageError || t("experienceBySlug.privateExperienceUnavailable")}
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
    <div className="min-h-screen overflow-hidden bg-[#EAF1F7] text-[#263650]">
     <LanguageSwitcher />
      <section className="relative overflow-hidden bg-[#EAF1F7]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.95),transparent_34%),radial-gradient(circle_at_10%_55%,rgba(159,180,206,0.18),transparent_28%),linear-gradient(180deg,#F8FBFD_0%,#EAF1F7_55%,#E3ECF3_100%)]" />

        <div className="pointer-events-none absolute -left-32 top-16 h-72 w-72 rounded-full bg-white/60 blur-[100px]" />

        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full border border-[#52688F]/[0.08]" />

        <div className="pointer-events-none absolute right-10 top-16 h-40 w-40 rounded-full border border-[#52688F]/[0.06] sm:right-20" />

        <div className="pointer-events-none absolute -bottom-28 -left-20 h-64 w-64 rounded-full bg-[#52688F]/[0.08] blur-[90px]" />

        <div className="relative mx-auto max-w-5xl px-5 pb-14 pt-12 sm:px-8 sm:pb-16 sm:pt-14 md:pb-18 md:pt-16">
          <div className="mx-auto max-w-3xl text-center">
            <div className="flex items-center justify-center gap-3">
              <span className="h-px w-9 bg-[#52688F]/35 sm:w-12" />

              <span className="text-[8px] font-semibold uppercase tracking-[0.42em] text-[#52688F] sm:text-[9px]">
                {personal?.receiverName
                  ? t("experienceBySlug.createdFor")
                  : t("experienceBySlug.specialExperience")}
              </span>

              <span className="h-px w-9 bg-[#52688F]/35 sm:w-12" />
            </div>

            {/* <h1 className="mx-auto mt-5 max-w-3xl font-serif text-[34px] font-normal leading-[1.08] tracking-[-0.045em] text-[#263650] sm:mt-6 sm:text-[46px] md:text-[56px]">
              {personal?.title ||
                t("experienceBySlug.specialExperienceTitle")}
            </h1> */}

            {/* {personal?.receiverName && (
              <div className="mt-5 flex items-center justify-center gap-3">
                <span className="h-px w-5 bg-[#52688F]/35 sm:w-7" />

                <p className="font-serif text-[19px] text-[#52688F] sm:text-[22px] md:text-[24px]">
                  {personal.receiverName}
                </p>

                <span className="h-px w-5 bg-[#52688F]/35 sm:w-7" />
              </div>
            )} */}

            <div className="mx-auto mt-7 flex items-center justify-center gap-2">
              <span className="h-1 w-1 rounded-full bg-[#52688F]/45" />

              <span className="text-[8px] text-[#52688F]/70">✦</span>

              <span className="h-1 w-1 rounded-full bg-[#52688F]/45" />
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#EAF1F7] to-transparent" />
      </section>

      <main className="relative mx-auto max-w-7xl px-5 pb-20 md:px-8 md:pb-28">
        <section className="relative mx-auto -mt-7 max-w-5xl animate-[contentEnter_0.9s_0.2s_both_ease-out]">
          <div className="absolute -inset-5 rounded-[45px] bg-[#52688F]/[0.045] blur-2xl" />

          <div className="relative">
            <div className="pointer-events-none absolute -left-2 top-7 z-20 hidden h-16 w-16 -rotate-[17deg] rounded-[4px] border border-[#52688F]/20 bg-white/30 shadow-[0_8px_20px_rgba(54,67,101,0.08)] backdrop-blur-sm lg:block" />

            <div className="pointer-events-none absolute -right-2 bottom-10 z-20 hidden h-16 w-16 rotate-[15deg] rounded-[4px] border border-[#52688F]/15 bg-white/30 shadow-[0_8px_20px_rgba(54,67,101,0.08)] backdrop-blur-sm lg:block" />

            <div className="relative overflow-hidden rounded-[4px] bg-[#F7F4EE] shadow-[0_35px_100px_rgba(54,67,101,0.20)] [clip-path:polygon(1%_1.5%,4%_0.8%,8%_1.4%,12%_0.7%,16%_1.4%,20%_0.8%,24%_1.5%,28%_0.7%,32%_1.3%,36%_0.8%,40%_1.5%,44%_0.7%,48%_1.3%,52%_0.8%,56%_1.5%,60%_0.7%,64%_1.4%,68%_0.8%,72%_1.4%,76%_0.7%,80%_1.5%,84%_0.8%,88%_1.4%,92%_0.7%,96%_1.5%,99%_2.5%,98.4%_8%,99.2%_14%,98.5%_20%,99.2%_26%,98.5%_32%,99.2%_38%,98.5%_44%,99.2%_50%,98.5%_56%,99.2%_62%,98.5%_68%,99.2%_74%,98.5%_80%,99.2%_86%,98.5%_92%,99%_97%,95%_98.8%,90%_98.2%,85%_99%,80%_98.5%,75%_99.2%,70%_98.5%,65%_99%,60%_98.5%,55%_99.2%,50%_98.5%,45%_99%,40%_98.5%,35%_99.2%,30%_98.5%,25%_99%,20%_98.5%,15%_99.2%,10%_98.5%,5%_99%,1%_97%,1.5%_92%,0.8%_86%,1.5%_80%,0.8%_74%,1.5%_68%,0.8%_62%,1.5%_56%,0.8%_50%,1.5%_44%,0.8%_38%,1.5%_32%,0.8%_26%,1.5%_20%,0.8%_14%,1.5%_8%)]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(54,67,101,0.055),transparent_23%),radial-gradient(circle_at_82%_76%,rgba(82,104,143,0.065),transparent_28%),linear-gradient(115deg,rgba(255,255,255,0.82),rgba(246,242,235,0.96)_45%,rgba(255,255,255,0.76))]" />

              <div className="absolute inset-[12px] rounded-[3px] border border-[#52688F]/[0.08] pointer-events-none" />

              <div className="absolute right-5 top-5 h-28 w-28 rounded-full border border-[#52688F]/10 sm:right-10 sm:top-8 sm:h-36 sm:w-36" />

              <div className="absolute right-9 top-9 text-[38px] leading-none text-[#52688F]/15 rotate-[12deg] sm:right-14 sm:top-12">
                ❧
              </div>

              <div className="absolute bottom-8 left-7 text-[42px] leading-none text-[#52688F]/12 -rotate-[25deg] sm:left-12">
                ❧
              </div>

              <div className="absolute left-7 top-8 h-16 w-16 rounded-full bg-[#DCE6EF]/35 blur-xl sm:left-12 sm:top-12" />

              <div className="absolute bottom-7 right-8 h-20 w-20 rounded-full bg-[#DCE6EF]/40 blur-xl sm:right-14" />

              <div className="relative px-7 py-12 sm:px-12 sm:py-16 md:px-20 md:py-20">
                <div className="mx-auto max-w-3xl text-center">
                  <div className="flex items-center justify-center gap-3">
                    <span className="h-px w-10 bg-[#52688F]/35 sm:w-14" />

                    <span className="text-[8px] font-semibold uppercase tracking-[0.4em] text-[#52688F] sm:text-[9px]">
                      {t("experienceBySlug.personalMessage")}
                    </span>

                    <span className="h-px w-10 bg-[#52688F]/35 sm:w-14" />
                  </div>

                  <div className="relative mx-auto mt-8 max-w-3xl">
                    <div className="absolute -inset-4 rounded-[8px] bg-[#364365]/[0.035] blur-xl" />

                    <div className="relative overflow-hidden rounded-[3px]  bg-[#F8F5EF] px-7 py-12  sm:px-12 sm:py-14 md:px-16 md:py-16">
                      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(255,255,255,0.8),transparent_20%),radial-gradient(circle_at_80%_85%,rgba(186,180,166,0.08),transparent_25%),repeating-linear-gradient(0deg,rgba(120,110,95,0.018)_0px,rgba(120,110,95,0.018)_1px,transparent_1px,transparent_5px)]" />

                      <div className="pointer-events-none absolute left-0 top-0 h-20 w-20 bg-[radial-gradient(circle_at_top_left,rgba(82,104,143,0.10),transparent_68%)]" />

                      <div className="pointer-events-none absolute bottom-0 right-0 h-24 w-24 bg-[radial-gradient(circle_at_bottom_right,rgba(82,104,143,0.10),transparent_68%)]" />

                      <div className="pointer-events-none absolute left-5 top-5 h-14 w-14 rounded-full  sm:left-8 sm:top-8" />

                      <div className="pointer-events-none absolute left-8 top-8 text-[30px] leading-none text-[#52688F]/20 -rotate-[20deg] sm:left-11 sm:top-11">
                        ❧
                      </div>

                      <div className="pointer-events-none absolute bottom-5 right-5 h-14 w-14 rounded-full border border-[#52688F]/10 sm:bottom-8 sm:right-8" />

                      <div className="pointer-events-none absolute bottom-8 right-8 text-[30px] leading-none text-[#52688F]/20 rotate-[160deg] sm:bottom-11 sm:right-11">
                        ❧
                      </div>

                      <div className="relative z-10">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#8EA2BC]/40 bg-[#364365] shadow-[0_10px_28px_rgba(54,67,101,0.20)]">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-[#52688F]">
                            <span className="text-[14px] text-white">✦</span>
                          </div>
                        </div>

                        <div className="relative mt-9">
                          <span className="absolute -left-2 -top-9 font-serif text-[76px] leading-none text-[#52688F]/15 sm:-left-7 sm:-top-11 sm:text-[92px]">
                            “
                          </span>

                          <p className="relative whitespace-pre-wrap font-serif text-[23px] font-normal leading-[1.9] tracking-[-0.012em] text-[#3C4655] sm:text-[28px] md:text-[33px]">
                            {personal?.message ||
                              t("experienceBySlug.defaultMessage")}
                          </p>

                          <span className="absolute -bottom-14 -right-2 font-serif text-[76px] leading-none text-[#52688F]/15 sm:-bottom-16 sm:-right-7 sm:text-[92px]">
                            ”
                          </span>
                        </div>

                        {personal?.ownerName && (
                          <div className="mx-auto mt-14 max-w-xs">
                            <div className="mx-auto flex items-center justify-center gap-3">
                              <span className="h-px w-8 bg-[#52688F]/30" />

                              <span className="text-[9px] text-[#52688F]">
                                ✦
                              </span>

                              <span className="h-px w-8 bg-[#52688F]/30" />
                            </div>

                            <p className="mt-5 text-[7px] font-semibold uppercase tracking-[0.34em] text-[#7B8490]">
                              {t("experienceBySlug.withLove")}
                            </p>

                            {/* <p className="mt-2 font-serif text-[24px] text-[#263650] sm:text-[27px]">
                              {personal.ownerName}
                            </p> */}
                          </div>
                        )}
                      </div>

                      <div className="pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.7em] text-[#52688F]/15">
                        ✦ ✦ ✦
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2 text-[11px] tracking-[0.7em] text-[#52688F]/15">
                  ✦ ✦ ✦
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-[#D7DEE5]/40 to-transparent" />
            </div>

            <div className="pointer-events-none absolute -bottom-4 left-1/2 h-8 w-32 -translate-x-1/2 rotate-[-2deg] border border-[#52688F]/10 bg-white/25 shadow-[0_5px_15px_rgba(54,67,101,0.05)]" />
          </div>
        </section>

        {media.length > 0 && (
          <section className="relative mt-16 overflow-hidden rounded-[38px]   p-6 animate-[contentEnter_0.9s_0.35s_both_ease-out] transition-all duration-700 hover:shadow-[0_45px_120px_rgba(54,67,101,0.14)]  md:p-10 lg:p-14">
            <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-[#52688F]/[0.065] blur-[90px]" />

            <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-[#364365]/[0.035] blur-[90px]" />

            <div className="absolute left-0 top-0 h-[2px] w-1/3 bg-gradient-to-r from-[#52688F]/60 to-transparent" />

            <div className="absolute bottom-0 right-0 h-[2px] w-1/3 bg-gradient-to-l from-[#52688F]/40 to-transparent" />

            <div className="relative z-10 mb-10 text-center">
              <div className="flex items-center justify-center gap-4">
                <span className="h-px w-12 bg-gradient-to-r from-transparent to-[#52688F]/60" />

                <p className="text-[9px] font-semibold uppercase tracking-[0.45em] text-[#52688F]">
                  {t("experienceBySlug.memories")}
                </p>

                <span className="h-px w-12 bg-gradient-to-l from-transparent to-[#52688F]/60" />
              </div>

              <h2 className="mt-5 font-serif text-4xl leading-none tracking-[-0.05em] text-[#263650] md:text-5xl lg:text-6xl">
                {t("experienceBySlug.momentsToRemember")}
              </h2>

              <div className="mx-auto mt-6 flex items-center justify-center gap-3">
                <span className="h-px w-10 bg-[#52688F]/35" />

                <span className="text-[9px] text-[#52688F]">✦</span>

                <span className="h-px w-10 bg-[#52688F]/35" />
              </div>
            </div>

            <div className="relative z-10">
              <MediaGallery media={media} />
            </div>
          </section>
        )}

        <footer className="relative py-16 text-center animate-[fadeUp_1s_0.5s_both_ease-out]">
          <div className="mx-auto flex max-w-md items-center justify-center gap-4">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent to-[#52688F]/45" />

            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#8EA2BC]/35 bg-white/70 text-[12px] text-[#52688F] shadow-[0_5px_18px_rgba(54,67,101,0.06)]">
              ♡
            </div>

            <span className="h-px flex-1 bg-gradient-to-l from-transparent to-[#52688F]/45" />
          </div>

          <p className="mt-7 text-[9px] font-semibold uppercase tracking-[0.4em] text-[#64717B]">
            {t("experienceBySlug.smartJewelryExperience")}
          </p>

          <p className="mt-2 text-[12px] text-[#8A9297]">
            {t("experienceBySlug.memoryMadeSpecial")}
          </p>

          <div className="mt-5 flex items-center justify-center gap-2">
            <span className="h-1 w-1 rounded-full bg-[#52688F]/50" />

            <span className="h-1 w-1 rounded-full bg-[#52688F]/30" />

            <span className="h-1 w-1 rounded-full bg-[#52688F]/50" />
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