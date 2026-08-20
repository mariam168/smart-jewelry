import api from "../../../lib/axios";

export const getTechnologyModels = async () => {
  const response = await api.get("/technology-models");
  return response.data;
};

export const getTechnologyModel = async (id) => {
  const response = await api.get(`/technology-models/${id}`);
  return response.data;
};

export const createTechnologyModel = async (data) => {
  const response = await api.post("/technology-models", data);
  return response.data;
};

export const updateTechnologyModel = async (id, data) => {
  const response = await api.put(`/technology-models/${id}`, data);
  return response.data;
};

export const deleteTechnologyModel = async (id) => {
  const response = await api.delete(`/technology-models/${id}`);
  return response.data;
};
export const uploadImage = async (formData) => {
  const response = await api.post("/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};
