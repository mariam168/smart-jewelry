export const validateRegisterForm = (values) => {
  const errors = {};

  if (!values.firstName?.trim()) {
    errors.firstName = "First name is required";
  } else if (values.firstName.trim().length < 2) {
    errors.firstName = "First name must be at least 2 characters";
  }

  if (!values.lastName?.trim()) {
    errors.lastName = "Last name is required";
  } else if (values.lastName.trim().length < 2) {
    errors.lastName = "Last name must be at least 2 characters";
  }

  if (!values.phone?.trim()) {
    errors.phone = "WhatsApp number is required";
  } else if (!/^01[0125]\d{8}$/.test(values.phone.trim())) {
    errors.phone = "Please enter a valid Egyptian WhatsApp number";
  }

  if (!values.password) {
    errors.password = "Password is required";
  } else if (values.password.length < 8) {
    errors.password = "Password must be at least 8 characters";
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = "Please confirm your password";
  } else if (values.password !== values.confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  return errors;
};

export const validateRegisterInput = ({
  firstName,
  lastName,
  phone,
  password,
}) => {
  const errors = {};

  if (!firstName || firstName.trim().length < 2) {
    errors.firstName = "First name must be at least 2 characters";
  }

  if (!lastName || lastName.trim().length < 2) {
    errors.lastName = "Last name must be at least 2 characters";
  }

  if (!phone || !phone.trim()) {
    errors.phone = "WhatsApp number is required";
  } else if (!/^\+201[0125]\d{8}$/.test(phone.trim())) {
    errors.phone = "Please enter a valid Egyptian WhatsApp number";
  }

  if (!password) {
    errors.password = "Password is required";
  } else if (password.length < 8) {
    errors.password = "Password must be at least 8 characters";
  }

  return errors;
};

export const validateLoginInput = ({
  phone,
  password,
}) => {
  const errors = {};

  if (!phone || !phone.trim()) {
    errors.phone = "WhatsApp number is required";
  } else if (!/^\+201[0125]\d{8}$/.test(phone.trim())) {
    errors.phone = "Please enter a valid Egyptian WhatsApp number";
  }

  if (!password) {
    errors.password = "Password is required";
  }

  return errors;
};

export const validateLoginForm = (values) => {
  const errors = {};

  if (!values.phone?.trim()) {
    errors.phone = "WhatsApp number is required";
  } else if (!/^01[0125]\d{8}$/.test(values.phone.trim())) {
    errors.phone = "Please enter a valid Egyptian WhatsApp number";
  }

  if (!values.password) {
    errors.password = "Password is required";
  }

  return errors;
};