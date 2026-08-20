import api from "../../../lib/axios";

export const getManufacturingOrders = async () => {
  const response = await api.get("/manufacturing");

  return response.data;
};

export const getManufacturingOrderById = async (manufacturingOrderId) => {
  const response = await api.get(`/manufacturing/${manufacturingOrderId}`);

  return response.data;
};

export const createManufacturingOrder = async (orderId) => {
  const response = await api.post(`/manufacturing/from-order/${orderId}`);

  return response.data;
};

export const startManufacturing = async (manufacturingOrderId) => {
  const response = await api.patch(
    `/manufacturing/${manufacturingOrderId}/start`,
  );

  return response.data;
};

export const assignSmartUnit = async (
  manufacturingOrderId,
  unitId,
  smartUnitId,
  smartUnitInstanceId,
) => {
  if (!manufacturingOrderId) {
    throw new Error("Manufacturing order ID is required");
  }

  if (!unitId) {
    throw new Error("Production unit ID is required");
  }

  if (!smartUnitId) {
    throw new Error("Smart unit ID is required");
  }

  if (!smartUnitInstanceId) {
    throw new Error("Smart unit instance ID is required");
  }

  console.log("ASSIGN SMART UNIT INSTANCE REQUEST:", {
    manufacturingOrderId,
    unitId,
    smartUnitId,
    smartUnitInstanceId,
  });

  try {
    const response = await api.patch(
      `/manufacturing/${manufacturingOrderId}/units/${unitId}/smart-unit`,
      {
        smartUnitId,
        smartUnitInstanceId,
      },
    );

    console.log("ASSIGN SMART UNIT INSTANCE RESPONSE:", response.data);

    return response.data;
  } catch (error) {
    console.error("ASSIGN SMART UNIT INSTANCE API ERROR:", error);

    console.error(
      "ASSIGN SMART UNIT INSTANCE API STATUS:",
      error?.response?.status,
    );

    console.error(
      "ASSIGN SMART UNIT INSTANCE API DATA:",
      error?.response?.data,
    );

    throw error;
  }
};

export const createExperienceForUnit = async (
  manufacturingOrderId,
  unitId,
  experienceData = {},
) => {
  if (!manufacturingOrderId) {
    throw new Error("Manufacturing order ID is required");
  }

  if (!unitId) {
    throw new Error("Production unit ID is required");
  }

  console.log("CREATE EXPERIENCE REQUEST:", {
    manufacturingOrderId,
    unitId,
    experienceData,
  });

  try {
    const response = await api.post(
      `/manufacturing/${manufacturingOrderId}/units/${unitId}/experience`,
      experienceData,
    );

    console.log("CREATE EXPERIENCE RESPONSE:", response.data);

    return response.data;
  } catch (error) {
    console.error("CREATE EXPERIENCE API ERROR:", error);

    console.error("CREATE EXPERIENCE API STATUS:", error?.response?.status);

    console.error("CREATE EXPERIENCE API DATA:", error?.response?.data);

    throw error;
  }
};

export const startProductionUnit = async (manufacturingOrderId, unitId) => {
  const response = await api.patch(
    `/manufacturing/${manufacturingOrderId}/units/${unitId}/start`,
  );

  return response.data;
};

export const completeProductionUnit = async (
  manufacturingOrderId,
  unitId,
  notes = "",
) => {
  const response = await api.patch(
    `/manufacturing/${manufacturingOrderId}/units/${unitId}/complete`,
    {
      notes,
    },
  );

  return response.data;
};

export const cancelManufacturingOrder = async (manufacturingOrderId) => {
  const response = await api.patch(
    `/manufacturing/${manufacturingOrderId}/cancel`,
  );

  return response.data;
};
