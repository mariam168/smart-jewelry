import mongoose from "mongoose";

import User from "../models/User.js";
import Customer from "../models/Customer.js";
import Role from "../models/Role.js";

import "../models/Permission.js";

import { hashPassword, comparePassword } from "../utils/password.js";

import { generateRandomToken, hashToken } from "../utils/token.js";

import { generateAccessToken } from "../utils/jwt.js";

const createError = (message, statusCode = 400) => {
  const error = new Error(message);

  error.statusCode = statusCode;

  return error;
};

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
    throw createError("An account with this email already exists", 409);
  }

  const customerRole = await Role.findOne({
    name: "customer",
  });

  if (!customerRole) {
    throw createError("Customer role was not found", 500);
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
    throw createError("Verification token is required", 400);
  }

  const tokenHash = hashToken(token);

  const user = await User.findOne({
    emailVerificationTokenHash: tokenHash,

    emailVerificationExpiresAt: {
      $gt: new Date(),
    },
  });

  if (!user) {
    throw createError("Invalid or expired verification token", 400);
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
    throw createError("Invalid email or password", 401);
  }

  if (!user.isActive) {
    throw createError("Your account has been deactivated", 403);
  }

  const isPasswordValid = await comparePassword(password, user.passwordHash);

  if (!isPasswordValid) {
    throw createError("Invalid email or password", 401);
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
    throw createError("User not found", 404);
  }

  const customer = await Customer.findOne({
    user: user._id,
  });

  return {
    user,

    customer,
  };
};

export const getUsersForAdmin = async () => {
  const users = await User.find()
    .populate("role", "name description")
    .select(
      "-passwordHash -emailVerificationTokenHash -emailVerificationExpiresAt",
    )
    .sort({
      createdAt: -1,
    })
    .lean();

  const userIds = users.map((user) => user._id);

  const customers = await Customer.find({
    user: {
      $in: userIds,
    },
  })
    .select(
      "user firstName lastName phone status privacyConsent marketingConsent createdAt",
    )
    .lean();

  const customerMap = new Map();

  customers.forEach((customer) => {
    customerMap.set(
      String(customer.user),

      customer,
    );
  });

  return users.map((user) => {
    const customer = customerMap.get(String(user._id));

    return {
      _id: user._id,

      email: user.email,

      role: user.role || null,

      isActive: user.isActive,

      emailVerifiedAt: user.emailVerifiedAt,

      lastLoginAt: user.lastLoginAt,

      createdAt: user.createdAt,

      updatedAt: user.updatedAt,

      customer: customer || null,
    };
  });
};

export const changeUserRole = async ({ userId, roleName, adminUserId }) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw createError("Invalid user ID", 400);
  }

  const normalizedRole = String(roleName || "")
    .trim()
    .toLowerCase();

  if (!normalizedRole) {
    throw createError("Role is required", 400);
  }

  const allowedRoles = ["admin", "customer", "super_admin"];

  if (!allowedRoles.includes(normalizedRole)) {
    throw createError("Invalid role", 400);
  }

  const targetRole = await Role.findOne({
    name: normalizedRole,
  });

  if (!targetRole) {
    throw createError("Role not found", 404);
  }

  const user = await User.findById(userId).populate("role", "name");

  if (!user) {
    throw createError("User not found", 404);
  }

  const currentRole = user.role?.name;

  if (
    String(user._id) === String(adminUserId) &&
    currentRole !== normalizedRole
  ) {
    throw createError("You cannot change your own role.", 400);
  }

  if (currentRole === "admin" && normalizedRole !== "admin") {
    const adminRole = await Role.findOne({
      name: "admin",
    });

    if (!adminRole) {
      throw createError("Admin role not found", 500);
    }

    const activeAdminCount = await User.countDocuments({
      role: adminRole._id,

      isActive: true,
    });

    if (activeAdminCount <= 1) {
      throw createError(
        "You cannot remove the last active administrator.",
        400,
      );
    }
  }

  if (currentRole === normalizedRole) {
    return user;
  }

  user.role = targetRole._id;

  await user.save();

  return User.findById(user._id)
    .populate("role", "name description")
    .select(
      "-passwordHash -emailVerificationTokenHash -emailVerificationExpiresAt",
    );
};
