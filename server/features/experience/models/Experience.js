import mongoose from "mongoose";

const experienceSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },

    orderItem: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    smartUnit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SmartUnit",
      required: true,
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    serialNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
      immutable: true,
    },

    manageToken: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    publicToken: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    slug: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },

    accessDate: {
      type: String,
      default: "",
      trim: true,
      select: false,

      validate: {
        validator(value) {
          if (!value) {
            return true;
          }

          return /^\d{4}-\d{2}-\d{2}$/.test(value);
        },

        message: "Access date must use YYYY-MM-DD format",
      },
    },

    type: {
      type: String,
      enum: ["personal", "gift"],
      default: "personal",
    },

    status: {
      type: String,
      enum: [
        "waiting",
        "draft",
        "active",
        "expired",
        "disabled",
      ],
      default: "waiting",
    },

    visits: {
      type: Number,
      default: 0,
      min: 0,
    },

    activatedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

experienceSchema.index({
  order: 1,
  orderItem: 1,
});

experienceSchema.index({
  smartUnit: 1,
});

experienceSchema.index(
  {
    serialNumber: 1,
    slug: 1,
  },
  {
    unique: true,
    sparse: true,
  },
);

const Experience =
  mongoose.models.Experience ||
  mongoose.model(
    "Experience",
    experienceSchema,
  );

export default Experience;