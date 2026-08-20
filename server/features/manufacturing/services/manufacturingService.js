import mongoose from "mongoose";

import ManufacturingOrder from "../models/ManufacturingOrder.js";
import Order from "../../orders/models/Order.js";
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

/* =========================================================
   HELPERS
========================================================= */

const ensureProductionUnitProduct = async (
  manufacturingOrder,
  productionUnit,
) => {
  if (productionUnit.product) {
    return productionUnit.product;
  }

  if (!productionUnit.orderItemId) {
    throw createError("Production unit has no order item reference", 400);
  }

  const order = await Order.findById(manufacturingOrder.order);

  if (!order) {
    throw createError("Original order not found", 404);
  }

  const orderItem = order.items.find(
    (item) => item._id?.toString() === productionUnit.orderItemId?.toString(),
  );

  if (!orderItem) {
    throw createError("Order item not found for this production unit", 404);
  }

  if (!orderItem.product) {
    throw createError("The original order item has no product assigned", 400);
  }

  productionUnit.product = orderItem.product;

  return orderItem.product;
};

/**
 * Create Experience for a production unit.
 *
 * Important:
 * Experience is automatically linked to:
 *
 * Product
 * SmartUnit
 * SmartUnitInstance through serialNumber
 * Order
 * OrderItem
 *
 * The serialNumber of the Experience MUST be the same
 * as the physical SmartUnitInstance serialNumber.
 */
const createExperienceForProductionUnit = async (
  manufacturingOrder,
  productionUnit,
  experienceData = {},
) => {
  const order = await Order.findById(manufacturingOrder.order);

  if (!order) {
    throw createError("Original order not found", 404);
  }

  await ensureProductionUnitProduct(manufacturingOrder, productionUnit);

  if (!productionUnit.orderItemId) {
    throw createError("Production unit has no order item reference", 400);
  }

  if (!productionUnit.product) {
    throw createError("Production unit product not found", 400);
  }

  if (!productionUnit.smartUnit) {
    throw createError("Production unit smart unit not found", 400);
  }

  if (!productionUnit.smartUnitInstance) {
    throw createError(
      "A physical Smart Unit instance must be assigned before creating the experience",
      400,
    );
  }

  const smartUnitInstance = await SmartUnitInstance.findById(
    productionUnit.smartUnitInstance,
  );

  if (!smartUnitInstance) {
    throw createError("Assigned smart unit instance was not found", 404);
  }

  /* -------------------------------------------------------
     Make sure instance belongs to selected SmartUnit
  ------------------------------------------------------- */

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

  /* -------------------------------------------------------
     Serial number is taken from the physical instance
  ------------------------------------------------------- */

  if (!smartUnitInstance.serialNumber) {
    throw createError("Smart unit instance has no serial number", 400);
  }

  productionUnit.serialNumber = smartUnitInstance.serialNumber;

  /* -------------------------------------------------------
     Find original order item
  ------------------------------------------------------- */

  const orderItems = order.items || [];

  let orderItem = orderItems.find(
    (item) => item._id?.toString() === productionUnit.orderItemId?.toString(),
  );

  if (!orderItem) {
    orderItem = orderItems.find(
      (item) => item.product?.toString() === productionUnit.product?.toString(),
    );
  }

  if (!orderItem) {
    throw createError("Order item not found", 404);
  }

  if (productionUnit.orderItemId?.toString() !== orderItem._id.toString()) {
    productionUnit.orderItemId = orderItem._id;
  }

  /* -------------------------------------------------------
     If production unit already has an Experience
  ------------------------------------------------------- */

  if (productionUnit.experience) {
    const existingExperience = await Experience.findById(
      productionUnit.experience,
    );

    if (existingExperience) {
      return existingExperience;
    }

    productionUnit.experience = null;
  }

  /* -------------------------------------------------------
     If order item already has Experience
  ------------------------------------------------------- */

  if (orderItem.experience) {
    const existingExperience = await Experience.findById(orderItem.experience);

    if (existingExperience) {
      productionUnit.experience = existingExperience._id;

      productionUnit.status = "experience_created";

      return existingExperience;
    }

    orderItem.experience = null;
  }

  /* -------------------------------------------------------
     Create tokens
  ------------------------------------------------------- */

  const manageToken = generateManageToken();

  const publicToken = generatePublicToken();

  const slug = experienceData?.slug || generateExperienceSlug();

  const type = experienceData?.type || "personal";

  /* -------------------------------------------------------
     IMPORTANT:
     Experience serialNumber =
     SmartUnitInstance serialNumber
  ------------------------------------------------------- */

  const serialNumber = smartUnitInstance.serialNumber;

  /* -------------------------------------------------------
     Create Experience
  ------------------------------------------------------- */

  const experience = await Experience.create({
    order: order._id,

    orderItem: orderItem._id,

    product: productionUnit.product,

    smartUnit: productionUnit.smartUnit,

    owner: order.user || order.customer || null,

    serialNumber,

    manageToken,

    publicToken,

    slug,

    type,

    status: "waiting",

    visits: 0,

    activatedAt: null,
  });

  /* -------------------------------------------------------
     Create personal Experience data
  ------------------------------------------------------- */

  if (type === "personal") {
    await ExperiencePersonal.create({
      experience: experience._id,
    });
  }

  /* -------------------------------------------------------
     Update Order Item
  ------------------------------------------------------- */

  orderItem.experience = experience._id;

  await order.save();

  /* -------------------------------------------------------
     Update Production Unit
  ------------------------------------------------------- */

  productionUnit.experience = experience._id;

  productionUnit.status = "experience_created";

  productionUnit.serialNumber = smartUnitInstance.serialNumber;

  return experience;
};

