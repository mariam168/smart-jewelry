import mongoose from "mongoose";

import ManufacturingOrder from "../models/ManufacturingOrder.js";
import Order from "../../orders/models/Order.js";
import Product from "../../catalog/models/Product.js";
import SmartUnit from "../../catalog/models/SmartUnit.js";
import SmartUnitInstance from "../../catalog/models/SmartUnitInstance.js";
import Experience from "../../experience/models/Experience.js";
import ExperiencePersonal from "../../experience/models/ExperiencePersonal.js";

import {
  generateManageToken,
  generatePublicToken,
  generateExperienceSlug,
} from "../../experience/utils/tokenGenerator.js";

const createError = (message, statusCode = 400) => {
  const error = new Error(message);

  error.statusCode = statusCode;

  return error;
};

const validateObjectId = (id, message = "Invalid ID") => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createError(message, 400);
  }
};

const normalizeMoney = (value, label) => {
  const number = Number(value);

  if (!Number.isFinite(number) || number < 0) {
    throw createError(
      `${label} must be a valid non-negative number`,
      400,
    );
  }

  return Number(number.toFixed(2));
};

const ensureExperienceManageToken = async (experienceId) => {
  if (!experienceId) {
    return null;
  }

  const id =
    experienceId?._id ||
    experienceId;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return null;
  }

  const experience =
    await Experience.findById(id).select(
      "+manageToken +publicToken",
    );

  if (!experience) {
    return null;
  }

  if (!experience.manageToken) {
    experience.manageToken =
      generateManageToken();

    await experience.save();
  }

  return experience;
};

const ensureProductionUnitProduct = async (
  manufacturingOrder,
  productionUnit,
) => {
  if (productionUnit.product) {
    return productionUnit.product;
  }

  if (!productionUnit.orderItemId) {
    throw createError(
      "Production unit has no order item reference",
      400,
    );
  }

  const order = await Order.findById(
    manufacturingOrder.order,
  );

  if (!order) {
    throw createError(
      "Original order not found",
      404,
    );
  }

  const orderItem = order.items.find(
    (item) =>
      item._id?.toString() ===
      productionUnit.orderItemId?.toString(),
  );

  if (!orderItem) {
    throw createError(
      "Order item not found for this production unit",
      404,
    );
  }

  if (!orderItem.product) {
    throw createError(
      "The original order item has no product assigned",
      400,
    );
  }

  productionUnit.product =
    orderItem.product;

  return orderItem.product;
};

const ensureProductCostSnapshot = async (
  productionUnit,
) => {
  if (!productionUnit.product) {
    return;
  }

  const product = await Product.findById(
    productionUnit.product,
  ).select("costPrice");

  if (!product) {
    return;
  }

  if (
    productionUnit.productCostSnapshot === undefined ||
    productionUnit.productCostSnapshot === null
  ) {
    productionUnit.productCostSnapshot =
      Number(product.costPrice || 0);
  }
};

