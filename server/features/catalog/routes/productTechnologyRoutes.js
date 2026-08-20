import express from "express";

import {
  createProductTechnologyController,
  getProductTechnologiesController,
  getProductTechnologyController,
  updateProductTechnologyController,
  deleteProductTechnologyController,
} from "../controllers/productTechnologyController.js";

const router = express.Router();

router.get("/product/:productId", getProductTechnologiesController);

router.get("/:id", getProductTechnologyController);

router.post("/", createProductTechnologyController);

router.put("/:id", updateProductTechnologyController);

router.delete("/:id", deleteProductTechnologyController);

export default router;
