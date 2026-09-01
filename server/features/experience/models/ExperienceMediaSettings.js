import mongoose from "mongoose";

const experienceMediaSettingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: "global",
      unique: true,
      trim: true,
    },

    imageLimit: {
      type: Number,
      default: 5,
      min: 0,
      max: 100,
    },

    videoLimit: {
      type: Number,
      default: 5,
      min: 0,
      max: 100,
    },

    audioLimit: {
      type: Number,
      default: 5,
      min: 0,
      max: 100,
    },

    fileLimit: {
      type: Number,
      default: 5,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  },
);

const ExperienceMediaSettings =
  mongoose.models.ExperienceMediaSettings ||
  mongoose.model(
    "ExperienceMediaSettings",
    experienceMediaSettingsSchema,
  );

export default ExperienceMediaSettings;