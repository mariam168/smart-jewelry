import Product from "../models/Product.js";
import Category from "../models/Category.js";
import ProductImage from "../models/ProductImage.js";

export const createProduct = async (productData) => {
  const category = await Category.findById(productData.category);

  if (!category) {
    const error = new Error("Category not found.");

    error.statusCode = 404;

    throw error;
  }

  const product = await Product.create(productData);

  return await product.populate("category");
};

export const getAllProducts = async () => {
  const products = await Product.find()
    .populate("category")
    .populate("technologyModels")
    .sort({
      createdAt: -1,
    });

  const result = await Promise.all(
    products.map(async (product) => {
      const image = await ProductImage.findOne({
        product: product._id,

        isPrimary: true,
      });

      return {
        ...product.toObject(),

        image: image ? image.imageUrl : "",
      };
    }),
  );

  return result;
};

export const getProductById = async (productId) => {
  const product = await Product.findById(productId)
    .populate("category")
    .populate("technologyModels");

  if (!product) {
    return null;
  }

  const image = await ProductImage.findOne({
    product: product._id,

    isPrimary: true,
  });

  return {
    ...product.toObject(),

    image: image ? image.imageUrl : "",
  };
};

export const updateProduct = async (productId, productData) => {
  if (productData.category) {
    const category = await Category.findById(productData.category);

    if (!category) {
      const error = new Error("Category not found.");

      error.statusCode = 404;

      throw error;
    }
  }

  return await Product.findByIdAndUpdate(
    productId,

    productData,

    {
      new: true,

      runValidators: true,
    },
  ).populate("category");
};

export const deleteProduct = async (productId) => {
  return await Product.findByIdAndDelete(productId);
};
