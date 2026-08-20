import jwt from "jsonwebtoken";

export const generateAccessToken = ({ userId, role }) => {
  return jwt.sign(
    {
      userId,
      role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    },
  );
};

export const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};
