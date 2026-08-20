import express from "express";

import {
  createVariantController,
  getProductVariantsController,
  getVariantController,
  updateVariantController,
  deleteVariantController,
} from "../controllers/productVariantController.js";

const router = express.Router();

router.get("/product/:productId", getProductVariantsController);

router.get("/:id", getVariantController);

router.post("/", createVariantController);

router.put("/:id", updateVariantController);

router.delete("/:id", deleteVariantController);

export default router;
