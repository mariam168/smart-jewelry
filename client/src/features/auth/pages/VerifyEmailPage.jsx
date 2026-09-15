
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../../../lib/axios";

const RESEND_SECONDS = 60;

const VerifyEmailPage = () => {
const navigate = useNavigate();
const { t } = useTranslation();
const [searchParams] = useSearchParams();

const phone = useMemo(
() =>
searchParams.get("phone")?.trim() || "",
[searchParams],
);

const [code, setCode] =
useState("");
const [loading, setLoading] =
useState(false);
const [resending, setResending] =
useState(false);
const [error, setError] =
useState("");
const [success, setSuccess] =
useState("");
const [resendTimer, setResendTimer] =
useState(RESEND_SECONDS);

useEffect(() => {
if (resendTimer <= 0) {
return;
}


const timer = setInterval(() => {
  setResendTimer((current) =>
    current > 0
      ? current - 1
      : 0,
  );
}, 1000);

return () =>
  clearInterval(timer);


}, [resendTimer]);

const handleCodeChange = (
event,
) => {
const value =
event.target.value
.replace(/\D/g, "")
.slice(0, 4);


setCode(value);
setError("");
setSuccess("");


};

const handleVerify = async (
event,
) => {
event.preventDefault();


setError("");
setSuccess("");

if (!phone) {
  setError(
    t(
      "auth.verifyEmail.phoneRequired",
      "Phone number is required for verification.",
    ),
  );
  return;
}

if (code.length !== 4) {
  setError(
    t(
      "auth.verifyEmail.enterFourDigitCode",
      "Please enter the 4-digit verification code.",
    ),
  );
  return;
}

try {
  setLoading(true);

  const response =
    await api.post(
      "/auth/verify-otp",
      {
        phone,
        otp: code,
      },
    );

  setSuccess(
    response.data?.message ||
      t(
        "auth.verifyEmail.success",
        "WhatsApp number verified successfully.",
      ),
  );

  setTimeout(() => {
    navigate(
      "/login",
      {
        replace: true,
      },
    );
  }, 1500);
} catch (
  requestError
) {
  setError(
    requestError.response?.data
      ?.message ||
      t(
        "auth.verifyEmail.invalidOrExpiredCode",
        "Invalid or expired code.",
      ),
  );
} finally {
  setLoading(false);
}


};

const handleResend = async () => {
if (
!phone ||
resending ||
resendTimer > 0
) {
return;
}

setError("");
setSuccess("");

try {
  setResending(true);

  const response =
    await api.post(
      "/auth/resend-otp",
      {
        phone,
      },
    );

  setSuccess(
    response.data?.message ||
      t(
        "auth.verifyEmail.newCodeSent",
        "A new code has been sent to your WhatsApp.",
      ),
  );

  setCode("");
  setResendTimer(
    RESEND_SECONDS,
  );
} catch (
  requestError
) {
  const message =
    requestError.response?.data
      ?.message ||
    t(
      "auth.verifyEmail.couldNotResend",
      "Could not resend code.",
    );

  setError(message);

  const remainingMatch =
    String(message).match(
      /(\d+)\s*seconds?/i,
    );

  if (remainingMatch) {
    setResendTimer(
      Number(
        remainingMatch[1],
      ),
    );
  }
} finally {
  setResending(false);
}


};

return ( <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F8F5EE] px-4 py-10"> <div className="relative z-10 w-full max-w-md rounded-[28px] border border-[#D3B36A]/20 bg-white/90 p-10 shadow-xl backdrop-blur"> <div className="mb-8 text-center"> <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-[#D3B36A]/30 bg-[#F8F5EE]"> <span className="text-xl text-[#C5A454]">
✦ </span> </div>


      <h1 className="text-2xl font-bold tracking-tight text-[#0C1B33] sm:text-[28px]">
        {t(
          "auth.verifyEmail.verifyWhatsApp",
          "Verify WhatsApp",
        )}
      </h1>

      <p className="mt-3 text-sm text-[#6C7280]">
        {t(
          "auth.verifyEmail.enterFourDigitDescription",
          "Enter the 4-digit code sent to your WhatsApp number.",
        )}
      </p>
    </div>

    {phone && (
      <div className="mb-7 rounded-2xl border border-[#E8E1D3] bg-[#FBF9F4] px-4 py-3 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8B8E96]">
          {t(
            "auth.verifyEmail.codeSentTo",
            "Code sent to",
          )}
        </p>

        <p className="mt-1.5 text-sm font-semibold text-[#0C1B33]">
          {phone}
        </p>
      </div>
    )}

    {!phone && (
      <div className="mb-7 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-700">
        {t(
          "auth.verifyEmail.phoneMissing",
          "No phone number was provided for verification.",
        )}
      </div>
    )}

    <form
      onSubmit={
        handleVerify
      }
    >
      <input
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        value={code}
        onChange={
          handleCodeChange
        }
        placeholder="0000"
        maxLength={4}
        disabled={loading}
        className="h-16 w-full rounded-2xl border border-[#DDD7CB] bg-white text-center text-3xl font-bold tracking-[0.8em] text-[#0C1B33] outline-none transition-all focus:border-[#C5A454] focus:ring-4 focus:ring-[#C5A454]/10 disabled:opacity-50"
      />

      {error && (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-center text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-center text-sm text-emerald-700">
          {success}
        </div>
      )}

      <button
        type="submit"
        disabled={
          loading ||
          code.length !== 4 ||
          !phone
        }
        className="mt-8 flex h-14 w-full items-center justify-center rounded-2xl bg-[#0C1B33] font-bold tracking-wide text-white transition-all hover:bg-[#142B4E] active:scale-[0.98] disabled:opacity-50"
      >
        {loading
          ? t(
              "auth.verifyEmail.verifying",
              "Verifying...",
            )
          : t(
              "auth.verifyEmail.verifyNumber",
              "Verify Number",
            )}
      </button>
    </form>

    <div className="mt-8 border-t border-[#EEE9DF] pt-6 text-center">
      <p className="text-xs text-[#858991]">
        {t(
          "auth.verifyEmail.didntReceive",
          "Didn't receive the code?",
        )}
      </p>

      <button
        type="button"
        onClick={
          handleResend
        }
        disabled={
          resending ||
          resendTimer > 0 ||
          !phone
        }
        className="mt-2 text-sm font-bold text-[#B18C3D] transition-colors hover:text-[#8F6E2D] disabled:text-[#ADADB0]"
      >
        {resending
          ? t(
              "auth.verifyEmail.sending",
              "Sending...",
            )
          : resendTimer > 0
            ? t(
                "auth.verifyEmail.resendCodeIn",
                "Resend code in {{seconds}}s",
                {
                  seconds: resendTimer,
                },
              )
            : t(
                "auth.verifyEmail.resendCode",
                "Resend Code",
              )}
      </button>
    </div>
  </div>
</div>

);
};

export default VerifyEmailPage;
