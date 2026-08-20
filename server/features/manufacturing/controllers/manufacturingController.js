import {
  createManufacturingOrder,
  getAllManufacturingOrders,
  getManufacturingOrderById,
  startManufacturing,
  assignSmartUnit,
  createExperienceForUnit,
  startProductionUnit,
  completeProductionUnit,
  cancelManufacturingOrder,
} from "../services/manufacturingService.js";

export const createManufacturingOrderController = async (req, res, next) => {
  try {
    const manufacturingOrder = await createManufacturingOrder(
      req.params.orderId,
    );

    return res.status(201).json({
      success: true,

      message: "Manufacturing order created successfully",

      data: manufacturingOrder,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllManufacturingOrdersController = async (req, res, next) => {
  try {
    const manufacturingOrders = await getAllManufacturingOrders();

    return res.status(200).json({
      success: true,

      data: manufacturingOrders,
    });
  } catch (error) {
    next(error);
  }
};

export const getManufacturingOrderByIdController = async (req, res, next) => {
  try {
    const manufacturingOrder = await getManufacturingOrderById(req.params.id);

    return res.status(200).json({
      success: true,

      data: manufacturingOrder,
    });
  } catch (error) {
    next(error);
  }
};

export const startManufacturingController = async (req, res, next) => {
  try {
    const manufacturingOrder = await startManufacturing(
      req.params.id,
      req.user.userId,
    );

    return res.status(200).json({
      success: true,

      message: "Manufacturing started successfully",

      data: manufacturingOrder,
    });
  } catch (error) {
    next(error);
  }
};

export const assignSmartUnitController = async (req, res, next) => {
  try {
    const { smartUnitId, smartUnitInstanceId } = req.body;

    const manufacturingOrder = await assignSmartUnit(
      req.params.id,
      req.params.unitId,
      smartUnitId,
      smartUnitInstanceId,
    );

    return res.status(200).json({
      success: true,

      message: "Smart unit instance assigned successfully",

      data: manufacturingOrder,
    });
  } catch (error) {
    next(error);
  }
};

export const createExperienceController = async (req, res, next) => {
  try {
    const { slug, type } = req.body;

    const manufacturingOrder = await createExperienceForUnit(
      req.params.id,
      req.params.unitId,
      {
        slug,
        type,
      },
    );

    return res.status(201).json({
      success: true,

      message: "Experience created successfully",

      data: manufacturingOrder,
    });
  } catch (error) {
    next(error);
  }
};

export const startProductionUnitController = async (req, res, next) => {
  try {
    const manufacturingOrder = await startProductionUnit(
      req.params.id,
      req.params.unitId,
    );

    return res.status(200).json({
      success: true,

      message: "Production unit started successfully",

      data: manufacturingOrder,
    });
  } catch (error) {
    next(error);
  }
};

export const completeProductionUnitController = async (req, res, next) => {
  try {
    const { notes = "" } = req.body;

    const manufacturingOrder = await completeProductionUnit(
      req.params.id,
      req.params.unitId,
      notes,
    );

    return res.status(200).json({
      success: true,

      message: "Production unit completed successfully",

      data: manufacturingOrder,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelManufacturingOrderController = async (req, res, next) => {
  try {
    const manufacturingOrder = await cancelManufacturingOrder(req.params.id);

    return res.status(200).json({
      success: true,

      message: "Manufacturing order cancelled successfully",

      data: manufacturingOrder,
    });
  } catch (error) {
    next(error);
  }
};
