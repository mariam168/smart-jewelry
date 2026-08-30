const getBackendOrigin = () => {
  const explicitBackend = import.meta.env.VITE_BACKEND_URL;

  if (explicitBackend) {
    return String(explicitBackend).replace(/\/+$/, "");
  }

  const apiUrl = import.meta.env.VITE_API_URL;

  if (apiUrl && /^https?:\/\//i.test(apiUrl)) {
    return String(apiUrl)
      .replace(/\/api\/?$/i, "")
      .replace(/\/+$/, "");
  }

  if (
    typeof window !== "undefined" &&
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1"
  ) {
    return window.location.origin;
  }

  return "http://localhost:5000";
};

const BACKEND_URL = getBackendOrigin();

export const getFilePath = (value) => {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value.trim();
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const path = getFilePath(item);

      if (path) {
        return path;
      }
    }

    return "";
  }

  if (typeof value === "object") {
    return (
      getFilePath(value.imageUrl) ||
      getFilePath(value.url) ||
      getFilePath(value.path) ||
      getFilePath(value.src) ||
      getFilePath(value.image) ||
      getFilePath(value.file) ||
      getFilePath(value.filename) ||
      ""
    );
  }

  return "";
};

export const getImageUrl = (value) => {
  let image = getFilePath(value);

  if (!image) {
    return "";
  }

  if (
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("blob:") ||
    image.startsWith("data:")
  ) {
    return image;
  }

  if (image.startsWith("//")) {
    return `${window.location.protocol}${image}`;
  }

  if (image.startsWith("/api/uploads/")) {
    image = image.replace(/^\/api/, "");
  }

  if (
    image.startsWith("/assets/") ||
    image.startsWith("/images/")
  ) {
    return image;
  }

  return `${BACKEND_URL}${image.startsWith("/") ? "" : "/"}${image}`;
};

export const getCartItemImage = (item) => {
  const product = item?.product || {};
  const variant = item?.variant || {};

  const candidates = [
    item?.image,
    item?.imageUrl,
    item?.productImage,
    item?.productImageUrl,

    variant?.image,
    variant?.imageUrl,
    variant?.primaryImage,
    variant?.images?.[0],
    variant?.images,

    product?.primaryImage,
    product?.image,
    product?.imageUrl,
    product?.images?.[0],
    product?.images,

    item?.productSnapshot?.primaryImage,
    item?.productSnapshot?.image,
    item?.productSnapshot?.imageUrl,

    item?.variantSnapshot?.image,
    item?.variantSnapshot?.imageUrl,
  ];

  for (const candidate of candidates) {
    const path = getFilePath(candidate);

    if (path) {
      return path;
    }
  }

  return "";
};