import api from "../../../lib/axios";

export const getExperience = async (
  token,
) => {
  const {
    data,
  } = await api.get(
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
  const {
    data,
  } = await api.put(
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

  files.forEach(
    (
      file,
    ) => {
      formData.append(
        "files",
        file,
      );
    },
  );

  const {
    data,
  } = await api.post(
    `/experience/manage/${encodeURIComponent(
      token,
    )}/media`,
    formData,
  );

  return data.data;
};

/*
 * Kept for admin/manufacturing only.
 * Customer Manage Experience does not
 * display custom-link editing anymore.
 */
export const updateSlug = async (
  token,
  slug,
) => {
  const {
    data,
  } = await api.put(
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
  const {
    data,
  } = await api.put(
    `/experience/manage/${encodeURIComponent(
      token,
    )}/access-date`,
    {
      accessDate,
    },
  );

  return data.data;
};

export const requestVideoUpload = async (
  token,
  requestData,
) => {
  const {
    data,
  } = await api.post(
    `/experience/manage/${encodeURIComponent(
      token,
    )}/video-request`,
    requestData,
  );

  return data.data;
};

export const checkSlug = async (
  slug,
) => {
  const {
    data,
  } = await api.get(
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
  const {
    data,
  } = await api.get(
    `/experience/public/${encodeURIComponent(
      serialNumber,
    )}/${encodeURIComponent(
      slug,
    )}`,
  );

  return data;
};

export const unlockPublicExperience = async (
  serialNumber,
  slug,
  accessDate,
) => {
  const {
    data,
  } = await api.post(
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
  const {
    data,
  } = await api.get(
    `/experience/customer/${encodeURIComponent(
      serialNumber,
    )}/${encodeURIComponent(
      slug,
    )}`,
  );

  return data;
};

export const getExperienceMediaLimits =
  async () => {
    const {
      data,
    } = await api.get(
      "/experience/media-limits",
    );

    return data.data;
  };

export const updateExperienceMediaLimits =
  async (
    limits,
  ) => {
    const {
      data,
    } = await api.put(
      "/experience/admin/media-limits",
      limits,
    );

    return data.data;
  };

export const getAdminVideoUploadRequests =
  async () => {
    const {
      data,
    } = await api.get(
      "/experience/admin/video-requests",
    );

    return Array.isArray(
      data.data,
    )
      ? data.data
      : [];
  };

export const updateAdminVideoUploadRequest =
  async (
    requestId,
    payload,
  ) => {
    const {
      data,
    } = await api.patch(
      `/experience/admin/video-requests/${encodeURIComponent(
        requestId,
      )}`,
      payload,
    );

    return data.data;
  };