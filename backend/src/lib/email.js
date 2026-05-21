import "dotenv/config";
import sgMail from "@sendgrid/mail";
import {
  verificationOTPEmail,
  passwordResetOTPEmail,
  welcomeEmail,
} from "./email/templates.js";

sgMail.setApiKey(process.env.SENDGRID_API_KEY || "");

const FROM = process.env.SMTP_FROM || "Streamify <noreply@streamify.app>";

async function sendEmail({ to, subject, html }) {
  try {
    const [response] = await sgMail.send({
      from: FROM,
      to,
      subject,
      html,
    });

    console.log(`Email sent to ${to}: ${subject} (status: ${response.statusCode})`);
    return response;
  } catch (err) {
    console.error("Error sending email:", err.response?.body || err);
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
  if (!process.env.SENDGRID_API_KEY) {
    console.error("SendGrid: SENDGRID_API_KEY is not set");
    return;
  }
  if (process.env.NODE_ENV !== "production") {
    console.log("SendGrid: API key is configured");
  }
}
