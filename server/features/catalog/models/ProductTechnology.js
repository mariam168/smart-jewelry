import mongoose from "mongoose";

const productTechnologySchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },

    technologyModel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TechnologyModel",
      required: true,
      index: true,
    },

    extraPrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    isDefault: {
      type: Boolean,
      default: false,
    },

    isSelectable: {
      type: Boolean,
      default: true,
    },

    displayOrder: {
      type: Number,
      default: 0,
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

productTechnologySchema.index(
  {
    product: 1,
    technologyModel: 1,
  },
  {
    unique: true,
  },
);

export default mongoose.model("ProductTechnology", productTechnologySchema);
