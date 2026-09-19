import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { getCategories } from "../services/categoryApi";

import {
  createProduct,
  uploadImage,
  createProductImage,
  updateProduct,
} from "../services/productApi";

import { getTechnologyModels } from "../services/technologyModelApi";

import { createProductTechnology } from "../services/productTechnologyApi";

import { getSmartUnits } from "../smart-units/services/smartUnitApi";

const sanitizeMoneyInput = (value) => {
  let cleanValue = String(value || "")
    .replace(/,/g, "")
    .replace(/[^\d.]/g, "");

  const parts = cleanValue.split(".");

  if (parts.length > 1) {
    cleanValue = `${parts[0]}.${parts.slice(1).join("").slice(0, 2)}`;
  }

  return cleanValue;
};

const createLocalizedValue = () => ({
  en: "",
  ar: "",
});

const AddProductPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [categories, setCategories] = useState([]);
  const [technologyModels, setTechnologyModels] = useState([]);
  const [smartUnits, setSmartUnits] = useState([]);

  const [selectedTechnologyModels, setSelectedTechnologyModels] = useState([]);

  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);

  const [formData, setFormData] = useState({
    name: createLocalizedValue(),
    shortDescription: createLocalizedValue(),
    description: createLocalizedValue(),

    category: "",

    price: "",
    costPrice: "",
    comparePrice: "",
    stock: "",

    material: createLocalizedValue(),
    color: createLocalizedValue(),

    weight: "",

    featured: false,
    bestSeller: false,
    newArrival: false,

    tags: {
      en: "",
      ar: "",
    },

    seoTitle: createLocalizedValue(),
    seoDescription: createLocalizedValue(),
    seoSlug: createLocalizedValue(),

    preparationDays: "",

    careInstructions: createLocalizedValue(),

    isCustomizable: false,

    // BUSINESS RULE
    technologyRequired: false,

    status: "active",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  /*
   * Language used for the localized product fields.
   *
   * en = English
   * ar = Arabic
   */
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoryResponse, technologyResponse, smartUnitsResponse] =
          await Promise.all([
            getCategories(),
            getTechnologyModels(),
            getSmartUnits().catch(() => ({
              data: {
                smartUnits: [],
              },
            })),
          ]);

        let categoryData = [];

        if (categoryResponse?.data?.categories) {
          categoryData = categoryResponse.data.categories;
        } else if (categoryResponse?.categories) {
          categoryData = categoryResponse.categories;
        } else if (Array.isArray(categoryResponse)) {
          categoryData = categoryResponse;
        }

        setCategories(Array.isArray(categoryData) ? categoryData : []);

        if (categoryData.length > 0) {
          setFormData((previous) => ({
            ...previous,
            category: categoryData[0]._id,
          }));
        }

        const loadedTechnologyModels =
          technologyResponse?.data?.technologyModels ||
          technologyResponse?.technologyModels ||
          [];

        setTechnologyModels(
          Array.isArray(loadedTechnologyModels) ? loadedTechnologyModels : [],
        );

        const loadedSmartUnits =
          smartUnitsResponse?.data?.smartUnits ||
          smartUnitsResponse?.smartUnits ||
          [];

        setSmartUnits(Array.isArray(loadedSmartUnits) ? loadedSmartUnits : []);
      } catch (loadError) {
        console.error(loadError);

        setError(t("addProduct.failedToLoadCategoriesOrTechnologyModels"));
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    return () => {
      previewImages.forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, [previewImages]);

  /*
   * Handles normal fields:
   * price, category, stock, checkbox fields, etc.
   */
  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  /*
   * Handles localized fields:
   *
   * name.en
   * name.ar
   * description.en
   * description.ar
   * etc.
   */
  const handleLocalizedChange = (fieldName, value) => {
    setFormData((previous) => ({
      ...previous,
      [fieldName]: {
        ...previous[fieldName],
        [language]: value,
      },
    }));
  };

  /*
   * Handles localized tags.
   *
   * UI stores tags as a comma-separated string.
   * Before sending to backend they become arrays.
   */
  const handleTagsChange = (value) => {
    setFormData((previous) => ({
      ...previous,
      tags: {
        ...previous.tags,
        [language]: value,
      },
    }));
  };

  const handleTechnologyModelChange = (modelId) => {
    setSelectedTechnologyModels((previous) => {
      const alreadySelected = previous.find(
        (item) => item.technologyModel === modelId,
      );

      if (alreadySelected) {
        return previous.filter((item) => item.technologyModel !== modelId);
      }

      return [
        ...previous,
        {
          technologyModel: modelId,
          extraPrice: "",
        },
      ];
    });
  };

  const handleTechnologyPriceChange = (modelId, value) => {
    const cleanValue = sanitizeMoneyInput(value);

    setSelectedTechnologyModels((previous) =>
      previous.map((item) =>
        item.technologyModel === modelId
          ? {
              ...item,
              extraPrice: cleanValue,
            }
          : item,
      ),
    );
  };

  const isTechnologySelected = (modelId) =>
    selectedTechnologyModels.some((item) => item.technologyModel === modelId);

  const getTechnologyPrice = (modelId) => {
    const item = selectedTechnologyModels.find(
      (technologyItem) => technologyItem.technologyModel === modelId,
    );

    return item?.extraPrice ?? "";
  };

  const getSmartUnitPriceInfo = (modelId) => {
    const relatedSmartUnits = smartUnits.filter((smartUnit) => {
      const technologyModelId =
        smartUnit?.technologyModel?._id || smartUnit?.technologyModel;

      return String(technologyModelId || "") === String(modelId);
    });

    const costs = relatedSmartUnits
      .map((smartUnit) => Number(smartUnit.costPrice))
      .filter((price) => Number.isFinite(price));

    const availableStock = relatedSmartUnits.reduce(
      (total, smartUnit) =>
        total + Number(smartUnit.availableStock ?? smartUnit.stock ?? 0),
      0,
    );

    if (costs.length === 0) {
      return {
        count: relatedSmartUnits.length,
        min: null,
        max: null,
        availableStock,
      };
    }

    return {
      count: relatedSmartUnits.length,
      min: Math.min(...costs),
      max: Math.max(...costs),
      availableStock,
    };
  };

  const formatMoney = (value) => {
    return Number(value || 0).toLocaleString("en-EG", {
      maximumFractionDigits: 2,
    });
  };

  const handleImageChange = (event) => {
    const files = Array.from(event.target.files || []);

    previewImages.forEach((url) => {
      URL.revokeObjectURL(url);
    });

    setImages(files);
    setPreviewImages(files.map((file) => URL.createObjectURL(file)));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    /*
     * Required localized fields.
     *
     * Both English and Arabic are required because the backend
     * expects the product name and description to contain both.
     */
    if (!formData.name.en.trim()) {
      setError(t("addProduct.productNameEnglishRequired"));
      setLanguage("en");
      return;
    }

    if (!formData.name.ar.trim()) {
      setError(t("addProduct.productNameArabicRequired"));
      setLanguage("ar");
      return;
    }

    if (!formData.description.en.trim()) {
      setError(t("addProduct.productDescriptionEnglishRequired"));
      setLanguage("en");
      return;
    }

    if (!formData.description.ar.trim()) {
      setError(t("addProduct.productDescriptionArabicRequired"));
      setLanguage("ar");
      return;
    }

    if (!formData.category) {
      setError(t("addProduct.categoryRequired"));
      return;
    }

    if (
      !Number.isFinite(Number(formData.price)) ||
      Number(formData.price) < 0
    ) {
      setError(t("addProduct.sellingPriceValidNumber"));
      return;
    }

    if (
      !Number.isFinite(Number(formData.costPrice)) ||
      Number(formData.costPrice) < 0
    ) {
      setError(t("addProduct.productCostValidNumber"));
      return;
    }

    if (formData.technologyRequired && selectedTechnologyModels.length === 0) {
      setError(t("addProduct.technologyRequiredSelection"));
      return;
    }

    setIsLoading(true);

    try {
      /*
       * Convert tags from:
       *
       * "gold, ring, gift"
       *
       * into:
       *
       * {
       *   en: ["gold", "ring", "gift"],
       *   ar: [...]
       * }
       */
      const localizedTags = {
        en: formData.tags.en
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),

        ar: formData.tags.ar
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      };

      const productResponse = await createProduct({
        /*
         * LOCALIZED FIELDS
         */
        name: {
          en: formData.name.en.trim(),
          ar: formData.name.ar.trim(),
        },

        shortDescription: {
          en: formData.shortDescription.en.trim(),
          ar: formData.shortDescription.ar.trim(),
        },

        description: {
          en: formData.description.en.trim(),
          ar: formData.description.ar.trim(),
        },

        material: {
          en: formData.material.en.trim(),
          ar: formData.material.ar.trim(),
        },

        color: {
          en: formData.color.en.trim(),
          ar: formData.color.ar.trim(),
        },

        tags: localizedTags,

        seoTitle: {
          en: formData.seoTitle.en.trim(),
          ar: formData.seoTitle.ar.trim(),
        },

        seoDescription: {
          en: formData.seoDescription.en.trim(),
          ar: formData.seoDescription.ar.trim(),
        },

        seoSlug: {
          en: formData.seoSlug.en.trim(),
          ar: formData.seoSlug.ar.trim(),
        },

        careInstructions: {
          en: formData.careInstructions.en.trim(),
          ar: formData.careInstructions.ar.trim(),
        },

        /*
         * NON-LOCALIZED FIELDS
         */
        category: formData.category,

        price: Number(formData.price),
        costPrice: Number(formData.costPrice),
        comparePrice: Number(formData.comparePrice) || 0,
        stock: Number(formData.stock),

        weight: Number(formData.weight) || 0,

        featured: formData.featured,
        bestSeller: formData.bestSeller,
        newArrival: formData.newArrival,

        preparationDays: Number(formData.preparationDays) || 0,

        isCustomizable: formData.isCustomizable,

        technologyRequired: formData.technologyRequired,

        status: formData.status,

        technologyModels: selectedTechnologyModels.map(
          (item) => item.technologyModel,
        ),
      });

      const product =
        productResponse?.data?.product ||
        productResponse?.product ||
        productResponse?.data?.data?.product;

      if (!product?._id) {
        throw new Error(t("addProduct.productCreatedWithoutId"));
      }

      /*
       * CREATE PRODUCT TECHNOLOGY RELATIONS
       */
      for (let index = 0; index < selectedTechnologyModels.length; index += 1) {
        const item = selectedTechnologyModels[index];

        await createProductTechnology({
          product: product._id,
          technologyModel: item.technologyModel,
          extraPrice: Number(item.extraPrice || 0),

          isDefault: formData.technologyRequired && index === 0,

          isSelectable: true,
          displayOrder: index,
          status: "active",
        });
      }

      /*
       * UPLOAD PRODUCT IMAGES
       */
      let primaryImage = "";

      for (let i = 0; i < images.length; i += 1) {
        const imageForm = new FormData();

        imageForm.append("image", images[i]);

        const upload = await uploadImage(imageForm);

        const uploadedImage =
          upload?.image ||
          upload?.data?.image ||
          upload?.data?.data?.image ||
          "";

        if (!uploadedImage) {
          throw new Error(
            t("addProduct.imageUploadedWithoutPath", {
              number: i + 1,
            }),
          );
        }

        if (i === 0) {
          primaryImage = uploadedImage;
        }

        await createProductImage({
          product: product._id,
          imageUrl: uploadedImage,
          isPrimary: i === 0,
          sortOrder: i,

          /*
           * ProductImage.alt is now localized in the backend.
           *
           * We leave it empty for now because the current Add Product
           * page does not have dedicated Alt Text fields.
           */
          alt: {
            en: "",
            ar: "",
          },
        });
      }

      if (primaryImage) {
        await updateProduct(product._id, {
          primaryImage,
          image: primaryImage,
        });
      }

      navigate("/admin/products");
    } catch (submitError) {
      console.error(submitError);

      setError(
        submitError?.response?.data?.message ||
          submitError?.message ||
          t("addProduct.failedToCreateProduct"),
      );
    } finally {
      setIsLoading(false);
    }
  };

  /*
   * Reusable language switcher.
   */
  const LanguageSwitcher = () => (
    <div className="mb-4 inline-flex overflow-hidden rounded-full border border-light-champagne bg-warm-ivory p-1">
      <button
        type="button"
        onClick={() => setLanguage("en")}
        className={`rounded-full px-5 py-2 text-[8px] font-semibold uppercase tracking-[0.12em] transition ${
          language === "en"
            ? "bg-midnight-navy text-champagne-gold"
            : "text-steel-gray"
        }`}
      >
        {t("addProduct.english")}
      </button>

      <button
        type="button"
        onClick={() => setLanguage("ar")}
        className={`rounded-full px-5 py-2 text-[8px] font-semibold uppercase tracking-[0.12em] transition ${
          language === "ar"
            ? "bg-midnight-navy text-champagne-gold"
            : "text-steel-gray"
        }`}
      >
        {t("addProduct.arabic")}
      </button>
    </div>
  );

  const getCategoryName = (category) => {
    if (!category?.name) return "";

    if (typeof category.name === "string") {
      return category.name;
    }

    return category.name.en || category.name.ar || "";
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-warm-ivory text-midnight-navy">
      <header className="sticky top-0 z-40 border-b border-light-champagne/80 bg-soft-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-5 px-6 py-5 sm:flex-row sm:items-center sm:justify-between lg:px-10">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-champagne-gold/25 bg-midnight-navy text-champagne-gold">
              ✦
            </div>

            <div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-antique-gold">
                  {t("addProduct.collection")}
                </span>

                <span className="h-px w-7 bg-antique-gold" />
              </div>

              <h1 className="mt-1 font-serif text-[2rem] font-normal tracking-[-0.03em] text-midnight-navy">
                {t("addProduct.addProduct")}
              </h1>
            </div>
          </div>

          <Link
            to="/admin/products"
            className="inline-flex min-h-[46px] items-center gap-3 rounded-full border border-champagne-gold/30 bg-soft-white px-5 text-[8px] font-semibold uppercase tracking-[0.11em] text-slate-gray"
          >
            ← {t("addProduct.backToProducts")}
          </Link>
        </div>
      </header>

      <main className="relative mx-auto max-w-[1500px] px-6 py-10 lg:px-10 lg:py-12">
        {error && (
          <div className="mb-8 flex items-center justify-between rounded-[18px] border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
              className="font-semibold text-red-500"
            >
              ×
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_380px]">
            <div className="space-y-8">
              {/* 01 PRODUCT DETAILS */}
              <section className="overflow-hidden rounded-[28px] border border-light-champagne/90 bg-soft-white/90 shadow-[0_18px_48px_rgba(7,19,31,0.05)]">
                <div className="border-b border-light-champagne/80 bg-warm-ivory/50 px-7 py-6 sm:px-9">
                  <div className="flex items-center gap-3">
                    <span className="text-antique-gold">01</span>

                    <span className="h-px w-8 bg-antique-gold" />

                    <span className="text-[8px] font-semibold uppercase tracking-[0.24em] text-steel-gray">
                      {t("addProduct.productDetails")}
                    </span>
                  </div>

                  <h2 className="mt-3 font-serif text-[1.65rem] text-midnight-navy">
                    {t("addProduct.tellUsAboutYourPiece")}
                  </h2>
                </div>

                <div className="space-y-6 p-7 sm:p-9">
                  <LanguageSwitcher />

                  {/* PRODUCT NAME */}
                  <div>
                    <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.14em]">
                      {t("addProduct.productName")} —{" "}
                      {language === "en"
                        ? t("addProduct.english")
                        : t("addProduct.arabic")}
                    </label>

                    <input
                      type="text"
                      dir={language === "ar" ? "rtl" : "ltr"}
                      value={formData.name[language]}
                      onChange={(event) =>
                        handleLocalizedChange("name", event.target.value)
                      }
                      required
                      placeholder={
                        language === "en"
                          ? t("addProduct.aureliaGoldRing")
                          : t("addProduct.aureliaGoldRingArabic")
                      }
                      className="w-full rounded-[14px] border border-light-champagne bg-warm-ivory/60 px-5 py-3.5 text-[12px] outline-none focus:border-classic-gold"
                    />
                  </div>

                  {/* SHORT DESCRIPTION */}
                  <div>
                    <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.14em]">
                      {t("addProduct.shortDescription")} —{" "}
                      {language === "en"
                        ? t("addProduct.english")
                        : t("addProduct.arabic")}
                    </label>

                    <input
                      type="text"
                      dir={language === "ar" ? "rtl" : "ltr"}
                      value={formData.shortDescription[language]}
                      onChange={(event) =>
                        handleLocalizedChange(
                          "shortDescription",
                          event.target.value,
                        )
                      }
                      placeholder={
                        language === "en"
                          ? t("addProduct.shortProductDescription")
                          : t("addProduct.shortProductDescriptionArabic")
                      }
                      className="w-full rounded-[14px] border border-light-champagne bg-warm-ivory/60 px-5 py-3.5 text-[12px] outline-none focus:border-classic-gold"
                    />
                  </div>

                  {/* DESCRIPTION */}
                  <div>
                    <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.14em]">
                      {t("addProduct.description")} —{" "}
                      {language === "en"
                        ? t("addProduct.english")
                        : t("addProduct.arabic")}
                    </label>

                    <textarea
                      rows={6}
                      dir={language === "ar" ? "rtl" : "ltr"}
                      value={formData.description[language]}
                      onChange={(event) =>
                        handleLocalizedChange("description", event.target.value)
                      }
                      required
                      placeholder={
                        language === "en"
                          ? t("addProduct.describeTheProduct")
                          : t("addProduct.writeProductDescription")
                      }
                      className="w-full resize-none rounded-[14px] border border-light-champagne bg-warm-ivory/60 px-5 py-3.5 text-[12px] outline-none focus:border-classic-gold"
                    />
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    {/* CATEGORY */}
                    <div>
                      <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.14em]">
                        {t("addProduct.category")}
                      </label>

                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        required
                        className="w-full rounded-[14px] border border-light-champagne bg-warm-ivory/60 px-5 py-3.5 text-[12px]"
                      >
                        <option value="">
                          {t("addProduct.selectCategory")}
                        </option>

                        {categories.map((category) => (
                          <option key={category._id} value={category._id}>
                            {getCategoryName(category)}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* SKU */}
                    <div>
                      <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.14em]">
                        {t("addProduct.sku")}
                      </label>

                      <div className="flex min-h-[49px] items-center rounded-[14px] border border-dashed border-champagne-gold/40 bg-soft-cream px-5">
                        <div>
                          <p className="text-[10px] font-semibold text-midnight-navy">
                            {t("addProduct.generatedAutomatically")}
                          </p>

                          <p className="mt-1 text-[8px] text-steel-gray">
                            {t("addProduct.uniqueSkuCreated")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

           {/* 02 PRICING */}
<section className="overflow-hidden rounded-[28px] border border-light-champagne/90 bg-soft-white/90 shadow-[0_18px_48px_rgba(7,19,31,0.05)]">
  <div className="border-b border-light-champagne/80 bg-warm-ivory/50 px-7 py-6 sm:px-9">
    <div className="flex items-center gap-3">
      <span className="text-antique-gold">02</span>

      <span className="h-px w-8 bg-antique-gold" />

      <span className="text-[8px] font-semibold uppercase tracking-[0.24em] text-steel-gray">
        {t("addProduct.pricingInventory")}
      </span>
    </div>

    <h2 className="mt-3 font-serif text-[1.65rem] text-midnight-navy">
      {t("addProduct.pricingAvailability")}
    </h2>

    <p className="mt-2 max-w-3xl text-[10px] leading-6 text-slate-gray">
      {t("addProduct.sellingPriceDescription")}
    </p>
  </div>

  <div className="space-y-7 p-7 sm:p-9">
    {/* PRICING */}
    <div>
      <p className="mb-4 text-[8px] font-semibold uppercase tracking-[0.18em] text-antique-gold">
        Pricing
      </p>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {/* SELLING PRICE */}
        <div>
          <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.14em] text-midnight-navy">
            {t("addProduct.sellingPrice")}
          </label>

          <div className="flex overflow-hidden rounded-[14px] border border-light-champagne bg-warm-ivory/60 focus-within:border-classic-gold">
            <input
              type="number"
              min="0"
              step="0.01"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              inputMode="decimal"
              dir="ltr"
              className="min-w-0 flex-1 bg-transparent px-5 py-3.5 text-[12px] outline-none"
            />

            <span className="flex shrink-0 items-center border-l border-light-champagne bg-soft-cream px-4 text-[9px] font-semibold text-antique-gold">
              EGP
            </span>
          </div>
        </div>

        {/* PRODUCT COST */}
        <div>
          <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.14em] text-midnight-navy">
            {t("addProduct.productCost")}
          </label>

          <div className="flex overflow-hidden rounded-[14px] border border-light-champagne bg-warm-ivory/60 focus-within:border-classic-gold">
            <input
              type="number"
              min="0"
              step="0.01"
              name="costPrice"
              value={formData.costPrice}
              onChange={handleChange}
              required
              inputMode="decimal"
              dir="ltr"
              className="min-w-0 flex-1 bg-transparent px-5 py-3.5 text-[12px] outline-none"
            />

            <span className="flex shrink-0 items-center border-l border-light-champagne bg-soft-cream px-4 text-[9px] font-semibold text-antique-gold">
              EGP
            </span>
          </div>
        </div>

        {/* COMPARE PRICE */}
        <div>
          <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.14em] text-midnight-navy">
            {t("addProduct.comparePrice")}
          </label>

          <div className="flex overflow-hidden rounded-[14px] border border-light-champagne bg-warm-ivory/60 focus-within:border-classic-gold">
            <input
              type="number"
              min="0"
              step="0.01"
              name="comparePrice"
              value={formData.comparePrice}
              onChange={handleChange}
              inputMode="decimal"
              dir="ltr"
              className="min-w-0 flex-1 bg-transparent px-5 py-3.5 text-[12px] outline-none"
            />

            <span className="flex shrink-0 items-center border-l border-light-champagne bg-soft-cream px-4 text-[9px] font-semibold text-antique-gold">
              EGP
            </span>
          </div>

          <p className="mt-2 text-[8px] text-steel-gray">
            Optional reference price
          </p>
        </div>
      </div>
    </div>

    {/* INVENTORY */}
    <div className="border-t border-light-champagne pt-7">
      <p className="mb-4 text-[8px] font-semibold uppercase tracking-[0.18em] text-antique-gold">
        Inventory
      </p>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* STOCK */}
        <div>
          <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.14em] text-midnight-navy">
            {t("addProduct.stock")}
          </label>

          <div className="flex overflow-hidden rounded-[14px] border border-light-champagne bg-warm-ivory/60 focus-within:border-classic-gold">
            <input
              type="number"
              min="0"
              step="1"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              required
              inputMode="numeric"
              dir="ltr"
              className="min-w-0 flex-1 bg-transparent px-5 py-3.5 text-[12px] outline-none"
            />

            <span className="flex shrink-0 items-center border-l border-light-champagne bg-soft-cream px-4 text-[9px] font-semibold text-antique-gold">
              Units
            </span>
          </div>

          <p className="mt-2 text-[8px] text-steel-gray">
            Available quantity for this product
          </p>
        </div>

        {/* WEIGHT */}
        <div>
          <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.14em] text-midnight-navy">
            {t("addProduct.weight")}
          </label>

          <div className="flex overflow-hidden rounded-[14px] border border-light-champagne bg-warm-ivory/60 focus-within:border-classic-gold">
            <input
              type="number"
              min="0"
              step="0.01"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              inputMode="decimal"
              dir="ltr"
              className="min-w-0 flex-1 bg-transparent px-5 py-3.5 text-[12px] outline-none"
            />

            <span className="flex shrink-0 items-center border-l border-light-champagne bg-soft-cream px-4 text-[9px] font-semibold text-antique-gold">
              g
            </span>
          </div>

          <p className="mt-2 text-[8px] text-steel-gray">
            Product weight in grams
          </p>
        </div>
      </div>
    </div>
  </div>
