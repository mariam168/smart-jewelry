import Category from "../models/Category.js";
import Product from "../models/Product.js";
const generateSlug = (text) => {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");
};

export const createCategory = async (categoryData) => {
  if (!categoryData.name) {
    const error = new Error("Category name is required.");
    error.statusCode = 400;
    throw error;
  }

  const slug = categoryData.slug
    ? categoryData.slug.toLowerCase()
    : generateSlug(categoryData.name);

  const existingCategory = await Category.findOne({
    slug,
  });

  if (existingCategory) {
    const error = new Error("Category already exists.");
    error.statusCode = 409;
    throw error;
  }

  return await Category.create({
    ...categoryData,
    slug,
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
  if (data.name && !data.slug) {
    data.slug = generateSlug(data.name);
  }

  if (data.slug) {
    data.slug = data.slug.toLowerCase();
  }

  return await Category.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
};

export const deleteCategory = async (id) => {
  return await Category.findByIdAndDelete(id);
};
