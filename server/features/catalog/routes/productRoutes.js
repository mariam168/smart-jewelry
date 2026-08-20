import express from "express";

import {
  createProductController,
  getProductsController,
  getProductController,
  updateProductController,
  deleteProductController,
} from "../controllers/productController.js";

const router = express.Router();

router.get("/", getProductsController);

router.get("/:id", getProductController);

router.post("/", createProductController);

router.put("/:id", updateProductController);

router.delete("/:id", deleteProductController);

export default router;
