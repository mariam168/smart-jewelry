import api from "../../../lib/axios";

export const createOrder = async (orderData) => {
  const response = await api.post("/orders", orderData);

  return response.data;
};

export const getMyOrders = async () => {
  const response = await api.get("/orders/my-orders");

  return response.data;
};

export const getMyOrderById = async (orderId) => {
  const response = await api.get(`/orders/my-orders/${orderId}`);

  return response.data;
};

export const getAdminOrders = async () => {
  const response = await api.get("/orders/admin");

  return response.data;
};

export const getAdminOrderById = async (orderId) => {
  const response = await api.get(`/orders/admin/${orderId}`);

  console.log("ADMIN ORDER RESPONSE:", response.data);

  return response.data;
};

export const updateOrderStatus = async (orderId, orderStatus) => {
  const response = await api.patch(`/orders/admin/${orderId}/status`, {
    orderStatus,
  });

  return response.data;
};