const createExperienceForProductionUnit = async (
  manufacturingOrder,
  productionUnit,
  experienceData = {},
) => {
  const order = await Order.findById(
    manufacturingOrder.order,
  );

  if (!order) {
    throw createError(
      "Original order not found",
      404,
    );
  }

  await ensureProductionUnitProduct(
    manufacturingOrder,
    productionUnit,
  );

  if (!productionUnit.orderItemId) {
    throw createError(
      "Production unit has no order item reference",
      400,
    );
  }

  if (!productionUnit.product) {
    throw createError(
      "Production unit product not found",
      400,
    );
  }

  if (!productionUnit.smartUnit) {
    throw createError(
      "Production unit smart unit not found",
      400,
    );
  }

  if (!productionUnit.smartUnitInstance) {
    throw createError(
      "A physical Smart Unit instance must be assigned before creating the experience",
      400,
    );
  }

  const smartUnitInstance =
    await SmartUnitInstance.findById(
      productionUnit.smartUnitInstance,
    );

  if (!smartUnitInstance) {
    throw createError(
      "Assigned smart unit instance was not found",
      404,
    );
  }

  if (
    !smartUnitInstance.smartUnit ||
    smartUnitInstance.smartUnit.toString() !==
      productionUnit.smartUnit.toString()
  ) {
    throw createError(
      "Smart unit instance does not belong to the assigned smart unit",
      400,
    );
  }

  if (!smartUnitInstance.serialNumber) {
    throw createError(
      "Smart unit instance has no serial number",
      400,
    );
  }

  productionUnit.serialNumber =
    smartUnitInstance.serialNumber;

  const orderItems =
    order.items || [];

  let orderItem = orderItems.find(
    (item) =>
      item._id?.toString() ===
      productionUnit.orderItemId?.toString(),
  );

  if (!orderItem) {
    orderItem = orderItems.find(
      (item) =>
        item.product?.toString() ===
        productionUnit.product?.toString(),
    );
  }

  if (!orderItem) {
    throw createError(
      "Order item not found",
      404,
    );
  }

  if (
    productionUnit.orderItemId?.toString() !==
    orderItem._id.toString()
  ) {
    productionUnit.orderItemId =
      orderItem._id;
  }

  if (productionUnit.experience) {
    const existingExperience =
      await Experience.findById(
        productionUnit.experience,
      ).select(
        "+manageToken +publicToken",
      );

    if (existingExperience) {
      if (!existingExperience.manageToken) {
        existingExperience.manageToken =
          generateManageToken();

        await existingExperience.save();
      }

      return existingExperience;
    }

    productionUnit.experience = null;
  }

  if (orderItem.experience) {
    const existingExperience =
      await Experience.findById(
        orderItem.experience,
      ).select(
        "+manageToken +publicToken",
      );

    if (existingExperience) {
      if (!existingExperience.manageToken) {
        existingExperience.manageToken =
          generateManageToken();

        await existingExperience.save();
      }

      productionUnit.experience =
        existingExperience._id;

      productionUnit.status =
        "experience_created";

      return existingExperience;
    }

    orderItem.experience = null;
  }

  const manageToken =
    generateManageToken();

  const publicToken =
    generatePublicToken();

  const slug =
    experienceData?.slug ||
    generateExperienceSlug();

  const type =
    experienceData?.type ||
    "personal";

  const serialNumber =
    smartUnitInstance.serialNumber;

  const experience =
    await Experience.create({
      order: order._id,

      orderItem:
        orderItem._id,

      product:
        productionUnit.product,

      smartUnit:
        productionUnit.smartUnit,

      owner:
        order.user ||
        order.customer ||
        null,

      serialNumber,

      manageToken,

      publicToken,

      slug,

      type,

      status: "waiting",

      visits: 0,

      activatedAt: null,
    });

  if (type === "personal") {
    await ExperiencePersonal.create({
      experience:
        experience._id,
    });
  }

  orderItem.experience =
    experience._id;

  await order.save();

  productionUnit.experience =
    experience._id;

  productionUnit.status =
    "experience_created";

  productionUnit.serialNumber =
    smartUnitInstance.serialNumber;

  return experience;
};

