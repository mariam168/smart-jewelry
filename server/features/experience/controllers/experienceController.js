import {
  createExperience,
  getExperienceByManageToken,
  getExperienceByPublicToken,
  getExperienceBySlug,
  getExperienceBySerialAndSlug,
  updatePersonalExperience,
  updateExperienceSlug,
  checkSlugAvailability,
  uploadExperienceMedia,
} from "../services/experienceService.js";
import Experience from "../models/Experience.js";

export const createExperienceController = async (req, res, next) => {
  try {
    const experience = await createExperience(req.body);

    res.status(201).json({
      success: true,
      data: experience,
    });
  } catch (error) {
    next(error);
  }
};

export const getExperienceController = async (req, res, next) => {
  try {
    const data = await getExperienceByManageToken(req.params.token);

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getPublicExperience = async (req, res) => {
  try {
    const { serialNumber, slug } = req.params;

    const normalizedSerial = String(serialNumber || "")
      .trim()
      .toUpperCase();

    const normalizedSlug = String(slug || "")
      .trim()
      .toLowerCase();

    console.log("=================================");
    console.log("PUBLIC EXPERIENCE REQUEST");
    console.log("Original Serial:", serialNumber);
    console.log("Normalized Serial:", normalizedSerial);
    console.log("Original Slug:", slug);
    console.log("Normalized Slug:", normalizedSlug);
    console.log("=================================");

    const experience = await Experience.findOne({
      serialNumber: normalizedSerial,
      slug: normalizedSlug,
    })
      .populate("product")
      .populate("smartUnit");

    console.log("FOUND EXPERIENCE:", experience);

    if (!experience) {
      console.log("NO EXPERIENCE FOUND FOR:", {
        serialNumber: normalizedSerial,
        slug: normalizedSlug,
      });

      return res.status(404).json({
        message: "This experience does not exist or is no longer available.",
      });
    }

    if (experience.status && experience.status === "disabled") {
      console.log("EXPERIENCE IS DISABLED");

      return res.status(404).json({
        message: "This experience does not exist or is no longer available.",
      });
    }

    console.log("EXPERIENCE TYPE:", experience.type);

    console.log("EXPERIENCE STATUS:", experience.status);

    console.log("EXPERIENCE SERIAL:", experience.serialNumber);

    console.log("EXPERIENCE SLUG:", experience.slug);

    return res.status(200).json({
      success: true,
      experience,
    });
  } catch (error) {
    console.error("GET PUBLIC EXPERIENCE ERROR:", error);

    return res.status(500).json({
      message: "Unable to load public experience.",
    });
  }
};

export const getCustomerExperience = async (req, res) => {
  try {
    const { serialNumber, slug } = req.params;

    const normalizedSerial = serialNumber.trim().toUpperCase();

    const normalizedSlug = slug.trim().toLowerCase();

    const experience = await Experience.findOne({
      serialNumber: normalizedSerial,
      slug: normalizedSlug,
      type: "personal",
      status: {
        $ne: "disabled",
      },
    })
      .populate("product")
      .populate("smartUnit");

    if (!experience) {
      return res.status(404).json({
        message: "This experience does not exist or is no longer available.",
      });
    }

    return res.status(200).json({
      success: true,
      experience,
    });
  } catch (error) {
    console.error("GET CUSTOMER EXPERIENCE ERROR:", error);

    return res.status(500).json({
      message: "Unable to load customer experience.",
    });
  }
};

export const getPublicExperienceController = async (req, res, next) => {
  try {
    const data = await getExperienceByPublicToken(req.params.token);

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getExperienceBySlugController = async (req, res, next) => {
  try {
    const data = await getExperienceBySerialAndSlug(
      req.params.serialNumber,
      req.params.slug,
    );

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePersonalController = async (req, res, next) => {
  try {
    const personal = await updatePersonalExperience(req.params.token, req.body);

    res.json({
      success: true,
      data: personal,
    });
  } catch (error) {
    next(error);
  }
};

export const updateSlugController = async (req, res, next) => {
  try {
    const experience = await updateExperienceSlug(
      req.params.token,
      req.body.slug,
    );

    res.json({
      success: true,
      data: experience,
    });
  } catch (error) {
    next(error);
  }
};

export const checkSlugController = async (req, res, next) => {
  try {
    const available = await checkSlugAvailability(req.params.slug);

    res.json({
      success: true,
      available,
    });
  } catch (error) {
    next(error);
  }
};

export const uploadMediaController = async (req, res, next) => {
  try {
    console.log("=================================");

    console.log("CONTENT TYPE:");
    console.log(req.headers["content-type"]);

    console.log("REQ FILES:");
    console.log(req.files);

    console.log("REQ BODY:");
    console.log(req.body);

    console.log("=================================");

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No files received by server",
      });
    }

    const media = await uploadExperienceMedia(req.params.token, req.files);

    res.status(200).json({
      success: true,
      data: media,
    });
  } catch (error) {
    console.error("UPLOAD MEDIA CONTROLLER ERROR:", error);

    next(error);
  }
};
