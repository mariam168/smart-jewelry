import express from "express";

import {
  createTechnologyModelController,
  getTechnologyModelsController,
  getTechnologyModelController,
  updateTechnologyModelController,
  deleteTechnologyModelController,
} from "../controllers/technologyModelController.js";

const router = express.Router();

router.get("/", getTechnologyModelsController);

router.get("/:id", getTechnologyModelController);

router.post("/", createTechnologyModelController);

router.put("/:id", updateTechnologyModelController);

router.delete("/:id", deleteTechnologyModelController);

export default router;
