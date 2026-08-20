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

  files.forEach((file) => {
    formData.append("files", file);
  });

  console.log("FILES TO UPLOAD:", files);

  for (const [key, value] of formData.entries()) {
    console.log("FORM DATA:", key, value);
  }

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

export const checkSlug = async (slug) => {
  const { data } = await api.get(
    `/experience/check-slug/${encodeURIComponent(slug)}`,
  );

  return data.available;
};

export const getPublicExperience = async (serialNumber, slug) => {
  const { data } = await api.get(
    `/experience/public/${encodeURIComponent(
      serialNumber,
    )}/${encodeURIComponent(slug)}`,
  );

  return data.experience;
};

export const getCustomerExperience = async (serialNumber, slug) => {
  const { data } = await api.get(
    `/experience/customer/${encodeURIComponent(
      serialNumber,
    )}/${encodeURIComponent(slug)}`,
  );

  return data.experience;
};

export const updatePublicSlug = async (token, slug) => {
  const { data } = await api.put(
    `/experience/manage/${encodeURIComponent(token)}/slug`,
    {
      slug,
    },
  );

  return data.data;
};
