import api from "../../../lib/axios";

export const getShippingAreas = async () => {
  const response = await api.get(
    "/shipping/areas",
  );

  return response.data;
};

export const getAdminShippingAreas =
  async () => {
    const response =
      await api.get(
        "/shipping/admin/areas",
      );

    return response.data;
  };

export const createShippingArea =
  async (payload) => {
    const response =
      await api.post(
        "/shipping/admin/areas",
        payload,
      );

    return response.data;
  };

export const updateShippingArea =
  async (
    id,
    payload,
  ) => {
    const response =
      await api.patch(
        `/shipping/admin/areas/${id}`,
        payload,
      );

    return response.data;
  };

export const deleteShippingArea =
  async (id) => {
    const response =
      await api.delete(
        `/shipping/admin/areas/${id}`,
      );

    return response.data;
  };