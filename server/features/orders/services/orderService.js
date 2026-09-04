import mongoose from "mongoose";

import Order from "../models/Order.js";
import Cart from "../../cart/models/Cart.js";
import ShippingArea from "../../shipping/models/ShippingArea.js";

const createError = (
  message,
  statusCode = 400,
) => {
  const error =
    new Error(message);

  error.statusCode =
    statusCode;

  return error;
};

const generateOrderNumber = () => {
  const timestamp =
    Date.now();

  const random =
    Math.floor(
      1000 +
        Math.random() *
          9000,
    );

  return `SJ-${timestamp}-${random}`;
};

const cleanRequiredText = (
  value,
  fieldName,
  maxLength,
) => {
  const cleanValue =
    String(value || "").trim();

  if (!cleanValue) {
    throw createError(
      `${fieldName} is required`,
    );
  }

  if (
    cleanValue.length >
    maxLength
  ) {
    throw createError(
      `${fieldName} cannot exceed ${maxLength} characters`,
    );
  }

  return cleanValue;
};

const cleanOptionalText = (
  value,
  fieldName,
  maxLength,
) => {
  const cleanValue =
    String(value || "").trim();

  if (
    cleanValue.length >
    maxLength
  ) {
    throw createError(
      `${fieldName} cannot exceed ${maxLength} characters`,
    );
  }

  return cleanValue;
};

