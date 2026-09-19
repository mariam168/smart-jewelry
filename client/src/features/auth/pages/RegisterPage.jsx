
import { useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import { useTranslation } from "react-i18next";

import AuthLayout from "../components/AuthLayout";

import AuthInput from "../components/AuthInput";

import PasswordInput from "../components/PasswordInput";

import AuthButton from "../components/AuthButton";

import { registerUser } from "../services/authApi";

import { validateRegisterForm } from "../validation/authValidation";

const initialValues = {
  firstName: "",
  lastName: "",
  phone: "",
  password: "",
  confirmPassword: "",
  marketingConsent: false,
};

const RegisterPage = () => {
  const navigate = useNavigate();

  const { t } = useTranslation();

  const [formValues, setFormValues] =
    useState(initialValues);

  const [errors, setErrors] =
    useState({});

  const [serverError, setServerError] =
    useState("");

  const [isLoading, setIsLoading] =
    useState(false);

  const [isSuccess, setIsSuccess] =
    useState(false);

  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    let newValue =
      type === "checkbox"
        ? checked
        : value;

    if (name === "phone") {
      newValue = value
        .replace(/\D/g, "")
        .slice(0, 11);
    }

    setFormValues((previousValues) => ({
      ...previousValues,
      [name]: newValue,
    }));

    setErrors((previousErrors) => ({
      ...previousErrors,
      [name]: "",
    }));

    setServerError("");

    setIsSuccess(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setServerError("");

    setIsSuccess(false);

    const validationErrors =
      validateRegisterForm(formValues);

    if (
      Object.keys(validationErrors).length > 0
    ) {
      setErrors(validationErrors);
      return;
    }

    try {
      setIsLoading(true);

      setErrors({});

      const {
        confirmPassword,
        ...registerData
      } = formValues;

      const normalizedPhone =
        `+20${registerData.phone.substring(1)}`;

      const response =
        await registerUser({
          ...registerData,
          phone: normalizedPhone,
        });

      setIsSuccess(true);

      const returnedPhone =
        response?.data?.customer?.phone ||
        response?.data?.data?.customer?.phone ||
        response?.data?.phone ||
        response?.phone ||
        normalizedPhone;

      setTimeout(() => {
        navigate(
          `/verify-email?phone=${encodeURIComponent(
            returnedPhone
          )}`
        );
      }, 1500);
    } catch (error) {
      const responseError =
        error?.response?.data;

      if (responseError?.errors) {
        setErrors(responseError.errors);
      } else {
        setServerError(
          responseError?.message ||
            t(
              "auth.register.somethingWentWrong",
              "Something went wrong. Please try again."
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
        "auth.register.title",
        "Create your account"
      )}
      subtitle={t(
        "auth.register.subtitle",
        "Become part of the JEVORYA experience"
      )}
    >
      <div className="w-full">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 h-px w-16 bg-[#C9A24D]" />

          <p className="text-xs font-medium uppercase tracking-[0.28em] text-[#9B7428]">
            JEVORYA
          </p>
        </div>

        {isSuccess && (
          <div className="mb-6 rounded-xl border border-[#E3C47A]/60 bg-[#F8F5EF] px-5 py-4 text-center animate-pulse">
            <p className="text-sm font-medium text-[#12263A]">
              {t(
                "auth.register.accountCreatedSuccessfully",
                "Account created successfully."
              )}
            </p>

            <p className="mt-1 text-xs text-[#5E6B78]">
              {t(
                "auth.register.redirecting",
                "Sending verification code to your WhatsApp..."
              )}
            </p>
          </div>
        )}

        {serverError && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
            {serverError}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <AuthInput
              label={t(
                "auth.register.firstName",
                "First Name"
              )}
              name="firstName"
              value={formValues.firstName}
              onChange={handleChange}
              placeholder={t(
                "auth.register.firstNamePlaceholder",
                "John"
              )}
              error={errors.firstName}
              required
            />

            <AuthInput
              label={t(
                "auth.register.lastName",
                "Last Name"
              )}
              name="lastName"
              value={formValues.lastName}
              onChange={handleChange}
              placeholder={t(
                "auth.register.lastNamePlaceholder",
                "Doe"
              )}
              error={errors.lastName}
              required
            />
          </div>

          <AuthInput
            label={t(
              "auth.register.phone",
              "WhatsApp Number"
            )}
            name="phone"
            type="tel"
            inputMode="numeric"
            value={formValues.phone}
            onChange={handleChange}
            placeholder={t(
              "auth.register.phonePlaceholder",
              "01098765432"
            )}
            error={errors.phone}
            required
          />

          <PasswordInput
            label={t(
              "auth.register.password",
              "Password"
            )}
            name="password"
            value={formValues.password}
            onChange={handleChange}
            placeholder={t(
              "auth.register.enterPassword",
              "Enter your password"
            )}
            error={errors.password}
            required
          />

          <PasswordInput
            label={t(
              "auth.register.confirmPassword",
              "Confirm Password"
            )}
            name="confirmPassword"
            value={formValues.confirmPassword}
            onChange={handleChange}
            placeholder={t(
              "auth.register.confirmYourPassword",
              "Confirm your password"
            )}
            error={errors.confirmPassword}
            required
          />

          <div className="rounded-xl border border-[#EDE5D9] bg-[#F9F7F2] p-5">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                name="marketingConsent"
                checked={
                  formValues.marketingConsent
                }
                onChange={handleChange}
                className="mt-0.5 h-4 w-4 cursor-pointer accent-[#12263A]"
              />

              <span className="text-sm leading-6 text-[#5E6B78]">
                {t(
                  "auth.register.marketingConsent",
                  "I would like to receive JEVORYA updates, new collections and special offers."
                )}
              </span>
            </label>
          </div>

          <div className="pt-2">
           <AuthButton
  loading={isLoading}
  disabled={isLoading}
  loadingText={t(
    "auth.register.creatingAccount",
    "Creating account..."
  )}
>
  {t(
    "auth.register.createAccount",
    "Create Account"
  )}
</AuthButton>
          </div>
        </form>

        <div className="mt-8 border-t border-[#EDE5D9] pt-6">
          <p className="text-center text-sm text-[#5E6B78]">
            {t(
              "auth.register.alreadyHaveAccount",
              "Already have an account?"
            )}

            <Link
              to="/login"
              className="ml-2 font-semibold text-[#12263A] transition hover:text-[#9B7428]"
            >
              {t(
                "auth.register.login",
                "Login"
              )}
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default RegisterPage;
