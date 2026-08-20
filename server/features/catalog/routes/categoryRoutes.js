import express from "express";

import {
  createCategoryController,
  getCategoriesController,
  getCategoryController,
  updateCategoryController,
  deleteCategoryController,
} from "../controllers/categoryController.js";

const router = express.Router();

router.get("/", getCategoriesController);

router.get("/:id", getCategoryController);

router.post("/", createCategoryController);

router.put("/:id", updateCategoryController);

router.delete("/:id", deleteCategoryController);

export default router;