export const createManufacturingOrder = async (
  orderId,
) => {
  validateObjectId(
    orderId,
    "Invalid order ID",
  );

  const existingManufacturingOrder =
    await ManufacturingOrder.findOne({
      order: orderId,
    });

  if (existingManufacturingOrder) {
    return getManufacturingOrderById(
      existingManufacturingOrder._id,
    );
  }

  const order = await Order.findById(
    orderId,
  )
    .populate(
      "user",
      "email firstName lastName",
    )
    .populate(
      "items.product",
      "name price costPrice images primaryImage image sku material color",
    );

  if (!order) {
    throw createError(
      "Order not found",
      404,
    );
  }

  if (
    !Array.isArray(order.items) ||
    order.items.length === 0
  ) {
    throw createError(
      "Order has no items",
      400,
    );
  }

  const units = [];

  for (const item of order.items) {
    const productId =
      item.product?._id ||
      item.product;

    if (!productId) {
      throw createError(
        `Product is missing for order item ${item._id}`,
        400,
      );
    }

    if (
      !mongoose.Types.ObjectId.isValid(
        productId,
      )
    ) {
      throw createError(
        `Invalid product ID for order item ${item._id}`,
        400,
      );
    }

    const quantity =
      Number(
        item.quantity || 1,
      );

    const productCostSnapshot =
      Number(
        item.product?.costPrice || 0,
      );

    for (
      let index = 1;
      index <= quantity;
      index += 1
    ) {
      units.push({
        orderItemId:
          item._id,

        product:
          productId,

        unitNumber:
          index,

        smartUnit:
          null,

        smartUnitInstance:
          null,

        experience:
          null,

        serialNumber:
          "",

        productCostSnapshot,

        smartUnitCostSnapshot:
          0,

        assemblyCost:
          0,

        packagingCost:
          0,

        packagingNotes:
          "",

        status:
          "pending",

        notes:
          "",

        startedAt:
          null,

        packagingStartedAt:
          null,

        packagingCompletedAt:
          null,

        completedAt:
          null,
      });
    }
  }

  if (units.length === 0) {
    throw createError(
      "Unable to create production units",
      400,
    );
  }

  const manufacturingOrder =
    await ManufacturingOrder.create({
      order:
        order._id,

      orderNumber:
        order.orderNumber,

      customer:
        order.user?._id ||
        order.user,

      status:
        "pending",

      units,

      notes:
        "",

      startedBy:
        null,

      completedBy:
        null,

      startedAt:
        null,

      completedAt:
        null,
    });

  return getManufacturingOrderById(
    manufacturingOrder._id,
  );
};

export const getAllManufacturingOrders =
  async () => {
    const manufacturingOrders =
      await ManufacturingOrder.find()
        .populate(
          "order",
          "orderNumber orderStatus paymentStatus paymentMethod total createdAt",
        )
        .populate(
          "customer",
          "email firstName lastName",
        )
        .populate(
          "units.product",
          "name price costPrice image images primaryImage sku material color",
        )
        .populate(
          "units.smartUnit",
          "name description image technologyModel costPrice firmwareVersion manufacturer status",
        )
        .populate(
          "units.smartUnitInstance",
          "smartUnit serialNumber status firmwareVersion assignedAt activatedAt notes",
        )
        .populate({
          path:
            "units.experience",

          select:
            "serialNumber +manageToken +publicToken slug type status activatedAt visits",
        })
        .sort({
          createdAt: -1,
        });

    return manufacturingOrders;
  };

export const getManufacturingOrderById = async (
  manufacturingOrderId,
) => {
  validateObjectId(
    manufacturingOrderId,
    "Invalid manufacturing order ID",
  );

  const manufacturingOrder =
    await ManufacturingOrder.findById(
      manufacturingOrderId,
    )
      .populate(
        "order",
        "orderNumber orderStatus paymentStatus paymentMethod total subtotal shippingCost shippingAddress items createdAt updatedAt user",
      )
      .populate(
        "order.items.product",
        "name price costPrice image images primaryImage sku material color",
      )
      .populate(
        "order.items.technologyModel",
        "name modelName modelCode manufacturer description status",
      )
      .populate(
        "customer",
        "email firstName lastName",
      )
      .populate(
        "units.product",
        "name price costPrice image images primaryImage sku material color technologyModels",
      )
      .populate({
        path:
          "units.smartUnit",

        select:
          "name description image technologyModel costPrice firmwareVersion manufacturer status",

        populate: {
          path:
            "technologyModel",

          select:
            "name modelName modelCode manufacturer description status",
        },
      })
      .populate({
        path:
          "units.smartUnitInstance",

        select:
          "smartUnit serialNumber status firmwareVersion assignedAt activatedAt notes",

        populate: {
          path:
            "smartUnit",

          select:
            "name description image technologyModel costPrice firmwareVersion manufacturer status",
        },
      })
      .populate({
        path:
          "units.experience",

        select:
          "order orderItem product smartUnit owner serialNumber +manageToken +publicToken slug type status activatedAt visits",
      });

  if (!manufacturingOrder) {
    throw createError(
      "Manufacturing order not found",
      404,
    );
  }

  for (
    const unit of
      manufacturingOrder.units || []
  ) {
    if (!unit.experience) {
      continue;
    }

    const fixedExperience =
      await ensureExperienceManageToken(
        unit.experience,
      );

    if (
      fixedExperience &&
      unit.experience?._id
    ) {
      unit.experience.manageToken =
        fixedExperience.manageToken;

      if (
        fixedExperience.publicToken
      ) {
        unit.experience.publicToken =
          fixedExperience.publicToken;
      }
    }
  }

  return manufacturingOrder;
};

