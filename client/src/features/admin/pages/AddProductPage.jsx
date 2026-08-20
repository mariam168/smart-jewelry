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

const AddProductPage = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [technologyModels, setTechnologyModels] = useState([]);
  const [selectedTechnologyModels, setSelectedTechnologyModels] = useState([]);

  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    shortDescription: "",
    description: "",
    category: "",
    price: "",
    comparePrice: "",
    stock: "",
    sku: "",
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
        const categoryResponse = await getCategories();

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

        const technologyResponse = await getTechnologyModels();

        setTechnologyModels(technologyResponse.data?.technologyModels || []);
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
          extraPrice: 0,
        },
      ];
    });
  };

  const handleTechnologyPriceChange = (modelId, price) => {
    setSelectedTechnologyModels((previous) =>
      previous.map((item) =>
        item.technologyModel === modelId
          ? {
              ...item,
              extraPrice: Number(price) || 0,
            }
          : item,
      ),
    );
  };

  const isTechnologySelected = (modelId) => {
    return selectedTechnologyModels.some(
      (item) => item.technologyModel === modelId,
    );
  };

  const getTechnologyPrice = (modelId) => {
    const item = selectedTechnologyModels.find(
      (item) => item.technologyModel === modelId,
    );

    return item?.extraPrice ?? 0;
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
        comparePrice: Number(formData.comparePrice) || 0,
        stock: Number(formData.stock),
        sku: formData.sku,
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

      for (const item of selectedTechnologyModels) {
        await createProductTechnology({
          product: product._id,
          technologyModel: item.technologyModel,
          extraPrice: Number(item.extraPrice) || 0,
          isDefault: false,
          isSelectable: true,
          displayOrder: selectedTechnologyModels.indexOf(item),
          status: "active",
        });
      }

      let primaryImage = "";

      for (let i = 0; i < images.length; i++) {
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
          <div>
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-champagne-gold/25 bg-midnight-navy text-champagne-gold shadow-[0_8px_20px_rgba(18,38,58,0.12)]">
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
          </div>

          <Link
            to="/admin/products"
            className="group inline-flex min-h-[46px] items-center gap-3 rounded-full border border-champagne-gold/30 bg-soft-white px-5 text-[8px] font-semibold uppercase tracking-[0.11em] text-slate-gray shadow-[0_7px_18px_rgba(7,19,31,0.035)] transition-all duration-300 hover:-translate-y-0.5 hover:border-champagne-gold hover:bg-warm-ivory hover:text-midnight-navy"
          >
            <span className="text-antique-gold transition-transform duration-300 group-hover:-translate-x-1">
              ←
            </span>
            Back to Products
          </Link>
        </div>
      </header>

      <main className="relative mx-auto max-w-[1500px] px-6 py-10 lg:px-10 lg:py-12">
        <div className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-champagne-gold/[0.06] blur-3xl" />

        <div className="pointer-events-none absolute -right-32 top-[30rem] h-80 w-80 rounded-full bg-light-champagne/70 blur-3xl" />

        {error && (
          <div className="relative mb-8 flex items-center justify-between rounded-[18px] border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
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

        <form onSubmit={handleSubmit} className="relative">
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

                  <h2 className="mt-3 font-serif text-[1.65rem] font-normal tracking-[-0.02em] text-midnight-navy">
                    Tell us about your piece
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-steel-gray">
                    Add the essential information that customers will see when
                    discovering this product.
                  </p>
                </div>

                <div className="space-y-6 p-7 sm:p-9">
                  <div>
                    <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.14em] text-midnight-navy">
                      Product Name
                    </label>

                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="e.g. Aurelia Gold Ring"
                      className="w-full rounded-[14px] border border-light-champagne bg-warm-ivory/60 px-5 py-3.5 text-[12px] text-midnight-navy outline-none transition placeholder:text-steel-gray/60 focus:border-classic-gold focus:bg-soft-white focus:ring-4 focus:ring-classic-gold/10"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.14em] text-midnight-navy">
                      Short Description
                    </label>

                    <input
                      type="text"
                      name="shortDescription"
                      value={formData.shortDescription}
                      onChange={handleChange}
                      placeholder="A short elegant description"
                      className="w-full rounded-[14px] border border-light-champagne bg-warm-ivory/60 px-5 py-3.5 text-[12px] outline-none transition placeholder:text-steel-gray/60 focus:border-classic-gold focus:bg-soft-white focus:ring-4 focus:ring-classic-gold/10"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.14em] text-midnight-navy">
                      Description
                    </label>

                    <textarea
                      rows={6}
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      required
                      placeholder="Describe the piece, its details, inspiration and materials..."
                      className="w-full resize-none rounded-[14px] border border-light-champagne bg-warm-ivory/60 px-5 py-3.5 text-[12px] leading-6 outline-none transition placeholder:text-steel-gray/60 focus:border-classic-gold focus:bg-soft-white focus:ring-4 focus:ring-classic-gold/10"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.14em] text-midnight-navy">
                        Category
                      </label>

                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        required
                        className="w-full rounded-[14px] border border-light-champagne bg-warm-ivory/60 px-5 py-3.5 text-[12px] outline-none focus:border-classic-gold focus:ring-4 focus:ring-classic-gold/10"
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
                      <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.14em] text-midnight-navy">
                        SKU
                      </label>

                      <input
                        type="text"
                        name="sku"
                        value={formData.sku}
                        onChange={handleChange}
                        placeholder="SKU-001"
                        className="w-full rounded-[14px] border border-light-champagne bg-warm-ivory/60 px-5 py-3.5 text-[12px] uppercase outline-none transition placeholder:text-steel-gray/60 focus:border-classic-gold focus:bg-soft-white focus:ring-4 focus:ring-classic-gold/10"
                      />
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

                  <h2 className="mt-3 font-serif text-[1.65rem] font-normal tracking-[-0.02em] text-midnight-navy">
                    Pricing & availability
                  </h2>
                </div>

                <div className="grid grid-cols-1 gap-6 p-7 sm:grid-cols-2 sm:p-9 lg:grid-cols-4">
                  <div>
                    <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.14em] text-midnight-navy">
                      Price
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
                        className="w-full rounded-[14px] border border-light-champagne bg-warm-ivory/60 px-5 py-3.5 pr-14 text-[12px] outline-none focus:border-classic-gold focus:ring-4 focus:ring-classic-gold/10"
                      />

                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-antique-gold">
                        EGP
                      </span>
                    </div>
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
                        className="w-full rounded-[14px] border border-light-champagne bg-warm-ivory/60 px-5 py-3.5 pr-14 text-[12px] outline-none focus:border-classic-gold focus:ring-4 focus:ring-classic-gold/10"
                      />

                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-antique-gold">
                        EGP
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.14em] text-midnight-navy">
                      Stock
                    </label>

                    <input
                      type="number"
                      min="0"
                      name="stock"
                      value={formData.stock}
                      onChange={handleChange}
                      required
                      className="w-full rounded-[14px] border border-light-champagne bg-warm-ivory/60 px-5 py-3.5 text-[12px] outline-none focus:border-classic-gold focus:ring-4 focus:ring-classic-gold/10"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.14em] text-midnight-navy">
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
                        className="w-full rounded-[14px] border border-light-champagne bg-warm-ivory/60 px-5 py-3.5 pr-10 text-[12px] outline-none focus:border-classic-gold focus:ring-4 focus:ring-classic-gold/10"
                      />

                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-steel-gray">
                        g
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              <section className="overflow-hidden rounded-[28px] border border-light-champagne/90 bg-soft-white/90 shadow-[0_18px_48px_rgba(7,19,31,0.05)]">
                <div className="border-b border-light-champagne/80 bg-warm-ivory/50 px-7 py-6 sm:px-9">
                  <div className="flex items-center gap-3">
                    <span className="text-antique-gold">03</span>

                    <span className="h-px w-8 bg-antique-gold" />

                    <span className="text-[8px] font-semibold uppercase tracking-[0.24em] text-steel-gray">
                      Details
                    </span>
                  </div>

                  <h2 className="mt-3 font-serif text-[1.65rem] font-normal tracking-[-0.02em] text-midnight-navy">
                    Product characteristics
                  </h2>
                </div>

                <div className="space-y-6 p-7 sm:p-9">
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                    <div>
                      <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.14em] text-midnight-navy">
                        Material
                      </label>

                      <input
                        type="text"
                        name="material"
                        value={formData.material}
                        onChange={handleChange}
                        placeholder="18K Gold"
                        className="w-full rounded-[14px] border border-light-champagne bg-warm-ivory/60 px-5 py-3.5 text-[12px] outline-none focus:border-classic-gold focus:ring-4 focus:ring-classic-gold/10"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.14em] text-midnight-navy">
                        Color
                      </label>

                      <input
                        type="text"
                        name="color"
                        value={formData.color}
                        onChange={handleChange}
                        placeholder="Gold"
                        className="w-full rounded-[14px] border border-light-champagne bg-warm-ivory/60 px-5 py-3.5 text-[12px] outline-none focus:border-classic-gold focus:ring-4 focus:ring-classic-gold/10"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.14em] text-midnight-navy">
                        Preparation Days
                      </label>

                      <input
                        type="number"
                        min="0"
                        name="preparationDays"
                        value={formData.preparationDays}
                        onChange={handleChange}
                        className="w-full rounded-[14px] border border-light-champagne bg-warm-ivory/60 px-5 py-3.5 text-[12px] outline-none focus:border-classic-gold focus:ring-4 focus:ring-classic-gold/10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.14em] text-midnight-navy">
                      Tags
                    </label>

                    <input
                      type="text"
                      name="tags"
                      value={formData.tags}
                      onChange={handleChange}
                      placeholder="gold, ring, luxury, gift"
                      className="w-full rounded-[14px] border border-light-champagne bg-warm-ivory/60 px-5 py-3.5 text-[12px] outline-none focus:border-classic-gold focus:ring-4 focus:ring-classic-gold/10"
                    />

                    <p className="mt-2 text-xs text-steel-gray">
                      Separate tags with commas.
                    </p>
                  </div>

                  <div>
                    <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.14em] text-midnight-navy">
                      Care Instructions
                    </label>

                    <textarea
                      rows={4}
                      name="careInstructions"
                      value={formData.careInstructions}
                      onChange={handleChange}
                      placeholder="How should the customer care for this piece?"
                      className="w-full resize-none rounded-[14px] border border-light-champagne bg-warm-ivory/60 px-5 py-3.5 text-[12px] leading-6 outline-none focus:border-classic-gold focus:bg-soft-white focus:ring-4 focus:ring-classic-gold/10"
                    />
                  </div>

                  <label className="flex cursor-pointer items-center justify-between rounded-[18px] border border-light-champagne bg-warm-ivory/55 p-5 transition hover:border-classic-gold/60">
                    <div>
                      <p className="text-sm font-semibold">
                        Customizable Product
                      </p>

                      <p className="mt-1 text-xs text-steel-gray">
                        Allow customers to customize this piece.
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
                </div>
              </section>

              <section className="overflow-hidden rounded-[28px] border border-light-champagne/90 bg-soft-white/90 shadow-[0_18px_48px_rgba(7,19,31,0.05)]">
                <div className="border-b border-light-champagne/80 bg-warm-ivory/50 px-7 py-6 sm:px-9">
                  <div className="flex items-center gap-3">
                    <span className="text-antique-gold">04</span>

                    <span className="h-px w-8 bg-antique-gold" />

                    <span className="text-[8px] font-semibold uppercase tracking-[0.24em] text-steel-gray">
                      Technology
                    </span>
                  </div>

                  <h2 className="mt-3 font-serif text-[1.65rem] font-normal tracking-[-0.02em] text-midnight-navy">
                    Technology Models
                  </h2>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-steel-gray">
                    Select the technologies available for this product and
                    define any additional price.
                  </p>
                </div>

                <div className="space-y-4 p-7 sm:p-9">
                  {technologyModels.length === 0 ? (
                    <div className="rounded-[18px] border border-dashed border-light-champagne bg-warm-ivory/55 p-8 text-center">
                      <div className="text-2xl text-classic-gold">✦</div>

                      <p className="mt-3 text-sm font-semibold">
                        No technology models available
                      </p>

                      <p className="mt-1 text-xs text-steel-gray">
                        Add technology models before assigning them to products.
                      </p>
                    </div>
                  ) : (
                    technologyModels.map((model) => {
                      const selected = isTechnologySelected(model._id);

                      return (
                        <div
                          key={model._id}
                          className={`rounded-[18px] border p-5 transition-all duration-300 ${
                            selected
                              ? "border-classic-gold bg-soft-cream shadow-sm"
                              : "border-light-champagne bg-soft-white hover:border-classic-gold/50"
                          }`}
                        >
                          <div className="flex items-start gap-4">
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
                                    <p className="mt-1 text-xs uppercase tracking-wider text-antique-gold">
                                      {model.modelCode}
                                    </p>
                                  )}

                                  {model.technology?.name && (
                                    <p className="mt-2 text-xs text-steel-gray">
                                      Technology: {model.technology.name}
                                    </p>
                                  )}
                                </div>

                                {model.status && (
                                  <span
                                    className={`inline-flex w-fit rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider ${
                                      model.status === "active"
                                        ? "bg-soft-cream text-antique-gold"
                                        : "bg-gray-100 text-gray-500"
                                    }`}
                                  >
                                    {model.status}
                                  </span>
                                )}
                              </div>

                              <div className="mt-4 flex flex-wrap gap-2">
                                {model.requiresBattery && (
                                  <span className="rounded-full border border-champagne-gold/40 bg-soft-cream px-3 py-1 text-[10px] font-semibold text-antique-gold">
                                    Battery
                                  </span>
                                )}

                                {model.requiresActivation && (
                                  <span className="rounded-full border border-champagne-gold/40 bg-soft-cream px-3 py-1 text-[10px] font-semibold text-antique-gold">
                                    Activation
                                  </span>
                                )}

                                {model.requiresSubscription && (
                                  <span className="rounded-full border border-champagne-gold/40 bg-soft-cream px-3 py-1 text-[10px] font-semibold text-antique-gold">
                                    Subscription
                                  </span>
                                )}
                              </div>

                              {selected && (
                                <div className="mt-5 rounded-xl border border-champagne-gold/30 bg-soft-white p-4">
                                  <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.14em] text-midnight-navy">
                                    Extra Price
                                  </label>

                                  <div className="relative">
                                    <input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      value={getTechnologyPrice(model._id)}
                                      onChange={(event) =>
                                        handleTechnologyPriceChange(
                                          model._id,
                                          event.target.value,
                                        )
                                      }
                                      className="w-full rounded-xl border border-light-champagne bg-warm-ivory/55 px-4 py-3 pr-14 text-sm outline-none focus:border-classic-gold focus:ring-4 focus:ring-classic-gold/10"
                                    />

                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-antique-gold">
                                      EGP
                                    </span>
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

              <section className="overflow-hidden rounded-[28px] border border-light-champagne/90 bg-soft-white/90 shadow-[0_18px_48px_rgba(7,19,31,0.05)]">
                <div className="border-b border-light-champagne/80 bg-warm-ivory/50 px-7 py-6 sm:px-9">
                  <div className="flex items-center gap-3">
                    <span className="text-antique-gold">05</span>

                    <span className="h-px w-8 bg-antique-gold" />

                    <span className="text-[8px] font-semibold uppercase tracking-[0.24em] text-steel-gray">
                      Media
                    </span>
                  </div>

                  <h2 className="mt-3 font-serif text-[1.65rem] font-normal tracking-[-0.02em] text-midnight-navy">
                    Product Images
                  </h2>

                  <p className="mt-2 text-sm text-steel-gray">
                    The first image will automatically become the primary
                    product image.
                  </p>
                </div>

                <div className="p-7 sm:p-9">
                  <label className="group flex cursor-pointer flex-col items-center justify-center rounded-[18px] border border-dashed border-classic-gold/50 bg-warm-ivory/55 px-6 py-12 text-center transition hover:border-antique-gold hover:bg-soft-cream">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full border border-champagne-gold/40 bg-soft-white text-2xl text-antique-gold shadow-sm transition group-hover:scale-105">
                      +
                    </div>

                    <p className="mt-5 text-sm font-semibold">
                      Upload Product Images
                    </p>

                    <p className="mt-2 text-xs text-steel-gray">
                      PNG, JPG or WEBP
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
                    <div className="mt-7">
                      <div className="mb-4 flex items-center gap-3">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-steel-gray">
                          Preview
                        </span>

                        <span className="h-px flex-1 bg-light-champagne" />
                      </div>

                      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                        {previewImages.map((image, index) => (
                          <div
                            key={index}
                            className="group overflow-hidden rounded-[18px] border border-light-champagne bg-warm-ivory/55"
                          >
                            <div className="relative aspect-square overflow-hidden">
                              <img
                                src={image}
                                alt=""
                                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                              />

                              {index === 0 && (
                                <div className="absolute left-3 top-3 rounded-full bg-midnight-navy px-3 py-1.5 text-[9px] font-semibold uppercase tracking-wider text-champagne-gold">
                                  Primary
                                </div>
                              )}
                            </div>

                            <div className="px-3 py-2.5 text-xs text-steel-gray">
                              Image {index + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>

              <section className="overflow-hidden rounded-[28px] border border-light-champagne/90 bg-soft-white/90 shadow-[0_18px_48px_rgba(7,19,31,0.05)]">
                <div className="border-b border-light-champagne/80 bg-warm-ivory/50 px-7 py-6 sm:px-9">
                  <div className="flex items-center gap-3">
                    <span className="text-antique-gold">06</span>

                    <span className="h-px w-8 bg-antique-gold" />

                    <span className="text-[8px] font-semibold uppercase tracking-[0.24em] text-steel-gray">
                      SEO
                    </span>
                  </div>

                  <h2 className="mt-3 font-serif text-[1.65rem] font-normal tracking-[-0.02em] text-midnight-navy">
                    Search optimization
                  </h2>
                </div>

                <div className="space-y-5 p-7 sm:p-9">
                  <div>
                    <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.14em] text-midnight-navy">
                      SEO Title
                    </label>

                    <input
                      type="text"
                      name="seoTitle"
                      value={formData.seoTitle}
                      onChange={handleChange}
                      placeholder="Elegant gold jewelry..."
                      className="w-full rounded-[14px] border border-light-champagne bg-warm-ivory/60 px-5 py-3.5 text-[12px] outline-none focus:border-classic-gold focus:ring-4 focus:ring-classic-gold/10"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.14em] text-midnight-navy">
                      SEO Slug
                    </label>

                    <input
                      type="text"
                      name="seoSlug"
                      value={formData.seoSlug}
                      onChange={handleChange}
                      placeholder="elegant-gold-ring"
                      className="w-full rounded-[14px] border border-light-champagne bg-warm-ivory/60 px-5 py-3.5 text-[12px] outline-none focus:border-classic-gold focus:ring-4 focus:ring-classic-gold/10"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.14em] text-midnight-navy">
                      SEO Description
                    </label>

                    <textarea
                      rows={4}
                      name="seoDescription"
                      value={formData.seoDescription}
                      onChange={handleChange}
                      placeholder="Write a short search engine description..."
                      className="w-full resize-none rounded-[14px] border border-light-champagne bg-warm-ivory/60 px-5 py-3.5 text-[12px] leading-6 outline-none focus:border-classic-gold focus:ring-4 focus:ring-classic-gold/10"
                    />
                  </div>
                </div>
              </section>
            </div>

            <aside className="space-y-6 xl:sticky xl:top-28 xl:self-start">
              <div className="overflow-hidden rounded-[28px] bg-gradient-to-br from-midnight-navy via-rich-navy to-luxury-black text-soft-white shadow-2xl shadow-midnight-navy/15">
                <div className="relative overflow-hidden px-7 py-8">
                  <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full border border-champagne-gold/15" />

                  <div className="pointer-events-none absolute -bottom-20 -left-16 h-44 w-44 rounded-full border border-champagne-gold/10" />

                  <div className="relative">
                    <div className="mb-5 flex items-center gap-3">
                      <span className="h-px w-8 bg-antique-gold" />

                      <span className="text-[9px] font-semibold uppercase tracking-[0.3em] text-champagne-gold">
                        Product Status
                      </span>
                    </div>

                    <h2 className="font-serif text-[1.65rem] font-normal tracking-[-0.02em] text-midnight-navy">
                      Ready to create
                      <span className="mt-1 block font-serif italic text-champagne-gold">
                        something beautiful.
                      </span>
                    </h2>

                    <p className="mt-4 text-sm leading-6 text-premium-silver">
                      Complete the product information and publish your new
                      piece to the collection.
                    </p>
                  </div>
                </div>

                <div className="border-t border-white/10 p-6">
                  <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.2em] text-premium-silver">
                    Status
                  </label>

                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-champagne-gold/20 bg-rich-navy px-4 py-3 text-sm text-soft-white outline-none focus:border-champagne-gold"
                  >
                    <option value="active">Active</option>

                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="rounded-[24px] border border-light-champagne/90 bg-soft-white/90 p-6 shadow-[0_14px_36px_rgba(7,19,31,0.045)]">
                <div className="mb-5 flex items-center gap-3">
                  <span className="text-antique-gold">✦</span>

                  <div>
                    <h3 className="font-semibold">Marketing</h3>

                    <p className="mt-1 text-xs text-steel-gray">
                      Highlight this product in your store.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="flex cursor-pointer items-center justify-between rounded-xl border border-light-champagne bg-warm-ivory/55 p-4 transition hover:border-classic-gold/50">
                    <span className="text-sm font-medium">Featured</span>

                    <input
                      type="checkbox"
                      name="featured"
                      checked={formData.featured}
                      onChange={handleChange}
                      className="h-5 w-5 accent-classic-gold"
                    />
                  </label>

                  <label className="flex cursor-pointer items-center justify-between rounded-xl border border-light-champagne bg-warm-ivory/55 p-4 transition hover:border-classic-gold/50">
                    <span className="text-sm font-medium">Best Seller</span>

                    <input
                      type="checkbox"
                      name="bestSeller"
                      checked={formData.bestSeller}
                      onChange={handleChange}
                      className="h-5 w-5 accent-classic-gold"
                    />
                  </label>

                  <label className="flex cursor-pointer items-center justify-between rounded-xl border border-light-champagne bg-warm-ivory/55 p-4 transition hover:border-classic-gold/50">
                    <span className="text-sm font-medium">New Arrival</span>

                    <input
                      type="checkbox"
                      name="newArrival"
                      checked={formData.newArrival}
                      onChange={handleChange}
                      className="h-5 w-5 accent-classic-gold"
                    />
                  </label>
                </div>
              </div>

              <div className="rounded-[24px] border border-light-champagne/90 bg-soft-white/90 p-6 shadow-[0_14px_36px_rgba(7,19,31,0.045)]">
                <div className="mb-5 flex items-center gap-3">
                  <span className="h-px w-8 bg-antique-gold" />

                  <span className="text-[9px] font-semibold uppercase tracking-[0.3em] text-steel-gray">
                    Summary
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-light-champagne pb-4">
                    <span className="text-sm text-steel-gray">
                      Technology Models
                    </span>

                    <span className="font-semibold text-midnight-navy">
                      {selectedTechnologyModels.length}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-b border-light-champagne pb-4">
                    <span className="text-sm text-steel-gray">Images</span>

                    <span className="font-semibold text-midnight-navy">
                      {images.length}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-steel-gray">
                      Product Price
                    </span>

                    <span className="font-semibold text-antique-gold">
                      {formData.price ? `${formData.price} EGP` : "—"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-champagne-gold/25 bg-soft-cream p-6">
                <div className="flex gap-3">
                  <span className="text-antique-gold">✦</span>

                  <p className="text-xs leading-6 text-slate-gray">
                    The first uploaded image is automatically saved as the
                    primary image for this product.
                  </p>
                </div>
              </div>
            </aside>
          </div>

          <div className="mt-8 border-t border-light-champagne pt-8">
            <div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-end">
              <Link
                to="/admin/products"
                className="inline-flex items-center justify-center rounded-[13px] border border-light-champagne bg-soft-white px-7 py-3.5 text-[8px] font-semibold uppercase tracking-[0.11em] text-slate-gray transition hover:border-antique-gold hover:text-midnight-navy"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={isLoading}
                className="group inline-flex items-center justify-center gap-3 rounded-[13px] bg-midnight-navy px-8 py-3.5 text-[8px] font-semibold uppercase tracking-[0.11em] text-soft-white shadow-xl shadow-midnight-navy/15 transition-all duration-300 hover:-translate-y-0.5 hover:bg-rich-navy hover:shadow-2xl disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Creating Product...
                  </>
                ) : (
                  <>
                    Create Product
                    <span className="text-champagne-gold transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
};

export default AddProductPage;
