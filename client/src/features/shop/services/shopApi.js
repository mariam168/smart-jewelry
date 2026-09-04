import api from "../../../lib/axios";

export const getShopProducts = async () => {
  const response = await api.get("/products");

  return response.data.data;
};

export const getShopProduct = async (id) => {
  const response = await api.get(`/products/${id}`);

  return response.data.data;
};

export const getProductImages = async (productId) => {
  const response = await api.get(
    `/product-images/product/${productId}`,
  );

  return response.data.data.images;
};

export const getProductVariants = async (productId) => {
  const response = await api.get(
    `/product-variants/product/${productId}`,
  );

  return response.data.data.variants;
};

export const getProductTechnologies = async (productId) => {
  const response = await api.get(
    `/product-technologies/product/${productId}`,
  );

  return response.data.data.productTechnologies;
};