/**
 * خدمة إرسال OTP عبر منصة Wasl-X الجديدة
 */

const getRequiredEnvValue = (name) => {
  const value = process.env[name];
  if (!value || !String(value).trim()) {
    const error = new Error(`${name} is not configured in .env file`);
    error.statusCode = 500;
    throw error;
  }
  return String(value).trim();
};

export const sendWhatsAppOtp = async ({ phone, otp }) => {
  // التأكد من وجود المدخلات
  if (!phone || !otp) {
    const error = new Error("Phone and OTP are required");
    error.statusCode = 400;
    throw error;
  }

  // جلب البيانات من .env (Wasl-X فقط)
  const apiKey = getRequiredEnvValue("WASL_X_API_KEY");
  const url = process.env.WASL_X_URL || "https://otp.wasl-x.com/api/v1/otp/send";

  // تنظيف الرقم: Wasl-X تطلب الرقم بصيغة الدولية بدون (+) مثل: 201234567890
  const recipient = String(phone).trim().replace(/^\+/, "");

  const payload = {
    phone: recipient,
    otp: String(otp),
    message: `Your JEVORYA verification code is: ${otp}`,
  };

  try {
    console.log(`Attempting to send OTP to ${recipient} via Wasl-X...`);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Wasl-X API Error Response:", data);
      const error = new Error(data.message || "WhatsApp OTP request failed via Wasl-X");
      error.statusCode = 502;
      throw error;
    }

    console.log(`✅ OTP sent successfully via Wasl-X. Message ID: ${data.id || 'N/A'}`);
    
    return {
      success: true,
      provider: "wasl-x",
      data: data
    };
  } catch (error) {
    console.error("Wasl-X Service Error:", error.message);
    if (error.statusCode) throw error;

    const networkError = new Error("Could not connect to WhatsApp OTP service (Wasl-X)");
    networkError.statusCode = 502;
    throw networkError;
  }
};

export default {
  sendWhatsAppOtp,
};