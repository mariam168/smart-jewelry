import { useState } from "react";

const PasswordInput = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  error,
  required = false,
}) => {
  const [showPassword, setShowPassword] =
    useState(false);

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={name}
        className="text-sm font-medium text-gray-700"
      >
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      <div className="relative">
        <input
          id={name}
          name={name}
          type={
            showPassword
              ? "text"
              : "password"
          }
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`
            w-full rounded-lg border px-4 py-3 pr-20
            outline-none transition
            ${
              error
                ? "border-red-500 focus:ring-2 focus:ring-red-200"
                : "border-gray-300 focus:border-black focus:ring-2 focus:ring-gray-200"
            }
          `}
        />

        <button
          type="button"
          onClick={() =>
            setShowPassword(
              (previous) => !previous
            )
          }
          className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-600 hover:text-black"
        >
          {showPassword
            ? "Hide"
            : "Show"}
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
};

export default PasswordInput;