import mongoose from "mongoose";

const productVariantSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    name: {
      type: String,
      trim: true,
      default: "",
    },

    color: {
      type: String,
      trim: true,
      default: "",
    },

    size: {
      type: String,
      trim: true,
      default: "",
    },

    material: {
      type: String,
      trim: true,
      default: "",
    },

    finish: {
      type: String,
      trim: true,
      default: "",
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    compareAtPrice: {
      type: Number,
      min: 0,
      default: null,
    },

    stock: {
      type: Number,
      default: 0,
      min: 0,
    },

    image: {
      type: String,
      default: "",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

const ProductVariant = mongoose.model("ProductVariant", productVariantSchema);

export default ProductVariant;
