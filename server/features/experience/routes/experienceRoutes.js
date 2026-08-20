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
  checkSlugController,
  uploadMediaController,
} from "../controllers/experienceController.js";

const router = express.Router();

router.post("/", createExperienceController);

router.get("/manage/:token", getExperienceController);

router.get("/public/:serialNumber/:slug", getPublicExperience);

router.get("/customer/:serialNumber/:slug", getCustomerExperience);

router.put("/manage/:token/personal", updatePersonalController);

router.put("/manage/:token/slug", updateSlugController);

router.get("/check-slug/:slug", checkSlugController);

router.post(
  "/manage/:token/media",
  upload.array("files", 20),
  uploadMediaController,
);
router.get("/:serialNumber/:slug", getExperienceBySlugController);
export default router;
