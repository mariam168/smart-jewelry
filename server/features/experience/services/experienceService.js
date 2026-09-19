import crypto from "crypto";
import fs from "fs/promises";
import path from "path";

import Product from "../../catalog/models/Product.js";
import SmartUnit from "../../catalog/models/SmartUnit.js";
import SmartUnitInstance from "../../catalog/models/SmartUnitInstance.js";

import Experience from "../models/Experience.js";
import ExperiencePersonal from "../models/ExperiencePersonal.js";
import ExperienceMedia from "../models/ExperienceMedia.js";
import ExperienceMediaSettings from "../models/ExperienceMediaSettings.js";
import ExperienceMediaRequest from "../models/VideoUploadRequest.js";

import { generateManageToken } from "../utils/tokenGenerator.js";

const DEFAULT_MEDIA_LIMITS = {
  imageLimit: 5,
  videoLimit: 5,
  audioLimit: 5,
};

const MEDIA_TYPES = ["image", "audio", "video"];

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

const normalizeAccessDate = (value) => {
  if (typeof value !== "string" || !value.trim()) {
    return "";
  }

  const normalized = value.trim();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    throw createError("Date must use YYYY-MM-DD format", 400);
  }

  const [year, month, day] = normalized.split("-").map(Number);

  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw createError("Invalid access date", 400);
  }

  return normalized;
};

const normalizeMediaLimit = (value, fallback = 5) => {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  const number = Number(value);

  if (!Number.isInteger(number) || number < 0 || number > 100) {
    throw createError(
      "Media limits must be whole numbers between 0 and 100.",
      400
    );
  }

  return number;
};

const normalizeExtraLimit = (value, fallback = 1) => {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  const number = Number(value);

  if (!Number.isInteger(number) || number < 1 || number > 100) {
    throw createError(
      "Requested extra media limit must be a whole number between 1 and 100.",
      400
    );
  }

  return number;
};

const normalizeRequestText = (
  value,
  label,
  maxLength,
  required = false
) => {
  const text = String(value ?? "").trim();

  if (required && !text) {
    throw createError(`${label} is required`, 400);
  }

  if (text.length > maxLength) {
    throw createError(`${label} is too long`, 400);
  }

  return text;
};

const getFileMediaType = (file) => {
  const mimetype = String(file?.mimetype || "").toLowerCase();

  if (mimetype.startsWith("image/")) {
    return "image";
  }

  if (mimetype.startsWith("video/")) {
    return "video";
  }

  if (mimetype.startsWith("audio/")) {
    return "audio";
  }

  return null;
};

const getLimitKey = (type) => {
  switch (type) {
    case "image":
      return "imageLimit";
    case "video":
      return "videoLimit";
    case "audio":
      return "audioLimit";
    default:
      return null;
  }
};

const getMediaTypeLabel = (type) => {
  switch (type) {
    case "image":
      return "Image";
    case "video":
      return "Video";
    case "audio":
      return "Audio";
    default:
      return "Media";
  }
};

let mediaRequestIndexesPromise = null;

const ensureMediaRequestIndexes = async () => {
  if (mediaRequestIndexesPromise) {
    return mediaRequestIndexesPromise;
  }

  mediaRequestIndexesPromise = (async () => {
    let indexes = [];

    try {
      indexes = await ExperienceMediaRequest.collection.indexes();
    } catch (error) {
      if (
        error?.code !== 26 &&
        error?.codeName !== "NamespaceNotFound"
      ) {
        throw error;
      }
    }

    const legacyUniqueIndex = indexes.find(
      (index) => index.name === "experience_mediaType_unique"
    );

    if (legacyUniqueIndex) {
      try {
        await ExperienceMediaRequest.collection.dropIndex(
          legacyUniqueIndex.name
        );
      } catch (error) {
        if (
          error?.code !== 27 &&
          error?.codeName !== "IndexNotFound"
        ) {
          throw error;
        }
      }
    }

    try {
      indexes = await ExperienceMediaRequest.collection.indexes();
    } catch (error) {
      if (
        error?.code !== 26 &&
        error?.codeName !== "NamespaceNotFound"
      ) {
        throw error;
      }

      indexes = [];
    }

    const hasStatusIndex = indexes.some((index) => {
      const keys = index.key || {};

      return (
        Number(keys.experience) === 1 &&
        Number(keys.mediaType) === 1 &&
        Number(keys.status) === 1
      );
    });

    if (!hasStatusIndex) {
      await ExperienceMediaRequest.collection.createIndex(
        {
          experience: 1,
          mediaType: 1,
          status: 1,
        },
        {
          name: "experience_mediaType_status_idx",
        }
      );
    }
  })().catch((error) => {
    mediaRequestIndexesPromise = null;
    throw error;
  });

  return mediaRequestIndexesPromise;
};

