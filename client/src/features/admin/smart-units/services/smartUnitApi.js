import api from "../../../../lib/axios";

export const getSmartUnits = async () => {
  try {
    const response = await api.get("/smart-units");

    return response.data;
  } catch (error) {
    console.error("GET SMART UNITS ERROR:", error);
    throw error;
  }
};

export const getSmartUnit = async (smartUnitId) => {
  const response = await api.get(`/smart-units/${smartUnitId}`);

  return response.data;
};

export const createSmartUnit = async (smartUnitData) => {
  const response = await api.post("/smart-units", smartUnitData);

  return response.data;
};

export const updateSmartUnit = async (smartUnitId, smartUnitData) => {
  const response = await api.put(`/smart-units/${smartUnitId}`, smartUnitData);

  return response.data;
};

export const deleteSmartUnit = async (smartUnitId) => {
  const response = await api.delete(`/smart-units/${smartUnitId}`);

  return response.data;
};

export const getSmartUnitInstances = async (smartUnitId) => {
  const response = await api.get(`/smart-units/${smartUnitId}/instances`);

  return response.data;
};

export const createSmartUnitInstance = async (smartUnitId, instanceData) => {
  const response = await api.post(
    `/smart-units/${smartUnitId}/instances`,
    instanceData,
  );

  return response.data;
};

export const generateSmartUnitInstances = async (smartUnitId) => {
  const response = await api.post(
    `/smart-units/${smartUnitId}/instances/generate`,
  );

  return response.data;
};

export const updateSmartUnitInstance = async (instanceId, instanceData) => {
  const response = await api.put(
    `/smart-unit-instances/${instanceId}`,
    instanceData,
  );

  return response.data;
};
