import mongoose from "mongoose";
import crypto from "crypto";

const generateUniqueCode = () => {
  const randomPart = crypto.randomBytes(5).toString("hex").toUpperCase();

  return `SU-${randomPart}`;
};

const smartUnitInstanceSchema = new mongoose.Schema(
  {
    smartUnit: {
      type: mongoose.Schema.Types.ObjectId,

      ref: "SmartUnit",

      required: true,

      index: true,
    },

    uniqueCode: {
      type: String,

      required: true,

      unique: true,

      trim: true,

      uppercase: true,

      index: true,

      default: generateUniqueCode,
    },

    serialNumber: {
      type: String,

      required: true,

      unique: true,

      trim: true,

      uppercase: true,

      index: true,
    },

    status: {
      type: String,

      enum: [
        "available",

        "reserved",

        "assigned",

        "activated",

        "inactive",

        "damaged",
      ],

      default: "available",
    },

    firmwareVersion: {
      type: String,

      default: "",

      trim: true,
    },

    // New field
    // Date when physical unit entered inventory

    addedAt: {
      type: Date,

      default: Date.now,
    },

    assignedAt: {
      type: Date,

      default: null,
    },

    activatedAt: {
      type: Date,

      default: null,
    },

    damagedAt: {
      type: Date,

      default: null,
    },

    damagedReason: {
      type: String,

      default: "",

      trim: true,
    },

    notes: {
      type: String,

      default: "",

      trim: true,
    },
  },

  {
    timestamps: true,
  },
);

export default mongoose.model(
  "SmartUnitInstance",

  smartUnitInstanceSchema,
);
