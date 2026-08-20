import api from "../../../lib/axios";

export const getHomeData = async () => {
  const response = await api.get(
    "/home"
  );

  return response.data;
};