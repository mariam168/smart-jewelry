import crypto from "crypto";

import Technology from "../models/Technology.js";
import TechnologyModel from "../models/TechnologyModel.js";

const createError = (message, statusCode = 400) => {
  const error = new Error(message);

  error.statusCode = statusCode;

  return error;
};

const generateModelCode = () => {
  const randomPart = crypto
    .randomBytes(5)
    .toString("hex")
    .toUpperCase();

  return `TM-${randomPart}`;
};

const generateUniqueModelCode = async () => {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const modelCode = generateModelCode();

    const existingModel = await TechnologyModel.exists({
      modelCode,
    });

    if (!existingModel) {
      return modelCode;
    }
  }

  throw createError(
    "Unable to generate a unique technology model code. Please try again.",
    500,
  );
};

export const createTechnologyModel = async (data) => {
  if (!data.technology) {
    throw createError("Technology is required.");
  }

  const technology = await Technology.findById(data.technology);

  if (!technology) {
    throw createError("Technology not found.", 404);
  }

  if (!data.modelName || !String(data.modelName).trim()) {
    throw createError("Model name is required.");
  }

  const modelCode = await generateUniqueModelCode();

  const {
    modelCode: ignoredModelCode,
    ...technologyModelData
  } = data;

  const technologyModel = await TechnologyModel.create({
    ...technologyModelData,

    modelName: String(data.modelName).trim(),

    modelCode,
  });

  return technologyModel.populate("technology");
};

export const getTechnologyModels = async () => {
  return TechnologyModel.find()
    .populate("technology")
    .sort({
      createdAt: -1,
    });
};

export const getTechnologyModelById = async (id) => {
  return TechnologyModel.findById(id).populate("technology");
};

export const updateTechnologyModel = async (id, data) => {
  /*
    Model Code is intentionally excluded.
    Once generated, it cannot be manually changed.
  */
  const {
    modelCode: ignoredModelCode,
    ...updateData
  } = data;

  if (updateData.technology) {
    const technology = await Technology.findById(
      updateData.technology,
    );

    if (!technology) {
      throw createError("Technology not found.", 404);
    }
  }

  if (updateData.modelName !== undefined) {
    if (!String(updateData.modelName).trim()) {
      throw createError("Model name is required.");
    }

    updateData.modelName = String(updateData.modelName).trim();
  }

  return TechnologyModel.findByIdAndUpdate(
    id,
    updateData,
    {
      new: true,
      runValidators: true,
    },
  ).populate("technology");
};

export const deleteTechnologyModel = async (id) => {
  return TechnologyModel.findByIdAndDelete(id);
};