import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

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

const AddProductPage = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);

  const [technologyModels, setTechnologyModels] = useState([]);

  const [smartUnits, setSmartUnits] = useState([]);

  const [selectedTechnologyModels, setSelectedTechnologyModels] = useState([]);

  const [images, setImages] = useState([]);

  const [previewImages, setPreviewImages] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    shortDescription: "",
    description: "",
    category: "",
    price: "",
    costPrice: "",
    comparePrice: "",
    stock: "",
    material: "",
    color: "",
    weight: "",
    featured: false,
    bestSeller: false,
    newArrival: false,
    tags: "",
    seoTitle: "",
    seoDescription: "",
    seoSlug: "",
    preparationDays: "",
    careInstructions: "",
    isCustomizable: false,
    status: "active",
  });

  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState("");

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

        if (categoryResponse.data?.categories) {
          categoryData = categoryResponse.data.categories;
        } else if (categoryResponse.categories) {
          categoryData = categoryResponse.categories;
        } else if (Array.isArray(categoryResponse)) {
          categoryData = categoryResponse;
        }

        setCategories(categoryData);

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
      } catch (error) {
        console.error(error);

        setError("Failed to load categories or technology models.");
      }
    };

    loadData();
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((previous) => ({
      ...previous,

      [name]: type === "checkbox" ? checked : value,
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
      (item) => item.technologyModel === modelId,
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

    setImages(files);

    setPreviewImages(files.map((file) => URL.createObjectURL(file)));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    setIsLoading(true);

    try {
      const productResponse = await createProduct({
        name: formData.name,

        shortDescription: formData.shortDescription,

        description: formData.description,

        category: formData.category,

        price: Number(formData.price),

        costPrice: Number(formData.costPrice),

        comparePrice: Number(formData.comparePrice) || 0,

        stock: Number(formData.stock),

        material: formData.material,

        color: formData.color,

        weight: Number(formData.weight) || 0,

        featured: formData.featured,

        bestSeller: formData.bestSeller,

        newArrival: formData.newArrival,

        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),

        seoTitle: formData.seoTitle,

        seoDescription: formData.seoDescription,

        seoSlug: formData.seoSlug,

        preparationDays: Number(formData.preparationDays) || 0,

        careInstructions: formData.careInstructions,

        isCustomizable: formData.isCustomizable,

        status: formData.status,

        technologyModels: selectedTechnologyModels.map(
          (item) => item.technologyModel,
        ),
      });

      const product = productResponse.data.product;

      for (let index = 0; index < selectedTechnologyModels.length; index += 1) {
        const item = selectedTechnologyModels[index];

        await createProductTechnology({
          product: product._id,

          technologyModel: item.technologyModel,

          extraPrice: Number(item.extraPrice || 0),

          isDefault: false,

          isSelectable: true,

          displayOrder: index,

          status: "active",
        });
      }

      let primaryImage = "";

      for (let i = 0; i < images.length; i += 1) {
        const form = new FormData();

        form.append("image", images[i]);

        const upload = await uploadImage(form);

        if (i === 0) {
          primaryImage = upload.image;
        }

        await createProductImage({
          product: product._id,

          imageUrl: upload.image,

          isPrimary: i === 0,

          sortOrder: i,
        });
      }

      if (primaryImage) {
        await updateProduct(product._id, {
          primaryImage,
        });
      }

      navigate("/admin/products");
    } catch (error) {
      console.error(error);

      setError(error?.response?.data?.message || "Failed to create product.");
    } finally {
      setIsLoading(false);
    }
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
                  Collection
                </span>

                <span className="h-px w-7 bg-antique-gold" />
              </div>

              <h1 className="mt-1 font-serif text-[2rem] font-normal tracking-[-0.03em] text-midnight-navy">
                Add Product
              </h1>
            </div>
          </div>

          <Link
            to="/admin/products"
            className="inline-flex min-h-[46px] items-center gap-3 rounded-full border border-champagne-gold/30 bg-soft-white px-5 text-[8px] font-semibold uppercase tracking-[0.11em] text-slate-gray"
          >
            ← Back to Products
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
              <section className="overflow-hidden rounded-[28px] border border-light-champagne/90 bg-soft-white/90 shadow-[0_18px_48px_rgba(7,19,31,0.05)]">
                <div className="border-b border-light-champagne/80 bg-warm-ivory/50 px-7 py-6 sm:px-9">
                  <div className="flex items-center gap-3">
                    <span className="text-antique-gold">01</span>

                    <span className="h-px w-8 bg-antique-gold" />

                    <span className="text-[8px] font-semibold uppercase tracking-[0.24em] text-steel-gray">
                      Product Details
                    </span>
                  </div>

                  <h2 className="mt-3 font-serif text-[1.65rem] text-midnight-navy">
                    Tell us about your piece
                  </h2>
                </div>

                <div className="space-y-6 p-7 sm:p-9">
                  <div>
                    <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.14em]">
                      Product Name
                    </label>

                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="e.g. Aurelia Gold Ring"
                      className="w-full rounded-[14px] border border-light-champagne bg-warm-ivory/60 px-5 py-3.5 text-[12px] outline-none focus:border-classic-gold"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.14em]">
                      Short Description
                    </label>

                    <input
                      type="text"
                      name="shortDescription"
                      value={formData.shortDescription}
                      onChange={handleChange}
                      className="w-full rounded-[14px] border border-light-champagne bg-warm-ivory/60 px-5 py-3.5 text-[12px] outline-none focus:border-classic-gold"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.14em]">
                      Description
                    </label>

                    <textarea
                      rows={6}
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      required
                      className="w-full resize-none rounded-[14px] border border-light-champagne bg-warm-ivory/60 px-5 py-3.5 text-[12px] outline-none focus:border-classic-gold"
                    />
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.14em]">
                        Category
                      </label>

                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        required
                        className="w-full rounded-[14px] border border-light-champagne bg-warm-ivory/60 px-5 py-3.5 text-[12px]"
                      >
                        <option value="">Select Category</option>

                        {categories.map((category) => (
                          <option key={category._id} value={category._id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.14em]">
                        SKU
                      </label>

                      <div className="flex min-h-[49px] items-center rounded-[14px] border border-dashed border-champagne-gold/40 bg-soft-cream px-5">
                        <div>
                          <p className="text-[10px] font-semibold text-midnight-navy">
                            Generated Automatically
                          </p>

                          <p className="mt-1 text-[8px] text-steel-gray">
                            A unique SKU will be created when the product is
                            saved.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="overflow-hidden rounded-[28px] border border-light-champagne/90 bg-soft-white/90 shadow-[0_18px_48px_rgba(7,19,31,0.05)]">
                <div className="border-b border-light-champagne/80 bg-warm-ivory/50 px-7 py-6 sm:px-9">
                  <div className="flex items-center gap-3">
                    <span className="text-antique-gold">02</span>

                    <span className="h-px w-8 bg-antique-gold" />

                    <span className="text-[8px] font-semibold uppercase tracking-[0.24em] text-steel-gray">
                      Pricing & Inventory
                    </span>
                  </div>

                  <h2 className="mt-3 font-serif text-[1.65rem] text-midnight-navy">
                    Pricing & availability
                  </h2>

                  <p className="mt-2 text-[10px] leading-6 text-slate-gray">
                    Selling Price is what the customer pays. Product Cost is the
                    original cost of the jewelry piece before Smart Unit,
                    installation and packaging.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-6 p-7 sm:grid-cols-2 sm:p-9 xl:grid-cols-5">
                  <div>
                    <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.14em] text-midnight-navy">
                      Selling Price
                    </label>

                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        required
                        className="w-full rounded-[14px] border border-light-champagne bg-warm-ivory/60 px-5 py-3.5 pr-14 text-[12px] outline-none focus:border-classic-gold"
                      />

                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-antique-gold">
                        EGP
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.14em] text-midnight-navy">
                      Product Cost
                    </label>

                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        name="costPrice"
                        value={formData.costPrice}
                        onChange={handleChange}
                        required
                        placeholder="Original cost"
                        className="w-full rounded-[14px] border border-champagne-gold/35 bg-soft-cream px-5 py-3.5 pr-14 text-[12px] outline-none focus:border-classic-gold focus:ring-4 focus:ring-classic-gold/10"
                      />

                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-antique-gold">
                        EGP
                      </span>
                    </div>

                    <p className="mt-2 text-[8px] leading-4 text-steel-gray">
                      Jewelry piece cost only
                    </p>
                  </div>

                  <div>
                    <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.14em] text-midnight-navy">
                      Compare Price
                    </label>

                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        name="comparePrice"
                        value={formData.comparePrice}
                        onChange={handleChange}
                        className="w-full rounded-[14px] border border-light-champagne bg-warm-ivory/60 px-5 py-3.5 pr-14 text-[12px]"
                      />

                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-antique-gold">
                        EGP
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.14em]">
                      Stock
                    </label>

                    <input
                      type="number"
                      min="0"
                      name="stock"
                      value={formData.stock}
                      onChange={handleChange}
                      required
                      className="w-full rounded-[14px] border border-light-champagne bg-warm-ivory/60 px-5 py-3.5 text-[12px]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.14em]">
                      Weight
                    </label>

                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        name="weight"
                        value={formData.weight}
                        onChange={handleChange}
                        className="w-full rounded-[14px] border border-light-champagne bg-warm-ivory/60 px-5 py-3.5 pr-10 text-[12px]"
                      />

                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-steel-gray">
                        g
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              <section className="overflow-hidden rounded-[28px] border border-light-champagne/90 bg-soft-white/90">
                <div className="border-b border-light-champagne/80 bg-warm-ivory/50 px-7 py-6 sm:px-9">
                  <span className="text-[8px] font-semibold uppercase tracking-[0.24em] text-steel-gray">
                    03 · Product Details
                  </span>
                </div>

                <div className="space-y-6 p-7 sm:p-9">
                  <div className="grid gap-5 md:grid-cols-3">
                    <input
                      type="text"
                      name="material"
                      value={formData.material}
                      onChange={handleChange}
                      placeholder="Material"
                      className="rounded-[14px] border border-light-champagne bg-warm-ivory/60 px-5 py-3.5"
                    />

                    <input
                      type="text"
                      name="color"
                      value={formData.color}
                      onChange={handleChange}
                      placeholder="Color"
                      className="rounded-[14px] border border-light-champagne bg-warm-ivory/60 px-5 py-3.5"
                    />

                    <input
                      type="number"
                      min="0"
                      name="preparationDays"
                      value={formData.preparationDays}
                      onChange={handleChange}
                      placeholder="Preparation Days"
                      className="rounded-[14px] border border-light-champagne bg-warm-ivory/60 px-5 py-3.5"
                    />
                  </div>

                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder="gold, ring, gift"
                    className="w-full rounded-[14px] border border-light-champagne bg-warm-ivory/60 px-5 py-3.5"
                  />

                  <textarea
                    rows={4}
                    name="careInstructions"
                    value={formData.careInstructions}
                    onChange={handleChange}
                    placeholder="Care instructions"
                    className="w-full rounded-[14px] border border-light-champagne bg-warm-ivory/60 px-5 py-3.5"
                  />

                  <label className="flex items-center justify-between rounded-[18px] border border-light-champagne bg-warm-ivory/55 p-5">
                    <span>Customizable Product</span>

                    <input
                      type="checkbox"
                      name="isCustomizable"
                      checked={formData.isCustomizable}
                      onChange={handleChange}
                      className="h-5 w-5 accent-classic-gold"
                    />
                  </label>
                </div>
              </section>

              <section className="overflow-hidden rounded-[28px] border border-light-champagne/90 bg-soft-white/90">
                <div className="border-b border-light-champagne/80 bg-warm-ivory/50 px-7 py-6 sm:px-9">
                  <span className="text-[8px] font-semibold uppercase tracking-[0.24em] text-steel-gray">
                    04 · Technology Models
                  </span>

                  <p className="mt-3 max-w-2xl text-[10px] leading-6 text-slate-gray">
                    Smart Unit costs are shown as a reference when setting the
                    customer-facing Extra Price.
                  </p>
                </div>

                <div className="space-y-4 p-7 sm:p-9">
                  {technologyModels.length === 0 ? (
                    <div className="rounded-[18px] border border-dashed border-light-champagne p-8 text-center text-[10px] text-steel-gray">
                      No technology models available.
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
                                      Technology: {model.technology.name}
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
                                    Battery
                                  </span>
                                )}

                                {model.requiresActivation && (
                                  <span className="rounded-full border border-champagne-gold/40 bg-soft-cream px-3 py-1 text-[8px] font-semibold text-antique-gold">
                                    Activation
                                  </span>
                                )}

                                {model.requiresSubscription && (
                                  <span className="rounded-full border border-champagne-gold/40 bg-soft-cream px-3 py-1 text-[8px] font-semibold text-antique-gold">
                                    Subscription
                                  </span>
                                )}
                              </div>

                              <div className="mt-4 rounded-[14px] border border-dashed border-champagne-gold/35 bg-warm-ivory/70 p-4">
                                <p className="text-[7px] font-semibold uppercase tracking-[0.17em] text-antique-gold">
                                  Smart Unit Cost Reference
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
                                      {smartUnitInfo.count} Smart Unit type(s) ·{" "}
                                      {smartUnitInfo.availableStock} available
                                      physical unit(s)
                                    </p>
                                  </>
                                ) : (
                                  <p className="mt-2 text-[9px] text-steel-gray">
                                    No Smart Unit cost has been registered for
                                    this technology model yet.
                                  </p>
                                )}
                              </div>

                              {selected && (
                                <div className="mt-5 rounded-[16px] border border-champagne-gold/30 bg-soft-white p-4">
                                  <label className="mb-2.5 block text-[8px] font-semibold uppercase tracking-[0.14em] text-midnight-navy">
                                    Extra Price
                                  </label>

                                  <p className="mb-3 text-[8px] leading-5 text-steel-gray">
                                    Type or paste the complete price directly.
                                  </p>

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
                                      placeholder="e.g. 1500"
                                      className="w-full rounded-xl border border-light-champagne bg-soft-white px-4 py-3 pr-14 text-sm outline-none focus:border-classic-gold focus:ring-4 focus:ring-classic-gold/10"
                                    />

                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-antique-gold">
                                      EGP
                                    </span>
                                  </div>

                                  <div className="mt-4 rounded-xl bg-soft-cream/75 p-4">
                                    <div className="flex justify-between text-[8px] text-steel-gray">
                                      <span>Product Price</span>

                                      <span>
                                        {formatMoney(formData.price)} EGP
                                      </span>
                                    </div>

                                    <div className="mt-2 flex justify-between text-[8px] text-steel-gray">
                                      <span>Extra Price</span>

                                      <span>{formatMoney(extraPrice)} EGP</span>
                                    </div>

                                    <div className="mt-3 flex justify-between border-t border-light-champagne pt-3 text-[10px] font-semibold text-midnight-navy">
                                      <span>Final Price</span>

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

              <section className="overflow-hidden rounded-[28px] border border-light-champagne/90 bg-soft-white/90">
                <div className="border-b border-light-champagne/80 bg-warm-ivory/50 px-7 py-6 sm:px-9">
                  <span className="text-[8px] font-semibold uppercase tracking-[0.24em] text-steel-gray">
                    05 · Product Images
                  </span>
                </div>

                <div className="p-7 sm:p-9">
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-[18px] border border-dashed border-classic-gold/50 bg-warm-ivory/55 px-6 py-12">
                    <div className="text-2xl text-antique-gold">+</div>

                    <p className="mt-4 text-sm font-semibold">
                      Upload Product Images
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
                          key={index}
                          className="overflow-hidden rounded-[18px] border border-light-champagne"
                        >
                          <img
                            src={image}
                            alt=""
                            className="aspect-square h-full w-full object-cover"
                          />

                          {index === 0 && (
                            <div className="px-3 py-2 text-[8px] text-antique-gold">
                              Primary
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              <section className="overflow-hidden rounded-[28px] border border-light-champagne/90 bg-soft-white/90">
                <div className="border-b border-light-champagne/80 bg-warm-ivory/50 px-7 py-6 sm:px-9">
                  <span className="text-[8px] font-semibold uppercase tracking-[0.24em] text-steel-gray">
                    06 · SEO
                  </span>
                </div>

                <div className="space-y-5 p-7 sm:p-9">
                  <input
                    type="text"
                    name="seoTitle"
                    value={formData.seoTitle}
                    onChange={handleChange}
                    placeholder="SEO Title"
                    className="w-full rounded-[14px] border border-light-champagne bg-warm-ivory/60 px-5 py-3.5"
                  />

                  <input
                    type="text"
                    name="seoSlug"
                    value={formData.seoSlug}
                    onChange={handleChange}
                    placeholder="SEO Slug"
                    className="w-full rounded-[14px] border border-light-champagne bg-warm-ivory/60 px-5 py-3.5"
                  />

                  <textarea
                    rows={4}
                    name="seoDescription"
                    value={formData.seoDescription}
                    onChange={handleChange}
                    placeholder="SEO Description"
                    className="w-full rounded-[14px] border border-light-champagne bg-warm-ivory/60 px-5 py-3.5"
                  />
                </div>
              </section>
            </div>

            <aside className="space-y-6 xl:sticky xl:top-28 xl:self-start">
              <div className="overflow-hidden rounded-[28px] bg-midnight-navy p-7 text-soft-white">
                <p className="text-[9px] uppercase tracking-[0.3em] text-champagne-gold">
                  Product Status
                </p>

                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="mt-5 w-full rounded-xl border border-champagne-gold/20 bg-rich-navy px-4 py-3"
                >
                  <option value="active">Active</option>

                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="rounded-[24px] border border-light-champagne bg-soft-white p-6">
                <h3 className="font-semibold">Marketing</h3>

                <div className="mt-5 space-y-3">
                  {[
                    ["featured", "Featured"],

                    ["bestSeller", "Best Seller"],

                    ["newArrival", "New Arrival"],
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
                  Pricing Summary
                </p>

                <div className="mt-5 space-y-4">
                  <div className="flex justify-between border-b border-light-champagne pb-4">
                    <span className="text-[10px] text-slate-gray">
                      Selling Price
                    </span>

                    <span className="font-semibold text-antique-gold">
                      {formData.price ? `${formData.price} EGP` : "—"}
                    </span>
                  </div>

                  <div className="flex justify-between border-b border-light-champagne pb-4">
                    <span className="text-[10px] text-slate-gray">
                      Product Cost
                    </span>

                    <span className="font-semibold text-midnight-navy">
                      {formData.costPrice ? `${formData.costPrice} EGP` : "—"}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-[10px] text-slate-gray">
                      Base Difference
                    </span>

                    <span className="font-semibold text-antique-gold">
                      {formData.price && formData.costPrice !== ""
                        ? `${formatMoney(
                            Number(formData.price) - Number(formData.costPrice),
                          )} EGP`
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
              Cancel
            </Link>

            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center justify-center rounded-[13px] bg-midnight-navy px-8 py-3.5 text-[8px] font-semibold uppercase text-soft-white disabled:opacity-50"
            >
              {isLoading ? "Creating Product..." : "Create Product"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default AddProductPage;