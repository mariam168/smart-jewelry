import crypto from "crypto";

import Product from "../../catalog/models/Product.js";
import SmartUnit from "../../catalog/models/SmartUnit.js";
import SmartUnitInstance from "../../catalog/models/SmartUnitInstance.js";

import Experience from "../models/Experience.js";
import ExperiencePersonal from "../models/ExperiencePersonal.js";
import ExperienceMedia from "../models/ExperienceMedia.js";

import {
  generateManageToken,
} from "../utils/tokenGenerator.js";

const createError = (
  message,
  statusCode = 400,
) => {
  const error = new Error(message);

  error.statusCode = statusCode;

  return error;
};

const formatSlug = (
  slug,
) => {
  if (
    typeof slug !== "string" ||
    !slug.trim()
  ) {
    return null;
  }

  return slug
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(
      /[^a-z0-9\u0600-\u06FF-]/g,
      "",
    )
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
};

const normalizeAccessDate = (
  value,
) => {
  if (
    typeof value !== "string" ||
    !value.trim()
  ) {
    return "";
  }

  const normalized =
    value.trim();

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(
      normalized,
    )
  ) {
    throw createError(
      "Date must use YYYY-MM-DD format",
      400,
    );
  }

  const [
    year,
    month,
    day,
  ] =
    normalized
      .split("-")
      .map(Number);

  const date = new Date(
    Date.UTC(
      year,
      month - 1,
      day,
    ),
  );

  if (
    date.getUTCFullYear() !==
      year ||
    date.getUTCMonth() !==
      month - 1 ||
    date.getUTCDate() !==
      day
  ) {
    throw createError(
      "Invalid access date",
      400,
    );
  }

  return normalized;
};

let slugIndexesPromise =
  null;

const ensureExperienceSlugIndexes =
  async () => {
    if (
      slugIndexesPromise
    ) {
      return slugIndexesPromise;
    }

    slugIndexesPromise =
      (async () => {
        let indexes = [];

        try {
          indexes =
            await Experience.collection.indexes();
        } catch (error) {
          if (
            error?.code !== 26 &&
            error?.codeName !==
              "NamespaceNotFound"
          ) {
            throw error;
          }
        }

        for (
          const index of indexes
        ) {
          const keys =
            Object.keys(
              index.key || {},
            );

          const isStandaloneSlugIndex =
            keys.length === 1 &&
            keys[0] === "slug";

          if (
            isStandaloneSlugIndex
          ) {
            try {
              await Experience.collection.dropIndex(
                index.name,
              );
            } catch (error) {
              if (
                error?.code !== 27 &&
                error?.codeName !==
                  "IndexNotFound"
              ) {
                throw error;
              }
            }
          }
        }

        try {
          indexes =
            await Experience.collection.indexes();
        } catch (error) {
          if (
            error?.code !== 26 &&
            error?.codeName !==
              "NamespaceNotFound"
          ) {
            throw error;
          }

          indexes = [];
        }

        const compoundIndex =
          indexes.find(
            (index) => {
              const keys =
                Object.keys(
                  index.key ||
                    {},
                );

              return (
                keys.length ===
                  2 &&
                keys[0] ===
                  "serialNumber" &&
                keys[1] ===
                  "slug" &&
                Number(
                  index.key
                    .serialNumber,
                ) === 1 &&
                Number(
                  index.key.slug,
                ) === 1
              );
            },
          );

        if (
          compoundIndex &&
          !compoundIndex.unique
        ) {
          try {
            await Experience.collection.dropIndex(
              compoundIndex.name,
            );
          } catch (error) {
            if (
              error?.code !== 27 &&
              error?.codeName !==
                "IndexNotFound"
            ) {
              throw error;
            }
          }
        }

        if (
          !compoundIndex ||
          !compoundIndex.unique
        ) {
          await Experience.collection.createIndex(
            {
              serialNumber: 1,
              slug: 1,
            },
            {
              unique: true,
              name:
                "serialNumber_1_slug_1",
            },
          );
        }
      })().catch(
        (error) => {
          slugIndexesPromise =
            null;

          throw error;
        },
      );

    return slugIndexesPromise;
  };

const buildExperienceUrl = (
  experience,
) => {
  if (
    !experience?.serialNumber ||
    !experience?.slug
  ) {
    return null;
  }

  const clientUrl =
    (
      process.env.CLIENT_URL ||
      "http://localhost:5173"
    ).replace(
      /\/+$/,
      "",
    );

  const serialNumber =
    String(
      experience.serialNumber,
    )
      .trim()
      .toUpperCase();

  const slug =
    String(
      experience.slug,
    )
      .trim()
      .toLowerCase();

  return `${clientUrl}/experience/public/${encodeURIComponent(
    serialNumber,
  )}/${encodeURIComponent(
    slug,
  )}`;
};

