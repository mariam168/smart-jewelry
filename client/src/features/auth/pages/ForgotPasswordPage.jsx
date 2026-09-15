import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  requestPasswordReset,
  verifyPasswordResetOtp,
  resetPassword,
} from "../services/authApi";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const normalizeEgyptianPhone = (value) => {
    const digits = value.replace(/\D/g, "");

    if (digits.startsWith("01")) {
      return `+20${digits.substring(1)}`;
    }

    return digits;
  };

  const handleSendOtp = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const digits = phone.replace(/\D/g, "");

    if (!/^01\d{9}$/.test(digits)) {
      setError("Please enter a valid Egyptian WhatsApp number.");
      return;
    }

    try {
      setLoading(true);

      const normalizedPhone = normalizeEgyptianPhone(digits);

      await requestPasswordReset({
        phone: normalizedPhone,
      });

      setPhone(normalizedPhone);
      setStep(2);
      setSuccess("A verification code has been sent to your WhatsApp.");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to send verification code.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!/^\d{4}$/.test(otp)) {
      setError("Please enter the 4-digit verification code.");
      return;
    }

    try {
      setLoading(true);

      const response = await verifyPasswordResetOtp({
        phone,
        otp,
      });

      setResetToken(response.data.resetToken);

      setStep(3);
      setSuccess("Code verified successfully.");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Invalid verification code.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      await resetPassword({
        resetToken,
        password,
      });

      setSuccess("Password reset successfully.");

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to reset password.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F5F0] px-4 py-10">
      <div className="mx-auto flex min-h-[80vh] max-w-md items-center justify-center">
        <div className="w-full rounded-2xl bg-white p-8 shadow-xl">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-semibold text-[#12263A]">
              Forgot Password
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Reset your password using your WhatsApp number.
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-5 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-600">
              {success}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#12263A]">
                  WhatsApp Number
                </label>

                <input
                  type="tel"
                  value={phone}
                  onChange={(event) =>
                    setPhone(
                      event.target.value
                        .replace(/\D/g, "")
                        .slice(0, 11),
                    )
                  }
                  placeholder="01xxxxxxxxx"
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none transition focus:border-[#B08D57]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-[#12263A] px-6 py-3 font-semibold text-white transition hover:bg-[#0D1B29] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Sending..." : "Send Verification Code"}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#12263A]">
                  Verification Code
                </label>

                <input
                  type="text"
                  inputMode="numeric"
                  value={otp}
                  onChange={(event) =>
                    setOtp(
                      event.target.value
                        .replace(/\D/g, "")
                        .slice(0, 4),
                    )
                  }
                  placeholder="Enter 4-digit code"
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 text-center tracking-[0.4em] outline-none transition focus:border-[#B08D57]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-[#12263A] px-6 py-3 font-semibold text-white transition hover:bg-[#0D1B29] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Verifying..." : "Verify Code"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setOtp("");
                  setError("");
                  setSuccess("");
                }}
                className="w-full text-sm font-semibold text-[#9B7428] hover:underline"
              >
                Change WhatsApp Number
              </button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#12263A]">
                  New Password
                </label>

                <input
                  type="password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="Enter new password"
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none transition focus:border-[#B08D57]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#12263A]">
                  Confirm Password
                </label>

                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(event.target.value)
                  }
                  placeholder="Confirm new password"
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none transition focus:border-[#B08D57]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-[#12263A] px-6 py-3 font-semibold text-white transition hover:bg-[#0D1B29] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          )}

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="mt-6 w-full text-sm font-semibold text-[#9B7428] hover:underline"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;