/* =========================================================
   CREATE MANUFACTURING ORDER
========================================================= */

export const createManufacturingOrder = async (orderId) => {
  validateObjectId(orderId, "Invalid order ID");

  const existingManufacturingOrder = await ManufacturingOrder.findOne({
    order: orderId,
  });

  if (existingManufacturingOrder) {
    return getManufacturingOrderById(existingManufacturingOrder._id);
  }

  const order = await Order.findById(orderId)
    .populate("user", "email firstName lastName")
    .populate(
      "items.product",
      "name price images primaryImage image sku material color",
    );

  if (!order) {
    throw createError("Order not found", 404);
  }

  if (!Array.isArray(order.items) || order.items.length === 0) {
    throw createError("Order has no items", 400);
  }

  const units = [];

  for (const item of order.items) {
    const productId = item.product?._id || item.product;

    if (!productId) {
      throw createError(`Product is missing for order item ${item._id}`, 400);
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      throw createError(`Invalid product ID for order item ${item._id}`, 400);
    }

    const quantity = Number(item.quantity || 1);

    for (let index = 1; index <= quantity; index++) {
      units.push({
        orderItemId: item._id,

        product: productId,

        unitNumber: index,

        smartUnit: null,

        smartUnitInstance: null,

        experience: null,

        serialNumber: "",

        status: "pending",

        notes: "",

        startedAt: null,

        completedAt: null,
      });
    }
  }

  if (units.length === 0) {
    throw createError("Unable to create production units", 400);
  }

  const manufacturingOrder = await ManufacturingOrder.create({
    order: order._id,

    orderNumber: order.orderNumber,

    customer: order.user?._id || order.user,

    status: "pending",

    units,

    notes: "",

    startedBy: null,

    completedBy: null,

    startedAt: null,

    completedAt: null,
  });

  return getManufacturingOrderById(manufacturingOrder._id);
};

/* =========================================================
   GET ALL
========================================================= */

export const getAllManufacturingOrders = async () => {
  const manufacturingOrders = await ManufacturingOrder.find()
    .populate("order", "orderNumber orderStatus paymentStatus total createdAt")
    .populate("customer", "email firstName lastName")
    .populate(
      "units.product",
      "name price image images primaryImage sku material color",
    )
    .populate(
      "units.smartUnit",
      "name description image technologyModel costPrice firmwareVersion manufacturer status",
    )
    .populate(
      "units.smartUnitInstance",
      "smartUnit serialNumber status firmwareVersion assignedAt activatedAt notes",
    )
    .populate("units.experience", "serialNumber publicToken slug status")
    .sort({
      createdAt: -1,
    });

  return manufacturingOrders;
};

/* =========================================================
   GET BY ID
========================================================= */

