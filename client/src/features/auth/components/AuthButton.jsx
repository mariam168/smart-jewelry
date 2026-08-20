const AuthButton = ({
  children,
  type = "submit",
  loading = false,
  disabled = false,
}) => {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className="w-full rounded-lg bg-black px-6 py-3 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading
        ? "Creating account..."
        : children}
    </button>
  );
};

export default AuthButton;