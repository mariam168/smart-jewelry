import { createContext, useContext, useEffect, useState } from "react";

import {
  getCart,
  addToCart as addToCartApi,
  updateCartItem as updateCartApi,
  removeCartItem as removeFromCartApi,
  clearCart as clearCartApi,
} from "../features/cart/services/cartApi";

export const CartContext = createContext(null);

// ==========================================
// Provider
// ==========================================

const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({
    items: [],
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  // ==========================================
  // Load Cart
  // ==========================================

  const loadCart = async () => {
    try {
      setIsLoading(true);

      const response = await getCart();

      setCart(
        response?.data || {
          items: [],
        },
      );
    } catch (error) {
      console.error("Load Cart Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // Load Cart On Start
  // ==========================================

  useEffect(() => {
    loadCart();
  }, []);

  // ==========================================
  // Add To Cart
  // ==========================================

  const addToCart = async (
    productId,
    quantity = 1,
    variantId = null,
    productTechnologyId = null,
  ) => {
    try {
      setIsLoading(true);

      const response = await addToCartApi(
        productId,
        variantId,
        productTechnologyId,
        quantity,
      );

      setCart(
        response?.data || {
          items: [],
        },
      );

      setIsCartOpen(true);

      return response;
    } catch (error) {
      console.error("Add To Cart Error:", error);

      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // Update Quantity
  // ==========================================

  const updateQuantity = async (itemId, quantity) => {
    if (quantity < 1) {
      return;
    }

    try {
      setIsLoading(true);

      const response = await updateCartApi(itemId, quantity);

      setCart(
        response?.data || {
          items: [],
        },
      );
    } catch (error) {
      console.error("Update Cart Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // Remove Item
  // ==========================================

  const removeFromCart = async (itemId) => {
    try {
      setIsLoading(true);

      const response = await removeFromCartApi(itemId);

      setCart(
        response?.data || {
          items: [],
        },
      );
    } catch (error) {
      console.error("Remove Cart Item Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // Clear Cart
  // ==========================================

  const clearCart = async () => {
    try {
      setIsLoading(true);

      await clearCartApi();

      setCart({
        items: [],
      });
    } catch (error) {
      console.error("Clear Cart Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // Open Cart
  // ==========================================

  const openCart = () => {
    setIsCartOpen(true);
  };

  // ==========================================
  // Close Cart
  // ==========================================

  const closeCart = () => {
    setIsCartOpen(false);
  };

  // ==========================================
  // Cart Items
  // ==========================================

  const cartItems = cart?.items || [];

  // ==========================================
  // Cart Count
  // ==========================================

  const cartCount = cartItems.reduce((total, item) => {
    return total + Number(item.quantity || 0);
  }, 0);

  // ==========================================
  // Cart Total
  // ==========================================

  const cartTotal = cartItems.reduce((total, item) => {
    // ========================================
    // PRODUCT PRICE
    // ========================================

    const productPrice = Number(item.product?.price || 0);

    // ========================================
    // VARIANT PRICE
    // ========================================

    const variantPrice = Number(item.variant?.price || 0);

    // ========================================
    // BASE PRICE
    // ========================================

    const basePrice = variantPrice > 0 ? variantPrice : productPrice;

    // ========================================
    // TECHNOLOGY EXTRA PRICE
    // ========================================
    //
    // ProductTechnology contains extraPrice.
    //
    // Depending on the backend populate,
    // the value can exist in different places.
    //
    // ========================================

    const technologyPrice = Number(
      item.technologyModel?.extraPrice ??
        item.productTechnology?.extraPrice ??
        item.productTechnologyId?.extraPrice ??
        item.technology?.extraPrice ??
        0,
    );

    // ========================================
    // FINAL UNIT PRICE
    // ========================================

    const finalUnitPrice = basePrice + technologyPrice;

    // ========================================
    // QUANTITY
    // ========================================

    const quantity = Number(item.quantity || 0);

    // ========================================
    // ITEM TOTAL
    // ========================================

    const itemTotal = finalUnitPrice * quantity;

    return total + itemTotal;
  }, 0);

  // ==========================================
  // Context Value
  // ==========================================

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

    openCart,

    closeCart,

    loadCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// ==========================================
// useCart Hook
// ==========================================

export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
};

export default CartProvider;
