import api from "../../../lib/axios";

export const getTechnologies = async () => {
  const response = await api.get("/technologies");

  return response.data;
};

export const getTechnology = async (technologyId) => {
  const response = await api.get(`/technologies/${technologyId}`);

  return response.data;
};

export const createTechnology = async (technologyData) => {
  const response = await api.post("/technologies", technologyData);

  return response.data;
};

export const updateTechnology = async (technologyId, technologyData) => {
  const response = await api.put(
    `/technologies/${technologyId}`,
    technologyData,
  );

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

export const deleteTechnology = async (technologyId) => {
  const response = await api.delete(`/technologies/${technologyId}`);

  return response.data;
};
