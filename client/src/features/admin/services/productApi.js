import api from "../../../lib/axios";

export const createProduct = async (productData) => {
  const response = await api.post("/products", productData);

  return response.data;
};

export const getProducts = async () => {
  const response = await api.get("/products");

  return response.data;
};

export const getProduct = async (productId) => {
  const response = await api.get(`/products/${productId}`);

  return response.data;
};

export const updateProduct = async (productId, productData) => {
  const response = await api.put(`/products/${productId}`, productData);

  return response.data;
};

export const deleteProduct = async (productId) => {
  const response = await api.delete(`/products/${productId}`);

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

export const createProductImage = async (imageData) => {
  const response = await api.post("/product-images", imageData);

  return response.data;
};

export const getProductImages = async (productId) => {
  const response = await api.get(
    `/product-images/product/${productId}`,
  );

  return response.data;
};

export const deleteProductImage = async (imageId) => {
  const response = await api.delete(
    `/product-images/${imageId}`,
  );

  return response.data;
};

export const setProductImagePrimary = async (
  imageId,
  productId,
) => {
  const response = await api.put(
    `/product-images/${imageId}/primary`,
    {
      productId,
    },
  );

  return response.data;
};

export const getProductVariants = async (productId) => {
  const response = await api.get(
    `/product-variants/product/${productId}`,
  );

  return response.data;
};

export const createVariant = async (variantData) => {
  const response = await api.post(
    "/product-variants",
    variantData,
  );

  return response.data;
};

export const updateVariant = async (id, variantData) => {
  const response = await api.put(
    `/product-variants/${id}`,
    variantData,
  );

  return response.data;
};

export const deleteVariant = async (id) => {
  const response = await api.delete(
    `/product-variants/${id}`,
  );

  return response.data;
};

export const getVariant = async (variantId) => {
  const response = await api.get(
    `/product-variants/${variantId}`,
  );

  return response.data;
};