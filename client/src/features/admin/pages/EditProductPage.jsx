import { useEffect, useState } from "react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import api from "../../../lib/axios";

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

import { getSmartUnits } from "../smart-units/services/smartUnitApi";

const sanitizeMoneyInput = (value) => {
  let cleanValue = String(value || "")
    .replace(/,/g, "")
    .replace(/[^\d.]/g, "");

  const parts = cleanValue.split(".");

  if (parts.length > 1) {
    cleanValue = `${parts[0]}.${parts
      .slice(1)
      .join("")
      .slice(0, 2)}`;
  }

  return cleanValue;
};

const getBackendOrigin = () => {
  const explicitBackend = import.meta.env.VITE_BACKEND_URL;

  if (explicitBackend) {
    return String(explicitBackend).replace(/\/+$/, "");
  }

  const apiUrl = import.meta.env.VITE_API_URL;

  if (apiUrl && /^https?:\/\//i.test(apiUrl)) {
    return String(apiUrl)
      .replace(/\/api\/?$/i, "")
      .replace(/\/+$/, "");
  }

  if (
    typeof window !== "undefined" &&
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1"
  ) {
    return window.location.origin;
  }

  return "http://localhost:5000";
};

const BACKEND_URL = getBackendOrigin();

const getImageUrl = (value) => {
  if (!value) {
    return "";
  }

  let image = String(value).trim();

  if (!image) {
    return "";
  }

  if (
    /^https?:\/\//i.test(image) ||
    image.startsWith("blob:") ||
    image.startsWith("data:")
  ) {
    return image;
  }

  if (image.startsWith("//")) {
    const protocol =
      typeof window !== "undefined"
        ? window.location.protocol
        : "https:";

    return `${protocol}${image}`;
  }

  if (image.startsWith("/api/uploads/")) {
    image = image.replace(/^\/api/, "");
  }

  if (
    image.startsWith("/assets/") ||
    image.startsWith("/images/")
  ) {
    return image;
  }

  return `${BACKEND_URL}${image.startsWith("/") ? "" : "/"}${image}`;
};

