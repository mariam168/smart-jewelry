const getRequiredEnvironmentValue = (name) => {
  const value = process.env[name];

  if (!value || !String(value).trim()) {
    const error = new Error(`${name} is not configured`);
    error.statusCode = 500;
    throw error;
  }

  return String(value).trim();
};

const readMetaResponse = async (response) => {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return {
      raw: text,
    };
  }
};

export const sendWhatsAppOtp = async ({ phone, otp }) => {
  if (!phone) {
    const error = new Error("WhatsApp phone number is required");
    error.statusCode = 400;
    throw error;
  }

  if (!otp) {
    const error = new Error("OTP is required");
    error.statusCode = 400;
    throw error;
  }

  const apiVersion = getRequiredEnvironmentValue(
    "WHATSAPP_API_VERSION",
  );

  const phoneNumberId = getRequiredEnvironmentValue(
    "WHATSAPP_PHONE_NUMBER_ID",
  );

  const accessToken = getRequiredEnvironmentValue(
    "WHATSAPP_ACCESS_TOKEN",
  );

  const templateName = getRequiredEnvironmentValue(
    "WHATSAPP_OTP_TEMPLATE_NAME",
  );

  const templateLanguage =
    process.env.WHATSAPP_OTP_TEMPLATE_LANGUAGE?.trim() ||
    "en_US";

  const recipient = String(phone)
    .trim()
    .replace(/^\+/, "");

  const url =
    `https://graph.facebook.com/${apiVersion}` +
    `/${phoneNumberId}/messages`;

  const payload = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: recipient,
    type: "template",

    template: {
      name: templateName,

      language: {
        code: templateLanguage,
      },

      components: [
        {
          type: "body",
          parameters: [
            {
              type: "text",
              text: String(otp),
            },
          ],
        },
      ],
    },
  };

  let response;

  try {
    response = await fetch(url, {
      method: "POST",

      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },

      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error(
      "WhatsApp API network error:",
      error.message,
    );

    const networkError = new Error(
      "Could not connect to WhatsApp API",
    );

    networkError.statusCode = 502;

    throw networkError;
  }

  const data = await readMetaResponse(response);

  if (!response.ok) {
    const metaMessage =
      data?.error?.message ||
      data?.error?.error_user_msg ||
      "WhatsApp API request failed";

    console.error("WhatsApp API error:", {
      status: response.status,
      code: data?.error?.code,
      type: data?.error?.type,
      message: metaMessage,
    });

    const error = new Error(metaMessage);
    error.statusCode = 502;
    error.metaCode = data?.error?.code;

    throw error;
  }

  return {
    success: true,
    messageId: data?.messages?.[0]?.id || null,
    contact:
      data?.contacts?.[0]?.wa_id || recipient,
  };
};

export default {
  sendWhatsAppOtp,
};