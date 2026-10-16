import mongoose from "mongoose";

import Order from "../models/Order.js";
import Cart from "../../cart/models/Cart.js";
import ShippingArea from "../../shipping/models/ShippingArea.js";
import Product from "../../catalog/models/Product.js";
const createError = (message, statusCode = 400) => {
  const error = new Error(message);

  error.statusCode = statusCode;

  return error;
};

const generateOrderNumber = () => {
  const timestamp = Date.now();

  const random = Math.floor(1000 + Math.random() * 9000);

  return `SJ-${timestamp}-${random}`;
};

const cleanRequiredText = (value, fieldName, maxLength) => {
  const cleanValue = String(value || "").trim();

  if (!cleanValue) {
    throw createError(`${fieldName} is required`);
  }

  if (cleanValue.length > maxLength) {
    throw createError(`${fieldName} cannot exceed ${maxLength} characters`);
  }

  return cleanValue;
};

const cleanOptionalText = (value, fieldName, maxLength) => {
  const cleanValue = String(value || "").trim();

  if (cleanValue.length > maxLength) {
    throw createError(`${fieldName} cannot exceed ${maxLength} characters`);
  }

  return cleanValue;
};

export const createOrder = async (
  userId,
  {
    manufacturingName,
    ordererName = "",
    manufacturingNotes = "",
    shippingAddress,
    shippingAreaId,
    paymentMethod = "cash_on_delivery",
  },
) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw createError("Invalid user ID");
  }

  const cleanManufacturingName = cleanRequiredText(
    manufacturingName,
    "Name for manufacturing",
    120,
  );
  const cleanOrdererName = cleanOptionalText(
  ordererName,
  "Orderer name",
  120,
);

  const cleanManufacturingNotes = cleanOptionalText(
    manufacturingNotes,
    "Manufacturing notes",
    1000,
  );

  if (!shippingAreaId) {
    throw createError("Please select a shipping area");
  }

  if (!mongoose.Types.ObjectId.isValid(shippingAreaId)) {
    throw createError("Invalid shipping area");
  }

  const shippingArea = await ShippingArea.findOne({
    _id: shippingAreaId,
    isActive: true,
  });

  if (!shippingArea) {
    throw createError("Selected shipping area is not available", 404);
  }

  const cart = await Cart.findOne({
    user: userId,
  })
    .populate({
      path: "items.product",

      select:
        "name price costPrice images primaryImage image technologyRequired",
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
    throw createError("Your cart is empty");
  }

  if (
    !shippingAddress ||
    !shippingAddress.firstName ||
    !shippingAddress.lastName ||
    !shippingAddress.phone ||
    !shippingAddress.address
  ) {
    throw createError("Complete shipping address is required");
  }

  const allowedPaymentMethods = ["cash_on_delivery", "card"];

  if (!allowedPaymentMethods.includes(paymentMethod)) {
    throw createError("Invalid payment method");
  }

  const orderItems = cart.items.map((item) => {
    const product = item.product;

    if (!product) {
      throw createError("One of the products in your cart no longer exists");
    }

    const productTechnology = item.productTechnology || null;

    if (product.technologyRequired === true && !productTechnology) {
      throw createError(
        `${product.name} requires Smart Technology before checkout`,
      );
    }

    if (productTechnology && productTechnology.status === "inactive") {
      throw createError(
        `The selected technology for ${product.name} is no longer active`,
      );
    }

    if (productTechnology && productTechnology.isSelectable === false) {
      throw createError(
        `The selected technology for ${product.name} is no longer selectable`,
      );
    }

    const productPrice = Number(product.price || 0);

    const productCostSnapshot = Number(product.costPrice || 0);

    const variant = item.variant || null;

    const variantPrice = Number(variant?.price || 0);

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

          modelCode: technologyModel?.modelCode || "",

          description: technologyModel?.description || "",

          manufacturer: technologyModel?.manufacturer || "",

          image: technologyModel?.image || "",

          requiresBattery: Boolean(technologyModel?.requiresBattery),

          requiresActivation: Boolean(technologyModel?.requiresActivation),

          requiresSubscription: Boolean(technologyModel?.requiresSubscription),

          status: technologyModel?.status || "active",

          extraPrice: technologyPrice,

          technology: technologyModel?.technology
            ? {
                _id: technologyModel.technology._id || null,

                name: technologyModel.technology.name || "",

                code: technologyModel.technology.code || "",
              }
            : {
                _id: null,

                name: "",

                code: "",
              },
        }
      : null;

    const productImage =
      product.primaryImage || product.images?.[0] || product.image || "";

    return {
      product: product._id,

     name:
  product.name?.ar ||
  product.name?.en ||
  "",

      price: productPrice,

      productCostSnapshot,

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

  const subtotal = orderItems.reduce(
    (total, item) => total + Number(item.itemTotal || 0),
    0,
  );

  const shippingCost = Number(shippingArea.shippingFee || 0);

  const total = subtotal + shippingCost;

  const order = await Order.create({
    orderNumber: generateOrderNumber(),

    user: userId,

    items: orderItems,

    manufacturingName: cleanManufacturingName,
ordererName: cleanOrdererName,
    manufacturingNotes: cleanManufacturingNotes,

    shippingAddress: {
      firstName: String(shippingAddress.firstName).trim(),

      lastName: String(shippingAddress.lastName).trim(),

      phone: String(shippingAddress.phone).trim(),

      address: String(shippingAddress.address).trim(),

      city: shippingArea.name,

      country: String(shippingAddress.country || "Egypt").trim(),
    },

    shippingArea: shippingArea._id,

    shippingAreaName: shippingArea.name,

    shippingCost,

    paymentMethod,

    paymentStatus: "pending",

    orderStatus: "pending",

    subtotal,

    total,
  });

  /*
   * The server is the source of truth for cart clearing.
   * Frontend CartContext should also refresh/clear after
   * this request succeeds so the badge updates immediately.
   */
  cart.items = [];

  await cart.save();

  const populatedOrder = await Order.findById(order._id)
    .populate("user", "email phone")
    .populate("shippingArea", "name shippingFee")
    .populate(
      "items.product",
      "name price costPrice images primaryImage image technologyRequired",
    )
    .populate("items.smartUnit")
    .populate("items.experience");

  return populatedOrder;
};

export const getUserOrders = async (userId) => {
  return Order.find({
    user: userId,
  })
    .populate(
      "items.product",
      "name price costPrice images primaryImage image technologyRequired",
    )
    .sort({
      createdAt: -1,
    });
};

export const getUserOrderById = async (userId, orderId) => {
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw createError("Invalid order ID");
  }

  const order = await Order.findOne({
    _id: orderId,
    user: userId,
  }).populate(
    "items.product",
    "name price costPrice images primaryImage image technologyRequired",
  );

  if (!order) {
    throw createError("Order not found", 404);
  }

  return order;
};

export const getAllOrders = async () => {
  return Order.find()
    .populate("user", "email phone")
    .populate(
      "items.product",
      "name price costPrice images primaryImage image technologyRequired",
    )
    .sort({
      createdAt: -1,
    });
};

export const getOrderById = async (orderId) => {
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw createError("Invalid order ID");
  }

  const order = await Order.findById(orderId)
    .populate("user", "email phone")
    .populate(
      "items.product",
      "name price costPrice images primaryImage image technologyRequired",
    );

  if (!order) {
    throw createError("Order not found", 404);
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
    throw createError("Invalid order status");
  }

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw createError("Invalid order ID");
  }

  let order = await Order.findById(orderId);

  if (!order) {
    throw createError("Order not found", 404);
  }

  // تحديث الحالات العادية من غير خصم المخزون.
  if (orderStatus !== "delivered") {
    order.orderStatus = orderStatus;
    await order.save();

    return Order.findById(order._id)
      .populate("user", "email phone")
      .populate(
        "items.product",
        "name price costPrice images primaryImage image technologyRequired stock",
      );
  }

  // لو الطلب تم تسليمه بالفعل، لا نخصم مرة أخرى.
  if (order.orderStatus === "delivered") {
    if (order.paymentStatus !== "paid") {
      order.paymentStatus = "paid";
      await order.save();
    }

    return Order.findById(order._id)
      .populate("user", "email phone")
      .populate(
        "items.product",
        "name price costPrice images primaryImage image technologyRequired stock",
      );
  }

  // لو سبق خصم المخزون، لا نكرر الخصم.
  if (order.stockDeducted) {
    order.orderStatus = "delivered";
    order.paymentStatus = "paid";
    await order.save();

    return Order.findById(order._id)
      .populate("user", "email phone")
      .populate(
        "items.product",
        "name price costPrice images primaryImage image technologyRequired stock",
      );
  }

  const previousStatus = order.orderStatus;
  const previousPaymentStatus = order.paymentStatus;

  // تجميع الكميات لو المنتج نفسه موجود في أكثر من بند بالطلب.
  const quantitiesByProduct = new Map();

  for (const item of order.items) {
    const productId = String(item.product);

    quantitiesByProduct.set(
      productId,
      (quantitiesByProduct.get(productId) || 0) +
        Number(item.quantity),
    );
  }

  const productsToDeduct = [...quantitiesByProduct.entries()].map(
    ([productId, quantity]) => ({
      productId,
      quantity,
    }),
  );

  // حجز عملية الخصم على الطلب ذريًا لمنع طلبين متزامنين
  // من خصم المخزون للطلب نفسه مرتين.
  const claimedOrder = await Order.findOneAndUpdate(
    {
      _id: order._id,
      orderStatus: previousStatus,
      stockDeducted: { $ne: true },
    },
    {
      $set: {
        orderStatus: "delivered",
        paymentStatus: "paid",
        stockDeducted: true,
      },
    },
    {
      new: true,
      runValidators: true,
    },
  );

  if (!claimedOrder) {
    order = await Order.findById(orderId);

    if (!order) {
      throw createError("Order not found", 404);
    }

    if (order.orderStatus === "delivered") {
      return Order.findById(order._id)
        .populate("user", "email phone")
        .populate(
          "items.product",
          "name price costPrice images primaryImage image technologyRequired stock",
        );
    }

    if (order.stockDeducted) {
      order.orderStatus = "delivered";
      order.paymentStatus = "paid";
      await order.save();

      return Order.findById(order._id)
        .populate("user", "email phone")
        .populate(
          "items.product",
          "name price costPrice images primaryImage image technologyRequired stock",
        );
    }

    throw createError(
      "The order changed while being updated. Please try again.",
      409,
    );
  }

  const deductedProducts = [];

  try {
    for (const item of productsToDeduct) {
      // الخصم مشروط بأن يكون المخزون كافيًا.
      const product = await Product.findOneAndUpdate(
        {
          _id: item.productId,
          stock: { $gte: item.quantity },
        },
        {
          $inc: { stock: -item.quantity },
        },
        {
          new: true,
        },
      );

      if (!product) {
        const exists = await Product.exists({
          _id: item.productId,
        });

        if (!exists) {
          throw createError(
            "A product in this order no longer exists.",
            409,
          );
        }

        throw createError(
          `Insufficient stock for product: ${item.productId}`,
          409,
        );
      }

      deductedProducts.push(item);
    }
  } catch (error) {
    // محاولة إعادة الكميات التي خُصمت قبل حدوث الخطأ.
    for (const item of deductedProducts.reverse()) {
      try {
        await Product.updateOne(
          { _id: item.productId },
          { $inc: { stock: item.quantity } },
        );
      } catch (rollbackError) {
        console.error(
          "Stock rollback failed:",
          item.productId,
          rollbackError.message,
        );
      }
    }

    // إعادة حالة الطلب إلى حالتها السابقة.
    try {
      await Order.updateOne(
        {
          _id: order._id,
          orderStatus: "delivered",
          stockDeducted: true,
        },
        {
          $set: {
            orderStatus: previousStatus,
            paymentStatus: previousPaymentStatus,
            stockDeducted: false,
          },
        },
      );
    } catch (rollbackError) {
      console.error(
        "Order rollback failed:",
        order._id,
        rollbackError.message,
      );
    }

    throw error;
  }

  return Order.findById(order._id)
    .populate("user", "email phone")
    .populate(
      "items.product",
      "name price costPrice images primaryImage image technologyRequired stock",
    );
};


export const deleteOrder = async (orderId) => {
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw createError("Invalid order ID");
  }

  const order = await Order.findByIdAndDelete(orderId);

  if (!order) {
    throw createError("Order not found", 404);
  }

  return order;
};

export const updateManufacturingName = async (orderId, manufacturingName) => {
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw createError("Invalid order ID", 400);
  }

  const cleanedName = cleanRequiredText(
    manufacturingName,
    "Manufacturing name",
  );

  if (cleanedName.length > 120) {
    throw createError(
      "Manufacturing name cannot exceed 120 characters",
      400,
    );
  }

  const order = await Order.findByIdAndUpdate(
    orderId,
    {
      manufacturingName: cleanedName,
    },
    {
      new: true,
      runValidators: true,
    },
  )
    .populate("user", "name email")
    .populate("shippingArea")
    .populate("items.product")
    .populate("items.smartUnit")
    .populate("items.experience");

  if (!order) {
    throw createError("Order not found", 404);
  }

  return order;
};