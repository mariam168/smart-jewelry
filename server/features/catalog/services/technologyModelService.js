import Technology from "../models/Technology.js";
import TechnologyModel from "../models/TechnologyModel.js";

export const createTechnologyModel = async (data) => {
  const technology = await Technology.findById(data.technology);

  if (!technology) {
    const error = new Error("Technology not found.");

    error.statusCode = 404;

    throw error;
  }

  const existing = await TechnologyModel.findOne({
    modelCode: data.modelCode.toUpperCase(),
  });

  if (existing) {
    const error = new Error("Model already exists.");

    error.statusCode = 409;

    throw error;
  }

  return await TechnologyModel.create({
    ...data,

    modelCode: data.modelCode.toUpperCase(),
  });
};

export const getTechnologyModels = async () => {
  return await TechnologyModel.find()

    .populate("technology")

    .sort({
      createdAt: -1,
    });
};

export const getTechnologyModelById = async (id) => {
  return await TechnologyModel.findById(id)

    .populate("technology");
};

export const updateTechnologyModel = async (id, data) => {
  if (data.modelCode) {
    data.modelCode = data.modelCode.toUpperCase();
  }

  return await TechnologyModel.findByIdAndUpdate(
    id,

    data,

    {
      new: true,

      runValidators: true,
    },
  );
};

export const deleteTechnologyModel = async (id) => {
  return await TechnologyModel.findByIdAndDelete(id);
};
