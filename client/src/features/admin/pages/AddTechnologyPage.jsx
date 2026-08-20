import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { createTechnology } from "../services/technologyApi";

const AddTechnologyPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    code: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setIsLoading(true);

    try {
      await createTechnology({
        name: formData.name,
        code: formData.code,
      });

      navigate("/admin/technologies");
    } catch (error) {
      console.error(error);

      setError(
        error?.response?.data?.message || "Failed to create technology.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-warm-ivory text-midnight-navy">
      <div className="pointer-events-none fixed -right-52 top-16 h-[520px] w-[520px] rounded-full bg-champagne-gold/[0.06] blur-[130px]" />

      <div className="pointer-events-none fixed -left-44 bottom-0 h-[460px] w-[460px] rounded-full bg-light-champagne/55 blur-[120px]" />

      <header className="relative border-b border-light-champagne/80 bg-soft-white/60 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-6 px-6 py-7 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <span className="h-px w-8 bg-classic-gold/60" />

              <span className="text-[8px] font-semibold uppercase tracking-[0.3em] text-antique-gold">
                Smart Jewelry
              </span>
            </div>

            <h1 className="font-serif text-[2.5rem] font-normal leading-none tracking-[-0.04em] text-midnight-navy sm:text-[3rem]">
              Add Technology
            </h1>

            <p className="mt-4 max-w-xl text-[12px] leading-7 text-slate-gray sm:text-[13px]">
              Create a new technology for your smart jewelry collection.
            </p>
          </div>

          <Link
            to="/admin/technologies"
            className="group inline-flex min-h-[46px] w-fit items-center justify-center gap-3 rounded-full border border-champagne-gold/30 bg-soft-white/80 px-5 text-[8px] font-semibold uppercase tracking-[0.12em] text-slate-gray shadow-[0_7px_18px_rgba(7,19,31,0.035)] transition-all duration-300 hover:-translate-y-0.5 hover:border-champagne-gold hover:bg-warm-ivory hover:text-midnight-navy"
          >
            <span className="text-[14px] text-classic-gold transition-transform duration-300 group-hover:-translate-x-1">
              ←
            </span>
            Back
          </Link>
        </div>
      </header>

      <main className="relative mx-auto max-w-[920px] px-6 py-12 sm:px-8 lg:px-10">
        <div className="relative overflow-hidden rounded-[28px] border border-light-champagne/90 bg-soft-white/85 shadow-[0_20px_60px_rgba(7,19,31,0.055)] backdrop-blur-sm">
          <div className="pointer-events-none absolute -right-28 -top-28 h-72 w-72 rounded-full border border-champagne-gold/10" />

          <div className="pointer-events-none absolute -bottom-28 -left-28 h-72 w-72 rounded-full border border-champagne-gold/[0.08]" />

          <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-soft-cream blur-[90px]" />

          <div className="relative z-10 border-b border-light-champagne/80 px-7 py-7 sm:px-10 sm:py-8">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-champagne-gold/25 bg-warm-ivory text-[13px] text-classic-gold shadow-[0_8px_20px_rgba(7,19,31,0.04)]">
                ✦
              </div>

              <div>
                <p className="text-[8px] font-semibold uppercase tracking-[0.25em] text-antique-gold">
                  Technology Details
                </p>

                <h2 className="mt-1.5 font-serif text-[1.4rem] font-normal tracking-[-0.02em] text-midnight-navy">
                  Create Technology
                </h2>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="relative z-10 px-7 py-8 sm:px-10 sm:py-10"
          >
            {error && (
              <div className="mb-7 rounded-[16px] border border-antique-gold/25 bg-soft-cream/80 px-5 py-4 text-[10px] leading-5 text-antique-gold shadow-[0_7px_20px_rgba(7,19,31,0.025)]">
                {error}
              </div>
            )}

            <div className="space-y-7">
              <div>
                <label className="mb-2.5 block text-[9px] font-semibold uppercase tracking-[0.14em] text-midnight-navy">
                  Technology Name
                </label>

                <p className="mb-3 text-[10px] leading-5 text-steel-gray">
                  The name displayed to customers and admins.
                </p>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="NFC"
                  required
                  className="h-[54px] w-full rounded-[14px] border border-light-champagne bg-warm-ivory/65 px-5 text-[12px] text-midnight-navy outline-none transition-all duration-300 placeholder:text-steel-gray/65 hover:border-champagne-gold/55 hover:bg-soft-white focus:border-classic-gold focus:bg-soft-white focus:shadow-[0_0_0_4px_rgba(201,162,77,0.08)]"
                />
              </div>

              <div>
                <label className="mb-2.5 block text-[9px] font-semibold uppercase tracking-[0.14em] text-midnight-navy">
                  Technology Code
                </label>

                <p className="mb-3 text-[10px] leading-5 text-steel-gray">
                  A unique uppercase code used internally.
                </p>

                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  placeholder="NFC"
                  required
                  className="h-[54px] w-full rounded-[14px] border border-light-champagne bg-warm-ivory/65 px-5 font-mono text-[12px] uppercase tracking-[0.12em] text-midnight-navy outline-none transition-all duration-300 placeholder:font-sans placeholder:tracking-normal placeholder:text-steel-gray/65 hover:border-champagne-gold/55 hover:bg-soft-white focus:border-classic-gold focus:bg-soft-white focus:shadow-[0_0_0_4px_rgba(201,162,77,0.08)]"
                />
              </div>

              <div className="relative overflow-hidden rounded-[18px] border border-light-champagne/90 bg-warm-ivory/70 p-5">
                <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-champagne-gold/[0.07] blur-[45px]" />

                <p className="relative text-[7px] font-semibold uppercase tracking-[0.25em] text-antique-gold">
                  Preview
                </p>

                <div className="relative mt-4 flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-champagne-gold/25 bg-soft-white text-[11px] text-classic-gold shadow-[0_7px_18px_rgba(7,19,31,0.035)]">
                    ✦
                  </div>

                  <div className="min-w-0">
                    <p className="truncate font-serif text-[1.15rem] font-normal text-midnight-navy">
                      {formData.name || "Technology Name"}
                    </p>

                    <p className="mt-1 font-mono text-[8px] font-semibold uppercase tracking-[0.15em] text-slate-gray">
                      {formData.code
                        ? formData.code.toUpperCase()
                        : "TECH_CODE"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-9 flex flex-col-reverse gap-3 border-t border-light-champagne/80 pt-7 sm:flex-row sm:justify-end">
              <Link
                to="/admin/technologies"
                className="inline-flex min-h-[48px] items-center justify-center rounded-[13px] border border-light-champagne bg-soft-white px-7 text-[8px] font-semibold uppercase tracking-[0.11em] text-slate-gray transition-all duration-300 hover:-translate-y-0.5 hover:border-champagne-gold hover:bg-warm-ivory hover:text-midnight-navy"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={isLoading}
                className="group inline-flex min-h-[48px] items-center justify-center gap-3 rounded-[13px] bg-midnight-navy px-8 text-[8px] font-semibold uppercase tracking-[0.11em] text-soft-white shadow-[0_11px_26px_rgba(18,38,58,0.14)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-rich-navy hover:shadow-[0_15px_32px_rgba(18,38,58,0.2)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {isLoading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-champagne-gold/25 border-t-champagne-gold" />
                    Creating...
                  </>
                ) : (
                  <>
                    <span className="text-[9px] text-champagne-gold">✦</span>

                    <span>Create Technology</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AddTechnologyPage;