export const startManufacturing = async (
  manufacturingOrderId,
  adminUserId,
) => {
  validateObjectId(
    manufacturingOrderId,
    "Invalid manufacturing order ID",
  );

  validateObjectId(
    adminUserId,
    "Invalid admin user ID",
  );

  const manufacturingOrder =
    await ManufacturingOrder.findById(
      manufacturingOrderId,
    );

  if (!manufacturingOrder) {
    throw createError(
      "Manufacturing order not found",
      404,
    );
  }

  if (
    manufacturingOrder.status ===
    "completed"
  ) {
    throw createError(
      "Manufacturing order is already completed",
      400,
    );
  }

  if (
    manufacturingOrder.status ===
    "cancelled"
  ) {
    throw createError(
      "Manufacturing order is cancelled",
      400,
    );
  }

  manufacturingOrder.status =
    "in_progress";

  manufacturingOrder.startedBy =
    adminUserId;

  manufacturingOrder.startedAt =
    manufacturingOrder.startedAt ||
    new Date();

  await Order.findByIdAndUpdate(
    manufacturingOrder.order,
    {
      orderStatus:
        "processing",
    },
  );

  await manufacturingOrder.save();

  return getManufacturingOrderById(
    manufacturingOrderId,
  );
};

export const assignSmartUnit = async (
  manufacturingOrderId,
  unitId,
  smartUnitId,
  smartUnitInstanceId,
  assemblyCost = 0,
) => {
  validateObjectId(
    manufacturingOrderId,
    "Invalid manufacturing order ID",
  );

  validateObjectId(
    unitId,
    "Invalid production unit ID",
  );

  validateObjectId(
    smartUnitId,
    "Invalid smart unit ID",
  );

  validateObjectId(
    smartUnitInstanceId,
    "Invalid smart unit instance ID",
  );

  const normalizedAssemblyCost =
    normalizeMoney(
      assemblyCost,
      "Assembly cost",
    );

  const manufacturingOrder =
    await ManufacturingOrder.findById(
      manufacturingOrderId,
    );

  if (!manufacturingOrder) {
    throw createError(
      "Manufacturing order not found",
      404,
    );
  }

  if (
    manufacturingOrder.status ===
    "cancelled"
  ) {
    throw createError(
      "Manufacturing order is cancelled",
      400,
    );
  }

  if (
    manufacturingOrder.status ===
    "completed"
  ) {
    throw createError(
      "Manufacturing order is already completed",
      400,
    );
  }

  const productionUnit =
    manufacturingOrder.units.id(
      unitId,
    );

  if (!productionUnit) {
    throw createError(
      "Production unit not found",
      404,
    );
  }

  if (!productionUnit.product) {
    throw createError(
      "This production unit has no product assigned.",
      400,
    );
  }

  if (productionUnit.experience) {
    const existingExperience =
      await Experience.findById(
        productionUnit.experience,
      );

    if (existingExperience) {
      throw createError(
        "Smart Unit cannot be changed after the Experience has been created",
        400,
      );
    }

    productionUnit.experience =
      null;
  }

  const smartUnit =
    await SmartUnit.findById(
      smartUnitId,
    );

  if (!smartUnit) {
    throw createError(
      "Smart unit not found",
      404,
    );
  }

  const smartUnitInstance =
    await SmartUnitInstance.findById(
      smartUnitInstanceId,
    );

  if (!smartUnitInstance) {
    throw createError(
      "Smart unit instance not found",
      404,
    );
  }

  if (
    !smartUnitInstance.smartUnit ||
    smartUnitInstance.smartUnit.toString() !==
      smartUnit._id.toString()
  ) {
    throw createError(
      "This smart unit instance does not belong to the selected smart unit",
      400,
    );
  }

  if (!smartUnitInstance.serialNumber) {
    throw createError(
      "Smart unit instance must have a serial number",
      400,
    );
  }

  if (
    smartUnitInstance.status !==
    "available"
  ) {
    throw createError(
      `This smart unit instance is not available. Current status: ${smartUnitInstance.status}`,
      400,
    );
  }

  const alreadyAssigned =
    manufacturingOrder.units.some(
      (unit) =>
        unit.smartUnitInstance &&
        unit.smartUnitInstance.toString() ===
          smartUnitInstanceId.toString() &&
        unit._id.toString() !==
          unitId.toString(),
    );

  if (alreadyAssigned) {
    throw createError(
      "This smart unit instance is already assigned to another production unit",
      400,
    );
  }

  if (
    productionUnit.smartUnitInstance &&
    productionUnit.smartUnitInstance.toString() !==
      smartUnitInstanceId.toString()
  ) {
    await SmartUnitInstance.findByIdAndUpdate(
      productionUnit.smartUnitInstance,
      {
        status:
          "available",

        assignedAt:
          null,

        activatedAt:
          null,
      },
    );
  }

  await ensureProductCostSnapshot(
    productionUnit,
  );

  productionUnit.smartUnit =
    smartUnit._id;

  productionUnit.smartUnitInstance =
    smartUnitInstance._id;

  productionUnit.serialNumber =
    smartUnitInstance.serialNumber;

  productionUnit.smartUnitCostSnapshot =
    Number(
      smartUnit.costPrice || 0,
    );

  productionUnit.assemblyCost =
    normalizedAssemblyCost;

  productionUnit.status =
    "unit_assigned";

  smartUnitInstance.status =
    "reserved";

  smartUnitInstance.assignedAt =
    new Date();

  smartUnitInstance.activatedAt =
    null;

  await smartUnitInstance.save();

  await createExperienceForProductionUnit(
    manufacturingOrder,
    productionUnit,
  );

  await manufacturingOrder.save();

  return getManufacturingOrderById(
    manufacturingOrderId,
  );
};

