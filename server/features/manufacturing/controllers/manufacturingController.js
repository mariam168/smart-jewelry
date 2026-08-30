import {
  createManufacturingOrder,
  getAllManufacturingOrders,
  getManufacturingOrderById,
  startManufacturing,
  assignSmartUnit,
  updateAssemblyCost,
  createExperienceForUnit,
  startProductionUnit,
  completeProductionUnit,
  startPackaging,
  completePackaging,
  cancelManufacturingOrder,
} from "../services/manufacturingService.js";

const getCurrentUserId = (req) => {
  return req.user?.userId || req.user?.id || req.user?._id || null;
};

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
      getCurrentUserId(req),
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
    const {
      smartUnitId,
      smartUnitInstanceId,
      assemblyCost = 0,
    } = req.body;

    const manufacturingOrder = await assignSmartUnit(
      req.params.id,
      req.params.unitId,
      smartUnitId,
      smartUnitInstanceId,
      assemblyCost,
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

export const updateAssemblyCostController = async (req, res, next) => {
  try {
    const manufacturingOrder = await updateAssemblyCost(
      req.params.id,
      req.params.unitId,
      req.body.assemblyCost,
    );

    return res.status(200).json({
      success: true,
      message: "Assembly cost updated successfully",
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
      message: "Production completed. Unit is ready for packaging.",
      data: manufacturingOrder,
    });
  } catch (error) {
    next(error);
  }
};

export const startPackagingController = async (req, res, next) => {
  try {
    const manufacturingOrder = await startPackaging(
      req.params.id,
      req.params.unitId,
    );

    return res.status(200).json({
      success: true,
      message: "Packaging started successfully",
      data: manufacturingOrder,
    });
  } catch (error) {
    next(error);
  }
};

export const completePackagingController = async (req, res, next) => {
  try {
    const {
      packagingCost = 0,
      packagingNotes = "",
    } = req.body;

    const manufacturingOrder = await completePackaging(
      req.params.id,
      req.params.unitId,
      packagingCost,
      packagingNotes,
      getCurrentUserId(req),
    );

    return res.status(200).json({
      success: true,
      message: "Packaging completed successfully",
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