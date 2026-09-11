
import express from "express";

import {
  getHome,
  getAdminHero,
  updateAdminHero,
} from "../controllers/homeController.js";

import { protect } from "../../auth/middleware/authMiddleware.js";

import superAdminMiddleware from "../../admin/middleware/adminMiddleware.js";

const router = express.Router();

router.get(
  "/",
  getHome,
);

router.get(
  "/hero",
  protect,
  superAdminMiddleware,
  getAdminHero,
);

router.put(
  "/hero",
  protect,
  superAdminMiddleware,
  updateAdminHero,
);

export default router;
