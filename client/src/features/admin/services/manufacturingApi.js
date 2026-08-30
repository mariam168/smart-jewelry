import api from "../../../lib/axios";

export const getManufacturingOrders = async () => {
  const response = await api.get("/manufacturing");

  return response.data;
};

export const getManufacturingOrderById = async (manufacturingOrderId) => {
  const response = await api.get(
    `/manufacturing/${manufacturingOrderId}`,
  );

  return response.data;
};

export const createManufacturingOrder = async (orderId) => {
  const response = await api.post(
    `/manufacturing/from-order/${orderId}`,
  );

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
  assemblyCost = 0,
) => {
  const response = await api.patch(
    `/manufacturing/${manufacturingOrderId}/units/${unitId}/smart-unit`,
    {
      smartUnitId,
      smartUnitInstanceId,
      assemblyCost,
    },
  );

  return response.data;
};

export const updateAssemblyCost = async (
  manufacturingOrderId,
  unitId,
  assemblyCost,
) => {
  const response = await api.patch(
    `/manufacturing/${manufacturingOrderId}/units/${unitId}/assembly-cost`,
    {
      assemblyCost,
    },
  );

  return response.data;
};

export const createExperienceForUnit = async (
  manufacturingOrderId,
  unitId,
  experienceData = {},
) => {
  const response = await api.post(
    `/manufacturing/${manufacturingOrderId}/units/${unitId}/experience`,
    experienceData,
  );

  return response.data;
};

export const startProductionUnit = async (
  manufacturingOrderId,
  unitId,
) => {
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

export const startPackaging = async (
  manufacturingOrderId,
  unitId,
) => {
  const response = await api.patch(
    `/manufacturing/${manufacturingOrderId}/units/${unitId}/packaging/start`,
  );

  return response.data;
};

export const completePackaging = async (
  manufacturingOrderId,
  unitId,
  packagingCost,
  packagingNotes = "",
) => {
  const response = await api.patch(
    `/manufacturing/${manufacturingOrderId}/units/${unitId}/packaging/complete`,
    {
      packagingCost,
      packagingNotes,
    },
  );

  return response.data;
};

export const cancelManufacturingOrder = async (
  manufacturingOrderId,
) => {
  const response = await api.patch(
    `/manufacturing/${manufacturingOrderId}/cancel`,
  );

  return response.data;
};