export const updateAssemblyCost = async (
  manufacturingOrderId,
  unitId,
  assemblyCost,
) => {
  validateObjectId(
    manufacturingOrderId,
    "Invalid manufacturing order ID",
  );

  validateObjectId(
    unitId,
    "Invalid production unit ID",
  );

  const normalizedAssemblyCost =
    normalizeMoney(
      assemblyCost,
      "Assembly cost",
    );

  const manufacturingOrder =
    await ManufacturingOrder.findById(
      manufacturingOrderId,
    );

  if (!manufacturingOrder) {
    throw createError(
      "Manufacturing order not found",
      404,
    );
  }

  if (
    manufacturingOrder.status ===
    "cancelled"
  ) {
    throw createError(
      "Manufacturing order is cancelled",
      400,
    );
  }

  const productionUnit =
    manufacturingOrder.units.id(
      unitId,
    );

  if (!productionUnit) {
    throw createError(
      "Production unit not found",
      404,
    );
  }

  if (
    !productionUnit.smartUnit ||
    !productionUnit.smartUnitInstance
  ) {
    throw createError(
      "Assign a Smart Unit first",
      400,
    );
  }

  productionUnit.assemblyCost =
    normalizedAssemblyCost;

  await manufacturingOrder.save();

  return getManufacturingOrderById(
    manufacturingOrderId,
  );
};

export const createExperienceForUnit = async (
  manufacturingOrderId,
  unitId,
  experienceData = {},
) => {
  validateObjectId(
    manufacturingOrderId,
    "Invalid manufacturing order ID",
  );

  validateObjectId(
    unitId,
    "Invalid production unit ID",
  );

  const manufacturingOrder =
    await ManufacturingOrder.findById(
      manufacturingOrderId,
    );

  if (!manufacturingOrder) {
    throw createError(
      "Manufacturing order not found",
      404,
    );
  }

  const productionUnit =
    manufacturingOrder.units.id(
      unitId,
    );

  if (!productionUnit) {
    throw createError(
      "Production unit not found",
      404,
    );
  }

  await createExperienceForProductionUnit(
    manufacturingOrder,
    productionUnit,
    experienceData,
  );

  await manufacturingOrder.save();

  return getManufacturingOrderById(
    manufacturingOrderId,
  );
};

