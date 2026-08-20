import express from "express";

import {
  createOrderController,
  getMyOrders,
  getMyOrderById,
  getAdminOrders,
  getAdminOrderById,
  updateAdminOrderStatus,
} from "../controllers/orderController.js";

import { protect } from "../../auth/middleware/authMiddleware.js";

import adminMiddleware from "../../admin/middleware/adminMiddleware.js";

const router = express.Router();

router.post("/", protect, createOrderController);

router.get("/my-orders", protect, getMyOrders);

router.get("/my-orders/:id", protect, getMyOrderById);

router.get("/admin", protect, adminMiddleware, getAdminOrders);

router.get("/admin/:id", protect, adminMiddleware, getAdminOrderById);

router.patch(
  "/admin/:id/status",
  protect,
  adminMiddleware,
  updateAdminOrderStatus,
);

export default router;
