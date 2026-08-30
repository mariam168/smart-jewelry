const getBackendOrigin = () => {
  const backendUrl =
    import.meta.env.VITE_BACKEND_URL;

  if (backendUrl) {
    return String(backendUrl).replace(
      /\/+$/,
      "",
    );
  }

  const apiUrl =
    import.meta.env.VITE_API_URL;

  if (
    apiUrl &&
    /^https?:\/\//i.test(apiUrl)
  ) {
    return String(apiUrl)
      .replace(/\/api\/?$/i, "")
      .replace(/\/+$/, "");
  }

  if (
    typeof window !== "undefined"
  ) {
    return window.location.origin;
  }

  return "";
};

const BACKEND_URL =
  getBackendOrigin();

export const getImageUrl = (
  value,
) => {
  if (!value) {
    return "";
  }

  let image =
    typeof value === "string"
      ? value.trim()
      : value.imageUrl ||
        value.url ||
        value.path ||
        value.image ||
        "";

  if (!image) {
    return "";
  }

  if (
    image.startsWith("blob:") ||
    image.startsWith("data:")
  ) {
    return image;
  }

  // Fix old localhost URLs already stored in database
  if (
    /^https?:\/\/localhost:5000/i.test(
      image,
    ) ||
    /^https?:\/\/127\.0\.0\.1:5000/i.test(
      image,
    )
  ) {
    image = image.replace(
      /^https?:\/\/(?:localhost|127\.0\.0\.1):5000/i,
      "",
    );
  } else if (
    /^https?:\/\//i.test(image)
  ) {
    return image;
  }

  // Prevent /api/uploads/... URLs
  if (
    image.startsWith(
      "/api/uploads/",
    )
  ) {
    image = image.replace(
      /^\/api/,
      "",
    );
  }

  if (
    !image.startsWith("/")
  ) {
    image = `/${image}`;
  }

  return `${BACKEND_URL}${image}`;
};

export default getImageUrl;