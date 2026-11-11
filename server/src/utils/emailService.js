import nodemailer from "nodemailer";

let smtpTransporter = null;

const getSmtp = () => {
  if (!smtpTransporter) {
    smtpTransporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || "587"),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  return smtpTransporter;
};

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const sendMail = async ({ to, subject, html }) => {
  if (process.env.BREVO_API_KEY) {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "api-key": process.env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: {
          name: process.env.EMAIL_FROM_NAME || "nestHaven",
          email: process.env.EMAIL_FROM_ADDRESS,
        },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error("Brevo error " + response.status + ": " + text);
    }
    return;
  }

  await getSmtp().sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  });
};

const layout = (content) => `
  <div style="font-family: Arial, sans-serif; background: #f8f9fb; padding: 24px;">
    <div style="max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden;">
      <div style="background: #111827; padding: 28px; text-align: center;">
        <div style="color: #6b96f5; font-size: 24px; font-weight: 700;">nestHaven</div>
      </div>
      <div style="padding: 32px;">${content}</div>
      <div style="padding: 16px 32px; border-top: 1px solid #f1f3f7; text-align: center; font-size: 12px; color: #9ca3af;">
        This is an automated message, please do not reply.
      </div>
    </div>
  </div>
`;

const otpBlock = (otp) => `
  <div style="background: #f1f3f7; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
    <div style="font-size: 38px; font-weight: 700; letter-spacing: 10px; color: #3b6ef4; font-family: monospace;">${otp}</div>
    <div style="font-size: 12px; color: #9ca3af; margin-top: 8px;">Expires in 10 minutes</div>
  </div>
`;

export const sendOTPEmail = async ({ to, name, otp }) => {
  await sendMail({
    to,
    subject: "Your nestHaven login code",
    html: layout(`
      <p style="font-size: 18px; font-weight: 600; color: #111827;">Hi ${escapeHtml(name)},</p>
      <p style="font-size: 14px; color: #6b7280; line-height: 1.6;">
        Use the code below to complete your sign in.
      </p>
      ${otpBlock(otp)}
      <p style="font-size: 13px; color: #92400e; background: #fef3c7; padding: 12px; border-radius: 8px;">
        If you did not request this code, ignore this email. Your account is still secure.
      </p>
    `),
  });
};

export const sendVerificationEmail = async ({ to, name, otp }) => {
  await sendMail({
    to,
    subject: "Verify your nestHaven account",
    html: layout(`
      <p style="font-size: 18px; font-weight: 600; color: #111827;">Welcome, ${escapeHtml(name)}!</p>
      <p style="font-size: 14px; color: #6b7280; line-height: 1.6;">
        Enter the code below to verify your email address and activate your account.
      </p>
      ${otpBlock(otp)}
    `),
  });
};

export const sendPasswordResetEmail = async ({ to, name, otp }) => {
  await sendMail({
    to,
    subject: "Reset your nestHaven password",
    html: layout(`
      <p style="font-size: 18px; font-weight: 600; color: #111827;">Hi ${escapeHtml(name)},</p>
      <p style="font-size: 14px; color: #6b7280; line-height: 1.6;">
        We received a request to reset your password. Enter the code below on the
        reset page to choose a new password.
      </p>
      ${otpBlock(otp)}
      <p style="font-size: 13px; color: #92400e; background: #fef3c7; padding: 12px; border-radius: 8px;">
        If you did not request a password reset, ignore this email. Your password will not change.
      </p>
    `),
  });
};

export const sendWelcomeEmail = async ({ to, name }) => {
  await sendMail({
    to,
    subject: "Welcome to nestHaven!",
    html: layout(`
      <p style="font-size: 18px; font-weight: 600; color: #111827;">Welcome, ${escapeHtml(name)}!</p>
      <p style="font-size: 14px; color: #6b7280; line-height: 1.6;">
        Your account is ready. You can now browse listings, save favourites and connect with agents.
      </p>
      <a href="${process.env.CLIENT_URL}" style="display: inline-block; background: #3b6ef4; color: #ffffff; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: 600;">
        Browse properties
      </a>
    `),
  });
};

export const sendInquiryNotification = async ({
  agentEmail,
  agentName,
  listingTitle,
  buyerName,
  buyerEmail,
  buyerPhone,
  message,
}) => {
  await sendMail({
    to: agentEmail,
    subject: "New inquiry on: " + listingTitle,
    html: layout(`
      <p style="font-size: 18px; font-weight: 600; color: #111827;">Hi ${escapeHtml(agentName)},</p>
      <p style="font-size: 14px; color: #6b7280; line-height: 1.6;">
        You have a new inquiry on <strong>${escapeHtml(listingTitle)}</strong>.
      </p>
      <div style="background: #f8f9fb; border-radius: 12px; padding: 20px; margin: 20px 0; font-size: 14px;">
        <p style="margin: 0 0 8px;"><strong>Name:</strong> ${escapeHtml(buyerName)}</p>
        <p style="margin: 0 0 8px;"><strong>Email:</strong> ${escapeHtml(buyerEmail)}</p>
        ${buyerPhone ? `<p style="margin: 0 0 8px;"><strong>Phone:</strong> ${escapeHtml(buyerPhone)}</p>` : ""}
        <p style="margin: 0;"><strong>Message:</strong> ${escapeHtml(message)}</p>
      </div>
      <a href="mailto:${escapeHtml(buyerEmail)}" style="display: inline-block; background: #3b6ef4; color: #ffffff; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: 600;">
        Reply to ${escapeHtml(buyerName)}
      </a>
    `),
  });
};
