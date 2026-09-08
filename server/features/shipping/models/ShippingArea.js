import mongoose from "mongoose";

const localizedFieldSchema = {
  en: {
    type: String,
    trim: true,
    default: "",
  },

  ar: {
    type: String,
    trim: true,
    default: "",
  },
};

const shippingAreaSchema = new mongoose.Schema(
  {
    name: localizedFieldSchema,

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
    "name.en": 1,
  },
  {
    unique: true,
  },
);

shippingAreaSchema.index({
  "name.ar": 1,
});

const ShippingArea =
  mongoose.models.ShippingArea ||
  mongoose.model(
    "ShippingArea",
    shippingAreaSchema,
  );

export default ShippingArea;