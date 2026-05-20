import "dotenv/config";
import nodemailer from "nodemailer";
import {
  verificationOTPEmail,
  passwordResetOTPEmail,
  welcomeEmail,
} from "./email/templates.js";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM = process.env.SMTP_FROM || "Streamify <noreply@streamify.app>";

async function sendEmail({ to, subject, html }) {
  try {
    const info = await transporter.sendMail({
      from: FROM,
      to,
      subject,
      html,
    });

    console.log(`Email sent to ${to}: ${subject} (id: ${info.messageId})`);
    return info;
  } catch (err) {
    console.error("Error sending email:", err.message);
    throw err;
  }
}

export async function sendVerificationOTP(email, otp) {
  return sendEmail({
    to: email,
    subject: "Verify your email — Streamify",
    html: verificationOTPEmail(otp),
  });
}

export async function sendPasswordResetOTP(email, otp) {
  return sendEmail({
    to: email,
    subject: "Reset your password — Streamify",
    html: passwordResetOTPEmail(otp),
  });
}

export async function sendWelcomeEmail(email, name) {
  return sendEmail({
    to: email,
    subject: "Welcome to Streamify!",
    html: welcomeEmail(name),
  });
}

export async function sendOTPEmail(email, otp, purpose = "verification") {
  if (purpose === "reset") {
    return sendPasswordResetOTP(email, otp);
  }
  return sendVerificationOTP(email, otp);
}
