import mongoose from "mongoose";

const technologyModelSchema = new mongoose.Schema(
  {
    technology: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Technology",
      required: true,
      index: true,
    },

    modelName: {
      type: String,
      required: true,
      trim: true,
    },

    modelCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    manufacturer: {
      type: String,
      default: "",
      trim: true,
    },

    image: {
      type: String,
      default: "",
    },

    requiresBattery: {
      type: Boolean,
      default: false,
    },

    requiresActivation: {
      type: Boolean,
      default: false,
    },

    requiresSubscription: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("TechnologyModel", technologyModelSchema);
