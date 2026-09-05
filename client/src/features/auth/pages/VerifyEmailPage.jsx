import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import api from "../../../lib/axios";

const RESEND_SECONDS = 60;

const VerifyEmailPage = () => {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const phone = useMemo(
    () => searchParams.get("phone")?.trim() || "",
    [searchParams],
  );

  const [code, setCode] = useState("");

  const [loading, setLoading] = useState(false);

  const [resending, setResending] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [resendTimer, setResendTimer] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (resendTimer <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setResendTimer((current) => (current > 0 ? current - 1 : 0));
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [resendTimer]);

  const handleCodeChange = (event) => {
    const value = event.target.value.replace(/\D/g, "").slice(0, 6);

    setCode(value);
    setError("");
    setSuccess("");
  };

  const handleVerify = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!phone) {
      setError("WhatsApp number is missing. Please register again.");
      return;
    }

    if (code.length !== 6) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/verify-otp", {
        phone,
        otp: code,
      });

      const message =
        response.data?.message || "WhatsApp number verified successfully.";

      setSuccess(message);

      setTimeout(() => {
        navigate("/login", {
          replace: true,
          state: {
            message:
              "Your WhatsApp number has been verified. You can now sign in.",
          },
        });
      }, 1200);
    } catch (requestError) {
      const message =
        requestError.response?.data?.message ||
        requestError.response?.data?.error ||
        "Verification failed. Please check the code and try again.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!phone || resending || resendTimer > 0) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      setResending(true);

      const response = await api.post("/auth/resend-otp", {
        phone,
      });

      setSuccess(
        response.data?.message || "A new verification code has been sent.",
      );

      setCode("");

      setResendTimer(RESEND_SECONDS);
    } catch (requestError) {
      const message =
        requestError.response?.data?.message ||
        requestError.response?.data?.error ||
        "Could not resend the verification code.";

      setError(message);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F8F5EE] px-4 py-10 sm:px-6">
      {/* Decorative background */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-[#D3B36A]/10 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-[#0C1B33]/5 blur-3xl" />

      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-[28px] border border-[#D3B36A]/20 bg-white/90 px-6 py-8 shadow-[0_25px_70px_rgba(12,27,51,0.10)] backdrop-blur sm:px-9 sm:py-10">
          {/* Logo / Brand */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-[#D3B36A]/30 bg-[#F8F5EE]">
              <span className="text-xl text-[#C5A454]">✦</span>
            </div>

            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.35em] text-[#C5A454]">
              JEVORYA
            </p>

            <h1 className="text-2xl font-semibold tracking-tight text-[#0C1B33] sm:text-[28px]">
              Verify WhatsApp
            </h1>

            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#6C7280]">
              Enter the verification code sent to your WhatsApp number.
            </p>
          </div>

          {/* Phone */}
          {phone ? (
            <div className="mb-7 rounded-2xl border border-[#E8E1D3] bg-[#FBF9F4] px-4 py-3 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8B8E96]">
                Code sent to
              </p>

              <p className="mt-1.5 text-sm font-semibold tracking-wide text-[#0C1B33]">
                {phone}
              </p>
            </div>
          ) : (
            <div className="mb-7 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              WhatsApp number was not found. Please return to registration.
            </div>
          )}

          <form onSubmit={handleVerify}>
            <label
              htmlFor="verification-code"
              className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.15em] text-[#0C1B33]"
            >
              Verification Code
            </label>

            <input
              id="verification-code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={handleCodeChange}
              placeholder="000000"
              maxLength={6}
              disabled={loading}
              className="h-14 w-full rounded-2xl border border-[#DDD7CB] bg-white px-4 text-center text-xl font-semibold tracking-[0.5em] text-[#0C1B33] outline-none transition placeholder:text-[#CBC6BC] focus:border-[#C5A454] focus:ring-4 focus:ring-[#C5A454]/10 disabled:cursor-not-allowed disabled:opacity-60"
            />

            <div className="mt-2 flex items-center justify-between px-1">
              <span className="text-[11px] text-[#9699A0]">
                {code.length}/6 digits
              </span>

              <span className="text-[11px] text-[#9699A0]">
                Expires after 10 minutes
              </span>
            </div>

            {error && (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700">
                {error}
              </div>
            )}

            {success && (
              <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-5 text-emerald-700">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || code.length !== 6 || !phone}
              className="mt-6 flex h-13 min-h-[52px] w-full items-center justify-center rounded-2xl bg-[#0C1B33] px-5 text-sm font-semibold tracking-wide text-white transition hover:bg-[#142B4E] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify Number"}
            </button>
          </form>

          <div className="mt-7 text-center">
            <p className="text-xs text-[#858991]">Didn't receive it?</p>

            <button
              type="button"
              onClick={handleResend}
              disabled={resending || resendTimer > 0 || !phone}
              className="mt-2 text-xs font-semibold text-[#B18C3D] transition hover:text-[#8F6E2D] disabled:cursor-not-allowed disabled:text-[#ADADB0]"
            >
              {resending
                ? "Sending..."
                : resendTimer > 0
                  ? `Resend code in ${resendTimer}s`
                  : "Resend code"}
            </button>
          </div>

          <div className="mt-8 border-t border-[#EEE9DF] pt-6 text-center">
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="text-xs font-medium text-[#747983] transition hover:text-[#0C1B33]"
            >
              ← Use a different number
            </button>
          </div>
        </div>

        <p className="mt-5 text-center text-[10px] uppercase tracking-[0.13em] text-[#A09D95]">
          Secure verification by JEVORYA
        </p>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
