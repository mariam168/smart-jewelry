import axios from "axios";

const API_URL =
  "http://localhost:5000/api/products";

// ==========================================
// Get All Products
// ==========================================

export const getShopProducts =
  async () => {

    const response =
      await axios.get(API_URL);

    return response.data.data;

  };

// ==========================================
// Get Product
// ==========================================

export const getShopProduct =
  async (id) => {

    const response =
      await axios.get(
        `${API_URL}/${id}`
      );

    return response.data.data;

  };

// ==========================================
// Product Images
// ==========================================

export const getProductImages =
  async (productId) => {

    const response =
      await axios.get(
        `http://localhost:5000/api/product-images/product/${productId}`
      );

    return response.data.data.images;

  };

// ==========================================
// Product Variants
// ==========================================

export const getProductVariants =
  async (productId) => {

    const response =
      await axios.get(
        `http://localhost:5000/api/product-variants/product/${productId}`
      );

    return response.data.data.variants;

  };