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
