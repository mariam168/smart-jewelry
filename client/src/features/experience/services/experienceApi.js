import api from "../../../lib/axios";

export const getExperience = async (
  token,
) => {
  const { data } =
    await api.get(
      `/experience/manage/${encodeURIComponent(
        token,
      )}`,
    );

  return data.data;
};

export const updatePersonal = async (
  token,
  body,
) => {
  const { data } =
    await api.put(
      `/experience/manage/${encodeURIComponent(
        token,
      )}/personal`,
      body,
    );

  return data.data;
};

export const uploadMedia = async (
  token,
  files,
) => {
  const formData =
    new FormData();

  files.forEach((file) => {
    formData.append(
      "files",
      file,
    );
  });

  const { data } =
    await api.post(
      `/experience/manage/${encodeURIComponent(
        token,
      )}/media`,
      formData,
    );

  return data.data;
};

export const updateSlug = async (
  token,
  slug,
) => {
  const { data } =
    await api.put(
      `/experience/manage/${encodeURIComponent(
        token,
      )}/slug`,
      {
        slug,
      },
    );

  return data.data;
};

export const updatePublicSlug =
  updateSlug;

export const updateAccessDate = async (
  token,
  accessDate,
) => {
  const { data } =
    await api.put(
      `/experience/manage/${encodeURIComponent(
        token,
      )}/access-date`,
      {
        accessDate,
      },
    );

  return data.data;
};

export const checkSlug = async (
  slug,
) => {
  const { data } =
    await api.get(
      `/experience/check-slug/${encodeURIComponent(
        slug,
      )}`,
    );

  return data.available;
};

export const getPublicExperience = async (
  serialNumber,
  slug,
) => {
  const { data } =
    await api.get(
      `/experience/public/${encodeURIComponent(
        serialNumber,
      )}/${encodeURIComponent(
        slug,
      )}`,
    );

  return data;
};

export const unlockPublicExperience =
  async (
    serialNumber,
    slug,
    accessDate,
  ) => {
    const { data } =
      await api.post(
        `/experience/public/${encodeURIComponent(
          serialNumber,
        )}/${encodeURIComponent(
          slug,
        )}/unlock`,
        {
          accessDate,
        },
      );

    return data.data;
  };

export const getCustomerExperience = async (
  serialNumber,
  slug,
) => {
  const { data } =
    await api.get(
      `/experience/customer/${encodeURIComponent(
        serialNumber,
      )}/${encodeURIComponent(
        slug,
      )}`,
    );

  return data;
};