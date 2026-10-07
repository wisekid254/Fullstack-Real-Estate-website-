import nodemailer from "nodemailer";

console.log("=== EMAIL CONFIGURATION ===");
console.log({
  EMAIL_HOST: process.env.EMAIL_HOST,
  EMAIL_PORT: process.env.EMAIL_PORT,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS_EXISTS: !!process.env.EMAIL_PASS,
  EMAIL_FROM: process.env.EMAIL_FROM,
});

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: Number(process.env.EMAIL_PORT) === 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send login OTP email
 */
export const sendOTPEmail = async ({ to, name, otp }) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject: "Your NestHaven Login Verification Code",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px;">
        <h2 style="color: #2563eb;">NestHaven Login Verification</h2>

        <p>Hello ${name || "there"},</p>

        <p>Your login verification code is:</p>

        <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center; padding: 20px; background: #f1f5f9; border-radius: 10px;">
          ${otp}
        </div>

        <p>This code is required to complete your NestHaven login.</p>

        <p>If you did not attempt to log in, you can safely ignore this email.</p>

        <p>Regards,<br><strong>NestHaven Team</strong></p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};

/**
 * Send signup email verification OTP
 */
export const sendVerificationEmail = async ({ to, name, otp }) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject: "Verify Your NestHaven Account",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px;">
        <h2 style="color: #2563eb;">Welcome to NestHaven</h2>

        <p>Hello ${name || "there"},</p>

        <p>Thank you for creating a NestHaven account.</p>

        <p>Please use the verification code below to verify your email address:</p>

        <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center; padding: 20px; background: #f1f5f9; border-radius: 10px;">
          ${otp}
        </div>

        <p>Enter this code in NestHaven to activate your account.</p>

        <p>If you did not create this account, you can safely ignore this email.</p>

        <p>Regards,<br><strong>NestHaven Team</strong></p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};

/**
 * Send welcome email after successful verification
 */
export const sendWelcomeEmail = async ({ to, name }) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject: "Welcome to NestHaven!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px;">
        <h2 style="color: #2563eb;">Welcome to NestHaven, ${name || "there"}!</h2>

        <p>Your email has been successfully verified.</p>

        <p>Your NestHaven account is now active.</p>

        <p>You can now:</p>

        <ul>
          <li>Browse properties</li>
          <li>Save your favorite properties</li>
          <li>Send property inquiries</li>
          <li>Connect with property agents</li>
        </ul>

        <p>We're happy to have you with us.</p>

        <p>Regards,<br><strong>NestHaven Team</strong></p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};

/**
 * Send property inquiry notification
 */
export const sendInquiryNotification = async ({
  recipientEmail,
  recipientName,
  buyerName,
  buyerEmail,
  buyerPhone,
  propertyTitle,
  message,
}) => {
  try {
    if (!recipientEmail) {
      console.warn("No recipient email provided for inquiry notification.");
      return;
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: recipientEmail,
      subject: `New Inquiry for ${propertyTitle || "Your Property"}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px;">
          <h2 style="color: #2563eb;">New Property Inquiry</h2>

          <p>Hello ${recipientName || "there"},</p>

          <p>
            You have received a new inquiry about:
            <strong>${propertyTitle || "your property"}</strong>
          </p>

          <div style="background: #f8fafc; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <p><strong>Interested Person:</strong> ${buyerName || "Not provided"}</p>
            <p><strong>Email:</strong> ${buyerEmail || "Not provided"}</p>
            <p><strong>Phone:</strong> ${buyerPhone || "Not provided"}</p>
          </div>

          <div style="background: #f1f5f9; padding: 20px; border-radius: 10px;">
            <p><strong>Message:</strong></p>
            <p>${message || "No message provided."}</p>
          </div>

          <p style="margin-top: 25px;">
            Log in to your NestHaven account to view and respond to this inquiry.
          </p>

          <hr style="margin-top: 30px; border: none; border-top: 1px solid #e2e8f0;" />

          <p style="font-size: 12px; color: #64748b;">
            This is an automated notification from NestHaven.
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log(
      `Inquiry notification email sent successfully: ${info.messageId}`
    );

    return info;
  } catch (error) {
    console.error("Failed to send inquiry notification email:", error);
    throw error;
  }
};

export default transporter;
