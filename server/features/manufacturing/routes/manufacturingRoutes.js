import express from "express";

import {
  createManufacturingOrderController,
  getAllManufacturingOrdersController,
  getManufacturingOrderByIdController,
  startManufacturingController,
  assignSmartUnitController,
  createExperienceController,
  startProductionUnitController,
  completeProductionUnitController,
  cancelManufacturingOrderController,
} from "../controllers/manufacturingController.js";

import { protect } from "../../auth/middleware/authMiddleware.js";

import adminMiddleware from "../../admin/middleware/adminMiddleware.js";

const router = express.Router();

router.use(protect, adminMiddleware);

router.post("/from-order/:orderId", createManufacturingOrderController);

router.get("/", getAllManufacturingOrdersController);

router.get("/:id", getManufacturingOrderByIdController);

router.patch("/:id/start", startManufacturingController);

router.patch("/:id/units/:unitId/smart-unit", assignSmartUnitController);

router.post("/:id/units/:unitId/experience", createExperienceController);

router.patch("/:id/units/:unitId/start", startProductionUnitController);

router.patch("/:id/units/:unitId/complete", completeProductionUnitController);

router.patch("/:id/cancel", cancelManufacturingOrderController);

export default router;
