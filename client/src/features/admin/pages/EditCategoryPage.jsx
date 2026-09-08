import { useEffect, useState } from "react";

import { Link, useNavigate, useParams } from "react-router-dom";

import {
  getCategory,
  updateCategory,
  uploadImage,
} from "../services/categoryApi";

import { useTranslation } from "react-i18next";

const getBackendOrigin = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  if (backendUrl) {
    return String(backendUrl).replace(/\/+$/, "");
  }

  const apiUrl = import.meta.env.VITE_API_URL;

  if (apiUrl && /^https?:\/\//i.test(apiUrl)) {
    return String(apiUrl)
      .replace(/\/api\/?$/i, "")
      .replace(/\/+$/, "");
  }

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return "";
};

const BACKEND_URL = getBackendOrigin();

const getImageUrl = (value) => {
  if (!value) {
    return "";
  }

  let image =
    typeof value === "string"
      ? value.trim()
      : value.imageUrl || value.url || value.path || value.image || "";

  if (!image) {
    return "";
  }

  if (image.startsWith("blob:") || image.startsWith("data:")) {
    return image;
  }

  if (
    /^https?:\/\/localhost:5000/i.test(image) ||
    /^https?:\/\/127\.0\.0\.1:5000/i.test(image)
  ) {
    image = image.replace(
      /^https?:\/\/(?:localhost|127\.0\.0\.1):5000/i,
      "",
    );
  } else if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  if (image.startsWith("/api/uploads/")) {
    image = image.replace(/^\/api/, "");
  }

  if (!image.startsWith("/")) {
    image = `/${image}`;
  }

  return `${BACKEND_URL}${image}`;
};

const EditCategoryPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    nameEn: "",
    nameAr: "",
    descriptionEn: "",
    descriptionAr: "",
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

  useEffect(() => {
    const loadCategory = async () => {
      try {
        setIsLoading(true);
        setError("");

        const response = await getCategory(id);

        const category =
          response?.data?.category || response?.category || response?.data;

        if (!category) {
          throw new Error(t("editCategory.categoryNotFound"));
        }

        setFormData({
          nameEn: category.name?.en || "",
          nameAr: category.name?.ar || "",
          descriptionEn: category.description?.en || "",
          descriptionAr: category.description?.ar || "",
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
            t("editCategory.failedToLoadCategory"),
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
      setError(
        t("editCategory.validImageFile"),
      );

      event.target.value = "";

      return;
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      setError(
        t("editCategory.imageSizeLimit"),
      );

      event.target.value = "";

      return;
    }

    setError("");

    if (preview?.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }

    const newPreview = URL.createObjectURL(file);

    setImage(file);

    setPreview(newPreview);

    setRemoveImage(false);
  };

  const handleRemoveImage = () => {
    if (image) {
      if (preview?.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }

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

    const nameEn = formData.nameEn.trim();

    const nameAr = formData.nameAr.trim();

    if (!nameEn) {
      setError(
        t("editCategory.englishNameRequired"),
      );

      return;
    }

    if (!nameAr) {
      setError(
        t("editCategory.arabicNameRequired"),
      );

      return;
    }

    const slug = generateSlug(nameEn);

    if (!slug) {
      setError(
        t("editCategory.unableToGenerateSlug"),
      );

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
          uploadResponse?.imageUrl ||
          uploadResponse?.data?.imageUrl ||
          uploadResponse?.url ||
          uploadResponse?.data?.url ||
          uploadResponse?.path ||
          uploadResponse?.data?.path ||
          "";

        if (!imageUrl) {
          throw new Error(
            t("editCategory.imageUrlNotReturned"),
          );
        }
      }

      await updateCategory(id, {
        name: {
          en: nameEn,
          ar: nameAr,
        },

        slug,

        description: {
          en: formData.descriptionEn.trim(),
          ar: formData.descriptionAr.trim(),
        },

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
          t("editCategory.failedToUpdateCategory"),
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-warm-ivory">
        <div className="relative flex flex-col items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-champagne-gold/25 bg-midnight-navy">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-champagne-gold/20 border-t-champagne-gold" />
          </div>

          <p className="mt-5 text-[9px] font-semibold uppercase tracking-[0.24em] text-slate-gray">
            {t("editCategory.loadingCategory")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-warm-ivory text-midnight-navy">
      <header className="relative border-b border-light-champagne/80 bg-soft-white/65 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1080px] flex-col gap-6 px-6 py-7 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <span className="h-px w-8 bg-classic-gold/60" />

              <div className="text-[8px] font-semibold uppercase tracking-[0.25em] text-antique-gold">
                {t("editCategory.categoryManagement")}
              </div>
            </div>

            <h1 className="font-serif text-[2.5rem] font-normal leading-none tracking-[-0.04em]">
              {t("editCategory.editCategory")}
            </h1>

            <p className="mt-3 text-[11px] text-slate-gray">
              {t("editCategory.updateCategoryInformation")}
            </p>
          </div>

          <Link
            to="/admin/categories"
            className="inline-flex min-h-[46px] w-fit items-center justify-center rounded-full border border-champagne-gold/30 bg-soft-white px-5 text-[8px] font-semibold uppercase"
          >
            ← {t("editCategory.back")}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[1080px] px-6 py-10 lg:px-10">
        {error && (
          <div className="mb-6 rounded-[16px] border border-antique-gold/25 bg-soft-cream p-4 text-[10px] text-antique-gold">
            {error}
          </div>
        )}

        <div className="overflow-hidden rounded-[28px] border border-light-champagne bg-soft-white">
          <div className="border-b border-light-champagne bg-warm-ivory/50 px-7 py-6">
            <h2 className="font-serif text-[1.5rem]">
              {t("editCategory.categoryInformation")}
            </h2>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-8 p-7 sm:p-9"
          >
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-[9px] font-semibold uppercase">
                  {t("editCategory.categoryNameEnglish")}
                </label>

                <input
                  name="nameEn"
                  value={formData.nameEn}
                  onChange={handleChange}
                  required
                  className="h-[54px] w-full rounded-[14px] border border-light-champagne bg-warm-ivory/60 px-5"
                />
              </div>

              <div>
                <label className="mb-2 block text-[9px] font-semibold">
                  {t("editCategory.categoryNameArabic")}
                </label>

                <input
                  name="nameAr"
                  value={formData.nameAr}
                  onChange={handleChange}
                  required
                  dir="rtl"
                  className="h-[54px] w-full rounded-[14px] border border-light-champagne bg-warm-ivory/60 px-5"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-[9px] font-semibold uppercase">
                {t("editCategory.slug")}
              </label>

              <div className="rounded-[14px] border border-light-champagne bg-soft-cream px-5 py-4 font-mono text-[10px] text-slate-gray">
                {generateSlug(formData.nameEn) ||
                  t("editCategory.categorySlug")}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-[9px] font-semibold uppercase">
                  {t("editCategory.descriptionEnglish")}
                </label>

                <textarea
                  rows={5}
                  name="descriptionEn"
                  value={formData.descriptionEn}
                  onChange={handleChange}
                  className="w-full rounded-[14px] border border-light-champagne bg-warm-ivory/60 px-5 py-4"
                />
              </div>

              <div>
                <label className="mb-2 block text-[9px] font-semibold">
                  {t("editCategory.descriptionArabic")}
                </label>

                <textarea
                  rows={5}
                  name="descriptionAr"
                  value={formData.descriptionAr}
                  onChange={handleChange}
                  dir="rtl"
                  className="w-full rounded-[14px] border border-light-champagne bg-warm-ivory/60 px-5 py-4"
                />
              </div>
            </div>

            <div className="rounded-[20px] border border-light-champagne bg-warm-ivory/55 p-6">
              <h3 className="font-serif text-[1.25rem]">
                {t("editCategory.categoryImage")}
              </h3>

              {!preview ? (
                <>
                  <label className="mt-5 flex cursor-pointer flex-col items-center justify-center rounded-[18px] border border-dashed border-champagne-gold/35 bg-soft-white px-6 py-12">
                    <span className="text-3xl text-classic-gold">
                      +
                    </span>

                    <span className="mt-3 text-[10px] font-semibold">
                      {t("editCategory.uploadImage")}
                    </span>

                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>

                  {removeImage && (
                    <button
                      type="button"
                      onClick={handleRestoreImage}
                      className="mt-4 rounded-full border border-light-champagne px-4 py-2 text-[8px]"
                    >
                      {t("editCategory.undoRemove")}
                    </button>
                  )}
                </>
              ) : (
                <div className="mt-5 rounded-[18px] border border-light-champagne bg-soft-white p-4">
                  <div className="relative">
                    <img
                      src={preview}
                      alt={t("editCategory.category")}
                      className="h-72 w-full rounded-[15px] object-contain"
                    />

                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-midnight-navy text-white"
                    >
                      ×
                    </button>
                  </div>

                  <label className="mt-4 inline-flex cursor-pointer rounded-full border border-light-champagne px-4 py-2 text-[8px]">
                    {t("editCategory.changeImage")}

                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 border-t border-light-champagne pt-7">
              <Link
                to="/admin/categories"
                className="rounded-[13px] border border-light-champagne px-7 py-4 text-[8px] font-semibold uppercase"
              >
                {t("editCategory.cancel")}
              </Link>

              <button
                type="submit"
                disabled={isSaving}
                className="rounded-[13px] bg-midnight-navy px-7 py-4 text-[8px] font-semibold uppercase text-white disabled:opacity-50"
              >
                {isSaving
                  ? t("editCategory.saving")
                  : t("editCategory.updateCategory")}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default EditCategoryPage;