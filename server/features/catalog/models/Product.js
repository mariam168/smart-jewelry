import mongoose from "mongoose";

const localizedStringSchema = new mongoose.Schema(
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

const localizedTagsSchema = new mongoose.Schema(
  {
    en: [
      {
        type: String,
        trim: true,
      },
    ],

    ar: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    _id: false,
  },
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: localizedStringSchema,
      required: true,
    },

    shortDescription: {
      type: localizedStringSchema,
      default: () => ({
        en: "",
        ar: "",
      }),
    },

    description: {
      type: localizedStringSchema,
      required: true,
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

    primaryImage: {
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

    technologyRequired: {
      type: Boolean,
      default: false,
      index: true,
    },

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
      type: localizedStringSchema,
      default: () => ({
        en: "",
        ar: "",
      }),
    },

    color: {
      type: localizedStringSchema,
      default: () => ({
        en: "",
        ar: "",
      }),
    },

    weight: {
      type: Number,
      default: 0,
      min: 0,
    },

    featured: {
      type: Boolean,
      default: false,
    },

    bestSeller: {
      type: Boolean,
      default: false,
    },

    newArrival: {
      type: Boolean,
      default: false,
    },

    tags: {
      type: localizedTagsSchema,
      default: () => ({
        en: [],
        ar: [],
      }),
    },

    seoTitle: {
      type: localizedStringSchema,
      default: () => ({
        en: "",
        ar: "",
      }),
    },

    seoDescription: {
      type: localizedStringSchema,
      default: () => ({
        en: "",
        ar: "",
      }),
    },

    seoSlug: {
      type: localizedStringSchema,
      default: () => ({
        en: "",
        ar: "",
      }),
    },

    preparationDays: {
      type: Number,
      default: 0,
      min: 0,
    },

    careInstructions: {
      type: localizedStringSchema,
      default: () => ({
        en: "",
        ar: "",
      }),
    },

    isCustomizable: {
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
  mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;
