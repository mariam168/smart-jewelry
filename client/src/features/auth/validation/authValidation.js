export const validateRegisterForm = (values) => {
  const errors = {};

  if (!values.firstName.trim()) {
    errors.firstName =
      "First name is required";
  } else if (
    values.firstName.trim().length < 2
  ) {
    errors.firstName =
      "First name must be at least 2 characters";
  }

  if (!values.lastName.trim()) {
    errors.lastName =
      "Last name is required";
  } else if (
    values.lastName.trim().length < 2
  ) {
    errors.lastName =
      "Last name must be at least 2 characters";
  }

  if (!values.email.trim()) {
    errors.email = "Email is required";
  } else {
    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(values.email)) {
      errors.email =
        "Please enter a valid email";
    }
  }

  if (!values.password) {
    errors.password =
      "Password is required";
  } else if (
    values.password.length < 8
  ) {
    errors.password =
      "Password must be at least 8 characters";
  }

  if (!values.confirmPassword) {
    errors.confirmPassword =
      "Please confirm your password";
  } else if (
    values.password !==
    values.confirmPassword
  ) {
    errors.confirmPassword =
      "Passwords do not match";
  }

  if (
    !values.privacyConsent
  ) {
    errors.privacyConsent =
      "You must accept the privacy policy";
  }

  return errors;
};