export const startProductionUnit = async (
  manufacturingOrderId,
  unitId,
) => {
  validateObjectId(
    manufacturingOrderId,
    "Invalid manufacturing order ID",
  );

  validateObjectId(
    unitId,
    "Invalid production unit ID",
  );

  const manufacturingOrder =
    await ManufacturingOrder.findById(
      manufacturingOrderId,
    );

  if (!manufacturingOrder) {
    throw createError(
      "Manufacturing order not found",
      404,
    );
  }

  if (
    manufacturingOrder.status ===
    "cancelled"
  ) {
    throw createError(
      "Manufacturing order is cancelled",
      400,
    );
  }

  if (
    manufacturingOrder.status ===
    "completed"
  ) {
    throw createError(
      "Manufacturing order is already completed",
      400,
    );
  }

  const productionUnit =
    manufacturingOrder.units.id(
      unitId,
    );

  if (!productionUnit) {
    throw createError(
      "Production unit not found",
      404,
    );
  }

  if (
    productionUnit.status ===
    "completed"
  ) {
    throw createError(
      "Production unit is already completed",
      400,
    );
  }

  if (
    productionUnit.status ===
      "ready_for_packaging" ||
    productionUnit.status ===
      "packaging"
  ) {
    throw createError(
      "Production has already been completed for this unit",
      400,
    );
  }

  if (!productionUnit.product) {
    throw createError(
      "Production unit has no product assigned",
      400,
    );
  }

  if (!productionUnit.smartUnit) {
    throw createError(
      "Smart unit model must be assigned first",
      400,
    );
  }

  if (!productionUnit.smartUnitInstance) {
    throw createError(
      "Smart unit physical instance must be assigned first",
      400,
    );
  }

  if (!productionUnit.experience) {
    await createExperienceForProductionUnit(
      manufacturingOrder,
      productionUnit,
    );
  }

  const smartUnitInstance =
    await SmartUnitInstance.findById(
      productionUnit.smartUnitInstance,
    );

  if (!smartUnitInstance) {
    throw createError(
      "Smart unit instance linked to this production unit was not found",
      404,
    );
  }

  if (
    !smartUnitInstance.smartUnit ||
    smartUnitInstance.smartUnit.toString() !==
      productionUnit.smartUnit.toString()
  ) {
    throw createError(
      "Smart unit instance does not belong to the assigned smart unit",
      400,
    );
  }

  const experience =
    await Experience.findById(
      productionUnit.experience,
    );

  if (!experience) {
    throw createError(
      "Experience linked to this production unit was not found",
      404,
    );
  }

  if (!experience.product) {
    throw createError(
      "Experience has no product assigned",
      400,
    );
  }

  if (
    experience.product.toString() !==
    productionUnit.product.toString()
  ) {
    throw createError(
      "Experience product does not match production unit product",
      400,
    );
  }

  if (!experience.smartUnit) {
    throw createError(
      "Experience has no smart unit assigned",
      400,
    );
  }

  if (
    experience.smartUnit.toString() !==
    productionUnit.smartUnit.toString()
  ) {
    throw createError(
      "Experience smart unit does not match production unit smart unit",
      400,
    );
  }

  if (
    experience.serialNumber !==
    smartUnitInstance.serialNumber
  ) {
    throw createError(
      "Experience serial number does not match smart unit instance serial number",
      400,
    );
  }

  productionUnit.status =
    "in_production";

  productionUnit.startedAt =
    productionUnit.startedAt ||
    new Date();

  productionUnit.serialNumber =
    smartUnitInstance.serialNumber;

  smartUnitInstance.status =
    "activated";

  smartUnitInstance.activatedAt =
    smartUnitInstance.activatedAt ||
    new Date();

  await smartUnitInstance.save();

  experience.status =
    "waiting";

  await experience.save();

  if (
    manufacturingOrder.status ===
    "pending"
  ) {
    manufacturingOrder.status =
      "in_progress";

    manufacturingOrder.startedAt =
      manufacturingOrder.startedAt ||
      new Date();
  }

  await manufacturingOrder.save();

  await Order.findByIdAndUpdate(
    manufacturingOrder.order,
    {
      orderStatus:
        "processing",
    },
  );

  return getManufacturingOrderById(
    manufacturingOrderId,
  );
};

