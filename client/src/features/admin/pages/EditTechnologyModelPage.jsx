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
  }, [id]);

  const loadPage = async () => {
    try {
      setIsLoading(true);
      setError("");

      const [technologiesResponse, technologyModelResponse] =
        await Promise.all([
          getTechnologies(),
          getTechnologyModel(id),
        ]);

      setTechnologies(
        technologiesResponse.data?.technologies || [],
      );

      const model =
        technologyModelResponse.data?.technologyModel;

      if (!model) {
        throw new Error("Technology model not found.");
      }

      setFormData({
        technology:
          model.technology?._id ||
          model.technology ||
          "",

        modelName:
          model.modelName ||
          "",

        modelCode:
          model.modelCode ||
          "",

        description:
          model.description ||
          "",

        manufacturer:
          model.manufacturer ||
          "",

        image:
          model.image ||
          "",

        requiresBattery:
          Boolean(model.requiresBattery),

        requiresActivation:
          Boolean(model.requiresActivation),

        requiresSubscription:
          Boolean(model.requiresSubscription),

        status:
          model.status ||
          "active",
      });
    } catch (error) {
      console.error(error);

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to load technology model.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setFormData((previous) => ({
      ...previous,

      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  const handleImageUpload = async (event) => {
    const file =
      event.target.files[0];

    if (!file) return;

    try {
      setIsUploading(true);

      const uploadData =
        new FormData();

      uploadData.append(
        "image",
        file,
      );

      const response =
        await uploadImage(
          uploadData,
        );

      setFormData((previous) => ({
        ...previous,

        image:
          response.image,
      }));
    } catch (error) {
      console.error(error);

      alert(
        "Failed to upload image.",
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setIsSaving(true);

    try {
      const {
        modelCode,
        ...updateData
      } = formData;

      await updateTechnologyModel(
        id,
        updateData,
      );

      navigate(
        "/admin/technology-models",
      );
    } catch (error) {
      console.error(error);

      setError(
        error?.response?.data?.message ||
          "Failed to update technology model.",
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
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-champagne-gold/25 bg-midnight-navy">
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
      <header className="relative border-b border-light-champagne/80 bg-soft-white/60 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-6 px-6 py-7 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <span className="h-px w-8 bg-classic-gold/60" />

              <span className="text-[8px] font-semibold uppercase tracking-[0.3em] text-antique-gold">
                Smart Jewelry
              </span>
            </div>

            <h1 className="font-serif text-[2.5rem] font-normal leading-none tracking-[-0.04em] sm:text-[3rem]">
              Edit Technology Model
            </h1>

            <p className="mt-4 text-[12px] leading-7 text-slate-gray">
              Update technology model information.
            </p>
          </div>

          <Link
            to="/admin/technology-models"
            className="inline-flex min-h-[46px] items-center justify-center gap-3 rounded-full border border-champagne-gold/30 bg-soft-white px-5 text-[8px] font-semibold uppercase text-slate-gray"
          >
            ← Back
          </Link>
        </div>
      </header>

      <main className="relative mx-auto max-w-[1040px] px-6 py-12 sm:px-8 lg:px-10">
        <div className="overflow-hidden rounded-[28px] border border-light-champagne/90 bg-soft-white/85 shadow-[0_20px_60px_rgba(7,19,31,0.055)]">
          <div className="border-b border-light-champagne/80 px-7 py-7 sm:px-10">
            <h2 className="font-serif text-[1.45rem]">
              Update Technology Model
            </h2>
          </div>

          <form
            onSubmit={handleSubmit}
            className="px-7 py-8 sm:px-10 sm:py-10"
          >
            {error && (
              <div className="mb-7 rounded-[16px] border border-antique-gold/25 bg-soft-cream px-5 py-4 text-[10px] text-antique-gold">
                {error}
              </div>
            )}

            <div className="space-y-8">
              <div>
                <label className="mb-2.5 block text-[9px] font-semibold uppercase tracking-[0.14em]">
                  Technology
                </label>

                <select
                  name="technology"
                  value={formData.technology}
                  onChange={handleChange}
                  required
                  className="h-[54px] w-full rounded-[14px] border border-light-champagne bg-warm-ivory/65 px-5 text-[12px] outline-none focus:border-classic-gold"
                >
                  <option value="">
                    Select Technology
                  </option>

                  {technologies.map(
                    (technology) => (
                      <option
                        key={technology._id}
                        value={technology._id}
                      >
                        {technology.name}
                      </option>
                    ),
                  )}
                </select>
              </div>

              <div className="grid gap-7 md:grid-cols-2">
                <div>
                  <label className="mb-2.5 block text-[9px] font-semibold uppercase tracking-[0.14em]">
                    Model Name
                  </label>

                  <input
                    type="text"
                    name="modelName"
                    value={formData.modelName}
                    onChange={handleChange}
                    required
                    className="h-[54px] w-full rounded-[14px] border border-light-champagne bg-warm-ivory/65 px-5 text-[12px] outline-none focus:border-classic-gold"
                  />
                </div>

                <div>
                  <label className="mb-2.5 block text-[9px] font-semibold uppercase tracking-[0.14em]">
                    Model Code
                  </label>

                  <p className="mb-3 text-[10px] text-steel-gray">
                    Generated automatically and cannot be changed.
                  </p>

                  <input
                    type="text"
                    value={formData.modelCode}
                    readOnly
                    className="h-[54px] w-full cursor-not-allowed rounded-[14px] border border-light-champagne bg-silver-mist/70 px-5 font-mono text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-gray outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2.5 block text-[9px] font-semibold uppercase tracking-[0.14em]">
                  Description
                </label>

                <textarea
                  rows={5}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full resize-none rounded-[14px] border border-light-champagne bg-warm-ivory/65 px-5 py-4 text-[12px] leading-6 outline-none focus:border-classic-gold"
                />
              </div>

              <div>
                <label className="mb-2.5 block text-[9px] font-semibold uppercase tracking-[0.14em]">
                  Manufacturer
                </label>

                <input
                  type="text"
                  name="manufacturer"
                  value={formData.manufacturer}
                  onChange={handleChange}
                  className="h-[54px] w-full rounded-[14px] border border-light-champagne bg-warm-ivory/65 px-5 text-[12px] outline-none focus:border-classic-gold"
                />
              </div>

              <div>
                <label className="mb-2.5 block text-[9px] font-semibold uppercase tracking-[0.14em]">
                  Model Image
                </label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="block w-full rounded-[14px] border border-light-champagne bg-warm-ivory p-4 text-[10px]"
                />

                {isUploading && (
                  <p className="mt-3 text-[10px] text-slate-gray">
                    Uploading image...
                  </p>
                )}

                {formData.image && (
                  <div className="mt-5 h-40 w-40 overflow-hidden rounded-[18px] border border-light-champagne bg-soft-white">
                    <img
                      src={getImageUrl(formData.image)}
                      alt="Technology Model"
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="mb-4 block text-[9px] font-semibold uppercase tracking-[0.14em]">
                  Model Features
                </label>

                <div className="grid gap-4 md:grid-cols-3">
                  <label className="flex cursor-pointer items-center gap-4 rounded-[18px] border border-light-champagne bg-warm-ivory/55 p-5">
                    <input
                      type="checkbox"
                      name="requiresBattery"
                      checked={formData.requiresBattery}
                      onChange={handleChange}
                      className="h-4 w-4 accent-classic-gold"
                    />

                    <span className="text-[11px] font-semibold">
                      Battery
                    </span>
                  </label>

                  <label className="flex cursor-pointer items-center gap-4 rounded-[18px] border border-light-champagne bg-warm-ivory/55 p-5">
                    <input
                      type="checkbox"
                      name="requiresActivation"
                      checked={formData.requiresActivation}
                      onChange={handleChange}
                      className="h-4 w-4 accent-classic-gold"
                    />

                    <span className="text-[11px] font-semibold">
                      Activation
                    </span>
                  </label>

                  <label className="flex cursor-pointer items-center gap-4 rounded-[18px] border border-light-champagne bg-warm-ivory/55 p-5">
                    <input
                      type="checkbox"
                      name="requiresSubscription"
                      checked={formData.requiresSubscription}
                      onChange={handleChange}
                      className="h-4 w-4 accent-classic-gold"
                    />

                    <span className="text-[11px] font-semibold">
                      Subscription
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="mb-2.5 block text-[9px] font-semibold uppercase tracking-[0.14em]">
                  Status
                </label>

                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="h-[54px] w-full rounded-[14px] border border-light-champagne bg-warm-ivory/65 px-5 text-[12px] outline-none focus:border-classic-gold"
                >
                  <option value="active">
                    Active
                  </option>

                  <option value="inactive">
                    Inactive
                  </option>
                </select>
              </div>
            </div>

            <div className="mt-9 flex flex-col-reverse gap-3 border-t border-light-champagne pt-7 sm:flex-row sm:justify-end">
              <Link
                to="/admin/technology-models"
                className="inline-flex min-h-[48px] items-center justify-center rounded-[13px] border border-light-champagne bg-soft-white px-7 text-[8px] font-semibold uppercase"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={isSaving || isUploading}
                className="inline-flex min-h-[48px] items-center justify-center gap-3 rounded-[13px] bg-midnight-navy px-8 text-[8px] font-semibold uppercase text-soft-white disabled:opacity-50"
              >
                {isSaving
                  ? "Updating..."
                  : "Update Technology Model"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default EditTechnologyModelPage;