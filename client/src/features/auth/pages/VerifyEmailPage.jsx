import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useSearchParams,
} from "react-router-dom";

import AuthLayout from "../components/AuthLayout";

import api from "../../../lib/axios";

const VerifyEmailPage = () => {
  const [
    searchParams,
  ] = useSearchParams();

  const [
    status,
    setStatus,
  ] = useState("loading");

  const [
    message,
    setMessage,
  ] = useState("");

  useEffect(() => {
    const token =
      searchParams.get("token");

    if (!token) {
      setStatus("error");

      setMessage(
        "Verification token is missing."
      );

      return;
    }

    const verifyEmail =
      async () => {
        try {
          const response =
            await api.get(
              `/auth/verify-email?token=${encodeURIComponent(
                token
              )}`
            );

          setStatus("success");

          setMessage(
            response.data.message
          );
        } catch (error) {
          setStatus("error");

          setMessage(
            error?.response?.data
              ?.message ||
              "The verification link is invalid or expired."
          );
        }
      };

    verifyEmail();
  }, [searchParams]);

  return (
    <AuthLayout
      title={
        status === "loading"
          ? "Verifying your email..."
          : status === "success"
          ? "Email Verified!"
          : "Verification Failed"
      }
      subtitle=""
    >
      <div className="text-center">
        {status ===
          "loading" && (
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-black" />
        )}

        {status ===
          "success" && (
          <>
            <div className="mb-6 text-5xl">
              ✓
            </div>

            <p className="mb-6 text-gray-600">
              {message}
            </p>

            <Link
              to="/login"
              className="inline-block rounded-lg bg-black px-6 py-3 font-semibold text-white hover:bg-gray-800"
            >
              Go to Login
            </Link>
          </>
        )}

        {status ===
          "error" && (
          <>
            <div className="mb-6 text-5xl">
              !
            </div>

            <p className="mb-6 text-red-500">
              {message}
            </p>

            <Link
              to="/register"
              className="inline-block rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50"
            >
              Back to Register
            </Link>
          </>
        )}
      </div>
    </AuthLayout>
  );
};

export default VerifyEmailPage;