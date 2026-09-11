import mongoose from "mongoose";

const localizedTextSchema = new mongoose.Schema(
  {
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
  },
  {
    _id: false,
  },
);

const featureSchema = new mongoose.Schema(
  {
    title: {
      type: localizedTextSchema,
      default: () => ({}),
    },

    desc: {
      type: localizedTextSchema,
      default: () => ({}),
    },
  },
  {
    _id: false,
  },
);

const heroSectionSchema = new mongoose.Schema(
  {
    eyebrow: {
      type: localizedTextSchema,
      default: () => ({}),
    },

    titlePart1: {
      type: localizedTextSchema,
      default: () => ({}),
    },

    titlePart2: {
      type: localizedTextSchema,
      default: () => ({}),
    },

    description: {
      type: localizedTextSchema,
      default: () => ({}),
    },

    cta: {
      type: localizedTextSchema,
      default: () => ({}),
    },

    image: {
      type: String,
      trim: true,
      default: "",
    },

    imageAlt: {
      type: localizedTextSchema,
      default: () => ({}),
    },

    badge: {
      nfc: {
        type: localizedTextSchema,
        default: () => ({}),
      },

      subtext: {
        type: localizedTextSchema,
        default: () => ({}),
      },
    },

    features: {
      design: {
        type: featureSchema,
        default: () => ({}),
      },

      memories: {
        type: featureSchema,
        default: () => ({}),
      },

      nfc: {
        type: featureSchema,
        default: () => ({}),
      },
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

const HeroSection = mongoose.model(
  "HeroSection",
  heroSectionSchema,
);

export default HeroSection;