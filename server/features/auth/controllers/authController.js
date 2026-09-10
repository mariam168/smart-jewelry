import {
  registerCustomer,
  verifyEmail,
  loginUser,
  getCurrentUser,
  getUsersForAdmin,
  changeUserRole,
} from "../services/authService.js";

import {
  validateRegisterInput,
  validateLoginInput,
} from "../validation/authValidation.js";

import {
  verifyWhatsappOtp,
  resendWhatsappOtp,
} from "../services/authService.js";

const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
};

export const register = async (req, res, next) => {
  try {
    const errors = validateRegisterInput(req.body);

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: "Please fix the validation errors",
        errors,
      });
    }

    const {
      firstName,
      lastName,
      password,
      phone,
      marketingConsent,
    } = req.body;

    const result = await registerCustomer({
      firstName,
      lastName,
      password,
      phone,
      marketingConsent,
    });

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: {
        user: {
          id: result.user._id,
        },
        customer: {
          id: result.customer._id,
          firstName: result.customer.firstName,
          lastName: result.customer.lastName,
          phone: result.customer.phone,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const verifyEmailController = async (req, res, next) => {
  try {
    const { token } = req.query;

    const user = await verifyEmail(token);

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
      data: {
        email: user.email,
        emailVerifiedAt: user.emailVerifiedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const errors = validateLoginInput(
      req.body,
    );

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Please fix the validation errors",
        errors,
      });
    }

    const {
      phone,
      password,
    } = req.body;

    const result = await loginUser({
      phone,
      password,
    });

    res.cookie(
      "accessToken",
      result.accessToken,
      getCookieOptions(),
    );

    return res.status(200).json({
      success: true,
      message: "Logged in successfully",
      data: {
        user: {
          id: result.user._id,
          role: {
            id: result.user.role._id,
            name: result.user.role.name,
          },
          customer: {
            id: result.user.customer?._id,
            firstName:
              result.user.customer?.firstName || "",
            lastName:
              result.user.customer?.lastName || "",
            phone:
              result.user.customer?.phone || "",
          },
        },
      },
    });
  } catch (error) {
    if (
      error?.code ===
      "WHATSAPP_NOT_VERIFIED"
    ) {
      return res.status(403).json({
        success: false,
        message: error.message,
        code: "WHATSAPP_NOT_VERIFIED",
        phone: error.phone || "",
      });
    }

    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const result = await getCurrentUser(req.user.userId);

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: result.user._id,
          email: result.user.email,
          role: result.user.role,
          isActive: result.user.isActive,
          emailVerifiedAt: result.user.emailVerifiedAt,
        },
        customer: result.customer,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = (req, res) => {
  const isProduction = process.env.NODE_ENV === "production";

  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
  });

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

export const getAdminUsersController = async (req, res, next) => {
  try {
    const users = await getUsersForAdmin();

    return res.status(200).json({
      success: true,
      data: {
        users,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserRoleController = async (req, res, next) => {
  try {
    const user = await changeUserRole({
      userId: req.params.userId,
      roleName: req.body.role,
      adminUserId: req.user.userId,
    });

    return res.status(200).json({
      success: true,
      message: "User role updated successfully.",
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const verifyWhatsappOtpController = async (req, res) => {
  const { phone, otp } = req.body;

  const result = await verifyWhatsappOtp({
    phone,
    otp,
  });

  return res.status(200).json({
    success: true,
    ...result,
  });
};

export const resendWhatsappOtpController = async (req, res) => {
  const { phone } = req.body;

  const result = await resendWhatsappOtp({
    phone,
  });

  return res.status(200).json({
    success: true,
    ...result,
  });
};