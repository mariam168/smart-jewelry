import {
  createOrder,
  getUserOrders,
  getUserOrderById,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
} from "../services/orderService.js";

export const createOrderController = async (req, res, next) => {
  try {
    const {
      manufacturingName,
      manufacturingNotes = "",
      shippingAddress,
      shippingAreaId,
      paymentMethod,
    } = req.body;

    const order = await createOrder(req.user.userId, {
      manufacturingName,
      manufacturingNotes,
      shippingAddress,
      shippingAreaId,
      paymentMethod,
    });

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await getUserOrders(req.user.userId);

    return res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyOrderById = async (req, res, next) => {
  try {
    const order = await getUserOrderById(
      req.user.userId,
      req.params.id,
    );

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminOrders = async (req, res, next) => {
  try {
    const orders = await getAllOrders();

    return res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminOrderById = async (req, res, next) => {
  try {
    const order = await getOrderById(req.params.id);

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAdminOrderStatus = async (req, res, next) => {
  try {
    const { orderStatus } = req.body;

    const order = await updateOrderStatus(
      req.params.id,
      orderStatus,
    );

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAdminOrder = async (req, res, next) => {
  try {
    const order = await deleteOrder(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Order deleted successfully",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};
