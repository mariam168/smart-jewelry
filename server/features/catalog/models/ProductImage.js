import mongoose from "mongoose";

const localizedAltSchema = new mongoose.Schema(
  {
    en: {
      type: String,
      default: "",
      trim: true,
    },

    ar: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    _id: false,
  },
);

const productImageSchema =
  new mongoose.Schema(
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
        type: localizedAltSchema,
        default: () => ({
          en: "",
          ar: "",
        }),
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

const ProductImage =
  mongoose.models.ProductImage ||
  mongoose.model(
    "ProductImage",
    productImageSchema,
  );

export default ProductImage;