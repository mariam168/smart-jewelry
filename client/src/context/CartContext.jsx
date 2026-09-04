import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getCart,
  addToCart as addToCartApi,
  updateCartItem as updateCartApi,
  removeCartItem as removeFromCartApi,
  clearCart as clearCartApi,
} from "../features/cart/services/cartApi";

export const CartContext =
  createContext(null);

const EMPTY_CART = {
  items: [],
};

const CartProvider = ({
  children,
}) => {
  const [cart, setCart] =
    useState(EMPTY_CART);

  const [
    isCartOpen,
    setIsCartOpen,
  ] = useState(false);

  const [
    isLoading,
    setIsLoading,
  ] = useState(false);

  const getCartFromResponse = (
    response,
  ) => {
    const nextCart =
      response?.data;

    if (
      nextCart &&
      Array.isArray(
        nextCart.items,
      )
    ) {
      return nextCart;
    }

    return EMPTY_CART;
  };

  /*
   * LOAD CART
   */
  const loadCart = async () => {
    try {
      setIsLoading(true);

      const response =
        await getCart();

      setCart(
        getCartFromResponse(
          response,
        ),
      );

      return response;
    } catch (error) {
      console.error(
        "Load Cart Error:",
        error,
      );

      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCart().catch(() => {
      /*
       * A 401 can happen before login.
       * Do not crash the provider.
       */
    });
  }, []);

  /*
   * ADD
   */
  const addToCart = async (
    productId,
    quantity = 1,
    variantId = null,
    productTechnologyId = null,
  ) => {
    try {
      setIsLoading(true);

      const response =
        await addToCartApi(
          productId,
          variantId,
          productTechnologyId,
          quantity,
        );

      setCart(
        getCartFromResponse(
          response,
        ),
      );

      setIsCartOpen(true);

      return response;
    } catch (error) {
      console.error(
        "Add To Cart Error:",
        error,
      );

      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /*
   * UPDATE QUANTITY
   */
  const updateQuantity = async (
    itemId,
    quantity,
  ) => {
    if (
      !itemId ||
      quantity < 1
    ) {
      return;
    }

    try {
      setIsLoading(true);

      const response =
        await updateCartApi(
          itemId,
          quantity,
        );

      setCart(
        getCartFromResponse(
          response,
        ),
      );

      return response;
    } catch (error) {
      console.error(
        "Update Cart Error:",
        error,
      );

      /*
       * Ensure frontend is synced
       * even if mutation response fails.
       */
      try {
        await loadCart();
      } catch {
        // keep original error
      }

      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /*
   * REMOVE ITEM
   */
  const removeFromCart = async (
    itemId,
  ) => {
    if (!itemId) {
      return;
    }

    try {
      setIsLoading(true);

      const response =
        await removeFromCartApi(
          itemId,
        );

      const nextCart =
        getCartFromResponse(
          response,
        );

      setCart(nextCart);

      return response;
    } catch (error) {
      console.error(
        "Remove Cart Item Error:",
        error,
      );

      /*
       * Reload server cart if mutation
       * failed so UI never stays stale.
       */
      try {
        const response =
          await getCart();

        setCart(
          getCartFromResponse(
            response,
          ),
        );
      } catch {
        // ignore secondary error
      }

      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /*
   * CLEAR CART
   */
  const clearCart = async () => {
    try {
      setIsLoading(true);

      const response =
        await clearCartApi();

      const nextCart =
        getCartFromResponse(
          response,
        );

      setCart(nextCart);

      return response;
    } catch (error) {
      console.error(
        "Clear Cart Error:",
        error,
      );

      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /*
   * IMPORTANT:
   *
   * Call this ONLY after the order
   * has been created successfully.
   */
  const clearCartAfterOrder =
    async () => {
      try {
        setIsLoading(true);

        const response =
          await clearCartApi();

        setCart(
          getCartFromResponse(
            response,
          ),
        );

        setIsCartOpen(false);

        return response;
      } catch (error) {
        console.error(
          "Clear Cart After Order Error:",
          error,
        );

        /*
         * Do not silently pretend that
         * the server cart was cleared.
         */
        throw error;
      } finally {
        setIsLoading(false);
      }
    };

  const openCart = () => {
    setIsCartOpen(true);
  };

  const closeCart = () => {
    setIsCartOpen(false);
  };

  const cartItems =
    cart?.items || [];

  const cartCount = useMemo(() => {
    return cartItems.reduce(
      (total, item) => {
        return (
          total +
          Number(
            item?.quantity || 0,
          )
        );
      },
      0,
    );
  }, [cartItems]);

  const cartTotal = useMemo(() => {
    return cartItems.reduce(
      (total, item) => {
        const productPrice =
          Number(
            item?.product?.price ||
              0,
          );

        const variantPrice =
          Number(
            item?.variant?.price ||
              0,
          );

        const basePrice =
          variantPrice > 0
            ? variantPrice
            : productPrice;

        const technologyPrice =
          Number(
            item
              ?.productTechnology
              ?.extraPrice ??
              item
                ?.technologyModel
                ?.extraPrice ??
              0,
          );

        const finalUnitPrice =
          basePrice +
          technologyPrice;

        const quantity =
          Number(
            item?.quantity || 0,
          );

        return (
          total +
          finalUnitPrice *
            quantity
        );
      },
      0,
    );
  }, [cartItems]);

  const value = {
    cart,

    cartItems,
    cartCount,
    cartTotal,

    isCartOpen,
    isLoading,

    addToCart,
    updateQuantity,
    removeFromCart,

    clearCart,

    /*
     * Use after successful order.
     */
    clearCartAfterOrder,

    openCart,
    closeCart,

    loadCart,
  };

  return (
    <CartContext.Provider
      value={value}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context =
    useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider",
    );
  }

  return context;
};

export default CartProvider;