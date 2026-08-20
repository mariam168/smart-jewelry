import {
  createTechnologyModel,
  getTechnologyModels,
  getTechnologyModelById,
  updateTechnologyModel,
  deleteTechnologyModel,
} from "../services/technologyModelService.js";

export const createTechnologyModelController = async (req, res, next) => {
  try {
    const technologyModel = await createTechnologyModel(req.body);

    return res.status(201).json({
      success: true,

      message: "Technology model created successfully.",

      data: {
        technologyModel,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getTechnologyModelsController = async (req, res, next) => {
  try {
    const technologyModels = await getTechnologyModels();

    return res.json({
      success: true,

      data: {
        technologyModels,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getTechnologyModelController = async (req, res, next) => {
  try {
    const technologyModel = await getTechnologyModelById(req.params.id);

    if (!technologyModel) {
      return res.status(404).json({
        success: false,

        message: "Technology model not found.",
      });
    }

    return res.json({
      success: true,

      data: {
        technologyModel,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateTechnologyModelController = async (req, res, next) => {
  try {
    const technologyModel = await updateTechnologyModel(
      req.params.id,

      req.body,
    );

    if (!technologyModel) {
      return res.status(404).json({
        success: false,

        message: "Technology model not found.",
      });
    }

    return res.json({
      success: true,

      message: "Technology model updated successfully.",

      data: {
        technologyModel,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTechnologyModelController = async (req, res, next) => {
  try {
    const technologyModel = await deleteTechnologyModel(req.params.id);

    if (!technologyModel) {
      return res.status(404).json({
        success: false,

        message: "Technology model not found.",
      });
    }

    return res.json({
      success: true,

      message: "Technology model deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};
