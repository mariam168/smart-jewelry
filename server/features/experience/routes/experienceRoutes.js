import express from "express";

import upload from "../middlewares/experienceUpload.js";

import {
  createExperienceController,
  getExperienceController,
  getPublicExperience,
  getCustomerExperience,
  getExperienceBySlugController,
  updatePersonalController,
  updateSlugController,
  updateAccessDateController,
  checkSlugController,
  uploadMediaController,
  unlockPublicExperienceController,
  getMediaLimitsController,
  updateMediaLimitsController,
  requestVideoUploadController,
  getAdminVideoUploadRequestsController,
  updateAdminVideoUploadRequestController,
} from "../controllers/experienceController.js";

import {
  protect,
} from "../../auth/middleware/authMiddleware.js";

import adminMiddleware from "../../admin/middleware/adminMiddleware.js";

const router =
  express.Router();

router.post(
  "/",
  createExperienceController,
);

router.get(
  "/media-limits",
  getMediaLimitsController,
);

router.put(
  "/admin/media-limits",
  protect,
  adminMiddleware,
  updateMediaLimitsController,
);

router.get(
  "/admin/video-requests",
  protect,
  adminMiddleware,
  getAdminVideoUploadRequestsController,
);

router.patch(
  "/admin/video-requests/:requestId",
  protect,
  adminMiddleware,
  updateAdminVideoUploadRequestController,
);

router.get(
  "/manage/:token",
  getExperienceController,
);

router.put(
  "/manage/:token/personal",
  updatePersonalController,
);

/*
 * The customer Manage Experience page
 * no longer exposes custom-link editing.
 *
 * This endpoint is retained for
 * the admin/manufacturing workflow.
 */
router.put(
  "/manage/:token/slug",
  protect,
  adminMiddleware,
  updateSlugController,
);

router.put(
  "/manage/:token/access-date",
  updateAccessDateController,
);

router.post(
  "/manage/:token/video-request",
  requestVideoUploadController,
);

router.post(
  "/manage/:token/media",
  upload.array(
    "files",
    20,
  ),
  uploadMediaController,
);

router.get(
  "/check-slug/:slug",
  checkSlugController,
);

router.get(
  "/public/:serialNumber/:slug",
  getPublicExperience,
);

router.post(
  "/public/:serialNumber/:slug/unlock",
  unlockPublicExperienceController,
);

router.get(
  "/customer/:serialNumber/:slug",
  getCustomerExperience,
);

router.get(
  "/:serialNumber/:slug",
  getExperienceBySlugController,
);

export default router;