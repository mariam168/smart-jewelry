import api from "../../../lib/axios";

export const getExperience = async (token) => {
  const { data } = await api.get(
    `/experience/manage/${encodeURIComponent(token)}`,
  );

  return data.data;
};

export const updatePersonal = async (token, body) => {
  const { data } = await api.put(
    `/experience/manage/${encodeURIComponent(token)}/personal`,
    body,
  );

  return data.data;
};

export const uploadMedia = async (token, files) => {
  const formData = new FormData();

  files.forEach((item) => {
    const file = item?.file || item;
    const note = item?.note || "";

    formData.append("files", file);
    formData.append("notes", note);
  });

  const { data } = await api.post(
    `/experience/manage/${encodeURIComponent(token)}/media`,
    formData,
  );

  return data.data;
};

export const updateSlug = async (token, slug) => {
  const { data } = await api.put(
    `/experience/manage/${encodeURIComponent(token)}/slug`,
    {
      slug,
    },
  );

  return data.data;
};

export const updatePublicSlug = updateSlug;

export const updateAccessDate = async (token, accessDate) => {
  const { data } = await api.put(
    `/experience/manage/${encodeURIComponent(token)}/access-date`,
    {
      accessDate,
    },
  );

  return data.data;
};

/*
|--------------------------------------------------------------------------
| Unified Media Allowance Requests
|--------------------------------------------------------------------------
*/

export const requestMediaAllowance = async (
  token,
  requestData,
) => {
  const { data } = await api.post(
    `/experience/manage/${encodeURIComponent(token)}/media-request`,
    requestData,
  );

  return data.data;
};

export const requestVideoUpload = async (
  token,
  requestData,
) => {
  return requestMediaAllowance(token, {
    mediaType: "video",
    ...requestData,
  });
};

/*
|--------------------------------------------------------------------------
| Public Experience
|--------------------------------------------------------------------------
*/

export const checkSlug = async (slug) => {
  const { data } = await api.get(
    `/experience/check-slug/${encodeURIComponent(slug)}`,
  );

  return data.available;
};

export const getPublicExperience = async (
  serialNumber,
  slug,
) => {
  const { data } = await api.get(
    `/experience/public/${encodeURIComponent(serialNumber)}/${encodeURIComponent(slug)}`,
  );

  return data;
};

export const unlockPublicExperience = async (
  serialNumber,
  slug,
  accessDate,
) => {
  const { data } = await api.post(
    `/experience/public/${encodeURIComponent(serialNumber)}/${encodeURIComponent(slug)}/unlock`,
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
  const { data } = await api.get(
    `/experience/customer/${encodeURIComponent(serialNumber)}/${encodeURIComponent(slug)}`,
  );

  return data;
};

/*
|--------------------------------------------------------------------------
| Media Limits
|--------------------------------------------------------------------------
*/

export const getExperienceMediaLimits = async () => {
  const { data } = await api.get(
    "/experience/media-limits",
  );

  return data.data;
};

export const updateExperienceMediaLimits = async (
  limits,
) => {
  const { data } = await api.put(
    "/experience/admin/media-limits",
    limits,
  );

  return data.data;
};

/*
|--------------------------------------------------------------------------
| Admin Unified Media Requests
|--------------------------------------------------------------------------
*/

export const getAdminMediaRequests = async () => {
  const { data } = await api.get(
    "/experience/admin/media-requests",
  );

  return Array.isArray(data.data) ? data.data : [];
};

export const updateAdminMediaRequest = async (
  requestId,
  payload,
) => {
  const { data } = await api.patch(
    `/experience/admin/media-requests/${encodeURIComponent(
      requestId,
    )}`,
    payload,
  );

  return data.data;
};

export const deleteAdminMediaRequest = async (
  requestId,
) => {
  const { data } = await api.delete(
    `/experience/admin/media-requests/${encodeURIComponent(
      requestId,
    )}`,
  );

  return data.data;
};

/*
|--------------------------------------------------------------------------
| Backward Compatibility
|--------------------------------------------------------------------------
*/

export const getAdminVideoUploadRequests =
  getAdminMediaRequests;

export const updateAdminVideoUploadRequest =
  updateAdminMediaRequest;

export const deleteAdminVideoUploadRequest =
  deleteAdminMediaRequest;

/*
|--------------------------------------------------------------------------
| Media Management
|--------------------------------------------------------------------------
*/

export const updateMediaNote = async (
  token,
  mediaId,
  note,
) => {
  const { data } = await api.put(
    `/experience/manage/${encodeURIComponent(
      token,
    )}/media/${encodeURIComponent(mediaId)}/note`,
    {
      note,
    },
  );

  return data.data;
};

export const deleteMedia = async (
  token,
  mediaId,
) => {
  const { data } = await api.delete(
    `/experience/manage/${encodeURIComponent(
      token,
    )}/media/${encodeURIComponent(mediaId)}`,
  );

  return data;
};

export const replaceMedia = async (
  token,
  mediaId,
  file,
) => {
  const formData = new FormData();

  formData.append("file", file);

  const { data } = await api.put(
    `/experience/manage/${encodeURIComponent(
      token,
    )}/media/${encodeURIComponent(mediaId)}`,
    formData,
  );

  return data.data;
};