import express from "express";

import { dashboardController } from "../controllers/dashboardController.js";

import { protect } from "../../auth/middleware/authMiddleware.js";

import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

router.get("/stats", protect, adminMiddleware, dashboardController);

export default router;