const EditProductPage = () => {
  const { id } = useParams();

  const navigate = useNavigate();

  const [categories, setCategories] =
    useState([]);

  const [
    technologyModels,
    setTechnologyModels,
  ] = useState([]);

  const [
    smartUnits,
    setSmartUnits,
  ] = useState([]);

  const [
    selectedTechnologyModels,
    setSelectedTechnologyModels,
  ] = useState([]);

  const [
    technologyPrices,
    setTechnologyPrices,
  ] = useState({});

  const [
    existingImages,
    setExistingImages,
  ] = useState([]);

  const [
    primaryImage,
    setPrimaryImage,
  ] = useState("");

  const [
    primaryImageId,
    setPrimaryImageId,
  ] = useState("");

  const [
    deletingImageId,
    setDeletingImageId,
  ] = useState("");

  const [
    settingPrimaryImageId,
    setSettingPrimaryImageId,
  ] = useState("");

  const [
    newImages,
    setNewImages,
  ] = useState([]);

  const [
    previewNewImages,
    setPreviewNewImages,
  ] = useState([]);

  const [formData, setFormData] =
    useState({
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

      technologyRequired: false,

      status: "active",
    });

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    isSaving,
    setIsSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        setError("");

        const [
          categoriesResponse,
          technologyModelsResponse,
          smartUnitsResponse,
          productResponse,
          productTechnologiesResponse,
          productImagesResponse,
        ] = await Promise.all([
          getCategories(),

          getTechnologyModels(),

          getSmartUnits().catch(() => ({
            data: {
              smartUnits: [],
            },
          })),

          getProduct(id),

          getProductTechnologies(
            id,
          ).catch(() => []),

          getProductImages(
            id,
          ).catch(() => []),
        ]);

        const categoriesData =
          categoriesResponse?.data
            ?.categories ||
          categoriesResponse
            ?.categories ||
          (Array.isArray(
            categoriesResponse,
          )
            ? categoriesResponse
            : []);

        setCategories(
          Array.isArray(
            categoriesData,
          )
            ? categoriesData
            : [],
        );

        const technologyModelsData =
          technologyModelsResponse?.data
            ?.technologyModels ||
          technologyModelsResponse
            ?.technologyModels ||
          (Array.isArray(
            technologyModelsResponse,
          )
            ? technologyModelsResponse
            : []);

        setTechnologyModels(
          Array.isArray(
            technologyModelsData,
          )
            ? technologyModelsData
            : [],
        );

        const smartUnitsData =
          smartUnitsResponse?.data
            ?.smartUnits ||
          smartUnitsResponse
            ?.smartUnits ||
          [];

        setSmartUnits(
          Array.isArray(
            smartUnitsData,
          )
            ? smartUnitsData
            : [],
        );

        const product =
          productResponse?.data
            ?.product ||
          productResponse?.product;

        if (!product) {
          throw new Error(
            "Product not found.",
          );
        }

        const loadedImages =
          productImagesResponse?.data
            ?.images ||
          productImagesResponse?.data
            ?.productImages ||
          productImagesResponse?.images ||
          productImagesResponse
            ?.productImages ||
          productImagesResponse?.data?.data
            ?.images ||
          (Array.isArray(
            productImagesResponse,
          )
            ? productImagesResponse
            : []);

        const imagesData =
          Array.isArray(loadedImages)
            ? loadedImages
            : [];

        setExistingImages(imagesData);

        const productPrimaryImage =
          product.primaryImage || "";

        const primaryFromImages =
          imagesData.find(
            (image) =>
              image.isPrimary === true,
          ) ||
          imagesData.find(
            (image) =>
              image.imageUrl ===
              productPrimaryImage,
          ) ||
          imagesData[0] ||
          null;

        setPrimaryImage(
          primaryFromImages?.imageUrl ||
            productPrimaryImage ||
            "",
        );

        setPrimaryImageId(
          primaryFromImages?._id || "",
        );

        let productTags = "";

        if (
          Array.isArray(
            product.tags,
          )
        ) {
          productTags =
            product.tags.join(", ");
        } else if (
          typeof product.tags ===
          "string"
        ) {
          productTags =
            product.tags;
        }

        setFormData({
          name:
            product.name || "",

          shortDescription:
            product.shortDescription ||
            "",

          description:
            product.description ||
            "",

          category:
            product.category?._id ||
            product.category ||
            "",

          price:
            product.price ?? "",

          costPrice:
            product.costPrice ?? "",

          comparePrice:
            product.comparePrice ??
            "",

          stock:
            product.stock ?? "",

          material:
            product.material || "",

          color:
            product.color || "",

          weight:
            product.weight ?? "",

          featured:
            Boolean(
              product.featured,
            ),

          bestSeller:
            Boolean(
              product.bestSeller,
            ),

          newArrival:
            Boolean(
              product.newArrival,
            ),

          tags:
            productTags,

          seoTitle:
            product.seoTitle || "",

          seoDescription:
            product.seoDescription ||
            "",

          seoSlug:
            product.seoSlug || "",

          preparationDays:
            product.preparationDays ??
            "",

          careInstructions:
            product.careInstructions ||
            "",

          isCustomizable:
            Boolean(
              product.isCustomizable,
            ),

          technologyRequired:
            Boolean(
              product.technologyRequired,
            ),

          status:
            product.status ||
            "active",
        });

        const loadedProductTechnologies =
          productTechnologiesResponse
            ?.data
            ?.productTechnologies ||
          productTechnologiesResponse
            ?.productTechnologies ||
          (Array.isArray(
            productTechnologiesResponse,
          )
            ? productTechnologiesResponse
            : []);

        const relations =
          Array.isArray(
            loadedProductTechnologies,
          )
            ? loadedProductTechnologies
            : [];

        const selectedIds = [];

        const prices = {};

        relations.forEach(
          (relation) => {
            const modelId =
              relation
                .technologyModel?._id ||
              relation
                .technologyModel;

            if (!modelId) {
              return;
            }

            const idString =
              modelId.toString();

            if (
              !selectedIds.includes(
                idString,
              )
            ) {
              selectedIds.push(
                idString,
              );
            }

            prices[idString] = {
              relationId:
                relation._id || "",

              extraPrice:
                relation.extraPrice ===
                  undefined ||
                relation.extraPrice ===
                  null
                  ? ""
                  : String(
                      relation.extraPrice,
                    ),
            };
          },
        );

        if (
          selectedIds.length ===
            0 &&
          Array.isArray(
            product.technologyModels,
          )
        ) {
          product.technologyModels.forEach(
            (model) => {
              const modelId =
                typeof model ===
                "object"
                  ? model._id
                  : model;

              if (!modelId) {
                return;
              }

              const idString =
                modelId.toString();

              if (
                !selectedIds.includes(
                  idString,
                )
              ) {
                selectedIds.push(
                  idString,
                );
              }

              prices[idString] = {
                relationId: "",

                extraPrice: "",
              };
            },
          );
        }

        setSelectedTechnologyModels(
          selectedIds,
        );

        setTechnologyPrices(
          prices,
        );
      } catch (error) {
        console.error(error);

        setError(
          error?.response?.data
            ?.message ||
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

  const handleChange = (
    event,
  ) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setFormData(
      (previous) => ({
        ...previous,

        [name]:
          type === "checkbox"
            ? checked
            : value,
      }),
    );
  };

  const handleTechnologyModelChange =
    (modelId) => {
      setSelectedTechnologyModels(
        (previous) => {
          if (
            previous.includes(
              modelId,
            )
          ) {
            return previous.filter(
              (selectedId) =>
                selectedId !==
                modelId,
            );
          }

          setTechnologyPrices(
            (previousPrices) => ({
              ...previousPrices,

              [modelId]: {
                relationId:
                  previousPrices[
                    modelId
                  ]?.relationId ||
                  "",

                extraPrice:
                  previousPrices[
                    modelId
                  ]?.extraPrice ??
                  "",
              },
            }),
          );

          return [
            ...previous,

            modelId,
          ];
        },
      );
    };

  const handleExtraPriceChange = (
    modelId,
    value,
  ) => {
    const cleanValue =
      sanitizeMoneyInput(value);

    setTechnologyPrices(
      (previous) => ({
        ...previous,

        [modelId]: {
          ...previous[modelId],

          extraPrice:
            cleanValue,
        },
      }),
    );
  };

  const getExtraPrice = (
    modelId,
  ) => {
    return (
      technologyPrices[modelId]
        ?.extraPrice ?? ""
    );
  };

  const getSmartUnitPriceInfo = (
    modelId,
  ) => {
    const relatedSmartUnits =
      smartUnits.filter(
        (smartUnit) => {
          const technologyModelId =
            smartUnit
              ?.technologyModel?._id ||
            smartUnit
              ?.technologyModel;

          return (
            String(
              technologyModelId ||
                "",
            ) ===
            String(modelId)
          );
        },
      );

    const costs =
      relatedSmartUnits
        .map((smartUnit) =>
          Number(
            smartUnit.costPrice,
          ),
        )
        .filter((price) =>
          Number.isFinite(price),
        );

    const availableStock =
      relatedSmartUnits.reduce(
        (
          total,
          smartUnit,
        ) =>
          total +
          Number(
            smartUnit.availableStock ??
              smartUnit.stock ??
              0,
          ),
        0,
      );

    if (costs.length === 0) {
      return {
        count:
          relatedSmartUnits.length,

        min:
          null,

        max:
          null,

        availableStock,
      };
    }

    return {
      count:
        relatedSmartUnits.length,

      min:
        Math.min(...costs),

      max:
        Math.max(...costs),

      availableStock,
    };
  };

  const formatMoney = (
    value,
  ) => {
    return Number(
      value || 0,
    ).toLocaleString(
      "en-EG",
      {
        maximumFractionDigits: 2,
      },
    );
  };

  const handleImageChange = (
    event,
  ) => {
    const files =
      Array.from(
        event.target.files ||
          [],
      );

    if (!files.length) {
      return;
    }

    setNewImages(
      (previous) => [
        ...previous,

        ...files,
      ],
    );

    setPreviewNewImages(
      (previous) => [
        ...previous,

        ...files.map(
          (file) =>
            URL.createObjectURL(
              file,
            ),
        ),
      ],
    );

    event.target.value = "";
  };

  const handleRemoveNewImage = (
    index,
  ) => {
    setNewImages(
      (previous) =>
        previous.filter(
          (
            _,
            imageIndex,
          ) =>
            imageIndex !==
            index,
        ),
    );

    setPreviewNewImages(
      (previous) =>
        previous.filter(
          (
            _,
            imageIndex,
          ) =>
            imageIndex !==
            index,
        ),
    );
  };

  const refreshExistingImages = async () => {
    const response =
      await getProductImages(id);

    const loadedImages =
      response?.data?.images ||
      response?.data?.productImages ||
      response?.images ||
      response?.productImages ||
      response?.data?.data?.images ||
      (Array.isArray(response)
        ? response
        : []);

    const imagesData =
      Array.isArray(loadedImages)
        ? loadedImages
        : [];

    setExistingImages(imagesData);

    const primary =
      imagesData.find(
        (image) =>
          image.isPrimary === true,
      ) ||
      imagesData[0] ||
      null;

    setPrimaryImage(
      primary?.imageUrl || "",
    );

    setPrimaryImageId(
      primary?._id || "",
    );

    return imagesData;
  };

  const handleSelectExistingPrimary =
    async (image) => {
      if (
        !image?._id ||
        settingPrimaryImageId
      ) {
        return;
      }

      try {
        setSettingPrimaryImageId(
          image._id,
        );

        setError("");

        await api.put(
          `/product-images/${image._id}/primary`,
          {
            productId: id,
          },
        );

        setExistingImages(
          (previous) =>
            previous.map(
              (currentImage) => ({
                ...currentImage,

                isPrimary:
                  currentImage._id ===
                  image._id,
              }),
            ),
        );

        setPrimaryImage(
          image.imageUrl || "",
        );

        setPrimaryImageId(
          image._id,
        );
      } catch (error) {
        console.error(error);

        setError(
          error?.response?.data
            ?.message ||
            "Failed to set primary image.",
        );
      } finally {
        setSettingPrimaryImageId(
          "",
        );
      }
    };

  const handleDeleteExistingImage =
    async (image) => {
      if (
        !image?._id ||
        deletingImageId
      ) {
        return;
      }

      const confirmed =
        window.confirm(
          "Delete this product image?",
        );

      if (!confirmed) {
        return;
      }

      try {
        setDeletingImageId(
          image._id,
        );

        setError("");

        await api.delete(
          `/product-images/${image._id}`,
        );

        await refreshExistingImages();
      } catch (error) {
        console.error(error);

        setError(
          error?.response?.data
            ?.message ||
            "Failed to delete product image.",
        );
      } finally {
        setDeletingImageId(
          "",
        );
      }
    };

  const handleSubmit = async (
    event,
  ) => {
    event.preventDefault();

    setError("");

    setSuccessMessage("");

    if (
      formData.technologyRequired &&
      selectedTechnologyModels.length ===
        0
    ) {
      setError(
        "This product requires technology. Select at least one technology model.",
      );

      return;
    }

    setIsSaving(true);

    try {
      await updateProduct(
        id,

        {
          name:
            formData.name,

          shortDescription:
            formData.shortDescription,

          description:
            formData.description,

          category:
            formData.category,

          price:
            Number(
              formData.price,
            ),

          costPrice:
            Number(
              formData.costPrice,
            ),

          comparePrice:
            Number(
              formData.comparePrice,
            ) || 0,

          stock:
            Number(
              formData.stock,
            ),

          material:
            formData.material,

          color:
            formData.color,

          weight:
            Number(
              formData.weight,
            ) || 0,

          featured:
            formData.featured,

          bestSeller:
            formData.bestSeller,

          newArrival:
            formData.newArrival,

          tags: formData.tags
            .split(",")
            .map((tag) =>
              tag.trim(),
            )
            .filter(Boolean),

          seoTitle:
            formData.seoTitle,

          seoDescription:
            formData.seoDescription,

          seoSlug:
            formData.seoSlug,

          preparationDays:
            Number(
              formData.preparationDays,
            ) || 0,

          careInstructions:
            formData.careInstructions,

          isCustomizable:
            formData.isCustomizable,

          technologyRequired:
            formData.technologyRequired,

          status:
            formData.status,

          technologyModels:
            selectedTechnologyModels,

          primaryImage,
        },
      );

      for (
        let index = 0;
        index <
        selectedTechnologyModels.length;
        index += 1
      ) {
        const modelId =
          selectedTechnologyModels[
            index
          ];

        const priceData =
          technologyPrices[
            modelId
          ];

        const extraPrice =
          Number(
            priceData
              ?.extraPrice || 0,
          );

        if (
          priceData?.relationId
        ) {
          await updateProductTechnology(
            priceData.relationId,

            {
              extraPrice,

              displayOrder:
                index,
            },
          );
        } else {
          await createProductTechnology(
            {
              product:
                id,

              technologyModel:
                modelId,

              extraPrice,

              isDefault:
                false,

              isSelectable:
                true,

              displayOrder:
                index,

              status:
                "active",
            },
          );
        }
      }

      let uploadedPrimaryImage =
        primaryImage;

      let uploadedPrimaryImageId =
        primaryImageId;

      for (
        let i = 0;
        i < newImages.length;
        i += 1
      ) {
        const imageFile =
          newImages[i];

        const form =
          new FormData();

        form.append(
          "image",
          imageFile,
        );

        const upload =
          await uploadImage(form);

        const uploadedImage =
          upload?.image ||
          upload?.data?.image ||
          upload?.data?.data?.image ||
          "";

        if (!uploadedImage) {
          throw new Error(
            "Image upload completed without returning an image path.",
          );
        }

        const shouldBePrimary =
          !uploadedPrimaryImage &&
          i === 0;

        const createdImageResponse =
          await createProductImage({
            product: id,

            imageUrl:
              uploadedImage,

            isPrimary:
              shouldBePrimary,

            sortOrder:
              existingImages.length +
              i,
          });

        const createdImage =
          createdImageResponse?.data
            ?.image ||
          createdImageResponse?.image ||
          createdImageResponse?.data
            ?.data?.image ||
          null;

        if (
          shouldBePrimary
        ) {
          uploadedPrimaryImage =
            uploadedImage;

          uploadedPrimaryImageId =
            createdImage?._id || "";
        }
      }

      if (
        uploadedPrimaryImage
      ) {
        await updateProduct(
          id,
          {
            primaryImage:
              uploadedPrimaryImage,
          },
        );
      }

      if (
        uploadedPrimaryImageId
      ) {
        await api.put(
          `/product-images/${uploadedPrimaryImageId}/primary`,
          {
            productId: id,
          },
        );
      }

      setSuccessMessage(
        "Product updated successfully.",
      );

      setTimeout(() => {
        navigate(
          "/admin/products",
        );
      }, 800);
    } catch (error) {
      console.error(error);

      setError(
        error?.response?.data
          ?.message ||
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
              Preparing product
              information
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
            <span className="text-antique-gold">
              ←
            </span>

            Back to Products
          </Link>
        </div>
      </header>

      <main className="relative mx-auto max-w-[1500px] px-6 py-10 sm:px-8 lg:px-10 lg:py-12">
        {error && (
          <div className="mb-8 flex items-center justify-between rounded-[16px] border border-antique-gold/25 bg-soft-cream/85 px-5 py-4 text-[10px] text-antique-gold">
            <span>
              {error}
            </span>

            <button
              type="button"
              onClick={() =>
                setError("")
              }
            >
              ×
            </button>
          </div>
        )}

        {successMessage && (
          <div className="mb-8 rounded-[16px] border border-classic-gold/25 bg-soft-cream/85 px-5 py-4 text-[10px] text-antique-gold">
            {successMessage}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="relative grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_380px]"
        >
          <div className="space-y-8">
            <section className="overflow-hidden rounded-[26px] border border-light-champagne/90 bg-soft-white/85 shadow-[0_16px_46px_rgba(7,19,31,0.05)]">
              <div className="border-b border-light-champagne/80 bg-warm-ivory/50 px-7 py-6 sm:px-9">
                <div className="flex items-center gap-3">
                  <span className="text-antique-gold">
                    01
                  </span>

                  <span className="h-px w-8 bg-antique-gold" />

                  <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-steel-gray">
                    Product Details
                  </span>
                </div>

                <h2 className="mt-3 font-serif text-[1.55rem]">
                  Edit your piece
                </h2>
              </div>

              <div className="space-y-6 p-7 sm:p-9">
                <div>
                  <label className="mb-2.5 block text-[8px] font-semibold uppercase">
                    Product Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={
                      formData.name
                    }
                    onChange={
                      handleChange
                    }
                    required
                    className="w-full rounded-[13px] border border-light-champagne bg-warm-ivory/60 px-4 py-3.5 text-[11px] outline-none focus:border-classic-gold"
                  />
                </div>

                <div>
                  <label className="mb-2.5 block text-[8px] font-semibold uppercase">
                    Short Description
                  </label>

                  <input
                    type="text"
                    name="shortDescription"
                    value={
                      formData.shortDescription
                    }
                    onChange={
                      handleChange
                    }
                    className="w-full rounded-[13px] border border-light-champagne bg-warm-ivory/60 px-4 py-3.5 text-[11px]"
                  />
                </div>

                <div>
                  <label className="mb-2.5 block text-[8px] font-semibold uppercase">
                    Description
                  </label>

                  <textarea
                    rows={6}
                    name="description"
                    value={
                      formData.description
                    }
                    onChange={
                      handleChange
                    }
                    required
                    className="w-full resize-none rounded-[13px] border border-light-champagne bg-warm-ivory/60 px-4 py-3.5 text-[11px]"
                  />
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2.5 block text-[8px] font-semibold uppercase">
                      Category
                    </label>

                    <select
                      name="category"
                      value={
                        formData.category
                      }
                      onChange={
                        handleChange
                      }
                      required
                      className="w-full rounded-[13px] border border-light-champagne bg-warm-ivory/60 px-4 py-3.5 text-[11px]"
                    >
                      <option value="">
                        Select Category
                      </option>

                      {categories.map(
                        (category) => (
                          <option
                            key={
                              category._id
                            }
                            value={
                              category._id
                            }
                          >
                            {
                              category.name
                            }
                          </option>
                        ),
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2.5 block text-[8px] font-semibold uppercase">
                      SKU
                    </label>

                    <div className="flex min-h-[49px] items-center rounded-[13px] border border-dashed border-champagne-gold/40 bg-soft-cream px-4">
                      <div>
                        <p className="text-[10px] font-semibold text-midnight-navy">
                          Generated Automatically
                        </p>

                        <p className="mt-1 text-[8px] text-steel-gray">
                          SKU is managed automatically by the system and cannot be edited here.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="overflow-hidden rounded-[26px] border border-light-champagne/90 bg-soft-white/85 shadow-[0_16px_46px_rgba(7,19,31,0.05)]">
              <div className="border-b border-light-champagne/80 bg-warm-ivory/50 px-7 py-6 sm:px-9">
                <div className="flex items-center gap-3">
                  <span className="text-antique-gold">
                    02
                  </span>

                  <span className="h-px w-8 bg-antique-gold" />

                  <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-steel-gray">
                    Pricing & Inventory
                  </span>
                </div>

                <h2 className="mt-3 font-serif text-[1.55rem]">
                  Pricing & availability
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-6 p-7 sm:grid-cols-2 sm:p-9 xl:grid-cols-5">
                <div>
                  <label className="mb-2.5 block text-[8px] font-semibold uppercase">
                    Selling Price
                  </label>

                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      name="price"
                      value={
                        formData.price
                      }
                      onChange={
                        handleChange
                      }
                      required
                      className="w-full rounded-[13px] border border-light-champagne bg-warm-ivory/60 px-4 py-3.5 pr-14 text-[11px]"
                    />

                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-antique-gold">
                      EGP
                    </span>
                  </div>
                </div>

                <div>
                  <label className="mb-2.5 block text-[8px] font-semibold uppercase text-midnight-navy">
                    Product Cost
                  </label>

                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      name="costPrice"
                      value={
                        formData.costPrice
                      }
                      onChange={
                        handleChange
                      }
                      required
                      className="w-full rounded-[13px] border border-champagne-gold/35 bg-soft-cream px-4 py-3.5 pr-14 text-[11px] outline-none focus:border-classic-gold"
                    />

                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-antique-gold">
                      EGP
                    </span>
                  </div>

                  <p className="mt-2 text-[8px] text-steel-gray">
                    Jewelry piece cost only
                  </p>
                </div>

                <div>
                  <label className="mb-2.5 block text-[8px] font-semibold uppercase">
                    Compare Price
                  </label>

                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      name="comparePrice"
                      value={
                        formData.comparePrice
                      }
                      onChange={
                        handleChange
                      }
                      className="w-full rounded-[13px] border border-light-champagne bg-warm-ivory/60 px-4 py-3.5 pr-14 text-[11px]"
                    />

                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-antique-gold">
                      EGP
                    </span>
                  </div>
                </div>

                <div>
                  <label className="mb-2.5 block text-[8px] font-semibold uppercase">
                    Stock
                  </label>

                  <input
                    type="number"
                    min="0"
                    name="stock"
                    value={
                      formData.stock
                    }
                    onChange={
                      handleChange
                    }
                    required
                    className="w-full rounded-[13px] border border-light-champagne bg-warm-ivory/60 px-4 py-3.5 text-[11px]"
                  />
                </div>

                <div>
                  <label className="mb-2.5 block text-[8px] font-semibold uppercase">
                    Weight
                  </label>

                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      name="weight"
                      value={
                        formData.weight
                      }
                      onChange={
                        handleChange
                      }
                      className="w-full rounded-[13px] border border-light-champagne bg-warm-ivory/60 px-4 py-3.5 pr-10 text-[11px]"
                    />

                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-steel-gray">
                      g
                    </span>
                  </div>
                </div>
              </div>
            </section>

            <section className="overflow-hidden rounded-[26px] border border-light-champagne/90 bg-soft-white/85">
              <div className="border-b border-light-champagne/80 bg-warm-ivory/50 px-7 py-6 sm:px-9">
                <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-steel-gray">
                  03 · Details
                </span>
              </div>

              <div className="space-y-6 p-7 sm:p-9">
                <div className="grid gap-5 md:grid-cols-3">
                  <input
                    type="text"
                    name="material"
                    value={
                      formData.material
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Material"
                    className="rounded-[13px] border border-light-champagne bg-warm-ivory/60 px-4 py-3.5"
                  />

                  <input
                    type="text"
                    name="color"
                    value={
                      formData.color
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Color"
                    className="rounded-[13px] border border-light-champagne bg-warm-ivory/60 px-4 py-3.5"
                  />

                  <input
                    type="number"
                    min="0"
                    name="preparationDays"
                    value={
                      formData.preparationDays
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Preparation Days"
                    className="rounded-[13px] border border-light-champagne bg-warm-ivory/60 px-4 py-3.5"
                  />
                </div>

                <input
                  type="text"
                  name="tags"
                  value={
                    formData.tags
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="gold, ring, luxury, gift"
                  className="w-full rounded-[13px] border border-light-champagne bg-warm-ivory/60 px-4 py-3.5"
                />

                <textarea
                  rows={4}
                  name="careInstructions"
                  value={
                    formData.careInstructions
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Care instructions"
                  className="w-full rounded-[13px] border border-light-champagne bg-warm-ivory/60 px-4 py-3.5"
                />

                <label className="flex items-center justify-between rounded-[16px] border border-light-champagne bg-warm-ivory/60 p-5">
                  <div>
                    <p className="text-[10px] font-semibold">
                      Customizable
                      Product
                    </p>

                    <p className="mt-1 text-[8px] text-steel-gray">
                      Allow customers to
                      customize this piece.
                    </p>
                  </div>

                  <input
                    type="checkbox"
                    name="isCustomizable"
                    checked={
                      formData.isCustomizable
                    }
                    onChange={
                      handleChange
                    }
                    className="h-4 w-4 accent-classic-gold"
                  />
                </label>

                <label
                  className={`flex items-center justify-between rounded-[16px] border p-5 transition-all ${
                    formData.technologyRequired
                      ? "border-champagne-gold/60 bg-soft-cream"
                      : "border-light-champagne bg-warm-ivory/60"
                  }`}
                >
                  <div className="pr-5">
                    <div className="flex items-center gap-2">
                      <span className="text-classic-gold">
                        ✦
                      </span>

                      <p className="text-[10px] font-semibold text-midnight-navy">
                        Technology Required for Order
                      </p>
                    </div>

                    <p className="mt-1.5 max-w-xl text-[8px] leading-5 text-steel-gray">
                      When enabled, this product is marked as a piece that must be ordered with a technology selection. We are storing this rule now so it can be enforced later in Product Details, Cart and Checkout.
                    </p>
                  </div>

                  <input
                    type="checkbox"
                    name="technologyRequired"
                    checked={
                      formData.technologyRequired
                    }
                    onChange={
                      handleChange
                    }
                    className="h-5 w-5 shrink-0 accent-classic-gold"
                  />
                </label>
              </div>
            </section>

            <section className="overflow-hidden rounded-[26px] border border-light-champagne/90 bg-soft-white/85">
              <div className="border-b border-light-champagne/80 bg-warm-ivory/50 px-7 py-6 sm:px-9">
                <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-steel-gray">
                  04 · Technology
                </span>

                <h2 className="mt-3 font-serif text-[1.55rem]">
                  Technology Models
                </h2>

                <p className="mt-2 max-w-2xl text-[10px] leading-6 text-slate-gray">
                  Select technologies,
                  enter their extra selling
                  prices directly, and use
                  Smart Unit costs as a
                  pricing reference.
                </p>
              </div>

              <div className="space-y-4 p-7 sm:p-9">
                {technologyModels.length ===
                0 ? (
                  <div className="rounded-2xl border border-dashed border-light-champagne p-8 text-center">
                    No technology models
                    available
                  </div>
                ) : (
                  technologyModels.map(
                    (model) => {
                      const selected =
                        selectedTechnologyModels.includes(
                          model._id,
                        );

                      const extraPrice =
                        getExtraPrice(
                          model._id,
                        );

                      const smartUnitInfo =
                        getSmartUnitPriceInfo(
                          model._id,
                        );

                      return (
                        <div
                          key={
                            model._id
                          }
                          className={`rounded-[18px] border p-5 ${
                            selected
                              ? "border-champagne-gold/60 bg-soft-cream"
                              : "border-light-champagne bg-warm-ivory/50"
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <input
                              type="checkbox"
                              checked={
                                selected
                              }
                              onChange={() =>
                                handleTechnologyModelChange(
                                  model._id,
                                )
                              }
                              className="mt-1 h-4 w-4 accent-classic-gold"
                            />

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-col justify-between gap-3 sm:flex-row">
                                <div>
                                  <h3 className="font-semibold text-midnight-navy">
                                    {
                                      model.modelName
                                    }
                                  </h3>

                                  {model.modelCode && (
                                    <p className="mt-1 font-mono text-[8px] uppercase tracking-wider text-antique-gold">
                                      {
                                        model.modelCode
                                      }
                                    </p>
                                  )}

                                  {model
                                    .technology
                                    ?.name && (
                                    <p className="mt-2 text-[8px] text-steel-gray">
                                      Technology:{" "}
                                      {
                                        model
                                          .technology
                                          .name
                                      }
                                    </p>
                                  )}
                                </div>

                                <span className="h-fit rounded-full bg-soft-cream px-3 py-1 text-[7px] uppercase text-antique-gold">
                                  {model.status ||
                                    "active"}
                                </span>
                              </div>

                              <div className="mt-4 flex flex-wrap gap-2">
                                {model.requiresBattery && (
                                  <span className="rounded-full border border-champagne-gold/40 bg-soft-cream px-3 py-1 text-[8px] text-antique-gold">
                                    Battery
                                  </span>
                                )}

                                {model.requiresActivation && (
                                  <span className="rounded-full border border-champagne-gold/40 bg-soft-cream px-3 py-1 text-[8px] text-antique-gold">
                                    Activation
                                  </span>
                                )}

                                {model.requiresSubscription && (
                                  <span className="rounded-full border border-champagne-gold/40 bg-soft-cream px-3 py-1 text-[8px] text-antique-gold">
                                    Subscription
                                  </span>
                                )}
                              </div>

                              <div className="mt-4 rounded-[14px] border border-dashed border-champagne-gold/35 bg-warm-ivory/75 p-4">
                                <p className="text-[7px] font-semibold uppercase tracking-[0.17em] text-antique-gold">
                                  Smart Unit Cost
                                  Reference
                                </p>

                                {smartUnitInfo.min !==
                                null ? (
                                  <>
                                    <p className="mt-2 font-serif text-[1.1rem] text-midnight-navy">
                                      {smartUnitInfo.min ===
                                      smartUnitInfo.max
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
                                      {
                                        smartUnitInfo.count
                                      }{" "}
                                      Smart Unit
                                      type(s) ·{" "}
                                      {
                                        smartUnitInfo.availableStock
                                      }{" "}
                                      available
                                      physical
                                      unit(s)
                                    </p>
                                  </>
                                ) : (
                                  <p className="mt-2 text-[9px] text-steel-gray">
                                    No Smart Unit
                                    cost registered
                                    for this
                                    technology
                                    model.
                                  </p>
                                )}
                              </div>

                              {selected && (
                                <div className="mt-5 rounded-xl border border-champagne-gold/30 bg-soft-white p-4">
                                  <label className="mb-2.5 block text-[8px] font-semibold uppercase">
                                    Extra Price
                                  </label>

                                  <p className="mb-3 text-[8px] text-steel-gray">
                                    Type or paste
                                    the complete
                                    price directly.
                                  </p>

                                  <div className="relative">
                                    <input
                                      type="text"
                                      inputMode="decimal"
                                      value={
                                        extraPrice
                                      }
                                      onChange={(
                                        event,
                                      ) =>
                                        handleExtraPriceChange(
                                          model._id,
                                          event
                                            .target
                                            .value,
                                        )
                                      }
                                      placeholder="e.g. 1500"
                                      className="w-full rounded-xl border border-light-champagne bg-soft-white px-4 py-3 pr-14 text-sm outline-none focus:border-classic-gold"
                                    />

                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-antique-gold">
                                      EGP
                                    </span>
                                  </div>

                                  <div className="mt-4 rounded-xl bg-soft-cream/75 p-4">
                                    <div className="flex justify-between text-[8px] text-steel-gray">
                                      <span>
                                        Product
                                        Price
                                      </span>

                                      <span>
                                        {formatMoney(
                                          formData.price,
                                        )}{" "}
                                        EGP
                                      </span>
                                    </div>

                                    <div className="mt-2 flex justify-between text-[8px] text-steel-gray">
                                      <span>
                                        Extra Price
                                      </span>

                                      <span>
                                        {formatMoney(
                                          extraPrice,
                                        )}{" "}
                                        EGP
                                      </span>
                                    </div>

                                    <div className="mt-3 flex justify-between border-t border-light-champagne pt-3 text-[10px] font-semibold">
                                      <span>
                                        Final Price
                                      </span>

                                      <span className="text-antique-gold">
                                        {formatMoney(
                                          Number(
                                            formData.price ||
                                              0,
                                          ) +
                                            Number(
                                              extraPrice ||
                                                0,
                                            ),
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
                    },
                  )
                )}
              </div>
            </section>

            <section className="overflow-hidden rounded-[26px] border border-light-champagne/90 bg-soft-white/85">
              <div className="border-b border-light-champagne/80 bg-warm-ivory/50 px-7 py-6 sm:px-9">
                <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-steel-gray">
                  05 · Media
                </span>

                <h2 className="mt-3 font-serif text-[1.55rem]">
                  Product Images
                </h2>

                <p className="mt-2 max-w-2xl text-[9px] leading-5 text-slate-gray">
                  Existing images are loaded from ProductImage records. You can make any current image primary, delete it, or upload additional images.
                </p>
              </div>

              <div className="p-7 sm:p-9">
                {existingImages.length > 0 ? (
                  <div>
                    <div className="mb-4 flex items-center justify-between gap-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-steel-gray">
                        Current Images
                      </p>

                      <span className="rounded-full border border-light-champagne bg-soft-cream px-3 py-1.5 text-[7px] font-semibold uppercase tracking-[0.13em] text-antique-gold">
                        {existingImages.length} image{existingImages.length === 1 ? "" : "s"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                      {existingImages.map(
                        (
                          image,
                          index,
                        ) => {
                          const imageUrl =
                            image.imageUrl ||
                            image.url ||
                            image.image ||
                            "";

                          const isPrimary =
                            image.isPrimary ===
                              true ||
                            primaryImageId ===
                              image._id ||
                            (
                              !primaryImageId &&
                              primaryImage ===
                                imageUrl
                            );

                          const displayUrl =
                            getImageUrl(
                              imageUrl,
                            );

                          const isDeleting =
                            deletingImageId ===
                            image._id;

                          const isSettingPrimary =
                            settingPrimaryImageId ===
                            image._id;

                          return (
                            <div
                              key={
                                image._id ||
                                index
                              }
                              className={`group overflow-hidden rounded-2xl border bg-soft-white transition-all ${
                                isPrimary
                                  ? "border-antique-gold ring-2 ring-classic-gold/20"
                                  : "border-light-champagne"
                              }`}
                            >
                              <div className="relative aspect-square overflow-hidden bg-soft-cream">
                                {displayUrl ? (
                                  <img
                                    src={
                                      displayUrl
                                    }
                                    alt={
                                      formData.name ||
                                      `Product image ${index + 1}`
                                    }
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full items-center justify-center text-[9px] text-steel-gray">
                                    No Image
                                  </div>
                                )}

                                {isPrimary && (
                                  <span className="absolute left-3 top-3 rounded-full bg-midnight-navy px-3 py-1 text-[7px] font-semibold uppercase tracking-[0.12em] text-champagne-gold shadow">
                                    Primary
                                  </span>
                                )}

                                <button
                                  type="button"
                                  disabled={
                                    isDeleting
                                  }
                                  onClick={() =>
                                    handleDeleteExistingImage(
                                      image,
                                    )
                                  }
                                  className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-soft-white/40 bg-midnight-navy/90 text-[14px] text-soft-white shadow backdrop-blur transition hover:bg-rich-navy disabled:cursor-not-allowed disabled:opacity-50"
                                  aria-label="Delete image"
                                >
                                  {isDeleting
                                    ? "…"
                                    : "×"}
                                </button>
                              </div>

                              <div className="p-3">
                                <button
                                  type="button"
                                  disabled={
                                    isPrimary ||
                                    isSettingPrimary
                                  }
                                  onClick={() =>
                                    handleSelectExistingPrimary(
                                      image,
                                    )
                                  }
                                  className={`flex min-h-[36px] w-full items-center justify-center rounded-xl border px-3 text-[7px] font-semibold uppercase tracking-[0.12em] transition-all ${
                                    isPrimary
                                      ? "border-champagne-gold/30 bg-soft-cream text-antique-gold"
                                      : "border-light-champagne bg-soft-white text-midnight-navy hover:border-champagne-gold/50 hover:bg-warm-ivory"
                                  } disabled:cursor-not-allowed disabled:opacity-70`}
                                >
                                  {isPrimary
                                    ? "Primary Image"
                                    : isSettingPrimary
                                      ? "Setting..."
                                      : "Make Primary"}
                                </button>
                              </div>
                            </div>
                          );
                        },
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-[18px] border border-dashed border-light-champagne bg-warm-ivory/40 px-6 py-8 text-center">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-steel-gray">
                      No existing ProductImage records
                    </p>

                    <p className="mt-2 text-[9px] leading-5 text-slate-gray">
                      Upload images below. The first image will automatically become primary when the product has no primary image.
                    </p>
                  </div>
                )}

                <div
                  className={
                    existingImages.length
                      ? "mt-8"
                      : "mt-5"
                  }
                >
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-[18px] border border-dashed border-champagne-gold/40 bg-warm-ivory/55 px-6 py-12 transition hover:border-classic-gold hover:bg-soft-cream">
                    <div className="text-2xl text-classic-gold">
                      +
                    </div>

                    <p className="mt-4 text-[10px] font-semibold">
                      Upload Product Images
                    </p>

                    <p className="mt-2 text-[8px] text-steel-gray">
                      JPG, PNG, WEBP or GIF
                    </p>

                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={
                        handleImageChange
                      }
                      className="hidden"
                    />
                  </label>
                </div>

                {previewNewImages.length > 0 && (
                  <div className="mt-7">
                    <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.25em] text-steel-gray">
                      New Images
                    </p>

                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                      {previewNewImages.map(
                        (
                          image,
                          index,
                        ) => (
                          <div
                            key={`${image}-${index}`}
                            className="overflow-hidden rounded-2xl border border-light-champagne bg-soft-white"
                          >
                            <div className="relative aspect-square">
                              <img
                                src={
                                  image
                                }
                                alt={`New product image ${index + 1}`}
                                className="h-full w-full object-cover"
                              />

                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveNewImage(
                                    index,
                                  )
                                }
                                className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-midnight-navy text-white shadow"
                                aria-label="Remove new image"
                              >
                                ×
                              </button>

                              {!primaryImage &&
                                index === 0 && (
                                <span className="absolute bottom-3 left-3 rounded-full bg-midnight-navy px-3 py-1 text-[7px] font-semibold uppercase tracking-[0.12em] text-champagne-gold">
                                  Will Become Primary
                                </span>
                              )}
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}
              </div>
            </section>

            <section className="overflow-hidden rounded-[26px] border border-light-champagne/90 bg-soft-white/85">
              <div className="border-b border-light-champagne/80 bg-warm-ivory/50 px-7 py-6 sm:px-9">
                <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-steel-gray">
                  06 · SEO
                </span>
              </div>

              <div className="space-y-5 p-7 sm:p-9">
                <input
                  type="text"
                  name="seoTitle"
                  value={
                    formData.seoTitle
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="SEO Title"
                  className="w-full rounded-[13px] border border-light-champagne bg-warm-ivory/60 px-4 py-3.5"
                />

                <input
                  type="text"
                  name="seoSlug"
                  value={
                    formData.seoSlug
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="SEO Slug"
                  className="w-full rounded-[13px] border border-light-champagne bg-warm-ivory/60 px-4 py-3.5"
                />

                <textarea
                  rows={4}
                  name="seoDescription"
                  value={
                    formData.seoDescription
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="SEO Description"
                  className="w-full rounded-[13px] border border-light-champagne bg-warm-ivory/60 px-4 py-3.5"
                />
              </div>
            </section>
          </div>

          <aside className="space-y-6 xl:sticky xl:top-28 xl:self-start">
            <div className="rounded-[26px] bg-midnight-navy p-7 text-soft-white">
              <p className="text-[9px] uppercase tracking-[0.3em] text-champagne-gold">
                Product Status
              </p>

              <select
                name="status"
                value={
                  formData.status
                }
                onChange={
                  handleChange
                }
                className="mt-5 w-full rounded-xl border border-champagne-gold/20 bg-rich-navy px-4 py-3"
              >
                <option value="active">
                  Active
                </option>

                <option value="inactive">
                  Inactive
                </option>
              </select>
            </div>

            <div className="rounded-[22px] border border-light-champagne bg-soft-white p-6">
              <h3 className="font-semibold">
                Marketing
              </h3>

              <div className="mt-5 space-y-3">
                {[
                  [
                    "featured",
                    "Featured",
                  ],

                  [
                    "bestSeller",
                    "Best Seller",
                  ],

                  [
                    "newArrival",
                    "New Arrival",
                  ],
                ].map(
                  ([
                    name,
                    label,
                  ]) => (
                    <label
                      key={name}
                      className="flex items-center justify-between rounded-xl border border-light-champagne p-4"
                    >
                      <span>
                        {label}
                      </span>

                      <input
                        type="checkbox"
                        name={
                          name
                        }
                        checked={
                          formData[
                            name
                          ]
                        }
                        onChange={
                          handleChange
                        }
                        className="h-4 w-4 accent-classic-gold"
                      />
                    </label>
                  ),
                )}
              </div>
            </div>

            <div className="rounded-[22px] border border-light-champagne bg-soft-white p-6">
              <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-steel-gray">
                Pricing Summary
              </p>

              <div className="mt-5 space-y-4">
                <div className="flex justify-between border-b border-light-champagne pb-4">
                  <span className="text-[10px] text-slate-gray">
                    Selling Price
                  </span>

                  <span className="font-semibold text-antique-gold">
                    {formData.price
                      ? `${formData.price} EGP`
                      : "—"}
                  </span>
                </div>

                <div className="flex justify-between border-b border-light-champagne pb-4">
                  <span className="text-[10px] text-slate-gray">
                    Product Cost
                  </span>

                  <span className="font-semibold text-midnight-navy">
                    {formData.costPrice !==
                    ""
                      ? `${formData.costPrice} EGP`
                      : "—"}
                  </span>
                </div>

                <div className="flex justify-between border-b border-light-champagne pb-4">
                  <span className="text-[10px] text-slate-gray">
                    Technology Models
                  </span>

                  <span className="font-semibold">
                    {
                      selectedTechnologyModels.length
                    }
                  </span>
                </div>

                <div className="flex justify-between border-b border-light-champagne pb-4">
                  <span className="text-[10px] text-slate-gray">
                    Current Images
                  </span>

                  <span className="font-semibold">
                    {
                      existingImages.length
                    }
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-[10px] text-slate-gray">
                    New Images
                  </span>

                  <span className="font-semibold">
                    {
                      newImages.length
                    }
                  </span>
                </div>
              </div>
            </div>
          </aside>

          <div className="xl:col-span-2">
            <div className="rounded-[22px] border border-light-champagne bg-soft-white p-6 sm:p-8">
              <div className="flex flex-col-reverse gap-4 sm:flex-row sm:justify-end">
                <Link
                  to="/admin/products"
                  className="inline-flex min-h-[48px] items-center justify-center rounded-[13px] border border-light-champagne bg-soft-white px-7 text-[8px] font-semibold uppercase"
                >
                  Cancel
                </Link>

                <button
                  type="submit"
                  disabled={
                    isSaving
                  }
                  className="inline-flex min-h-[48px] min-w-[210px] items-center justify-center rounded-[13px] bg-midnight-navy px-8 text-[8px] font-semibold uppercase text-soft-white disabled:opacity-50"
                >
                  {isSaving
                    ? "Updating Product..."
                    : "Update Product"}
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