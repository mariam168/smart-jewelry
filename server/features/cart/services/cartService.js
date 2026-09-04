import mongoose from "mongoose";

import Cart from "../models/Cart.js";

import Product from "../../catalog/models/Product.js";

import ProductVariant from "../../catalog/models/ProductVariant.js";

import ProductTechnology from "../../catalog/models/ProductTechnology.js";

import ProductImage from "../../catalog/models/ProductImage.js";

const createServiceError = (
  message,
  statusCode = 400,
) => {
  const error = new Error(message);

  error.statusCode = statusCode;

  return error;
};

const normalizeId = (value) => {
  if (!value) {
    return null;
  }

  return value.toString();
};

const populateCart = async (cart) => {
  if (!cart) {
    return null;
  }

  await cart.populate([
    {
      path: "items.product",
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

  const cartObject = cart.toObject();

  const productIds = cartObject.items
    .map((item) => item.product?._id)
    .filter(Boolean);

  if (productIds.length === 0) {
    return cartObject;
  }

  const productImages =
    await ProductImage.find({
      product: {
        $in: productIds,
      },
    })
      .sort({
        isPrimary: -1,
        sortOrder: 1,
        createdAt: 1,
      })
      .lean();

  const imagesByProduct = new Map();

  for (const image of productImages) {
    const productId =
      image.product?.toString();

    if (!productId) {
      continue;
    }

    const imageUrl =
      image.imageUrl ||
      image.url ||
      image.path ||
      image.image ||
      "";

    if (!imageUrl) {
      continue;
    }

    if (!imagesByProduct.has(productId)) {
      imagesByProduct.set(
        productId,
        [],
      );
    }

    imagesByProduct
      .get(productId)
      .push({
        ...image,
        imageUrl,
      });
  }

  cartObject.items =
    cartObject.items.map((item) => {
      if (!item.product?._id) {
        return item;
      }

      const productId =
        item.product._id.toString();

      const productImagesList =
        imagesByProduct.get(productId) || [];

      const primaryImageRecord =
        productImagesList.find(
          (image) =>
            image.isPrimary === true,
        ) ||
        productImagesList[0] ||
        null;

      const primaryImage =
        primaryImageRecord?.imageUrl || "";

      return {
        ...item,

        product: {
          ...item.product,

          primaryImage,

          image:
            item.product.image ||
            primaryImage,

          images:
            productImagesList.map(
              (image) => image.imageUrl,
            ),
        },
      };
    });

  return cartObject;
};

/*
 * GET CART
 */
export const getUserCart = async (
  userId,
) => {
  if (!userId) {
    throw createServiceError(
      "User ID is required",
      401,
    );
  }

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

/*
 * ADD PRODUCT
 */
export const addProductToCart = async (
  userId,
  productId,
  quantity = 1,
  variantId = null,
  productTechnologyId = null,
) => {
  if (!userId) {
    throw createServiceError(
      "User ID is required",
      401,
    );
  }

  if (!productId) {
    throw createServiceError(
      "Product ID is required",
      400,
    );
  }

  if (
    !Number.isInteger(quantity) ||
    quantity < 1
  ) {
    throw createServiceError(
      "Quantity must be at least 1",
      400,
    );
  }

  if (
    !mongoose.isValidObjectId(productId)
  ) {
    throw createServiceError(
      "Invalid product ID",
      400,
    );
  }

  const product =
    await Product.findById(productId);

  if (!product) {
    throw createServiceError(
      "Product not found",
      404,
    );
  }

  /*
   * VARIANT
   */
  if (variantId) {
    if (
      !mongoose.isValidObjectId(
        variantId,
      )
    ) {
      throw createServiceError(
        "Invalid product variant ID",
        400,
      );
    }

    const variant =
      await ProductVariant.findById(
        variantId,
      );

    if (!variant) {
      throw createServiceError(
        "Product variant not found",
        404,
      );
    }

    if (
      variant.product &&
      normalizeId(variant.product) !==
        normalizeId(productId)
    ) {
      throw createServiceError(
        "Selected variant does not belong to this product",
        400,
      );
    }
  }

  /*
   * TECHNOLOGY
   */
  if (productTechnologyId) {
    if (
      !mongoose.isValidObjectId(
        productTechnologyId,
      )
    ) {
      throw createServiceError(
        "Invalid product technology ID",
        400,
      );
    }

    const productTechnology =
      await ProductTechnology.findById(
        productTechnologyId,
      );

    if (!productTechnology) {
      throw createServiceError(
        "Product technology not found",
        404,
      );
    }

    if (
      productTechnology.product &&
      normalizeId(
        productTechnology.product,
      ) !== normalizeId(productId)
    ) {
      throw createServiceError(
        "Selected technology does not belong to this product",
        400,
      );
    }

    /*
     * Support both status and isActive models.
     */
    if (
      productTechnology.status &&
      productTechnology.status !==
        "active"
    ) {
      throw createServiceError(
        "Selected product technology is inactive",
        400,
      );
    }

    if (
      productTechnology.isActive ===
      false
    ) {
      throw createServiceError(
        "Selected product technology is inactive",
        400,
      );
    }

    if (
      productTechnology.isSelectable ===
      false
    ) {
      throw createServiceError(
        "Selected product technology is not selectable",
        400,
      );
    }
  }

  let cart = await Cart.findOne({
    user: userId,
  });

  if (!cart) {
    cart = await Cart.create({
      user: userId,
      items: [],
    });
  }

  const normalizedProductId =
    normalizeId(productId);

  const normalizedVariantId =
    normalizeId(variantId);

  const normalizedTechnologyId =
    normalizeId(
      productTechnologyId,
    );

  const existingItem =
    cart.items.find((item) => {
      return (
        normalizeId(item.product) ===
          normalizedProductId &&
        normalizeId(item.variant) ===
          normalizedVariantId &&
        normalizeId(
          item.productTechnology,
        ) === normalizedTechnologyId
      );
    });

  if (existingItem) {
    existingItem.quantity +=
      quantity;
  } else {
    cart.items.push({
      product: productId,

      variant:
        variantId || null,

      productTechnology:
        productTechnologyId || null,

      quantity,
    });
  }

  await cart.save();

  return populateCart(cart);
};

/*
 * UPDATE QUANTITY
 *
 * Atomic update.
 */
export const updateProductInCart =
  async (
    userId,
    itemId,
    quantity,
  ) => {
    if (!userId) {
      throw createServiceError(
        "User ID is required",
        401,
      );
    }

    if (
      !Number.isInteger(quantity) ||
      quantity < 1
    ) {
      throw createServiceError(
        "Quantity must be at least 1",
        400,
      );
    }

    if (
      !mongoose.isValidObjectId(itemId)
    ) {
      throw createServiceError(
        "Invalid cart item ID",
        400,
      );
    }

    const cart =
      await Cart.findOneAndUpdate(
        {
          user: userId,
          "items._id": itemId,
        },
        {
          $set: {
            "items.$.quantity":
              quantity,
          },
        },
        {
          new: true,
          runValidators: true,
        },
      );

    if (!cart) {
      throw createServiceError(
        "Cart item not found",
        404,
      );
    }

    return populateCart(cart);
  };

/*
 * REMOVE CART ITEM
 *
 * Atomic $pull fixes the removal issue.
 */
export const removeProductFromCart =
  async (
    userId,
    itemId,
  ) => {
    if (!userId) {
      throw createServiceError(
        "User ID is required",
        401,
      );
    }

    if (
      !mongoose.isValidObjectId(itemId)
    ) {
      throw createServiceError(
        "Invalid cart item ID",
        400,
      );
    }

    const cart =
      await Cart.findOneAndUpdate(
        {
          user: userId,
          "items._id": itemId,
        },
        {
          $pull: {
            items: {
              _id: itemId,
            },
          },
        },
        {
          new: true,
          runValidators: true,
        },
      );

    if (!cart) {
      const existingCart =
        await Cart.exists({
          user: userId,
        });

      if (!existingCart) {
        throw createServiceError(
          "Cart not found",
          404,
        );
      }

      throw createServiceError(
        "Cart item not found",
        404,
      );
    }

    return populateCart(cart);
  };

/*
 * CLEAR CART
 */
export const clearUserCart =
  async (userId) => {
    if (!userId) {
      throw createServiceError(
        "User ID is required",
        401,
      );
    }

    let cart =
      await Cart.findOneAndUpdate(
        {
          user: userId,
        },
        {
          $set: {
            items: [],
          },
        },
        {
          new: true,
          runValidators: true,
        },
      );

    if (!cart) {
      cart = await Cart.create({
        user: userId,
        items: [],
      });
    }

    return populateCart(cart);
  };