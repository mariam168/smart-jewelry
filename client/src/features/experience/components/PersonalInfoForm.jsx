const PersonalInfoForm = ({ form, handleChange, handleSave, saving }) => {
  return (
    <section className="relative overflow-hidden rounded-[28px] border border-light-champagne/90 bg-soft-white/90 shadow-[0_20px_60px_rgba(7,19,31,0.055)]">
      <div className="pointer-events-none absolute -right-28 -top-28 h-72 w-72 rounded-full border border-champagne-gold/[0.08]" />

      <div className="pointer-events-none absolute -bottom-32 -left-28 h-72 w-72 rounded-full bg-soft-cream blur-[95px]" />

      <div className="relative border-b border-light-champagne/80 bg-warm-ivory/50 px-6 py-7 sm:px-8 sm:py-8 lg:px-10">
        <div className="flex items-center gap-3">
          <span className="h-px w-8 bg-classic-gold/70" />

          <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-antique-gold">
            Your Story
          </span>
        </div>

        <h2 className="mt-4 font-serif text-[2rem] font-normal leading-tight tracking-[-0.035em] text-rich-navy sm:text-[2.4rem]">
          Personal Message
        </h2>

        <p className="mt-3 max-w-2xl text-[13px] leading-7 text-slate-gray">
          Create a personal message to make your jewelry experience feel truly
          special.
        </p>
      </div>

      <div className="relative px-6 py-7 sm:px-8 sm:py-9 lg:px-10 lg:py-10">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="mb-2.5 block text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-gray">
              From
            </label>

            <input
              type="text"
              name="ownerName"
              placeholder="Your name"
              value={form.ownerName}
              onChange={handleChange}
              className="
                h-[54px]
                w-full
                rounded-[14px]
                border
                border-light-champagne
                bg-warm-ivory/60
                px-5
                text-[13px]
                text-rich-navy
                outline-none
                transition-all
                duration-300
                placeholder:text-steel-gray/65
                hover:border-champagne-gold/55
                hover:bg-soft-white
                focus:border-classic-gold
                focus:bg-soft-white
                focus:ring-4
                focus:ring-classic-gold/10
              "
            />
          </div>

          <div>
            <label className="mb-2.5 block text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-gray">
              To
            </label>

            <input
              type="text"
              name="receiverName"
              placeholder="Recipient's name"
              value={form.receiverName}
              onChange={handleChange}
              className="
                h-[54px]
                w-full
                rounded-[14px]
                border
                border-light-champagne
                bg-warm-ivory/60
                px-5
                text-[13px]
                text-rich-navy
                outline-none
                transition-all
                duration-300
                placeholder:text-steel-gray/65
                hover:border-champagne-gold/55
                hover:bg-soft-white
                focus:border-classic-gold
                focus:bg-soft-white
                focus:ring-4
                focus:ring-classic-gold/10
              "
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2.5 block text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-gray">
              Recipient Email
            </label>

            <input
              type="email"
              name="receiverEmail"
              placeholder="recipient@example.com"
              value={form.receiverEmail}
              onChange={handleChange}
              className="
                h-[54px]
                w-full
                rounded-[14px]
                border
                border-light-champagne
                bg-warm-ivory/60
                px-5
                text-[13px]
                text-rich-navy
                outline-none
                transition-all
                duration-300
                placeholder:text-steel-gray/65
                hover:border-champagne-gold/55
                hover:bg-soft-white
                focus:border-classic-gold
                focus:bg-soft-white
                focus:ring-4
                focus:ring-classic-gold/10
              "
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2.5 block text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-gray">
              Message Title
            </label>

            <input
              type="text"
              name="title"
              placeholder="A special message for you"
              value={form.title}
              onChange={handleChange}
              className="
                h-[54px]
                w-full
                rounded-[14px]
                border
                border-light-champagne
                bg-warm-ivory/60
                px-5
                text-[13px]
                text-rich-navy
                outline-none
                transition-all
                duration-300
                placeholder:text-steel-gray/65
                hover:border-champagne-gold/55
                hover:bg-soft-white
                focus:border-classic-gold
                focus:bg-soft-white
                focus:ring-4
                focus:ring-classic-gold/10
              "
            />
          </div>

          <div className="md:col-span-2">
            <div className="mb-2.5 flex items-center justify-between gap-4">
              <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-gray">
                Personal Message
              </label>

              <span className="text-[10px] uppercase tracking-[0.12em] text-steel-gray">
                Make it meaningful
              </span>
            </div>

            <textarea
              rows={7}
              name="message"
              placeholder="Write your personal message here..."
              value={form.message}
              onChange={handleChange}
              className="
                w-full
                resize-none
                rounded-[14px]
                border
                border-light-champagne
                bg-warm-ivory/60
                px-5
                py-4
                text-[13px]
                leading-7
                text-rich-navy
                outline-none
                transition-all
                duration-300
                placeholder:text-steel-gray/65
                hover:border-champagne-gold/55
                hover:bg-soft-white
                focus:border-classic-gold
                focus:bg-soft-white
                focus:ring-4
                focus:ring-classic-gold/10
              "
            />
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-5 border-t border-light-champagne/80 pt-7 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-champagne-gold/25 bg-soft-cream shadow-[0_5px_14px_rgba(7,19,31,0.03)]">
              <span className="h-1.5 w-1.5 rounded-full bg-classic-gold" />
            </div>

            <p className="max-w-sm text-[12px] leading-5 text-slate-gray">
              Your message will become part of the recipient's personalized
              jewelry experience.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className={`
              inline-flex
              min-h-[48px]
              shrink-0
              items-center
              justify-center
              rounded-[13px]
              px-7
              text-[11px]
              font-semibold
              transition-all
              duration-300

              ${
                saving
                  ? "cursor-not-allowed bg-silver-mist text-steel-gray"
                  : "bg-midnight-navy text-soft-white shadow-[0_10px_25px_rgba(18,38,58,0.14)] hover:-translate-y-0.5 hover:bg-rich-navy hover:shadow-[0_15px_32px_rgba(18,38,58,0.2)] active:scale-[0.98]"
              }
            `}
          >
            {saving ? "Saving..." : "Save Message"}
          </button>
        </div>
      </div>
    </section>
  );
};

export default PersonalInfoForm;
