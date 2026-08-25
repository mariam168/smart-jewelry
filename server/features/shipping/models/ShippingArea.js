import mongoose from "mongoose";

const shippingAreaSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    shippingFee: {
      type: Number,
      required: true,
      min: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

shippingAreaSchema.index(
  {
    name: 1,
  },
  {
    unique: true,
  },
);

const ShippingArea =
  mongoose.models.ShippingArea ||
  mongoose.model(
    "ShippingArea",
    shippingAreaSchema,
  );

export default ShippingArea;