export const getManufacturingOrderById = async (manufacturingOrderId) => {
  validateObjectId(manufacturingOrderId, "Invalid manufacturing order ID");

  const manufacturingOrder = await ManufacturingOrder.findById(
    manufacturingOrderId,
  )
    .populate(
      "order",
      "orderNumber orderStatus paymentStatus total subtotal shippingAddress items createdAt user",
    )
    .populate(
      "order.items.product",
      "name price image images primaryImage sku material color",
    )
    .populate(
      "order.items.technologyModel",
      "name modelName modelCode manufacturer description status",
    )
    .populate("customer", "email firstName lastName")
    .populate(
      "units.product",
      "name price image images primaryImage sku material color technologyModel",
    )
    .populate({
      path: "units.smartUnit",

      select:
        "name description image technologyModel costPrice firmwareVersion manufacturer status",

      populate: {
        path: "technologyModel",

        select: "name modelName modelCode manufacturer description status",
      },
    })
    .populate({
      path: "units.smartUnitInstance",

      select:
        "smartUnit serialNumber status firmwareVersion assignedAt activatedAt notes",

      populate: {
        path: "smartUnit",

        select:
          "name description image technologyModel costPrice firmwareVersion manufacturer status",
      },
    })
    .populate(
      "units.experience",
      "order orderItem product smartUnit owner serialNumber manageToken publicToken slug type status activatedAt visits",
    );

  if (!manufacturingOrder) {
    throw createError("Manufacturing order not found", 404);
  }

  return manufacturingOrder;
};

/* =========================================================
   START MANUFACTURING
========================================================= */

export const startManufacturing = async (manufacturingOrderId, adminUserId) => {
  validateObjectId(manufacturingOrderId, "Invalid manufacturing order ID");

  validateObjectId(adminUserId, "Invalid admin user ID");

  const manufacturingOrder =
    await ManufacturingOrder.findById(manufacturingOrderId);

  if (!manufacturingOrder) {
    throw createError("Manufacturing order not found", 404);
  }

  if (manufacturingOrder.status === "completed") {
    throw createError("Manufacturing order is already completed", 400);
  }

  if (manufacturingOrder.status === "cancelled") {
    throw createError("Manufacturing order is cancelled", 400);
  }

  manufacturingOrder.status = "in_progress";

  manufacturingOrder.startedBy = adminUserId;

  manufacturingOrder.startedAt = manufacturingOrder.startedAt || new Date();

  await Order.findByIdAndUpdate(manufacturingOrder.order, {
    orderStatus: "processing",
  });

  await manufacturingOrder.save();

  return getManufacturingOrderById(manufacturingOrderId);
};

/* =========================================================
   ASSIGN SMART UNIT
========================================================= */

