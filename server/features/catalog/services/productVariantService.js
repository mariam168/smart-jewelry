import ProductVariant from "../models/ProductVariant.js";

export const createVariant = async (variantData) => {
  const variant = await ProductVariant.create(variantData);

  return variant;
};

export const getProductVariants = async (productId) => {
  return await ProductVariant.find({
    product: productId,
    isActive: true,
  }).sort({
    createdAt: 1,
  });
};

export const getVariantById = async (id) => {
  return await ProductVariant.findById(id);
};

export const updateVariant = async (id, variantData) => {
  return await ProductVariant.findByIdAndUpdate(
    id,

    variantData,

    {
      new: true,
      runValidators: true,
    },
  );
};

export const deleteVariant = async (id) => {
  return await ProductVariant.findByIdAndDelete(id);
};
