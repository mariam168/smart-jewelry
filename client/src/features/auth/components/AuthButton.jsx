import { useTranslation } from "react-i18next";

const AuthButton = ({
  children,
  type = "submit",
  loading = false,
  disabled = false,
  loadingText,
}) => {
  const { t } = useTranslation();

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className="w-full rounded-lg bg-black px-6 py-3 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading
        ? loadingText || t("auth.common.loading", "Loading...")
        : children}
    </button>
  );
};

export default AuthButton;