export const completeProductionUnit = async (
  manufacturingOrderId,
  unitId,
  notes = "",
) => {
  validateObjectId(
    manufacturingOrderId,
    "Invalid manufacturing order ID",
  );

  validateObjectId(
    unitId,
    "Invalid production unit ID",
  );

  const manufacturingOrder =
    await ManufacturingOrder.findById(
      manufacturingOrderId,
    );

  if (!manufacturingOrder) {
    throw createError(
      "Manufacturing order not found",
      404,
    );
  }

  if (
    manufacturingOrder.status ===
    "cancelled"
  ) {
    throw createError(
      "Manufacturing order is cancelled",
      400,
    );
  }

  const productionUnit =
    manufacturingOrder.units.id(
      unitId,
    );

  if (!productionUnit) {
    throw createError(
      "Production unit not found",
      404,
    );
  }

  if (
    productionUnit.status !==
    "in_production"
  ) {
    throw createError(
      "Production unit must be in production before completing production",
      400,
    );
  }

  if (!productionUnit.product) {
    throw createError(
      "Production unit has no product assigned",
      400,
    );
  }

  if (!productionUnit.smartUnit) {
    throw createError(
      "Smart unit model must be assigned first",
      400,
    );
  }

  if (!productionUnit.smartUnitInstance) {
    throw createError(
      "Smart unit physical instance must be assigned first",
      400,
    );
  }

  if (!productionUnit.experience) {
    throw createError(
      "Experience must be created first",
      400,
    );
  }

  const smartUnitInstance =
    await SmartUnitInstance.findById(
      productionUnit.smartUnitInstance,
    );

  if (!smartUnitInstance) {
    throw createError(
      "Smart unit instance not found",
      404,
    );
  }

  const experience =
    await Experience.findById(
      productionUnit.experience,
    );

  if (!experience) {
    throw createError(
      "Experience not found",
      404,
    );
  }

  if (
    experience.product?.toString() !==
    productionUnit.product.toString()
  ) {
    throw createError(
      "Experience product does not match production unit product",
      400,
    );
  }

  if (
    experience.smartUnit?.toString() !==
    productionUnit.smartUnit.toString()
  ) {
    throw createError(
      "Experience smart unit does not match production unit smart unit",
      400,
    );
  }

  if (
    experience.serialNumber !==
    smartUnitInstance.serialNumber
  ) {
    throw createError(
      "Experience serial number does not match smart unit instance serial number",
      400,
    );
  }

  productionUnit.status =
    "ready_for_packaging";

  productionUnit.serialNumber =
    smartUnitInstance.serialNumber;

  if (notes) {
    productionUnit.notes =
      notes;
  }

  experience.status =
    "waiting";

  await experience.save();

  await manufacturingOrder.save();

  return getManufacturingOrderById(
    manufacturingOrderId,
  );
};

export const startPackaging = async (
  manufacturingOrderId,
  unitId,
) => {
  validateObjectId(
    manufacturingOrderId,
    "Invalid manufacturing order ID",
  );

  validateObjectId(
    unitId,
    "Invalid production unit ID",
  );

  const manufacturingOrder =
    await ManufacturingOrder.findById(
      manufacturingOrderId,
    );

  if (!manufacturingOrder) {
    throw createError(
      "Manufacturing order not found",
      404,
    );
  }

  if (
    manufacturingOrder.status ===
    "cancelled"
  ) {
    throw createError(
      "Manufacturing order is cancelled",
      400,
    );
  }

  const productionUnit =
    manufacturingOrder.units.id(
      unitId,
    );

  if (!productionUnit) {
    throw createError(
      "Production unit not found",
      404,
    );
  }

  if (
    productionUnit.status !==
    "ready_for_packaging"
  ) {
    throw createError(
      "Production must be completed before packaging can start",
      400,
    );
  }

  productionUnit.status =
    "packaging";

  productionUnit.packagingStartedAt =
    productionUnit.packagingStartedAt ||
    new Date();

  await manufacturingOrder.save();

  return getManufacturingOrderById(
    manufacturingOrderId,
  );
};

