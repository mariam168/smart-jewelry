import Category from "../models/Category.js";
import Product from "../models/Product.js";

const generateSlug = (text) => {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "");
};

export const createCategory = async (categoryData) => {
  const { name, description, image, sortOrder } = categoryData;

  if (!name?.en?.trim()) {
    const error = new Error("English category name is required.");
    error.statusCode = 400;
    throw error;
  }

  if (!name?.ar?.trim()) {
    const error = new Error("Arabic category name is required.");
    error.statusCode = 400;
    throw error;
  }

  const slug = generateSlug(name.en);

  if (!slug) {
    const error = new Error(
      "Unable to generate category slug from the English name.",
    );

    error.statusCode = 400;

    throw error;
  }

  const existingCategory = await Category.findOne({
    slug,
  });

  if (existingCategory) {
    const error = new Error("Category already exists.");
    error.statusCode = 409;
    throw error;
  }

  return await Category.create({
    name: {
      en: name.en.trim(),
      ar: name.ar.trim(),
    },

    slug,

    description: {
      en: description?.en?.trim() || "",
      ar: description?.ar?.trim() || "",
    },

    image: image || "",

    sortOrder: Number(sortOrder || 0),
  });
};

export const getCategories = async () => {
  const categories = await Category.find()
    .sort({
      sortOrder: 1,
      createdAt: -1,
    })
    .lean();

  const categoriesWithProductCount = await Promise.all(
    categories.map(async (category) => {
      const productCount = await Product.countDocuments({
        category: category._id,
      });

      return {
        ...category,
        productCount,
      };
    }),
  );

  return categoriesWithProductCount;
};

export const getCategoryById = async (id) => {
  return await Category.findById(id);
};

export const updateCategory = async (id, data) => {
  const updateData = {};

  if (data.name) {
    if (!data.name.en?.trim()) {
      const error = new Error("English category name is required.");
      error.statusCode = 400;
      throw error;
    }

    if (!data.name.ar?.trim()) {
      const error = new Error("Arabic category name is required.");
      error.statusCode = 400;
      throw error;
    }

    updateData.name = {
      en: data.name.en.trim(),
      ar: data.name.ar.trim(),
    };

    updateData.slug = generateSlug(data.name.en);

    if (!updateData.slug) {
      const error = new Error(
        "Unable to generate category slug from the English name.",
      );

      error.statusCode = 400;

      throw error;
    }
  }

  if (data.description) {
    updateData.description = {
      en: data.description.en?.trim() || "",
      ar: data.description.ar?.trim() || "",
    };
  }

  if (data.image !== undefined) {
    updateData.image = data.image;
  }

  if (data.sortOrder !== undefined) {
    updateData.sortOrder = Number(data.sortOrder);
  }

  return await Category.findByIdAndUpdate(id, updateData, {
    returnDocument: "after",
    runValidators: true,
  });
};

export const deleteCategory = async (id) => {
  return await Category.findByIdAndDelete(id);
};