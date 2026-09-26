import mongoose from "mongoose";

import Product from "../models/Product.js";
import Category from "../models/Category.js";
import ProductImage from "../models/ProductImage.js";

const generateProductSku = (productId) => {
  return `JEV-${productId.toString().toUpperCase()}`;
};

const validateLocalizedField = (field, fieldName) => {
  if (!field || typeof field !== "object") {
    const error = new Error(
      `${fieldName} must contain English and Arabic values.`,
    );

    error.statusCode = 400;

    throw error;
  }

  if (!String(field.en || "").trim()) {
    const error = new Error(`${fieldName} English value is required.`);

    error.statusCode = 400;

    throw error;
  }

  if (!String(field.ar || "").trim()) {
    const error = new Error(`${fieldName} Arabic value is required.`);

    error.statusCode = 400;

    throw error;
  }
};

export const createProduct = async (productData) => {
  const category = await Category.findById(productData.category);

  if (!category) {
    const error = new Error("Category not found.");

    error.statusCode = 404;

    throw error;
  }

  validateLocalizedField(productData.name, "Product name");

  validateLocalizedField(productData.description, "Product description");

  const productId = new mongoose.Types.ObjectId();

  const { sku: ignoredSku, _id: ignoredId, ...safeProductData } = productData;

  const product = await Product.create({
    ...safeProductData,

    _id: productId,

    sku: generateProductSku(productId),
  });

  return await product.populate([
    {
      path: "category",
    },
    {
      path: "technologyModels",
    },
  ]);
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

  const existingProduct = await Product.findById(productId);

  if (!existingProduct) {
    return null;
  }

  if (productData.name !== undefined) {
    validateLocalizedField(productData.name, "Product name");
  }

  if (productData.description !== undefined) {
    validateLocalizedField(productData.description, "Product description");
  }

  const { sku: ignoredSku, _id: ignoredId, ...safeProductData } = productData;

  if (!String(existingProduct.sku || "").trim()) {
    safeProductData.sku = generateProductSku(existingProduct._id);
  }

  return await Product.findByIdAndUpdate(
    productId,

    safeProductData,

    {
      new: true,

      runValidators: true,
    },
  )
    .populate("category")
    .populate("technologyModels");
};

export const deleteProduct = async (productId) => {
  return await Product.findByIdAndDelete(productId);
};
export const getNewArrivalProducts = async () => {
  const products = await Product.find({
    newArrival: true,
    status: "active",
  })
    .populate("category")
    .populate("technologyModels")
    .sort({
      createdAt: -1,
    });

  const result = await Promise.all(
    products.map(async (product) => {
      const primaryImage = await ProductImage.findOne({
        product: product._id,
        isPrimary: true,
      }).lean();

      const imageUrl =
        primaryImage?.imageUrl ||
        product.primaryImage ||
        product.image ||
        product.images?.[0] ||
        "";

      return {
        ...product.toObject(),
        image: imageUrl,
        primaryImage: imageUrl,
      };
    }),
  );

  return result;
};