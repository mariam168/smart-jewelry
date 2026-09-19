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

  requestMediaUploadController,
  getAdminMediaUploadRequestsController,
  updateAdminMediaUploadRequestController,
  deleteAdminMediaUploadRequestController,

  requestVideoUploadController,
  getAdminVideoUploadRequestsController,
  updateAdminVideoUploadRequestController,
  deleteAdminVideoUploadRequestController,

  updateMediaNoteController,
  deleteMediaController,
  replaceMediaController,
} from "../controllers/experienceController.js";

import {
  protect,
} from "../../auth/middleware/authMiddleware.js";

import adminMiddleware from "../../admin/middleware/adminMiddleware.js";

const router = express.Router();

/* =========================================================
   EXPERIENCE
========================================================= */

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

/* =========================================================
   ADMIN - GENERIC MEDIA REQUESTS
========================================================= */

router.get(
  "/admin/media-requests",
  protect,
  adminMiddleware,
  getAdminMediaUploadRequestsController,
);

router.patch(
  "/admin/media-requests/:requestId",
  protect,
  adminMiddleware,
  updateAdminMediaUploadRequestController,
);

router.delete(
  "/admin/media-requests/:requestId",
  protect,
  adminMiddleware,
  deleteAdminMediaUploadRequestController,
);

/* =========================================================
   ADMIN - OLD VIDEO REQUEST ROUTES
   Kept for backward compatibility.
========================================================= */

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

router.delete(
  "/admin/video-requests/:requestId",
  protect,
  adminMiddleware,
  deleteAdminVideoUploadRequestController,
);

/* =========================================================
   MANAGE EXPERIENCE
========================================================= */

router.get(
  "/manage/:token",
  getExperienceController,
);

router.put(
  "/manage/:token/personal",
  updatePersonalController,
);

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

/* =========================================================
   CUSTOMER MEDIA REQUESTS
========================================================= */

router.post(
  "/manage/:token/media-request",
  requestMediaUploadController,
);

/*
 * Old video endpoint.
 */
router.post(
  "/manage/:token/video-request",
  requestVideoUploadController,
);

/* =========================================================
   MEDIA
========================================================= */

router.post(
  "/manage/:token/media",
  upload.array(
    "files",
    20,
  ),
  uploadMediaController,
);

router.put(
  "/manage/:token/media/:mediaId/note",
  updateMediaNoteController,
);

router.delete(
  "/manage/:token/media/:mediaId",
  deleteMediaController,
);

router.put(
  "/manage/:token/media/:mediaId",
  upload.single("file"),
  replaceMediaController,
);

/* =========================================================
   SLUG / PUBLIC
========================================================= */

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