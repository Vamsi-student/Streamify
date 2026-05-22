import "dotenv/config";
import nodemailer from "nodemailer";
import {
  verificationOTPEmail,
  passwordResetOTPEmail,
  welcomeEmail,
} from "./email/templates.js";

const FROM = process.env.SMTP_FROM || "Streamify <noreply@streamify.app>";

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASS,
  },
});

async function sendEmail({ to, subject, html }) {
  try {
    const info = await transporter.sendMail({
      from: FROM,
      to,
      subject,
      html,
    });

    console.log(`Email sent to ${to}: ${subject} (messageId: ${info.messageId})`);
    return info;
  } catch (err) {
    console.error("Error sending email:", err);
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

export async function verifyEmailConfig() {
  if (!process.env.BREVO_SMTP_USER || !process.env.BREVO_SMTP_PASS) {
    console.error("Brevo: BREVO_SMTP_USER or BREVO_SMTP_PASS is not set");
    return;
  }
  if (process.env.NODE_ENV !== "production") {
    console.log("Brevo: SMTP credentials are configured");
  }
}
