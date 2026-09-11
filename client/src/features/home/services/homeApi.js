import api from "../../../lib/axios";

export const getHomeData = async () => {
  const response = await api.get(
    "/home",
  );

  return response.data;
};

export const getAdminHero = async () => {
  const response = await api.get(
    "/home/hero",
  );

  return response.data;
};

export const updateAdminHero = async (
  heroData,
) => {
  const response = await api.put(
    "/home/hero",
    heroData,
  );

  return response.data;
};