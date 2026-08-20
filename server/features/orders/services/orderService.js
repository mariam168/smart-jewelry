import mongoose from "mongoose";

import Order from "../models/Order.js";
import Cart from "../../cart/models/Cart.js";

const generateOrderNumber = () => {
  const timestamp = Date.now();

  const random = Math.floor(1000 + Math.random() * 9000);

  return `SJ-${timestamp}-${random}`;
};

export const createOrder = async (
  userId,
  { shippingAddress, paymentMethod = "cash_on_delivery" },
) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    const error = new Error("Invalid user ID");

    error.statusCode = 400;

    throw error;
  }

  const cart = await Cart.findOne({
    user: userId,
  })
    .populate({
      path: "items.product",
      select: "name price images primaryImage image",
    })
    .populate({
      path: "items.variant",
    })
    .populate({
      path: "items.productTechnology",

      populate: {
        path: "technologyModel",

        populate: {
          path: "technology",
        },
      },
    });

  if (!cart || !cart.items || cart.items.length === 0) {
    const error = new Error("Your cart is empty");

    error.statusCode = 400;

    throw error;
  }

  if (
    !shippingAddress ||
    !shippingAddress.firstName ||
    !shippingAddress.lastName ||
    !shippingAddress.phone ||
    !shippingAddress.address ||
    !shippingAddress.city
  ) {
    const error = new Error("Complete shipping address is required");

    error.statusCode = 400;

    throw error;
  }

  const allowedPaymentMethods = ["cash_on_delivery", "card"];

  if (!allowedPaymentMethods.includes(paymentMethod)) {
    const error = new Error("Invalid payment method");

    error.statusCode = 400;

    throw error;
  }

  const orderItems = cart.items.map((item) => {
    const product = item.product;

    if (!product) {
      const error = new Error(
        "One of the products in your cart no longer exists",
      );

      error.statusCode = 400;

      throw error;
    }

    const productPrice = Number(product.price || 0);

    const variant = item.variant || null;

    const variantPrice = Number(variant?.price || 0);

    const productTechnology = item.productTechnology || null;

    const technologyModel = productTechnology?.technologyModel || null;

    const technologyPrice = Number(productTechnology?.extraPrice || 0);

    const basePrice = variantPrice > 0 ? variantPrice : productPrice;

    const unitPrice = basePrice + technologyPrice;

    const quantity = Number(item.quantity || 1);

    const itemTotal = unitPrice * quantity;

    const variantSnapshot = variant
      ? {
          _id: variant._id || null,

          name: variant.name || "",

          color: variant.color || "",

          size: variant.size || "",

          material: variant.material || "",

          finish: variant.finish || "",

          sku: variant.sku || "",

          price: variantPrice,

          image: variant.image || "",
        }
      : null;

    const technologySnapshot = productTechnology
      ? {
          _id: productTechnology._id || null,

          name: technologyModel?.name || "",

          modelName: technologyModel?.modelName || "",

          extraPrice: technologyPrice,

          technology: technologyModel?.technology
            ? {
                _id: technologyModel.technology._id || null,

                name: technologyModel.technology.name || "",
              }
            : {
                _id: null,
                name: "",
              },
        }
      : null;

    const productImage =
      product.images?.[0] || product.primaryImage || product.image || "";

    return {
      product: product._id,

      name: product.name,

      price: productPrice,

      image: productImage,

      variant: variantSnapshot,

      technologyModel: technologySnapshot,

      variantPrice,

      technologyPrice,

      unitPrice,

      quantity,

      itemTotal,

      smartUnit: null,

      experience: null,

      manufacturingStatus: technologyModel ? "pending" : "not_required",
    };
  });

  const subtotal = orderItems.reduce((total, item) => {
    return total + item.itemTotal;
  }, 0);

  const shippingCost = subtotal >= 1000 ? 0 : 50;

  const total = subtotal + shippingCost;

  const order = await Order.create({
    orderNumber: generateOrderNumber(),

    user: userId,

    items: orderItems,

    shippingAddress,

    paymentMethod,

    paymentStatus: "pending",

    orderStatus: "pending",

    subtotal,

    shippingCost,

    total,
  });

  cart.items = [];

  await cart.save();

  const populatedOrder = await Order.findById(order._id)
    .populate("user", "email")
    .populate("items.product", "name price images primaryImage image")
    .populate("items.smartUnit")
    .populate("items.experience");

  return populatedOrder;
};

export const getUserOrders = async (userId) => {
  const orders = await Order.find({
    user: userId,
  })
    .populate("items.product", "name price images primaryImage image")
    .sort({
      createdAt: -1,
    });

  return orders;
};

export const getUserOrderById = async (userId, orderId) => {
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    const error = new Error("Invalid order ID");

    error.statusCode = 400;

    throw error;
  }

  const order = await Order.findOne({
    _id: orderId,
    user: userId,
  }).populate("items.product", "name price images primaryImage image");

  if (!order) {
    const error = new Error("Order not found");

    error.statusCode = 404;

    throw error;
  }

  return order;
};

export const getAllOrders = async () => {
  const orders = await Order.find()
    .populate("user", "email")
    .populate("items.product", "name price images primaryImage image")
    .sort({
      createdAt: -1,
    });

  return orders;
};

export const getOrderById = async (orderId) => {
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    const error = new Error("Invalid order ID");

    error.statusCode = 400;

    throw error;
  }

  const order = await Order.findById(orderId)
    .populate("user", "email")
    .populate("items.product", "name price images primaryImage image");

  if (!order) {
    const error = new Error("Order not found");

    error.statusCode = 404;

    throw error;
  }

  return order;
};

export const updateOrderStatus = async (orderId, orderStatus) => {
  const allowedStatuses = [
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ];

  if (!allowedStatuses.includes(orderStatus)) {
    const error = new Error("Invalid order status");

    error.statusCode = 400;

    throw error;
  }

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    const error = new Error("Invalid order ID");

    error.statusCode = 400;

    throw error;
  }

  const order = await Order.findByIdAndUpdate(
    orderId,
    {
      orderStatus,
    },
    {
      new: true,
      runValidators: true,
    },
  )
    .populate("user", "email")
    .populate("items.product", "name price images primaryImage image");

  if (!order) {
    const error = new Error("Order not found");

    error.statusCode = 404;

    throw error;
  }

  return order;
};
