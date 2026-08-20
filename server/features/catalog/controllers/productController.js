import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../services/productService.js";

export const createProductController = async (req, res, next) => {
  try {
    const product = await createProduct(req.body);

    return res.status(201).json({
      success: true,

      message: "Product created successfully.",

      data: {
        product,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getProductsController = async (req, res, next) => {
  try {
    const products = await getAllProducts();

    return res.status(200).json({
      success: true,

      data: {
        products,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getProductController = async (req, res, next) => {
  try {
    const product = await getProductById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,

        message: "Product not found.",
      });
    }

    return res.status(200).json({
      success: true,

      data: {
        product,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateProductController = async (req, res, next) => {
  try {
    const product = await updateProduct(
      req.params.id,

      req.body,
    );

    if (!product) {
      return res.status(404).json({
        success: false,

        message: "Product not found.",
      });
    }

    return res.status(200).json({
      success: true,

      message: "Product updated successfully.",

      data: {
        product,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProductController = async (req, res, next) => {
  try {
    const product = await deleteProduct(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,

        message: "Product not found.",
      });
    }

    return res.status(200).json({
      success: true,

      message: "Product deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};
