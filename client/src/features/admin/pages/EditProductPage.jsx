import { useEffect, useState } from "react";

import { Link, useNavigate, useParams } from "react-router-dom";

import {
  getProduct,
  updateProduct,
  uploadImage,
  createProductImage,
  getProductImages,
} from "../services/productApi";

import { getCategories } from "../services/categoryApi";

import { getTechnologyModels } from "../services/technologyModelApi";

import {
  getProductTechnologies,
  createProductTechnology,
  updateProductTechnology,
} from "../services/productTechnologyApi";

const EditProductPage = () => {
  const { id } = useParams();

  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);

  const [technologyModels, setTechnologyModels] = useState([]);

  const [selectedTechnologyModels, setSelectedTechnologyModels] = useState([]);

  const [technologyPrices, setTechnologyPrices] = useState({});

  const [existingImages, setExistingImages] = useState([]);

  const [primaryImage, setPrimaryImage] = useState("");

  const [newImages, setNewImages] = useState([]);

  const [previewNewImages, setPreviewNewImages] = useState([]);

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
  const [isLoading, setIsLoading] = useState(true);

  const [isSaving, setIsSaving] = useState(false);

  const [error, setError] = useState("");

  const [successMessage, setSuccessMessage] = useState("");
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        setError("");

        const [
          categoriesResponse,
          technologyModelsResponse,
          productResponse,
          productTechnologiesResponse,
          productImagesResponse,
        ] = await Promise.all([
          getCategories(),

          getTechnologyModels(),

          getProduct(id),

          getProductTechnologies(id).catch(() => []),

          getProductImages(id).catch(() => []),
        ]);

        const categoriesData =
          categoriesResponse?.data?.categories ||
          categoriesResponse?.categories ||
          (Array.isArray(categoriesResponse) ? categoriesResponse : []);

        setCategories(Array.isArray(categoriesData) ? categoriesData : []);

        const technologyModelsData =
          technologyModelsResponse?.data?.technologyModels ||
          technologyModelsResponse?.technologyModels ||
          (Array.isArray(technologyModelsResponse)
            ? technologyModelsResponse
            : []);

        setTechnologyModels(
          Array.isArray(technologyModelsData) ? technologyModelsData : [],
        );

        const product =
          productResponse?.data?.product || productResponse?.product;

        if (!product) {
          throw new Error("Product not found.");
        }

        const loadedImages =
          productImagesResponse?.data?.productImages ||
          productImagesResponse?.productImages ||
          (Array.isArray(productImagesResponse) ? productImagesResponse : []);

        const imagesData = Array.isArray(loadedImages) ? loadedImages : [];

        setExistingImages(imagesData);

        const productPrimaryImage = product.primaryImage || "";

        const primaryFromImages = imagesData.find(
          (image) => image.isPrimary === true,
        );

        setPrimaryImage(
          productPrimaryImage ||
            primaryFromImages?.imageUrl ||
            imagesData[0]?.imageUrl ||
            "",
        );

        let productTags = "";

        if (Array.isArray(product.tags)) {
          productTags = product.tags.join(", ");
        } else if (typeof product.tags === "string") {
          productTags = product.tags;
        }

        setFormData({
          name: product.name || "",

          shortDescription: product.shortDescription || "",

          description: product.description || "",

          category: product.category?._id || product.category || "",

          price: product.price ?? "",

          comparePrice: product.comparePrice ?? "",

          stock: product.stock ?? "",

          sku: product.sku || "",

          material: product.material || "",

          color: product.color || "",

          weight: product.weight ?? "",

          featured: Boolean(product.featured),

          bestSeller: Boolean(product.bestSeller),

          newArrival: Boolean(product.newArrival),

          tags: productTags,

          seoTitle: product.seoTitle || "",

          seoDescription: product.seoDescription || "",

          seoSlug: product.seoSlug || "",

          preparationDays: product.preparationDays ?? "",

          careInstructions: product.careInstructions || "",

          isCustomizable: Boolean(product.isCustomizable),

          status: product.status || "active",
        });

        const loadedProductTechnologies =
          productTechnologiesResponse?.data?.productTechnologies ||
          productTechnologiesResponse?.productTechnologies ||
          (Array.isArray(productTechnologiesResponse)
            ? productTechnologiesResponse
            : []);

        const relations = Array.isArray(loadedProductTechnologies)
          ? loadedProductTechnologies
          : [];

        const selectedIds = [];

        const prices = {};

        relations.forEach((relation) => {
          const modelId =
            relation.technologyModel?._id || relation.technologyModel;

          if (!modelId) {
            return;
          }

          const idString = modelId.toString();

          if (!selectedIds.includes(idString)) {
            selectedIds.push(idString);
          }

          prices[idString] = {
            relationId: relation._id || "",

            extraPrice: relation.extraPrice ?? 0,
          };
        });

        if (
          selectedIds.length === 0 &&
          Array.isArray(product.technologyModels)
        ) {
          product.technologyModels.forEach((model) => {
            const modelId = typeof model === "object" ? model._id : model;

            if (!modelId) {
              return;
            }

            const idString = modelId.toString();

            if (!selectedIds.includes(idString)) {
              selectedIds.push(idString);
            }

            prices[idString] = {
              relationId: "",

              extraPrice: 0,
            };
          });
        }

        setSelectedTechnologyModels(selectedIds);

        setTechnologyPrices(prices);
      } catch (error) {
        console.error(error);

        setError(
          error?.response?.data?.message ||
            error?.message ||
            "Failed to load product.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      loadData();
    }
  }, [id]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((previous) => ({
      ...previous,

      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleTechnologyModelChange = (modelId) => {
    setSelectedTechnologyModels((previous) => {
      if (previous.includes(modelId)) {
        return previous.filter((selectedId) => selectedId !== modelId);
      }

      setTechnologyPrices((previousPrices) => ({
        ...previousPrices,

        [modelId]: {
          relationId: "",

          extraPrice: previousPrices[modelId]?.extraPrice ?? 0,
        },
      }));

      return [...previous, modelId];
    });
  };

  const handleExtraPriceChange = (modelId, value) => {
    setTechnologyPrices((previous) => ({
      ...previous,

      [modelId]: {
        ...previous[modelId],

        extraPrice: value === "" ? "" : Number(value),
      },
    }));
  };

  const getExtraPrice = (modelId) => {
    return technologyPrices[modelId]?.extraPrice ?? 0;
  };

  const handleImageChange = (event) => {
    const files = Array.from(event.target.files || []);

    if (!files.length) {
      return;
    }

    setNewImages((previous) => [...previous, ...files]);

    setPreviewNewImages((previous) => [
      ...previous,

      ...files.map((file) => URL.createObjectURL(file)),
    ]);

    event.target.value = "";
  };

  const handleRemoveNewImage = (index) => {
    setNewImages((previous) =>
      previous.filter((_, imageIndex) => imageIndex !== index),
    );

    setPreviewNewImages((previous) =>
      previous.filter((_, imageIndex) => imageIndex !== index),
    );
  };

  const handleSelectExistingPrimary = (imageUrl) => {
    setPrimaryImage(imageUrl);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    setSuccessMessage("");

    setIsSaving(true);

    try {
      await updateProduct(
        id,

        {
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

          technologyModels: selectedTechnologyModels,

          primaryImage: primaryImage,
        },
      );

      for (const modelId of selectedTechnologyModels) {
        const priceData = technologyPrices[modelId];

        const extraPrice = Number(priceData?.extraPrice || 0);

        if (priceData?.relationId) {
          await updateProductTechnology(
            priceData.relationId,

            {
              extraPrice,
            },
          );
        } else {
          await createProductTechnology({
            product: id,

            technologyModel: modelId,

            extraPrice,

            isDefault: false,

            isSelectable: true,

            displayOrder: selectedTechnologyModels.indexOf(modelId),

            status: "active",
          });
        }
      }

      let uploadedPrimaryImage = primaryImage;

      for (let i = 0; i < newImages.length; i++) {
        const imageFile = newImages[i];

        const form = new FormData();

        form.append("image", imageFile);

        const upload = await uploadImage(form);

        const uploadedImage = upload?.image || upload?.data?.image || "";

        if (!uploadedImage) {
          continue;
        }

        const shouldBePrimary = !uploadedPrimaryImage && i === 0;

        await createProductImage({
          product: id,

          imageUrl: uploadedImage,

          isPrimary: shouldBePrimary,

          sortOrder: existingImages.length + i,
        });

        if (shouldBePrimary) {
          uploadedPrimaryImage = uploadedImage;
        }
      }

      if (uploadedPrimaryImage) {
        await updateProduct(
          id,

          {
            primaryImage: uploadedPrimaryImage,
          },
        );
      }
      setSuccessMessage("Product updated successfully.");

      setTimeout(() => {
        navigate("/admin/products");
      }, 800);
    } catch (error) {
      console.error(error);

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update product.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-warm-ivory text-midnight-navy">
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-classic-gold/30 bg-midnight-navy text-2xl text-champagne-gold">
              ✦
            </div>

            <p className="mt-5 text-[10px] font-semibold text-slate-gray">
              Loading Product...
            </p>

            <p className="mt-1 text-[8px] text-steel-gray">
              Preparing product information
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-warm-ivory text-midnight-navy">
      <header className="sticky top-0 z-40 border-b border-light-champagne/80 bg-soft-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-5 px-6 py-5 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
          <div>
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-champagne-gold/25 bg-midnight-navy text-champagne-gold shadow-[0_8px_20px_rgba(18,38,58,0.13)]">
                ✦
              </div>

              <div>
                <div className="flex items-center gap-3">
                  <span className="text-[8px] font-semibold uppercase tracking-[0.3em] text-antique-gold">
                    Collection
                  </span>

                  <span className="h-px w-7 bg-antique-gold" />

                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-steel-gray">
                    Edit
                  </span>
                </div>

                <h1 className="mt-1 font-serif text-[2rem] font-normal tracking-[-0.03em] text-midnight-navy">
                  Edit Product
                </h1>
              </div>
            </div>
          </div>

          <Link
            to="/admin/products"
            className="group inline-flex min-h-[46px] w-fit items-center justify-center gap-3 rounded-full border border-champagne-gold/30 bg-soft-white/85 px-5 text-[8px] font-semibold uppercase tracking-[0.11em] text-slate-gray shadow-[0_7px_18px_rgba(7,19,31,0.035)] transition-all duration-300 hover:-translate-y-0.5 hover:border-classic-gold hover:bg-warm-ivory hover:text-midnight-navy"
          >
            <span className="text-antique-gold transition-transform duration-300 group-hover:-translate-x-1">
              ←
            </span>
            Back to Products
          </Link>
        </div>
      </header>

      <main className="relative mx-auto max-w-[1500px] px-6 py-10 sm:px-8 lg:px-10 lg:py-12">
        <div className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-classic-gold/[0.06] blur-[90px]" />

        <div className="pointer-events-none absolute -right-32 top-[30rem] h-80 w-80 rounded-full bg-classic-gold/[0.05] blur-[100px]" />

        {error && (
          <div className="relative mb-8 flex items-center justify-between rounded-[16px] border border-antique-gold/25 bg-soft-cream/85 px-5 py-4 text-[10px] leading-5 text-antique-gold shadow-[0_7px_20px_rgba(7,19,31,0.03)]">
            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
              className="font-semibold text-antique-gold"
            >
              ×
            </button>
          </div>
        )}

        {successMessage && (
          <div className="relative mb-8 rounded-[16px] border border-classic-gold/25 bg-soft-cream/85 px-5 py-4 text-[10px] font-medium leading-5 text-antique-gold shadow-[0_7px_20px_rgba(7,19,31,0.03)]">
            {successMessage}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="relative grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_380px]"
        >
          <div className="space-y-8">
            <section className="overflow-hidden rounded-[26px] border border-light-champagne/90 bg-soft-white/85 shadow-[0_16px_46px_rgba(7,19,31,0.05)] backdrop-blur-sm">
              <div className="border-b border-light-champagne/80 bg-warm-ivory/50 px-7 py-6 sm:px-9">
                <div className="flex items-center gap-3">
                  <span className="text-antique-gold">01</span>

                  <span className="h-px w-8 bg-antique-gold" />

                  <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-steel-gray">
                    Product Details
                  </span>
                </div>

                <h2 className="mt-3 font-serif text-[1.55rem] font-normal tracking-[-0.02em] text-midnight-navy">
                  Edit your piece
                </h2>

                <p className="mt-2 text-[10px] leading-6 text-slate-gray">
                  Update the essential information customers see when
                  discovering this product.
                </p>
              </div>

              <div className="space-y-6 p-7 sm:p-9">
                <div>
                  <label className="mb-2.5 block text-[8px] font-semibold uppercase tracking-[0.14em] text-midnight-navy">
                    Product Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Aurelia Gold Ring"
                    className="w-full rounded-[13px] border border-light-champagne bg-warm-ivory/60 px-4 py-3.5 text-[11px] text-midnight-navy outline-none transition-all duration-300 placeholder:text-steel-gray/65 hover:border-champagne-gold/55 hover:bg-soft-white focus:border-classic-gold focus:bg-soft-white focus:ring-4 focus:ring-classic-gold/10"
                  />
                </div>

                <div>
                  <label className="mb-2.5 block text-[8px] font-semibold uppercase tracking-[0.14em] text-midnight-navy">
                    Short Description
                  </label>

                  <input
                    type="text"
                    name="shortDescription"
                    value={formData.shortDescription}
                    onChange={handleChange}
                    placeholder="A short elegant description"
                    className="w-full rounded-[13px] border border-light-champagne bg-warm-ivory/60 px-4 py-3.5 text-[11px] text-midnight-navy outline-none transition-all duration-300 placeholder:text-steel-gray/65 hover:border-champagne-gold/55 hover:bg-soft-white focus:border-classic-gold focus:bg-soft-white focus:ring-4 focus:ring-classic-gold/10"
                  />
                </div>

                <div>
                  <label className="mb-2.5 block text-[8px] font-semibold uppercase tracking-[0.14em] text-midnight-navy">
                    Description
                  </label>

                  <textarea
                    rows={6}
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    placeholder="Describe the piece, its details, inspiration and materials..."
                    className="w-full resize-none rounded-[13px] border border-light-champagne bg-warm-ivory/60 px-4 py-3.5 text-[11px] text-midnight-navy outline-none transition-all duration-300 placeholder:text-steel-gray/65 hover:border-champagne-gold/55 hover:bg-soft-white focus:border-classic-gold focus:bg-soft-white focus:ring-4 focus:ring-classic-gold/10"
                  />
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2.5 block text-[8px] font-semibold uppercase tracking-[0.14em] text-midnight-navy">
                      Category
                    </label>

                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      className="w-full rounded-[13px] border border-light-champagne bg-warm-ivory/60 px-4 py-3.5 text-[11px] text-midnight-navy outline-none transition-all duration-300 placeholder:text-steel-gray/65 hover:border-champagne-gold/55 hover:bg-soft-white focus:border-classic-gold focus:bg-soft-white focus:ring-4 focus:ring-classic-gold/10"
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
                    <label className="mb-2.5 block text-[8px] font-semibold uppercase tracking-[0.14em] text-midnight-navy">
                      SKU
                    </label>

                    <input
                      type="text"
                      name="sku"
                      value={formData.sku}
                      onChange={handleChange}
                      placeholder="SKU-001"
                      className="w-full rounded-[13px] border border-light-champagne bg-warm-ivory/60 px-4 py-3.5 text-[11px] uppercase text-midnight-navy outline-none transition-all duration-300 placeholder:text-steel-gray/65 hover:border-champagne-gold/55 hover:bg-soft-white focus:border-classic-gold focus:bg-soft-white focus:ring-4 focus:ring-classic-gold/10"
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="overflow-hidden rounded-[26px] border border-light-champagne/90 bg-soft-white/85 shadow-[0_16px_46px_rgba(7,19,31,0.05)] backdrop-blur-sm">
              <div className="border-b border-light-champagne/80 bg-warm-ivory/50 px-7 py-6 sm:px-9">
                <div className="flex items-center gap-3">
                  <span className="text-antique-gold">02</span>

                  <span className="h-px w-8 bg-antique-gold" />

                  <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-steel-gray">
                    Pricing & Inventory
                  </span>
                </div>

                <h2 className="mt-3 font-serif text-[1.55rem] font-normal tracking-[-0.02em] text-midnight-navy">
                  Pricing & availability
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-6 p-7 sm:grid-cols-2 sm:p-9 lg:grid-cols-4">
                <div>
                  <label className="mb-2.5 block text-[8px] font-semibold uppercase tracking-[0.14em] text-midnight-navy">
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
                      className="w-full rounded-[13px] border border-light-champagne bg-warm-ivory/60 px-4 pr-14 py-3.5 text-[11px] text-midnight-navy outline-none transition-all duration-300 placeholder:text-steel-gray/65 hover:border-champagne-gold/55 hover:bg-soft-white focus:border-classic-gold focus:bg-soft-white focus:ring-4 focus:ring-classic-gold/10"
                    />

                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-antique-gold">
                      EGP
                    </span>
                  </div>
                </div>

                <div>
                  <label className="mb-2.5 block text-[8px] font-semibold uppercase tracking-[0.14em] text-midnight-navy">
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
                      className="w-full rounded-[13px] border border-light-champagne bg-warm-ivory/60 px-4 pr-14 py-3.5 text-[11px] text-midnight-navy outline-none transition-all duration-300 placeholder:text-steel-gray/65 hover:border-champagne-gold/55 hover:bg-soft-white focus:border-classic-gold focus:bg-soft-white focus:ring-4 focus:ring-classic-gold/10"
                    />

                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-antique-gold">
                      EGP
                    </span>
                  </div>
                </div>

                <div>
                  <label className="mb-2.5 block text-[8px] font-semibold uppercase tracking-[0.14em] text-midnight-navy">
                    Stock
                  </label>

                  <input
                    type="number"
                    min="0"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    required
                    className="w-full rounded-[13px] border border-light-champagne bg-warm-ivory/60 px-4 py-3.5 text-[11px] text-midnight-navy outline-none transition-all duration-300 placeholder:text-steel-gray/65 hover:border-champagne-gold/55 hover:bg-soft-white focus:border-classic-gold focus:bg-soft-white focus:ring-4 focus:ring-classic-gold/10"
                  />
                </div>

                <div>
                  <label className="mb-2.5 block text-[8px] font-semibold uppercase tracking-[0.14em] text-midnight-navy">
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
                      className="w-full rounded-[13px] border border-light-champagne bg-warm-ivory/60 px-4 pr-10 py-3.5 text-[11px] text-midnight-navy outline-none transition-all duration-300 placeholder:text-steel-gray/65 hover:border-champagne-gold/55 hover:bg-soft-white focus:border-classic-gold focus:bg-soft-white focus:ring-4 focus:ring-classic-gold/10"
                    />

                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-steel-gray">
                      g
                    </span>
                  </div>
                </div>
              </div>
            </section>

            <section className="overflow-hidden rounded-[26px] border border-light-champagne/90 bg-soft-white/85 shadow-[0_16px_46px_rgba(7,19,31,0.05)] backdrop-blur-sm">
              <div className="border-b border-light-champagne/80 bg-warm-ivory/50 px-7 py-6 sm:px-9">
                <div className="flex items-center gap-3">
                  <span className="text-antique-gold">03</span>

                  <span className="h-px w-8 bg-antique-gold" />

                  <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-steel-gray">
                    Details
                  </span>
                </div>

                <h2 className="mt-3 font-serif text-[1.55rem] font-normal tracking-[-0.02em] text-midnight-navy">
                  Product characteristics
                </h2>
              </div>

              <div className="space-y-6 p-7 sm:p-9">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                  <div>
                    <label className="mb-2.5 block text-[8px] font-semibold uppercase tracking-[0.14em] text-midnight-navy">
                      Material
                    </label>

                    <input
                      type="text"
                      name="material"
                      value={formData.material}
                      onChange={handleChange}
                      placeholder="18K Gold"
                      className="w-full rounded-[13px] border border-light-champagne bg-warm-ivory/60 px-4 py-3.5 text-[11px] text-midnight-navy outline-none transition-all duration-300 placeholder:text-steel-gray/65 hover:border-champagne-gold/55 hover:bg-soft-white focus:border-classic-gold focus:bg-soft-white focus:ring-4 focus:ring-classic-gold/10"
                    />
                  </div>

                  <div>
                    <label className="mb-2.5 block text-[8px] font-semibold uppercase tracking-[0.14em] text-midnight-navy">
                      Color
                    </label>

                    <input
                      type="text"
                      name="color"
                      value={formData.color}
                      onChange={handleChange}
                      placeholder="Gold"
                      className="w-full rounded-[13px] border border-light-champagne bg-warm-ivory/60 px-4 py-3.5 text-[11px] text-midnight-navy outline-none transition-all duration-300 placeholder:text-steel-gray/65 hover:border-champagne-gold/55 hover:bg-soft-white focus:border-classic-gold focus:bg-soft-white focus:ring-4 focus:ring-classic-gold/10"
                    />
                  </div>

                  <div>
                    <label className="mb-2.5 block text-[8px] font-semibold uppercase tracking-[0.14em] text-midnight-navy">
                      Preparation Days
                    </label>

                    <input
                      type="number"
                      min="0"
                      name="preparationDays"
                      value={formData.preparationDays}
                      onChange={handleChange}
                      className="w-full rounded-[13px] border border-light-champagne bg-warm-ivory/60 px-4 py-3.5 text-[11px] text-midnight-navy outline-none transition-all duration-300 placeholder:text-steel-gray/65 hover:border-champagne-gold/55 hover:bg-soft-white focus:border-classic-gold focus:bg-soft-white focus:ring-4 focus:ring-classic-gold/10"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2.5 block text-[8px] font-semibold uppercase tracking-[0.14em] text-midnight-navy">
                    Tags
                  </label>

                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder="gold, ring, luxury, gift"
                    className="w-full rounded-[13px] border border-light-champagne bg-warm-ivory/60 px-4 py-3.5 text-[11px] text-midnight-navy outline-none transition-all duration-300 placeholder:text-steel-gray/65 hover:border-champagne-gold/55 hover:bg-soft-white focus:border-classic-gold focus:bg-soft-white focus:ring-4 focus:ring-classic-gold/10"
                  />

                  <p className="mt-2 text-[8px] text-steel-gray">
                    Separate tags with commas.
                  </p>
                </div>

                <div>
                  <label className="mb-2.5 block text-[8px] font-semibold uppercase tracking-[0.14em] text-midnight-navy">
                    Care Instructions
                  </label>

                  <textarea
                    rows={4}
                    name="careInstructions"
                    value={formData.careInstructions}
                    onChange={handleChange}
                    placeholder="How should the customer care for this piece?"
                    className="w-full resize-none rounded-[13px] border border-light-champagne bg-warm-ivory/60 px-4 py-3.5 text-[11px] text-midnight-navy outline-none transition-all duration-300 placeholder:text-steel-gray/65 hover:border-champagne-gold/55 hover:bg-soft-white focus:border-classic-gold focus:bg-soft-white focus:ring-4 focus:ring-classic-gold/10"
                  />
                </div>

                <label className="flex cursor-pointer items-center justify-between rounded-[16px] border border-light-champagne bg-warm-ivory/60 p-5 transition-all duration-300 hover:border-champagne-gold/55 hover:bg-soft-white">
                  <div>
                    <p className="text-[10px] font-semibold">
                      Customizable Product
                    </p>

                    <p className="mt-1 text-[8px] text-steel-gray">
                      Allow customers to customize this piece.
                    </p>
                  </div>

                  <input
                    type="checkbox"
                    name="isCustomizable"
                    checked={formData.isCustomizable}
                    onChange={handleChange}
                    className="h-4 w-4 accent-classic-gold"
                  />
                </label>
              </div>
            </section>

            <section className="overflow-hidden rounded-[26px] border border-light-champagne/90 bg-soft-white/85 shadow-[0_16px_46px_rgba(7,19,31,0.05)] backdrop-blur-sm">
              <div className="border-b border-light-champagne/80 bg-warm-ivory/50 px-7 py-6 sm:px-9">
                <div className="flex items-center gap-3">
                  <span className="text-antique-gold">04</span>

                  <span className="h-px w-8 bg-antique-gold" />

                  <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-steel-gray">
                    Technology
                  </span>
                </div>

                <h2 className="mt-3 font-serif text-[1.55rem] font-normal tracking-[-0.02em] text-midnight-navy">
                  Technology Models
                </h2>

                <p className="mt-2 max-w-2xl text-[10px] leading-6 text-slate-gray">
                  Select the technologies available for this product and define
                  any additional price.
                </p>
              </div>

              <div className="space-y-4 p-7 sm:p-9">
                {technologyModels.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-light-champagne bg-soft-white p-8 text-center">
                    <div className="text-2xl text-classic-gold">✦</div>

                    <p className="mt-3 text-[10px] font-semibold">
                      No technology models available
                    </p>

                    <p className="mt-1 text-[8px] text-steel-gray">
                      Add technology models before assigning them to products.
                    </p>
                  </div>
                ) : (
                  technologyModels.map((model) => {
                    const selected = selectedTechnologyModels.includes(
                      model._id,
                    );

                    const extraPrice = getExtraPrice(model._id);

                    return (
                      <div
                        key={model._id}
                        className={`rounded-[18px] border p-5 transition-all duration-300 ${
                          selected
                            ? "border-champagne-gold/60 bg-soft-cream shadow-[0_8px_22px_rgba(7,19,31,0.035)]"
                            : "border-light-champagne bg-warm-ivory/50 hover:border-champagne-gold/50 hover:bg-soft-white"
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() =>
                              handleTechnologyModelChange(model._id)
                            }
                            className="mt-1 h-4 w-4 accent-classic-gold"
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
                                  <p className="mt-2 text-[8px] text-steel-gray">
                                    Technology: {model.technology.name}
                                  </p>
                                )}
                              </div>

                              {model.status && (
                                <span
                                  className={`inline-flex w-fit rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider ${
                                    model.status === "active"
                                      ? "bg-soft-cream text-antique-gold"
                                      : "bg-silver-mist text-steel-gray"
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
                                <label className="mb-2.5 block text-[8px] font-semibold uppercase tracking-[0.14em] text-midnight-navy">
                                  Extra Price
                                </label>

                                <div className="relative">
                                  <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={extraPrice}
                                    onChange={(event) =>
                                      handleExtraPriceChange(
                                        model._id,
                                        event.target.value,
                                      )
                                    }
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
                                      {Number(formData.price || 0).toFixed(2)}{" "}
                                      EGP
                                    </span>
                                  </div>

                                  <div className="mt-2 flex justify-between text-[8px] text-steel-gray">
                                    <span>Extra Price</span>

                                    <span>
                                      {Number(extraPrice || 0).toFixed(2)} EGP
                                    </span>
                                  </div>

                                  <div className="mt-3 flex justify-between border-t border-light-champagne pt-3 text-[10px] font-semibold text-midnight-navy">
                                    <span>Final Price</span>

                                    <span className="text-antique-gold">
                                      {(
                                        Number(formData.price || 0) +
                                        Number(extraPrice || 0)
                                      ).toFixed(2)}{" "}
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

            <section className="overflow-hidden rounded-[26px] border border-light-champagne/90 bg-soft-white/85 shadow-[0_16px_46px_rgba(7,19,31,0.05)] backdrop-blur-sm">
              <div className="border-b border-light-champagne/80 bg-warm-ivory/50 px-7 py-6 sm:px-9">
                <div className="flex items-center gap-3">
                  <span className="text-antique-gold">05</span>

                  <span className="h-px w-8 bg-antique-gold" />

                  <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-steel-gray">
                    Media
                  </span>
                </div>

                <h2 className="mt-3 font-serif text-[1.55rem] font-normal tracking-[-0.02em] text-midnight-navy">
                  Product Images
                </h2>

                <p className="mt-2 text-[10px] text-slate-gray">
                  Select the primary image or upload additional product images.
                </p>
              </div>

              <div className="p-7 sm:p-9">
                {existingImages.length > 0 && (
                  <div>
                    <div className="mb-4 flex items-center gap-3">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-steel-gray">
                        Current Images
                      </span>

                      <span className="h-px flex-1 bg-light-champagne" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                      {existingImages.map((image, index) => {
                        const imageUrl =
                          image.imageUrl || image.url || image.image || "";

                        const isPrimary = primaryImage === imageUrl;

                        return (
                          <button
                            type="button"
                            key={image._id || index}
                            onClick={() =>
                              handleSelectExistingPrimary(imageUrl)
                            }
                            className={`group overflow-hidden rounded-2xl border text-left transition-all ${
                              isPrimary
                                ? "border-antique-gold bg-soft-cream/75 ring-2 ring-classic-gold/20"
                                : "border-light-champagne bg-soft-white hover:border-classic-gold"
                            }`}
                          >
                            <div className="relative aspect-square overflow-hidden">
                              {imageUrl ? (
                                <img
                                  src={imageUrl}
                                  alt={formData.name}
                                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center text-[8px] text-steel-gray">
                                  No Image
                                </div>
                              )}

                              {isPrimary && (
                                <div className="absolute left-3 top-3 rounded-full bg-midnight-navy px-3 py-1.5 text-[9px] font-semibold uppercase tracking-wider text-champagne-gold">
                                  Primary
                                </div>
                              )}
                            </div>

                            <div className="flex items-center justify-between px-3 py-3">
                              <span className="text-[8px] text-steel-gray">
                                Image {index + 1}
                              </span>

                              {isPrimary && (
                                <span className="text-[9px] font-semibold uppercase tracking-wider text-antique-gold">
                                  Selected
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <p className="mt-4 text-[8px] text-steel-gray">
                      Click any current image to make it the primary image.
                    </p>
                  </div>
                )}

                <div className={existingImages.length > 0 ? "mt-8" : ""}>
                  <div className="mb-4 flex items-center gap-3">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-steel-gray">
                      Add New Images
                    </span>

                    <span className="h-px flex-1 bg-light-champagne" />
                  </div>

                  <label className="group flex cursor-pointer flex-col items-center justify-center rounded-[18px] border border-dashed border-champagne-gold/40 bg-warm-ivory/55 px-6 py-12 text-center transition-all duration-300 hover:border-champagne-gold/70 hover:bg-soft-white">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full border border-champagne-gold/25 bg-soft-white text-[18px] text-classic-gold shadow-[0_7px_18px_rgba(7,19,31,0.035)] transition-all duration-300 group-hover:-translate-y-1">
                      +
                    </div>

                    <p className="mt-5 text-[10px] font-semibold">
                      Upload Product Images
                    </p>

                    <p className="mt-2 text-[8px] text-steel-gray">
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
                </div>

                {previewNewImages.length > 0 && (
                  <div className="mt-7">
                    <div className="mb-4 flex items-center gap-3">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-steel-gray">
                        New Images
                      </span>

                      <span className="h-px flex-1 bg-light-champagne" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                      {previewNewImages.map((image, index) => (
                        <div
                          key={`${image}-${index}`}
                          className="group overflow-hidden rounded-2xl border border-light-champagne bg-soft-white"
                        >
                          <div className="relative aspect-square overflow-hidden">
                            <img
                              src={image}
                              alt=""
                              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                            />

                            <button
                              type="button"
                              onClick={() => handleRemoveNewImage(index)}
                              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-midnight-navy/90 text-soft-white transition hover:bg-antique-gold"
                            >
                              ×
                            </button>
                          </div>

                          <div className="px-3 py-2.5 text-[8px] text-steel-gray">
                            New Image {index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-6 rounded-2xl border border-champagne-gold/30 bg-soft-cream/75 p-4">
                  <div className="flex gap-3">
                    <span className="text-antique-gold">✦</span>

                    <p className="text-[9px] leading-6 text-slate-gray">
                      Existing images cannot be deleted with the currently
                      available API. You can select an existing image as primary
                      or upload additional images.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="overflow-hidden rounded-[26px] border border-light-champagne/90 bg-soft-white/85 shadow-[0_16px_46px_rgba(7,19,31,0.05)] backdrop-blur-sm">
              <div className="border-b border-light-champagne/80 bg-warm-ivory/50 px-7 py-6 sm:px-9">
                <div className="flex items-center gap-3">
                  <span className="text-antique-gold">06</span>

                  <span className="h-px w-8 bg-antique-gold" />

                  <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-steel-gray">
                    SEO
                  </span>
                </div>

                <h2 className="mt-3 font-serif text-[1.55rem] font-normal tracking-[-0.02em] text-midnight-navy">
                  Search optimization
                </h2>
              </div>

              <div className="space-y-5 p-7 sm:p-9">
                <div>
                  <label className="mb-2.5 block text-[8px] font-semibold uppercase tracking-[0.14em] text-midnight-navy">
                    SEO Title
                  </label>

                  <input
                    type="text"
                    name="seoTitle"
                    value={formData.seoTitle}
                    onChange={handleChange}
                    placeholder="Elegant gold jewelry..."
                    className="w-full rounded-[13px] border border-light-champagne bg-warm-ivory/60 px-4 py-3.5 text-[11px] text-midnight-navy outline-none transition-all duration-300 placeholder:text-steel-gray/65 hover:border-champagne-gold/55 hover:bg-soft-white focus:border-classic-gold focus:bg-soft-white focus:ring-4 focus:ring-classic-gold/10"
                  />
                </div>

                <div>
                  <label className="mb-2.5 block text-[8px] font-semibold uppercase tracking-[0.14em] text-midnight-navy">
                    SEO Slug
                  </label>

                  <input
                    type="text"
                    name="seoSlug"
                    value={formData.seoSlug}
                    onChange={handleChange}
                    placeholder="elegant-gold-ring"
                    className="w-full rounded-[13px] border border-light-champagne bg-warm-ivory/60 px-4 py-3.5 text-[11px] text-midnight-navy outline-none transition-all duration-300 placeholder:text-steel-gray/65 hover:border-champagne-gold/55 hover:bg-soft-white focus:border-classic-gold focus:bg-soft-white focus:ring-4 focus:ring-classic-gold/10"
                  />
                </div>

                <div>
                  <label className="mb-2.5 block text-[8px] font-semibold uppercase tracking-[0.14em] text-midnight-navy">
                    SEO Description
                  </label>

                  <textarea
                    rows={4}
                    name="seoDescription"
                    value={formData.seoDescription}
                    onChange={handleChange}
                    placeholder="Write a short search engine description..."
                    className="w-full resize-none rounded-[13px] border border-light-champagne bg-warm-ivory/60 px-4 py-3.5 text-[11px] text-midnight-navy outline-none transition-all duration-300 placeholder:text-steel-gray/65 hover:border-champagne-gold/55 hover:bg-soft-white focus:border-classic-gold focus:bg-soft-white focus:ring-4 focus:ring-classic-gold/10"
                  />
                </div>
              </div>
            </section>
          </div>

          <aside className="space-y-6 xl:sticky xl:top-28 xl:self-start">
            <div className="overflow-hidden rounded-[26px] border border-champagne-gold/15 bg-midnight-navy text-soft-white shadow-[0_22px_55px_rgba(7,19,31,0.18)]">
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

                  <h2 className="font-serif text-[1.55rem] font-normal tracking-[-0.02em] text-soft-white">
                    Update your
                    <span className="mt-1 block font-serif italic text-champagne-gold">
                      beautiful piece.
                    </span>
                  </h2>

                  <p className="mt-4 text-sm leading-6 text-premium-silver/70">
                    Update the product information and save your changes to the
                    collection.
                  </p>
                </div>
              </div>

              <div className="border-t border-soft-white/10 p-6">
                <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.2em] text-premium-silver/70">
                  Status
                </label>

                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="h-[48px] w-full rounded-[12px] border border-champagne-gold/20 bg-rich-navy px-4 text-[10px] text-soft-white outline-none transition focus:border-champagne-gold"
                >
                  <option value="active">Active</option>

                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="rounded-[22px] border border-light-champagne/90 bg-soft-white/85 p-6 shadow-[0_12px_35px_rgba(7,19,31,0.045)] backdrop-blur-sm">
              <div className="mb-5 flex items-center gap-3">
                <span className="text-antique-gold">✦</span>

                <div>
                  <h3 className="font-semibold">Marketing</h3>

                  <p className="mt-1 text-[8px] text-steel-gray">
                    Highlight this product in your store.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex cursor-pointer items-center justify-between rounded-xl border border-light-champagne bg-soft-white p-4 transition hover:border-classic-gold/50">
                  <span className="text-[10px] font-medium">Featured</span>

                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleChange}
                    className="h-4 w-4 accent-classic-gold"
                  />
                </label>

                <label className="flex cursor-pointer items-center justify-between rounded-xl border border-light-champagne bg-soft-white p-4 transition hover:border-classic-gold/50">
                  <span className="text-[10px] font-medium">Best Seller</span>

                  <input
                    type="checkbox"
                    name="bestSeller"
                    checked={formData.bestSeller}
                    onChange={handleChange}
                    className="h-4 w-4 accent-classic-gold"
                  />
                </label>

                <label className="flex cursor-pointer items-center justify-between rounded-xl border border-light-champagne bg-soft-white p-4 transition hover:border-classic-gold/50">
                  <span className="text-[10px] font-medium">New Arrival</span>

                  <input
                    type="checkbox"
                    name="newArrival"
                    checked={formData.newArrival}
                    onChange={handleChange}
                    className="h-4 w-4 accent-classic-gold"
                  />
                </label>
              </div>
            </div>

            <div className="rounded-[22px] border border-light-champagne/90 bg-soft-white/85 p-6 shadow-[0_12px_35px_rgba(7,19,31,0.045)] backdrop-blur-sm">
              <div className="mb-5 flex items-center gap-3">
                <span className="h-px w-8 bg-antique-gold" />

                <span className="text-[9px] font-semibold uppercase tracking-[0.3em] text-steel-gray">
                  Summary
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-light-champagne/70 pb-4">
                  <span className="text-[10px] text-slate-gray">
                    Technology Models
                  </span>

                  <span className="font-semibold text-midnight-navy">
                    {selectedTechnologyModels.length}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-light-champagne/70 pb-4">
                  <span className="text-[10px] text-slate-gray">
                    Current Images
                  </span>

                  <span className="font-semibold text-midnight-navy">
                    {existingImages.length}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-light-champagne/70 pb-4">
                  <span className="text-[10px] text-slate-gray">
                    New Images
                  </span>

                  <span className="font-semibold text-midnight-navy">
                    {newImages.length}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-gray">
                    Product Price
                  </span>

                  <span className="font-semibold text-antique-gold">
                    {formData.price ? `${formData.price} EGP` : "—"}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-[22px] border border-champagne-gold/20 bg-soft-cream/75 p-6">
              <div className="flex gap-3">
                <span className="text-antique-gold">✦</span>

                <p className="text-[9px] leading-6 text-slate-gray">
                  The selected image will be saved as the primary product image
                  when you update the product.
                </p>
              </div>
            </div>
          </aside>

          <div className="xl:col-span-2">
            <div className="rounded-[22px] border border-light-champagne/90 bg-soft-white/85 p-6 shadow-[0_12px_35px_rgba(7,19,31,0.045)] backdrop-blur-sm sm:p-8">
              <div className="mb-6 flex items-center gap-3">
                <span className="h-px w-8 bg-antique-gold" />

                <span className="text-[9px] font-semibold uppercase tracking-[0.3em] text-steel-gray">
                  Save Changes
                </span>
              </div>

              <div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-end">
                <Link
                  to="/admin/products"
                  className="inline-flex min-h-[48px] items-center justify-center rounded-[13px] border border-light-champagne bg-soft-white px-7 text-[8px] font-semibold uppercase tracking-[0.11em] text-slate-gray transition-all duration-300 hover:-translate-y-0.5 hover:border-champagne-gold hover:bg-warm-ivory hover:text-midnight-navy"
                >
                  Cancel
                </Link>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="group inline-flex min-h-[48px] min-w-[210px] items-center justify-center gap-3 rounded-[13px] bg-midnight-navy px-8 text-[8px] font-semibold uppercase tracking-[0.11em] text-soft-white shadow-[0_11px_26px_rgba(18,38,58,0.14)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-rich-navy hover:shadow-[0_15px_32px_rgba(18,38,58,0.2)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-soft-white/30 border-t-soft-white" />
                      Updating Product...
                    </>
                  ) : (
                    <>
                      Update Product
                      <span className="text-champagne-gold transition-transform duration-300 group-hover:translate-x-1">
                        →
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
};

export default EditProductPage;