export const assignSmartUnit = async (
  manufacturingOrderId,
  unitId,
  smartUnitId,
  smartUnitInstanceId,
) => {
  validateObjectId(manufacturingOrderId, "Invalid manufacturing order ID");

  validateObjectId(unitId, "Invalid production unit ID");

  validateObjectId(smartUnitId, "Invalid smart unit ID");

  validateObjectId(smartUnitInstanceId, "Invalid smart unit instance ID");

  const manufacturingOrder =
    await ManufacturingOrder.findById(manufacturingOrderId);

  if (!manufacturingOrder) {
    throw createError("Manufacturing order not found", 404);
  }

  if (manufacturingOrder.status === "cancelled") {
    throw createError("Manufacturing order is cancelled", 400);
  }

  if (manufacturingOrder.status === "completed") {
    throw createError("Manufacturing order is already completed", 400);
  }

  const productionUnit = manufacturingOrder.units.id(unitId);

  if (!productionUnit) {
    throw createError("Production unit not found", 404);
  }

  if (!productionUnit.product) {
    throw createError(
      "This production unit has no product assigned. Please recreate the manufacturing order from the original order.",
      400,
    );
  }

  /* -------------------------------------------------------
     Do NOT allow changing physical unit after Experience
     has been created.
  ------------------------------------------------------- */

  if (productionUnit.experience) {
    const existingExperience = await Experience.findById(
      productionUnit.experience,
    );

    if (existingExperience) {
      throw createError(
        "Smart Unit cannot be changed after the Experience has been created",
        400,
      );
    }

    productionUnit.experience = null;
  }

  /* -------------------------------------------------------
     Get SmartUnit model
  ------------------------------------------------------- */

  const smartUnit = await SmartUnit.findById(smartUnitId);

  if (!smartUnit) {
    throw createError("Smart unit not found", 404);
  }

  /* -------------------------------------------------------
     Get physical SmartUnitInstance
  ------------------------------------------------------- */

  const smartUnitInstance =
    await SmartUnitInstance.findById(smartUnitInstanceId);

  if (!smartUnitInstance) {
    throw createError("Smart unit instance not found", 404);
  }

  /* -------------------------------------------------------
     Validate relationship
  ------------------------------------------------------- */

  if (
    !smartUnitInstance.smartUnit ||
    smartUnitInstance.smartUnit.toString() !== smartUnit._id.toString()
  ) {
    throw createError(
      "This smart unit instance does not belong to the selected smart unit",
      400,
    );
  }

  /* -------------------------------------------------------
     Serial Number is mandatory
  ------------------------------------------------------- */

  if (!smartUnitInstance.serialNumber) {
    throw createError("Smart unit instance must have a serial number", 400);
  }

  /* -------------------------------------------------------
     Instance must be available
  ------------------------------------------------------- */

  if (smartUnitInstance.status !== "available") {
    throw createError(
      `This smart unit instance is not available. Current status: ${smartUnitInstance.status}`,
      400,
    );
  }

  /* -------------------------------------------------------
     Prevent duplicate assignment inside same MO
  ------------------------------------------------------- */

  const alreadyAssigned = manufacturingOrder.units.some(
    (unit) =>
      unit.smartUnitInstance &&
      unit.smartUnitInstance.toString() === smartUnitInstanceId.toString() &&
      unit._id.toString() !== unitId.toString(),
  );

  if (alreadyAssigned) {
    throw createError(
      "This smart unit instance is already assigned to another production unit in this manufacturing order",
      400,
    );
  }

  /* -------------------------------------------------------
     Release previous instance if exists
  ------------------------------------------------------- */

  if (
    productionUnit.smartUnitInstance &&
    productionUnit.smartUnitInstance.toString() !==
      smartUnitInstanceId.toString()
  ) {
    await SmartUnitInstance.findByIdAndUpdate(
      productionUnit.smartUnitInstance,
      {
        status: "available",

        assignedAt: null,

        activatedAt: null,
      },
    );
  }

  /* -------------------------------------------------------
     Assign SmartUnit + Physical Instance
  ------------------------------------------------------- */

  productionUnit.smartUnit = smartUnit._id;

  productionUnit.smartUnitInstance = smartUnitInstance._id;

  productionUnit.serialNumber = smartUnitInstance.serialNumber;

  productionUnit.status = "unit_assigned";

  /* -------------------------------------------------------
     Reserve physical instance
  ------------------------------------------------------- */

  smartUnitInstance.status = "reserved";

  smartUnitInstance.assignedAt = new Date();

  smartUnitInstance.activatedAt = null;

  await smartUnitInstance.save();

  /* -------------------------------------------------------
     Automatically create Experience
  ------------------------------------------------------- */

  await createExperienceForProductionUnit(manufacturingOrder, productionUnit);

  await manufacturingOrder.save();

  return getManufacturingOrderById(manufacturingOrderId);
};

/* =========================================================
   CREATE EXPERIENCE MANUALLY
   Kept for compatibility with existing controllers.
========================================================= */

export const createExperienceForUnit = async (
  manufacturingOrderId,
  unitId,
  experienceData = {},
) => {
  validateObjectId(manufacturingOrderId, "Invalid manufacturing order ID");

  validateObjectId(unitId, "Invalid production unit ID");

  const manufacturingOrder =
    await ManufacturingOrder.findById(manufacturingOrderId);

  if (!manufacturingOrder) {
    throw createError("Manufacturing order not found", 404);
  }

  const productionUnit = manufacturingOrder.units.id(unitId);

  if (!productionUnit) {
    throw createError("Production unit not found", 404);
  }

  await createExperienceForProductionUnit(
    manufacturingOrder,
    productionUnit,
    experienceData,
  );

  await manufacturingOrder.save();

  return getManufacturingOrderById(manufacturingOrderId);
};

/* =========================================================
   START PRODUCTION UNIT
========================================================= */

