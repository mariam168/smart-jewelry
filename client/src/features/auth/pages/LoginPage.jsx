import { useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import { useTranslation } from "react-i18next";

import AuthLayout from "../components/AuthLayout";

import AuthInput from "../components/AuthInput";

import PasswordInput from "../components/PasswordInput";

import AuthButton from "../components/AuthButton";

import { loginUser } from "../services/authApi";

import { useAuth } from "../context/AuthContext";

const initialValues = {
  phone: "",
  password: "",
};

const LoginPage = () => {
  const navigate = useNavigate();

  const { t } = useTranslation();

  const {
    setUser,
    setIsAuthenticated,
  } = useAuth();

  const [formValues, setFormValues] =
    useState(initialValues);

  const [errors, setErrors] =
    useState({});

  const [serverError, setServerError] =
    useState("");

  const [verificationPhone, setVerificationPhone] =
    useState("");

  const [isLoading, setIsLoading] =
    useState(false);

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    let newValue = value;

    if (name === "phone") {
      newValue = value
        .replace(/\D/g, "")
        .slice(0, 11);
    }

    setFormValues((previous) => ({
      ...previous,
      [name]: newValue,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));

    setServerError("");
    setVerificationPhone("");
  };

  const handleVerifyWhatsapp = () => {
    if (!verificationPhone) {
      return;
    }

    navigate(
      `/verify-email?phone=${encodeURIComponent(
        verificationPhone
      )}`,
      {
        replace: true,
      }
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const newErrors = {};

    if (!formValues.phone.trim()) {
      newErrors.phone = t(
        "auth.login.phoneRequired",
        "WhatsApp number is required"
      );
    } else if (
      !/^01[0125]\d{8}$/.test(
        formValues.phone
      )
    ) {
      newErrors.phone = t(
        "auth.login.phoneInvalid",
        "Please enter a valid Egyptian WhatsApp number"
      );
    }

    if (!formValues.password) {
      newErrors.password = t(
        "auth.login.passwordRequired",
        "Password is required"
      );
    }

    if (
      Object.keys(newErrors).length > 0
    ) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsLoading(true);

      setErrors({});
      setServerError("");
      setVerificationPhone("");

      const normalizedPhone =
        `+20${formValues.phone.substring(1)}`;

      const response =
        await loginUser({
          phone: normalizedPhone,
          password: formValues.password,
        });

      console.log("LOGIN RESPONSE:");
      console.log(response);

      setUser(response.user);

      console.log("User Saved");

      setIsAuthenticated(true);

      console.log("Authenticated");

      const role =
        response.user.role.name;

      if (
        role === "admin" ||
        role === "super_admin"
      ) {
        navigate("/admin");
      } else {
        navigate("/account");
      }

      console.log("Navigation Done");
    } catch (error) {
      console.error("LOGIN ERROR:");
      console.error(error);

      console.log(
        "ERROR RESPONSE:",
        error?.response
      );

      console.log(
        "ERROR DATA:",
        error?.response?.data
      );

      console.log(
        "ERROR CODE:",
        error?.response?.data?.code
      );

      console.log(
        "ERROR PHONE:",
        error?.response?.data?.phone
      );

      console.log(
        "ERROR MESSAGE:",
        error?.response?.data?.message
      );

      console.log(
        "FULL ERROR OBJECT:",
        JSON.stringify(
          error,
          Object.getOwnPropertyNames(error)
        )
      );

      const data =
        error?.response?.data;

      if (
        data?.code ===
        "WHATSAPP_NOT_VERIFIED"
      ) {
        setUser(null);
        setIsAuthenticated(false);

        const normalizedPhone =
          `+20${formValues.phone.substring(1)}`;

        const phone =
          data?.phone ||
          data?.data?.phone ||
          normalizedPhone;

        console.log(
          "WHATSAPP VERIFICATION PHONE:",
          phone
        );

        setVerificationPhone(phone);
        setServerError("");

        return;
      }

      if (data?.errors) {
        setErrors(data.errors);
      } else {
        setServerError(
          data?.message ||
            error.message ||
            t(
              "auth.login.unableToLogin",
              "Unable to login. Please try again."
            )
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title={t(
        "auth.login.title",
        "Welcome back"
      )}
      subtitle={t(
        "auth.login.subtitle",
        "Login to your Smart Jewelry account"
      )}
    >
      {verificationPhone && (
        <div className="mb-6 rounded-2xl border border-[#C9A24D]/40 bg-[#F8F5EF] p-5">
          <div className="mb-4 flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0D2235] text-[#E3C47A]">
              <span className="text-lg">
                ✓
              </span>
            </div>

            <div>
              <h3 className="text-base font-semibold text-[#0D2235]">
                {t(
                  "auth.login.verifyWhatsappTitle",
                  "Verify your WhatsApp number"
                )}
              </h3>

              <p className="mt-1 text-sm leading-6 text-[#5E6B78]">
                {t(
                  "auth.login.verifyWhatsappMessage",
                  "Your account needs WhatsApp verification before you can continue."
                )}
              </p>
            </div>
          </div>

          <p className="mb-4 text-sm leading-6 text-[#5E6B78]">
            {t(
              "auth.login.verifyWhatsappDescription",
              "We sent a verification code to your WhatsApp number. Verify your number to continue."
            )}
          </p>

          <button
            type="button"
            onClick={
              handleVerifyWhatsapp
            }
            className="w-full rounded-xl bg-[#0D2235] px-5 py-3.5 text-sm font-semibold text-[#F8F5EF] transition-all duration-300 hover:bg-[#12263A] hover:shadow-lg"
          >
            {t(
              "auth.login.verifyWhatsappButton",
              "Verify WhatsApp Number"
            )}
          </button>
        </div>
      )}

      {serverError &&
        !verificationPhone && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {serverError}
          </div>
        )}

      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        <AuthInput
          label={t(
            "auth.login.phone",
            "WhatsApp Number"
          )}
          name="phone"
          type="tel"
          inputMode="numeric"
          value={formValues.phone}
          onChange={handleChange}
          placeholder="01098765432"
          error={errors.phone}
          required
        />

        <PasswordInput
          label={t(
            "auth.login.password",
            "Password"
          )}
          name="password"
          value={formValues.password}
          onChange={handleChange}
          placeholder={t(
            "auth.login.enterPassword",
            "Enter your password"
          )}
          error={errors.password}
          required
        />

        <div className="flex justify-end"></div>

        <AuthButton
          loading={isLoading}
          disabled={isLoading}
        >
          {t(
            "auth.login.login",
            "Login"
          )}
        </AuthButton>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        {t(
          "auth.login.dontHaveAccount",
          "Don't have an account?"
        )}

        <Link
          to="/register"
          className="ml-1 font-semibold text-black transition-colors hover:text-[#9B7428] hover:underline"
        >
          {t(
            "auth.login.createAccount",
            "Create Account"
          )}
        </Link>
      </p>
    </AuthLayout>
  );
};

export default LoginPage;