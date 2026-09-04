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
} from "../controllers/experienceController.js";

import {
  protect,
} from "../../auth/middleware/authMiddleware.js";

import adminMiddleware from "../../admin/middleware/adminMiddleware.js";

const router = express.Router();

router.post(
  "/",
  createExperienceController,
);

router.get(
  "/media-limits",
  getMediaLimitsController,
);

/*
 * Admin-only media settings.
 */
router.put(
  "/admin/media-limits",
  protect,
  adminMiddleware,
  updateMediaLimitsController,
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
 * IMPORTANT:
 * The public URL slug can now only be changed by an admin.
 *
 * The route still uses the Experience manage token to identify
 * the Experience, but protect + adminMiddleware prevent customers
 * or anyone holding only the token from changing the slug.
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