import {
  createTechnology,
  getTechnologies,
  getTechnologyById,
  updateTechnology,
  deleteTechnology,
} from "../services/technologyService.js";

export const createTechnologyController = async (req, res, next) => {
  try {
    const technology = await createTechnology(req.body);

    return res.status(201).json({
      success: true,

      message: "Technology created successfully.",

      data: {
        technology,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getTechnologiesController = async (req, res, next) => {
  try {
    const technologies = await getTechnologies();

    return res.json({
      success: true,

      data: {
        technologies,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getTechnologyController = async (req, res, next) => {
  try {
    const technology = await getTechnologyById(req.params.id);

    if (!technology) {
      return res.status(404).json({
        success: false,

        message: "Technology not found.",
      });
    }

    return res.json({
      success: true,

      data: {
        technology,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateTechnologyController = async (req, res, next) => {
  try {
    const technology = await updateTechnology(req.params.id, req.body);

    if (!technology) {
      return res.status(404).json({
        success: false,

        message: "Technology not found.",
      });
    }

    return res.json({
      success: true,

      message: "Technology updated successfully.",

      data: {
        technology,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTechnologyController = async (req, res, next) => {
  try {
    const technology = await deleteTechnology(req.params.id);

    if (!technology) {
      return res.status(404).json({
        success: false,

        message: "Technology not found.",
      });
    }

    return res.json({
      success: true,

      message: "Technology deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};