export const completePackaging = async (
  manufacturingOrderId,
  unitId,
  packagingCost = 0,
  packagingNotes = "",
  adminUserId = null,
) => {
  validateObjectId(
    manufacturingOrderId,
    "Invalid manufacturing order ID",
  );

  validateObjectId(
    unitId,
    "Invalid production unit ID",
  );

  const normalizedPackagingCost =
    normalizeMoney(
      packagingCost,
      "Packaging cost",
    );

  const manufacturingOrder =
    await ManufacturingOrder.findById(
      manufacturingOrderId,
    );

  if (!manufacturingOrder) {
    throw createError(
      "Manufacturing order not found",
      404,
    );
  }

  if (
    manufacturingOrder.status ===
    "cancelled"
  ) {
    throw createError(
      "Manufacturing order is cancelled",
      400,
    );
  }

  const productionUnit =
    manufacturingOrder.units.id(
      unitId,
    );

  if (!productionUnit) {
    throw createError(
      "Production unit not found",
      404,
    );
  }

  if (
    productionUnit.status !==
    "packaging"
  ) {
    throw createError(
      "Packaging must be started before it can be completed",
      400,
    );
  }

  if (!productionUnit.experience) {
    throw createError(
      "Experience not found for this production unit",
      400,
    );
  }

  const experience =
    await Experience.findById(
      productionUnit.experience,
    );

  if (!experience) {
    throw createError(
      "Experience not found",
      404,
    );
  }

  productionUnit.packagingCost =
    normalizedPackagingCost;

  productionUnit.packagingNotes =
    String(
      packagingNotes || "",
    ).trim();

  productionUnit.packagingCompletedAt =
    new Date();

  productionUnit.completedAt =
    new Date();

  productionUnit.status =
    "completed";

  experience.status =
    "active";

  experience.activatedAt =
    experience.activatedAt ||
    new Date();

  await experience.save();

  const allCompleted =
    manufacturingOrder.units.every(
      (unit) =>
        unit.status ===
        "completed",
    );

  if (allCompleted) {
    manufacturingOrder.status =
      "completed";

    manufacturingOrder.completedAt =
      new Date();

    if (
      adminUserId &&
      mongoose.Types.ObjectId.isValid(
        adminUserId,
      )
    ) {
      manufacturingOrder.completedBy =
        adminUserId;
    }

    await Order.findByIdAndUpdate(
      manufacturingOrder.order,
      {
        orderStatus:
          "shipped",
      },
    );
  }

  await manufacturingOrder.save();

  return getManufacturingOrderById(
    manufacturingOrderId,
  );
};

export const cancelManufacturingOrder = async (
  manufacturingOrderId,
) => {
  validateObjectId(
    manufacturingOrderId,
    "Invalid manufacturing order ID",
  );

  const manufacturingOrder =
    await ManufacturingOrder.findById(
      manufacturingOrderId,
    );

  if (!manufacturingOrder) {
    throw createError(
      "Manufacturing order not found",
      404,
    );
  }

  if (
    manufacturingOrder.status ===
    "completed"
  ) {
    throw createError(
      "Completed manufacturing order cannot be cancelled",
      400,
    );
  }

  for (
    const unit of
      manufacturingOrder.units
  ) {
    if (unit.smartUnitInstance) {
      await SmartUnitInstance.findByIdAndUpdate(
        unit.smartUnitInstance,
        {
          status:
            "available",

          assignedAt:
            null,

          activatedAt:
            null,
        },
      );
    }

    if (unit.experience) {
      await Experience.findByIdAndUpdate(
        unit.experience,
        {
          status:
            "cancelled",
        },
      );
    }
  }

  manufacturingOrder.status =
    "cancelled";

  await manufacturingOrder.save();

  await Order.findByIdAndUpdate(
    manufacturingOrder.order,
    {
      orderStatus:
        "cancelled",
    },
  );

  return getManufacturingOrderById(
    manufacturingOrderId,
  );
};