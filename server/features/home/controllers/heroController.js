import {
  getHeroSection,
  updateHeroSection,
} from "../services/homeService.js";

export const getHome = async (
  req,
  res,
  next,
) => {
  try {
    const hero = await getHeroSection();

    return res.status(200).json({
      success: true,

      data: {
        hero,
        featuredProducts: [],
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminHero = async (
  req,
  res,
  next,
) => {
  try {
    const hero = await getHeroSection();

    return res.status(200).json({
      success: true,
      data: hero,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAdminHero = async (
  req,
  res,
  next,
) => {
  try {
    const hero = await updateHeroSection(
      req.body,
    );

    return res.status(200).json({
      success: true,
      message: "Hero section updated successfully",
      data: hero,
    });
  } catch (error) {
    next(error);
  }
};