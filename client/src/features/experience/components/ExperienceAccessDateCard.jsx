
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

const ExperienceAccessDateCard = ({
  accessDate,
  setAccessDate,
  hasSavedDate,
  onSave,
  onRemove,
  saving,
  feedback,
}) => {
  const { t, i18n } = useTranslation();

  const isArabic = i18n.language?.startsWith("ar");
  const locale = isArabic ? "ar-EG" : "en-US";

  const [calendarDate, setCalendarDate] = useState(() => {
    if (accessDate) {
      const [year, month] = accessDate.split("-").map(Number);

      if (year && month) {
        return new Date(year, month - 1, 1);
      }
    }

    return new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  });

  const [showYearPicker, setShowYearPicker] = useState(false);

  const [yearRangeStart, setYearRangeStart] = useState(
    () => new Date().getFullYear() - 6
  );

  const [selectedYear, setSelectedYear] = useState(() => {
    if (accessDate) {
      const year = Number(accessDate.split("-")[0]);

      if (year) return year;
    }

    return new Date().getFullYear();
  });

  const handleRemove = () => {
    onRemove?.();
  };

  const calendarMonthLabel = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        month: "long",
        year: "numeric",
      }).format(calendarDate),
    [calendarDate, locale]
  );

  const formattedSelectedDate = useMemo(() => {
    if (!accessDate) return "";

    const [year, month, day] = accessDate.split("-").map(Number);

    if (!year || !month || !day) return "";

    const date = new Date(year, month - 1, day);

    return new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  }, [accessDate, locale]);

  const calendarDays = useMemo(() => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPreviousMonth = new Date(year, month, 0).getDate();

    const days = [];

    for (let index = firstDayIndex - 1; index >= 0; index -= 1) {
      const date = new Date(year, month - 1, daysInPreviousMonth - index);

      days.push({
        day: date.getDate(),
        month: date.getMonth(),
        year: date.getFullYear(),
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
      const date = new Date(year, month + 1, nextDay);

      days.push({
        day: date.getDate(),
        month: date.getMonth(),
        year: date.getFullYear(),
        currentMonth: false,
      });

      nextDay += 1;
    }

    return days;
  }, [calendarDate]);

  const goToPreviousMonth = () => {
    if (saving) return;

    setCalendarDate(
      (currentDate) =>
        new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - 1,
          1
        )
    );
  };

  const goToNextMonth = () => {
    if (saving) return;

    setCalendarDate(
      (currentDate) =>
        new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          1
        )
    );
  };

  const handleCalendarDateSelect = (dayData) => {
    if (!dayData.currentMonth || saving) return;

    const month = String(dayData.month + 1).padStart(2, "0");
    const day = String(dayData.day).padStart(2, "0");

    setAccessDate(`${dayData.year}-${month}-${day}`);
  };

  const isSelectedDate = (dayData) => {
    if (!accessDate || !dayData.currentMonth) return false;

    const [year, month, day] = accessDate.split("-").map(Number);

    return (
      year === dayData.year &&
      month === dayData.month + 1 &&
      day === dayData.day
    );
  };

  const isToday = (dayData) => {
    const today = new Date();

    return (
      dayData.currentMonth &&
      today.getFullYear() === dayData.year &&
      today.getMonth() === dayData.month &&
      today.getDate() === dayData.day
    );
  };

  const weekDays = isArabic
    ? ["أحد", "إثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"]
    : ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  return (
    <section
      dir={isArabic ? "rtl" : "ltr"}
      className="relative overflow-hidden rounded-[28px] border border-light-champagne/90 bg-soft-white/90 shadow-[0_20px_60px_rgba(7,19,31,0.055)]"
    >
      <div className="pointer-events-none absolute -right-28 -top-28 h-72 w-72 rounded-full border border-champagne-gold/[0.08]" />

      <div className="border-b border-light-champagne/80 bg-warm-ivory/50 px-6 py-7 sm:px-8">
        <div className="flex gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] border border-champagne-gold/20 bg-soft-cream text-[18px] text-antique-gold">
            ◷
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="font-serif text-[1.65rem] font-normal tracking-[-0.025em] text-midnight-navy">
                {t("experienceAccessDate.specialAccessDate")}
              </h2>

              {hasSavedDate && (
                <span className="inline-flex items-center gap-2 rounded-full border border-champagne-gold/25 bg-soft-cream px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-antique-gold">
                  <span className="h-1.5 w-1.5 rounded-full bg-classic-gold" />
                  {t("experienceAccessDate.protected")}
                </span>
              )}
            </div>

            <p className="mt-1.5 max-w-xl text-[13px] leading-6 text-slate-gray">
              {t("experienceAccessDate.description")}
            </p>
          </div>
        </div>
      </div>

      <div className="px-5 py-7 sm:px-8">
        <label className="mb-3 block text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-gray">
          {t("experienceAccessDate.specialDate")}
        </label>

        {/* Custom Calendar */}
        <div className="rounded-[22px] border border-light-champagne bg-warm-ivory/40 p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] sm:rounded-[25px] sm:p-5">
          {/* Month Navigation */}
          <div className="flex items-center justify-between gap-2 px-1">
            <button
              type="button"
              onClick={goToPreviousMonth}
              disabled={saving}
              aria-label={isArabic ? "الشهر السابق" : "Previous month"}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-light-champagne bg-soft-white text-xl text-midnight-navy shadow-sm transition hover:border-champagne-gold/60 hover:bg-soft-cream disabled:opacity-40 sm:h-10 sm:w-10"
            >
              {isArabic ? "›" : "‹"}
            </button>

            <div className="relative min-w-0 text-center">
              <button
                type="button"
                onClick={() => {
                  setSelectedYear(calendarDate.getFullYear());
                  setYearRangeStart(calendarDate.getFullYear() - 6);
                  setShowYearPicker((previous) => !previous);
                }}
                disabled={saving}
                className="group flex max-w-full items-center justify-center gap-2 font-serif text-[17px] tracking-[-0.02em] text-midnight-navy transition-colors hover:text-antique-gold disabled:opacity-50 sm:text-[21px]"
              >
                <span>{calendarMonthLabel}</span>

                <span
                  className={`shrink-0 text-[9px] text-antique-gold transition-transform duration-300 ${
                    showYearPicker ? "rotate-180" : ""
                  }`}
                >
                  ▼
                </span>
              </button>

              <div className="mx-auto mt-1.5 h-[2px] w-8 rounded-full bg-champagne-gold/60" />

              {/* Year Picker */}
              {showYearPicker && (
                <div className="absolute left-1/2 top-full z-50 mt-3 w-[min(270px,85vw)] -translate-x-1/2 rounded-2xl border border-light-champagne bg-soft-white p-4 text-left shadow-[0_18px_50px_rgba(7,19,31,0.16)]">
                  <div className="mb-4 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setYearRangeStart((year) => year - 12)
                      }
                      disabled={saving}
                      aria-label={isArabic ? "سنوات أقدم" : "Earlier years"}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-light-champagne text-midnight-navy transition hover:bg-soft-cream"
                    >
                      ‹
                    </button>

                    <span className="text-xs font-semibold tracking-wider text-midnight-navy">
                      {yearRangeStart} – {yearRangeStart + 11}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        setYearRangeStart((year) => year + 12)
                      }
                      disabled={saving}
                      aria-label={isArabic ? "سنوات أحدث" : "Later years"}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-light-champagne text-midnight-navy transition hover:bg-soft-cream"
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
                          disabled={saving}
                          onClick={() => {
                            setSelectedYear(year);

                            setCalendarDate(
                              (currentDate) =>
                                new Date(
                                  year,
                                  currentDate.getMonth(),
                                  1
                                )
                            );

                            setShowYearPicker(false);
                          }}
                          className={`rounded-xl py-2.5 text-sm font-medium transition-all duration-200 ${
                            isSelected
                              ? "bg-midnight-navy text-soft-white shadow-md"
                              : "text-rich-navy hover:bg-soft-cream"
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
              disabled={saving}
              aria-label={isArabic ? "الشهر التالي" : "Next month"}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-light-champagne bg-soft-white text-xl text-midnight-navy shadow-sm transition hover:border-champagne-gold/60 hover:bg-soft-cream disabled:opacity-40 sm:h-10 sm:w-10"
            >
              {isArabic ? "‹" : "›"}
            </button>
          </div>

          {/* Weekdays */}
          <div className="mt-5 grid grid-cols-7 border-b border-light-champagne pb-2.5">
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-center text-[7px] font-semibold tracking-[0.06em] text-slate-gray sm:text-[8px] sm:tracking-[0.12em]"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="mt-2 grid grid-cols-7 gap-1 sm:gap-1.5">
            {calendarDays.map((dayData, index) => {
              const selected = isSelectedDate(dayData);
              const today = isToday(dayData);

              return (
                <button
                  key={`${dayData.year}-${dayData.month}-${dayData.day}-${index}`}
                  type="button"
                  onClick={() => handleCalendarDateSelect(dayData)}
                  disabled={!dayData.currentMonth || saving}
                  aria-pressed={selected}
                  aria-label={`${dayData.day} ${new Intl.DateTimeFormat(
                    locale,
                    { month: "long" }
                  ).format(new Date(dayData.year, dayData.month, 1))} ${
                    dayData.year
                  }`}
                  className={[
                    "relative flex aspect-square min-w-0 items-center justify-center rounded-xl text-[11px] font-medium transition-all duration-200 sm:text-[12px]",
                    dayData.currentMonth
                      ? "text-rich-navy hover:bg-soft-cream hover:text-midnight-navy"
                      : "cursor-default text-slate-gray/25",
                    selected
                      ? "bg-midnight-navy font-semibold text-soft-white shadow-[0_7px_18px_rgba(18,38,58,0.22)] hover:bg-rich-navy hover:text-soft-white"
                      : "",
                    today && !selected
                      ? "border border-champagne-gold text-midnight-navy"
                      : "border border-transparent",
                  ].join(" ")}
                >
                  {today && !selected && (
                    <span className="absolute bottom-1 h-1 w-1 rounded-full bg-antique-gold" />
                  )}

                  {selected && (
                    <span className="absolute inset-1 rounded-lg border border-white/20" />
                  )}

                  <span className="relative z-10">{dayData.day}</span>
                </button>
              );
            })}
          </div>

          {/* Selected Date Preview */}
          <div className="mt-4 flex min-h-[48px] items-center justify-center rounded-xl border border-light-champagne bg-soft-white px-3 shadow-sm">
            {formattedSelectedDate ? (
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-antique-gold">✦</span>

                <span className="text-center text-[10px] font-medium text-rich-navy sm:text-[11px]">
                  {formattedSelectedDate}
                </span>
              </div>
            ) : (
              <span className="text-center text-[8px] uppercase tracking-[0.12em] text-slate-gray sm:text-[9px]">
                {isArabic
                  ? "اختاري التاريخ المميز"
                  : "Select your special date"}
              </span>
            )}
          </div>
        </div>

        {/* Feedback Message */}
        {feedback?.message && (
          <div
            role="status"
            aria-live="polite"
            className={`mt-4 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${
              feedback.type === "success"
                ? "border-green-200 bg-green-50 text-green-800"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-bold ${
                feedback.type === "success"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {feedback.type === "success" ? "✓" : "!"}
            </span>

            <p className="pt-1 text-xs leading-5">
              {feedback.message}
            </p>
          </div>
        )}

        {/* How It Works */}
        <div className="mt-5 rounded-[16px] border border-light-champagne/80 bg-warm-ivory/50 p-5">
          <div className="flex gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-champagne-gold/25 bg-soft-cream text-[10px] text-antique-gold">
              ✦
            </div>

            <div>
              <p className="text-[12px] font-semibold text-midnight-navy">
                {t("experienceAccessDate.howItWorks")}
              </p>

              <p className="mt-1.5 text-[11px] leading-6 text-slate-gray">
                {t("experienceAccessDate.howItWorksDescription")}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onSave}
            disabled={saving || !accessDate}
            className="inline-flex min-h-[46px] items-center justify-center rounded-[13px] bg-midnight-navy px-7 text-[11px] font-semibold text-soft-white shadow-[0_10px_25px_rgba(18,38,58,0.15)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-rich-navy disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? t("experienceAccessDate.saving")
              : hasSavedDate
                ? t("experienceAccessDate.updateDate")
                : t("experienceAccessDate.enableDateProtection")}
          </button>

          {hasSavedDate && (
            <button
              type="button"
              onClick={handleRemove}
              disabled={saving}
              className="inline-flex min-h-[46px] items-center justify-center rounded-[13px] border border-light-champagne bg-soft-white px-7 text-[11px] font-semibold text-slate-gray transition-all duration-300 hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? t("experienceAccessDate.saving")
                : t("experienceAccessDate.removeDateProtection")}
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default ExperienceAccessDateCard;