const sanitizePublicExperience = (
  experience,
) => {
  const data =
    typeof experience?.toObject ===
    "function"
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

  return data;
};

const loadPublicExperienceDocument =
  async (
    serialNumber,
    slug,
    extraQuery = {},
  ) => {
    if (
      typeof serialNumber !==
        "string" ||
      !serialNumber.trim()
    ) {
      throw createError(
        "Serial number is required",
        400,
      );
    }

    const formattedSerial =
      serialNumber
        .trim()
        .toUpperCase();

    const formattedSlug =
      formatSlug(
        slug,
      );

    if (!formattedSlug) {
      throw createError(
        "Invalid URL name",
        400,
      );
    }

    const experience =
      await Experience.findOne({
        serialNumber:
          formattedSerial,

        slug:
          formattedSlug,

        ...extraQuery,
      })
        .select(
          "+accessDate",
        )
        .populate(
          "product",
          "name description price primaryImage image images",
        )
        .populate(
          "smartUnit",
          "name description image firmwareVersion manufacturer status",
        );

    if (!experience) {
      throw createError(
        "Experience not found",
        404,
      );
    }

    if (
      experience.status ===
      "expired"
    ) {
      throw createError(
        "This experience has expired",
        404,
      );
    }

    return experience;
  };

const buildPublicExperiencePayload =
  async (
    experience,
  ) => {
    experience.visits =
      Number(
        experience.visits ||
          0,
      ) + 1;

    await experience.save();

    const personal =
      await ExperiencePersonal.findOne(
        {
          experience:
            experience._id,
        },
      );

    const media =
      await getExperienceMedia(
        experience._id,
      );

    return {
      experience:
        sanitizePublicExperience(
          experience,
        ),

      personal,

      media,
    };
  };

