import crypto from "crypto";

import Product from "../../catalog/models/Product.js";
import SmartUnit from "../../catalog/models/SmartUnit.js";
import SmartUnitInstance from "../../catalog/models/SmartUnitInstance.js";

import Experience from "../models/Experience.js";
import ExperiencePersonal from "../models/ExperiencePersonal.js";
import ExperienceMedia from "../models/ExperienceMedia.js";

import { generateManageToken } from "../utils/tokenGenerator.js";

const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const formatSlug = (slug) => {
  if (typeof slug !== "string" || !slug.trim()) {
    return null;
  }

  return slug
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\u0600-\u06FF-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
};

const buildExperienceUrl = (experience) => {
  if (!experience || !experience.serialNumber) {
    return null;
  }

  const serialNumber = experience.serialNumber.toString().trim().toUpperCase();

  if (experience.slug) {
    return `http://localhost:5173/experience/${serialNumber}/${experience.slug}`;
  }

  return `http://localhost:5173/experience/${serialNumber}`;
};

export const createExperience = async (data) => {
  if (!data.order) {
    throw createError("Order is required to create Experience", 400);
  }

  if (!data.orderItem) {
    throw createError("Order item is required to create Experience", 400);
  }

  if (!data.product) {
    throw createError("Product is required to create Experience", 400);
  }

  if (!data.smartUnit) {
    throw createError("Smart Unit is required to create Experience", 400);
  }

  const product = await Product.findById(data.product);

  if (!product) {
    throw createError("Product not found", 404);
  }

  const smartUnit = await SmartUnit.findById(data.smartUnit);

  if (!smartUnit) {
    throw createError("Smart Unit not found", 404);
  }

  let smartUnitInstance = null;

  if (typeof data.serialNumber === "string" && data.serialNumber.trim()) {
    const formattedSerial = data.serialNumber.trim().toUpperCase();

    smartUnitInstance = await SmartUnitInstance.findOne({
      smartUnit: data.smartUnit,
      serialNumber: formattedSerial,
    });

    if (!smartUnitInstance) {
      throw createError(
        "Smart Unit physical instance not found for this serial number",
        404,
      );
    }
  } else if (data.smartUnitInstance) {
    smartUnitInstance = await SmartUnitInstance.findOne({
      _id: data.smartUnitInstance,
      smartUnit: data.smartUnit,
    });

    if (!smartUnitInstance) {
      throw createError("Smart Unit physical instance not found", 404);
    }
  } else {
    smartUnitInstance = await SmartUnitInstance.findOne({
      smartUnit: data.smartUnit,
      status: "available",
    }).sort({
      createdAt: 1,
    });

    if (!smartUnitInstance) {
      throw createError("No available physical Smart Unit instance found", 400);
    }
  }

  const serialNumber = smartUnitInstance.serialNumber.trim().toUpperCase();

  const existingExperience = await Experience.findOne({
    serialNumber,
  });

  if (existingExperience) {
    throw createError(
      "This physical Smart Unit already has an Experience",
      400,
    );
  }

  const manageToken = generateManageToken();

  const publicToken = crypto.randomBytes(32).toString("hex");

  const experienceData = {
    order: data.order,
    orderItem: data.orderItem,
    product: data.product,
    smartUnit: data.smartUnit,
    owner: data.owner || null,
    serialNumber,
    manageToken,
    publicToken,
    type: data.type || "personal",
    status: data.status || "waiting",
    visits: 0,
    activatedAt: null,
  };

  if (typeof data.slug === "string" && data.slug.trim()) {
    const formattedSlug = formatSlug(data.slug);

    if (!formattedSlug) {
      throw createError("Invalid URL name", 400);
    }

    experienceData.slug = formattedSlug;
  }

  const experience = await Experience.create(experienceData);

  if (smartUnitInstance.status === "available") {
    smartUnitInstance.status = "assigned";

    smartUnitInstance.assignedAt = new Date();

    await smartUnitInstance.save();
  }

  await ExperiencePersonal.create({
    experience: experience._id,
  });

  return getExperienceById(experience._id);
};

export const getExperienceById = async (experienceId) => {
  const experience = await Experience.findById(experienceId)
    .populate("product")
    .populate("smartUnit")
    .populate("owner")
    .populate("order");

  if (!experience) {
    throw createError("Experience not found", 404);
  }

  return experience;
};

export const getExperienceByManageToken = async (token) => {
  const experience = await Experience.findOne({
    manageToken: token,
  })
    .populate("product")
    .populate("smartUnit")
    .populate("owner")
    .populate("order");

  if (!experience) {
    throw createError("Experience not found", 404);
  }

  if (!experience.publicToken) {
    experience.publicToken = crypto.randomBytes(32).toString("hex");

    await experience.save();
  }

  const personal = await ExperiencePersonal.findOne({
    experience: experience._id,
  });

  const media = await getExperienceMedia(experience._id);

  const publicUrl = buildExperienceUrl(experience);

  return {
    experience,
    personal,
    media,
    publicUrl,
  };
};

