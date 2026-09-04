import ProductImage from "../models/ProductImage.js";
import Product from "../models/Product.js";

const getImageUrl = (image) => {
  return (
    image?.imageUrl ||
    image?.url ||
    image?.path ||
    image?.image ||
    ""
  );
};

const setProductPrimaryImage = async (
  productId,
  imageUrl = "",
) => {
  await Product.findByIdAndUpdate(
    productId,
    {
      primaryImage: imageUrl,
      image: imageUrl,
    },
    {
      runValidators: true,
    },
  );
};

const chooseFallbackPrimary = async (productId) => {
  const fallback = await ProductImage.findOne({
    product: productId,
  }).sort({
    sortOrder: 1,
    createdAt: 1,
  });

  if (!fallback) {
    await setProductPrimaryImage(productId, "");

    return null;
  }

  await ProductImage.updateMany(
    {
      product: productId,
    },
    {
      $set: {
        isPrimary: false,
      },
    },
  );

  fallback.isPrimary = true;

  await fallback.save();

  await setProductPrimaryImage(
    productId,
    getImageUrl(fallback),
  );

  return fallback;
};

export const createImage = async (imageData) => {
  const product = await Product.findById(
    imageData.product,
  );

  if (!product) {
    const error = new Error("Product not found.");

    error.statusCode = 404;

    throw error;
  }

  const existingImageCount =
    await ProductImage.countDocuments({
      product: imageData.product,
    });

  const shouldBePrimary =
    imageData.isPrimary === true ||
    existingImageCount === 0;

  if (shouldBePrimary) {
    await ProductImage.updateMany(
      {
        product: imageData.product,
      },
      {
        $set: {
          isPrimary: false,
        },
      },
    );
  }

  const image = await ProductImage.create({
    ...imageData,
    isPrimary: shouldBePrimary,
  });

  if (shouldBePrimary) {
    await setProductPrimaryImage(
      image.product,
      getImageUrl(image),
    );
  }

  return image;
};

export const getProductImages = async (productId) => {
  return await ProductImage.find({
    product: productId,
  }).sort({
    isPrimary: -1,
    sortOrder: 1,
    createdAt: 1,
  });
};

export const deleteImage = async (imageId) => {
  const image = await ProductImage.findById(imageId);

  if (!image) {
    return null;
  }

  const productId = image.product;

  const imageUrl = getImageUrl(image);

  const wasPrimary = image.isPrimary === true;

  await image.deleteOne();

  const product = await Product.findById(
    productId,
  ).select(
    "primaryImage image",
  );

  const productStillPointsToDeletedImage =
    product?.primaryImage === imageUrl ||
    product?.image === imageUrl;

  if (
    wasPrimary ||
    productStillPointsToDeletedImage
  ) {
    await chooseFallbackPrimary(productId);
  }

  return image;
};

export const setPrimaryImage = async (
  productId,
  imageId,
) => {
  const image = await ProductImage.findOne({
    _id: imageId,
    product: productId,
  });

  if (!image) {
    return null;
  }

  await ProductImage.updateMany(
    {
      product: productId,
    },
    {
      $set: {
        isPrimary: false,
      },
    },
  );

  image.isPrimary = true;

  await image.save();

  await setProductPrimaryImage(
    productId,
    getImageUrl(image),
  );

  return image;
};