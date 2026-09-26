import { useEffect, useState } from "react";

import { Link, useNavigate, useParams } from "react-router-dom";

import { useTranslation } from "react-i18next";

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
  deleteProductTechnology,
} from "../services/productTechnologyApi";

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
      typeof window !== "undefined" ? window.location.protocol : "https:";

    return `${protocol}${image}`;
  }

  if (image.startsWith("/api/uploads/")) {
    image = image.replace(/^\/api/, "");
  }

  if (image.startsWith("/assets/") || image.startsWith("/images/")) {
    return image;
  }

  return `${BACKEND_URL}${image.startsWith("/") ? "" : "/"}${image}`;
};


const createLocalizedField = (en = "", ar = "") => ({
  en: String(en ?? ""),
  ar: String(ar ?? ""),
});

const normalizeLocalizedField = (value) => {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return {
      en: String(value.en ?? ""),
      ar: String(value.ar ?? ""),
    };
  }

  if (value === undefined || value === null) {
    return {
      en: "",
      ar: "",
    };
  }

  return {
    en: String(value),
    ar: String(value),
  };
};

const normalizeLocalizedTags = (value) => {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return {
      en: Array.isArray(value.en)
        ? value.en.join(", ")
        : String(value.en ?? ""),
      ar: Array.isArray(value.ar)
        ? value.ar.join(", ")
        : String(value.ar ?? ""),
    };
  }

  if (Array.isArray(value)) {
    const tags = value.join(", ");

    return {
      en: tags,
      ar: tags,
    };
  }

  if (value === undefined || value === null) {
    return {
      en: "",
      ar: "",
    };
  }

  return {
    en: String(value),
    ar: String(value),
  };
};

const getLocalizedValue = (value, language = "en") => {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value[language] || value.en || value.ar || "";
  }

  return value || "";
};
const compressImage = (file, maxSize = 1600, quality = 0.82) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;

      if (width > maxSize || height > maxSize) {
        if (width > height) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        } else {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Image compression failed."));
            return;
          }

          const fileName = file.name.replace(/\.[^/.]+$/, "");

          resolve(
            new File([blob], `${fileName}.webp`, {
              type: "image/webp",
              lastModified: Date.now(),
            }),
          );
        },
        "image/webp",
        quality,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load image."));
    };

    img.src = objectUrl;
  });
};
const EditProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [categories, setCategories] = useState([]);
  const [technologyModels, setTechnologyModels] = useState([]);
  const [smartUnits, setSmartUnits] = useState([]);

  const [selectedTechnologyModels, setSelectedTechnologyModels] = useState([]);

  const [technologyPrices, setTechnologyPrices] = useState({});
const [initialTechnologyState, setInitialTechnologyState] = useState({
  technologyRequired: false,
  selectedModels: [],
  prices: {},
});
  const [existingImages, setExistingImages] = useState([]);
  const [primaryImage, setPrimaryImage] = useState("");
  const [primaryImageId, setPrimaryImageId] = useState("");

  const [deletingImageId, setDeletingImageId] = useState("");
  const [settingPrimaryImageId, setSettingPrimaryImageId] = useState("");

  const [newImages, setNewImages] = useState([]);
  const [previewNewImages, setPreviewNewImages] = useState([]);

  const [activeLanguage, setActiveLanguage] = useState("en");

  const [formData, setFormData] = useState({
    name: createLocalizedField(),
    shortDescription: createLocalizedField(),
    description: createLocalizedField(),

    category: "",

    price: "",
    costPrice: "",
    comparePrice: "",
    stock: "",

    material: createLocalizedField(),
    color: createLocalizedField(),

    weight: "",

    featured: false,
    bestSeller: false,
    newArrival: false,

    tags: createLocalizedField(),

    seoTitle: createLocalizedField(),
    seoDescription: createLocalizedField(),
    seoSlug: createLocalizedField(),

    preparationDays: "",

    careInstructions: createLocalizedField(),

    isCustomizable: false,
    technologyRequired: false,

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

        const smartUnitsData =
          smartUnitsResponse?.data?.smartUnits ||
          smartUnitsResponse?.smartUnits ||
          [];

        setSmartUnits(Array.isArray(smartUnitsData) ? smartUnitsData : []);

        const product =
          productResponse?.data?.product || productResponse?.product;

        if (!product) {
          throw new Error("Product not found.");
        }

        const loadedImages =
          productImagesResponse?.data?.images ||
          productImagesResponse?.data?.productImages ||
          productImagesResponse?.images ||
          productImagesResponse?.productImages ||
          productImagesResponse?.data?.data?.images ||
          (Array.isArray(productImagesResponse) ? productImagesResponse : []);

        const imagesData = Array.isArray(loadedImages) ? loadedImages : [];

        setExistingImages(imagesData);

        const productPrimaryImage = product.primaryImage || "";

        const primaryFromImages =
          imagesData.find((image) => image.isPrimary === true) ||
          imagesData.find((image) => image.imageUrl === productPrimaryImage) ||
          imagesData[0] ||
          null;

        setPrimaryImage(
          primaryFromImages?.imageUrl || productPrimaryImage || "",
        );

        setPrimaryImageId(primaryFromImages?._id || "");

        setFormData({
          name: normalizeLocalizedField(product.name),

          shortDescription: normalizeLocalizedField(product.shortDescription),

          description: normalizeLocalizedField(product.description),

          category: product.category?._id || product.category || "",

          price: product.price ?? "",

          costPrice: product.costPrice ?? "",

          comparePrice: product.comparePrice ?? "",

          stock: product.stock ?? "",

          material: normalizeLocalizedField(product.material),

          color: normalizeLocalizedField(product.color),

          weight: product.weight ?? "",

          featured: Boolean(product.featured),

          bestSeller: Boolean(product.bestSeller),

          newArrival: Boolean(product.newArrival),

          tags: normalizeLocalizedTags(product.tags),

          seoTitle: normalizeLocalizedField(product.seoTitle),

          seoDescription: normalizeLocalizedField(product.seoDescription),

          seoSlug: normalizeLocalizedField(product.seoSlug),

          preparationDays: product.preparationDays ?? "",

          careInstructions: normalizeLocalizedField(product.careInstructions),

          isCustomizable: Boolean(product.isCustomizable),

          technologyRequired: Boolean(product.technologyRequired),

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

            extraPrice:
              relation.extraPrice === undefined || relation.extraPrice === null
                ? ""
                : String(relation.extraPrice),
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
              extraPrice: "",
            };
          });
        }

      setSelectedTechnologyModels(selectedIds);
setTechnologyPrices(prices);

