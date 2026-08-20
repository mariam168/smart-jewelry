
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

  // Handle input changes
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

    // Clear field error
    setErrors((previousErrors) => ({
      ...previousErrors,
      [name]: "",
    }));

    // Clear server error
    setServerError("");

    // Hide success message when user edits form
    setIsSuccess(false);
  };

  // Handle register form submit
  const handleSubmit = async (event) => {
    event.preventDefault();

    console.log(
      "Register form submitted"
    );

    // Clear previous messages
    setServerError("");
    setIsSuccess(false);

    // Validate form
    const validationErrors =
      validateRegisterForm(
        formValues
      );

    console.log(
      "Validation Errors:",
      validationErrors
    );

    // Stop if validation fails
    if (
      Object.keys(validationErrors)
        .length > 0
    ) {
      setErrors(validationErrors);
      return;
    }

    try {
      setIsLoading(true);
      setErrors({});

      // Remove confirmPassword
      // because it is only used
      // for frontend validation
      const {
        confirmPassword,
        ...registerData
      } = formValues;

      console.log(
        "Register Data:",
        registerData
      );

      // Call Register API
      const response =
        await registerUser(
          registerData
        );

      console.log(
        "Register Response:",
        response
      );

      // Show success message
      setIsSuccess(true);

      // Clear form
      setFormValues(
        initialValues
      );

      // Redirect to email verification
      setTimeout(() => {
        navigate(
          "/verify-email",
          {
            state: {
              email:
                registerData.email,
            },
          }
        );
      }, 1500);

    } catch (error) {
      console.error(
        "Register Error:",
        error
      );

      const responseError =
        error?.response?.data;

      // Backend validation errors
      if (
        responseError?.errors
      ) {
        setErrors(
          responseError.errors
        );
      } else {
        // General backend error
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
      subtitle="Join the Smart Jewelry experience"
    >
      {/* Success Message */}
      {isSuccess && (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          Account created successfully!
          Please check your email to verify
          your account.
        </div>
      )}

      {/* Server Error */}
      {serverError && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {serverError}
        </div>
      )}

      {/* Register Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        {/* First Name & Last Name */}
        <div className="grid gap-5 sm:grid-cols-2">
          <AuthInput
            label="First Name"
            name="firstName"
            value={
              formValues.firstName
            }
            onChange={handleChange}
            placeholder="Mariam"
            error={
              errors.firstName
            }
            required
          />

          <AuthInput
            label="Last Name"
            name="lastName"
            value={
              formValues.lastName
            }
            onChange={handleChange}
            placeholder="Samuel"
            error={
              errors.lastName
            }
            required
          />
        </div>

        {/* Email */}
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

        {/* Phone */}
        <AuthInput
          label="Phone"
          name="phone"
          type="tel"
          value={formValues.phone}
          onChange={handleChange}
          placeholder="01000000000"
          error={errors.phone}
        />

        {/* Password */}
        <PasswordInput
          label="Password"
          name="password"
          value={
            formValues.password
          }
          onChange={handleChange}
          placeholder="Enter your password"
          error={errors.password}
          required
        />

        {/* Confirm Password */}
        <PasswordInput
          label="Confirm Password"
          name="confirmPassword"
          value={
            formValues.confirmPassword
          }
          onChange={handleChange}
          placeholder="Confirm your password"
          error={
            errors.confirmPassword
          }
          required
        />

        {/* Consent Checkboxes */}
        <div className="space-y-4">

          {/* Privacy Consent */}
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              name="privacyConsent"
              checked={
                formValues.privacyConsent
              }
              onChange={handleChange}
              className="mt-1 h-4 w-4"
            />

            <span className="text-sm text-gray-600">
              I agree to the Privacy Policy
              and Terms of Service.

              <span className="ml-1 text-red-500">
                *
              </span>

              {errors.privacyConsent && (
                <span className="mt-1 block text-red-500">
                  {
                    errors.privacyConsent
                  }
                </span>
              )}
            </span>
          </label>

          {/* Marketing Consent */}
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              name="marketingConsent"
              checked={
                formValues.marketingConsent
              }
              onChange={handleChange}
              className="mt-1 h-4 w-4"
            />

            <span className="text-sm text-gray-600">
              I would like to receive
              updates and special offers.
            </span>
          </label>

        </div>

        {/* Submit Button */}
        <AuthButton
          type="submit"
          loading={isLoading}
          disabled={isLoading}
        >
          Create Account
        </AuthButton>
      </form>

      {/* Login Link */}
      <p className="mt-6 text-center text-sm text-gray-600">
        Already have an account?

        <Link
          to="/login"
          className="ml-1 font-semibold text-black hover:underline"
        >
          Login
        </Link>
      </p>
    </AuthLayout>
  );
};

export default RegisterPage;

