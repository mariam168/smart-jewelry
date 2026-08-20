import { useEffect, useState } from "react";

import { Link, useNavigate, useParams } from "react-router-dom";

import {
  getCategory,
  updateCategory,
  uploadImage,
} from "../services/categoryApi";

const EditCategoryPage = () => {
  const { id } = useParams();

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
    sortOrder: 0,
  });

  const [image, setImage] = useState(null);

  const [preview, setPreview] = useState("");

  const [removeImage, setRemoveImage] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

  const [isSaving, setIsSaving] = useState(false);

  const [error, setError] = useState("");

  const generateSlug = (text) => {
    return text
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "")
      .replace(/--+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) {
      return "";
    }

    if (
      imageUrl.startsWith("http://") ||
      imageUrl.startsWith("https://") ||
      imageUrl.startsWith("blob:")
    ) {
      return imageUrl;
    }

    return `http://localhost:5000${imageUrl}`;
  };

  useEffect(() => {
    const loadCategory = async () => {
      try {
        setIsLoading(true);

        setError("");

        const response = await getCategory(id);

        console.log("Category response:", response);

        const category =
          response?.data?.category || response?.category || response?.data;

        if (!category) {
          throw new Error("Category not found.");
        }

        setFormData({
          name: category.name || "",

          description: category.description || "",

          image: category.image || "",

          sortOrder: category.sortOrder ?? 0,
        });

        if (category.image) {
          setPreview(getImageUrl(category.image));
        } else {
          setPreview("");
        }

        setRemoveImage(false);
      } catch (error) {
        console.error("Load category error:", error);

        setError(
          error?.response?.data?.message ||
            error?.message ||
            "Failed to load category.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      loadCategory();
    }
  }, [id]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,

      [name]: value,
    }));

    setError("");
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");

      event.target.value = "";

      return;
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      setError("Image size must be less than 5MB.");

      event.target.value = "";

      return;
    }

    setError("");

    const newPreview = URL.createObjectURL(file);

    setImage(file);

    setPreview(newPreview);

    setRemoveImage(false);
  };

  const handleRemoveImage = () => {
    if (image) {
      setImage(null);

      if (formData.image) {
        setPreview(getImageUrl(formData.image));
      } else {
        setPreview("");
      }

      return;
    }

    setRemoveImage(true);

    setPreview("");

    setFormData((previousData) => ({
      ...previousData,

      image: "",
    }));
  };

  const handleRestoreImage = () => {
    setRemoveImage(false);

    if (formData.image) {
      setPreview(getImageUrl(formData.image));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    const categoryName = formData.name.trim();

    if (!categoryName) {
      setError("Category name is required.");

      return;
    }

    setIsSaving(true);

    try {
      let imageUrl = formData.image || "";

      if (removeImage) {
        imageUrl = "";
      }

      if (image) {
        const uploadData = new FormData();

        uploadData.append("image", image);

        const uploadResponse = await uploadImage(uploadData);

        imageUrl =
          uploadResponse?.image ||
          uploadResponse?.data?.image ||
          uploadResponse?.url ||
          uploadResponse?.data?.url ||
          "";

        if (!imageUrl) {
          throw new Error(
            "Image uploaded successfully, but the image URL was not returned.",
          );
        }
      }

      const slug = generateSlug(categoryName);

      if (!slug) {
        throw new Error("Unable to generate category slug.");
      }

      await updateCategory(id, {
        name: categoryName,

        slug,

        description: formData.description.trim(),

        image: imageUrl,

        sortOrder: Number(formData.sortOrder || 0),
      });

      navigate("/admin/categories");
    } catch (error) {
      console.error("Update category error:", error);

      setError(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Failed to update category.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-warm-ivory">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[380px] w-[380px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-soft-cream blur-[110px]" />

        <div className="relative flex flex-col items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-champagne-gold/25 bg-midnight-navy shadow-[0_12px_30px_rgba(18,38,58,0.15)]">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-champagne-gold/20 border-t-champagne-gold" />
          </div>

          <p className="mt-5 text-[9px] font-semibold uppercase tracking-[0.24em] text-slate-gray">
            Loading Category...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-warm-ivory text-midnight-navy">
      <div className="pointer-events-none fixed -right-52 top-16 h-[520px] w-[520px] rounded-full bg-champagne-gold/[0.06] blur-[130px]" />

      <div className="pointer-events-none fixed -left-44 bottom-0 h-[460px] w-[460px] rounded-full bg-light-champagne/55 blur-[120px]" />

      <header className="relative border-b border-light-champagne/80 bg-soft-white/65 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1080px] flex-col gap-6 px-6 py-7 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <span className="h-px w-8 bg-classic-gold/60" />

              <div className="text-[8px] font-semibold uppercase tracking-[0.25em] text-antique-gold">
                Category Management
              </div>
            </div>

            <h1 className="font-serif text-[2.5rem] font-normal leading-none tracking-[-0.04em] text-midnight-navy sm:text-[3rem]">
              Edit Category
            </h1>

            <p className="mt-3 text-[11px] leading-6 text-slate-gray sm:text-[12px]">
              Update category information
            </p>
          </div>

          <Link
            to="/admin/categories"
            className="group inline-flex min-h-[46px] w-fit items-center justify-center gap-3 rounded-full border border-champagne-gold/30 bg-soft-white/85 px-5 text-[8px] font-semibold uppercase tracking-[0.11em] text-slate-gray shadow-[0_7px_18px_rgba(7,19,31,0.035)] transition-all duration-300 hover:-translate-y-0.5 hover:border-champagne-gold hover:bg-warm-ivory hover:text-midnight-navy"
          >
            <span className="text-[14px] text-classic-gold transition-transform duration-300 group-hover:-translate-x-1">
              ←
            </span>
            Back
          </Link>
        </div>
      </header>

      <main className="relative mx-auto max-w-[1080px] px-6 py-10 sm:px-8 lg:px-10 lg:py-12">
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-[16px] border border-antique-gold/25 bg-soft-cream/85 p-4 text-[10px] leading-5 text-antique-gold shadow-[0_7px_20px_rgba(7,19,31,0.03)]">
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-midnight-navy font-semibold text-champagne-gold">
              !
            </div>

            <div>
              <p className="font-semibold text-midnight-navy">
                Something went wrong
              </p>

              <p className="mt-1">{error}</p>
            </div>
          </div>
        )}

        <div className="relative overflow-hidden rounded-[28px] border border-light-champagne/90 bg-soft-white/85 shadow-[0_20px_60px_rgba(7,19,31,0.055)] backdrop-blur-sm">
          <div className="pointer-events-none absolute -right-28 -top-28 h-72 w-72 rounded-full border border-champagne-gold/10" />

          <div className="pointer-events-none absolute -bottom-28 -left-28 h-72 w-72 rounded-full border border-champagne-gold/[0.08]" />

          <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-soft-cream blur-[90px]" />

          <div className="relative border-b border-light-champagne/80 bg-warm-ivory/50 px-7 py-6 sm:px-9">
            <h2 className="font-serif text-[1.5rem] font-normal tracking-[-0.02em] text-midnight-navy">
              Category Information
            </h2>

            <p className="mt-2 text-[10px] leading-5 text-slate-gray">
              Edit the category details, display order, and image.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="relative space-y-8 p-7 sm:p-9"
          >
            <div>
              <label className="mb-2.5 block text-[9px] font-semibold uppercase tracking-[0.14em] text-midnight-navy">
                Category Name
                <span className="ml-1 text-antique-gold">*</span>
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter category name"
                required
                disabled={isSaving}
                className="h-[54px] w-full rounded-[14px] border border-light-champagne bg-warm-ivory/60 px-5 text-[12px] text-midnight-navy outline-none transition-all duration-300 placeholder:text-steel-gray/65 hover:border-champagne-gold/55 hover:bg-soft-white focus:border-classic-gold focus:bg-soft-white focus:ring-4 focus:ring-classic-gold/10 disabled:cursor-not-allowed disabled:bg-silver-mist/60 disabled:text-steel-gray"
              />

              <p className="mt-2 text-[9px] leading-5 text-steel-gray">
                The category slug will be generated automatically from this
                name.
              </p>
            </div>

            <div>
              <label className="mb-2.5 block text-[9px] font-semibold uppercase tracking-[0.14em] text-midnight-navy">
                Slug
              </label>

              <div className="rounded-[14px] border border-light-champagne bg-soft-cream/65 px-5 py-4 font-mono text-[10px] tracking-[0.05em] text-slate-gray">
                {generateSlug(formData.name) || "category-slug"}
              </div>

              <p className="mt-2 text-[9px] leading-5 text-steel-gray">
                Automatically generated from the category name.
              </p>
            </div>

            <div>
              <label className="mb-2.5 block text-[9px] font-semibold uppercase tracking-[0.14em] text-midnight-navy">
                Description
              </label>

              <textarea
                rows={5}
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Write a short description for this category..."
                disabled={isSaving}
                className="w-full resize-none rounded-[14px] border border-light-champagne bg-warm-ivory/60 px-5 py-4 text-[12px] leading-6 text-midnight-navy outline-none transition-all duration-300 placeholder:text-steel-gray/65 hover:border-champagne-gold/55 hover:bg-soft-white focus:border-classic-gold focus:bg-soft-white focus:ring-4 focus:ring-classic-gold/10 disabled:cursor-not-allowed disabled:bg-silver-mist/60 disabled:text-steel-gray"
              />

              <div className="mt-2 flex justify-between gap-4">
                <p className="text-[9px] text-steel-gray">
                  Optional category description.
                </p>

                <p className="text-[9px] text-steel-gray">
                  {formData.description.length} characters
                </p>
              </div>
            </div>

            <div>
              <label className="mb-2.5 block text-[9px] font-semibold uppercase tracking-[0.14em] text-midnight-navy">
                Sort Order
              </label>

              <input
                type="number"
                name="sortOrder"
                min="0"
                step="1"
                value={formData.sortOrder}
                onChange={handleChange}
                disabled={isSaving}
                className="h-[54px] w-full rounded-[14px] border border-light-champagne bg-warm-ivory/60 px-5 text-[12px] text-midnight-navy outline-none transition-all duration-300 hover:border-champagne-gold/55 hover:bg-soft-white focus:border-classic-gold focus:bg-soft-white focus:ring-4 focus:ring-classic-gold/10 disabled:cursor-not-allowed disabled:bg-silver-mist/60 disabled:text-steel-gray"
              />

              <p className="mt-2 text-[9px] leading-5 text-steel-gray">
                Controls the display order of this category. Lower numbers
                appear first.
              </p>
            </div>

            <div className="relative overflow-hidden rounded-[20px] border border-light-champagne/90 bg-warm-ivory/55 p-6">
              <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-champagne-gold/[0.06] blur-[55px]" />

              <div className="relative mb-5">
                <h3 className="font-serif text-[1.25rem] font-normal text-midnight-navy">
                  Category Image
                </h3>

                <p className="mt-1.5 text-[10px] leading-5 text-slate-gray">
                  Update or remove the image representing this category.
                </p>
              </div>

              {!preview ? (
                <label className="group relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[18px] border border-dashed border-champagne-gold/35 bg-soft-white/80 px-6 py-12 text-center transition-all duration-300 hover:border-champagne-gold/70 hover:bg-soft-white">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-[17px] border border-champagne-gold/20 bg-soft-cream text-classic-gold shadow-[0_7px_18px_rgba(7,19,31,0.035)] transition-all duration-300 group-hover:-translate-y-1 group-hover:border-champagne-gold/40">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="h-8 w-8"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 16.5V8.25A2.25 2.25 0 0 1 5.25 6h3l1.5-2h4.5l1.5 2h3A2.25 2.25 0 0 1 21 8.25v8.25A2.25 2.25 0 0 1 18.75 18.75H5.25A2.25 2.25 0 0 1 3 16.5Z"
                      />

                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 14.25a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                      />
                    </svg>
                  </div>

                  <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-midnight-navy">
                    Click to upload an image
                  </span>

                  <span className="mt-2 text-[9px] text-slate-gray">
                    PNG, JPG, JPEG or WEBP
                  </span>

                  <span className="mt-1 text-[9px] text-steel-gray">
                    Maximum size: 5MB
                  </span>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={isSaving}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="rounded-[18px] border border-light-champagne bg-soft-white/90 p-4 shadow-[0_8px_24px_rgba(7,19,31,0.03)]">
                  <div className="relative overflow-hidden rounded-[15px] border border-light-champagne/70 bg-soft-cream">
                    <img
                      src={preview}
                      alt="Category Preview"
                      className="mx-auto h-72 w-full object-contain p-3"
                    />

                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      disabled={isSaving}
                      title={
                        image ? "Remove new image" : "Remove current image"
                      }
                      className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-light-champagne bg-soft-white text-antique-gold shadow-[0_7px_18px_rgba(7,19,31,0.08)] transition-all duration-300 hover:-translate-y-0.5 hover:border-champagne-gold hover:bg-warm-ivory disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.8"
                        stroke="currentColor"
                        className="h-5 w-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18 18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>

                  {image ? (
                    <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <p className="truncate text-[10px] font-semibold text-midnight-navy">
                          {image.name}
                        </p>

                        <p className="mt-1 text-[9px] text-steel-gray">
                          {(image.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>

                      <label className="inline-flex min-h-[38px] shrink-0 cursor-pointer items-center justify-center rounded-full border border-light-champagne bg-soft-white px-4 text-[7px] font-semibold uppercase tracking-[0.1em] text-slate-gray transition-all duration-300 hover:-translate-y-0.5 hover:border-champagne-gold hover:bg-warm-ivory hover:text-midnight-navy">
                        Change Image
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          disabled={isSaving}
                          className="hidden"
                        />
                      </label>
                    </div>
                  ) : (
                    <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-[10px] font-semibold text-midnight-navy">
                          Current Category Image
                        </p>

                        <p className="mt-1 text-[9px] leading-5 text-steel-gray">
                          This image is currently saved for this category.
                        </p>
                      </div>

                      <label className="inline-flex min-h-[38px] shrink-0 cursor-pointer items-center justify-center rounded-full border border-light-champagne bg-soft-white px-4 text-[7px] font-semibold uppercase tracking-[0.1em] text-slate-gray transition-all duration-300 hover:-translate-y-0.5 hover:border-champagne-gold hover:bg-warm-ivory hover:text-midnight-navy">
                        Change Image
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          disabled={isSaving}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                </div>
              )}

              {removeImage && !preview && (
                <div className="mt-4 flex flex-col gap-4 rounded-[15px] border border-antique-gold/25 bg-soft-cream/80 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[10px] font-semibold text-antique-gold">
                      Image will be removed
                    </p>

                    <p className="mt-1 text-[9px] leading-5 text-slate-gray">
                      The current category image will be deleted from the
                      category.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleRestoreImage}
                    disabled={isSaving}
                    className="inline-flex min-h-[38px] shrink-0 items-center justify-center rounded-full border border-antique-gold/20 bg-soft-white px-4 text-[7px] font-semibold uppercase tracking-[0.1em] text-antique-gold transition-all duration-300 hover:-translate-y-0.5 hover:border-antique-gold/40 hover:bg-warm-ivory hover:text-midnight-navy disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Undo
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-light-champagne/80 pt-7 sm:flex-row sm:justify-end">
              <Link
                to="/admin/categories"
                className="inline-flex min-h-[48px] items-center justify-center rounded-[13px] border border-light-champagne bg-soft-white px-7 text-[8px] font-semibold uppercase tracking-[0.11em] text-slate-gray transition-all duration-300 hover:-translate-y-0.5 hover:border-champagne-gold hover:bg-warm-ivory hover:text-midnight-navy"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex min-h-[48px] items-center justify-center gap-2.5 rounded-[13px] bg-midnight-navy px-7 text-[8px] font-semibold uppercase tracking-[0.11em] text-soft-white shadow-[0_11px_26px_rgba(18,38,58,0.14)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-rich-navy hover:shadow-[0_15px_32px_rgba(18,38,58,0.2)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {isSaving ? (
                  <>
                    <svg
                      className="h-4 w-4 animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />

                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.8"
                      stroke="currentColor"
                      className="h-5 w-5 text-champagne-gold"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 12.75 9 17l10-10"
                      />
                    </svg>
                    Update Category
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

export default EditCategoryPage;
