import User from "../models/User.js";
import Customer from "../models/Customer.js";
import Role from "../models/Role.js";

import "../models/Permission.js";

import { hashPassword, comparePassword } from "../utils/password.js";

import { generateRandomToken, hashToken } from "../utils/token.js";

import { generateAccessToken } from "../utils/jwt.js";

export const registerCustomer = async ({
  firstName,
  lastName,
  email,
  password,
  phone,
  privacyConsent,
  marketingConsent,
}) => {
  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await User.findOne({
    email: normalizedEmail,
  });

  if (existingUser) {
    const error = new Error("An account with this email already exists");

    error.statusCode = 409;

    throw error;
  }

  const customerRole = await Role.findOne({
    name: "customer",
  });

  if (!customerRole) {
    const error = new Error("Customer role was not found");

    error.statusCode = 500;

    throw error;
  }

  const passwordHash = await hashPassword(password);

  const verificationToken = generateRandomToken();

  const verificationTokenHash = hashToken(verificationToken);

  const verificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const user = await User.create({
    email: normalizedEmail,
    passwordHash,
    role: customerRole._id,
    emailVerificationTokenHash: verificationTokenHash,
    emailVerificationExpiresAt: verificationExpiresAt,
  });

  try {
    const customer = await Customer.create({
      user: user._id,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone?.trim() || "",
      privacyConsent,
      marketingConsent: marketingConsent || false,
    });

    return {
      user,
      customer,

      verificationToken,
    };
  } catch (error) {
    await User.findByIdAndDelete(user._id);

    throw error;
  }
};

export const verifyEmail = async (token) => {
  if (!token) {
    const error = new Error("Verification token is required");

    error.statusCode = 400;

    throw error;
  }

  const tokenHash = hashToken(token);

  const user = await User.findOne({
    emailVerificationTokenHash: tokenHash,
    emailVerificationExpiresAt: {
      $gt: new Date(),
    },
  });

  if (!user) {
    const error = new Error("Invalid or expired verification token");

    error.statusCode = 400;

    throw error;
  }

  user.emailVerifiedAt = new Date();

  user.emailVerificationTokenHash = null;

  user.emailVerificationExpiresAt = null;

  await user.save();

  return user;
};

export const loginUser = async ({ email, password }) => {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await User.findOne({
    email: normalizedEmail,
  }).populate({
    path: "role",
    populate: {
      path: "permissions",
      model: "Permission",
    },
  });

  if (!user) {
    const error = new Error("Invalid email or password");

    error.statusCode = 401;

    throw error;
  }

  if (!user.isActive) {
    const error = new Error("Your account has been deactivated");

    error.statusCode = 403;

    throw error;
  }

  const isPasswordValid = await comparePassword(password, user.passwordHash);

  if (!isPasswordValid) {
    const error = new Error("Invalid email or password");

    error.statusCode = 401;

    throw error;
  }

  user.lastLoginAt = new Date();

  await user.save();

  const accessToken = generateAccessToken({
    userId: user._id.toString(),
    role: user.role.name,
  });

  return {
    user,
    accessToken,
  };
};

export const getCurrentUser = async (userId) => {
  const user = await User.findById(userId)
    .populate({
      path: "role",
      populate: {
        path: "permissions",
        model: "Permission",
      },
    })
    .select(
      "-passwordHash -emailVerificationTokenHash -emailVerificationExpiresAt",
    );

  if (!user) {
    const error = new Error("User not found");

    error.statusCode = 404;

    throw error;
  }

  const customer = await Customer.findOne({
    user: user._id,
  });

  return {
    user,
    customer,
  };
};