</section>

              {/* 03 DETAILS */}
              <section className="overflow-hidden rounded-[28px] border border-light-champagne/90 bg-soft-white/90">
                <div className="border-b border-light-champagne/80 bg-warm-ivory/50 px-7 py-6 sm:px-9">
                  <span className="text-[8px] font-semibold uppercase tracking-[0.24em] text-steel-gray">
                    {t("addProduct.productRulesDetailsNumbered")}
                  </span>
                </div>

                <div className="space-y-6 p-7 sm:p-9">
                  <LanguageSwitcher />

                  {/* MATERIAL + COLOR */}
             {/* MATERIAL + COLOR */}
<div className="grid gap-5 md:grid-cols-2">
  {/* MATERIAL */}
  <div>
    <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.14em]">
      {t("addProduct.material")} —{" "}
      {language === "en"
        ? t("addProduct.english")
        : t("addProduct.arabic")}
    </label>

    <select
      value={formData.material[language]}
      onChange={(event) =>
        handleLocalizedChange("material", event.target.value)
      }
      className="w-full rounded-[14px] border border-light-champagne bg-warm-ivory/60 px-5 py-3.5"
    >
      <option value="">
        {language === "en"
          ? "Select material"
          : "اختاري الخامة"}
      </option>

      {language === "en" ? (
        <>
          <option value="Gold">Gold</option>
          <option value="Silver">Silver</option>
          <option value="Stainless Steel">Stainless Steel</option>
        </>
      ) : (
        <>
          <option value="ذهب">ذهب</option>
          <option value="فضة">فضة</option>
          <option value="ستانلس ستيل">ستانلس ستيل</option>
        </>
      )}
    </select>
  </div>

  {/* COLOR */}
  <div>
    <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.14em]">
      {t("addProduct.color")} —{" "}
      {language === "en"
        ? t("addProduct.english")
        : t("addProduct.arabic")}
    </label>

    <select
      value={formData.color[language]}
      onChange={(event) =>
        handleLocalizedChange("color", event.target.value)
      }
      className="w-full rounded-[14px] border border-light-champagne bg-warm-ivory/60 px-5 py-3.5"
    >
      <option value="">
        {language === "en"
          ? "Select color"
          : "اختاري اللون"}
      </option>

      {language === "en" ? (
        <>
          <option value="Gold">Gold</option>
          <option value="Silver">Silver</option>
          <option value="Stainless Steel">Stainless Steel</option>
        </>
      ) : (
        <>
          <option value="ذهبي">ذهبي</option>
          <option value="فضي">فضي</option>
          <option value="ستانلس ستيل">ستانلس ستيل</option>
        </>
      )}
    </select>
  </div>
