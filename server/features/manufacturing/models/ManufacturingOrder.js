import mongoose from "mongoose";

const productionUnitSchema = new mongoose.Schema(
  {
    orderItemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    unitNumber: {
      type: Number,
      required: true,
      min: 1,
    },

    smartUnit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SmartUnit",
      default: null,
    },

    smartUnitInstance: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SmartUnitInstance",
      default: null,
      index: true,
    },

    experience: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Experience",
      default: null,
    },

    serialNumber: {
      type: String,
      default: "",
      trim: true,
      uppercase: true,
    },

    status: {
      type: String,

      enum: [
        "pending",
        "unit_assigned",
        "experience_created",
        "in_production",
        "completed",
        "failed",
      ],

      default: "pending",
    },

    notes: {
      type: String,
      default: "",
      trim: true,
    },

    startedAt: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    _id: true,
  },
);

const manufacturingOrderSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true,
      index: true,
    },

    orderNumber: {
      type: String,
      required: true,
      trim: true,
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    status: {
      type: String,

      enum: ["pending", "in_progress", "completed", "cancelled"],

      default: "pending",
      index: true,
    },

    units: {
      type: [productionUnitSchema],
      default: [],
    },

    notes: {
      type: String,
      default: "",
      trim: true,
    },

    startedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    startedAt: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const ManufacturingOrder = mongoose.model(
  "ManufacturingOrder",
  manufacturingOrderSchema,
);

export default ManufacturingOrder;
