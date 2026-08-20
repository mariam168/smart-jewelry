import ProductImage from "../models/ProductImage.js";

export const createImage = async (imageData) => {
  return await ProductImage.create(imageData);
};

export const getProductImages = async (productId) => {
  return await ProductImage.find({
    product: productId,
  })

    .sort({
      sortOrder: 1,

      createdAt: 1,
    });
};

export const deleteImage = async (imageId) => {
  return await ProductImage.findByIdAndDelete(imageId);
};

export const setPrimaryImage = async (productId, imageId) => {
  await ProductImage.updateMany(
    {
      product: productId,
    },

    {
      isPrimary: false,
    },
  );

  return await ProductImage.findByIdAndUpdate(
    imageId,

    {
      isPrimary: true,
    },

    {
      new: true,
    },
  );
};