export const createExperience =
  async (data) => {
    await ensureExperienceSlugIndexes();

    if (!data.order) {
      throw createError(
        "Order is required to create Experience",
        400,
      );
    }

    if (!data.orderItem) {
      throw createError(
        "Order item is required to create Experience",
        400,
      );
    }

    if (!data.product) {
      throw createError(
        "Product is required to create Experience",
        400,
      );
    }

    if (!data.smartUnit) {
      throw createError(
        "Smart Unit is required to create Experience",
        400,
      );
    }

    const product =
      await Product.findById(
        data.product,
      );

    if (!product) {
      throw createError(
        "Product not found",
        404,
      );
    }

    const smartUnit =
      await SmartUnit.findById(
        data.smartUnit,
      );

    if (!smartUnit) {
      throw createError(
        "Smart Unit not found",
        404,
      );
    }

    let smartUnitInstance =
      null;

    if (
      typeof data.serialNumber ===
        "string" &&
      data.serialNumber.trim()
    ) {
      const formattedSerial =
        data.serialNumber
          .trim()
          .toUpperCase();

      smartUnitInstance =
        await SmartUnitInstance.findOne(
          {
            smartUnit:
              data.smartUnit,

            serialNumber:
              formattedSerial,
          },
        );

      if (
        !smartUnitInstance
      ) {
        throw createError(
          "Smart Unit physical instance not found for this serial number",
          404,
        );
      }
    } else if (
      data.smartUnitInstance
    ) {
      smartUnitInstance =
        await SmartUnitInstance.findOne(
          {
            _id:
              data.smartUnitInstance,

            smartUnit:
              data.smartUnit,
          },
        );

      if (
        !smartUnitInstance
      ) {
        throw createError(
          "Smart Unit physical instance not found",
          404,
        );
      }
    } else {
      smartUnitInstance =
        await SmartUnitInstance.findOne(
          {
            smartUnit:
              data.smartUnit,

            status:
              "available",
          },
        ).sort({
          createdAt: 1,
        });

      if (
        !smartUnitInstance
      ) {
        throw createError(
          "No available physical Smart Unit instance found",
          400,
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

    if (
      existingExperience
    ) {
      throw createError(
        "This physical Smart Unit already has an Experience",
        400,
      );
    }

    const manageToken =
      generateManageToken();

    const publicToken =
      crypto
        .randomBytes(32)
        .toString("hex");

    const experienceData = {
      order:
        data.order,

      orderItem:
        data.orderItem,

      product:
        data.product,

      smartUnit:
        data.smartUnit,

      owner:
        data.owner ||
        null,

      serialNumber,

      manageToken,

      publicToken,

      type:
        data.type ||
        "personal",

      status:
        data.status ||
        "waiting",

      visits: 0,

      activatedAt:
        null,
    };

    if (
      typeof data.slug ===
        "string" &&
      data.slug.trim()
    ) {
      const formattedSlug =
        formatSlug(
          data.slug,
        );

      if (
        !formattedSlug
      ) {
        throw createError(
          "Invalid URL name",
          400,
        );
      }

      experienceData.slug =
        formattedSlug;
    }

    const experience =
      await Experience.create(
        experienceData,
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

      await ExperiencePersonal.create(
        {
          experience:
            experience._id,
        },
      );
    } catch (error) {
      await Experience.findByIdAndDelete(
        experience._id,
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
      experience._id,
    );
  };

export const getExperienceById =
  async (
    experienceId,
  ) => {
    const experience =
      await Experience.findById(
        experienceId,
      )
        .populate(
          "product",
        )
        .populate(
          "smartUnit",
        )
        .populate(
          "owner",
          "email",
        )
        .populate(
          "order",
        );

    if (!experience) {
      throw createError(
        "Experience not found",
        404,
      );
    }

    return experience;
  };

export const getExperienceByManageToken =
  async (
    token,
  ) => {
    const experience =
      await Experience.findOne({
        manageToken:
          token,
      })
        .select(
          "+accessDate",
        )
        .populate(
          "product",
        )
        .populate(
          "smartUnit",
        )
        .populate(
          "owner",
          "email",
        )
        .populate(
          "order",
        );

    if (!experience) {
      throw createError(
        "Experience not found",
        404,
      );
    }

    if (
      !experience.publicToken
    ) {
      experience.publicToken =
        crypto
          .randomBytes(32)
          .toString("hex");

      await experience.save();
    }

    const personal =
      await ExperiencePersonal.findOne(
        {
          experience:
            experience._id,
        },
      );

    const media =
      await getExperienceMedia(
        experience._id,
      );

    const publicUrl =
      buildExperienceUrl(
        experience,
      );

    return {
      experience,
      personal,
      media,
      publicUrl,
    };
  };

export const getPublicExperienceAccess =
  async (
    serialNumber,
    slug,
    extraQuery = {},
  ) => {
    const experience =
      await loadPublicExperienceDocument(
        serialNumber,
        slug,
        extraQuery,
      );

    if (
      experience.accessDate
    ) {
      return {
        requiresDate:
          true,

        data:
          null,
      };
    }

    const data =
      await buildPublicExperiencePayload(
        experience,
      );

    return {
      requiresDate:
        false,

      data,
    };
  };

export const unlockPublicExperience =
  async (
    serialNumber,
    slug,
    accessDate,
    extraQuery = {},
  ) => {
    const experience =
      await loadPublicExperienceDocument(
        serialNumber,
        slug,
        extraQuery,
      );

    if (
      !experience.accessDate
    ) {
      return buildPublicExperiencePayload(
        experience,
      );
    }

    const normalizedDate =
      normalizeAccessDate(
        accessDate,
      );

    if (
      normalizedDate !==
      experience.accessDate
    ) {
      throw createError(
        "The date you entered is incorrect.",
        403,
      );
    }

    return buildPublicExperiencePayload(
      experience,
    );
  };

export const getExperienceByPublicToken =
  async (
    token,
  ) => {
    const experience =
      await Experience.findOne({
        publicToken:
          token,
      })
        .select(
          "+accessDate",
        )
        .populate(
          "product",
          "name description price primaryImage image images",
        )
        .populate(
          "smartUnit",
          "name description image firmwareVersion manufacturer status",
        );

    if (!experience) {
      throw createError(
        "Experience not found",
        404,
      );
    }

    if (
      experience.status ===
      "expired"
    ) {
      throw createError(
        "This experience is no longer available",
        404,
      );
    }

    if (
      experience.accessDate
    ) {
      throw createError(
        "Date verification is required",
        403,
      );
    }

    return buildPublicExperiencePayload(
      experience,
    );
  };

export const getExperienceBySerialAndSlug =
  async (
    serialNumber,
    slug,
  ) => {
    const result =
      await getPublicExperienceAccess(
        serialNumber,
        slug,
      );

    if (
      result.requiresDate
    ) {
      throw createError(
        "Date verification is required",
        403,
      );
    }

    return result.data;
  };

export const getExperienceBySlug =
  async (
    slug,
  ) => {
    if (
      typeof slug !==
        "string" ||
      !slug.trim()
    ) {
      throw createError(
        "Slug is required",
        400,
      );
    }

    const formattedSlug =
      formatSlug(
        slug,
      );

    const experience =
      await Experience.findOne({
        slug:
          formattedSlug,
      })
        .select(
          "+accessDate",
        )
        .populate(
          "product",
          "name description price primaryImage image images",
        )
        .populate(
          "smartUnit",
          "name description image firmwareVersion manufacturer status",
        );

    if (!experience) {
      throw createError(
        "Experience not found",
        404,
      );
    }

    if (
      experience.status ===
      "expired"
    ) {
      throw createError(
        "This experience has expired",
        404,
      );
    }

    if (
      experience.accessDate
    ) {
      throw createError(
        "Date verification is required",
        403,
      );
    }

    return buildPublicExperiencePayload(
      experience,
    );
  };

export const updatePersonalExperience =
  async (
    token,
    body,
  ) => {
    const experience =
      await Experience.findOne({
        manageToken:
          token,
      });

    if (!experience) {
      throw createError(
        "Experience not found",
        404,
      );
    }

    let personal =
      await ExperiencePersonal.findOne(
        {
          experience:
            experience._id,
        },
      );

    if (!personal) {
      personal =
        await ExperiencePersonal.create(
          {
            experience:
              experience._id,
          },
        );
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
  async (
    token,
    slug,
  ) => {
    await ensureExperienceSlugIndexes();

    if (
      typeof slug !==
        "string" ||
      !slug.trim()
    ) {
      throw createError(
        "Slug is required",
        400,
      );
    }

    const experience =
      await Experience.findOne({
        manageToken:
          token,
      });

    if (!experience) {
      throw createError(
        "Experience not found",
        404,
      );
    }

    const formattedSlug =
      formatSlug(
        slug,
      );

    if (
      !formattedSlug
    ) {
      throw createError(
        "Invalid URL name",
        400,
      );
    }

    experience.slug =
      formattedSlug;

    try {
      await experience.save();
    } catch (error) {
      if (
        error?.code ===
        11000
      ) {
        throw createError(
          "Unable to save this custom link. Please try again.",
          409,
        );
      }

      throw error;
    }

    return experience;
  };

export const updateExperienceAccessDate =
  async (
    token,
    accessDate,
  ) => {
    const experience =
      await Experience.findOne({
        manageToken:
          token,
      }).select(
        "+accessDate",
      );

    if (!experience) {
      throw createError(
        "Experience not found",
        404,
      );
    }

    const normalizedDate =
      normalizeAccessDate(
        accessDate,
      );

    experience.accessDate =
      normalizedDate;

    await experience.save();

    return {
      enabled:
        Boolean(
          experience.accessDate,
        ),

      accessDate:
        experience.accessDate,
    };
  };

export const checkSlugAvailability =
  async (
    slug,
  ) => {
    await ensureExperienceSlugIndexes();

    if (
      typeof slug !==
        "string" ||
      !slug.trim()
    ) {
      return false;
    }

    const formattedSlug =
      formatSlug(
        slug,
      );

    return Boolean(
      formattedSlug,
    );
  };

export const updatePersonalInfo =
  async (
    token,
    data,
  ) => {
    return updatePersonalExperience(
      token,
      data,
    );
  };

export const uploadExperienceMedia =
  async (
    token,
    files,
  ) => {
    if (
      !files ||
      files.length === 0
    ) {
      throw createError(
        "No files uploaded",
        400,
      );
    }

    const experience =
      await Experience.findOne({
        manageToken:
          token,
      });

    if (!experience) {
      throw createError(
        "Experience not found",
        404,
      );
    }

    const media = [];

    for (
      const file of files
    ) {
      let type =
        "file";

      if (
        file.mimetype?.startsWith(
          "image/",
        )
      ) {
        type =
          "image";
      } else if (
        file.mimetype?.startsWith(
          "video/",
        )
      ) {
        type =
          "video";
      } else if (
        file.mimetype?.startsWith(
          "audio/",
        )
      ) {
        type =
          "audio";
      }

      const item =
        await ExperienceMedia.create(
          {
            experience:
              experience._id,

            type,

            url:
              `/uploads/experience/${file.filename}`,

            fileName:
              file.originalname,

            fileSize:
              file.size,

            sortOrder:
              0,
          },
        );

      media.push(
        item,
      );
    }

    return media;
  };

export const getExperienceMedia =
  async (
    experienceId,
  ) => {
    return ExperienceMedia.find({
      experience:
        experienceId,
    }).sort({
      sortOrder: 1,
      createdAt: 1,
    });
  };

export const deleteExperienceMedia =
  async (
    mediaId,
  ) => {
    const media =
      await ExperienceMedia.findByIdAndDelete(
        mediaId,
      );

    if (!media) {
      throw createError(
        "Media not found",
        404,
      );
    }

    return media;
  };