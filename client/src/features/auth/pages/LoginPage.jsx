import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import AuthLayout from "../components/AuthLayout";
import AuthInput from "../components/AuthInput";
import PasswordInput from "../components/PasswordInput";
import AuthButton from "../components/AuthButton";

import { loginUser } from "../services/authApi";
import { useAuth } from "../context/AuthContext";

const initialValues = {
  email: "",
  password: "",
};

const LoginPage = () => {
  const navigate = useNavigate();

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

  const [isLoading, setIsLoading] =
    useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormValues((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));

    setServerError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const newErrors = {};

    if (!formValues.email.trim()) {
      newErrors.email = "Email is required";
    }

    if (!formValues.password) {
      newErrors.password = "Password is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsLoading(true);

      setErrors({});
      setServerError("");

      const response =
        await loginUser(formValues);

      console.log("LOGIN RESPONSE:");
      console.log(response);

      setUser(response.data.user);

      console.log("User Saved");

      setIsAuthenticated(true);

      console.log("Authenticated");

    const role =
  response.data.user.role.name;

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
      console.error(error.response);
      console.error(error.message);

      const data =
        error?.response?.data;

      if (data?.errors) {
        setErrors(data.errors);
      } else {
        setServerError(
          data?.message ||
          error.message ||
          "Unable to login. Please try again."
        );
      }

    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Login to your Smart Jewelry account"
    >
      {serverError && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {serverError}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >
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

        <PasswordInput
          label="Password"
          name="password"
          value={formValues.password}
          onChange={handleChange}
          placeholder="Enter your password"
          error={errors.password}
          required
        />

        <div className="flex justify-end">
          <Link
            to="/forgot-password"
            className="text-sm font-medium text-gray-600 hover:text-black hover:underline"
          >
            Forgot Password?
          </Link>
        </div>

        <AuthButton
          loading={isLoading}
          disabled={isLoading}
        >
          Login
        </AuthButton>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        Don't have an account?

        <Link
          to="/register"
          className="ml-1 font-semibold text-black hover:underline"
        >
          Create Account
        </Link>
      </p>
    </AuthLayout>
  );
};

export default LoginPage;