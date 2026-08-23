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
} from "../controllers/experienceController.js";

const router = express.Router();

router.post(
  "/",
  createExperienceController,
);

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
  updateSlugController,
);

router.put(
  "/manage/:token/access-date",
  updateAccessDateController,
);

router.post(
  "/manage/:token/media",
  upload.array("files", 20),
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