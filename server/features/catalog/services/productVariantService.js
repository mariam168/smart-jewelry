import ProductVariant from "../models/ProductVariant.js";

const normalizeLocalizedField = (value) => {
  if (
    value &&
    typeof value === "object" &&
    !Array.isArray(value)
  ) {
    return {
      en: value.en ?? "",
      ar: value.ar ?? "",
    };
  }

  const fallback = value ?? "";

  return {
    en: String(fallback),
    ar: String(fallback),
  };
};

const normalizeVariantData = (variantData = {}) => {
  const normalized = {
    ...variantData,
  };

  if ("name" in normalized) {
    normalized.name = normalizeLocalizedField(normalized.name);
  }

  if ("color" in normalized) {
    normalized.color = normalizeLocalizedField(normalized.color);
  }

  if ("size" in normalized) {
    normalized.size = normalizeLocalizedField(normalized.size);
  }

  if ("material" in normalized) {
    normalized.material = normalizeLocalizedField(normalized.material);
  }

  if ("finish" in normalized) {
    normalized.finish = normalizeLocalizedField(normalized.finish);
  }

  return normalized;
};

export const createVariant = async (variantData) => {
  const normalizedData = normalizeVariantData(variantData);

  if (!normalizedData.name?.en?.trim()) {
    normalizedData.name.en = normalizedData.name.ar?.trim() || "";
  }

  if (!normalizedData.name?.ar?.trim()) {
    normalizedData.name.ar = normalizedData.name.en?.trim() || "";
  }

  return await ProductVariant.create(normalizedData);
};

export const getProductVariants = async (productId) => {
  return await ProductVariant.find({
    product: productId,
    isActive: true,
  })
    .populate("product", "name")
    .sort({
      createdAt: 1,
    });
};

export const getVariantById = async (id) => {
  return await ProductVariant.findById(id).populate(
    "product",
    "name",
  );
};

export const updateVariant = async (id, variantData) => {
  const normalizedData = normalizeVariantData(variantData);

  return await ProductVariant.findByIdAndUpdate(
    id,
    normalizedData,
    {
      new: true,
      runValidators: true,
    },
  );
};

export const deleteVariant = async (id) => {
  return await ProductVariant.findByIdAndDelete(id);
};