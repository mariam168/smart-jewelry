import api from "../../../lib/axios";

export const createProductTechnology = async (data) => {
  const response = await api.post("/product-technologies", data);

  return response.data;
};

export const getProductTechnologies = async (productId) => {
  const response = await api.get(`/product-technologies/product/${productId}`);

  return response.data;
};

export const getProductTechnology = async (id) => {
  const response = await api.get(`/product-technologies/${id}`);

  return response.data;
};

export const updateProductTechnology = async (id, data) => {
  const response = await api.put(`/product-technologies/${id}`, data);

  return response.data;
};

export const deleteProductTechnology = async (id) => {
  const response = await api.delete(`/product-technologies/${id}`);

  return response.data;
};
