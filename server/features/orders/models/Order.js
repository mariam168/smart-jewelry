import mongoose from "mongoose";

const orderVariantSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    name: {
      type: String,
      default: "",
      trim: true,
    },

    color: {
      type: String,
      default: "",
      trim: true,
    },

    size: {
      type: String,
      default: "",
      trim: true,
    },

    material: {
      type: String,
      default: "",
      trim: true,
    },

    finish: {
      type: String,
      default: "",
      trim: true,
    },

    sku: {
      type: String,
      default: "",
      trim: true,
    },

    price: {
      type: Number,
      default: 0,
      min: 0,
    },

    image: {
      type: String,
      default: "",
    },
  },
  {
    _id: false,
  },
);

const orderTechnologySchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    name: {
      type: String,
      default: "",
      trim: true,
    },

    modelName: {
      type: String,
      default: "",
      trim: true,
    },

    modelCode: {
      type: String,
      default: "",
      trim: true,
      uppercase: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    manufacturer: {
      type: String,
      default: "",
      trim: true,
    },

    image: {
      type: String,
      default: "",
    },

    requiresBattery: {
      type: Boolean,
      default: false,
    },

    requiresActivation: {
      type: Boolean,
      default: false,
    },

    requiresSubscription: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    technology: {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
      },

      name: {
        type: String,
        default: "",
        trim: true,
      },

      code: {
        type: String,
        default: "",
        trim: true,
        uppercase: true,
      },
    },

    extraPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    _id: false,
  },
);

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    image: {
      type: String,
      default: "",
    },

    variant: {
      type: orderVariantSchema,
      default: null,
    },

    technologyModel: {
      type: orderTechnologySchema,
      default: null,
    },

    variantPrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    technologyPrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    itemTotal: {
      type: Number,
      required: true,
      min: 0,
    },

    smartUnit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SmartUnit",
      default: null,
    },

    experience: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Experience",
      default: null,
    },

    manufacturingStatus: {
      type: String,

      enum: [
        "not_required",
        "pending",
        "assigned",
        "manufacturing",
        "ready",
      ],

      default: "not_required",
    },
  },
  {
    _id: true,
  },
);

const shippingAddressSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    country: {
      type: String,
      default: "Egypt",
      trim: true,
    },
  },
  {
    _id: false,
  },
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: {
      type: [orderItemSchema],
      required: true,

      validate: {
        validator: (items) => Array.isArray(items) && items.length > 0,
        message: "Order must contain at least one item",
      },
    },

    shippingAddress: {
      type: shippingAddressSchema,
      required: true,
    },

    shippingArea: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ShippingArea",
      default: null,
    },

    shippingAreaName: {
      type: String,
      required: true,
      trim: true,
    },

    shippingCost: {
      type: Number,
      required: true,
      min: 0,
    },

    paymentMethod: {
      type: String,
      enum: ["cash_on_delivery", "card"],
      default: "cash_on_delivery",
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },

    orderStatus: {
      type: String,

      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],

      default: "pending",
    },

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    total: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

const Order =
  mongoose.models.Order ||
  mongoose.model("Order", orderSchema);

export default Order;