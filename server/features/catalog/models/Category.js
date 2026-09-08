import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      en: {
        type: String,
        required: true,
        trim: true,
      },

      ar: {
        type: String,
        required: true,
        trim: true,
      },
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    description: {
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

    image: {
      type: String,
      default: "",
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

export default mongoose.model("Category", categorySchema);