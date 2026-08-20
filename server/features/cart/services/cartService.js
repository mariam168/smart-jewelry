import Cart from "../models/Cart.js";

import Product from "../../catalog/models/Product.js";

import ProductVariant from "../../catalog/models/ProductVariant.js";

import ProductTechnology from "../../catalog/models/ProductTechnology.js";

const populateCart = async (cart) => {
  return cart.populate([
    {
      path: "items.product",
      select: "name price images description",
    },

    {
      path: "items.variant",
    },

    {
      path: "items.productTechnology",

      populate: {
        path: "technologyModel",

        populate: {
          path: "technology",
        },
      },
    },
  ]);
};

export const getUserCart = async (userId) => {
  let cart = await Cart.findOne({
    user: userId,
  });

  if (!cart) {
    cart = await Cart.create({
      user: userId,
      items: [],
    });
  }

  return populateCart(cart);
};

export const addProductToCart = async (
  userId,
  productId,
  quantity = 1,
  variantId = null,
  productTechnologyId = null,
) => {
  if (!userId) {
    const error = new Error("User ID is required");

    error.statusCode = 401;

    throw error;
  }

  if (!productId) {
    const error = new Error("Product ID is required");

    error.statusCode = 400;

    throw error;
  }

  if (!Number.isInteger(quantity) || quantity < 1) {
    const error = new Error("Quantity must be at least 1");

    error.statusCode = 400;

    throw error;
  }

  const product = await Product.findById(productId);

  if (!product) {
    const error = new Error("Product not found");

    error.statusCode = 404;

    throw error;
  }

  let variant = null;

  if (variantId) {
    variant = await ProductVariant.findById(variantId);

    if (!variant) {
      const error = new Error("Product variant not found");

      error.statusCode = 404;

      throw error;
    }

    if (
      variant.product &&
      variant.product.toString() !== productId.toString()
    ) {
      const error = new Error(
        "Selected variant does not belong to this product",
      );

      error.statusCode = 400;

      throw error;
    }
  }

  let productTechnology = null;

  if (productTechnologyId) {
    productTechnology = await ProductTechnology.findById(productTechnologyId);

    if (!productTechnology) {
      const error = new Error("Product technology not found");

      error.statusCode = 404;

      throw error;
    }

    if (
      productTechnology.product &&
      productTechnology.product.toString() !== productId.toString()
    ) {
      const error = new Error(
        "Selected technology does not belong to this product",
      );

      error.statusCode = 400;

      throw error;
    }

    if (productTechnology.status !== "active") {
      const error = new Error("Selected product technology is inactive");

      error.statusCode = 400;

      throw error;
    }

    if (productTechnology.isSelectable === false) {
      const error = new Error("Selected product technology is not selectable");

      error.statusCode = 400;

      throw error;
    }
  }

  let cart = await Cart.findOne({
    user: userId,
  });

  if (!cart) {
    cart = await Cart.create({
      user: userId,

      items: [
        {
          product: productId,

          variant: variantId,

          productTechnology: productTechnologyId,

          quantity,
        },
      ],
    });

    return populateCart(cart);
  }

  const existingItem = cart.items.find((item) => {
    const sameProduct = item.product.toString() === productId.toString();

    const sameVariant =
      item.variant?.toString() === (variantId ? variantId.toString() : null);

    const sameProductTechnology =
      item.productTechnology?.toString() ===
      (productTechnologyId ? productTechnologyId.toString() : null);

    return sameProduct && sameVariant && sameProductTechnology;
  });

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.items.push({
      product: productId,

      variant: variantId,

      productTechnology: productTechnologyId,

      quantity,
    });
  }

  await cart.save();

  return populateCart(cart);
};

export const updateProductInCart = async (userId, itemId, quantity) => {
  if (!userId) {
    const error = new Error("User ID is required");

    error.statusCode = 401;

    throw error;
  }

  if (!Number.isInteger(quantity) || quantity < 1) {
    const error = new Error("Quantity must be at least 1");

    error.statusCode = 400;

    throw error;
  }

  const cart = await Cart.findOne({
    user: userId,
  });

  if (!cart) {
    const error = new Error("Cart not found");

    error.statusCode = 404;

    throw error;
  }

  const item = cart.items.id(itemId);

  if (!item) {
    const error = new Error("Cart item not found");

    error.statusCode = 404;

    throw error;
  }

  item.quantity = quantity;

  await cart.save();

  return populateCart(cart);
};

export const removeProductFromCart = async (userId, itemId) => {
  if (!userId) {
    const error = new Error("User ID is required");

    error.statusCode = 401;

    throw error;
  }

  const cart = await Cart.findOne({
    user: userId,
  });

  if (!cart) {
    const error = new Error("Cart not found");

    error.statusCode = 404;

    throw error;
  }

  const item = cart.items.id(itemId);

  if (!item) {
    const error = new Error("Cart item not found");

    error.statusCode = 404;

    throw error;
  }

  cart.items.pull(itemId);

  await cart.save();

  return populateCart(cart);
};

export const clearUserCart = async (userId) => {
  if (!userId) {
    const error = new Error("User ID is required");

    error.statusCode = 401;

    throw error;
  }

  const cart = await Cart.findOne({
    user: userId,
  });

  if (!cart) {
    return {
      user: userId,
      items: [],
    };
  }

  cart.items = [];

  await cart.save();

  return populateCart(cart);
};
