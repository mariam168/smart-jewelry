import Technology from "../models/Technology.js";

export const createTechnology = async (technologyData) => {
  if (!technologyData.name) {
    const error = new Error("Technology name is required.");
    error.statusCode = 400;
    throw error;
  }

  if (!technologyData.code) {
    const error = new Error("Technology code is required.");
    error.statusCode = 400;
    throw error;
  }

  const existing = await Technology.findOne({
    code: technologyData.code.toUpperCase(),
  });

  if (existing) {
    const error = new Error("Technology already exists.");
    error.statusCode = 409;
    throw error;
  }

  return await Technology.create({
    ...technologyData,
    code: technologyData.code.toUpperCase(),
  });
};

export const getTechnologies = async () => {
  return await Technology.find().sort({
    createdAt: -1,
  });
};

export const getTechnologyById = async (id) => {
  return await Technology.findById(id);
};

export const updateTechnology = async (id, technologyData) => {
  if (technologyData.code) {
    technologyData.code = technologyData.code.toUpperCase();
  }

  return await Technology.findByIdAndUpdate(id, technologyData, {
    new: true,
    runValidators: true,
  });
};

export const deleteTechnology = async (id) => {
  return await Technology.findByIdAndDelete(id);
};
