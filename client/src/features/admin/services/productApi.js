import axios from "axios";

const API_URL = "http://localhost:5000/api/products";

export const createProduct = async (productData) => {
  const response = await axios.post(API_URL, productData, {
    withCredentials: true,
  });

  return response.data;
};

export const getProducts = async () => {
  const response = await axios.get(API_URL, {
    withCredentials: true,
  });

  return response.data;
};

export const getProduct = async (productId) => {
  const response = await axios.get(`${API_URL}/${productId}`, {
    withCredentials: true,
  });

  return response.data;
};
export const updateProduct = async (productId, productData) => {
  const response = await axios.put(`${API_URL}/${productId}`, productData, {
    withCredentials: true,
  });

  return response.data;
};

export const deleteProduct = async (productId) => {
  const response = await axios.delete(`${API_URL}/${productId}`, {
    withCredentials: true,
  });

  return response.data;
};

export const uploadImage = async (formData) => {
  const response = await axios.post(
    "http://localhost:5000/api/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      withCredentials: true,
    },
  );

  return response.data;
};
export const createProductImage = async (imageData) => {
  const response = await axios.post(
    "http://localhost:5000/api/product-images",
    imageData,
    {
      withCredentials: true,
    },
  );

  return response.data;
};

export const getProductImages = async (productId) => {
  const response = await axios.get(
    `http://localhost:5000/api/product-images/product/${productId}`,
    {
      withCredentials: true,
    },
  );

  return response.data;
};

export const deleteProductImage = async (imageId) => {
  const response = await axios.delete(
    `http://localhost:5000/api/product-images/${imageId}`,
    {
      withCredentials: true,
    },
  );

  return response.data;
};

export const setProductImagePrimary = async (imageId, productId) => {
  const response = await axios.put(
    `http://localhost:5000/api/product-images/${imageId}/primary`,
    {
      productId,
    },
    {
      withCredentials: true,
    },
  );

  return response.data;
};

export const getProductVariants = async (productId) => {
  const response = await axios.get(
    `http://localhost:5000/api/product-variants/product/${productId}`,

    {
      withCredentials: true,
    },
  );

  return response.data;
};
export const createVariant = async (variantData) => {
  const response = await axios.post(
    "http://localhost:5000/api/product-variants",

    variantData,

    {
      withCredentials: true,
    },
  );

  return response.data;
};

export const updateVariant = async (id, variantData) => {
  const response = await axios.put(
    `http://localhost:5000/api/product-variants/${id}`,

    variantData,

    {
      withCredentials: true,
    },
  );

  return response.data;
};

export const deleteVariant = async (id) => {
  const response = await axios.delete(
    `http://localhost:5000/api/product-variants/${id}`,

    {
      withCredentials: true,
    },
  );

  return response.data;
};

export const getVariant = async (variantId) => {
  const response = await axios.get(
    `http://localhost:5000/api/product-variants/${variantId}`,
    {
      withCredentials: true,
    },
  );

  return response.data;
};
