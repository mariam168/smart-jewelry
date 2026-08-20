export const validateRegisterInput = ({
  firstName,
  lastName,
  email,
  password,
  privacyConsent,
}) => {
  const errors = {};

  if (!firstName || firstName.trim().length < 2) {
    errors.firstName = "First name must be at least 2 characters";
  }

  if (!lastName || lastName.trim().length < 2) {
    errors.lastName = "Last name must be at least 2 characters";
  }

  if (!email) {
    errors.email = "Email is required";
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      errors.email = "Invalid email address";
    }
  }

  if (!password) {
    errors.password = "Password is required";
  } else if (password.length < 8) {
    errors.password = "Password must be at least 8 characters";
  }

  if (privacyConsent !== true) {
    errors.privacyConsent = "Privacy consent is required";
  }

  return errors;
};

export const validateLoginInput = ({ email, password }) => {
  const errors = {};

  if (!email || !email.trim()) {
    errors.email = "Email is required";
  }

  if (!password) {
    errors.password = "Password is required";
  }

  return errors;
};
