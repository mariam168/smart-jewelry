import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    image: {
      type: String,
      default: "",
    },

    images: [
      {
        type: String,
      },
    ],

    technologyModels: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TechnologyModel",
      },
    ],

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    costPrice: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    comparePrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    sku: {
      type: String,
      default: "",
      trim: true,
      uppercase: true,
    },

    material: {
      type: String,
      default: "",
    },

    color: {
      type: String,
      default: "",
    },

    weight: {
      type: Number,
      default: 0,
    },

    featured: {
      type: Boolean,
      default: false,
    },

    bestSeller: {
      type: Boolean,
      default: false,
    },

    primaryImage: {
      type: String,
      default: "",
    },

    shortDescription: {
      type: String,
      default: "",
      trim: true,
    },

    tags: [
      {
        type: String,
        trim: true,
      },
    ],

    seoTitle: {
      type: String,
      default: "",
      trim: true,
    },

    seoDescription: {
      type: String,
      default: "",
      trim: true,
    },

    seoSlug: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },

    preparationDays: {
      type: Number,
      default: 0,
      min: 0,
    },

    careInstructions: {
      type: String,
      default: "",
    },

    isCustomizable: {
      type: Boolean,
      default: false,
    },

    newArrival: {
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

productSchema.index(
  {
    sku: 1,
  },
  {
    unique: true,

    partialFilterExpression: {
      sku: {
        $gt: "",
      },
    },
  },
);

const Product =
  mongoose.models.Product ||
  mongoose.model("Product", productSchema);

export default Product;