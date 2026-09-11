import { useState } from "react";

import { Link } from "react-router-dom";

import { useTranslation } from "react-i18next";

const initialForm = {
name: "",
phone: "",
subject: "",
message: "",
};

const WHATSAPP_NUMBER = "201508856789";

const ContactPage = () => {
const { t, i18n } = useTranslation();

const isRtl = i18n.language === "ar";

const [form, setForm] = useState(initialForm);

const [submitting, setSubmitting] = useState(false);

const [error, setError] = useState("");

const handleChange = (event) => {
const { name, value } = event.target;


setForm((previous) => ({
  ...previous,
  [name]: value,
}));

setError("");


};

const handleSubmit = async (event) => {
event.preventDefault();


if (
  !form.name.trim() ||
  !form.phone.trim() ||
  !form.subject.trim() ||
  !form.message.trim()
) {
  setError(t("contact.form.completeFields"));

  return;
}

try {
  setSubmitting(true);
  setError("");

  const selectedSubject =
    t(`contact.subjects.${form.subject}`);

  const whatsappMessage = [
    t("contact.whatsapp.title"),
    "",
    `${t("contact.form.name")}: ${form.name}`,
    `${t("contact.form.phone")}: ${form.phone}`,
    `${t("contact.form.subject")}: ${selectedSubject}`,
    "",
    `${t("contact.form.message")}:`,
    form.message,
  ].join("\n");

  const whatsappUrl =
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      whatsappMessage,
    )}`;

  window.open(
    whatsappUrl,
    "_blank",
    "noopener,noreferrer",
  );

  setForm(initialForm);
} catch {
  setError(t("contact.form.error"));
} finally {
  setSubmitting(false);
}

};

return (
<main
dir={isRtl ? "rtl" : "ltr"}
className="min-h-screen overflow-hidden bg-warm-ivory text-rich-navy"
> <section className="relative overflow-hidden bg-luxury-black"> <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#173650_0%,#07131F_50%,#000000_100%)]" />


    <div className="absolute -left-40 top-0 h-[520px] w-[520px] rounded-full bg-classic-gold/[0.05] blur-[130px]" />

    <div className="absolute -right-40 bottom-0 h-[500px] w-[500px] rounded-full bg-champagne-gold/[0.035] blur-[140px]" />

    <div className="relative mx-auto max-w-7xl px-5 pb-24 pt-24 sm:px-8 md:pb-32 md:pt-32 lg:px-10 lg:pb-36 lg:pt-40">
      <div className="mx-auto max-w-4xl text-center">
        <div className="flex items-center justify-center gap-4">
          <span className="h-px w-10 bg-classic-gold/45 md:w-16" />

          <p className="text-[9px] font-semibold uppercase tracking-[0.48em] text-champagne-gold">
            {t("contact.hero.eyebrow")}
          </p>

          <span className="h-px w-10 bg-classic-gold/45 md:w-16" />
        </div>

        <h1 className="mt-10 font-serif text-5xl font-normal leading-[0.96] tracking-[-0.055em] text-soft-white sm:text-6xl md:text-7xl lg:text-[84px]">
          {t("contact.hero.title")}

          <span className="block text-champagne-gold">
            {t("contact.hero.highlight")}
          </span>
        </h1>

        <p className="mx-auto mt-8 max-w-2xl text-[14px] leading-8 text-premium-silver/70">
          {t("contact.hero.description")}
        </p>
      </div>
    </div>
  </section>

  <section className="relative -mt-10 pb-20 md:-mt-14 md:pb-28">
    <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
      <div className="grid overflow-hidden rounded-[32px] border border-light-champagne bg-soft-white shadow-[0_35px_100px_rgba(13,34,53,0.11)] lg:grid-cols-[0.72fr_1.28fr]">
        <div className="relative overflow-hidden bg-deep-navy p-8 text-soft-white sm:p-10 md:p-12 lg:p-14">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-classic-gold/[0.06] blur-3xl" />

          <div className="absolute -bottom-28 -left-24 h-80 w-80 rounded-full border border-classic-gold/[0.08]" />

          <div className="relative">
            <p className="text-[9px] font-semibold uppercase tracking-[0.34em] text-champagne-gold">
              {t("contact.details.eyebrow")}
            </p>

            <h2 className="mt-5 max-w-sm font-serif text-4xl leading-[1.06] tracking-[-0.04em]">
              {t("contact.details.title")}
            </h2>

            <p className="mt-5 max-w-sm text-[12px] leading-7 text-premium-silver/60">
              {t("contact.details.description")}
            </p>

            <div className="mt-12">
              <ContactItem
                label={t("contact.details.whatsapp")}
                value="01508856789"
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
              />
            </div>

            <div className="mt-12 border-t border-soft-white/10 pt-8">
              <p className="text-[8px] font-semibold uppercase tracking-[0.25em] text-champagne-gold">
                {t("contact.details.support")}
              </p>

              <p className="mt-3 text-[11px] leading-6 text-premium-silver/55">
                {t("contact.details.supportDescription")}
              </p>
            </div>
          </div>
        </div>

        <div className="p-7 sm:p-10 md:p-12 lg:p-14">
          <div className="max-w-2xl">
            <p className="text-[9px] font-semibold uppercase tracking-[0.3em] text-antique-gold">
              {t("contact.form.eyebrow")}
            </p>

            <h2 className="mt-4 font-serif text-3xl tracking-[-0.035em] text-rich-navy md:text-4xl">
              {t("contact.form.title")}
            </h2>

            <p className="mt-4 text-[12px] leading-6 text-slate-gray">
              {t("contact.form.description")}
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-10 space-y-5"
          >
            <div className="grid gap-5 md:grid-cols-2">
              <Field label={t("contact.form.name")}>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder={t("contact.form.namePlaceholder")}
                  className="contact-input"
                />
              </Field>

              <Field label={t("contact.form.phone")}>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder={t("contact.form.phonePlaceholder")}
                  className="contact-input"
                />
              </Field>
            </div>

            <Field label={t("contact.form.subject")}>
              <select
                name="subject"
                value={form.subject}
                onChange={handleChange}
                className="contact-input"
              >
                <option value="">
                  {t("contact.subjects.select")}
                </option>

                <option value="order">
                  {t("contact.subjects.order")}
                </option>

                <option value="experience">
                  {t("contact.subjects.experience")}
                </option>

                <option value="product">
                  {t("contact.subjects.product")}
                </option>

                <option value="gift">
                  {t("contact.subjects.gift")}
                </option>

                <option value="partnership">
                  {t("contact.subjects.partnership")}
                </option>

                <option value="other">
                  {t("contact.subjects.other")}
                </option>
              </select>
            </Field>

            <Field label={t("contact.form.message")}>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                rows={7}
                placeholder={t("contact.form.messagePlaceholder")}
                className="contact-input min-h-[170px] resize-none py-4"
              />
            </Field>

            {error && (
              <div className="rounded-[14px] border border-red-200 bg-red-50 px-4 py-3 text-[11px] text-red-700">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-4 pt-1 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-sm text-[9px] leading-5 text-steel-gray">
                {t("contact.form.notice")}
              </p>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex min-h-[50px] shrink-0 items-center justify-center rounded-full bg-deep-navy px-8 text-[10px] font-semibold uppercase tracking-[0.13em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-midnight-navy disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting
                  ? t("contact.form.sending")
                  : t("contact.form.send")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </section>

  <section className="border-y border-light-champagne bg-soft-white py-20 md:py-28">
    <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-3xl text-center">
        <SectionEyebrow>
          {t("contact.help.eyebrow")}
        </SectionEyebrow>

        <h2 className="mt-5 font-serif text-4xl tracking-[-0.04em] md:text-5xl">
          {t("contact.help.title")}
        </h2>
      </div>

      <div className="mt-14 grid gap-4 md:grid-cols-3">
        <HelpCard
          number="01"
          title={t("contact.help.orderTitle")}
          text={t("contact.help.orderText")}
        />

        <HelpCard
          number="02"
          title={t("contact.help.experienceTitle")}
          text={t("contact.help.experienceText")}
        />

        <HelpCard
          number="03"
          title={t("contact.help.productTitle")}
          text={t("contact.help.productText")}
        />
      </div>
    </div>
  </section>

  <section className="py-20 md:py-28 lg:py-32">
    <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
      <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-24">
        <div>
          <SectionEyebrow left>
            {t("contact.orders.eyebrow")}
          </SectionEyebrow>

          <h2 className="mt-5 font-serif text-4xl leading-[1.05] tracking-[-0.045em] md:text-5xl">
            {t("contact.orders.title")}
          </h2>

          <p className="mt-6 max-w-lg text-[13px] leading-7 text-slate-gray">
            {t("contact.orders.description")}
          </p>

          <Link
            to="/account/orders"
            className="mt-8 inline-flex min-h-[48px] items-center justify-center rounded-full border border-rich-navy px-7 text-[9px] font-semibold uppercase tracking-[0.14em] text-rich-navy transition hover:bg-rich-navy hover:text-white"
          >
            {t("contact.orders.button")}
          </Link>
        </div>

        <div className="relative overflow-hidden rounded-[30px] bg-deep-navy p-9 md:p-12">
          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-classic-gold/[0.07] blur-3xl" />

          <div className="relative">
            <p className="text-[9px] font-semibold uppercase tracking-[0.3em] text-champagne-gold">
              {t("contact.support.eyebrow")}
            </p>

            <p className="mt-6 font-serif text-3xl leading-[1.35] tracking-[-0.035em] text-soft-white md:text-4xl">
              {t("contact.support.quote")}
            </p>

            <div className="mt-9 h-px w-14 bg-classic-gold" />
          </div>
        </div>
      </div>
    </div>
  </section>

  <section className="border-t border-light-champagne bg-warm-ivory pb-24">
    <div className="mx-auto max-w-7xl px-5 pt-16 sm:px-8 lg:px-10">
      <div className="relative overflow-hidden rounded-[34px] bg-luxury-black px-7 py-14 text-center md:px-12 md:py-20">
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-classic-gold/[0.05] blur-[130px]" />

        <div className="relative mx-auto max-w-3xl">
          <p className="text-[9px] font-semibold uppercase tracking-[0.4em] text-champagne-gold">
            {t("contact.discover.eyebrow")}
          </p>

          <h2 className="mt-5 font-serif text-4xl tracking-[-0.045em] text-soft-white md:text-5xl lg:text-6xl">
            {t("contact.discover.title")}

            <span className="block text-champagne-gold">
              {t("contact.discover.highlight")}
            </span>
          </h2>

          <Link
            to="/shop"
            className="mt-9 inline-flex min-h-[52px] items-center justify-center rounded-full bg-champagne-gold px-9 text-[10px] font-semibold uppercase tracking-[0.14em] text-deep-navy transition-all duration-300 hover:-translate-y-0.5 hover:bg-classic-gold"
          >
            {t("contact.discover.button")}
          </Link>
        </div>
      </div>
    </div>
  </section>

  <style>
    {`
      .contact-input {
        width: 100%;
        min-height: 52px;
        border-radius: 14px;
        border: 1px solid #EDE5D9;
        background: #FFFFFF;
        padding-left: 16px;
        padding-right: 16px;
        font-size: 12px;
        color: #12263A;
        outline: none;
        transition: 0.2s ease;
      }

      .contact-input::placeholder {
        color: #8A939C;
      }

      .contact-input:focus {
        border-color: #C9A24D;
        box-shadow: 0 0 0 4px rgba(201, 162, 77, 0.08);
      }
    `}
  </style>
</main>


);
};

const ContactItem = ({
label,
value,
href,
}) => {
return ( <a
   href={href}
   target="_blank"
   rel="noopener noreferrer"
   className="group block rounded-[18px] border border-soft-white/10 bg-soft-white/[0.035] px-5 py-5 transition-all duration-300 hover:border-classic-gold/30 hover:bg-soft-white/[0.055]"
 > <p className="text-[8px] font-semibold uppercase tracking-[0.24em] text-premium-silver/45">
{label} </p>


  <div className="mt-2 flex items-center justify-between gap-4">
    <p className="break-all text-[12px] font-semibold text-soft-white">
      {value}
    </p>

    <span className="text-sm text-champagne-gold transition-transform duration-300 group-hover:translate-x-1">
      →
    </span>
  </div>
</a>


);
};

const Field = ({
label,
children,
}) => {
return ( <label className="block"> <span className="mb-2.5 block text-[9px] font-semibold uppercase tracking-[0.18em] text-steel-gray">
{label} </span>


  {children}
</label>

);
};

const SectionEyebrow = ({
children,
left = false,
}) => {
return (
<div
className={`flex items-center gap-3 ${
        left ? "" : "justify-center"
      }`}
> <span className="h-px w-8 bg-classic-gold" />

  <p className="text-[9px] font-semibold uppercase tracking-[0.3em] text-antique-gold">
    {children}
  </p>

  {!left && (
    <span className="h-px w-8 bg-classic-gold" />
  )}
</div>


);
};

const HelpCard = ({
number,
title,
text,
}) => {
return ( <div className="rounded-[24px] border border-light-champagne bg-warm-ivory p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(13,34,53,0.07)] md:p-8"> <p className="font-mono text-[9px] text-antique-gold">
{number} </p>


  <h3 className="mt-8 font-serif text-2xl tracking-[-0.03em] text-rich-navy">
    {title}
  </h3>

  <p className="mt-4 text-[12px] leading-6 text-slate-gray">
    {text}
  </p>
</div>

);
};

export default ContactPage;
