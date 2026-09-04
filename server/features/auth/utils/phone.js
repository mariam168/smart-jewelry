export const normalizePhone = (
  value,
) => {
  if (
    typeof value !== "string" ||
    !value.trim()
  ) {
    const error =
      new Error(
        "WhatsApp number is required",
      );

    error.statusCode = 400;

    throw error;
  }

  let phone = value
    .trim()
    .replace(
      /[\s\-().]/g,
      "",
    );

  if (
    phone.startsWith("00")
  ) {
    phone =
      `+${phone.slice(2)}`;
  }

  if (
    !/^\+[1-9]\d{7,14}$/.test(
      phone,
    )
  ) {
    const error =
      new Error(
        "Please enter the WhatsApp number in international format, for example +201001234567",
      );

    error.statusCode = 400;

    throw error;
  }

  return phone;
};

export default normalizePhone;