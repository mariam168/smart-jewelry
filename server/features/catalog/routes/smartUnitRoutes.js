import express from "express";

import {
  createSmartUnitController,
  getSmartUnitsController,
  getSmartUnitController,
  updateSmartUnitController,
  deleteSmartUnitController,
} from "../controllers/smartUnitController.js";

import { getSmartUnitInstancesController } from "../controllers/smartUnitInstanceController.js";

const router = express.Router();

router.post("/", createSmartUnitController);

router.get("/", getSmartUnitsController);

router.get("/:smartUnitId/instances", getSmartUnitInstancesController);

router.get("/:id", getSmartUnitController);

router.put("/:id", updateSmartUnitController);

router.delete("/:id", deleteSmartUnitController);

export default router;
