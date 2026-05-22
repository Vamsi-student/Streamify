const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN = 6;
const OTP_EXPIRY_MS = 10 * 60 * 1000;
export const RESEND_COOLDOWN_MS = 30 * 1000;
export const MAX_OTP_ATTEMPTS = 5;

export function validateEmail(email) {
  if (!email || typeof email !== "string") {
    return { valid: false, message: "Email is required" };
  }
  const trimmed = email.trim().toLowerCase();
  if (trimmed.length > 254) {
    return { valid: false, message: "Email is too long" };
  }
  if (!EMAIL_REGEX.test(trimmed)) {
    return { valid: false, message: "Invalid email format" };
  }
  return { valid: true, value: sanitizeInput(trimmed) };
}

export function validatePassword(password) {
  if (!password || typeof password !== "string") {
    return { valid: false, message: "Password is required" };
  }
  if (password.length < PASSWORD_MIN) {
    return { valid: false, message: `Password must be at least ${PASSWORD_MIN} characters` };
  }
  if (password.length > 128) {
    return { valid: false, message: "Password is too long" };
  }
  return { valid: true };
}

export function validateFullName(name) {
  if (!name || typeof name !== "string") {
    return { valid: false, message: "Full name is required" };
  }
  const trimmed = name.trim();
  if (trimmed.length < 1 || trimmed.length > 100) {
    return { valid: false, message: "Full name must be between 1 and 100 characters" };
  }
  if (/<[a-z][\s\S]*>/i.test(trimmed)) {
    return { valid: false, message: "Full name must not contain HTML tags" };
  }
  return { valid: true, value: sanitizeInput(trimmed) };
}

export function validateBio(bio) {
  if (!bio || typeof bio !== "string") {
    return { valid: false, message: "Bio is required" };
  }
  const trimmed = bio.trim();
  if (trimmed.length > 500) {
    return { valid: false, message: "Bio must be under 500 characters" };
  }
  return { valid: true, value: sanitizeInput(trimmed) };
}

export function validateLanguage(language) {
  if (!language || typeof language !== "string") {
    return { valid: false, message: "Language is required" };
  }
  const trimmed = language.trim();
  if (trimmed.length < 1 || trimmed.length > 50) {
    return { valid: false, message: "Language must be between 1 and 50 characters" };
  }
  return { valid: true, value: sanitizeInput(trimmed) };
}

export function validateOTP(otp) {
  if (!otp || typeof otp !== "string") {
    return { valid: false, message: "OTP is required" };
  }
  if (!/^\d{6}$/.test(otp)) {
    return { valid: false, message: "OTP must be a 6-digit number" };
  }
  return { valid: true };
}

export function sanitizeInput(value) {
  if (typeof value !== "string") return value;
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

export function generateOTP() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function getOTPExpiry() {
  return new Date(Date.now() + OTP_EXPIRY_MS);
}

export function isOTPExpired(expiryDate) {
  return !expiryDate || new Date() > new Date(expiryDate);
}

export function sanitizeUser(user) {
  if (!user) return null;
  const obj = user.toObject ? user.toObject() : { ...user };
  const sensitive = [
    "password", "verificationOTP", "verificationOTPExpires",
    "resetPasswordToken", "resetPasswordExpires", "resetOTP", "resetOTPExpires",
  ];
  sensitive.forEach((field) => delete obj[field]);
  return obj;
}
