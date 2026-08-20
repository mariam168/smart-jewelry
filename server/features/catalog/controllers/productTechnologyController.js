import {
  createProductTechnology,
  getProductTechnologies,
  getProductTechnologyById,
  updateProductTechnology,
  deleteProductTechnology,
} from "../services/productTechnologyService.js";

export const createProductTechnologyController = async (req, res, next) => {
  try {
    const productTechnology = await createProductTechnology(req.body);

    return res.status(201).json({
      success: true,
      message: "Product technology created successfully.",
      data: {
        productTechnology,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getProductTechnologiesController = async (req, res, next) => {
  try {
    const productTechnologies = await getProductTechnologies(
      req.params.productId,
    );

    return res.json({
      success: true,
      data: {
        productTechnologies,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getProductTechnologyController = async (req, res, next) => {
  try {
    const productTechnology = await getProductTechnologyById(req.params.id);

    if (!productTechnology) {
      return res.status(404).json({
        success: false,
        message: "Product technology not found.",
      });
    }

    return res.json({
      success: true,
      data: {
        productTechnology,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateProductTechnologyController = async (req, res, next) => {
  try {
    const productTechnology = await updateProductTechnology(
      req.params.id,
      req.body,
    );

    if (!productTechnology) {
      return res.status(404).json({
        success: false,
        message: "Product technology not found.",
      });
    }

    return res.json({
      success: true,
      message: "Product technology updated successfully.",
      data: {
        productTechnology,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProductTechnologyController = async (req, res, next) => {
  try {
    const productTechnology = await deleteProductTechnology(req.params.id);

    if (!productTechnology) {
      return res.status(404).json({
        success: false,
        message: "Product technology not found.",
      });
    }

    return res.json({
      success: true,
      message: "Product technology deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};
