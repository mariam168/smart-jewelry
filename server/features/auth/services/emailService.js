import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "true",

  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const sendVerificationEmail = async ({ email, verificationToken }) => {
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,

    to: email,

    subject: "Verify your Smart Jewelry account",

    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        
        <h1>Welcome to Smart Jewelry</h1>

        <p>
          Thank you for creating your account.
        </p>

        <p>
          Please click the button below to verify your email address.
        </p>

        <a
          href="${verificationUrl}"
          style="
            display: inline-block;
            padding: 12px 24px;
            background: #000;
            color: #fff;
            text-decoration: none;
            border-radius: 6px;
          "
        >
          Verify My Email
        </a>

        <p style="margin-top: 20px;">
          This link will expire in 24 hours.
        </p>

      </div>
    `,
  });
};
