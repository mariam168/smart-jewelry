import crypto from "crypto";

const getOtpSecret = () => {
  const secret =
    process.env.OTP_SECRET ||
    process.env.JWT_SECRET;

  if (!secret) {
    throw new Error(
      "OTP_SECRET or JWT_SECRET is not configured",
    );
  }

  return secret;
};

export const generateOtp = () => {
  return String(
    crypto.randomInt(
      100000,
      1000000,
    ),
  );
};

export const hashOtp = (
  phone,
  otp,
) => {
  return crypto
    .createHmac(
      "sha256",
      getOtpSecret(),
    )
    .update(
      `${phone}:${otp}`,
    )
    .digest("hex");
};

export const verifyOtpHash = (
  phone,
  otp,
  storedHash,
) => {
  if (!storedHash) {
    return false;
  }

  const calculated =
    hashOtp(
      phone,
      otp,
    );

  const first =
    Buffer.from(
      calculated,
      "hex",
    );

  const second =
    Buffer.from(
      storedHash,
      "hex",
    );

  if (
    first.length !==
    second.length
  ) {
    return false;
  }

  return crypto.timingSafeEqual(
    first,
    second,
  );
};