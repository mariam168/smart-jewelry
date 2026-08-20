import {
  getHomeData,
} from "../services/homeService.js";

export const getHome = async (
  req,
  res,
  next
) => {
  try {
    const data =
      await getHomeData();

    return res.status(200).json({
      success: true,
      data,
    });

  } catch (error) {
    next(error);
  }
};