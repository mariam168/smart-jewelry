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

const normalizeName = (name) => {
  return String(name || "").trim();
};

export const getPublicShippingAreas =
  async () => {
    return ShippingArea.find({
      isActive: true,
    })
      .sort({
        sortOrder: 1,
        name: 1,
      })
      .lean();
  };

export const getAdminShippingAreas =
  async () => {
    return ShippingArea.find()
      .sort({
        sortOrder: 1,
        name: 1,
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
      normalizeName(name);

    if (!cleanName) {
      throw createError(
        "Shipping area name is required",
      );
    }

    const fee =
      Number(shippingFee);

    if (
      !Number.isFinite(fee) ||
      fee < 0
    ) {
      throw createError(
        "Shipping fee must be a valid number",
      );
    }

    const existing =
      await ShippingArea.findOne({
        name: {
          $regex: new RegExp(
            `^${cleanName.replace(
              /[.*+?^${}()|[\]\\]/g,
              "\\$&",
            )}$`,
            "i",
          ),
        },
      });

    if (existing) {
      throw createError(
        "This shipping area already exists",
        409,
      );
    }

    return ShippingArea.create({
      name: cleanName,
      shippingFee: fee,
      isActive:
        Boolean(isActive),
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
        normalizeName(
          payload.name,
        );

      if (!cleanName) {
        throw createError(
          "Shipping area name is required",
        );
      }

      const duplicate =
        await ShippingArea.findOne({
          _id: {
            $ne: area._id,
          },

          name: {
            $regex: new RegExp(
              `^${cleanName.replace(
                /[.*+?^${}()|[\]\\]/g,
                "\\$&",
              )}$`,
              "i",
            ),
          },
        });

      if (duplicate) {
        throw createError(
          "This shipping area already exists",
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
      const fee =
        Number(
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

      area.shippingFee =
        fee;
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
  async (
    areaId,
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
  async (
    areaId,
  ) => {
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