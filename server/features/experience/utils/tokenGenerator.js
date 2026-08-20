import crypto from "crypto";

export const generateManageToken = () => {
  return crypto.randomBytes(24).toString("hex");
};

export const generatePublicToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

export const generateSerialNumber = () => {
  const randomPart = crypto
    .randomBytes(5)
    .toString("base64url")
    .slice(0, 8)
    .toUpperCase();

  return `SU-${randomPart}`;
};

export const generateExperienceSlug = () => {
  const randomPart = crypto.randomBytes(8).toString("hex");

  return `experience-${Date.now()}-${randomPart}`;
};