export const createOrder = async (
  userId,
  {
    manufacturingName,
    manufacturingNotes = "",
    shippingAddress,
    shippingAreaId,
    paymentMethod = "cash_on_delivery",
  },
) => {
  if (
    !mongoose.Types.ObjectId.isValid(
      userId,
    )
  ) {
    throw createError(
      "Invalid user ID",
    );
  }

  const cleanManufacturingName =
    cleanRequiredText(
      manufacturingName,
      "Name for manufacturing",
      120,
    );

  const cleanManufacturingNotes =
    cleanOptionalText(
      manufacturingNotes,
      "Manufacturing notes",
      1000,
    );

  if (!shippingAreaId) {
    throw createError(
      "Please select a shipping area",
    );
  }

  if (
    !mongoose.Types.ObjectId.isValid(
      shippingAreaId,
    )
  ) {
    throw createError(
      "Invalid shipping area",
    );
  }

  const shippingArea =
    await ShippingArea.findOne({
      _id: shippingAreaId,
      isActive: true,
    });

  if (!shippingArea) {
    throw createError(
      "Selected shipping area is not available",
      404,
    );
  }

  const cart =
    await Cart.findOne({
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
        path:
          "items.productTechnology",

        populate: {
          path:
            "technologyModel",

          populate: {
            path:
              "technology",
          },
        },
      });

  if (
    !cart ||
    !cart.items ||
    cart.items.length === 0
  ) {
    throw createError(
      "Your cart is empty",
    );
  }

  if (
    !shippingAddress ||
    !shippingAddress.firstName ||
    !shippingAddress.lastName ||
    !shippingAddress.phone ||
    !shippingAddress.address
  ) {
    throw createError(
      "Complete shipping address is required",
    );
  }

  const allowedPaymentMethods = [
    "cash_on_delivery",
    "card",
  ];

  if (
    !allowedPaymentMethods.includes(
      paymentMethod,
    )
  ) {
    throw createError(
      "Invalid payment method",
    );
  }

  const orderItems =
    cart.items.map(
      (item) => {
        const product =
          item.product;

        if (!product) {
          throw createError(
            "One of the products in your cart no longer exists",
          );
        }

        const productTechnology =
          item.productTechnology ||
          null;

        if (
          product.technologyRequired ===
            true &&
          !productTechnology
        ) {
          throw createError(
            `${product.name} requires Smart Technology before checkout`,
          );
        }

        if (
          productTechnology &&
          productTechnology.status ===
            "inactive"
        ) {
          throw createError(
            `The selected technology for ${product.name} is no longer active`,
          );
        }

        if (
          productTechnology &&
          productTechnology.isSelectable ===
            false
        ) {
          throw createError(
            `The selected technology for ${product.name} is no longer selectable`,
          );
        }

        const productPrice =
          Number(
            product.price ||
              0,
          );

        const productCostSnapshot =
          Number(
            product.costPrice ||
              0,
          );

        const variant =
          item.variant ||
          null;

        const variantPrice =
          Number(
            variant?.price ||
              0,
          );

        const technologyModel =
          productTechnology
            ?.technologyModel ||
          null;

        const technologyPrice =
          Number(
            productTechnology
              ?.extraPrice ||
              0,
          );

        const basePrice =
          variantPrice > 0
            ? variantPrice
            : productPrice;

        const unitPrice =
          basePrice +
          technologyPrice;

        const quantity =
          Number(
            item.quantity ||
              1,
          );

        const itemTotal =
          unitPrice *
          quantity;

        const variantSnapshot =
          variant
            ? {
                _id:
                  variant._id ||
                  null,

                name:
                  variant.name ||
                  "",

                color:
                  variant.color ||
                  "",

                size:
                  variant.size ||
                  "",

                material:
                  variant.material ||
                  "",

                finish:
                  variant.finish ||
                  "",

                sku:
                  variant.sku ||
                  "",

                price:
                  variantPrice,

                image:
                  variant.image ||
                  "",
              }
            : null;

        const technologySnapshot =
          productTechnology
            ? {
                _id:
                  productTechnology._id ||
                  null,

                name:
                  technologyModel
                    ?.name ||
                  "",

                modelName:
                  technologyModel
                    ?.modelName ||
                  "",

                modelCode:
                  technologyModel
                    ?.modelCode ||
                  "",

                description:
                  technologyModel
                    ?.description ||
                  "",

                manufacturer:
                  technologyModel
                    ?.manufacturer ||
                  "",

                image:
                  technologyModel
                    ?.image ||
                  "",

                requiresBattery:
                  Boolean(
                    technologyModel
                      ?.requiresBattery,
                  ),

                requiresActivation:
                  Boolean(
                    technologyModel
                      ?.requiresActivation,
                  ),

                requiresSubscription:
                  Boolean(
                    technologyModel
                      ?.requiresSubscription,
                  ),

                status:
                  technologyModel
                    ?.status ||
                  "active",

                extraPrice:
                  technologyPrice,

                technology:
                  technologyModel
                    ?.technology
                    ? {
                        _id:
                          technologyModel
                            .technology
                            ._id ||
                          null,

                        name:
                          technologyModel
                            .technology
                            .name ||
                          "",

                        code:
                          technologyModel
                            .technology
                            .code ||
                          "",
                      }
                    : {
                        _id:
                          null,

                        name:
                          "",

                        code:
                          "",
                      },
              }
            : null;

        const productImage =
          product.primaryImage ||
          product.images?.[0] ||
          product.image ||
          "";

        return {
          product:
            product._id,

          name:
            product.name,

          price:
            productPrice,

          productCostSnapshot,

          image:
            productImage,

          variant:
            variantSnapshot,

          technologyModel:
            technologySnapshot,

          variantPrice,

          technologyPrice,

          unitPrice,

          quantity,

          itemTotal,

          smartUnit:
            null,

          experience:
            null,

          manufacturingStatus:
            technologyModel
              ? "pending"
              : "not_required",
        };
      },
    );

  const subtotal =
    orderItems.reduce(
      (
        total,
        item,
      ) =>
        total +
        Number(
          item.itemTotal ||
            0,
        ),
      0,
    );

  const shippingCost =
    Number(
      shippingArea.shippingFee ||
        0,
    );

  const total =
    subtotal +
    shippingCost;

  const order =
    await Order.create({
      orderNumber:
        generateOrderNumber(),

      user:
        userId,

      items:
        orderItems,

      manufacturingName:
        cleanManufacturingName,

      manufacturingNotes:
        cleanManufacturingNotes,

      shippingAddress: {
        firstName:
          String(
            shippingAddress.firstName,
          ).trim(),

        lastName:
          String(
            shippingAddress.lastName,
          ).trim(),

        phone:
          String(
            shippingAddress.phone,
          ).trim(),

        address:
          String(
            shippingAddress.address,
          ).trim(),

        city:
          shippingArea.name,

        country:
          String(
            shippingAddress.country ||
              "Egypt",
          ).trim(),
      },

      shippingArea:
        shippingArea._id,

      shippingAreaName:
        shippingArea.name,

      shippingCost,

      paymentMethod,

      paymentStatus:
        "pending",

      orderStatus:
        "pending",

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

  const populatedOrder =
    await Order.findById(
      order._id,
    )
      .populate(
        "user",
        "email phone",
      )
      .populate(
        "shippingArea",
        "name shippingFee",
      )
      .populate(
        "items.product",
        "name price costPrice images primaryImage image technologyRequired",
      )
      .populate(
        "items.smartUnit",
      )
      .populate(
        "items.experience",
      );

  return populatedOrder;
};

export const getUserOrders =
  async (
    userId,
  ) => {
    return Order.find({
      user: userId,
    })
      .populate(
        "items.product",
        "name price costPrice images primaryImage image technologyRequired",
      )
      .sort({
        createdAt:
          -1,
      });
  };

export const getUserOrderById =
  async (
    userId,
    orderId,
  ) => {
    if (
      !mongoose.Types.ObjectId.isValid(
        orderId,
      )
    ) {
      throw createError(
        "Invalid order ID",
      );
    }

    const order =
      await Order.findOne({
        _id: orderId,
        user: userId,
      }).populate(
        "items.product",
        "name price costPrice images primaryImage image technologyRequired",
      );

    if (!order) {
      throw createError(
        "Order not found",
        404,
      );
    }

    return order;
  };

export const getAllOrders =
  async () => {
    return Order.find()
      .populate(
        "user",
        "email phone",
      )
      .populate(
        "items.product",
        "name price costPrice images primaryImage image technologyRequired",
      )
      .sort({
        createdAt:
          -1,
      });
  };

export const getOrderById =
  async (
    orderId,
  ) => {
    if (
      !mongoose.Types.ObjectId.isValid(
        orderId,
      )
    ) {
      throw createError(
        "Invalid order ID",
      );
    }

    const order =
      await Order.findById(
        orderId,
      )
        .populate(
          "user",
          "email phone",
        )
        .populate(
          "items.product",
          "name price costPrice images primaryImage image technologyRequired",
        );

    if (!order) {
      throw createError(
        "Order not found",
        404,
      );
    }

    return order;
  };

export const updateOrderStatus =
  async (
    orderId,
    orderStatus,
  ) => {
    const allowedStatuses = [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];

    if (
      !allowedStatuses.includes(
        orderStatus,
      )
    ) {
      throw createError(
        "Invalid order status",
      );
    }

    if (
      !mongoose.Types.ObjectId.isValid(
        orderId,
      )
    ) {
      throw createError(
        "Invalid order ID",
      );
    }

    const updateData = {
      orderStatus,
    };

    /*
     * Delivery keeps the existing business rule:
     * once delivered, the order is considered paid.
     *
     * If the admin later moves the order backwards,
     * orderStatus is allowed to move backwards and the
     * customer profile will reflect that latest status.
     * paymentStatus is intentionally not rolled back here.
     */
    if (
      orderStatus ===
      "delivered"
    ) {
      updateData.paymentStatus =
        "paid";
    }

    const order =
      await Order.findByIdAndUpdate(
        orderId,
        updateData,
        {
          new:
            true,

          runValidators:
            true,
        },
      )
        .populate(
          "user",
          "email phone",
        )
        .populate(
          "items.product",
          "name price costPrice images primaryImage image technologyRequired",
        );

    if (!order) {
      throw createError(
        "Order not found",
        404,
      );
    }

    return order;
  };

export const deleteOrder =
  async (
    orderId,
  ) => {
    if (
      !mongoose.Types.ObjectId.isValid(
        orderId,
      )
    ) {
      throw createError(
        "Invalid order ID",
      );
    }

    const order =
      await Order.findByIdAndDelete(
        orderId,
      );

    if (!order) {
      throw createError(
        "Order not found",
        404,
      );
    }

    return order;
  };
