
const getRequiredEnvValue = (name) => {
  const value = process.env[name];

  if (!value || !String(value).trim()) {
    const error = new Error(
      `${name} is not configured in .env file`,
    );
    error.statusCode = 500;
    throw error;
  }

  return String(value).trim();
};

const logSection = (title) => {
  console.log("");
  console.log("==================================================");
  console.log(title);
  console.log("==================================================");
};

const logMessageInfo = ({
  phone,
  otp,
  messageId,
  status,
  responseStatus,
  responseOk,
}) => {
  logSection("WASL-X MESSAGE INFORMATION");

  console.log("PHONE:", phone);
  console.log("OTP:", otp);
  console.log("HTTP STATUS:", responseStatus);
  console.log("HTTP OK:", responseOk);
  console.log("MESSAGE ID:", messageId || "N/A");
  console.log("WASL-X STATUS:", status || "N/A");

  if (status === "queued") {
    console.log("");
    console.log("QUEUE STATUS: ACCEPTED");
    console.log("DELIVERY STATUS: NOT CONFIRMED");
    console.log("NEXT STEP: WAITING FOR WASL-X PROCESSING");
  }

  if (status === "sent") {
    console.log("");
    console.log("QUEUE STATUS: PROCESSED");
    console.log("DELIVERY STATUS: SENT");
  }

  if (status === "delivered") {
    console.log("");
    console.log("QUEUE STATUS: PROCESSED");
    console.log("DELIVERY STATUS: DELIVERED");
  }

  if (status === "failed") {
    console.log("");
    console.error("QUEUE STATUS: FAILED");
    console.error("DELIVERY STATUS: FAILED");
  }

  logSection("END MESSAGE INFORMATION");
};

export const sendWhatsAppOtp = async ({ phone, otp }) => {
  if (!phone || !otp) {
    const error = new Error("Phone and OTP are required");
    error.statusCode = 400;
    throw error;
  }

  const apiKey = getRequiredEnvValue("WASL_X_API_KEY");

  const url =
    process.env.WASL_X_URL ||
    "https://otp.wasl-x.com/api/v1/otp/send";

  const recipient = String(phone)
    .trim()
    .replace(/^\+/, "");

  const payload = {
    phone: recipient,
    otp: String(otp),
    message: `Your verification code is ${otp}`,
  };

  try {
    logSection("WASL-X OTP REQUEST");

    console.log("REQUEST TIME:", new Date().toISOString());
    console.log("URL:", url);
    console.log("METHOD:", "POST");
    console.log("PHONE:", recipient);
    console.log("OTP:", otp);

    console.log(
      "PAYLOAD:",
      JSON.stringify(payload, null, 2),
    );

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    const rawResponse = await response.text();

    let data;

    try {
      data = JSON.parse(rawResponse);
    } catch {
      data = rawResponse;
    }

    const headers = {};

    for (const [key, value] of response.headers.entries()) {
      headers[key] = value;
    }

    logSection("WASL-X OTP RESPONSE");

    console.log("RESPONSE TIME:", new Date().toISOString());
    console.log("HTTP STATUS:", response.status);
    console.log("STATUS TEXT:", response.statusText);
    console.log("OK:", response.ok);

    console.log(
      "HEADERS:",
      JSON.stringify(headers, null, 2),
    );

    console.log(
      "BODY:",
      JSON.stringify(data, null, 2),
    );

    logSection("WASL-X RESPONSE SUMMARY");

    console.log(
      "SUCCESS:",
      data?.success ?? "N/A",
    );

    console.log(
      "STATUS:",
      data?.status ?? "N/A",
    );

    console.log(
      "MESSAGE ID:",
      data?.message_id || "N/A",
    );

    console.log(
      "MESSAGE:",
      data?.message || "N/A",
    );

    if (!response.ok) {
      console.error("");
      console.error("WASL-X REQUEST FAILED");

      const error = new Error(
        data?.message ||
          data?.error ||
          "WhatsApp OTP request failed via Wasl-X",
      );

      error.statusCode = 502;

      throw error;
    }

    logMessageInfo({
      phone: recipient,
      otp,
      messageId: data?.message_id,
      status: data?.status,
      responseStatus: response.status,
      responseOk: response.ok,
    });

    if (data?.status === "queued") {
      console.log("");
      console.log("⚠️ OTP ACCEPTED BY WASL-X");
      console.log("⚠️ OTP IS CURRENTLY QUEUED");
      console.log("⚠️ DELIVERY HAS NOT BEEN CONFIRMED");

      console.log(
        "MESSAGE ID:",
        data?.message_id || "N/A",
      );
    }

    if (data?.status === "sent") {
      console.log("");
      console.log("✅ OTP SENT BY WASL-X");

      console.log(
        "MESSAGE ID:",
        data?.message_id || "N/A",
      );
    }

    if (data?.status === "delivered") {
      console.log("");
      console.log("✅ OTP DELIVERED");

      console.log(
        "MESSAGE ID:",
        data?.message_id || "N/A",
      );
    }

    if (data?.status === "failed") {
      console.log("");
      console.error("❌ OTP DELIVERY FAILED");

      console.error(
        "MESSAGE ID:",
        data?.message_id || "N/A",
      );
    }

    logSection("WASL-X OTP REQUEST FINISHED");

    return {
      success: true,
      provider: "wasl-x",
      messageId: data?.message_id || null,
      status: data?.status || null,
      data,
    };
  } catch (error) {
    logSection("WASL-X SERVICE ERROR");

    console.error(
      "TIME:",
      new Date().toISOString(),
    );

    console.error(
      "MESSAGE:",
      error.message,
    );

    console.error(
      "STATUS:",
      error.statusCode || "N/A",
    );

    if (error.cause) {
      console.error(
        "CAUSE:",
        error.cause,
      );
    }

    logSection("END WASL-X SERVICE ERROR");

    if (error.statusCode) {
      throw error;
    }

    const networkError = new Error(
      "Could not connect to WhatsApp OTP service (Wasl-X)",
    );

    networkError.statusCode = 502;

    throw networkError;
  }
};

export default {
  sendWhatsAppOtp,
};