setInitialTechnologyState({
  technologyRequired: Boolean(product.technologyRequired),
  selectedModels: [...selectedIds],
  prices: Object.fromEntries(
    Object.entries(prices).map(([modelId, priceData]) => [
      modelId,
      {
        relationId: priceData?.relationId || "",
        extraPrice: priceData?.extraPrice ?? "",
      },
    ]),
  ),
});
      } catch (error) {
        console.error(error);

        setError(
          error?.response?.data?.message ||
            error?.message ||
            t("editProduct.failedToLoadProduct"),
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

  const handleLocalizedChange = (field, value) => {
    setFormData((previous) => ({
      ...previous,

      [field]: {
        ...previous[field],
        [activeLanguage]: value,
      },
    }));
  };

  const handleTechnologyModelChange = (modelId) => {
    setSelectedTechnologyModels((previous) => {
    if (previous.includes(modelId)) {
  setTechnologyPrices((previousPrices) => {
    const updatedPrices = { ...previousPrices };

    delete updatedPrices[modelId];

    return updatedPrices;
  });

  return previous.filter((selectedId) => selectedId !== modelId);
}

      setTechnologyPrices((previousPrices) => ({
        ...previousPrices,

        [modelId]: {
          relationId: previousPrices[modelId]?.relationId || "",

          extraPrice: previousPrices[modelId]?.extraPrice ?? "",
        },
      }));

      return [...previous, modelId];
    });
  };

  const handleExtraPriceChange = (modelId, value) => {
    const cleanValue = sanitizeMoneyInput(value);

    setTechnologyPrices((previous) => ({
      ...previous,

      [modelId]: {
        ...previous[modelId],

        extraPrice: cleanValue,
      },
    }));
  };

  const getExtraPrice = (modelId) => {
    return technologyPrices[modelId]?.extraPrice ?? "";
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
const handleImageChange = async (event) => {
  const files = Array.from(event.target.files || []);

  if (!files.length) {
    return;
  }

  event.target.value = "";

  try {
    const compressedFiles = await Promise.all(
      files.map((file) => compressImage(file)),
    );

    setNewImages((previous) => [...previous, ...compressedFiles]);

    setPreviewNewImages((previous) => [
      ...previous,
      ...compressedFiles.map((file) => URL.createObjectURL(file)),
    ]);
  } catch (error) {
    console.error("Image compression failed:", error);

    // fallback: use original files if compression fails
    setNewImages((previous) => [...previous, ...files]);

    setPreviewNewImages((previous) => [
      ...previous,
      ...files.map((file) => URL.createObjectURL(file)),
    ]);
  }
};

  const handleRemoveNewImage = (index) => {
    setNewImages((previous) =>
      previous.filter((_, imageIndex) => imageIndex !== index),
    );

    setPreviewNewImages((previous) =>
      previous.filter((_, imageIndex) => imageIndex !== index),
    );
  };

  const refreshExistingImages = async () => {
    const response = await getProductImages(id);

    const loadedImages =
      response?.data?.images ||
      response?.data?.productImages ||
      response?.images ||
      response?.productImages ||
      response?.data?.data?.images ||
      (Array.isArray(response) ? response : []);

    const imagesData = Array.isArray(loadedImages) ? loadedImages : [];

    setExistingImages(imagesData);

    const primary =
      imagesData.find((image) => image.isPrimary === true) ||
      imagesData[0] ||
      null;

    setPrimaryImage(primary?.imageUrl || "");

    setPrimaryImageId(primary?._id || "");

    return imagesData;
  };

  const handleSelectExistingPrimary = async (image) => {
    if (!image?._id || settingPrimaryImageId) {
      return;
    }

    try {
      setSettingPrimaryImageId(image._id);

      setError("");

      await api.put(`/product-images/${image._id}/primary`, {
        productId: id,
      });

      setExistingImages((previous) =>
        previous.map((currentImage) => ({
          ...currentImage,

          isPrimary: currentImage._id === image._id,
        })),
      );

      setPrimaryImage(image.imageUrl || "");

      setPrimaryImageId(image._id);
    } catch (error) {
      console.error(error);

      setError(
        error?.response?.data?.message ||
          t("editProduct.failedToSetPrimaryImage"),
      );
    } finally {
      setSettingPrimaryImageId("");
    }
  };

  const handleDeleteExistingImage = async (image) => {
    if (!image?._id || deletingImageId) {
      return;
    }

    const confirmed = window.confirm(
      t("editProduct.deleteProductImageConfirmation"),
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingImageId(image._id);

      setError("");

      await api.delete(`/product-images/${image._id}`);

      await refreshExistingImages();
    } catch (error) {
      console.error(error);

      setError(
        error?.response?.data?.message ||
          t("editProduct.failedToDeleteProductImage"),
      );
    } finally {
      setDeletingImageId("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccessMessage("");

    if (!formData.name.en.trim() || !formData.name.ar.trim()) {
      setError(t("editProduct.productNameRequiredBothLanguages"));
      setActiveLanguage(!formData.name.en.trim() ? "en" : "ar");
      return;
    }

    if (!formData.description.en.trim() || !formData.description.ar.trim()) {
      setError(t("editProduct.productDescriptionRequiredBothLanguages"));
      setActiveLanguage(!formData.description.en.trim() ? "en" : "ar");
      return;
    }

    if (formData.technologyRequired && selectedTechnologyModels.length === 0) {
      setError(t("editProduct.technologyRequiredSelectModel"));
      return;
    }

    setIsSaving(true);

    try {
      await updateProduct(id, {
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

        category: formData.category,

        price: Number(formData.price),

        costPrice: Number(formData.costPrice),

        comparePrice: Number(formData.comparePrice) || 0,

        stock: Number(formData.stock),

        material: {
          en: formData.material.en.trim(),
          ar: formData.material.ar.trim(),
        },

        color: {
          en: formData.color.en.trim(),
          ar: formData.color.ar.trim(),
        },

        weight: Number(formData.weight) || 0,

        featured: formData.featured,

        bestSeller: formData.bestSeller,

        newArrival: formData.newArrival,

        tags: {
          en: formData.tags.en
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),

          ar: formData.tags.ar
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
        },

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

        preparationDays: Number(formData.preparationDays) || 0,

        careInstructions: {
          en: formData.careInstructions.en.trim(),
          ar: formData.careInstructions.ar.trim(),
        },

        isCustomizable: formData.isCustomizable,

        technologyRequired: formData.technologyRequired,

        status: formData.status,

        technologyModels: formData.technologyRequired
          ? selectedTechnologyModels
          : [],

        primaryImage,
      });
  /* =========================================================
   Product Technology Synchronization
========================================================= */

const initialSelectedModels = new Set(
  initialTechnologyState.selectedModels.map((modelId) => String(modelId)),
);

const currentSelectedModels = new Set(
  selectedTechnologyModels.map((modelId) => String(modelId)),
);

const technologyRequiredChanged =
  Boolean(formData.technologyRequired) !==
  Boolean(initialTechnologyState.technologyRequired);

const selectedModelsChanged =
  initialSelectedModels.size !== currentSelectedModels.size ||
  [...initialSelectedModels].some(
    (modelId) => !currentSelectedModels.has(modelId),
  );

const technologyPricesChanged =
  [...currentSelectedModels].some((modelId) => {
    const initialPrice =
      initialTechnologyState.prices[modelId]?.extraPrice ?? "";

    const currentPrice = technologyPrices[modelId]?.extraPrice ?? "";

    return String(initialPrice) !== String(currentPrice);
  }) ||
  [...initialSelectedModels].some((modelId) => {
    const initialPrice =
      initialTechnologyState.prices[modelId]?.extraPrice ?? "";

    const currentPrice = technologyPrices[modelId]?.extraPrice ?? "";

    return String(initialPrice) !== String(currentPrice);
  });

const technologyChanged =
  technologyRequiredChanged ||
  selectedModelsChanged ||
  technologyPricesChanged;

if (technologyChanged) {
  
  const latestProductTechnologiesResponse =
    await getProductTechnologies(id);

  const latestProductTechnologies =
    latestProductTechnologiesResponse?.data?.productTechnologies ||
    latestProductTechnologiesResponse?.productTechnologies ||
    (Array.isArray(latestProductTechnologiesResponse)
      ? latestProductTechnologiesResponse
      : []);

  const latestRelations = Array.isArray(latestProductTechnologies)
    ? latestProductTechnologies
    : [];

  const relationsByModelId = new Map();

  latestRelations.forEach((relation) => {
    const modelId =
      relation?.technologyModel?._id || relation?.technologyModel;

    if (!modelId) {
      return;
    }

    relationsByModelId.set(String(modelId), relation);
  });

 
  if (!formData.technologyRequired) {
    for (const relation of latestRelations) {
      if (relation?._id) {
        await deleteProductTechnology(relation._id);
      }
    }
  } else {
  
    for (const relation of latestRelations) {
      const relationModelId =
        relation?.technologyModel?._id || relation?.technologyModel;

      if (!relationModelId) {
        continue;
      }

      const modelId = String(relationModelId);

      if (!currentSelectedModels.has(modelId) && relation?._id) {
        await deleteProductTechnology(relation._id);
      }
    }

   
    for (
      let index = 0;
      index < selectedTechnologyModels.length;
      index += 1
    ) {
      const modelId = String(selectedTechnologyModels[index]);

      const priceData = technologyPrices[modelId];

      const extraPrice = Number(priceData?.extraPrice || 0);

      const existingRelation = relationsByModelId.get(modelId);

      if (existingRelation?._id) {
        await updateProductTechnology(existingRelation._id, {
          extraPrice,
          displayOrder: index,
        });
      } else {
        await createProductTechnology({
          product: id,
          technologyModel: modelId,
          extraPrice,
          isDefault: false,
          isSelectable: true,
          displayOrder: index,
          status: "active",
        });
      }
    }
  }
}
   
let uploadedPrimaryImage = primaryImage;

let uploadedPrimaryImageId = primaryImageId;

const uploadedImages = await Promise.all(
  newImages.map(async (imageFile, index) => {
    const form = new FormData();

    form.append("image", imageFile);

    const upload = await uploadImage(form);

    const uploadedImage =
      upload?.image ||
      upload?.data?.image ||
      upload?.data?.data?.image ||
      "";

    if (!uploadedImage) {
      throw new Error(t("editProduct.imageUploadCompletedWithoutPath"));
    }

    return {
      uploadedImage,
      index,
    };
  }),
);

for (const { uploadedImage, index } of uploadedImages) {
  const shouldBePrimary = !uploadedPrimaryImage && index === 0;

  const createdImageResponse = await createProductImage({
    product: id,
    imageUrl: uploadedImage,
    isPrimary: shouldBePrimary,
    sortOrder: existingImages.length + index,
  });

  const createdImage =
    createdImageResponse?.data?.image ||
    createdImageResponse?.image ||
    createdImageResponse?.data?.data?.image ||
    null;

  if (shouldBePrimary) {
    uploadedPrimaryImage = uploadedImage;
    uploadedPrimaryImageId = createdImage?._id || "";
  }
}

      if (uploadedPrimaryImage) {
        await updateProduct(id, {
          primaryImage: uploadedPrimaryImage,
        });
      }

      if (uploadedPrimaryImageId) {
        await api.put(`/product-images/${uploadedPrimaryImageId}/primary`, {
          productId: id,
        });
      }

      setSuccessMessage(t("editProduct.productUpdatedSuccessfully"));

      setTimeout(() => {
        navigate("/admin/products");
      }, 800);
    } catch (error) {
      console.error(error);

      setError(
        error?.response?.data?.message ||
          error?.message ||
          t("editProduct.failedToUpdateProduct"),
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
              {t("editProduct.loadingProduct")}
            </p>

            <p className="mt-1 text-[8px] text-steel-gray">
              {t("editProduct.preparingProductInformation")}
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
                    {t("editProduct.collection")}
                  </span>

                  <span className="h-px w-7 bg-antique-gold" />

                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-steel-gray">
                    {t("editProduct.edit")}
                  </span>
                </div>

                <h1 className="mt-1 font-serif text-[2rem] font-normal tracking-[-0.03em] text-midnight-navy">
                  {t("editProduct.editProduct")}
                </h1>
              </div>
            </div>
          </div>

          <Link
            to="/admin/products"
            className="group inline-flex min-h-[46px] w-fit items-center justify-center gap-3 rounded-full border border-champagne-gold/30 bg-soft-white/85 px-5 text-[8px] font-semibold uppercase tracking-[0.11em] text-slate-gray shadow-[0_7px_18px_rgba(7,19,31,0.035)] transition-all duration-300 hover:-translate-y-0.5 hover:border-classic-gold hover:bg-warm-ivory hover:text-midnight-navy"
          >
            <span className="text-antique-gold">←</span>
            {t("editProduct.backToProducts")}
          </Link>
        </div>
      </header>

      <main className="relative mx-auto max-w-[1500px] px-6 py-10 sm:px-8 lg:px-10 lg:py-12">
        {error && (
          <div className="mb-8 flex items-center justify-between rounded-[16px] border border-antique-gold/25 bg-soft-cream/85 px-5 py-4 text-[10px] text-antique-gold">
            <span>{error}</span>

            <button type="button" onClick={() => setError("")}>
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
                  <span className="text-antique-gold">01</span>

                  <span className="h-px w-8 bg-antique-gold" />

                  <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-steel-gray">
                    {t("editProduct.productDetails")}
                  </span>
                </div>

                <h2 className="mt-3 font-serif text-[1.55rem]">
                  {t("editProduct.editYourPiece")}
                </h2>
              </div>

              <div className="space-y-6 p-7 sm:p-9">
                <div>
                  <label className="mb-2.5 block text-[8px] font-semibold uppercase">
                    {t("editProduct.productName")}
                  </label>

                  <div className="mb-3 flex gap-2 rounded-xl border border-light-champagne bg-warm-ivory/50 p-1">
                    <button
                      type="button"
                      onClick={() => setActiveLanguage("en")}
                      className={`flex-1 rounded-lg px-4 py-2.5 text-[8px] font-semibold uppercase tracking-[0.12em] transition ${
                        activeLanguage === "en"
                          ? "bg-midnight-navy text-champagne-gold"
                          : "text-steel-gray hover:bg-soft-cream"
                      }`}
                    >
                      {t("editProduct.english")}
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveLanguage("ar")}
                      className={`flex-1 rounded-lg px-4 py-2.5 text-[8px] font-semibold transition ${
                        activeLanguage === "ar"
                          ? "bg-midnight-navy text-champagne-gold"
                          : "text-steel-gray hover:bg-soft-cream"
                      }`}
                    >
                      {t("editProduct.arabic")}
                    </button>
                  </div>

                  <input
                    type="text"
                    value={formData.name[activeLanguage]}
                    onChange={(event) =>
                      handleLocalizedChange("name", event.target.value)
                    }
                    required
                    dir={activeLanguage === "ar" ? "rtl" : "ltr"}
                    placeholder={
                      activeLanguage === "ar"
                        ? t("editProduct.productNameArabicPlaceholder")
                        : t("editProduct.productNameEnglishPlaceholder")
                    }
                    className="w-full rounded-[13px] border border-light-champagne bg-warm-ivory/60 px-4 py-3.5 text-[11px] outline-none focus:border-classic-gold"
                  />

                  <p className="mt-2 text-[8px] text-steel-gray">
                    {t("editProduct.productNameBothLanguages")}
                  </p>
                </div>

                <div>
                  <label className="mb-2.5 block text-[8px] font-semibold uppercase">
                    {t("editProduct.shortDescription")}
                  </label>

                  <input
                    type="text"
                    value={formData.shortDescription[activeLanguage]}
                    onChange={(event) =>
                      handleLocalizedChange(
                        "shortDescription",
                        event.target.value,
                      )
                    }
                    dir={activeLanguage === "ar" ? "rtl" : "ltr"}
                    placeholder={
                      activeLanguage === "ar"
                        ? t("editProduct.shortDescriptionArabicPlaceholder")
                        : t("editProduct.shortDescriptionEnglishPlaceholder")
                    }
                    className="w-full rounded-[13px] border border-light-champagne bg-warm-ivory/60 px-4 py-3.5 text-[11px]"
                  />
                </div>

                <div>
                  <label className="mb-2.5 block text-[8px] font-semibold uppercase">
                    {t("editProduct.description")}
                  </label>

                  <textarea
                    rows={6}
                    value={formData.description[activeLanguage]}
                    onChange={(event) =>
                      handleLocalizedChange("description", event.target.value)
                    }
                    required
                    dir={activeLanguage === "ar" ? "rtl" : "ltr"}
                    placeholder={
                      activeLanguage === "ar"
                        ? t("editProduct.productDescriptionArabicPlaceholder")
                        : t("editProduct.productDescriptionEnglishPlaceholder")
                    }
                    className="w-full resize-none rounded-[13px] border border-light-champagne bg-warm-ivory/60 px-4 py-3.5 text-[11px]"
                  />

                  <p className="mt-2 text-[8px] text-steel-gray">
                    {t("editProduct.descriptionBothLanguages")}
                  </p>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2.5 block text-[8px] font-semibold uppercase">
                      {t("editProduct.category")}
                    </label>

                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      className="w-full rounded-[13px] border border-light-champagne bg-warm-ivory/60 px-4 py-3.5 text-[11px]"
                    >
                      <option value="">
                        {t("editProduct.selectCategory")}
                      </option>

                      {categories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {getLocalizedValue(category.name, activeLanguage)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2.5 block text-[8px] font-semibold uppercase">
                      {t("editProduct.sku")}
                    </label>

                    <div className="flex min-h-[49px] items-center rounded-[13px] border border-dashed border-champagne-gold/40 bg-soft-cream px-4">
                      <div>
                        <p className="text-[10px] font-semibold text-midnight-navy">
                          {t("editProduct.generatedAutomatically")}
                        </p>

                        <p className="mt-1 text-[8px] text-steel-gray">
                          {t("editProduct.skuManagedAutomatically")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 02 — Pricing & Inventory */}
            <section className="overflow-hidden rounded-[26px] border border-light-champagne/90 bg-soft-white/85 shadow-[0_16px_46px_rgba(7,19,31,0.05)]">
              {/* Section Header */}
              <div className="border-b border-light-champagne/80 bg-warm-ivory/50 px-7 py-6 sm:px-9">
                <div className="flex items-center gap-3">
                  <span className="text-antique-gold">02</span>
                  <span className="h-px w-8 bg-antique-gold" />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-steel-gray">
                    {t("editProduct.pricingInventory")}
                  </span>
                </div>

                <h2 className="mt-3 font-serif text-[1.55rem] text-deep-navy">
                  {t("editProduct.pricingAvailability")}
                </h2>
              </div>

              {/* Fields */}
              <div className="space-y-7 p-7 sm:p-9">
                {/* Row 1 — Selling Price / Compare Price */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* Selling Price */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-deep-navy">
                      {t("editProduct.sellingPrice")}
                    </label>

                    <div
                      className={`flex min-h-[50px] overflow-hidden rounded-xl border border-light-champagne bg-white transition-colors focus-within:border-antique-gold ${
                        activeLanguage === "ar"
                          ? "flex-row-reverse"
                          : "flex-row"
                      }`}
                    >
                      <input
                        type="number"
                        name="price"
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={handleChange}
                        dir="ltr"
                        className="min-w-0 flex-1 border-0 bg-transparent px-4 text-sm text-deep-navy outline-none focus:ring-0"
                        placeholder="0.00"
                      />

                      <span
                        className={`flex w-[58px] shrink-0 items-center justify-center bg-warm-ivory text-xs font-semibold text-steel-gray ${
                          activeLanguage === "ar"
                            ? "border-l border-light-champagne"
                            : "border-r border-light-champagne"
                        }`}
                      >
                        EGP
                      </span>
                    </div>
                  </div>

                  {/* Compare Price */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-deep-navy">
                      {t("editProduct.comparePrice")}
                    </label>

                    <div
                      className={`flex min-h-[50px] overflow-hidden rounded-xl border border-light-champagne bg-white transition-colors focus-within:border-antique-gold ${
                        activeLanguage === "ar"
                          ? "flex-row-reverse"
                          : "flex-row"
                      }`}
                    >
                      <input
                        type="number"
                        name="comparePrice"
                        min="0"
                        step="0.01"
                        value={formData.comparePrice}
                        onChange={handleChange}
                        dir="ltr"
                        className="min-w-0 flex-1 border-0 bg-transparent px-4 text-sm text-deep-navy outline-none focus:ring-0"
                        placeholder="0.00"
                      />

                      <span
                        className={`flex w-[58px] shrink-0 items-center justify-center bg-warm-ivory text-xs font-semibold text-steel-gray ${
                          activeLanguage === "ar"
                            ? "border-l border-light-champagne"
                            : "border-r border-light-champagne"
                        }`}
                      >
                        EGP
                      </span>
                    </div>
                  </div>
                </div>

                {/* Row 2 — Product Cost / Stock */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* Product Cost */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-deep-navy">
                      {t("editProduct.productCost")}
                    </label>

                    <div
                      className={`flex min-h-[50px] overflow-hidden rounded-xl border border-light-champagne bg-white transition-colors focus-within:border-antique-gold ${
                        activeLanguage === "ar"
                          ? "flex-row-reverse"
                          : "flex-row"
                      }`}
                    >
                      <input
                        type="number"
                        name="costPrice"
                        min="0"
                        step="0.01"
                        value={formData.costPrice}
                        onChange={handleChange}
                        dir="ltr"
                        className="min-w-0 flex-1 border-0 bg-transparent px-4 text-sm text-deep-navy outline-none focus:ring-0"
                        placeholder="0.00"
                      />

                      <span
                        className={`flex w-[58px] shrink-0 items-center justify-center bg-warm-ivory text-xs font-semibold text-steel-gray ${
                          activeLanguage === "ar"
                            ? "border-l border-light-champagne"
                            : "border-r border-light-champagne"
                        }`}
                      >
                        EGP
                      </span>
                    </div>

                    <p className="mt-2 text-xs leading-5 text-steel-gray">
                      {t("editProduct.jewelryPieceCostOnly")}
                    </p>
                  </div>

                  {/* Stock */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-deep-navy">
                      {t("editProduct.stock")}
                    </label>

                    <input
                      type="number"
                      name="stock"
                      min="0"
                      step="1"
                      value={formData.stock}
                      onChange={handleChange}
                      dir="ltr"
                      className="min-h-[50px] w-full rounded-xl border border-light-champagne bg-white px-4 text-sm text-deep-navy outline-none transition-colors focus:border-antique-gold focus:ring-0"
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Row 3 — Weight */}
                <div className="max-w-[calc(50%-0.75rem)] min-w-full md:min-w-0">
                  <label className="mb-2 block text-sm font-medium text-deep-navy">
                    {t("editProduct.weight")}
                  </label>

                  <div className="flex min-h-[50px] overflow-hidden rounded-xl border border-light-champagne bg-white transition-colors focus-within:border-antique-gold">
                    <input
                      type="number"
                      name="weight"
                      min="0"
                      step="0.01"
                      value={formData.weight}
                      onChange={handleChange}
                      dir="ltr"
                      className="min-w-0 flex-1 border-0 bg-transparent px-4 text-sm text-deep-navy outline-none focus:ring-0"
                      placeholder="0.00"
                    />

                    <span className="flex w-[58px] shrink-0 items-center justify-center border-l border-light-champagne bg-warm-ivory text-xs font-semibold text-steel-gray">
                      g
                    </span>
                  </div>
                </div>
              </div>
            </section>

            <section className="overflow-hidden rounded-[26px] border border-light-champagne/90 bg-soft-white/85">
              <div className="border-b border-light-champagne/80 bg-warm-ivory/50 px-7 py-6 sm:px-9">
                <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-steel-gray">
                  03 · {t("editProduct.details")}
                </span>
              </div>

              <div className="space-y-6 p-7 sm:p-9">
                <div className="grid gap-5 md:grid-cols-3">
                  {/* MATERIAL */}
                  <div>
                    <label className="mb-2.5 block text-[8px] font-semibold uppercase">
                      {t("editProduct.material")}
                    </label>

                    <select
                      value={formData.material.en}
                      onChange={(event) => {
                        const materialMap = {
                          "Gold 18K": {
                            en: "Gold 18K",
                            ar: "ذهب عيار 18",
                          },
                          "Gold 21K": {
                            en: "Gold 21K",
                            ar: "ذهب عيار 21",
                          },
                          "Gold 24K": {
                            en: "Gold 24K",
                            ar: "ذهب عيار 24",
                          },
                          "Chinese Gold": {
                            en: "Chinese Gold",
                            ar: "ذهب صيني",
                          },
                          Silver: {
                            en: "Silver",
                            ar: "فضة",
                          },
                          "Stainless Steel": {
                            en: "Stainless Steel",
                            ar: "ستانلس ستيل",
                          },
                        };

                        setFormData((previous) => ({
                          ...previous,
                          material: materialMap[event.target.value] || {
                            en: "",
                            ar: "",
                          },
                        }));
                      }}
                      className="w-full rounded-[13px] border border-light-champagne bg-warm-ivory/60 px-4 py-3.5 text-[11px]"
                    >
                      <option value="">
                        {activeLanguage === "ar"
                          ? "اختاري الخامة"
                          : "Select Material"}
                      </option>

                      <option value="Gold 18K">
                        {activeLanguage === "ar" ? "ذهب عيار 18" : "Gold 18K"}
                      </option>

                      <option value="Gold 21K">
                        {activeLanguage === "ar" ? "ذهب عيار 21" : "Gold 21K"}
                      </option>

                      <option value="Gold 24K">
                        {activeLanguage === "ar" ? "ذهب عيار 24" : "Gold 24K"}
                      </option>

                      <option value="Chinese Gold">
                        {activeLanguage === "ar" ? "ذهب صيني" : "Chinese Gold"}
                      </option>

                      <option value="Silver">
                        {activeLanguage === "ar" ? "فضة" : "Silver"}
                      </option>

                      <option value="Stainless Steel">
                        {activeLanguage === "ar"
                          ? "ستانلس ستيل"
                          : "Stainless Steel"}
                      </option>
                    </select>
                  </div>

                  {/* COLOR */}
                  <div>
                    <label className="mb-2.5 block text-[8px] font-semibold uppercase">
                      {t("editProduct.color")}
                    </label>

                    <select
                      value={formData.color.en}
                      onChange={(event) => {
                        const colorMap = {
                          Gold: {
                            en: "Gold",
                            ar: "ذهبي",
                          },
                          Silver: {
                            en: "Silver",
                            ar: "فضي",
                          },
                          "Stainless Steel": {
                            en: "Stainless Steel",
                            ar: "ستانلس ستيل",
                          },
                        };

                        setFormData((previous) => ({
                          ...previous,
                          color: colorMap[event.target.value] || {
                            en: "",
                            ar: "",
                          },
                        }));
                      }}
                      className="w-full rounded-[13px] border border-light-champagne bg-warm-ivory/60 px-4 py-3.5 text-[11px]"
                    >
                      <option value="">
                        {activeLanguage === "ar"
                          ? "اختاري اللون"
                          : "Select Color"}
                      </option>

                      <option value="Gold">
                        {activeLanguage === "ar" ? "ذهبي" : "Gold"}
                      </option>

                      <option value="Silver">
                        {activeLanguage === "ar" ? "فضي" : "Silver"}
                      </option>

                      <option value="Stainless Steel">
                        {activeLanguage === "ar"
                          ? "ستانلس ستيل"
                          : "Stainless Steel"}
                      </option>
                    </select>
                  </div>

                  {/* PREPARATION DAYS */}
                  <div>
                    <label className="mb-2.5 block text-[8px] font-semibold uppercase">
                      {t("editProduct.preparationDays")}
                    </label>

                    <input
                      type="number"
                      min="0"
                      name="preparationDays"
                      value={formData.preparationDays}
                      onChange={handleChange}
                      placeholder={t("editProduct.preparationDays")}
                      className="w-full rounded-[13px] border border-light-champagne bg-warm-ivory/60 px-4 py-3.5 text-[11px]"
                    />
                  </div>

                  <div>
                    <label className="mb-2.5 block text-[8px] font-semibold uppercase">
                      {t("editProduct.preparationDays")}
                    </label>

                    <input
                      type="number"
                      min="0"
                      name="preparationDays"
                      value={formData.preparationDays}
                      onChange={handleChange}
                      placeholder={t("editProduct.preparationDays")}
                      className="w-full rounded-[13px] border border-light-champagne bg-warm-ivory/60 px-4 py-3.5 text-[11px]"
                    />
                  </div>
                </div>

                <input
                  type="text"
                  value={formData.tags[activeLanguage]}
                  onChange={(event) =>
                    handleLocalizedChange("tags", event.target.value)
                  }
                  dir={activeLanguage === "ar" ? "rtl" : "ltr"}
                  placeholder={
                    activeLanguage === "ar"
                      ? t("editProduct.tagsArabicPlaceholder")
                      : t("editProduct.tagsEnglishPlaceholder")
                  }
                  className="w-full rounded-[13px] border border-light-champagne bg-warm-ivory/60 px-4 py-3.5"
                />

                <textarea
                  rows={4}
                  value={formData.careInstructions[activeLanguage]}
                  onChange={(event) =>
                    handleLocalizedChange(
                      "careInstructions",
                      event.target.value,
                    )
                  }
                  dir={activeLanguage === "ar" ? "rtl" : "ltr"}
                  placeholder={
                    activeLanguage === "ar"
                      ? t("editProduct.careInstructionsArabic")
                      : t("editProduct.careInstructions")
                  }
                  className="w-full rounded-[13px] border border-light-champagne bg-warm-ivory/60 px-4 py-3.5"
                />

                <label className="flex items-center justify-between rounded-[16px] border border-light-champagne bg-warm-ivory/60 p-5">
                  <div>
                    <p className="text-[10px] font-semibold">
                      {t("editProduct.customizableProduct")}
                    </p>

                    <p className="mt-1 text-[8px] text-steel-gray">
                      {t("editProduct.allowCustomersCustomize")}
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

                <label
                  className={`flex items-center justify-between rounded-[16px] border p-5 transition-all ${
                    formData.technologyRequired
                      ? "border-champagne-gold/60 bg-soft-cream"
                      : "border-light-champagne bg-warm-ivory/60"
                  }`}
                >
                  <div className="pr-5">
                    <div className="flex items-center gap-2">
                      <span className="text-classic-gold">✦</span>

                      <p className="text-[10px] font-semibold text-midnight-navy">
                        {t("editProduct.technologyRequiredForOrder")}
                      </p>
                    </div>

                    <p className="mt-1.5 max-w-xl text-[8px] leading-5 text-steel-gray">
                      {t("editProduct.technologyRequiredDescription")}
                    </p>
                  </div>

                  <input
                    type="checkbox"
                    name="technologyRequired"
                    checked={formData.technologyRequired}
                    onChange={(event) => {
                      const checked = event.target.checked;

                      setFormData((previous) => ({
                        ...previous,
                        technologyRequired: checked,
                      }));

                      if (!checked) {
                        setSelectedTechnologyModels([]);
                      }
                    }}
                    className="h-5 w-5 shrink-0 accent-classic-gold"
                  />
                </label>
              </div>
            </section>

            <section className="overflow-hidden rounded-[26px] border border-light-champagne/90 bg-soft-white/85">
              <div className="border-b border-light-champagne/80 bg-warm-ivory/50 px-7 py-6 sm:px-9">
                <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-steel-gray">
                  04 · {t("editProduct.technology")}
                </span>

                <h2 className="mt-3 font-serif text-[1.55rem]">
                  {t("editProduct.technologyModels")}
                </h2>

                <p className="mt-2 max-w-2xl text-[10px] leading-6 text-slate-gray">
                  {t("editProduct.technologyModelsDescription")}
                </p>
              </div>

              <div className="space-y-4 p-7 sm:p-9">
                {technologyModels.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-light-champagne p-8 text-center">
                    {t("editProduct.noTechnologyModelsAvailable")}
                  </div>
                ) : (
                  technologyModels.map((model) => {
                    const selected = selectedTechnologyModels.includes(
                      model._id,
                    );

                    const extraPrice = getExtraPrice(model._id);

                    const smartUnitInfo = getSmartUnitPriceInfo(model._id);

                    return (
                      <div
                        key={model._id}
                        className={`rounded-[18px] border p-5 ${
                          selected
                            ? "border-champagne-gold/60 bg-soft-cream"
                            : "border-light-champagne bg-warm-ivory/50"
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
                            <div className="flex flex-col justify-between gap-3 sm:flex-row">
                              <div>
                                <h3 className="font-semibold text-midnight-navy">
                                  {model.modelName}
                                </h3>

                                {model.modelCode && (
                                  <p className="mt-1 font-mono text-[8px] uppercase tracking-wider text-antique-gold">
                                    {model.modelCode}
                                  </p>
                                )}

                                {model.technology?.name && (
                                  <p className="mt-2 text-[8px] text-steel-gray">
                                    {t("editProduct.technologyLabel")}:{" "}
                                    {model.technology.name}
                                  </p>
                                )}
                              </div>

                              <span className="h-fit rounded-full bg-soft-cream px-3 py-1 text-[7px] uppercase text-antique-gold">
                                {model.status || "active"}
                              </span>
                            </div>

                            <div className="mt-4 flex flex-wrap gap-2">
                              {model.requiresBattery && (
                                <span className="rounded-full border border-champagne-gold/40 bg-soft-cream px-3 py-1 text-[8px] text-antique-gold">
                                  {t("editProduct.battery")}
                                </span>
                              )}

                              {model.requiresActivation && (
                                <span className="rounded-full border border-champagne-gold/40 bg-soft-cream px-3 py-1 text-[8px] text-antique-gold">
                                  {t("editProduct.activation")}
                                </span>
                              )}

                              {model.requiresSubscription && (
                                <span className="rounded-full border border-champagne-gold/40 bg-soft-cream px-3 py-1 text-[8px] text-antique-gold">
                                  {t("editProduct.subscription")}
                                </span>
                              )}
                            </div>

                            <div className="mt-4 rounded-[14px] border border-dashed border-champagne-gold/35 bg-warm-ivory/75 p-4">
                              <p className="text-[7px] font-semibold uppercase tracking-[0.17em] text-antique-gold">
                                {t("editProduct.smartUnitCostReference")}
                              </p>

                              {smartUnitInfo.min !== null ? (
                                <>
                                  <p className="mt-2 font-serif text-[1.1rem] text-midnight-navy">
                                    {smartUnitInfo.min === smartUnitInfo.max
                                      ? `${formatMoney(smartUnitInfo.min)} EGP`
                                      : `${formatMoney(
                                          smartUnitInfo.min,
                                        )} – ${formatMoney(
                                          smartUnitInfo.max,
                                        )} EGP`}
                                  </p>

                                  <p className="mt-1 text-[8px] leading-5 text-steel-gray">
                                    {smartUnitInfo.count}{" "}
                                    {t("editProduct.smartUnitTypes")} ·{" "}
                                    {smartUnitInfo.availableStock}{" "}
                                    {t("editProduct.availablePhysicalUnits")}
                                  </p>
                                </>
                              ) : (
                                <p className="mt-2 text-[9px] text-steel-gray">
                                  {t("editProduct.noSmartUnitCostRegistered")}
                                </p>
                              )}
                            </div>

                            {selected && (
                              <div className="mt-5 rounded-xl border border-champagne-gold/30 bg-soft-white p-4">
                                <label className="mb-2.5 block text-[8px] font-semibold uppercase">
                                  {t("editProduct.extraPrice")}
                                </label>

                                <p className="mb-3 text-[8px] text-steel-gray">
                                  {t("editProduct.typeOrPasteCompletePrice")}
                                </p>

                                <div className="relative">
                                  <input
                                    type="text"
                                    inputMode="decimal"
                                    value={extraPrice}
                                    onChange={(event) =>
                                      handleExtraPriceChange(
                                        model._id,
                                        event.target.value,
                                      )
                                    }
                                    placeholder={t(
                                      "editProduct.extraPricePlaceholder",
                                    )}
                                    className="w-full rounded-xl border border-light-champagne bg-soft-white px-4 py-3 pr-14 text-sm outline-none focus:border-classic-gold"
                                  />

                                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-antique-gold">
                                    {t("editProduct.egp")}
                                  </span>
                                </div>

                                <div className="mt-4 rounded-xl bg-soft-cream/75 p-4">
                                  <div className="flex justify-between text-[8px] text-steel-gray">
                                    <span>{t("editProduct.productPrice")}</span>

                                    <span>
                                      {formatMoney(formData.price)} EGP
                                    </span>
                                  </div>

                                  <div className="mt-2 flex justify-between text-[8px] text-steel-gray">
                                    <span>{t("editProduct.extraPrice")}</span>

                                    <span>{formatMoney(extraPrice)} EGP</span>
                                  </div>

                                  <div className="mt-3 flex justify-between border-t border-light-champagne pt-3 text-[10px] font-semibold">
                                    <span>{t("editProduct.finalPrice")}</span>

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

            <section className="overflow-hidden rounded-[26px] border border-light-champagne/90 bg-soft-white/85">
              <div className="border-b border-light-champagne/80 bg-warm-ivory/50 px-7 py-6 sm:px-9">
                <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-steel-gray">
                  05 · {t("editProduct.media")}
                </span>

                <h2 className="mt-3 font-serif text-[1.55rem]">
                  {t("editProduct.productImages")}
                </h2>

                <p className="mt-2 max-w-2xl text-[9px] leading-5 text-slate-gray">
                  {t("editProduct.productImagesDescription")}
                </p>
              </div>

              <div className="p-7 sm:p-9">
                {existingImages.length > 0 ? (
                  <div>
                    <div className="mb-4 flex items-center justify-between gap-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-steel-gray">
                        {t("editProduct.currentImages")}
                      </p>

                      <span className="rounded-full border border-light-champagne bg-soft-cream px-3 py-1.5 text-[7px] font-semibold uppercase tracking-[0.13em] text-antique-gold">
                        {existingImages.length}{" "}
                        {existingImages.length === 1
                          ? t("editProduct.image")
                          : t("editProduct.images")}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                      {existingImages.map((image, index) => {
                        const imageUrl =
                          image.imageUrl || image.url || image.image || "";

                        const isPrimary =
                          image.isPrimary === true ||
                          primaryImageId === image._id ||
                          (!primaryImageId && primaryImage === imageUrl);

                        const displayUrl = getImageUrl(imageUrl);

                        const isDeleting = deletingImageId === image._id;

                        const isSettingPrimary =
                          settingPrimaryImageId === image._id;

                        return (
                          <div
                            key={image._id || index}
                            className={`group overflow-hidden rounded-2xl border bg-soft-white transition-all ${
                              isPrimary
                                ? "border-antique-gold ring-2 ring-classic-gold/20"
                                : "border-light-champagne"
                            }`}
                          >
                            <div className="relative aspect-square overflow-hidden bg-soft-cream">
                              {displayUrl ? (
                                <img
                                  src={displayUrl}
                                  alt={getLocalizedValue(formData.name, "en")}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center text-[9px] text-steel-gray">
                                  {t("editProduct.noImage")}
                                </div>
                              )}

                              {isPrimary && (
                                <span className="absolute left-3 top-3 rounded-full bg-midnight-navy px-3 py-1 text-[7px] font-semibold uppercase tracking-[0.12em] text-champagne-gold shadow">
                                  {t("editProduct.primary")}
                                </span>
                              )}

                              <button
                                type="button"
                                disabled={isDeleting}
                                onClick={() => handleDeleteExistingImage(image)}
                                className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-soft-white/40 bg-midnight-navy/90 text-[14px] text-soft-white shadow backdrop-blur transition hover:bg-rich-navy disabled:cursor-not-allowed disabled:opacity-50"
                                aria-label={t("editProduct.deleteImage")}
                              >
                                {isDeleting ? "…" : "×"}
                              </button>
                            </div>

                            <div className="p-3">
                              <button
                                type="button"
                                disabled={isPrimary || isSettingPrimary}
                                onClick={() =>
                                  handleSelectExistingPrimary(image)
                                }
                                className={`flex min-h-[36px] w-full items-center justify-center rounded-xl border px-3 text-[7px] font-semibold uppercase tracking-[0.12em] transition-all ${
                                  isPrimary
                                    ? "border-champagne-gold/30 bg-soft-cream text-antique-gold"
                                    : "border-light-champagne bg-soft-white text-midnight-navy hover:border-champagne-gold/50 hover:bg-warm-ivory"
                                } disabled:cursor-not-allowed disabled:opacity-70`}
                              >
                                {isPrimary
                                  ? t("editProduct.primaryImage")
                                  : isSettingPrimary
                                    ? t("editProduct.setting")
                                    : t("editProduct.makePrimary")}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-[18px] border border-dashed border-light-champagne bg-warm-ivory/40 px-6 py-8 text-center">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-steel-gray">
                      {t("editProduct.noExistingProductImageRecords")}
                    </p>

                    <p className="mt-2 text-[9px] leading-5 text-slate-gray">
                      {t("editProduct.uploadImagesBelow")}
                    </p>
                  </div>
                )}

                <div className={existingImages.length ? "mt-8" : "mt-5"}>
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-[18px] border border-dashed border-champagne-gold/40 bg-warm-ivory/55 px-6 py-12 transition hover:border-classic-gold hover:bg-soft-cream">
                    <div className="text-2xl text-classic-gold">+</div>

                    <p className="mt-4 text-[10px] font-semibold">
                      {t("editProduct.uploadProductImages")}
                    </p>

                    <p className="mt-2 text-[8px] text-steel-gray">
                      {t("editProduct.imageFormats")}
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
                    <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.25em] text-steel-gray">
                      {t("editProduct.newImages")}
                    </p>

                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                      {previewNewImages.map((image, index) => (
                        <div
                          key={`${image}-${index}`}
                          className="overflow-hidden rounded-2xl border border-light-champagne bg-soft-white"
                        >
                          <div className="relative aspect-square">
                            <img
                              src={image}
                              alt={`${t("editProduct.newProductImage")} ${
                                index + 1
                              }`}
                              className="h-full w-full object-cover"
                            />

                            <button
                              type="button"
                              onClick={() => handleRemoveNewImage(index)}
                              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-midnight-navy text-white shadow"
                              aria-label={t("editProduct.removeNewImage")}
                            >
                              ×
                            </button>

                            {!primaryImage && index === 0 && (
                              <span className="absolute bottom-3 left-3 rounded-full bg-midnight-navy px-3 py-1 text-[7px] font-semibold uppercase tracking-[0.12em] text-champagne-gold">
                                {t("editProduct.willBecomePrimary")}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>

            <section className="overflow-hidden rounded-[26px] border border-light-champagne/90 bg-soft-white/85">
              <div className="border-b border-light-champagne/80 bg-warm-ivory/50 px-7 py-6 sm:px-9">
                <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-steel-gray">
                  06 · {t("editProduct.seo")}
                </span>
              </div>

              <div className="space-y-5 p-7 sm:p-9">
                <div className="flex gap-2 rounded-xl border border-light-champagne bg-warm-ivory/50 p-1">
                  <button
                    type="button"
                    onClick={() => setActiveLanguage("en")}
                    className={`flex-1 rounded-lg px-4 py-2.5 text-[8px] font-semibold uppercase tracking-[0.12em] transition ${
                      activeLanguage === "en"
                        ? "bg-midnight-navy text-champagne-gold"
                        : "text-steel-gray hover:bg-soft-cream"
                    }`}
                  >
                    {t("editProduct.english")}
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveLanguage("ar")}
                    className={`flex-1 rounded-lg px-4 py-2.5 text-[8px] font-semibold transition ${
                      activeLanguage === "ar"
                        ? "bg-midnight-navy text-champagne-gold"
                        : "text-steel-gray hover:bg-soft-cream"
                    }`}
                  >
                    {t("editProduct.arabic")}
                  </button>
                </div>

                <input
                  type="text"
                  value={formData.seoTitle[activeLanguage]}
                  onChange={(event) =>
                    handleLocalizedChange("seoTitle", event.target.value)
                  }
                  dir={activeLanguage === "ar" ? "rtl" : "ltr"}
                  placeholder={
                    activeLanguage === "ar"
                      ? t("editProduct.seoTitleArabic")
                      : t("editProduct.seoTitle")
                  }
                  className="w-full rounded-[13px] border border-light-champagne bg-warm-ivory/60 px-4 py-3.5"
                />

                <input
                  type="text"
                  value={formData.seoSlug[activeLanguage]}
                  onChange={(event) =>
                    handleLocalizedChange("seoSlug", event.target.value)
                  }
                  dir={activeLanguage === "ar" ? "rtl" : "ltr"}
                  placeholder={
                    activeLanguage === "ar"
                      ? t("editProduct.seoSlugArabic")
                      : t("editProduct.seoSlug")
                  }
                  className="w-full rounded-[13px] border border-light-champagne bg-warm-ivory/60 px-4 py-3.5"
                />

                <textarea
                  rows={4}
                  value={formData.seoDescription[activeLanguage]}
                  onChange={(event) =>
                    handleLocalizedChange("seoDescription", event.target.value)
                  }
                  dir={activeLanguage === "ar" ? "rtl" : "ltr"}
                  placeholder={
                    activeLanguage === "ar"
                      ? t("editProduct.seoDescriptionArabic")
                      : t("editProduct.seoDescription")
                  }
                  className="w-full rounded-[13px] border border-light-champagne bg-warm-ivory/60 px-4 py-3.5"
                />
              </div>
            </section>
          </div>

          <aside className="space-y-6 xl:sticky xl:top-28 xl:self-start">
            <div className="rounded-[26px] bg-midnight-navy p-7 text-soft-white">
              <p className="text-[9px] uppercase tracking-[0.3em] text-champagne-gold">
                {t("editProduct.productStatus")}
              </p>

              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="mt-5 w-full rounded-xl border border-champagne-gold/20 bg-rich-navy px-4 py-3"
              >
                <option value="active">{t("editProduct.active")}</option>

                <option value="inactive">{t("editProduct.inactive")}</option>
              </select>
            </div>

            <div className="rounded-[22px] border border-light-champagne bg-soft-white p-6">
              <h3 className="font-semibold">{t("editProduct.marketing")}</h3>

              <div className="mt-5 space-y-3">
                {[
                  ["featured", t("editProduct.featured")],
                  ["bestSeller", t("editProduct.bestSeller")],
                  ["newArrival", t("editProduct.newArrival")],
                ].map(([name, label]) => (
                  <label
                    key={name}
                    className="flex items-center justify-between rounded-xl border border-light-champagne p-4"
                  >
                    <span>{label}</span>

                    <input
                      type="checkbox"
                      name={name}
                      checked={formData[name]}
                      onChange={handleChange}
                      className="h-4 w-4 accent-classic-gold"
                    />
                  </label>
                ))}
              </div>
            </div>

            <div className="rounded-[22px] border border-light-champagne bg-soft-white p-6">
              <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-steel-gray">
                {t("editProduct.pricingSummary")}
              </p>

              <div className="mt-5 space-y-4">
                <div className="flex justify-between border-b border-light-champagne pb-4">
                  <span className="text-[10px] text-slate-gray">
                    {t("editProduct.sellingPrice")}
                  </span>

                  <span className="font-semibold text-antique-gold">
                    {formData.price ? `${formData.price} EGP` : "—"}
                  </span>
                </div>

                <div className="flex justify-between border-b border-light-champagne pb-4">
                  <span className="text-[10px] text-slate-gray">
                    {t("editProduct.productCost")}
                  </span>

                  <span className="font-semibold text-midnight-navy">
                    {formData.costPrice !== ""
                      ? `${formData.costPrice} EGP`
                      : "—"}
                  </span>
                </div>

                <div className="flex justify-between border-b border-light-champagne pb-4">
                  <span className="text-[10px] text-slate-gray">
                    {t("editProduct.technologyModels")}
                  </span>

                  <span className="font-semibold">
                    {selectedTechnologyModels.length}
                  </span>
                </div>

                <div className="flex justify-between border-b border-light-champagne pb-4">
                  <span className="text-[10px] text-slate-gray">
                    {t("editProduct.currentImages")}
                  </span>

                  <span className="font-semibold">{existingImages.length}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-[10px] text-slate-gray">
                    {t("editProduct.newImages")}
                  </span>

                  <span className="font-semibold">{newImages.length}</span>
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
                  {t("editProduct.cancel")}
                </Link>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex min-h-[48px] min-w-[210px] items-center justify-center rounded-[13px] bg-midnight-navy px-8 text-[8px] font-semibold uppercase text-soft-white disabled:opacity-50"
                >
                  {isSaving
                    ? t("editProduct.updatingProduct")
                    : t("editProduct.updateProduct")}
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
