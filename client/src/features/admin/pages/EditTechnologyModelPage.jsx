import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
  getTechnologyModel,
  updateTechnologyModel,
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

const EditTechnologyModelPage = () => {
  const { id } = useParams();

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

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadPage();
  }, []);

  const loadPage = async () => {
    try {
      setIsLoading(true);
      setError("");

      const [technologiesResponse, technologyModelResponse] = await Promise.all(
        [getTechnologies(), getTechnologyModel(id)],
      );

      setTechnologies(technologiesResponse.data?.technologies || []);

      const model = technologyModelResponse.data?.technologyModel;

      setFormData({
        technology: model?.technology?._id || model?.technology || "",

        modelName: model?.modelName || "",

        modelCode: model?.modelCode || "",

        description: model?.description || "",

        manufacturer: model?.manufacturer || "",

        image: model?.image || "",

        requiresBattery: model?.requiresBattery || false,

        requiresActivation: model?.requiresActivation || false,

        requiresSubscription: model?.requiresSubscription || false,

        status: model?.status || "active",
      });
    } catch (error) {
      console.error(error);

      setError(
        error?.response?.data?.message || "Failed to load technology model.",
      );
    } finally {
      setIsLoading(false);
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
    setIsSaving(true);

    try {
      await updateTechnologyModel(id, formData);

      navigate("/admin/technology-models");
    } catch (error) {
      console.error(error);

      setError(
        error?.response?.data?.message || "Failed to update technology model.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-warm-ivory">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[380px] w-[380px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-soft-cream blur-[110px]" />

        <div className="flex min-h-screen items-center justify-center px-6">
          <div className="relative flex flex-col items-center gap-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-champagne-gold/25 bg-midnight-navy shadow-[0_12px_30px_rgba(18,38,58,0.15)]">
              <span className="h-6 w-6 animate-spin rounded-full border-2 border-champagne-gold/20 border-t-champagne-gold" />
            </div>

            <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-slate-gray">
              Loading Technology Model...
            </p>
          </div>
        </div>
      </div>
    );
  }

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
              Edit Technology Model
            </h1>

            <p className="mt-4 max-w-xl text-[12px] leading-7 text-slate-gray sm:text-[13px]">
              Update technology model information for your smart jewelry
              collection.
            </p>
          </div>

          <Link
            to="/admin/technology-models"
            className="group inline-flex min-h-[46px] w-fit shrink-0 items-center justify-center gap-3 rounded-full border border-champagne-gold/30 bg-soft-white/80 px-5 text-[8px] font-semibold uppercase tracking-[0.12em] text-slate-gray shadow-[0_7px_18px_rgba(7,19,31,0.035)] transition-all duration-300 hover:-translate-y-0.5 hover:border-champagne-gold hover:bg-warm-ivory hover:text-midnight-navy"
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
                  Technology Model Details
                </p>

                <h2 className="mt-1.5 font-serif text-[1.45rem] font-normal tracking-[-0.02em] text-midnight-navy">
                  Update Technology Model
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
                  Select the technology used by this model.
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
                    The name of this technology model.
                  </p>

                  <input
                    type="text"
                    name="modelName"
                    value={formData.modelName}
                    onChange={handleChange}
                    placeholder="Smart NFC Ring"
                    required
                    className="h-[54px] w-full rounded-[14px] border border-light-champagne bg-warm-ivory/65 px-5 text-[12px] text-midnight-navy outline-none transition-all duration-300 placeholder:text-steel-gray/65 hover:border-champagne-gold/55 hover:bg-soft-white focus:border-classic-gold focus:bg-soft-white focus:shadow-[0_0_0_4px_rgba(201,162,77,0.08)]"
                  />
                </div>

                <div>
                  <label className="mb-2.5 block text-[9px] font-semibold uppercase tracking-[0.14em] text-midnight-navy">
                    Model Code
                  </label>

                  <p className="mb-3 text-[10px] leading-5 text-steel-gray">
                    A unique uppercase code used internally.
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
                  Describe the model and its main features.
                </p>

                <textarea
                  rows={5}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the technology model..."
                  className="w-full resize-none rounded-[14px] border border-light-champagne bg-warm-ivory/65 px-5 py-4 text-[12px] leading-6 text-midnight-navy outline-none transition-all duration-300 placeholder:text-steel-gray/65 hover:border-champagne-gold/55 hover:bg-soft-white focus:border-classic-gold focus:bg-soft-white focus:shadow-[0_0_0_4px_rgba(201,162,77,0.08)]"
                />
              </div>

              <div>
                <label className="mb-2.5 block text-[9px] font-semibold uppercase tracking-[0.14em] text-midnight-navy">
                  Manufacturer
                </label>

                <p className="mb-3 text-[10px] leading-5 text-steel-gray">
                  The company or manufacturer of this model.
                </p>

                <input
                  type="text"
                  name="manufacturer"
                  value={formData.manufacturer}
                  onChange={handleChange}
                  placeholder="Example Manufacturer"
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

                <label className="group relative flex min-h-36 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[18px] border border-dashed border-champagne-gold/35 bg-warm-ivory/55 px-5 py-7 transition-all duration-300 hover:border-champagne-gold/70 hover:bg-soft-white">
                  <div className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full bg-champagne-gold/[0.06] blur-[50px]" />

                  <span className="relative mb-3 text-[19px] text-classic-gold transition-transform duration-300 group-hover:-translate-y-1">
                    ↑
                  </span>

                  <span className="relative text-[9px] font-semibold uppercase tracking-[0.11em] text-midnight-navy">
                    Choose an image
                  </span>

                  <span className="relative mt-2 text-[8px] text-steel-gray">
                    PNG, JPG or JPEG
                  </span>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>

                {isUploading && (
                  <div className="mt-4 flex items-center gap-3 rounded-[14px] border border-light-champagne bg-warm-ivory/70 px-5 py-4">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-champagne-gold/25 border-t-classic-gold" />

                    <p className="text-[10px] text-slate-gray">
                      Uploading image...
                    </p>
                  </div>
                )}

                {formData.image && (
                  <div className="relative mt-5 overflow-hidden rounded-[18px] border border-light-champagne/90 bg-warm-ivory/65 p-5">
                    <div className="pointer-events-none absolute -right-14 -top-14 h-32 w-32 rounded-full bg-champagne-gold/[0.06] blur-[50px]" />

                    <p className="relative mb-4 text-[7px] font-semibold uppercase tracking-[0.25em] text-antique-gold">
                      Current Image
                    </p>

                    <div className="relative h-40 w-40 overflow-hidden rounded-[18px] border border-light-champagne bg-soft-white shadow-[0_9px_24px_rgba(7,19,31,0.045)]">
                      <img
                        src={getImageUrl(formData.image)}
                        alt="Technology Model"
                        className="h-full w-full object-cover"
                      />

                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-luxury-black/10 to-transparent" />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <div className="mb-4">
                  <label className="block text-[9px] font-semibold uppercase tracking-[0.14em] text-midnight-navy">
                    Model Features
                  </label>

                  <p className="mt-2 text-[10px] leading-5 text-steel-gray">
                    Select the requirements for this technology model.
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
                  Control whether this model is available in the system.
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

              <div className="relative overflow-hidden rounded-[20px] border border-light-champagne/90 bg-warm-ivory/70 p-5">
                <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-champagne-gold/[0.06] blur-[55px]" />

                <p className="relative text-[7px] font-semibold uppercase tracking-[0.25em] text-antique-gold">
                  Model Preview
                </p>

                <div className="relative mt-5 flex items-center gap-4">
                  {formData.image ? (
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[16px] border border-light-champagne bg-soft-white shadow-[0_8px_22px_rgba(7,19,31,0.04)]">
                      <img
                        src={getImageUrl(formData.image)}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />

                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-luxury-black/10 to-transparent" />
                    </div>
                  ) : (
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[16px] border border-light-champagne bg-soft-white text-[15px] text-classic-gold shadow-[0_8px_22px_rgba(7,19,31,0.04)]">
                      ✦
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="truncate font-serif text-[1.2rem] font-normal text-midnight-navy">
                      {formData.modelName || "Technology Model"}
                    </p>

                    <p className="mt-1 font-mono text-[8px] font-semibold uppercase tracking-[0.14em] text-slate-gray">
                      {formData.modelCode
                        ? formData.modelCode.toUpperCase()
                        : "MODEL_CODE"}
                    </p>

                    <div className="mt-2 flex flex-wrap gap-2">
                      {formData.requiresBattery && (
                        <span className="rounded-full border border-light-champagne bg-soft-white px-3 py-1 text-[7px] font-semibold uppercase tracking-[0.07em] text-slate-gray">
                          Battery
                        </span>
                      )}

                      {formData.requiresActivation && (
                        <span className="rounded-full border border-light-champagne bg-soft-white px-3 py-1 text-[7px] font-semibold uppercase tracking-[0.07em] text-slate-gray">
                          Activation
                        </span>
                      )}

                      {formData.requiresSubscription && (
                        <span className="rounded-full border border-light-champagne bg-soft-white px-3 py-1 text-[7px] font-semibold uppercase tracking-[0.07em] text-slate-gray">
                          Subscription
                        </span>
                      )}
                    </div>
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
                disabled={isSaving || isUploading}
                className="inline-flex min-h-[48px] items-center justify-center gap-3 rounded-[13px] bg-midnight-navy px-8 text-[8px] font-semibold uppercase tracking-[0.11em] text-soft-white shadow-[0_11px_26px_rgba(18,38,58,0.14)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-rich-navy hover:shadow-[0_15px_32px_rgba(18,38,58,0.2)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {isSaving ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-champagne-gold/25 border-t-champagne-gold" />
                    Updating...
                  </>
                ) : (
                  <>
                    <span className="text-[9px] text-champagne-gold">✦</span>

                    <span>Update Technology Model</span>
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

export default EditTechnologyModelPage;