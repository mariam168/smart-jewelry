import api from "../../../lib/axios";

export const getCategories =
  async () => {
    const response =
      await api.get(
        "/categories",
      );

    return response.data;
  };

export const getCategory =
  async (categoryId) => {
    const response =
      await api.get(
        `/categories/${categoryId}`,
      );

    return response.data;
  };

export const createCategory =
  async (categoryData) => {
    const response =
      await api.post(
        "/categories",
        categoryData,
      );

    return response.data;
  };

export const updateCategory =
  async (
    categoryId,
    categoryData,
  ) => {
    const response =
      await api.put(
        `/categories/${categoryId}`,
        categoryData,
      );

    return response.data;
  };

export const deleteCategory =
  async (categoryId) => {
    const response =
      await api.delete(
        `/categories/${categoryId}`,
      );

    return response.data;
  };

export const uploadImage =
  async (formData) => {
    const response =
      await api.post(
        "/upload",
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        },
      );

    return response.data;
  };