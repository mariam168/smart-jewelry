import express from "express";

import {
  createTechnologyController,
  getTechnologiesController,
  getTechnologyController,
  updateTechnologyController,
  deleteTechnologyController,
} from "../controllers/technologyController.js";

const router = express.Router();

router.get("/", getTechnologiesController);

router.get("/:id", getTechnologyController);

router.post("/", createTechnologyController);

router.put("/:id", updateTechnologyController);

router.delete("/:id", deleteTechnologyController);

export default router;
