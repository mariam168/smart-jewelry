import {
  getSmartUnitInstances,
} from "../services/smartUnitService.js";

export const getSmartUnitInstancesController =
  async (
    req,
    res,
    next
  ) => {
    try {
      const instances =
        await getSmartUnitInstances(
          req.params.smartUnitId
        );

      return res.json({
        success: true,

        data: {
          instances,
        },
      });
    } catch (error) {
      next(error);
    }
  };