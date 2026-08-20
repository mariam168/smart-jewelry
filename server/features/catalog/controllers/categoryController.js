import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../services/categoryService.js";

export const createCategoryController = async (req, res, next) => {
  try {
    const category = await createCategory(req.body);

    return res.status(201).json({
      success: true,
      message: "Category created successfully.",
      data: {
        category,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getCategoriesController = async (req, res, next) => {
  try {
    const categories = await getCategories();

    return res.status(200).json({
      success: true,
      data: {
        categories,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getCategoryController = async (req, res, next) => {
  try {
    const category = await getCategoryById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        category,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateCategoryController = async (req, res, next) => {
  try {
    const category = await updateCategory(req.params.id, req.body);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Category updated successfully.",
      data: {
        category,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCategoryController = async (req, res, next) => {
  try {
    const category = await deleteCategory(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};
