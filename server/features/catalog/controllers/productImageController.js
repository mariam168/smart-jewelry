import {
  createImage,
  getProductImages,
  deleteImage,
  setPrimaryImage,
} from "../services/productImageService.js";

export const createImageController = async (
  req,
  res,
  next,
) => {
  try {
    const image = await createImage(req.body);

    return res.status(201).json({
      success: true,
      message:
        "Product image created successfully.",
      data: {
        image,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getImagesController = async (
  req,
  res,
  next,
) => {
  try {
    const images =
      await getProductImages(
        req.params.productId,
      );

    return res.status(200).json({
      success: true,
      data: {
        images,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteImageController = async (
  req,
  res,
  next,
) => {
  try {
    const image = await deleteImage(
      req.params.id,
    );

    if (!image) {
      return res.status(404).json({
        success: false,
        message:
          "Product image not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Image deleted successfully.",
      data: {
        image,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const setPrimaryImageController =
  async (
    req,
    res,
    next,
  ) => {
    try {
      const { productId } = req.body;

      if (!productId) {
        return res.status(400).json({
          success: false,
          message:
            "Product ID is required.",
        });
      }

      const image =
        await setPrimaryImage(
          productId,
          req.params.id,
        );

      if (!image) {
        return res.status(404).json({
          success: false,
          message:
            "Product image not found for this product.",
        });
      }

      return res.status(200).json({
        success: true,
        message:
          "Primary image updated successfully.",
        data: {
          image,
        },
      });
    } catch (error) {
      next(error);
    }
  };