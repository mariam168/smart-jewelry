import mongoose from "mongoose";

import ShippingArea from "../models/ShippingArea.js";

const createError = (
  message,
  statusCode = 400,
) => {
  const error = new Error(message);

  error.statusCode = statusCode;

  return error;
};

const normalizeLocalizedField = (
  value,
) => {
  if (
    value &&
    typeof value === "object" &&
    !Array.isArray(value)
  ) {
    return {
      en: String(value.en || "").trim(),
      ar: String(value.ar || "").trim(),
    };
  }

  const fallback = String(
    value || "",
  ).trim();

  return {
    en: fallback,
    ar: fallback,
  };
};

const validateLocalizedName = (
  name,
) => {
  const normalized =
    normalizeLocalizedField(name);

  if (!normalized.en) {
    throw createError(
      "Shipping area name is required in English",
    );
  }

  if (!normalized.ar) {
    throw createError(
      "Shipping area name is required in Arabic",
    );
  }

  return normalized;
};

const escapeRegex = (value) => {
  return String(value).replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&",
  );
};

export const getPublicShippingAreas =
  async () => {
    return ShippingArea.find({
      isActive: true,
    })
      .sort({
        sortOrder: 1,
        "name.en": 1,
      })
      .lean();
  };

export const getAdminShippingAreas =
  async () => {
    return ShippingArea.find()
      .sort({
        sortOrder: 1,
        "name.en": 1,
      })
      .lean();
  };

export const createShippingArea =
  async ({
    name,
    shippingFee,
    isActive = true,
    sortOrder = 0,
  }) => {
    const cleanName =
      validateLocalizedName(name);

    const fee = Number(
      shippingFee,
    );

    if (
      !Number.isFinite(fee) ||
      fee < 0
    ) {
      throw createError(
        "Shipping fee must be a valid number",
      );
    }

    const existingEnglish =
      await ShippingArea.findOne({
        "name.en": {
          $regex: new RegExp(
            `^${escapeRegex(
              cleanName.en,
            )}$`,
            "i",
          ),
        },
      });

    if (existingEnglish) {
      throw createError(
        "This shipping area already exists in English",
        409,
      );
    }

    const existingArabic =
      await ShippingArea.findOne({
        "name.ar":
          cleanName.ar,
      });

    if (existingArabic) {
      throw createError(
        "This shipping area already exists in Arabic",
        409,
      );
    }

    return ShippingArea.create({
      name: cleanName,

      shippingFee: fee,

      isActive: Boolean(
        isActive,
      ),

      sortOrder:
        Number(sortOrder) || 0,
    });
  };

export const updateShippingArea =
  async (
    areaId,
    payload,
  ) => {
    if (
      !mongoose.Types.ObjectId.isValid(
        areaId,
      )
    ) {
      throw createError(
        "Invalid shipping area ID",
      );
    }

    const area =
      await ShippingArea.findById(
        areaId,
      );

    if (!area) {
      throw createError(
        "Shipping area not found",
        404,
      );
    }

    if (
      payload.name !== undefined
    ) {
      const cleanName =
        validateLocalizedName(
          payload.name,
        );

      const duplicateEnglish =
        await ShippingArea.findOne({
          _id: {
            $ne: area._id,
          },

          "name.en": {
            $regex: new RegExp(
              `^${escapeRegex(
                cleanName.en,
              )}$`,
              "i",
            ),
          },
        });

      if (duplicateEnglish) {
        throw createError(
          "This shipping area already exists in English",
          409,
        );
      }

      const duplicateArabic =
        await ShippingArea.findOne({
          _id: {
            $ne: area._id,
          },

          "name.ar":
            cleanName.ar,
        });

      if (duplicateArabic) {
        throw createError(
          "This shipping area already exists in Arabic",
          409,
        );
      }

      area.name =
        cleanName;
    }

    if (
      payload.shippingFee !==
      undefined
    ) {
      const fee = Number(
        payload.shippingFee,
      );

      if (
        !Number.isFinite(fee) ||
        fee < 0
      ) {
        throw createError(
          "Shipping fee must be a valid number",
        );
      }

      area.shippingFee = fee;
    }

    if (
      payload.isActive !==
      undefined
    ) {
      area.isActive =
        Boolean(
          payload.isActive,
        );
    }

    if (
      payload.sortOrder !==
      undefined
    ) {
      area.sortOrder =
        Number(
          payload.sortOrder,
        ) || 0;
    }

    await area.save();

    return area;
  };

export const deleteShippingArea =
  async (areaId) => {
    if (
      !mongoose.Types.ObjectId.isValid(
        areaId,
      )
    ) {
      throw createError(
        "Invalid shipping area ID",
      );
    }

    const area =
      await ShippingArea.findByIdAndDelete(
        areaId,
      );

    if (!area) {
      throw createError(
        "Shipping area not found",
        404,
      );
    }

    return area;
  };

export const getShippingAreaForOrder =
  async (areaId) => {
    if (
      !mongoose.Types.ObjectId.isValid(
        areaId,
      )
    ) {
      throw createError(
        "Please select a valid shipping area",
      );
    }

    const area =
      await ShippingArea.findOne({
        _id: areaId,
        isActive: true,
      });

    if (!area) {
      throw createError(
        "Shipping area is not available",
        404,
      );
    }

    return area;
  };