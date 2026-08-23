import {
  createExperience,
  getExperienceByManageToken,
  getExperienceByPublicToken,
  updatePersonalExperience,
  updateExperienceSlug,
  updateExperienceAccessDate,
  checkSlugAvailability,
  uploadExperienceMedia,
  getPublicExperienceAccess,
  unlockPublicExperience,
} from "../services/experienceService.js";

export const createExperienceController = async (
  req,
  res,
  next,
) => {
  try {
    const experience =
      await createExperience(
        req.body,
      );

    return res.status(201).json({
      success: true,
      data: experience,
    });
  } catch (error) {
    next(error);
  }
};

export const getExperienceController = async (
  req,
  res,
  next,
) => {
  try {
    const data =
      await getExperienceByManageToken(
        req.params.token,
      );

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getPublicExperience = async (
  req,
  res,
  next,
) => {
  try {
    const {
      serialNumber,
      slug,
    } = req.params;

    const result =
      await getPublicExperienceAccess(
        serialNumber,
        slug,
      );

    return res.status(200).json({
      success: true,
      requiresDate:
        result.requiresDate,
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
};

export const getCustomerExperience = async (
  req,
  res,
  next,
) => {
  try {
    const {
      serialNumber,
      slug,
    } = req.params;

    const result =
      await getPublicExperienceAccess(
        serialNumber,
        slug,
        {
          type: "personal",
        },
      );

    return res.status(200).json({
      success: true,
      requiresDate:
        result.requiresDate,
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
};

export const unlockPublicExperienceController =
  async (
    req,
    res,
    next,
  ) => {
    try {
      const {
        serialNumber,
        slug,
      } = req.params;

      const data =
        await unlockPublicExperience(
          serialNumber,
          slug,
          req.body.accessDate,
        );

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  };

export const getPublicExperienceController =
  async (
    req,
    res,
    next,
  ) => {
    try {
      const data =
        await getExperienceByPublicToken(
          req.params.token,
        );

      return res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  };

export const getExperienceBySlugController =
  async (
    req,
    res,
    next,
  ) => {
    try {
      const result =
        await getPublicExperienceAccess(
          req.params.serialNumber,
          req.params.slug,
        );

      return res.json({
        success: true,
        requiresDate:
          result.requiresDate,
        data: result.data,
      });
    } catch (error) {
      next(error);
    }
  };

export const updatePersonalController = async (
  req,
  res,
  next,
) => {
  try {
    const personal =
      await updatePersonalExperience(
        req.params.token,
        req.body,
      );

    return res.json({
      success: true,
      data: personal,
    });
  } catch (error) {
    next(error);
  }
};

export const updateSlugController = async (
  req,
  res,
  next,
) => {
  try {
    const experience =
      await updateExperienceSlug(
        req.params.token,
        req.body.slug,
      );

    return res.json({
      success: true,
      data: experience,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAccessDateController =
  async (
    req,
    res,
    next,
  ) => {
    try {
      const data =
        await updateExperienceAccessDate(
          req.params.token,
          req.body.accessDate,
        );

      return res.status(200).json({
        success: true,

        message: data.enabled
          ? "Experience date lock enabled successfully."
          : "Experience date lock removed successfully.",

        data,
      });
    } catch (error) {
      next(error);
    }
  };

export const checkSlugController = async (
  req,
  res,
  next,
) => {
  try {
    const available =
      await checkSlugAvailability(
        req.params.slug,
      );

    return res.json({
      success: true,
      available,
    });
  } catch (error) {
    next(error);
  }
};

export const uploadMediaController = async (
  req,
  res,
  next,
) => {
  try {
    if (
      !req.files ||
      req.files.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "No files received by server",
      });
    }

    const media =
      await uploadExperienceMedia(
        req.params.token,
        req.files,
      );

    return res.status(200).json({
      success: true,
      data: media,
    });
  } catch (error) {
    next(error);
  }
};