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
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((error) => {
  if (error) {
    console.error("SMTP ERROR:", error);
  } else {
    console.log("SMTP server is ready to send emails");
  }
});

export const sendOTPEmail = async ({ to, name, otp }) => {
  const html = `
    <!DOCTYPE html>
    <html>
      <body style="font-family: Arial, sans-serif;">
        <h2>Hello ${name}</h2>
        <p>Your verification code is:</p>
        <h1>${otp}</h1>
        <p>This code expires in 10 minutes.</p>
      </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject: "Your nestHaven login code",
      html,
    });

    console.log("OTP EMAIL SENT:", info.messageId);
    return info;
  } catch (error) {
    console.error("SEND EMAIL ERROR:", error);
    throw error;
  }
};
export const sendVerificationEmail = async ({ to, name, otp }) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Inter, Arial, sans-serif; background: #f8f9fb; margin: 0; padding: 0; }
        .container { max-width: 480px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
        .header { background: #111827; padding: 32px; text-align: center; }
        .logo { color: #6b96f5; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
        .body { padding: 40px 32px; }
        .greeting { font-size: 18px; font-weight: 600; color: #111827; margin-bottom: 12px; }
        .text { font-size: 14px; color: #6b7280; line-height: 1.6; margin-bottom: 24px; }
        .otp-box { background: #f1f3f7; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0; }
        .otp { font-size: 40px; font-weight: 700; letter-spacing: 12px; color: #3b6ef4; font-family: monospace; }
        .expiry { font-size: 12px; color: #9ca3af; margin-top: 8px; }
        .footer { padding: 24px 32px; border-top: 1px solid #f1f3f7; text-align: center; font-size: 12px; color: #9ca3af; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">nestHaven</div>
        </div>
        <div class="body">
          <p class="greeting">Welcome, ${name}!</p>
          <p class="text">
            Thanks for signing up. Enter the code below to verify your email
            address and activate your account.
          </p>
          <div class="otp-box">
            <div class="otp">${otp}</div>
            <div class="expiry">Expires in 10 minutes</div>
          </div>
        </div>
        <div class="footer">
          © 2025 nestHaven. This is an automated message, please do not reply.
        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: "Verify your nestHaven account",
    html,
  });
};

export const sendWelcomeEmail = async ({ to, name }) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject: "Welcome to nestHaven!",
      html: `
        <h2>Welcome ${name}!</h2>
        <p>Your account has been created successfully.</p>
      `,
    });

    console.log("WELCOME EMAIL SENT:", info.messageId);
    return info;
  } catch (error) {
    console.error("WELCOME EMAIL ERROR:", error);
    throw error;
  }
};
