export const getBackendOrigin = () => {
  const explicitBackend =
    import.meta.env.VITE_BACKEND_URL;

  if (explicitBackend) {
    return String(
      explicitBackend,
    ).replace(/\/+$/, "");
  }

  const apiUrl =
    import.meta.env.VITE_API_URL;

  if (
    apiUrl &&
    /^https?:\/\//i.test(
      apiUrl,
    )
  ) {
    return String(
      apiUrl,
    )
      .replace(
        /\/api\/?$/i,
        "",
      )
      .replace(
        /\/+$/,
        "",
      );
  }

  if (
    typeof window !==
      "undefined" &&
    window.location.hostname !==
      "localhost" &&
    window.location.hostname !==
      "127.0.0.1"
  ) {
    return window.location.origin;
  }

  return "http://localhost:5000";
};

export const getFilePath = (
  value,
) => {
  if (!value) {
    return "";
  }

  if (
    typeof value === "string"
  ) {
    return value.trim();
  }

  if (
    Array.isArray(value)
  ) {
    for (const item of value) {
      const result =
        getFilePath(item);

      if (result) {
        return result;
      }
    }

    return "";
  }

  if (
    typeof value === "object"
  ) {
    return (
      getFilePath(
        value.imageUrl,
      ) ||
      getFilePath(
        value.url,
      ) ||
      getFilePath(
        value.path,
      ) ||
      getFilePath(
        value.src,
      ) ||
      getFilePath(
        value.image,
      ) ||
      getFilePath(
        value.file,
      ) ||
      getFilePath(
        value.secure_url,
      ) ||
      getFilePath(
        value.filename,
      ) ||
      ""
    );
  }

  return "";
};

export const getMediaUrl = (
  value,
) => {
  let url =
    getFilePath(value);

  if (!url) {
    return "";
  }

  if (
    url.startsWith(
      "http://",
    ) ||
    url.startsWith(
      "https://",
    ) ||
    url.startsWith(
      "blob:",
    ) ||
    url.startsWith(
      "data:",
    )
  ) {
    return url;
  }

  if (
    url.startsWith("//")
  ) {
    const protocol =
      typeof window !==
      "undefined"
        ? window.location.protocol
        : "https:";

    return `${protocol}${url}`;
  }

  if (
    url.startsWith(
      "/api/uploads/",
    )
  ) {
    url =
      url.replace(
        /^\/api/,
        "",
      );
  }

  if (
    url.startsWith(
      "/assets/",
    ) ||
    url.startsWith(
      "/images/",
    )
  ) {
    return url;
  }

  const backendUrl =
    getBackendOrigin();

  return `${backendUrl}${
    url.startsWith("/")
      ? ""
      : "/"
  }${url}`;
};

export default getMediaUrl;