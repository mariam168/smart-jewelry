import express from "express";

import { protect } from "../../auth/middleware/authMiddleware.js";

import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../controllers/cartController.js";

const router = express.Router();

router.get(
  "/",
  protect,
  getCart,
);

router.post(
  "/items",
  protect,
  addToCart,
);

router.patch(
  "/items/:itemId",
  protect,
  updateCartItem,
);

router.delete(
  "/items/:itemId",
  protect,
  removeCartItem,
);

router.delete(
  "/",
  protect,
  clearCart,
);

export default router;