</div>

                  <input
                    type="number"
                    min="0"
                    name="preparationDays"
                    value={formData.preparationDays}
                    onChange={handleChange}
                    placeholder={t("addProduct.preparationDays")}
                    className="w-full rounded-[14px] border border-light-champagne bg-warm-ivory/60 px-5 py-3.5"
                  />

                  {/* TAGS */}
                  <div>
                    <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.14em]">
                      {t("addProduct.tags")} —{" "}
                      {language === "en"
                        ? t("addProduct.english")
                        : t("addProduct.arabic")}
                    </label>

                    <input
                      type="text"
                      dir={language === "ar" ? "rtl" : "ltr"}
                      value={formData.tags[language]}
                      onChange={(event) => handleTagsChange(event.target.value)}
                      placeholder={
                        language === "en"
                          ? t("addProduct.goldRingGift")
                          : t("addProduct.goldRingGiftArabic")
                      }
                      className="w-full rounded-[14px] border border-light-champagne bg-warm-ivory/60 px-5 py-3.5"
                    />

                    <p className="mt-2 text-[8px] text-steel-gray">
                      {t("addProduct.separateTagsWithCommas")}
                    </p>
                  </div>

                  {/* CARE INSTRUCTIONS */}
                  <div>
                    <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.14em]">
                      {t("addProduct.careInstructions")} —{" "}
                      {language === "en"
                        ? t("addProduct.english")
                        : t("addProduct.arabic")}
                    </label>

                    <textarea
                      rows={4}
                      dir={language === "ar" ? "rtl" : "ltr"}
                      value={formData.careInstructions[language]}
                      onChange={(event) =>
                        handleLocalizedChange(
                          "careInstructions",
                          event.target.value,
                        )
                      }
                      placeholder={
                        language === "en"
                          ? t("addProduct.careInstructionsPlaceholder")
                          : t("addProduct.careInstructionsArabic")
                      }
                      className="w-full resize-none rounded-[14px] border border-light-champagne bg-warm-ivory/60 px-5 py-3.5"
                    />
                  </div>

                  {/* CUSTOMIZABLE */}
                  <label className="flex items-center justify-between rounded-[18px] border border-light-champagne bg-warm-ivory/55 p-5">
                    <div>
                      <p className="text-[10px] font-semibold text-midnight-navy">
                        {t("addProduct.customizableProduct")}
                      </p>

                      <p className="mt-1 text-[8px] text-steel-gray">
                        {t("addProduct.allowCustomersToPersonalize")}
                      </p>
                    </div>

                    <input
                      type="checkbox"
                      name="isCustomizable"
                      checked={formData.isCustomizable}
                      onChange={handleChange}
                      className="h-5 w-5 accent-classic-gold"
                    />
                  </label>

                  {/* TECHNOLOGY REQUIRED */}
                  <label
                    className={`flex cursor-pointer items-center justify-between rounded-[20px] border p-5 transition-all duration-300 ${
                      formData.technologyRequired
                        ? "border-champagne-gold/60 bg-soft-cream shadow-[0_10px_28px_rgba(7,19,31,0.05)]"
                        : "border-light-champagne bg-warm-ivory/55"
                    }`}
                  >
                    <div className="pr-6">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-midnight-navy text-[8px] text-champagne-gold">
                          ✦
                        </span>

                        <div>
                          <p className="text-[10px] font-semibold text-midnight-navy">
                            {t("addProduct.technologyRequiredForOrder")}
                          </p>

                          <p className="mt-1 text-[7px] font-semibold uppercase tracking-[0.15em] text-antique-gold">
                            {t("addProduct.productBusinessRule")}
                          </p>
                        </div>
                      </div>

                      <p className="mt-3 max-w-2xl text-[9px] leading-5 text-slate-gray">
                        {t("addProduct.technologyRequiredDescription")}
                      </p>

                      {formData.technologyRequired && (
                        <p className="mt-2 text-[8px] font-semibold text-antique-gold">
                          {t("addProduct.atLeastOneTechnologyModel")}
                        </p>
                      )}
                    </div>

                    <input
                      type="checkbox"
                      name="technologyRequired"
                      checked={formData.technologyRequired}
                      onChange={handleChange}
                      className="h-6 w-6 shrink-0 accent-classic-gold"
                    />
                  </label>
                </div>
              </section>

              {/* 04 TECHNOLOGY */}
              <section className="overflow-hidden rounded-[28px] border border-light-champagne/90 bg-soft-white/90">
                <div className="border-b border-light-champagne/80 bg-warm-ivory/50 px-7 py-6 sm:px-9">
                  <span className="text-[8px] font-semibold uppercase tracking-[0.24em] text-steel-gray">
                    {t("addProduct.technologyModelsNumbered")}
                  </span>

                  <p className="mt-3 max-w-2xl text-[10px] leading-6 text-slate-gray">
                    {t("addProduct.selectTechnologyModelsDescription")}
                  </p>
                </div>

                <div className="space-y-4 p-7 sm:p-9">
                  {formData.technologyRequired &&
                    selectedTechnologyModels.length === 0 && (
                      <div className="rounded-[16px] border border-champagne-gold/40 bg-soft-cream px-4 py-3 text-[9px] text-antique-gold">
                        {t("addProduct.productRequiresTechnology")}
                      </div>
                    )}

                  {technologyModels.length === 0 ? (
                    <div className="rounded-[18px] border border-dashed border-light-champagne p-8 text-center text-[10px] text-steel-gray">
                      {t("addProduct.noTechnologyModelsAvailable")}
                    </div>
                  ) : (
                    technologyModels.map((model) => {
                      const selected = isTechnologySelected(model._id);
                      const smartUnitInfo = getSmartUnitPriceInfo(model._id);
                      const extraPrice = getTechnologyPrice(model._id);

                      return (
                        <div
                          key={model._id}
                          className={`rounded-[18px] border p-5 ${
                            selected
                              ? "border-classic-gold bg-soft-cream"
                              : "border-light-champagne bg-soft-white"
                          }`}
                        >
                          <div className="flex gap-4">
                            <input
                              type="checkbox"
                              checked={selected}
                              onChange={() =>
                                handleTechnologyModelChange(model._id)
                              }
                              className="mt-1 h-5 w-5 accent-classic-gold"
                            />

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                  <h3 className="font-semibold text-midnight-navy">
                                    {model.modelName}
                                  </h3>

                                  {model.modelCode && (
                                    <p className="mt-1 font-mono text-[8px] uppercase tracking-[0.1em] text-antique-gold">
                                      {model.modelCode}
                                    </p>
                                  )}

                                  {model.technology?.name && (
                                    <p className="mt-2 text-[8px] text-steel-gray">
                                      {t("addProduct.technology")}:{" "}
                                      {model.technology.name}
                                    </p>
                                  )}
                                </div>

                                <span
                                  className={`inline-flex w-fit rounded-full px-3 py-1 text-[7px] font-semibold uppercase ${
                                    model.status === "active"
                                      ? "bg-soft-cream text-antique-gold"
                                      : "bg-silver-mist text-steel-gray"
                                  }`}
                                >
                                  {model.status || "active"}
                                </span>
                              </div>

                              <div className="mt-4 flex flex-wrap gap-2">
                                {model.requiresBattery && (
                                  <span className="rounded-full border border-champagne-gold/40 bg-soft-cream px-3 py-1 text-[8px] font-semibold text-antique-gold">
                                    {t("addProduct.battery")}
                                  </span>
                                )}

                                {model.requiresActivation && (
                                  <span className="rounded-full border border-champagne-gold/40 bg-soft-cream px-3 py-1 text-[8px] font-semibold text-antique-gold">
                                    {t("addProduct.activation")}
                                  </span>
                                )}

                                {model.requiresSubscription && (
                                  <span className="rounded-full border border-champagne-gold/40 bg-soft-cream px-3 py-1 text-[8px] font-semibold text-antique-gold">
                                    {t("addProduct.subscription")}
                                  </span>
                                )}
                              </div>

                              <div className="mt-4 rounded-[14px] border border-dashed border-champagne-gold/35 bg-warm-ivory/70 p-4">
                                <p className="text-[7px] font-semibold uppercase tracking-[0.17em] text-antique-gold">
                                  {t("addProduct.smartUnitCostReference")}
                                </p>

                                {smartUnitInfo.min !== null ? (
                                  <>
                                    <p className="mt-2 font-serif text-[1.1rem] text-midnight-navy">
                                      {smartUnitInfo.min === smartUnitInfo.max
                                        ? `${formatMoney(
                                            smartUnitInfo.min,
                                          )} EGP`
                                        : `${formatMoney(
                                            smartUnitInfo.min,
                                          )} – ${formatMoney(
                                            smartUnitInfo.max,
                                          )} EGP`}
                                    </p>

                                    <p className="mt-1 text-[8px] leading-5 text-steel-gray">
                                      {smartUnitInfo.count}{" "}
                                      {t("addProduct.smartUnitTypes")} ·{" "}
                                      {smartUnitInfo.availableStock}{" "}
                                      {t("addProduct.availablePhysicalUnits")}
                                    </p>
                                  </>
                                ) : (
                                  <p className="mt-2 text-[9px] text-steel-gray">
                                    {t("addProduct.noSmartUnitCost")}
                                  </p>
                                )}
                              </div>

                              {selected && (
                                <div className="mt-5 rounded-[16px] border border-champagne-gold/30 bg-soft-white p-4">
                                  <label className="mb-2.5 block text-[8px] font-semibold uppercase tracking-[0.14em] text-midnight-navy">
                                    {t("addProduct.extraPrice")}
                                  </label>

                                  <div className="relative">
                                    <input
                                      type="text"
                                      inputMode="decimal"
                                      value={extraPrice}
                                      onChange={(event) =>
                                        handleTechnologyPriceChange(
                                          model._id,
                                          event.target.value,
                                        )
                                      }
                                      placeholder={t(
                                        "addProduct.extraPricePlaceholder",
                                      )}
                                      className="w-full rounded-xl border border-light-champagne bg-soft-white px-4 py-3 pr-14 text-sm outline-none focus:border-classic-gold focus:ring-4 focus:ring-classic-gold/10"
                                    />

                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-antique-gold">
                                      EGP
                                    </span>
                                  </div>

                                  <div className="mt-4 rounded-xl bg-soft-cream/75 p-4">
                                    <div className="flex justify-between text-[8px] text-steel-gray">
                                      <span>
                                        {t("addProduct.productPrice")}
                                      </span>

                                      <span>
                                        {formatMoney(formData.price)} EGP
                                      </span>
                                    </div>

                                    <div className="mt-2 flex justify-between text-[8px] text-steel-gray">
                                      <span>{t("addProduct.extraPrice")}</span>

                                      <span>{formatMoney(extraPrice)} EGP</span>
                                    </div>

                                    <div className="mt-3 flex justify-between border-t border-light-champagne pt-3 text-[10px] font-semibold text-midnight-navy">
                                      <span>{t("addProduct.finalPrice")}</span>

                                      <span className="text-antique-gold">
                                        {formatMoney(
                                          Number(formData.price || 0) +
                                            Number(extraPrice || 0),
                                        )}{" "}
                                        EGP
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </section>

              {/* 05 IMAGES */}
              <section className="overflow-hidden rounded-[28px] border border-light-champagne/90 bg-soft-white/90">
                <div className="border-b border-light-champagne/80 bg-warm-ivory/50 px-7 py-6 sm:px-9">
                  <span className="text-[8px] font-semibold uppercase tracking-[0.24em] text-steel-gray">
                    {t("addProduct.productImagesNumbered")}
                  </span>
                </div>

                <div className="p-7 sm:p-9">
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-[18px] border border-dashed border-classic-gold/50 bg-warm-ivory/55 px-6 py-12 transition hover:bg-soft-cream">
                    <div className="text-2xl text-antique-gold">+</div>

                    <p className="mt-4 text-sm font-semibold">
                      {t("addProduct.uploadProductImages")}
                    </p>

                    <p className="mt-2 text-[8px] text-steel-gray">
                      {t("addProduct.firstImagePrimary")}
                    </p>

                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>

                  {previewImages.length > 0 && (
                    <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                      {previewImages.map((image, index) => (
                        <div
                          key={`${image}-${index}`}
                          className="overflow-hidden rounded-[18px] border border-light-champagne"
                        >
                          <div className="relative aspect-square">
                            <img
                              src={image}
                              alt={`${t("addProduct.productPreview")} ${
                                index + 1
                              }`}
                              className="h-full w-full object-cover"
                            />

                            {index === 0 && (
                              <span className="absolute left-3 top-3 rounded-full bg-midnight-navy px-3 py-1 text-[7px] font-semibold uppercase text-champagne-gold">
                                {t("addProduct.primary")}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              {/* 06 SEO */}
              <section className="overflow-hidden rounded-[28px] border border-light-champagne/90 bg-soft-white/90">
                <div className="border-b border-light-champagne/80 bg-warm-ivory/50 px-7 py-6 sm:px-9">
                  <span className="text-[8px] font-semibold uppercase tracking-[0.24em] text-steel-gray">
                    {t("addProduct.seoNumbered")}
                  </span>
                </div>

                <div className="space-y-5 p-7 sm:p-9">
                  <LanguageSwitcher />

                  <input
                    type="text"
                    dir={language === "ar" ? "rtl" : "ltr"}
                    value={formData.seoTitle[language]}
                    onChange={(event) =>
                      handleLocalizedChange("seoTitle", event.target.value)
                    }
                    placeholder={
                      language === "en"
                        ? t("addProduct.seoTitle")
                        : t("addProduct.seoTitleArabic")
                    }
                    className="w-full rounded-[14px] border border-light-champagne bg-warm-ivory/60 px-5 py-3.5"
                  />

                  <input
                    type="text"
                    dir={language === "ar" ? "rtl" : "ltr"}
                    value={formData.seoSlug[language]}
                    onChange={(event) =>
                      handleLocalizedChange("seoSlug", event.target.value)
                    }
                    placeholder={
                      language === "en"
                        ? t("addProduct.seoSlug")
                        : t("addProduct.seoSlugArabic")
                    }
                    className="w-full rounded-[14px] border border-light-champagne bg-warm-ivory/60 px-5 py-3.5"
                  />

                  <textarea
                    rows={4}
                    dir={language === "ar" ? "rtl" : "ltr"}
                    value={formData.seoDescription[language]}
                    onChange={(event) =>
                      handleLocalizedChange(
                        "seoDescription",
                        event.target.value,
                      )
                    }
                    placeholder={
                      language === "en"
                        ? t("addProduct.seoDescription")
                        : t("addProduct.seoDescriptionArabic")
                    }
                    className="w-full resize-none rounded-[14px] border border-light-champagne bg-warm-ivory/60 px-5 py-3.5"
                  />
                </div>
              </section>
            </div>

            {/* SIDEBAR */}
            <aside className="space-y-6 xl:sticky xl:top-28 xl:self-start">
              <div className="overflow-hidden rounded-[28px] bg-midnight-navy p-7 text-soft-white">
                <p className="text-[9px] uppercase tracking-[0.3em] text-champagne-gold">
                  {t("addProduct.productStatus")}
                </p>

                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="mt-5 w-full rounded-xl border border-champagne-gold/20 bg-rich-navy px-4 py-3"
                >
                  <option value="active">{t("addProduct.active")}</option>
                  <option value="inactive">{t("addProduct.inactive")}</option>
                </select>
              </div>

              <div className="rounded-[24px] border border-light-champagne bg-soft-white p-6">
                <h3 className="font-semibold">{t("addProduct.marketing")}</h3>

                <div className="mt-5 space-y-3">
                  {[
                    ["featured", t("addProduct.featured")],
                    ["bestSeller", t("addProduct.bestSeller")],
                    ["newArrival", t("addProduct.newArrival")],
                  ].map(([name, label]) => (
                    <label
                      key={name}
                      className="flex items-center justify-between rounded-xl border border-light-champagne bg-warm-ivory/55 p-4"
                    >
                      <span>{label}</span>

                      <input
                        type="checkbox"
                        name={name}
                        checked={formData[name]}
                        onChange={handleChange}
                        className="h-5 w-5 accent-classic-gold"
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div className="rounded-[24px] border border-light-champagne bg-soft-white p-6">
                <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-steel-gray">
                  {t("addProduct.productRules")}
                </p>

                <div className="mt-5 space-y-4">
                  <div className="flex justify-between border-b border-light-champagne pb-4">
                    <span className="text-[10px] text-slate-gray">
                      {t("addProduct.technologyRequired")}
                    </span>

                    <span
                      className={`rounded-full px-3 py-1 text-[7px] font-semibold uppercase ${
                        formData.technologyRequired
                          ? "bg-midnight-navy text-champagne-gold"
                          : "bg-soft-cream text-steel-gray"
                      }`}
                    >
                      {formData.technologyRequired
                        ? t("addProduct.yes")
                        : t("addProduct.no")}
                    </span>
                  </div>

                  <div className="flex justify-between border-b border-light-champagne pb-4">
                    <span className="text-[10px] text-slate-gray">
                      {t("addProduct.selectedTechnologyModels")}
                    </span>

                    <span className="font-semibold text-midnight-navy">
                      {selectedTechnologyModels.length}
                    </span>
                  </div>

                  <div className="flex justify-between border-b border-light-champagne pb-4">
                    <span className="text-[10px] text-slate-gray">
                      {t("addProduct.sellingPrice")}
                    </span>

                    <span className="font-semibold text-antique-gold">
                      {formData.price
                        ? `${formatMoney(formData.price)} EGP`
                        : "—"}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-[10px] text-slate-gray">
                      {t("addProduct.productCost")}
                    </span>

                    <span className="font-semibold text-midnight-navy">
                      {formData.costPrice !== ""
                        ? `${formatMoney(formData.costPrice)} EGP`
                        : "—"}
                    </span>
                  </div>
                </div>
              </div>
            </aside>
          </div>

          <div className="mt-8 flex justify-end gap-4 border-t border-light-champagne pt-8">
            <Link
              to="/admin/products"
              className="inline-flex items-center justify-center rounded-[13px] border border-light-champagne bg-soft-white px-7 py-3.5 text-[8px] font-semibold uppercase"
            >
              {t("addProduct.cancel")}
            </Link>

            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex min-w-[180px] items-center justify-center rounded-[13px] bg-midnight-navy px-8 py-3.5 text-[8px] font-semibold uppercase text-soft-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading
                ? t("addProduct.creatingProduct")
                : t("addProduct.createProduct")}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default AddProductPage;
