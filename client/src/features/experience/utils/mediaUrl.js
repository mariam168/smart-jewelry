const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const getMediaUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  return `${API_URL}${url.startsWith("/") ? "" : "/"}${url}`;
};

export default getMediaUrl;
