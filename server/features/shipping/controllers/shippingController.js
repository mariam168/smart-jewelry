import {
  getPublicShippingAreas,
  getAdminShippingAreas,
  createShippingArea,
  updateShippingArea,
  deleteShippingArea,
} from "../services/shippingService.js";

export const getShippingAreas =
  async (
    req,
    res,
    next,
  ) => {
    try {
      const areas =
        await getPublicShippingAreas();

      return res.status(200).json({
        success: true,
        data: {
          areas,
        },
      });
    } catch (error) {
      next(error);
    }
  };

export const getAdminAreas =
  async (
    req,
    res,
    next,
  ) => {
    try {
      const areas =
        await getAdminShippingAreas();

      return res.status(200).json({
        success: true,
        data: {
          areas,
        },
      });
    } catch (error) {
      next(error);
    }
  };

export const addShippingArea =
  async (
    req,
    res,
    next,
  ) => {
    try {
      const area =
        await createShippingArea(
          req.body,
        );

      return res.status(201).json({
        success: true,
        message:
          "Shipping area added successfully",
        data: {
          area,
        },
      });
    } catch (error) {
      next(error);
    }
  };

export const editShippingArea =
  async (
    req,
    res,
    next,
  ) => {
    try {
      const area =
        await updateShippingArea(
          req.params.id,
          req.body,
        );

      return res.status(200).json({
        success: true,
        message:
          "Shipping area updated successfully",
        data: {
          area,
        },
      });
    } catch (error) {
      next(error);
    }
  };

export const removeShippingArea =
  async (
    req,
    res,
    next,
  ) => {
    try {
      await deleteShippingArea(
        req.params.id,
      );

      return res.status(200).json({
        success: true,
        message:
          "Shipping area deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  };