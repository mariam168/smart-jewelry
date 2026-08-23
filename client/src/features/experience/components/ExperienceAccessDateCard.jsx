const ExperienceAccessDateCard = ({
  accessDate,
  setAccessDate,
  hasSavedDate,
  onSave,
  onRemove,
  saving,
}) => {
  return (
    <section className="relative overflow-hidden rounded-[28px] border border-light-champagne/90 bg-soft-white/90 shadow-[0_20px_60px_rgba(7,19,31,0.055)]">
      <div className="pointer-events-none absolute -right-28 -top-28 h-72 w-72 rounded-full border border-champagne-gold/[0.08]" />

      <div className="border-b border-light-champagne/80 bg-warm-ivory/50 px-6 py-7 sm:px-8">
        <div className="flex gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] border border-champagne-gold/20 bg-soft-cream text-[18px] text-antique-gold">
            ◷
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="font-serif text-[1.65rem] font-normal tracking-[-0.025em] text-midnight-navy">
                Special Access Date
              </h2>

              {hasSavedDate && (
                <span className="inline-flex items-center gap-2 rounded-full border border-champagne-gold/25 bg-soft-cream px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-antique-gold">
                  <span className="h-1.5 w-1.5 rounded-full bg-classic-gold" />
                  Protected
                </span>
              )}
            </div>

            <p className="mt-1.5 max-w-xl text-[13px] leading-6 text-slate-gray">
              The recipient must enter this date before the private experience
              can be opened.
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 py-7 sm:px-8">
        <label className="mb-2.5 block text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-gray">
          Special Date
        </label>

        <input
          type="date"
          value={accessDate}
          onChange={(event) =>
            setAccessDate(
              event.target.value,
            )
          }
          className="h-[54px] w-full rounded-[14px] border border-light-champagne bg-warm-ivory/60 px-5 text-[13px] text-rich-navy outline-none transition-all duration-300 hover:border-champagne-gold/55 focus:border-classic-gold focus:bg-soft-white focus:ring-4 focus:ring-classic-gold/10"
        />

        <div className="mt-5 rounded-[16px] border border-light-champagne/80 bg-warm-ivory/50 p-5">
          <div className="flex gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-champagne-gold/25 bg-soft-cream text-[10px] text-antique-gold">
              ✦
            </div>

            <div>
              <p className="text-[12px] font-semibold text-midnight-navy">
                How it works
              </p>

              <p className="mt-1.5 text-[11px] leading-6 text-slate-gray">
                When someone opens the public jewelry link, messages, photos,
                videos and other experience details stay hidden until the
                correct date is entered.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onSave}
            disabled={
              saving ||
              !accessDate
            }
            className="inline-flex min-h-[46px] items-center justify-center rounded-[13px] bg-midnight-navy px-7 text-[11px] font-semibold text-soft-white shadow-[0_10px_25px_rgba(18,38,58,0.15)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-rich-navy disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : hasSavedDate
                ? "Update Date"
                : "Enable Date Protection"}
          </button>

          {hasSavedDate && (
            <button
              type="button"
              onClick={onRemove}
              disabled={saving}
              className="inline-flex min-h-[46px] items-center justify-center rounded-[13px] border border-light-champagne bg-soft-white px-7 text-[11px] font-semibold text-slate-gray transition-all duration-300 hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
            >
              Remove Date Protection
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default ExperienceAccessDateCard;