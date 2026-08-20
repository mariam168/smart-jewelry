import {
  createImage,
  getProductImages,
  deleteImage,
  setPrimaryImage,
} from "../services/productImageService.js";

export const createImageController = async (req, res, next) => {
  try {
    const image = await createImage(req.body);

    res.status(201).json({
      success: true,

      data: { image },
    });
  } catch (error) {
    next(error);
  }
};

export const getImagesController = async (req, res, next) => {
  try {
    const images = await getProductImages(req.params.productId);

    res.json({
      success: true,

      data: { images },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteImageController = async (req, res, next) => {
  try {
    await deleteImage(req.params.id);

    res.json({
      success: true,

      message: "Image deleted.",
    });
  } catch (error) {
    next(error);
  }
};

export const setPrimaryImageController = async (req, res, next) => {
  try {
    const image = await setPrimaryImage(
      req.body.productId,

      req.params.id,
    );

    res.json({
      success: true,

      data: { image },
    });
  } catch (error) {
    next(error);
  }
};