export const startProductionUnit = async (manufacturingOrderId, unitId) => {
  validateObjectId(manufacturingOrderId, "Invalid manufacturing order ID");

  validateObjectId(unitId, "Invalid production unit ID");

  const manufacturingOrder =
    await ManufacturingOrder.findById(manufacturingOrderId);

  if (!manufacturingOrder) {
    throw createError("Manufacturing order not found", 404);
  }

  if (manufacturingOrder.status === "cancelled") {
    throw createError("Manufacturing order is cancelled", 400);
  }

  if (manufacturingOrder.status === "completed") {
    throw createError("Manufacturing order is already completed", 400);
  }

  const productionUnit = manufacturingOrder.units.id(unitId);

  if (!productionUnit) {
    throw createError("Production unit not found", 404);
  }

  if (!productionUnit.product) {
    throw createError("Production unit has no product assigned", 400);
  }

  if (!productionUnit.smartUnit) {
    throw createError("Smart unit model must be assigned first", 400);
  }

  if (!productionUnit.smartUnitInstance) {
    throw createError(
      "Smart unit physical instance must be assigned first",
      400,
    );
  }

  /* -------------------------------------------------------
       Experience should already exist automatically
    ------------------------------------------------------- */

  if (!productionUnit.experience) {
    await createExperienceForProductionUnit(manufacturingOrder, productionUnit);
  }

  const smartUnitInstance = await SmartUnitInstance.findById(
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

  const experience = await Experience.findById(productionUnit.experience);

  if (!experience) {
    throw createError(
      "Experience linked to this production unit was not found",
      404,
    );
  }

  /* -------------------------------------------------------
       Validate Product relationship
    ------------------------------------------------------- */

  if (!experience.product) {
    throw createError("Experience has no product assigned", 400);
  }

  if (experience.product.toString() !== productionUnit.product.toString()) {
    throw createError(
      "Experience product does not match production unit product",
      400,
    );
  }

  /* -------------------------------------------------------
       Validate SmartUnit relationship
    ------------------------------------------------------- */

  if (!experience.smartUnit) {
    throw createError("Experience has no smart unit assigned", 400);
  }

  if (experience.smartUnit.toString() !== productionUnit.smartUnit.toString()) {
    throw createError(
      "Experience smart unit does not match production unit smart unit",
      400,
    );
  }

  /* -------------------------------------------------------
       Validate Serial Number relationship
    ------------------------------------------------------- */

  if (experience.serialNumber !== smartUnitInstance.serialNumber) {
    throw createError(
      "Experience serial number does not match smart unit instance serial number",
      400,
    );
  }

  if (productionUnit.status === "completed") {
    throw createError("Production unit is already completed", 400);
  }

  /* -------------------------------------------------------
       Start Production
    ------------------------------------------------------- */

  productionUnit.status = "in_production";

  productionUnit.startedAt = productionUnit.startedAt || new Date();

  productionUnit.serialNumber = smartUnitInstance.serialNumber;

  /* -------------------------------------------------------
       Activate physical SmartUnitInstance
    ------------------------------------------------------- */

  smartUnitInstance.status = "activated";

  smartUnitInstance.activatedAt = smartUnitInstance.activatedAt || new Date();

  await smartUnitInstance.save();

  /* -------------------------------------------------------
       Experience is waiting until production completes
    ------------------------------------------------------- */

  experience.status = "waiting";

  await experience.save();

  /* -------------------------------------------------------
       Update Manufacturing Order
    ------------------------------------------------------- */

  if (manufacturingOrder.status === "pending") {
    manufacturingOrder.status = "in_progress";

    manufacturingOrder.startedAt = manufacturingOrder.startedAt || new Date();
  }

  await manufacturingOrder.save();

  await Order.findByIdAndUpdate(manufacturingOrder.order, {
    orderStatus: "processing",
  });

  return getManufacturingOrderById(manufacturingOrderId);
};

/* =========================================================
   COMPLETE PRODUCTION UNIT
========================================================= */

export const completeProductionUnit = async (
  manufacturingOrderId,
  unitId,
  notes = "",
) => {
  validateObjectId(manufacturingOrderId, "Invalid manufacturing order ID");

  validateObjectId(unitId, "Invalid production unit ID");

  const manufacturingOrder =
    await ManufacturingOrder.findById(manufacturingOrderId);

  if (!manufacturingOrder) {
    throw createError("Manufacturing order not found", 404);
  }

  const productionUnit = manufacturingOrder.units.id(unitId);

  if (!productionUnit) {
    throw createError("Production unit not found", 404);
  }

  if (!productionUnit.product) {
    throw createError("Production unit has no product assigned", 400);
  }

  if (!productionUnit.smartUnit) {
    throw createError("Smart unit model must be assigned first", 400);
  }

  if (!productionUnit.smartUnitInstance) {
    throw createError(
      "Smart unit physical instance must be assigned first",
      400,
    );
  }

  if (!productionUnit.experience) {
    throw createError("Experience must be created first", 400);
  }

  const smartUnitInstance = await SmartUnitInstance.findById(
    productionUnit.smartUnitInstance,
  );

  if (!smartUnitInstance) {
    throw createError("Smart unit instance not found", 404);
  }

  /* -------------------------------------------------------
       Validate SmartUnit relationship
    ------------------------------------------------------- */

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

  /* -------------------------------------------------------
       Validate Experience
    ------------------------------------------------------- */

  const experience = await Experience.findById(productionUnit.experience);

  if (!experience) {
    throw createError("Experience not found", 404);
  }

  if (experience.product?.toString() !== productionUnit.product.toString()) {
    throw createError(
      "Experience product does not match production unit product",
      400,
    );
  }

  if (
    experience.smartUnit?.toString() !== productionUnit.smartUnit.toString()
  ) {
    throw createError(
      "Experience smart unit does not match production unit smart unit",
      400,
    );
  }

  if (experience.serialNumber !== smartUnitInstance.serialNumber) {
    throw createError(
      "Experience serial number does not match smart unit instance serial number",
      400,
    );
  }

  /* -------------------------------------------------------
       Complete Production Unit
    ------------------------------------------------------- */

  productionUnit.status = "completed";

  productionUnit.completedAt = new Date();

  productionUnit.serialNumber = smartUnitInstance.serialNumber;

  if (notes) {
    productionUnit.notes = notes;
  }

  /* -------------------------------------------------------
       Activate Experience
    ------------------------------------------------------- */

  experience.status = "active";

  experience.activatedAt = experience.activatedAt || new Date();

  await experience.save();

  /* -------------------------------------------------------
       SmartUnitInstance remains activated
    ------------------------------------------------------- */

  smartUnitInstance.status = "activated";

  smartUnitInstance.activatedAt = smartUnitInstance.activatedAt || new Date();

  await smartUnitInstance.save();

  /* -------------------------------------------------------
       Check if ALL units are completed
    ------------------------------------------------------- */

  const allCompleted = manufacturingOrder.units.every(
    (unit) => unit.status === "completed",
  );

  if (allCompleted) {
    manufacturingOrder.status = "completed";

    manufacturingOrder.completedAt = new Date();

    await Order.findByIdAndUpdate(manufacturingOrder.order, {
      orderStatus: "shipped",
    });
  }

  await manufacturingOrder.save();

  return getManufacturingOrderById(manufacturingOrderId);
};

/* =========================================================
   CANCEL MANUFACTURING ORDER
========================================================= */

export const cancelManufacturingOrder = async (manufacturingOrderId) => {
  validateObjectId(manufacturingOrderId, "Invalid manufacturing order ID");

  const manufacturingOrder =
    await ManufacturingOrder.findById(manufacturingOrderId);

  if (!manufacturingOrder) {
    throw createError("Manufacturing order not found", 404);
  }

  if (manufacturingOrder.status === "completed") {
    throw createError("Completed manufacturing order cannot be cancelled", 400);
  }

  /* -------------------------------------------------------
       Release SmartUnitInstances
    ------------------------------------------------------- */

  for (const unit of manufacturingOrder.units) {
    if (unit.smartUnitInstance) {
      await SmartUnitInstance.findByIdAndUpdate(unit.smartUnitInstance, {
        status: "available",

        assignedAt: null,

        activatedAt: null,
      });
    }

    /* -----------------------------------------------------
         Cancel Experience
      ----------------------------------------------------- */

    if (unit.experience) {
      await Experience.findByIdAndUpdate(unit.experience, {
        status: "cancelled",
      });
    }
  }

  manufacturingOrder.status = "cancelled";

  await manufacturingOrder.save();

  await Order.findByIdAndUpdate(manufacturingOrder.order, {
    orderStatus: "cancelled",
  });

  return getManufacturingOrderById(manufacturingOrderId);
};
