import express from "express";

import {
  register,
  verifyEmailController,
  login,
  getMe,
  logout,
  getAdminUsersController,
  updateUserRoleController,
} from "../controllers/authController.js";

import {
  protect,
} from "../middleware/authMiddleware.js";

import adminMiddleware from "../../admin/middleware/adminMiddleware.js";

const router =
  express.Router();

router.post(
  "/register",
  register,
);

router.get(
  "/verify-email",
  verifyEmailController,
);

router.post(
  "/login",
  login,
);

router.get(
  "/me",
  protect,
  getMe,
);

router.post(
  "/logout",
  protect,
  logout,
);

/*
|--------------------------------------------------------------------------
| ADMIN USERS
|--------------------------------------------------------------------------
*/

router.get(
  "/admin/users",
  protect,
  adminMiddleware,
  getAdminUsersController,
);

router.patch(
  "/admin/users/:userId/role",
  protect,
  adminMiddleware,
  updateUserRoleController,
);

export default router;