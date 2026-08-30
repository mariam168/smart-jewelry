import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import AuthLayout from "../components/AuthLayout";
import AuthInput from "../components/AuthInput";
import PasswordInput from "../components/PasswordInput";
import AuthButton from "../components/AuthButton";

import { registerUser } from "../services/authApi";
import { validateRegisterForm } from "../validation/authValidation";

const initialValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  privacyConsent: false,
  marketingConsent: false,
};

const RegisterPage = () => {
  const navigate = useNavigate();

  const [formValues, setFormValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setFormValues((previousValues) => ({
      ...previousValues,
      [name]:
        type === "checkbox"
          ? checked
          : value,
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

      await registerUser(registerData);

      setIsSuccess(true);
      setFormValues(initialValues);

      setTimeout(() => {
        navigate("/", {
          replace: true,
        });
      }, 1200);
    } catch (error) {
      const responseError =
        error?.response?.data;

      if (responseError?.errors) {
        setErrors(responseError.errors);
      } else {
        setServerError(
          responseError?.message ||
            "Something went wrong. Please try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Become part of the JEVORYA experience"
    >
      <div className="w-full">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 h-px w-16 bg-[#C9A24D]" />

          <p className="text-xs font-medium uppercase tracking-[0.28em] text-[#9B7428]">
            JEVORYA
          </p>
        </div>

        {isSuccess && (
          <div className="mb-6 rounded-xl border border-[#E3C47A]/60 bg-[#F8F5EF] px-5 py-4 text-center">
            <p className="text-sm font-medium text-[#12263A]">
              Account created successfully.
            </p>

            <p className="mt-1 text-xs text-[#5E6B78]">
              Redirecting you to JEVORYA...
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
              label="First Name"
              name="firstName"
              value={formValues.firstName}
              onChange={handleChange}
              placeholder="Mariam"
              error={errors.firstName}
              required
            />

            <AuthInput
              label="Last Name"
              name="lastName"
              value={formValues.lastName}
              onChange={handleChange}
              placeholder="Samuel"
              error={errors.lastName}
              required
            />
          </div>

          <AuthInput
            label="Email"
            name="email"
            type="email"
            value={formValues.email}
            onChange={handleChange}
            placeholder="you@example.com"
            error={errors.email}
            required
          />

          <AuthInput
            label="Phone"
            name="phone"
            type="tel"
            value={formValues.phone}
            onChange={handleChange}
            placeholder="+20 100 000 0000"
            error={errors.phone}
          />

          <PasswordInput
            label="Password"
            name="password"
            value={formValues.password}
            onChange={handleChange}
            placeholder="Enter your password"
            error={errors.password}
            required
          />

          <PasswordInput
            label="Confirm Password"
            name="confirmPassword"
            value={formValues.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm your password"
            error={errors.confirmPassword}
            required
          />

          <div className="space-y-4 rounded-xl border border-[#EDE5D9] bg-[#F9F7F2] p-5">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                name="privacyConsent"
                checked={formValues.privacyConsent}
                onChange={handleChange}
                className="mt-0.5 h-4 w-4 cursor-pointer accent-[#12263A]"
              />

              <span className="text-sm leading-6 text-[#5E6B78]">
                I agree to the{" "}
                <Link
                  to="/privacy-policy"
                  className="font-medium text-[#12263A] underline decoration-[#C9A24D] underline-offset-4 transition hover:text-[#9B7428]"
                >
                  Privacy Policy
                </Link>{" "}
                and{" "}
                <Link
                  to="/terms"
                  className="font-medium text-[#12263A] underline decoration-[#C9A24D] underline-offset-4 transition hover:text-[#9B7428]"
                >
                  Terms of Service
                </Link>
                .

                <span className="ml-1 text-[#9B7428]">
                  *
                </span>

                {errors.privacyConsent && (
                  <span className="mt-1 block text-xs text-red-500">
                    {errors.privacyConsent}
                  </span>
                )}
              </span>
            </label>

            <div className="h-px bg-[#EDE5D9]" />

            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                name="marketingConsent"
                checked={formValues.marketingConsent}
                onChange={handleChange}
                className="mt-0.5 h-4 w-4 cursor-pointer accent-[#12263A]"
              />

              <span className="text-sm leading-6 text-[#5E6B78]">
                I would like to receive JEVORYA
                updates, new collections and
                special offers.
              </span>
            </label>
          </div>

          <div className="pt-2">
            <AuthButton
              type="submit"
              loading={isLoading}
              disabled={isLoading || isSuccess}
            >
              Create Account
            </AuthButton>
          </div>
        </form>

        <div className="mt-8 border-t border-[#EDE5D9] pt-6">
          <p className="text-center text-sm text-[#5E6B78]">
            Already have an account?

            <Link
              to="/login"
              className="ml-2 font-semibold text-[#12263A] transition hover:text-[#9B7428]"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default RegisterPage;