const getMediaRequests = async (
  experienceId,
  mediaType = null
) => {
  await ensureMediaRequestIndexes();

  const query = {
    experience: experienceId,
  };

  if (mediaType) {
    query.mediaType = mediaType;
  }

  return ExperienceMediaRequest.find(query)
    .sort({
      requestedAt: 1,
      createdAt: 1,
      _id: 1,
    })
    .lean();
};

const getApprovedExtraLimit = (requests = []) => {
  return requests.reduce((total, request) => {
    if (request?.status !== "approved") {
      return total;
    }

    return total + Number(request?.approvedExtraLimit || 0);
  }, 0);
};

const getApprovedExtraLimitsByType = (requests = []) => {
  const result = {
    image: 0,
    audio: 0,
    video: 0,
  };

  for (const request of requests) {
    if (
      request?.status !== "approved" ||
      !MEDIA_TYPES.includes(request?.mediaType)
    ) {
      continue;
    }

    result[request.mediaType] += Number(
      request.approvedExtraLimit || 0
    );
  }

  return result;
};

const getMediaAccessForExperience = async (experienceId) => {
  const requests = await getMediaRequests(experienceId);

  const result = {};

  for (const type of MEDIA_TYPES) {
    const typeRequests = requests.filter(
      (item) => item.mediaType === type
    );

    const latestRequest =
      typeRequests.length > 0
        ? typeRequests[typeRequests.length - 1]
        : null;

    const approvedExtraLimit =
      getApprovedExtraLimit(typeRequests);

    const requestedExtraLimit = typeRequests.reduce(
      (total, request) =>
        total + Number(request?.requestedExtraLimit || 0),
      0
    );

    result[type] = {
      requestId: latestRequest?._id || null,
      status:
        approvedExtraLimit > 0
          ? "approved"
          : latestRequest?.status || "not_requested",
      requestedExtraLimit,
      approvedExtraLimit,
      requesterName: latestRequest?.requesterName || "",
      requesterPhone: latestRequest?.requesterPhone || "",
      message: latestRequest?.message || "",
      adminNote: latestRequest?.adminNote || "",
      requestedAt:
        latestRequest?.requestedAt ||
        latestRequest?.createdAt ||
        null,
      reviewedAt: latestRequest?.reviewedAt || null,
      requests: typeRequests,
    };
  }

  return result;
};

