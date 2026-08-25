import express from "express";

import {
  getShippingAreas,
  getAdminAreas,
  addShippingArea,
  editShippingArea,
  removeShippingArea,
} from "../controllers/shippingController.js";

import {
  protect,
} from "../../auth/middleware/authMiddleware.js";

import adminMiddleware from "../../admin/middleware/adminMiddleware.js";

const router =
  express.Router();

router.get(
  "/areas",
  getShippingAreas,
);

router.get(
  "/admin/areas",
  protect,
  adminMiddleware,
  getAdminAreas,
);

router.post(
  "/admin/areas",
  protect,
  adminMiddleware,
  addShippingArea,
);

router.patch(
  "/admin/areas/:id",
  protect,
  adminMiddleware,
  editShippingArea,
);

router.delete(
  "/admin/areas/:id",
  protect,
  adminMiddleware,
  removeShippingArea,
);

export default router;