import mongoose from "mongoose";

import User from "../models/User.js";
import Customer from "../models/Customer.js";

import Role from "../models/Role.js";

import "../models/Permission.js";

import { hashPassword, comparePassword } from "../utils/password.js";

import { generateRandomToken, hashToken } from "../utils/token.js";

import { generateAccessToken } from "../utils/jwt.js";

import normalizePhone from "../utils/normalizePhone.js";

import { generateOtp, hashOtp, verifyOtpHash } from "../utils/otp.js";

import { sendWhatsAppOtp } from "../../whatsapp/services/whatsappService.js";

const createError = (message, statusCode = 400) => {
  const error = new Error(message);

  error.statusCode = statusCode;

  return error;
};

export const registerCustomer = async ({
  firstName,
  lastName,
  password,
  phone,
  marketingConsent,
}) => {
  const customerRole = await Role.findOne({
    name: "customer",
  });

  if (!customerRole) {
    throw createError("Customer role was not found", 500);
  }

  const normalizedPhone = normalizePhone(phone);

  const existingCustomer = await Customer.findOne({
    phone: normalizedPhone,
  });

  if (existingCustomer) {
    throw createError(
      "An account with this WhatsApp number already exists",
      409,
    );
  }

  const passwordHash = await hashPassword(password);

  const otp = generateOtp();

  const otpHash = hashOtp(normalizedPhone, otp);

  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

  const user = await User.create({
    passwordHash,
    role: customerRole._id,
    whatsappVerifiedAt: null,
    whatsappOtpHash: otpHash,
    whatsappOtpExpiresAt: otpExpiresAt,
    whatsappOtpLastSentAt: new Date(),
    whatsappOtpAttempts: 0,
  });

  try {
    const customer = await Customer.create({
      user: user._id,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: normalizedPhone,
      privacyConsent: true,
      marketingConsent: marketingConsent || false,
    });

    await sendWhatsAppOtp({
      phone: normalizedPhone,
      otp,
    });

    return {
      user,
      customer,
      phone: normalizedPhone,
    };
  } catch (error) {
    await Customer.deleteOne({
      user: user._id,
    });

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

export const loginUser = async ({ phone, password }) => {
  const normalizedPhone = normalizePhone(phone);

  console.log("LOGIN DEBUG");
  console.log("PHONE:", normalizedPhone);
  console.log("PASSWORD RECEIVED:", Boolean(password));

  const customer = await Customer.findOne({
    phone: normalizedPhone,
  });

  console.log("CUSTOMER FOUND:", Boolean(customer));

  if (!customer) {
    throw createError("Invalid WhatsApp number or password", 401);
  }

  const user = await User.findById(customer.user).populate({
    path: "role",
    populate: {
      path: "permissions",
      model: "Permission",
    },
  });

  console.log("USER FOUND:", Boolean(user));

  if (!user) {
    throw createError("User not found", 404);
  }

  if (!user.isActive) {
    throw createError("Your account has been deactivated", 403);
  }

  const isPasswordValid = await comparePassword(password, user.passwordHash);

  console.log("PASSWORD VALID:", isPasswordValid);

  if (!isPasswordValid) {
    throw createError("Invalid WhatsApp number or password", 401);
  }

  if (!user.whatsappVerifiedAt) {
    const error = createError("WhatsApp verification is required", 403);

    error.code = "WHATSAPP_NOT_VERIFIED";

    error.phone = customer.phone || "";

    throw error;
  }

  user.lastLoginAt = new Date();

  await user.save();

  const accessToken = generateAccessToken({
    userId: user._id.toString(),
    role: user.role.name,
  });

  const userData = user.toObject();

  userData.customer = customer.toObject();

  return {
    user: userData,
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
    customerMap.set(String(customer.user), customer);
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

export const verifyWhatsappOtp = async ({ phone, otp }) => {
  const normalizedPhone = normalizePhone(phone);

  const customer = await Customer.findOne({
    phone: normalizedPhone,
  }).sort({
    createdAt: -1,
  });

  if (!customer) {
    throw createError("Invalid verification request.", 404);
  }

  const user = await User.findById(customer.user);

  if (!user) {
    throw createError("User not found.", 404);
  }

  if (user.whatsappVerifiedAt) {
    return {
      verified: true,
      message: "WhatsApp number is already verified.",
    };
  }

  if (!user.whatsappOtpHash || !user.whatsappOtpExpiresAt) {
    throw createError("No active OTP found. Please request a new OTP.", 400);
  }

  if (user.whatsappOtpExpiresAt < new Date()) {
    throw createError("OTP has expired. Please request a new OTP.", 400);
  }

  if (user.whatsappOtpAttempts >= 5) {
    throw createError(
      "Too many incorrect attempts. Please request a new OTP.",
      429,
    );
  }

  const isValid = verifyOtpHash(normalizedPhone, otp, user.whatsappOtpHash);

  if (!isValid) {
    await User.updateOne(
      {
        _id: user._id,
      },
      {
        $inc: {
          whatsappOtpAttempts: 1,
        },
      },
    );

    throw createError("Invalid OTP.", 400);
  }

  await User.updateOne(
    {
      _id: user._id,
    },
    {
      $set: {
        whatsappVerifiedAt: new Date(),

        whatsappOtpAttempts: 0,
      },

      $unset: {
        whatsappOtpHash: 1,

        whatsappOtpExpiresAt: 1,

        whatsappOtpLastSentAt: 1,
      },
    },
  );

  return {
    verified: true,
    message: "WhatsApp number verified successfully.",
  };
};

export const resendWhatsappOtp = async ({ phone }) => {
  const normalizedPhone = normalizePhone(phone);

  const customer = await Customer.findOne({
    phone: normalizedPhone,
  }).sort({
    createdAt: -1,
  });

  if (!customer) {
    throw createError("Invalid verification request.", 404);
  }

  const user = await User.findById(customer.user);

  if (!user) {
    throw createError("User not found.", 404);
  }

  if (user.whatsappVerifiedAt) {
    throw createError("WhatsApp number is already verified.", 400);
  }

  if (user.whatsappOtpLastSentAt) {
    const secondsSinceLastOtp =
      (Date.now() - user.whatsappOtpLastSentAt.getTime()) / 1000;

    if (secondsSinceLastOtp < 60) {
      const remainingSeconds = Math.ceil(60 - secondsSinceLastOtp);

      throw createError(
        `Please wait ${remainingSeconds} seconds before requesting another OTP.`,
        429,
      );
    }
  }

  const otp = generateOtp();

  const otpHash = hashOtp(normalizedPhone, otp);

  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

  const otpLastSentAt = new Date();

  await User.updateOne(
    {
      _id: user._id,
    },
    {
      $set: {
        whatsappOtpHash: otpHash,

        whatsappOtpExpiresAt: otpExpiresAt,

        whatsappOtpLastSentAt: otpLastSentAt,

        whatsappOtpAttempts: 0,
      },
    },
  );

  await sendWhatsAppOtp({
    phone: normalizedPhone,

    otp,
  });

  return {
    sent: true,

    phone: normalizedPhone,

    message: "A new OTP has been sent to your WhatsApp.",
  };
};
export const deleteUser = async ({
  userId,
  adminUserId,
}) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw createError("Invalid user ID", 400);
  }

  const user = await User.findById(userId).populate(
    "role",
    "name",
  );

  if (!user) {
    throw createError("User not found", 404);
  }

  if (
    String(user._id) ===
    String(adminUserId)
  ) {
    throw createError(
      "You cannot delete your own account.",
      400,
    );
  }

  if (user.role?.name === "super_admin") {
    const adminUser = await User.findById(
      adminUserId,
    ).populate("role", "name");

    if (
      adminUser?.role?.name !==
      "super_admin"
    ) {
      throw createError(
        "Only a super admin can delete a super admin.",
        403,
      );
    }
  }

  await Customer.deleteOne({
    user: user._id,
  });

  await User.deleteOne({
    _id: user._id,
  });

  return {
    success: true,
  };
};
export const requestPasswordReset = async ({ phone }) => {
  const normalizedPhone = normalizePhone(phone);

  const customer = await Customer.findOne({
    phone: normalizedPhone,
  });

  if (!customer) {
    throw createError("No account found with this WhatsApp number.", 404);
  }

  const user = await User.findById(customer.user);

  if (!user) {
    throw createError("User account not found.", 404);
  }

  if (!user.isActive) {
    throw createError("This account is inactive.", 403);
  }

  const now = new Date();

  if (
    user.passwordResetOtpLastSentAt &&
    now.getTime() - user.passwordResetOtpLastSentAt.getTime() < 60 * 1000
  ) {
    throw createError(
      "Please wait 60 seconds before requesting another code.",
      429,
    );
  }

  const otp = generateOtp();

  user.passwordResetOtpHash = hashOtp(normalizedPhone, otp);
  user.passwordResetOtpExpiresAt = new Date(
    now.getTime() + 10 * 60 * 1000,
  );
  user.passwordResetOtpLastSentAt = now;
  user.passwordResetOtpAttempts = 0;

  user.passwordResetTokenHash = null;
  user.passwordResetTokenExpiresAt = null;

  await user.save();

  try {
    await sendWhatsAppOtp({
      phone: normalizedPhone,
      otp,
    });
  } catch (error) {
    user.passwordResetOtpHash = null;
    user.passwordResetOtpExpiresAt = null;
    user.passwordResetOtpLastSentAt = null;
    user.passwordResetOtpAttempts = 0;

    await user.save();

    throw error;
  }

  return {
    sent: true,
    phone: normalizedPhone,
    message: "Password reset code sent successfully.",
  };
};

export const verifyPasswordResetOtp = async ({ phone, otp }) => {
  const normalizedPhone = normalizePhone(phone);

  const customer = await Customer.findOne({
    phone: normalizedPhone,
  });

  if (!customer) {
    throw createError("No account found with this WhatsApp number.", 404);
  }

  const user = await User.findById(customer.user);

  if (!user) {
    throw createError("User account not found.", 404);
  }

  if (!user.passwordResetOtpHash) {
    throw createError("No password reset code requested.", 400);
  }

  if (
    !user.passwordResetOtpExpiresAt ||
    user.passwordResetOtpExpiresAt < new Date()
  ) {
    user.passwordResetOtpHash = null;
    user.passwordResetOtpExpiresAt = null;
    user.passwordResetOtpLastSentAt = null;
    user.passwordResetOtpAttempts = 0;

    await user.save();

    throw createError("The verification code has expired.", 400);
  }

  if (user.passwordResetOtpAttempts >= 5) {
    throw createError(
      "Too many incorrect attempts. Please request a new code.",
      429,
    );
  }

  const isValid = verifyOtpHash(
    normalizedPhone,
    otp,
    user.passwordResetOtpHash,
  );

  if (!isValid) {
    user.passwordResetOtpAttempts += 1;
    await user.save();

    throw createError("Invalid verification code.", 400);
  }

  const resetToken = generateRandomToken();

  user.passwordResetTokenHash = hashToken(resetToken);
  user.passwordResetTokenExpiresAt = new Date(
    Date.now() + 10 * 60 * 1000,
  );

  user.passwordResetOtpHash = null;
  user.passwordResetOtpExpiresAt = null;
  user.passwordResetOtpLastSentAt = null;
  user.passwordResetOtpAttempts = 0;

  await user.save();

  return {
    verified: true,
    resetToken,
    message: "Verification successful.",
  };
};

export const resetPassword = async ({ resetToken, password }) => {
  if (!resetToken) {
    throw createError("Reset token is required.", 400);
  }

  if (!password || password.length < 8) {
    throw createError(
      "Password must be at least 8 characters long.",
      400,
    );
  }

  const resetTokenHash = hashToken(resetToken);

  const user = await User.findOne({
    passwordResetTokenHash: resetTokenHash,
    passwordResetTokenExpiresAt: {
      $gt: new Date(),
    },
  });

  if (!user) {
    throw createError("Invalid or expired reset token.", 400);
  }

  if (!user.isActive) {
    throw createError("This account is inactive.", 403);
  }

  user.passwordHash = await hashPassword(password);

  user.passwordResetTokenHash = null;
  user.passwordResetTokenExpiresAt = null;

  user.passwordResetOtpHash = null;
  user.passwordResetOtpExpiresAt = null;
  user.passwordResetOtpLastSentAt = null;
  user.passwordResetOtpAttempts = 0;

  await user.save();

  return {
    reset: true,
    message: "Password reset successfully.",
  };
};