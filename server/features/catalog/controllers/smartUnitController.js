import {
  createSmartUnit,
  getSmartUnits,
  getSmartUnitById,
  updateSmartUnit,
  deleteSmartUnit,
} from "../services/smartUnitService.js";

export const createSmartUnitController =
  async (
    req,
    res,
    next
  ) => {
    try {
      const smartUnit =
        await createSmartUnit(
          req.body
        );

      return res
        .status(201)
        .json({
          success: true,

          message:
            "Smart unit created successfully.",

          data: {
            smartUnit,
          },
        });
    } catch (error) {
      next(error);
    }
  };

export const getSmartUnitsController =
  async (
    req,
    res,
    next
  ) => {
    try {
      const smartUnits =
        await getSmartUnits();

      return res.json({
        success: true,

        data: {
          smartUnits,
        },
      });
    } catch (error) {
      next(error);
    }
  };

export const getSmartUnitController =
  async (
    req,
    res,
    next
  ) => {
    try {
      const smartUnit =
        await getSmartUnitById(
          req.params.id
        );

      if (!smartUnit) {
        return res
          .status(404)
          .json({
            success: false,

            message:
              "Smart unit not found.",
          });
      }

      return res.json({
        success: true,

        data: {
          smartUnit,
        },
      });
    } catch (error) {
      next(error);
    }
  };

export const updateSmartUnitController =
  async (
    req,
    res,
    next
  ) => {
    try {
      const smartUnit =
        await updateSmartUnit(
          req.params.id,
          req.body
        );

      if (!smartUnit) {
        return res
          .status(404)
          .json({
            success: false,

            message:
              "Smart unit not found.",
          });
      }

      return res.json({
        success: true,

        message:
          "Smart unit updated successfully.",

        data: {
          smartUnit,
        },
      });
    } catch (error) {
      next(error);
    }
  };

export const deleteSmartUnitController =
  async (
    req,
    res,
    next
  ) => {
    try {
      const smartUnit =
        await deleteSmartUnit(
          req.params.id
        );

      if (!smartUnit) {
        return res
          .status(404)
          .json({
            success: false,

            message:
              "Smart unit not found.",
          });
      }

      return res.json({
        success: true,

        message:
          "Smart unit deleted successfully.",
      });
    } catch (error) {
      next(error);
    }
  };