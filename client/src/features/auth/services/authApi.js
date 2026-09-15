import api from "../../../lib/axios";

export const registerUser = async (data) => {
  const response = await api.post(
    "/auth/register",
    data
  );

  return response.data;
};

export const loginUser = async (data) => {
  const response = await api.post(
    "/auth/login",
    data
  );

  return {
    ...response.data,
    user: response.data?.data?.user,
  };
};

export const resendWhatsappOtp = async (data) => {
  const response = await api.post(
    "/auth/resend-otp",
    data
  );

  return response.data;
};

export const verifyWhatsappOtp = async (data) => {
  const response = await api.post(
    "/auth/verify-otp",
    data
  );

  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get(
    "/auth/me"
  );

  return response.data;
};

export const logoutUser = async () => {
  const response = await api.post(
    "/auth/logout"
  );

  return response.data;
};

export const requestPasswordReset = async (data) => {
  const response = await api.post(
    "/auth/forgot-password",
    data
  );

  return response.data;
};

export const verifyPasswordResetOtp = async (data) => {
  const response = await api.post(
    "/auth/forgot-password/verify-otp",
    data
  );

  return response.data;
};

export const resetPassword = async (data) => {
  const response = await api.post(
    "/auth/reset-password",
    data
  );

  return response.data;
};