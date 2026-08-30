import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  createTechnologyModel,
  uploadImage,
} from "../services/technologyModelApi";

import { getTechnologies } from "../services/technologyApi";

const getImageUrl = (image) => {
  if (!image) return "";

  let imagePath = String(image).trim();

  const backendUrl = (
    import.meta.env.VITE_BACKEND_URL ||
    import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "") ||
    "http://localhost:5000"
  ).replace(/\/+$/, "");

  if (
    /^https?:\/\/localhost:5000/i.test(imagePath) ||
    /^https?:\/\/127\.0\.0\.1:5000/i.test(imagePath)
  ) {
    imagePath = imagePath.replace(
      /^https?:\/\/(?:localhost|127\.0\.0\.1):5000/i,
      "",
    );
  } else if (/^https?:\/\//i.test(imagePath)) {
    return imagePath;
  }

  if (imagePath.startsWith("/api/uploads/")) {
    imagePath = imagePath.replace(/^\/api/, "");
  }

  if (!imagePath.startsWith("/")) {
    imagePath = `/${imagePath}`;
  }

  return `${backendUrl}${imagePath}`;
};

const AddTechnologyModelPage = () => {
  const navigate = useNavigate();

  const [technologies, setTechnologies] = useState([]);

  const [formData, setFormData] = useState({
    technology: "",
    modelName: "",
    modelCode: "",
    description: "",
    manufacturer: "",
    image: "",
    requiresBattery: false,
    requiresActivation: false,
    requiresSubscription: false,
    status: "active",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadTechnologies();
  }, []);

  const loadTechnologies = async () => {
    try {
      const response = await getTechnologies();

      setTechnologies(response.data?.technologies || []);
    } catch (error) {
      console.error(error);

      setError("Failed to load technologies.");
    }
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];

    if (!file) return;

    try {
      setIsUploading(true);

      const uploadData = new FormData();

      uploadData.append("image", file);

      const response = await uploadImage(uploadData);

      setFormData((previous) => ({
        ...previous,
        image: response.image,
      }));
    } catch (error) {
      console.error(error);

      alert("Failed to upload image.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setIsLoading(true);

    try {
      await createTechnologyModel(formData);

      navigate("/admin/technology-models");
    } catch (error) {
      console.error(error);

      setError(
        error?.response?.data?.message || "Failed to create technology model.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-warm-ivory text-midnight-navy">
      <div className="pointer-events-none fixed -right-52 top-20 h-[540px] w-[540px] rounded-full bg-champagne-gold/[0.06] blur-[135px]" />

      <div className="pointer-events-none fixed -left-48 bottom-0 h-[500px] w-[500px] rounded-full bg-light-champagne/55 blur-[130px]" />

      <header className="relative border-b border-light-champagne/80 bg-soft-white/60 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-6 px-6 py-7 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <span className="h-px w-8 bg-classic-gold/60" />

              <span className="text-[8px] font-semibold uppercase tracking-[0.3em] text-antique-gold">
                Smart Jewelry
              </span>
            </div>

            <h1 className="font-serif text-[2.5rem] font-normal leading-none tracking-[-0.04em] text-midnight-navy sm:text-[3rem]">
              Add Technology Model
            </h1>

            <p className="mt-4 max-w-xl text-[12px] leading-7 text-slate-gray sm:text-[13px]">
              Create a new smart jewelry technology model.
            </p>
          </div>

          <Link
            to="/admin/technology-models"
            className="group inline-flex min-h-[46px] w-fit items-center justify-center gap-3 rounded-full border border-champagne-gold/30 bg-soft-white/80 px-5 text-[8px] font-semibold uppercase tracking-[0.12em] text-slate-gray shadow-[0_7px_18px_rgba(7,19,31,0.035)] transition-all duration-300 hover:-translate-y-0.5 hover:border-champagne-gold hover:bg-warm-ivory hover:text-midnight-navy"
          >
            <span className="text-[14px] text-classic-gold transition-transform duration-300 group-hover:-translate-x-1">
              ←
            </span>
            Back
          </Link>
        </div>
      </header>

      <main className="relative mx-auto max-w-[1040px] px-6 py-12 sm:px-8 lg:px-10">
        <div className="relative overflow-hidden rounded-[28px] border border-light-champagne/90 bg-soft-white/85 shadow-[0_20px_60px_rgba(7,19,31,0.055)] backdrop-blur-sm">
          <div className="pointer-events-none absolute -right-28 -top-28 h-72 w-72 rounded-full border border-champagne-gold/10" />

          <div className="pointer-events-none absolute -bottom-28 -left-28 h-72 w-72 rounded-full border border-champagne-gold/[0.08]" />

          <div className="pointer-events-none absolute right-0 top-0 h-72 w-72 rounded-full bg-soft-cream blur-[90px]" />

          <div className="pointer-events-none absolute bottom-0 left-0 h-72 w-72 rounded-full bg-champagne-gold/[0.035] blur-[95px]" />

          <div className="relative z-10 border-b border-light-champagne/80 px-7 py-7 sm:px-10 sm:py-8">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-champagne-gold/25 bg-warm-ivory text-[13px] text-classic-gold shadow-[0_8px_20px_rgba(7,19,31,0.04)]">
                ✦
              </div>

              <div>
                <p className="text-[8px] font-semibold uppercase tracking-[0.25em] text-antique-gold">
                  Model Details
                </p>

                <h2 className="mt-1.5 font-serif text-[1.45rem] font-normal tracking-[-0.02em] text-midnight-navy">
                  Create Technology Model
                </h2>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="relative z-10 px-7 py-8 sm:px-10 sm:py-10"
          >
            {error && (
              <div className="mb-7 rounded-[16px] border border-antique-gold/25 bg-soft-cream/85 px-5 py-4 text-[10px] leading-5 text-antique-gold shadow-[0_7px_20px_rgba(7,19,31,0.025)]">
                {error}
              </div>
            )}

            <div className="space-y-8">
              <div>
                <label className="mb-2.5 block text-[9px] font-semibold uppercase tracking-[0.14em] text-midnight-navy">
                  Technology
                </label>

                <p className="mb-3 text-[10px] leading-5 text-steel-gray">
                  Select the technology this model belongs to.
                </p>

                <select
                  name="technology"
                  value={formData.technology}
                  onChange={handleChange}
                  required
                  className="h-[54px] w-full rounded-[14px] border border-light-champagne bg-warm-ivory/65 px-5 text-[12px] text-midnight-navy outline-none transition-all duration-300 hover:border-champagne-gold/55 hover:bg-soft-white focus:border-classic-gold focus:bg-soft-white focus:shadow-[0_0_0_4px_rgba(201,162,77,0.08)]"
                >
                  <option value="">Select Technology</option>

                  {technologies.map((technology) => (
                    <option key={technology._id} value={technology._id}>
                      {technology.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-7 md:grid-cols-2">
                <div>
                  <label className="mb-2.5 block text-[9px] font-semibold uppercase tracking-[0.14em] text-midnight-navy">
                    Model Name
                  </label>

                  <p className="mb-3 text-[10px] leading-5 text-steel-gray">
                    The name of the technology model.
                  </p>

                  <input
                    type="text"
                    name="modelName"
                    value={formData.modelName}
                    onChange={handleChange}
                    placeholder="NFC Ring"
                    required
                    className="h-[54px] w-full rounded-[14px] border border-light-champagne bg-warm-ivory/65 px-5 text-[12px] text-midnight-navy outline-none transition-all duration-300 placeholder:text-steel-gray/65 hover:border-champagne-gold/55 hover:bg-soft-white focus:border-classic-gold focus:bg-soft-white focus:shadow-[0_0_0_4px_rgba(201,162,77,0.08)]"
                  />
                </div>

                <div>
                  <label className="mb-2.5 block text-[9px] font-semibold uppercase tracking-[0.14em] text-midnight-navy">
                    Model Code
                  </label>

                  <p className="mb-3 text-[10px] leading-5 text-steel-gray">
                    A unique code used to identify this model.
                  </p>

                  <input
                    type="text"
                    name="modelCode"
                    value={formData.modelCode}
                    onChange={handleChange}
                    placeholder="NFC-RING-01"
                    required
                    className="h-[54px] w-full rounded-[14px] border border-light-champagne bg-warm-ivory/65 px-5 font-mono text-[12px] uppercase tracking-[0.12em] text-midnight-navy outline-none transition-all duration-300 placeholder:font-sans placeholder:tracking-normal placeholder:text-steel-gray/65 hover:border-champagne-gold/55 hover:bg-soft-white focus:border-classic-gold focus:bg-soft-white focus:shadow-[0_0_0_4px_rgba(201,162,77,0.08)]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2.5 block text-[9px] font-semibold uppercase tracking-[0.14em] text-midnight-navy">
                  Description
                </label>

                <p className="mb-3 text-[10px] leading-5 text-steel-gray">
                  Add a short description of this technology model.
                </p>

                <textarea
                  rows={5}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the technology model and its main features..."
                  className="w-full resize-none rounded-[14px] border border-light-champagne bg-warm-ivory/65 px-5 py-4 text-[12px] leading-6 text-midnight-navy outline-none transition-all duration-300 placeholder:text-steel-gray/65 hover:border-champagne-gold/55 hover:bg-soft-white focus:border-classic-gold focus:bg-soft-white focus:shadow-[0_0_0_4px_rgba(201,162,77,0.08)]"
                />
              </div>

              <div>
                <label className="mb-2.5 block text-[9px] font-semibold uppercase tracking-[0.14em] text-midnight-navy">
                  Manufacturer
                </label>

                <p className="mb-3 text-[10px] leading-5 text-steel-gray">
                  The company or manufacturer responsible for the model.
                </p>

                <input
                  type="text"
                  name="manufacturer"
                  value={formData.manufacturer}
                  onChange={handleChange}
                  placeholder="Samsung"
                  className="h-[54px] w-full rounded-[14px] border border-light-champagne bg-warm-ivory/65 px-5 text-[12px] text-midnight-navy outline-none transition-all duration-300 placeholder:text-steel-gray/65 hover:border-champagne-gold/55 hover:bg-soft-white focus:border-classic-gold focus:bg-soft-white focus:shadow-[0_0_0_4px_rgba(201,162,77,0.08)]"
                />
              </div>

              <div>
                <label className="mb-2.5 block text-[9px] font-semibold uppercase tracking-[0.14em] text-midnight-navy">
                  Model Image
                </label>

                <p className="mb-3 text-[10px] leading-5 text-steel-gray">
                  Upload an image for this technology model.
                </p>

                <div className="relative overflow-hidden rounded-[18px] border border-dashed border-champagne-gold/35 bg-warm-ivory/55 p-6">
                  <div className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full bg-champagne-gold/[0.06] blur-[50px]" />

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="relative block w-full cursor-pointer text-[10px] text-slate-gray file:mr-4 file:cursor-pointer file:rounded-full file:border-0 file:bg-midnight-navy file:px-5 file:py-2.5 file:text-[8px] file:font-semibold file:uppercase file:tracking-[0.1em] file:text-soft-white file:transition-colors hover:file:bg-rich-navy"
                  />

                  {isUploading && (
                    <div className="relative mt-4 flex items-center gap-3 text-[10px] text-slate-gray">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-champagne-gold/25 border-t-classic-gold" />
                      Uploading image...
                    </div>
                  )}

                  {formData.image && (
                    <div className="relative mt-5">
                      <p className="mb-3 text-[7px] font-semibold uppercase tracking-[0.2em] text-antique-gold">
                        Image Preview
                      </p>

                      <div className="relative h-40 w-40 overflow-hidden rounded-[18px] border border-light-champagne bg-soft-white shadow-[0_10px_26px_rgba(7,19,31,0.045)]">
                        <img
                          src={getImageUrl(formData.image)}
                          alt="Technology Model Preview"
                          className="h-full w-full object-cover"
                        />

                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-luxury-black/10 to-transparent" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div className="mb-4">
                  <label className="text-[9px] font-semibold uppercase tracking-[0.14em] text-midnight-navy">
                    Model Requirements
                  </label>

                  <p className="mt-2 text-[10px] leading-5 text-steel-gray">
                    Select the features required by this model.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <label
                    className={`
                      group flex cursor-pointer items-center gap-4 rounded-[18px]
                      border p-5 transition-all duration-300
                      ${
                        formData.requiresBattery
                          ? "border-champagne-gold/60 bg-soft-cream shadow-[0_8px_22px_rgba(7,19,31,0.035)]"
                          : "border-light-champagne bg-warm-ivory/55 hover:border-champagne-gold/45 hover:bg-soft-white"
                      }
                    `}
                  >
                    <input
                      type="checkbox"
                      name="requiresBattery"
                      checked={formData.requiresBattery}
                      onChange={handleChange}
                      className="h-4 w-4 accent-classic-gold"
                    />

                    <div>
                      <p className="text-[11px] font-semibold text-midnight-navy">
                        Battery
                      </p>

                      <p className="mt-1 text-[9px] text-steel-gray">
                        Requires battery
                      </p>
                    </div>
                  </label>

                  <label
                    className={`
                      group flex cursor-pointer items-center gap-4 rounded-[18px]
                      border p-5 transition-all duration-300
                      ${
                        formData.requiresActivation
                          ? "border-champagne-gold/60 bg-soft-cream shadow-[0_8px_22px_rgba(7,19,31,0.035)]"
                          : "border-light-champagne bg-warm-ivory/55 hover:border-champagne-gold/45 hover:bg-soft-white"
                      }
                    `}
                  >
                    <input
                      type="checkbox"
                      name="requiresActivation"
                      checked={formData.requiresActivation}
                      onChange={handleChange}
                      className="h-4 w-4 accent-classic-gold"
                    />

                    <div>
                      <p className="text-[11px] font-semibold text-midnight-navy">
                        Activation
                      </p>

                      <p className="mt-1 text-[9px] text-steel-gray">
                        Requires activation
                      </p>
                    </div>
                  </label>

                  <label
                    className={`
                      group flex cursor-pointer items-center gap-4 rounded-[18px]
                      border p-5 transition-all duration-300
                      ${
                        formData.requiresSubscription
                          ? "border-champagne-gold/60 bg-soft-cream shadow-[0_8px_22px_rgba(7,19,31,0.035)]"
                          : "border-light-champagne bg-warm-ivory/55 hover:border-champagne-gold/45 hover:bg-soft-white"
                      }
                    `}
                  >
                    <input
                      type="checkbox"
                      name="requiresSubscription"
                      checked={formData.requiresSubscription}
                      onChange={handleChange}
                      className="h-4 w-4 accent-classic-gold"
                    />

                    <div>
                      <p className="text-[11px] font-semibold text-midnight-navy">
                        Subscription
                      </p>

                      <p className="mt-1 text-[9px] text-steel-gray">
                        Requires subscription
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label className="mb-2.5 block text-[9px] font-semibold uppercase tracking-[0.14em] text-midnight-navy">
                  Status
                </label>

                <p className="mb-3 text-[10px] leading-5 text-steel-gray">
                  Control whether this model is available.
                </p>

                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="h-[54px] w-full rounded-[14px] border border-light-champagne bg-warm-ivory/65 px-5 text-[12px] text-midnight-navy outline-none transition-all duration-300 hover:border-champagne-gold/55 hover:bg-soft-white focus:border-classic-gold focus:bg-soft-white focus:shadow-[0_0_0_4px_rgba(201,162,77,0.08)]"
                >
                  <option value="active">Active</option>

                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="relative overflow-hidden rounded-[20px] border border-light-champagne/90 bg-warm-ivory/70 p-6">
                <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-champagne-gold/[0.06] blur-[55px]" />

                <p className="relative text-[7px] font-semibold uppercase tracking-[0.25em] text-antique-gold">
                  Model Preview
                </p>

                <div className="relative mt-5 flex flex-col gap-5 sm:flex-row">
                  <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-[18px] border border-light-champagne bg-soft-white shadow-[0_8px_22px_rgba(7,19,31,0.04)]">
                    {formData.image ? (
                      <img
                        src={getImageUrl(formData.image)}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-[18px] text-classic-gold">✦</span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="font-serif text-[1.35rem] font-normal text-midnight-navy">
                        {formData.modelName || "Model Name"}
                      </h3>

                      <span
                        className={`
                          rounded-full border px-3 py-1.5
                          text-[7px] font-semibold uppercase tracking-[0.1em]
                          ${
                            formData.status === "active"
                              ? "border-classic-gold/25 bg-soft-cream text-antique-gold"
                              : "border-antique-gold/20 bg-warm-ivory text-antique-gold"
                          }
                        `}
                      >
                        {formData.status}
                      </span>
                    </div>

                    <p className="mt-2 font-mono text-[8px] font-semibold uppercase tracking-[0.14em] text-slate-gray">
                      {formData.modelCode
                        ? formData.modelCode.toUpperCase()
                        : "MODEL_CODE"}
                    </p>

                    <p className="mt-3 text-[10px] leading-6 text-slate-gray">
                      {formData.description ||
                        "Technology model description will appear here."}
                    </p>

                    {formData.manufacturer && (
                      <p className="mt-3 text-[9px] text-steel-gray">
                        Manufacturer:{" "}
                        <span className="font-semibold text-midnight-navy">
                          {formData.manufacturer}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-9 flex flex-col-reverse gap-3 border-t border-light-champagne/80 pt-7 sm:flex-row sm:justify-end">
              <Link
                to="/admin/technology-models"
                className="inline-flex min-h-[48px] items-center justify-center rounded-[13px] border border-light-champagne bg-soft-white px-7 text-[8px] font-semibold uppercase tracking-[0.11em] text-slate-gray transition-all duration-300 hover:-translate-y-0.5 hover:border-champagne-gold hover:bg-warm-ivory hover:text-midnight-navy"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={isLoading || isUploading}
                className="inline-flex min-h-[48px] items-center justify-center gap-3 rounded-[13px] bg-midnight-navy px-8 text-[8px] font-semibold uppercase tracking-[0.11em] text-soft-white shadow-[0_11px_26px_rgba(18,38,58,0.14)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-rich-navy hover:shadow-[0_15px_32px_rgba(18,38,58,0.2)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {isLoading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-champagne-gold/25 border-t-champagne-gold" />
                    Creating...
                  </>
                ) : isUploading ? (
                  "Uploading Image..."
                ) : (
                  <>
                    <span className="text-[9px] text-champagne-gold">✦</span>

                    <span>Create Technology Model</span>
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

export default AddTechnologyModelPage;