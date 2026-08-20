import api from "../../../lib/axios";


export const getCategories = async () => {
  const response = await api.get("/categories");

  console.log("CATEGORIES RESPONSE:", response.data);

  return response.data;
};


export const getCategoryById = async (id) => {
  const response = await api.get(`/categories/${id}`);

  return response.data;
};