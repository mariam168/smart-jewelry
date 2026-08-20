import Product from "../models/Product.js";
import TechnologyModel from "../models/TechnologyModel.js";
import ProductTechnology from "../models/ProductTechnology.js";

export const createProductTechnology = async (data) => {
  const product = await Product.findById(data.product);

  if (!product) {
    const error = new Error("Product not found.");

    error.statusCode = 404;

    throw error;
  }

  const technologyModel = await TechnologyModel.findById(data.technologyModel);

  if (!technologyModel) {
    const error = new Error("Technology model not found.");

    error.statusCode = 404;

    throw error;
  }

  const exists = await ProductTechnology.findOne({
    product: data.product,

    technologyModel: data.technologyModel,
  });

  if (exists) {
    const error = new Error(
      "This technology is already assigned to this product.",
    );

    error.statusCode = 409;

    throw error;
  }

  if (data.extraPrice && data.extraPrice < 0) {
    const error = new Error("Extra price cannot be negative.");

    error.statusCode = 400;

    throw error;
  }

  const productTechnology = await ProductTechnology.create(data);

  return await productTechnology.populate(["product", "technologyModel"]);
};

export const getProductTechnologies = async (productId) => {
  return await ProductTechnology.find({
    product: productId,
  })

    .populate("product")

    .populate("technologyModel")

    .sort({
      displayOrder: 1,

      createdAt: -1,
    });
};

export const getProductTechnologyById = async (id) => {
  return await ProductTechnology.findById(id)

    .populate("product")

    .populate("technologyModel");
};

export const updateProductTechnology = async (id, data) => {
  if (data.extraPrice && data.extraPrice < 0) {
    const error = new Error("Extra price cannot be negative.");

    error.statusCode = 400;

    throw error;
  }

  return await ProductTechnology.findByIdAndUpdate(
    id,

    data,

    {
      new: true,

      runValidators: true,
    },
  )

    .populate("product")

    .populate("technologyModel");
};

export const deleteProductTechnology = async (id) => {
  return await ProductTechnology.findByIdAndDelete(id);
};
