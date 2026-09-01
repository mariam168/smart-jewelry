import api from "../../../lib/axios";

export const getAdminUsers =
  async () => {
    const response =
      await api.get(
        "/auth/admin/users",
      );

    return (
      response.data?.data
        ?.users || []
    );
  };

export const updateAdminUserRole =
  async (
    userId,
    role,
  ) => {
    const response =
      await api.patch(
        `/auth/admin/users/${encodeURIComponent(
          userId,
        )}/role`,
        {
          role,
        },
      );

    return response.data;
  };