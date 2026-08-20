
import api from "../../../lib/axios";


// ==========================================
// CREATE ORDER
// POST /api/orders
// ==========================================

export const createOrder = async (
  orderData
) => {
  const response =
    await api.post(
      "/orders",
      orderData
    );

  return response.data;
};


// ==========================================
// GET MY ORDERS
// GET /api/orders/my-orders
// ==========================================

export const getMyOrders =
  async () => {
    const response =
      await api.get(
        "/orders/my-orders"
      );

    return response.data;
  };


// ==========================================
// GET MY ORDER BY ID
// GET /api/orders/my-orders/:id
// ==========================================

export const getMyOrderById =
  async (
    orderId
  ) => {
    const response =
      await api.get(
        `/orders/my-orders/${orderId}`
      );

    return response.data;
  };


// ==========================================
// ADMIN - GET ALL ORDERS
// GET /api/orders/admin
// ==========================================

export const getAdminOrders =
  async () => {
    const response =
      await api.get(
        "/orders/admin"
      );

    return response.data;
  };


// ==========================================
// ADMIN - GET ORDER BY ID
// GET /api/orders/admin/:id
// ==========================================

// ==========================================
// ADMIN - GET ORDER BY ID
// GET /api/orders/admin/:id
// ==========================================

export const getAdminOrderById = async (orderId) => {
  const response = await api.get(`/orders/admin/${orderId}`);

  console.log("ADMIN ORDER RESPONSE:", response.data);

  return response.data;
};
// ==========================================
// ADMIN - UPDATE ORDER STATUS
// PATCH /api/orders/admin/:id/status
// ==========================================

export const updateOrderStatus =
  async (
    orderId,
    orderStatus
  ) => {
    const response =
      await api.patch(
        `/orders/admin/${orderId}/status`,
        {
          orderStatus,
        }
      );

    return response.data;
  };
