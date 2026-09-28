import { useTranslation } from "react-i18next";

const ExperienceAccessDateCard = ({
  accessDate,
  setAccessDate,
  hasSavedDate,
  onSave,
  onRemove,
  saving,
}) => {
  const { t } = useTranslation();

  return (
    <section className="relative w-full min-w-0 overflow-hidden rounded-[22px] border border-light-champagne/90 bg-soft-white/90 shadow-[0_20px_60px_rgba(7,19,31,0.055)] sm:rounded-[28px]">
      <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full border border-champagne-gold/[0.08] sm:-right-28 sm:-top-28 sm:h-72 sm:w-72" />

      {/* Header */}
      <div className="border-b border-light-champagne/80 bg-warm-ivory/50 px-4 py-5 sm:px-8 sm:py-7">
        <div className="flex min-w-0 items-start gap-3 sm:gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] border border-champagne-gold/20 bg-soft-cream text-[16px] text-antique-gold sm:h-11 sm:w-11 sm:rounded-[15px] sm:text-[18px]">
            ◷
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 flex-col items-start gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
              <h2 className="max-w-full break-words font-serif text-[1.3rem] font-normal leading-tight tracking-[-0.025em] text-midnight-navy sm:text-[1.65rem]">
                {t("experienceAccessDate.specialAccessDate")}
              </h2>

              {hasSavedDate && (
                <span className="inline-flex max-w-full shrink-0 items-center gap-2 rounded-full border border-champagne-gold/25 bg-soft-cream px-2.5 py-1.5 text-[8px] font-semibold uppercase tracking-[0.1em] text-antique-gold sm:px-3 sm:text-[9px] sm:tracking-[0.12em]">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-classic-gold" />

                  <span className="truncate">
                    {t("experienceAccessDate.protected")}
                  </span>
                </span>
              )}
            </div>

            <p className="mt-2 max-w-xl break-words text-[11px] leading-5 text-slate-gray sm:mt-1.5 sm:text-[13px] sm:leading-6">
              {t("experienceAccessDate.description")}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="min-w-0 px-4 py-5 sm:px-8 sm:py-7">
        <label className="mb-2.5 block text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-gray sm:text-[10px] sm:tracking-[0.18em]">
          {t("experienceAccessDate.specialDate")}
        </label>

        <input
          type="date"
          value={accessDate}
          onChange={(event) => setAccessDate(event.target.value)}
          className="box-border block h-[52px] w-full min-w-0 max-w-full appearance-none rounded-[13px] border border-light-champagne bg-warm-ivory/60 px-3.5 text-[13px] text-rich-navy outline-none transition-all duration-300 hover:border-champagne-gold/55 focus:border-classic-gold focus:bg-soft-white focus:ring-4 focus:ring-classic-gold/10 sm:h-[54px] sm:rounded-[14px] sm:px-5"
        />

        {/* How it works */}
        <div className="mt-4 rounded-[15px] border border-light-champagne/80 bg-warm-ivory/50 p-4 sm:mt-5 sm:rounded-[16px] sm:p-5">
          <div className="flex min-w-0 items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-champagne-gold/25 bg-soft-cream text-[10px] text-antique-gold">
              ✦
            </div>

            <div className="min-w-0 flex-1">
              <p className="break-words text-[11px] font-semibold leading-5 text-midnight-navy sm:text-[12px]">
                {t("experienceAccessDate.howItWorks")}
              </p>

              <p className="mt-1.5 break-words text-[10px] leading-5 text-slate-gray sm:text-[11px] sm:leading-6">
                {t("experienceAccessDate.howItWorksDescription")}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-5 flex w-full min-w-0 flex-col gap-3 sm:mt-6 sm:flex-row">
          <button
            type="button"
            onClick={onSave}
            disabled={saving || !accessDate}
            className="inline-flex min-h-[46px] w-full min-w-0 items-center justify-center rounded-[13px] bg-midnight-navy px-5 text-center text-[10px] font-semibold leading-5 text-soft-white shadow-[0_10px_25px_rgba(18,38,58,0.15)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-rich-navy disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-7 sm:text-[11px]"
          >
            <span className="max-w-full break-words">
              {saving
                ? t("experienceAccessDate.saving")
                : hasSavedDate
                  ? t("experienceAccessDate.updateDate")
                  : t("experienceAccessDate.enableDateProtection")}
            </span>
          </button>

          {hasSavedDate && (
            <button
              type="button"
              onClick={onRemove}
              disabled={saving}
              className="inline-flex min-h-[46px] w-full min-w-0 items-center justify-center rounded-[13px] border border-light-champagne bg-soft-white px-5 text-center text-[10px] font-semibold leading-5 text-slate-gray transition-all duration-300 hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 sm:w-auto sm:px-7 sm:text-[11px]"
            >
              <span className="max-w-full break-words">
                {t("experienceAccessDate.removeDateProtection")}
              </span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default ExperienceAccessDateCard;