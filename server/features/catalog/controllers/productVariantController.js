import {
  createVariant,
  getProductVariants,
  getVariantById,
  updateVariant,
  deleteVariant,
} from "../services/productVariantService.js";

export const createVariantController = async (req, res, next) => {
  try {
    const variant = await createVariant(req.body);

    return res.status(201).json({
      success: true,

      message: "Variant created successfully.",

      data: { variant },
    });
  } catch (error) {
    next(error);
  }
};

export const getProductVariantsController = async (req, res, next) => {
  try {
    const variants = await getProductVariants(req.params.productId);

    return res.json({
      success: true,

      data: {
        variants,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getVariantController = async (req, res, next) => {
  try {
    const variant = await getVariantById(req.params.id);

    if (!variant) {
      return res.status(404).json({
        success: false,

        message: "Variant not found.",
      });
    }

    return res.json({
      success: true,

      data: {
        variant,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateVariantController = async (req, res, next) => {
  try {
    const variant = await updateVariant(
      req.params.id,

      req.body,
    );

    if (!variant) {
      return res.status(404).json({
        success: false,

        message: "Variant not found.",
      });
    }

    return res.json({
      success: true,

      message: "Variant updated.",

      data: { variant },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteVariantController = async (req, res, next) => {
  try {
    const variant = await deleteVariant(req.params.id);

    if (!variant) {
      return res.status(404).json({
        success: false,

        message: "Variant not found.",
      });
    }

    return res.json({
      success: true,

      message: "Variant deleted.",
    });
  } catch (error) {
    next(error);
  }
};
