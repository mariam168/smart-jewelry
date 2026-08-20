import mongoose from "mongoose";

const productImageSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    imageUrl: {
      type: String,
      required: true,
      trim: true,
    },

    alt: {
      type: String,
      default: "",
    },

    isPrimary: {
      type: Boolean,
      default: false,
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

const ProductImage = mongoose.model("ProductImage", productImageSchema);

export default ProductImage;