export const getExperienceByPublicToken = async (token) => {
  let experience = await Experience.findOne({
    publicToken: token,
  })
    .populate("product")
    .populate("smartUnit")
    .populate("owner");

  if (!experience) {
    experience = await Experience.findOne({
      manageToken: token,
    })
      .populate("product")
      .populate("smartUnit")
      .populate("owner");

    if (experience) {
      experience.publicToken = crypto.randomBytes(32).toString("hex");

      await experience.save();
    }
  }

  if (!experience) {
    throw createError("Experience not found", 404);
  }

  if (
    experience.status !== "active" &&
    experience.status !== "waiting" &&
    experience.status !== "draft"
  ) {
    throw createError("This experience is no longer available", 404);
  }

  experience.visits = (experience.visits || 0) + 1;

  await experience.save();

  const personal = await ExperiencePersonal.findOne({
    experience: experience._id,
  });

  const media = await getExperienceMedia(experience._id);

  return {
    experience,
    personal,
    media,
  };
};

export const getExperienceBySerialAndSlug = async (serialNumber, slug) => {
  if (typeof serialNumber !== "string" || !serialNumber.trim()) {
    throw createError("Serial number is required", 400);
  }

  const formattedSerial = serialNumber.trim().toUpperCase();

  const query = {
    serialNumber: formattedSerial,
  };

  if (typeof slug === "string" && slug.trim()) {
    const formattedSlug = formatSlug(slug);

    if (!formattedSlug) {
      throw createError("Invalid URL name", 400);
    }

    query.slug = formattedSlug;
  }

  const experience = await Experience.findOne(query)
    .populate("product")
    .populate("smartUnit")
    .populate("owner");

  if (!experience) {
    throw createError("Experience not found", 404);
  }

  if (experience.status === "expired") {
    throw createError("This experience has expired", 404);
  }

  experience.visits = (experience.visits || 0) + 1;

  await experience.save();

  const personal = await ExperiencePersonal.findOne({
    experience: experience._id,
  });

  const media = await getExperienceMedia(experience._id);

  return {
    experience,
    personal,
    media,
  };
};

export const getExperienceBySlug = async (slug) => {
  if (typeof slug !== "string" || !slug.trim()) {
    throw createError("Slug is required", 400);
  }

  const formattedSlug = formatSlug(slug);

  const experience = await Experience.findOne({
    slug: formattedSlug,
  })
    .populate("product")
    .populate("smartUnit")
    .populate("owner");

  if (!experience) {
    throw createError("Experience not found", 404);
  }

  if (experience.status === "expired") {
    throw createError("This experience has expired", 404);
  }

  experience.visits = (experience.visits || 0) + 1;

  await experience.save();

  const personal = await ExperiencePersonal.findOne({
    experience: experience._id,
  });

  const media = await getExperienceMedia(experience._id);

  return {
    experience,
    personal,
    media,
  };
};

export const updatePersonalExperience = async (token, body) => {
  const experience = await Experience.findOne({
    manageToken: token,
  });

  if (!experience) {
    throw createError("Experience not found", 404);
  }

  let personal = await ExperiencePersonal.findOne({
    experience: experience._id,
  });

  if (!personal) {
    personal = await ExperiencePersonal.create({
      experience: experience._id,
    });
  }

  personal.ownerName = body.ownerName ?? personal.ownerName;

  personal.receiverName = body.receiverName ?? personal.receiverName;

  personal.receiverEmail = body.receiverEmail ?? personal.receiverEmail;

  personal.title = body.title ?? personal.title;

  personal.message = body.message ?? personal.message;

  personal.profileImage = body.profileImage ?? personal.profileImage;

  await personal.save();

  return personal;
};

export const updateExperienceSlug = async (token, slug) => {
  if (typeof slug !== "string" || !slug.trim()) {
    throw createError("Slug is required", 400);
  }

  const experience = await Experience.findOne({
    manageToken: token,
  });

  if (!experience) {
    throw createError("Experience not found", 404);
  }

  const formattedSlug = formatSlug(slug);

  if (!formattedSlug) {
    throw createError("Invalid URL name", 400);
  }

  experience.slug = formattedSlug;

  await experience.save();

  return experience;
};

export const checkSlugAvailability = async (slug) => {
  if (typeof slug !== "string" || !slug.trim()) {
    return false;
  }

  const formattedSlug = formatSlug(slug);

  return Boolean(formattedSlug);
};

export const updatePersonalInfo = async (token, data) => {
  return updatePersonalExperience(token, data);
};

export const uploadExperienceMedia = async (token, files) => {
  if (!files || files.length === 0) {
    throw createError("No files uploaded", 400);
  }

  const experience = await Experience.findOne({
    manageToken: token,
  });

  if (!experience) {
    throw createError("Experience not found", 404);
  }

  const media = [];

  for (const file of files) {
    let type = "file";

    if (file.mimetype && file.mimetype.startsWith("image/")) {
      type = "image";
    } else if (file.mimetype && file.mimetype.startsWith("video/")) {
      type = "video";
    } else if (file.mimetype && file.mimetype.startsWith("audio/")) {
      type = "audio";
    }

    const item = await ExperienceMedia.create({
      experience: experience._id,

      type,

      url: `/uploads/experience/${file.filename}`,

      fileName: file.originalname,

      fileSize: file.size,

      sortOrder: 0,
    });

    media.push(item);
  }

  return media;
};

export const getExperienceMedia = async (experienceId) => {
  return ExperienceMedia.find({
    experience: experienceId,
  }).sort({
    sortOrder: 1,
    createdAt: 1,
  });
};

export const deleteExperienceMedia = async (mediaId) => {
  const media = await ExperienceMedia.findByIdAndDelete(mediaId);

  if (!media) {
    throw createError("Media not found", 404);
  }

  return media;
};
