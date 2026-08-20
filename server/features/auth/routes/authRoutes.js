import express from "express";

import {
  register,
  verifyEmailController,
  login,
  getMe,
  logout,
} from "../controllers/authController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);

router.get("/verify-email", verifyEmailController);

router.post("/login", login);

router.get("/me", protect, getMe);

router.post("/logout", protect, logout);

export default router;
