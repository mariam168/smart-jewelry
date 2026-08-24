import {
  registerCustomer,
  verifyEmail,
  loginUser,
  getCurrentUser,
} from "../services/authService.js";

import {
  validateRegisterInput,
  validateLoginInput,
} from "../validation/authValidation.js";

const getCookieOptions = () => {
  const isProduction =
    process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction
      ? "none"
      : "lax",
    path: "/",
    maxAge:
      7 *
      24 *
      60 *
      60 *
      1000,
  };
};

export const register = async (
  req,
  res,
  next,
) => {
  try {
    const errors =
      validateRegisterInput(
        req.body,
      );

    if (
      Object.keys(errors)
        .length > 0
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Please fix the validation errors",
          errors,
        });
    }

    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      privacyConsent,
      marketingConsent,
    } = req.body;

    const result =
      await registerCustomer({
        firstName,
        lastName,
        email,
        password,
        phone,
        privacyConsent,
        marketingConsent,
      });

    return res
      .status(201)
      .json({
        success: true,
        message:
          "Account created successfully",
        data: {
          user: {
            id: result.user._id,
            email:
              result.user.email,
          },

          customer: {
            id:
              result.customer
                ._id,
            firstName:
              result.customer
                .firstName,
            lastName:
              result.customer
                .lastName,
          },
        },
      });
  } catch (error) {
    next(error);
  }
};

export const verifyEmailController =
  async (
    req,
    res,
    next,
  ) => {
    try {
      const { token } =
        req.query;

      const user =
        await verifyEmail(
          token,
        );

      return res
        .status(200)
        .json({
          success: true,
          message:
            "Email verified successfully",

          data: {
            email:
              user.email,

            emailVerifiedAt:
              user.emailVerifiedAt,
          },
        });
    } catch (error) {
      next(error);
    }
  };

export const login = async (
  req,
  res,
  next,
) => {
  try {
    const errors =
      validateLoginInput(
        req.body,
      );

    if (
      Object.keys(errors)
        .length > 0
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Please fix the validation errors",
          errors,
        });
    }

    const {
      email,
      password,
    } = req.body;

    const result =
      await loginUser({
        email,
        password,
      });

    res.cookie(
      "accessToken",
      result.accessToken,
      getCookieOptions(),
    );

    return res
      .status(200)
      .json({
        success: true,
        message:
          "Logged in successfully",

        data: {
          user: {
            id:
              result.user._id,

            email:
              result.user
                .email,

            role: {
              id:
                result.user
                  .role._id,

              name:
                result.user
                  .role.name,
            },
          },
        },
      });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (
  req,
  res,
  next,
) => {
  try {
    const result =
      await getCurrentUser(
        req.user.userId,
      );

    return res
      .status(200)
      .json({
        success: true,

        data: {
          user: {
            id:
              result.user._id,

            email:
              result.user.email,

            role:
              result.user.role,

            isActive:
              result.user
                .isActive,

            emailVerifiedAt:
              result.user
                .emailVerifiedAt,
          },

          customer:
            result.customer,
        },
      });
  } catch (error) {
    next(error);
  }
};

export const logout = (
  req,
  res,
) => {
  const isProduction =
    process.env.NODE_ENV ===
    "production";

  res.clearCookie(
    "accessToken",
    {
      httpOnly: true,
      secure:
        isProduction,
      sameSite:
        isProduction
          ? "none"
          : "lax",
      path: "/",
    },
  );

  return res
    .status(200)
    .json({
      success: true,
      message:
        "Logged out successfully",
    });
};