export const getExperienceMediaLimits = async () => {
  const settings =
    await ExperienceMediaSettings.findOneAndUpdate(
      {
        key: "global",
      },
      {
        $setOnInsert: {
          key: "global",
          ...DEFAULT_MEDIA_LIMITS,
        },
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    ).lean();

  return {
    imageLimit: Number(
      settings?.imageLimit ??
        DEFAULT_MEDIA_LIMITS.imageLimit
    ),
    videoLimit: Number(
      settings?.videoLimit ??
        DEFAULT_MEDIA_LIMITS.videoLimit
    ),
    audioLimit: Number(
      settings?.audioLimit ??
        DEFAULT_MEDIA_LIMITS.audioLimit
    ),
  };
};

export const updateExperienceMediaLimits = async (
  data = {}
) => {
  const current = await getExperienceMediaLimits();

  const values = {
    imageLimit: normalizeMediaLimit(
      data.imageLimit,
      current.imageLimit
    ),
    videoLimit: normalizeMediaLimit(
      data.videoLimit,
      current.videoLimit
    ),
    audioLimit: normalizeMediaLimit(
      data.audioLimit,
      current.audioLimit
    ),
  };

  const settings =
    await ExperienceMediaSettings.findOneAndUpdate(
      {
        key: "global",
      },
      {
        $set: values,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    ).lean();

  return {
    imageLimit: settings.imageLimit,
    videoLimit: settings.videoLimit,
    audioLimit: settings.audioLimit,
  };
};

let slugIndexesPromise = null;

const ensureExperienceSlugIndexes = async () => {
  if (slugIndexesPromise) {
    return slugIndexesPromise;
  }

  slugIndexesPromise = (async () => {
    let indexes = [];

    try {
      indexes = await Experience.collection.indexes();
    } catch (error) {
      if (
        error?.code !== 26 &&
        error?.codeName !== "NamespaceNotFound"
      ) {
        throw error;
      }
    }

    for (const index of indexes) {
      const keys = Object.keys(index.key || {});

      const isStandaloneSlugIndex =
        keys.length === 1 && keys[0] === "slug";

      if (isStandaloneSlugIndex) {
        try {
          await Experience.collection.dropIndex(
            index.name
          );
        } catch (error) {
          if (
            error?.code !== 27 &&
            error?.codeName !== "IndexNotFound"
          ) {
            throw error;
          }
        }
      }
    }

    try {
      indexes = await Experience.collection.indexes();
    } catch (error) {
      if (
        error?.code !== 26 &&
        error?.codeName !== "NamespaceNotFound"
      ) {
        throw error;
      }

      indexes = [];
    }

    const compoundIndex = indexes.find((index) => {
      const keys = Object.keys(index.key || {});

      return (
        keys.length === 2 &&
        keys[0] === "serialNumber" &&
        keys[1] === "slug" &&
        Number(index.key.serialNumber) === 1 &&
        Number(index.key.slug) === 1
      );
    });

    if (compoundIndex && !compoundIndex.unique) {
      try {
        await Experience.collection.dropIndex(
          compoundIndex.name
        );
      } catch (error) {
        if (
          error?.code !== 27 &&
          error?.codeName !== "IndexNotFound"
        ) {
          throw error;
        }
      }
    }

    if (!compoundIndex || !compoundIndex.unique) {
      await Experience.collection.createIndex(
        {
          serialNumber: 1,
          slug: 1,
        },
        {
          unique: true,
          name: "serialNumber_1_slug_1",
        }
      );
    }
  })().catch((error) => {
    slugIndexesPromise = null;
    throw error;
  });

  return slugIndexesPromise;
};

const getClientUrl = () => {
  return String(
    process.env.CLIENT_URL ||
      process.env.FRONTEND_URL ||
      "http://localhost:5173"
  ).replace(/\/+$/, "");
};

const buildExperienceUrl = (experience) => {
  if (!experience?.serialNumber || !experience?.slug) {
    return null;
  }

  const clientUrl = getClientUrl();

  const serialNumber = String(
    experience.serialNumber
  )
    .trim()
    .toUpperCase();

  const slug = String(experience.slug)
    .trim()
    .toLowerCase();

  return `${clientUrl}/experience/public/${encodeURIComponent(
    serialNumber
  )}/${encodeURIComponent(slug)}`;
};

const sanitizePublicExperience = (experience) => {
  const data =
    typeof experience?.toObject === "function"
      ? experience.toObject()
      : {
          ...experience,
        };

  delete data.manageToken;
  delete data.publicToken;
  delete data.accessDate;
  delete data.owner;
  delete data.order;
  delete data.orderItem;
  delete data.product;
  delete data.smartUnit;

  return data;
};

const getVideoAccessForExperience = async (
  experienceId
) => {
  const requests = await getMediaRequests(
    experienceId,
    "video"
  );

  if (!requests.length) {
    return {
      requestId: null,
      status: "not_requested",
      approvedVideoLimit: 0,
      requestedExtraLimit: 0,
      approvedExtraLimit: 0,
      requesterName: "",
      requesterPhone: "",
      message: "",
      adminNote: "",
      requestedAt: null,
      reviewedAt: null,
      requests: [],
    };
  }

  const latestRequest =
    requests[requests.length - 1];

  const approvedExtraLimit =
    getApprovedExtraLimit(requests);

  const requestedExtraLimit = requests.reduce(
    (total, request) =>
      total +
      Number(request?.requestedExtraLimit || 0),
    0
  );

  return {
    requestId: latestRequest?._id || null,
    status:
      approvedExtraLimit > 0
        ? "approved"
        : latestRequest?.status || "pending",
    approvedVideoLimit: approvedExtraLimit,
    requestedExtraLimit,
    approvedExtraLimit,
    requesterName:
      latestRequest?.requesterName || "",
    requesterPhone:
      latestRequest?.requesterPhone || "",
    message: latestRequest?.message || "",
    adminNote:
      latestRequest?.adminNote || "",
    requestedAt:
      latestRequest?.requestedAt ||
      latestRequest?.createdAt ||
      null,
    reviewedAt:
      latestRequest?.reviewedAt || null,
    requests,
  };
};

const loadPublicExperienceDocument = async (
  serialNumber,
  slug,
  extraQuery = {}
) => {
  if (
    typeof serialNumber !== "string" ||
    !serialNumber.trim()
  ) {
    throw createError(
      "Serial number is required",
      400
    );
  }

  const formattedSerial =
    serialNumber.trim().toUpperCase();

  const formattedSlug = formatSlug(slug);

  if (!formattedSlug) {
    throw createError(
      "Invalid URL name",
      400
    );
  }

  const experience = await Experience.findOne({
    serialNumber: formattedSerial,
    slug: formattedSlug,
    ...extraQuery,
  })
    .select("+accessDate")
    .populate(
      "product",
      "name description price primaryImage image images"
    )
    .populate(
      "smartUnit",
      "name description image firmwareVersion manufacturer status"
    );

  if (!experience) {
    throw createError(
      "Experience not found",
      404
    );
  }

  if (
    experience.status === "expired" ||
    experience.status === "disabled"
  ) {
    throw createError(
      "This experience is no longer available",
      404
    );
  }

  return experience;
};

const buildPublicExperiencePayload = async (
  experience
) => {
  experience.visits =
    Number(experience.visits || 0) + 1;

  await experience.save();

  const personal =
    await ExperiencePersonal.findOne({
      experience: experience._id,
    });

  const media = await getExperienceMedia(
    experience._id
  );

  return {
    experience:
      sanitizePublicExperience(experience),
    personal,
    media,
  };
};

export const createExperience = async (data) => {
  await ensureExperienceSlugIndexes();

  if (!data.order) {
    throw createError(
      "Order is required to create Experience",
      400
    );
  }

  if (!data.orderItem) {
    throw createError(
      "Order item is required to create Experience",
      400
    );
  }

  if (!data.product) {
    throw createError(
      "Product is required to create Experience",
      400
    );
  }

  if (!data.smartUnit) {
    throw createError(
      "Smart Unit is required to create Experience",
      400
    );
  }

  const product = await Product.findById(
    data.product
  );

  if (!product) {
    throw createError(
      "Product not found",
      404
    );
  }

  const smartUnit = await SmartUnit.findById(
    data.smartUnit
  );

  if (!smartUnit) {
    throw createError(
      "Smart Unit not found",
      404
    );
  }

  let smartUnitInstance = null;

  if (
    typeof data.serialNumber === "string" &&
    data.serialNumber.trim()
  ) {
    const formattedSerial =
      data.serialNumber
        .trim()
        .toUpperCase();

    smartUnitInstance =
      await SmartUnitInstance.findOne({
        smartUnit: data.smartUnit,
        serialNumber: formattedSerial,
      });

    if (!smartUnitInstance) {
      throw createError(
        "Smart Unit physical instance not found for this serial number",
        404
      );
    }
  } else if (data.smartUnitInstance) {
    smartUnitInstance =
      await SmartUnitInstance.findOne({
        _id: data.smartUnitInstance,
        smartUnit: data.smartUnit,
      });

    if (!smartUnitInstance) {
      throw createError(
        "Smart Unit physical instance not found",
        404
      );
    }
  } else {
    smartUnitInstance =
      await SmartUnitInstance.findOne({
        smartUnit: data.smartUnit,
        status: "available",
      }).sort({
        createdAt: 1,
      });

    if (!smartUnitInstance) {
      throw createError(
        "No available physical Smart Unit instance found",
        400
      );
    }
  }

  const serialNumber =
    smartUnitInstance.serialNumber
      .trim()
      .toUpperCase();

  const existingExperience =
    await Experience.findOne({
      serialNumber,
    });

  if (existingExperience) {
    throw createError(
      "This physical Smart Unit already has an Experience",
      400
    );
  }

  const manageToken =
    generateManageToken();

  const publicToken =
    crypto.randomBytes(32).toString("hex");

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

  if (
    typeof data.slug === "string" &&
    data.slug.trim()
  ) {
    const formattedSlug =
      formatSlug(data.slug);

    if (!formattedSlug) {
      throw createError(
        "Invalid URL name",
        400
      );
    }

    experienceData.slug =
      formattedSlug;
  }

  const experience =
    await Experience.create(
      experienceData
    );

  try {
    if (
      smartUnitInstance.status ===
      "available"
    ) {
      smartUnitInstance.status =
        "assigned";

      smartUnitInstance.assignedAt =
        new Date();

      await smartUnitInstance.save();
    }

    await ExperiencePersonal.create({
      experience: experience._id,
    });
  } catch (error) {
    await Experience.findByIdAndDelete(
      experience._id
    );

    if (
      smartUnitInstance.status ===
      "assigned"
    ) {
      smartUnitInstance.status =
        "available";

      smartUnitInstance.assignedAt =
        null;

      await smartUnitInstance.save();
    }

    throw error;
  }

  return getExperienceById(
    experience._id
  );
};

export const getExperienceById = async (
  experienceId
) => {
  const experience =
    await Experience.findById(
      experienceId
    )
      .populate("product")
      .populate("smartUnit")
      .populate(
        "owner",
        "email phone firstName lastName"
      )
      .populate("order");

  if (!experience) {
    throw createError(
      "Experience not found",
      404
    );
  }

  return experience;
};

export const getExperienceByManageToken =
  async (token) => {
    await ensureMediaRequestIndexes();

    const experience =
      await Experience.findOne({
        manageToken: token,
      })
        .select("+accessDate")
        .populate("product")
        .populate("smartUnit")
        .populate(
          "owner",
          "email phone firstName lastName"
        )
        .populate("order");

    if (!experience) {
      throw createError(
        "Experience not found",
        404
      );
    }

    if (!experience.publicToken) {
      experience.publicToken =
        crypto
          .randomBytes(32)
          .toString("hex");

      await experience.save();
    }

    const personal =
      await ExperiencePersonal.findOne({
        experience: experience._id,
      });

    const media =
      await getExperienceMedia(
        experience._id
      );

    const mediaLimits =
      await getExperienceMediaLimits();

    const mediaRequests =
      await getMediaRequests(
        experience._id
      );

    const approvedExtras =
      getApprovedExtraLimitsByType(
        mediaRequests
      );

    const approvedExtraLimits = {
      imageLimit: approvedExtras.image,
      audioLimit: approvedExtras.audio,
      videoLimit: approvedExtras.video,
    };

    const effectiveLimits = {
      imageLimit:
        mediaLimits.imageLimit +
        approvedExtras.image,
      audioLimit:
        mediaLimits.audioLimit +
        approvedExtras.audio,
      videoLimit:
        mediaLimits.videoLimit +
        approvedExtras.video,
    };

    const publicUrl =
      buildExperienceUrl(
        experience
      );

    const videoAccess =
      await getVideoAccessForExperience(
        experience._id
      );

    return {
      experience,
      personal,
      media,
      mediaLimits,
      approvedExtraLimits,
      effectiveLimits,
      mediaRequests,
      publicUrl,
      videoAccess,
    };
  };

export const getPublicExperienceAccess =
  async (
    serialNumber,
    slug,
    extraQuery = {}
  ) => {
    const experience =
      await loadPublicExperienceDocument(
        serialNumber,
        slug,
        extraQuery
      );

    if (experience.accessDate) {
      return {
        requiresDate: true,
        data: null,
      };
    }

    const data =
      await buildPublicExperiencePayload(
        experience
      );

    return {
      requiresDate: false,
      data,
    };
  };

export const unlockPublicExperience =
  async (
    serialNumber,
    slug,
    accessDate,
    extraQuery = {}
  ) => {
    const experience =
      await loadPublicExperienceDocument(
        serialNumber,
        slug,
        extraQuery
      );

    if (!experience.accessDate) {
      return buildPublicExperiencePayload(
        experience
      );
    }

    const normalizedDate =
      normalizeAccessDate(
        accessDate
      );

    if (
      normalizedDate !==
      experience.accessDate
    ) {
      throw createError(
        "The date you entered is incorrect.",
        403
      );
    }

    return buildPublicExperiencePayload(
      experience
    );
  };

export const getExperienceByPublicToken =
  async (token) => {
    const experience =
      await Experience.findOne({
        publicToken: token,
      })
        .select("+accessDate")
        .populate(
          "product",
          "name description price primaryImage image images"
        )
        .populate(
          "smartUnit",
          "name description image firmwareVersion manufacturer status"
        );

    if (!experience) {
      throw createError(
        "Experience not found",
        404
      );
    }

    if (
      experience.status === "expired" ||
      experience.status === "disabled"
    ) {
      throw createError(
        "This experience is no longer available",
        404
      );
    }

    if (experience.accessDate) {
      throw createError(
        "Date verification is required",
        403
      );
    }

    return buildPublicExperiencePayload(
      experience
    );
  };

export const getExperienceBySerialAndSlug =
  async (serialNumber, slug) => {
    const result =
      await getPublicExperienceAccess(
        serialNumber,
        slug
      );

    if (result.requiresDate) {
      throw createError(
        "Date verification is required",
        403
      );
    }

    return result.data;
  };

export const getExperienceBySlug =
  async (slug) => {
    if (
      typeof slug !== "string" ||
      !slug.trim()
    ) {
      throw createError(
        "Slug is required",
        400
      );
    }

    const formattedSlug =
      formatSlug(slug);

    const experience =
      await Experience.findOne({
        slug: formattedSlug,
      })
        .select("+accessDate")
        .populate(
          "product",
          "name description price primaryImage image images"
        )
        .populate(
          "smartUnit",
          "name description image firmwareVersion manufacturer status"
        );

    if (!experience) {
      throw createError(
        "Experience not found",
        404
      );
    }

    if (
      experience.status === "expired" ||
      experience.status === "disabled"
    ) {
      throw createError(
        "This experience is no longer available",
        404
      );
    }

    if (experience.accessDate) {
      throw createError(
        "Date verification is required",
        403
      );
    }

    return buildPublicExperiencePayload(
      experience
    );
  };

export const updatePersonalExperience =
  async (token, body) => {
    const experience =
      await Experience.findOne({
        manageToken: token,
      });

    if (!experience) {
      throw createError(
        "Experience not found",
        404
      );
    }

    let personal =
      await ExperiencePersonal.findOne({
        experience: experience._id,
      });

    if (!personal) {
      personal =
        await ExperiencePersonal.create({
          experience: experience._id,
        });
    }

    personal.ownerName =
      body.ownerName ??
      personal.ownerName;

    personal.receiverName =
      body.receiverName ??
      personal.receiverName;

    personal.receiverEmail =
      body.receiverEmail ??
      personal.receiverEmail;

    personal.title =
      body.title ??
      personal.title;

    personal.message =
      body.message ??
      personal.message;

    personal.profileImage =
      body.profileImage ??
      personal.profileImage;

    await personal.save();

    return personal;
  };

export const updateExperienceSlug =
  async (token, slug) => {
    await ensureExperienceSlugIndexes();

    if (
      typeof slug !== "string" ||
      !slug.trim()
    ) {
      throw createError(
        "Slug is required",
        400
      );
    }

    const experience =
      await Experience.findOne({
        manageToken: token,
      });

    if (!experience) {
      throw createError(
        "Experience not found",
        404
      );
    }

    const formattedSlug =
      formatSlug(slug);

    if (!formattedSlug) {
      throw createError(
        "Invalid URL name",
        400
      );
    }

    experience.slug =
      formattedSlug;

    try {
      await experience.save();
    } catch (error) {
      if (error?.code === 11000) {
        throw createError(
          "Unable to save this custom link. Please try again.",
          409
        );
      }

      throw error;
    }

    return experience;
  };

export const updateExperienceAccessDate =
  async (token, accessDate) => {
    const experience =
      await Experience.findOne({
        manageToken: token,
      }).select("+accessDate");

    if (!experience) {
      throw createError(
        "Experience not found",
        404
      );
    }

    const normalizedDate =
      normalizeAccessDate(
        accessDate
      );

    experience.accessDate =
      normalizedDate;

    await experience.save();

    return {
      enabled:
        Boolean(experience.accessDate),
      accessDate:
        experience.accessDate,
    };
  };

export const checkSlugAvailability =
  async (slug) => {
    await ensureExperienceSlugIndexes();

    if (
      typeof slug !== "string" ||
      !slug.trim()
    ) {
      return false;
    }

    return Boolean(formatSlug(slug));
  };

export const updatePersonalInfo =
  async (token, data) => {
    return updatePersonalExperience(
      token,
      data
    );
  };

export const requestMediaUploadAccess =
  async (token, data = {}) => {
    await ensureMediaRequestIndexes();

    const experience =
      await Experience.findOne({
        manageToken: token,
      });

    if (!experience) {
      throw createError(
        "Experience not found",
        404
      );
    }

    const mediaType =
      String(data.mediaType || "")
        .trim()
        .toLowerCase();

    if (
      !MEDIA_TYPES.includes(mediaType)
    ) {
      throw createError(
        "Invalid media type. Use image, audio, or video.",
        400
      );
    }

    const requesterName =
      normalizeRequestText(
        data.requesterName,
        "Name",
        120,
        true
      );

    const requesterPhone =
      normalizeRequestText(
        data.requesterPhone,
        "Phone number",
        40,
        true
      );

    const message =
      normalizeRequestText(
        data.message,
        "Message",
        1000,
        false
      );

    const requestedExtraLimit =
      normalizeExtraLimit(
        data.requestedExtraLimit,
        1
      );

    const request =
      await ExperienceMediaRequest.create(
        {
          experience:
            experience._id,
          mediaType,
          requesterName,
          requesterPhone,
          message,
          status: "pending",
          requestedExtraLimit,
          approvedExtraLimit: 0,
          approvedVideoLimit: 0,
          adminNote: "",
          reviewedBy: null,
          reviewedAt: null,
          requestedAt: new Date(),
        }
      );

    return {
      requestId: request._id,
      mediaType:
        request.mediaType,
      status:
        request.status,
      requestedExtraLimit:
        request.requestedExtraLimit,
      approvedExtraLimit:
        request.approvedExtraLimit,
      requesterName:
        request.requesterName,
      requesterPhone:
        request.requesterPhone,
      message: request.message,
      requestedAt:
        request.requestedAt,
    };
  };

export const requestVideoUploadAccess =
  async (token, data = {}) => {
    return requestMediaUploadAccess(
      token,
      {
        ...data,
        mediaType: "video",
        requestedExtraLimit:
          data.requestedExtraLimit ??
          data.approvedVideoLimit ??
          1,
      }
    );
  };

export const getAllMediaUploadRequests =
  async () => {
    await ensureMediaRequestIndexes();

    return ExperienceMediaRequest.find()
      .populate({
        path: "experience",
        select:
          "serialNumber slug status owner order",
        populate: [
          {
            path: "owner",
            select:
              "email phone firstName lastName",
          },
          {
            path: "order",
            select:
              "orderNumber shippingAddress",
          },
        ],
      })
      .populate(
        "reviewedBy",
        "email phone firstName lastName"
      )
      .sort({
        status: 1,
        requestedAt: -1,
        createdAt: -1,
      });
  };

export const getAllVideoUploadRequests =
  async () => {
    return getAllMediaUploadRequests();
  };

export const updateMediaUploadRequest =
  async (
    requestId,
    data = {},
    adminUserId = null
  ) => {
    await ensureMediaRequestIndexes();

    const request =
      await ExperienceMediaRequest.findById(
        requestId
      );

    if (!request) {
      throw createError(
        "Media upload request not found",
        404
      );
    }

    const status =
      String(data.status || "")
        .trim()
        .toLowerCase();

    if (
      ![
        "approved",
        "rejected",
        "pending",
      ].includes(status)
    ) {
      throw createError(
        "Invalid media request status",
        400
      );
    }

    request.status = status;

    request.adminNote =
      normalizeRequestText(
        data.adminNote,
        "Admin note",
        1000,
        false
      );

    if (status === "approved") {
      const approvedExtraLimit =
        normalizeExtraLimit(
          data.approvedExtraLimit ??
            data.requestedExtraLimit ??
            data.approvedVideoLimit ??
            request.requestedExtraLimit,
          1
        );

      request.approvedExtraLimit =
        approvedExtraLimit;

      request.approvedVideoLimit =
        request.mediaType === "video"
          ? approvedExtraLimit
          : 0;

      request.reviewedAt =
        new Date();
    } else if (
      status === "rejected"
    ) {
      request.approvedExtraLimit =
        0;

      request.approvedVideoLimit =
        0;

      request.reviewedAt =
        new Date();
    } else {
      request.approvedExtraLimit =
        0;

      request.approvedVideoLimit =
        0;

      request.reviewedAt = null;
    }

    if (adminUserId) {
      request.reviewedBy =
        adminUserId;
    }

    await request.save();

    return ExperienceMediaRequest.findById(
      request._id
    )
      .populate({
        path: "experience",
        select:
          "serialNumber slug status owner order",
        populate: [
          {
            path: "owner",
            select:
              "email phone firstName lastName",
          },
          {
            path: "order",
            select:
              "orderNumber shippingAddress",
          },
        ],
      })
      .populate(
        "reviewedBy",
        "email phone firstName lastName"
      );
  };

export const updateVideoUploadRequest =
  async (
    requestId,
    data = {},
    adminUserId = null
  ) => {
    return updateMediaUploadRequest(
      requestId,
      {
        ...data,
        approvedExtraLimit:
          data.approvedExtraLimit ??
          data.approvedVideoLimit,
      },
      adminUserId
    );
  };

export const deleteMediaUploadRequest =
  async (requestId) => {
    await ensureMediaRequestIndexes();

    const request =
      await ExperienceMediaRequest.findByIdAndDelete(
        requestId
      );

    if (!request) {
      throw createError(
        "Media upload request not found",
        404
      );
    }

    return request;
  };

export const deleteVideoUploadRequest =
  async (requestId) => {
    return deleteMediaUploadRequest(
      requestId
    );
  };

export const uploadExperienceMedia =
  async (
    token,
    files,
    notes = []
  ) => {
    if (
      !files ||
      files.length === 0
    ) {
      throw createError(
        "No media uploaded",
        400
      );
    }

    const experience =
      await Experience.findOne({
        manageToken: token,
      });

    if (!experience) {
      throw createError(
        "Experience not found",
        404
      );
    }

    const typedFiles =
      files.map((file) => ({
        file,
        type:
          getFileMediaType(file),
      }));

    const normalizedNotes =
      Array.isArray(notes)
        ? notes
        : [notes];

    const getNoteForFile = (
      index
    ) => {
      const note = String(
        normalizedNotes[index] ?? ""
      ).trim();

      if (note.length > 1000) {
        throw createError(
          "Media note is too long. Maximum length is 1000 characters.",
          400
        );
      }

      return note;
    };

    const unsupported =
      typedFiles.find(
        (item) => !item.type
      );

    if (unsupported) {
      throw createError(
        "Only images, recorded audio, and approved video uploads are supported.",
        400
      );
    }

    const limits =
      await getExperienceMediaLimits();

    const requests =
      await getMediaRequests(
        experience._id
      );

    const approvedExtras =
      getApprovedExtraLimitsByType(
        requests
      );

    const countRows =
      await ExperienceMedia.aggregate(
        [
          {
            $match: {
              experience:
                experience._id,
            },
          },
          {
            $group: {
              _id: "$type",
              count: {
                $sum: 1,
              },
            },
          },
        ]
      );

    const existingCounts = {
      image: 0,
      video: 0,
      audio: 0,
    };

    countRows.forEach((row) => {
      if (
        Object.prototype.hasOwnProperty.call(
          existingCounts,
          row._id
        )
      ) {
        existingCounts[row._id] =
          Number(
            row.count || 0
          );
      }
    });

    const incomingCounts = {
      image: 0,
      video: 0,
      audio: 0,
    };

    typedFiles.forEach(
      ({ type }) => {
        incomingCounts[type] += 1;
      }
    );

    for (const type of MEDIA_TYPES) {
      const incoming =
        Number(
          incomingCounts[type] || 0
        );

      if (incoming === 0) {
        continue;
      }

      const limitKey =
        getLimitKey(type);

      const globalLimit =
        Number(
          limits[limitKey] || 0
        );

      const approvedExtra =
        Number(
          approvedExtras[type] || 0
        );

      const effectiveLimit =
        globalLimit +
        approvedExtra;

      const current =
        Number(
          existingCounts[type] || 0
        );

      if (
        current + incoming >
        effectiveLimit
      ) {
        throw createError(
          `${getMediaTypeLabel(
            type
          )} limit is ${effectiveLimit}. This experience already has ${current} and you selected ${incoming}.`,
          400
        );
      }
    }

    const totalCurrentMedia =
      Object.values(
        existingCounts
      ).reduce(
        (total, count) =>
          total +
          Number(count || 0),
        0
      );

    const documents =
      typedFiles.map(
        (
          { file, type },
          index
        ) => ({
          experience:
            experience._id,
          type,
          url: `/uploads/experience/${file.filename}`,
          fileName:
            file.originalname,
          fileSize:
            file.size,
          note:
            getNoteForFile(index),
          sortOrder:
            totalCurrentMedia +
            index,
        })
      );

    return ExperienceMedia.insertMany(
      documents
    );
  };

export const getExperienceMedia =
  async (experienceId) => {
    return ExperienceMedia.find({
      experience: experienceId,
      type: {
        $in: [
          "image",
          "video",
          "audio",
        ],
      },
    }).sort({
      sortOrder: 1,
      createdAt: 1,
    });
  };

export const deleteExperienceMedia =
  async (
    token,
    mediaId
  ) => {
    const experience =
      await Experience.findOne({
        manageToken: token,
      });

    if (!experience) {
      throw createError(
        "Experience not found",
        404
      );
    }

    const media =
      await ExperienceMedia.findOne({
        _id: mediaId,
        experience:
          experience._id,
      });

    if (!media) {
      throw createError(
        "Media not found",
        404
      );
    }

    await ExperienceMedia.findByIdAndDelete(
      media._id
    );

    if (media.url) {
      const relativePath =
        String(media.url).replace(
          /^\/+/,
          ""
        );

      const filePath =
        path.join(
          process.cwd(),
          relativePath
        );

      try {
        await fs.unlink(
          filePath
        );
      } catch (error) {
        if (
          error?.code !== "ENOENT"
        ) {
          console.error(
            "Unable to remove media file:",
            error
          );
        }
      }
    }

    return media;
  };

export const updateExperienceMediaNote =
  async (
    token,
    mediaId,
    note
  ) => {
    const experience =
      await Experience.findOne({
        manageToken: token,
      });

    if (!experience) {
      throw createError(
        "Experience not found",
        404
      );
    }

    const media =
      await ExperienceMedia.findOne({
        _id: mediaId,
        experience:
          experience._id,
      });

    if (!media) {
      throw createError(
        "Media not found",
        404
      );
    }

    const normalizedNote =
      String(note ?? "").trim();

    if (
      normalizedNote.length >
      1000
    ) {
      throw createError(
        "Media note is too long. Maximum length is 1000 characters.",
        400
      );
    }

    media.note =
      normalizedNote;

    await media.save();

    return media;
  };

export const replaceExperienceMedia =
  async (
    token,
    mediaId,
    file
  ) => {
    if (!file) {
      throw createError(
        "No replacement media uploaded",
        400
      );
    }

    const experience =
      await Experience.findOne({
        manageToken: token,
      });

    if (!experience) {
      throw createError(
        "Experience not found",
        404
      );
    }

    const media =
      await ExperienceMedia.findOne({
        _id: mediaId,
        experience:
          experience._id,
      });

    if (!media) {
      throw createError(
        "Media not found",
        404
      );
    }

    const newType =
      getFileMediaType(file);

    if (!newType) {
      throw createError(
        "Unsupported replacement media type",
        400
      );
    }

    if (
      newType !== media.type
    ) {
      throw createError(
        `You can only replace this ${getMediaTypeLabel(
          media.type
        ).toLowerCase()} with another ${getMediaTypeLabel(
          media.type
        ).toLowerCase()}.`,
        400
      );
    }

    const newUrl =
      `/uploads/experience/${file.filename}`;

    const oldUrl =
      media.url;

    media.url = newUrl;
    media.fileName =
      file.originalname;
    media.fileSize =
      file.size;

    await media.save();

    if (oldUrl) {
      const relativePath =
        String(oldUrl).replace(
          /^\/+/,
          ""
        );

      const oldFilePath =
        path.join(
          process.cwd(),
          relativePath
        );

      try {
        await fs.unlink(
          oldFilePath
        );
      } catch (error) {
        if (
          error?.code !== "ENOENT"
        ) {
          console.error(
            "Unable to remove old media file:",
            error
          );
        }
      }
    }

    return media;
  };