import express from "express";

import {
  createImageController,
  getImagesController,
  deleteImageController,
  setPrimaryImageController,
} from "../controllers/productImageController.js";

const router = express.Router();

router.post("/", createImageController);

router.get("/product/:productId", getImagesController);

router.delete("/:id", deleteImageController);

router.put("/:id/primary", setPrimaryImageController);

export default router;
