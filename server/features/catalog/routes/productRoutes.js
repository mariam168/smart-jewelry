import express from "express";

import {
  createProductController,
  getProductsController,
  getProductController,
  updateProductController,
  deleteProductController,
   getNewArrivalProductsController,
} from "../controllers/productController.js";

const router = express.Router();

router.get("/", getProductsController);
router.get("/new-arrivals", getNewArrivalProductsController);
router.get("/:id", getProductController);

router.post("/", createProductController);

router.put("/:id", updateProductController);

router.delete("/:id", deleteProductController);

export default router;
