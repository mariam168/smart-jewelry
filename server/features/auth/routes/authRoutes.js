import express from "express";

import {
  register,
  verifyEmailController,
  login,
  getMe,
  logout,
  getAdminUsersController,
   verifyWhatsappOtpController,
  resendWhatsappOtpController,
  updateUserRoleController,
  deleteUserController,
  requestPasswordResetController,
verifyPasswordResetOtpController,
resetPasswordController,
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
router.delete(
  "/admin/users/:userId",
  protect,
  adminMiddleware,
  deleteUserController,
);
router.post(
  "/verify-otp",
  verifyWhatsappOtpController,
);

router.post(
  "/resend-otp",
  resendWhatsappOtpController,
);

router.post(
  "/forgot-password",
  requestPasswordResetController,
);

router.post(
  "/forgot-password/verify-otp",
  verifyPasswordResetOtpController,
);

router.post(
  "/reset-password",
  resetPasswordController,
);

export default router;