import api from "../../../lib/axios";

export const getCart = async () => {
  const response =
    await api.get("/cart");

  return response.data;
};

export const addToCart = async (
  productId,
  variantId = null,
  productTechnologyId = null,
  quantity = 1,
) => {
  const response =
    await api.post(
      "/cart/items",
      {
        productId,
        variantId,
        productTechnologyId,
        quantity,
      },
    );

  return response.data;
};

export const updateCartItem =
  async (
    itemId,
    quantity,
  ) => {
    if (!itemId) {
      throw new Error(
        "Cart item ID is required",
      );
    }

    const response =
      await api.patch(
        `/cart/items/${itemId}`,
        {
          quantity,
        },
      );

    return response.data;
  };

export const removeCartItem =
  async (itemId) => {
    if (!itemId) {
      throw new Error(
        "Cart item ID is required",
      );
    }

    const response =
      await api.delete(
        `/cart/items/${itemId}`,
      );

    return response.data;
  };

export const clearCart =
  async () => {
    const response =
      await api.delete("/cart");

    return response.data;
  };