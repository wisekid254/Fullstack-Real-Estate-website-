import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendOTPEmail = async ({ to, name, otp }) => {
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
        .warning { background: #fef3c7; border-radius: 8px; padding: 12px 16px; font-size: 13px; color: #92400e; margin-top: 24px; }
        .footer { padding: 24px 32px; border-top: 1px solid #f1f3f7; text-align: center; font-size: 12px; color: #9ca3af; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">nestHaven</div>
        </div>
        <div class="body">
          <p class="greeting">Hi ${name},</p>
          <p class="text">
            You requested to sign in to your nestHaven account.
            Use the verification code below to complete your login.
          </p>
          <div class="otp-box">
            <div class="otp">${otp}</div>
            <div class="expiry">Expires in 10 minutes</div>
          </div>
          <div class="warning">
            If you did not request this code, please ignore this email.
            Your account is still secure.
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
    subject: "Your nestHaven login code",
    html,
  });
};

export const sendWelcomeEmail = async ({ to, name }) => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: "Welcome to nestHaven!",
    html: `
      <div style="font-family: Inter, Arial, sans-serif; max-width: 480px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
        <div style="background: #111827; padding: 32px; text-align: center;">
          <div style="color: #6b96f5; font-size: 24px; font-weight: 700;">nestHaven</div>
        </div>
        <div style="padding: 40px 32px;">
          <p style="font-size: 18px; font-weight: 600; color: #111827;">Welcome, ${name}!</p>
          <p style="font-size: 14px; color: #6b7280; line-height: 1.6;">
            Your account has been created successfully. You can now browse listings,
            save favourites, and connect with agents.
          </p>
          <a href="${process.env.CLIENT_URL}" style="display: inline-block; background: #3b6ef4; color: white; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: 600; margin-top: 16px;">
            Browse properties
          </a>
        </div>
      </div>
    `,
  });
};
