import {
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

const initialForm = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

const ContactPage = () => {
  const [
    form,
    setForm,
  ] = useState(
    initialForm,
  );

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    success,
    setSuccess,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const handleChange = (
    event,
  ) => {
    const {
      name,
      value,
    } =
      event.target;

    setForm(
      (previous) => ({
        ...previous,
        [name]: value,
      }),
    );

    setSuccess(false);
    setError("");
  };

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      if (
        !form.name.trim() ||
        !form.email.trim() ||
        !form.subject.trim() ||
        !form.message.trim()
      ) {
        setError(
          "Please complete all fields.",
        );

        return;
      }

      try {
        setSubmitting(true);
        setError("");
        setSuccess(false);

        await new Promise(
          (resolve) =>
            setTimeout(
              resolve,
              700,
            ),
        );

        setForm(
          initialForm,
        );

        setSuccess(true);
      } catch {
        setError(
          "We could not send your message. Please try again.",
        );
      } finally {
        setSubmitting(false);
      }
    };

  return (
    <main className="min-h-screen overflow-hidden bg-warm-ivory text-rich-navy">
      <section className="relative overflow-hidden bg-luxury-black">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#173650_0%,#07131F_50%,#000000_100%)]" />

        <div className="absolute -left-40 top-0 h-[520px] w-[520px] rounded-full bg-classic-gold/[0.05] blur-[130px]" />

        <div className="absolute -right-40 bottom-0 h-[500px] w-[500px] rounded-full bg-champagne-gold/[0.035] blur-[140px]" />

        <div className="relative mx-auto max-w-7xl px-5 pb-24 pt-24 sm:px-8 md:pb-32 md:pt-32 lg:px-10 lg:pb-36 lg:pt-40">
          <div className="mx-auto max-w-4xl text-center">
            <div className="flex items-center justify-center gap-4">
              <span className="h-px w-10 bg-classic-gold/45 md:w-16" />

              <p className="text-[9px] font-semibold uppercase tracking-[0.48em] text-champagne-gold">
                Contact JEVORYA
              </p>

              <span className="h-px w-10 bg-classic-gold/45 md:w-16" />
            </div>

            <h1 className="mt-10 font-serif text-5xl font-normal leading-[0.96] tracking-[-0.055em] text-soft-white sm:text-6xl md:text-7xl lg:text-[84px]">
              We’d Love to
              <span className="block text-champagne-gold">
                Hear From You.
              </span>
            </h1>

            <p className="mx-auto mt-8 max-w-2xl text-[14px] leading-8 text-premium-silver/70">
              Questions about your order, jewelry piece, digital experience,
              gifting, or JEVORYA? Send us a message and our team will be happy
              to help.
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
                  Contact Details
                </p>

                <h2 className="mt-5 max-w-sm font-serif text-4xl leading-[1.06] tracking-[-0.04em]">
                  Start a conversation with us.
                </h2>

                <p className="mt-5 max-w-sm text-[12px] leading-7 text-premium-silver/60">
                  Whether you need support with an order or want to understand
                  how your JEVORYA experience works, we’re here to help.
                </p>

                <div className="mt-12 space-y-3">
                  <ContactItem
                    label="Email"
                    value="hello@jevorya.com"
                    href="mailto:hello@jevorya.com"
                  />

                  <ContactItem
                    label="Customer Care"
                    value="support@jevorya.com"
                    href="mailto:support@jevorya.com"
                  />

                  <ContactItem
                    label="Website"
                    value="jevorya.com"
                    href="https://jevorya.com"
                  />
                </div>

                <div className="mt-12 border-t border-soft-white/10 pt-8">
                  <p className="text-[8px] font-semibold uppercase tracking-[0.25em] text-champagne-gold">
                    Customer Support
                  </p>

                  <p className="mt-3 text-[11px] leading-6 text-premium-silver/55">
                    We aim to respond to customer messages as quickly as
                    possible during normal business days.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-7 sm:p-10 md:p-12 lg:p-14">
              <div className="max-w-2xl">
                <p className="text-[9px] font-semibold uppercase tracking-[0.3em] text-antique-gold">
                  Send a Message
                </p>

                <h2 className="mt-4 font-serif text-3xl tracking-[-0.035em] text-rich-navy md:text-4xl">
                  How can we help?
                </h2>

                <p className="mt-4 text-[12px] leading-6 text-slate-gray">
                  Tell us a little about what you need and we’ll get back to
                  you.
                </p>
              </div>

              <form
                onSubmit={
                  handleSubmit
                }
                className="mt-10 space-y-5"
              >
                <div className="grid gap-5 md:grid-cols-2">
                  <Field
                    label="Your Name"
                  >
                    <input
                      type="text"
                      name="name"
                      value={
                        form.name
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Your name"
                      className="contact-input"
                    />
                  </Field>

                  <Field
                    label="Email Address"
                  >
                    <input
                      type="email"
                      name="email"
                      value={
                        form.email
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="you@example.com"
                      className="contact-input"
                    />
                  </Field>
                </div>

                <Field
                  label="Subject"
                >
                  <select
                    name="subject"
                    value={
                      form.subject
                    }
                    onChange={
                      handleChange
                    }
                    className="contact-input"
                  >
                    <option value="">
                      Select a subject
                    </option>

                    <option value="order">
                      Order Support
                    </option>

                    <option value="experience">
                      Digital Experience Support
                    </option>

                    <option value="product">
                      Product Question
                    </option>

                    <option value="gift">
                      Gift & Personalization
                    </option>

                    <option value="partnership">
                      Partnership
                    </option>

                    <option value="other">
                      Other
                    </option>
                  </select>
                </Field>

                <Field
                  label="Message"
                >
                  <textarea
                    name="message"
                    value={
                      form.message
                    }
                    onChange={
                      handleChange
                    }
                    rows={7}
                    placeholder="Tell us how we can help..."
                    className="contact-input min-h-[170px] resize-none py-4"
                  />
                </Field>

                {error && (
                  <div className="rounded-[14px] border border-red-200 bg-red-50 px-4 py-3 text-[11px] text-red-700">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="rounded-[14px] border border-classic-gold/25 bg-soft-cream px-4 py-3 text-[11px] text-antique-gold">
                    Thank you. Your message has been received.
                  </div>
                )}

                <div className="flex flex-col gap-4 pt-1 sm:flex-row sm:items-center sm:justify-between">
                  <p className="max-w-sm text-[9px] leading-5 text-steel-gray">
                    Please avoid including passwords, payment details or other
                    sensitive information in your message.
                  </p>

                  <button
                    type="submit"
                    disabled={
                      submitting
                    }
                    className="inline-flex min-h-[50px] shrink-0 items-center justify-center rounded-full bg-deep-navy px-8 text-[10px] font-semibold uppercase tracking-[0.13em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-midnight-navy disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submitting
                      ? "Sending..."
                      : "Send Message"}
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
              Before You Contact Us
            </SectionEyebrow>

            <h2 className="mt-5 font-serif text-4xl tracking-[-0.04em] md:text-5xl">
              We’ll help you find the right answer.
            </h2>
          </div>

          <div className="mt-14 grid gap-4 md:grid-cols-3">
            <HelpCard
              number="01"
              title="Order Support"
              text="Questions about an existing order, payment, delivery or order status."
            />

            <HelpCard
              number="02"
              title="Experience Support"
              text="Help accessing, managing or personalizing the digital experience connected to your piece."
            />

            <HelpCard
              number="03"
              title="Product Questions"
              text="Questions about a jewelry piece, its features or choosing the right JEVORYA product."
            />
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28 lg:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-24">
            <div>
              <SectionEyebrow
                left
              >
                Existing Order
              </SectionEyebrow>

              <h2 className="mt-5 font-serif text-4xl leading-[1.05] tracking-[-0.045em] md:text-5xl">
                Looking for your order?
              </h2>

              <p className="mt-6 max-w-lg text-[13px] leading-7 text-slate-gray">
                If you already placed an order, your account is the fastest
                place to review your order information and current status.
              </p>

              <Link
                to="/account/orders"
                className="mt-8 inline-flex min-h-[48px] items-center justify-center rounded-full border border-rich-navy px-7 text-[9px] font-semibold uppercase tracking-[0.14em] text-rich-navy transition hover:bg-rich-navy hover:text-white"
              >
                View My Orders
              </Link>
            </div>

            <div className="relative overflow-hidden rounded-[30px] bg-deep-navy p-9 md:p-12">
              <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-classic-gold/[0.07] blur-3xl" />

              <div className="relative">
                <p className="text-[9px] font-semibold uppercase tracking-[0.3em] text-champagne-gold">
                  JEVORYA Support
                </p>

                <p className="mt-6 font-serif text-3xl leading-[1.35] tracking-[-0.035em] text-soft-white md:text-4xl">
                  Every piece carries a story. We’re here to help make sure the
                  experience around it feels just as considered.
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
                Discover JEVORYA
              </p>

              <h2 className="mt-5 font-serif text-4xl tracking-[-0.045em] text-soft-white md:text-5xl lg:text-6xl">
                Find a piece worth
                <span className="block text-champagne-gold">
                  remembering.
                </span>
              </h2>

              <Link
                to="/shop"
                className="mt-9 inline-flex min-h-[52px] items-center justify-center rounded-full bg-champagne-gold px-9 text-[10px] font-semibold uppercase tracking-[0.14em] text-deep-navy transition-all duration-300 hover:-translate-y-0.5 hover:bg-classic-gold"
              >
                Explore The Collection
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
  return (
    <a
      href={href}
      className="group block rounded-[18px] border border-soft-white/10 bg-soft-white/[0.035] px-5 py-5 transition-all duration-300 hover:border-classic-gold/30 hover:bg-soft-white/[0.055]"
    >
      <p className="text-[8px] font-semibold uppercase tracking-[0.24em] text-premium-silver/45">
        {label}
      </p>

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
  return (
    <label className="block">
      <span className="mb-2.5 block text-[9px] font-semibold uppercase tracking-[0.18em] text-steel-gray">
        {label}
      </span>

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
        left
          ? ""
          : "justify-center"
      }`}
    >
      <span className="h-px w-8 bg-classic-gold" />

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
  return (
    <div className="rounded-[24px] border border-light-champagne bg-warm-ivory p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(13,34,53,0.07)] md:p-8">
      <p className="font-mono text-[9px] text-antique-gold">
        {number}
      </p>

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