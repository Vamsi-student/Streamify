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
  tls: {
    rejectUnauthorized: true,
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
  debug: process.env.NODE_ENV !== "production",
  logger: process.env.NODE_ENV !== "production",
});

async function sendEmail({ to, subject, html }) {
  try {
    const info = await transporter.sendMail({
      from: FROM,
      to,
      subject,
      html,
    });

    console.log(`[EMAIL] Sent to ${to}: "${subject}" — messageId: ${info.messageId}`);
    if (info.rejected?.length) {
      console.error(`[EMAIL] Recipient rejected: ${info.rejected.join(", ")}`);
    }
    if (info.pending?.length) {
      console.warn(`[EMAIL] Recipient pending: ${info.pending.join(", ")}`);
    }
    return info;
  } catch (err) {
    const code = err.code || "UNKNOWN";
    const response = err.response?.toString() || "";

    console.error(`[EMAIL] FAILED to send to ${to}: "${subject}"`);
    console.error(`[EMAIL]   Code: ${code}`);

    if (err.responseCode) {
      console.error(`[EMAIL]   SMTP response code: ${err.responseCode}`);
    }

    if (response.includes("535") || response.includes("Authentication")) {
      console.error(`[EMAIL]   ⛔ AUTH FAILED — BREVO_SMTP_USER or BREVO_SMTP_PASS is invalid`);
    } else if (response.includes("550") || response.includes("not verified")) {
      console.error(`[EMAIL]   ⛔ SENDER NOT VERIFIED — "${FROM}" must be verified in Brevo dashboard`);
    } else if (response.includes("554") || response.includes("not allowed")) {
      console.error(`[EMAIL]   ⛔ SENDER DOMAIN NOT VERIFIED — Verify the sender domain in Brevo`);
    } else if (code === "ESOCKET" || code === "ETIMEDOUT" || code === "ECONNECTION") {
      console.error(`[EMAIL]   ⛔ CONNECTION FAILED — Cannot reach smtp-relay.brevo.com:587`);
    } else {
      console.error(`[EMAIL]   ⛔ Unknown error:`, err.message);
    }

    throw err;
  }
}

export async function verifyConnection() {
  try {
    await transporter.verify();
    console.log(`[EMAIL] Brevo SMTP connection verified ✓ (sender: ${FROM})`);
    return true;
  } catch (err) {
    console.error(`[EMAIL] Brevo SMTP connection FAILED ✗`);
    console.error(`[EMAIL]   Host: smtp-relay.brevo.com:587`);

    if (!process.env.BREVO_SMTP_USER) {
      console.error(`[EMAIL]   BREVO_SMTP_USER is not set in .env`);
    }
    if (!process.env.BREVO_SMTP_PASS) {
      console.error(`[EMAIL]   BREVO_SMTP_PASS is not set in .env`);
    }

    const msg = err.message?.toLowerCase() || "";
    if (msg.includes("auth") || msg.includes("535") || msg.includes("credentials")) {
      console.error(`[EMAIL]   ⛔ Invalid SMTP credentials — check BREVO_SMTP_USER and BREVO_SMTP_PASS`);
    } else if (msg.includes("verify") || msg.includes("sender") || msg.includes("550")) {
      console.error(`[EMAIL]   ⛔ Sender "${FROM}" is not verified in Brevo dashboard`);
    } else if (msg.includes("connect") || msg.includes("econnrefused") || msg.includes("enotfound")) {
      console.error(`[EMAIL]   ⛔ Cannot connect to smtp-relay.brevo.com — check network/firewall`);
    } else {
      console.error(`[EMAIL]   ⛔ ${err.message}`);
    }

    return false;
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
    console.error("[EMAIL] BREVO_SMTP_USER or BREVO_SMTP_PASS is not set in .env");
    console.error("[EMAIL] Emails will NOT be sent until these are configured.");
    return;
  }

  console.log(`[EMAIL] Checking Brevo SMTP connection...`);
  const ok = await verifyConnection();
  if (ok) {
    console.log(`[EMAIL] Brevo is ready to send emails via ${FROM}`);
  } else {
    console.error(`[EMAIL] Brevo SMTP verification failed. Check your credentials and sender verification.`);
  }
}
