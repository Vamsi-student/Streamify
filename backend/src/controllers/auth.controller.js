import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { upsertStreamUser } from "../lib/stream.js";
import User from "../models/user.js";
import RefreshToken from "../models/RefreshToken.js";
import { sendOTPEmail } from "../lib/email.js";
import {
  validateEmail,
  validatePassword,
  validateFullName,
  validateBio,
  validateLanguage,
  validateOTP,
  generateOTP,
  getOTPExpiry,
  isOTPExpired,
  sanitizeUser,
} from "../lib/validators.js";

const ACCESS_TOKEN_EXPIRY = "15m";
const ACCESS_TOKEN_MS = 15 * 60 * 1000;
const REFRESH_TOKEN_MS = 7 * 24 * 60 * 60 * 1000;

function generateAccessToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET_KEY, { expiresIn: ACCESS_TOKEN_EXPIRY });
}

async function generateTokens(userId) {
  const accessToken = generateAccessToken(userId);
  const rawToken = crypto.randomBytes(40).toString("hex");
  const tokenHash = await bcrypt.hash(rawToken, 10);

  const tokenDoc = await RefreshToken.create({
    user: userId,
    tokenHash,
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_MS),
  });

  const refreshToken = `${tokenDoc._id}.${rawToken}`;

  return { accessToken, refreshToken };
}

function setTokenCookies(res, accessToken, refreshToken) {
  res.cookie("access_token", accessToken, {
    maxAge: ACCESS_TOKEN_MS,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });
  res.cookie("refresh_token", refreshToken, {
    maxAge: REFRESH_TOKEN_MS,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/api/auth",
  });
}

// ─── SIGNUP ───────────────────────────────────────────────────────────────────

export async function signup(req, res) {
  try {
    const emailResult = validateEmail(req.body.email);
    if (!emailResult.valid) return res.status(400).json({ message: emailResult.message });

    const passwordResult = validatePassword(req.body.password);
    if (!passwordResult.valid) return res.status(400).json({ message: passwordResult.message });

    const nameResult = validateFullName(req.body.fullName);
    if (!nameResult.valid) return res.status(400).json({ message: nameResult.message });

    const existingUser = await User.findOne({ email: emailResult.value });
    if (existingUser) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }

    const idx = Math.floor(Math.random() * 100) + 1;
    const randomAvatar = `https://api.dicebear.com/9.x/avataaars/svg?seed=${idx}`;

    const otp = generateOTP();

    const newUser = await User.create({
      email: emailResult.value,
      fullName: nameResult.value,
      password: req.body.password,
      profilePic: randomAvatar,
      verificationOTP: otp,
      verificationOTPExpires: getOTPExpiry(),
      isVerified: false,
    });

    try {
      await upsertStreamUser({
        id: newUser._id.toString(),
        name: newUser.fullName,
        image: newUser.profilePic || "",
      });
    } catch (streamError) {
      console.log("Error creating Stream user:", streamError);
    }

    try {
      await sendOTPEmail(newUser.email, otp, "verification");
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError.message);
      console.log(`\n📧 DEV OTP for ${newUser.email}: ${otp}\n`);
    }

    const tokens = await generateTokens(newUser._id);
    setTokenCookies(res, tokens.accessToken, tokens.refreshToken);

    res.status(201).json({
      success: true,
      message: "Account created. Please verify your email using the OTP sent to your email.",
      user: sanitizeUser(newUser),
    });
  } catch (error) {
    console.error("Error in signup controller", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// ─── VERIFY EMAIL ─────────────────────────────────────────────────────────────

export async function verifyEmail(req, res) {
  try {
    const otpResult = validateOTP(req.body.otp);
    if (!otpResult.valid) return res.status(400).json({ message: otpResult.message });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.isVerified) {
      return res.status(400).json({ message: "Email is already verified" });
    }

    if (!user.verificationOTP) {
      return res.status(400).json({ message: "No OTP requested. Request a new one." });
    }

    if (isOTPExpired(user.verificationOTPExpires)) {
      user.verificationOTP = null;
      user.verificationOTPExpires = null;
      await user.save();
      return res.status(400).json({ message: "OTP has expired. Request a new one." });
    }

    if (user.verificationOTP !== req.body.otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    user.isVerified = true;
    user.verificationOTP = null;
    user.verificationOTPExpires = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("Error in verifyEmail controller:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// ─── RESEND OTP ───────────────────────────────────────────────────────────────

export async function resendOTP(req, res) {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.isVerified) {
      return res.status(400).json({ message: "Email is already verified" });
    }

    const otp = generateOTP();
    user.verificationOTP = otp;
    user.verificationOTPExpires = getOTPExpiry();
    await user.save();

    try {
      await sendOTPEmail(user.email, otp, "verification");
    } catch (emailError) {
      console.error("Failed to send OTP email:", emailError.message);
      console.log(`\n📧 DEV OTP for ${user.email}: ${otp}\n`);
      user.verificationOTP = null;
      user.verificationOTPExpires = null;
      await user.save();
      return res.status(500).json({ message: "Failed to send OTP. Try again later." });
    }

    res.status(200).json({ success: true, message: "A new OTP has been sent to your email" });
  } catch (error) {
    console.error("Error in resendOTP controller:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────

export async function login(req, res) {
  try {
    const emailResult = validateEmail(req.body.email);
    if (!emailResult.valid) return res.status(400).json({ message: emailResult.message });

    if (!req.body.password) {
      return res.status(400).json({ message: "Password is required" });
    }

    const user = await User.findOne({ email: emailResult.value });
    if (!user) return res.status(401).json({ message: "Invalid email or password" });

    const isPasswordCorrect = await user.matchPassword(req.body.password);
    if (!isPasswordCorrect) return res.status(401).json({ message: "Invalid email or password" });

    const tokens = await generateTokens(user._id);
    setTokenCookies(res, tokens.accessToken, tokens.refreshToken);

    if (!user.isVerified) {
      return res.status(200).json({
        success: true,
        needsVerification: true,
        message: "Please verify your email",
        user: sanitizeUser(user),
      });
    }

    res.status(200).json({ success: true, user: sanitizeUser(user) });
  } catch (error) {
    console.error("Error in login controller:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// ─── LOGOUT ───────────────────────────────────────────────────────────────────

export async function logout(req, res) {
  try {
    const cookieVal = req.cookies?.refresh_token;
    if (cookieVal) {
      const parts = cookieVal.split(".");
      if (parts.length === 2) {
        await RefreshToken.findByIdAndDelete(parts[0]);
      }
    }

    res.clearCookie("access_token");
    res.clearCookie("refresh_token", { path: "/api/auth" });
    res.status(200).json({ success: true, message: "Logout successful" });
  } catch (error) {
    console.error("Error in logout controller:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// ─── REFRESH TOKEN ────────────────────────────────────────────────────────────

export async function refreshToken(req, res) {
  try {
    const cookieVal = req.cookies?.refresh_token;
    if (!cookieVal) {
      return res.status(401).json({ message: "No refresh token" });
    }

    const parts = cookieVal.split(".");
    if (parts.length !== 2) {
      res.clearCookie("access_token");
      res.clearCookie("refresh_token", { path: "/api/auth" });
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const [docId, rawToken] = parts;
    const tokenDoc = await RefreshToken.findById(docId);

    if (!tokenDoc || tokenDoc.expiresAt < new Date()) {
      res.clearCookie("access_token");
      res.clearCookie("refresh_token", { path: "/api/auth" });
      return res.status(401).json({ message: "Refresh token expired or revoked" });
    }

    const isValid = await bcrypt.compare(rawToken, tokenDoc.tokenHash);
    if (!isValid) {
      res.clearCookie("access_token");
      res.clearCookie("refresh_token", { path: "/api/auth" });
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    await RefreshToken.findByIdAndDelete(docId);

    const tokens = await generateTokens(tokenDoc.user);
    setTokenCookies(res, tokens.accessToken, tokens.refreshToken);

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error in refreshToken controller:", error);
    if (error.name === "CastError") {
      res.clearCookie("access_token");
      res.clearCookie("refresh_token", { path: "/api/auth" });
      return res.status(401).json({ message: "Invalid refresh token" });
    }
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// ─── ONBOARD ──────────────────────────────────────────────────────────────────

export async function onboard(req, res) {
  try {
    const userId = req.user._id;

    const { fullName, bio, nativeLanguage, learningLanguage, location, profilePic } = req.body;

    const nameResult = validateFullName(fullName);
    if (!nameResult.valid) return res.status(400).json({ message: nameResult.message });

    const bioResult = validateBio(bio);
    if (!bioResult.valid) return res.status(400).json({ message: bioResult.message });

    const nativeResult = validateLanguage(nativeLanguage);
    if (!nativeResult.valid) return res.status(400).json({ message: nativeResult.message });

    const learnResult = validateLanguage(learningLanguage);
    if (!learnResult.valid) return res.status(400).json({ message: learnResult.message });

    if (!location || typeof location !== "string" || !location.trim()) {
      return res.status(400).json({ message: "Location is required" });
    }

    const updateFields = {
      fullName: nameResult.value,
      bio: bioResult.value,
      nativeLanguage: nativeResult.value,
      learningLanguage: learnResult.value,
      location: location.trim(),
      isOnboarded: true,
    };

    if (profilePic && typeof profilePic === "string" && profilePic.trim()) {
      updateFields.profilePic = profilePic.trim();
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateFields, { new: true });

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    try {
      await upsertStreamUser({
        id: updatedUser._id.toString(),
        name: updatedUser.fullName,
        image: updatedUser.profilePic || "",
      });
    } catch (streamError) {
      console.log("Error updating Stream user during onboarding:", streamError.message);
    }

    res.status(200).json({ success: true, user: sanitizeUser(updatedUser) });
  } catch (error) {
    console.error("Onboarding error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// ─── FORGOT PASSWORD ──────────────────────────────────────────────────────────

export async function forgotPassword(req, res) {
  try {
    const emailResult = validateEmail(req.body.email);
    if (!emailResult.valid) return res.status(400).json({ message: emailResult.message });

    const user = await User.findOne({ email: emailResult.value });
    if (!user) {
      return res.status(200).json({
        message: "If an account with that email exists, an OTP has been sent.",
      });
    }

    const otp = generateOTP();
    user.resetOTP = otp;
    user.resetOTPExpires = getOTPExpiry();
    await user.save();

    try {
      await sendOTPEmail(user.email, otp, "reset");
    } catch (emailError) {
      console.error("Failed to send OTP email:", emailError.message);
      console.log(`\n📧 DEV OTP for ${user.email}: ${otp}\n`);
      try {
        user.resetOTP = null;
        user.resetOTPExpires = null;
        await user.save();
      } catch (saveError) {
        console.error("Failed to rollback OTP on user:", saveError.message);
      }
      return res.status(500).json({ message: "Failed to send OTP. Try again later." });
    }

    res.status(200).json({
      message: "If an account with that email exists, an OTP has been sent.",
    });
  } catch (error) {
    console.error("Error in forgotPassword controller:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// ─── VERIFY RESET OTP ─────────────────────────────────────────────────────────

export async function verifyResetOTP(req, res) {
  try {
    const emailResult = validateEmail(req.body.email);
    if (!emailResult.valid) return res.status(400).json({ message: emailResult.message });

    const otpResult = validateOTP(req.body.otp);
    if (!otpResult.valid) return res.status(400).json({ message: otpResult.message });

    const user = await User.findOne({ email: emailResult.value });
    if (!user || !user.resetOTP) {
      return res.status(400).json({ message: "No reset request found for this email" });
    }

    if (isOTPExpired(user.resetOTPExpires)) {
      user.resetOTP = null;
      user.resetOTPExpires = null;
      await user.save();
      return res.status(400).json({ message: "OTP has expired. Request a new one." });
    }

    if (user.resetOTP !== req.body.otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.resetOTP = null;
    user.resetOTPExpires = null;
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000);
    await user.save();

    res.status(200).json({
      success: true,
      message: "OTP verified. Use the reset token to set a new password.",
      resetToken,
    });
  } catch (error) {
    console.error("Error in verifyResetOTP controller:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// ─── RESET PASSWORD ───────────────────────────────────────────────────────────

export async function resetPassword(req, res) {
  try {
    const { token } = req.params;
    const passwordResult = validatePassword(req.body.password);
    if (!passwordResult.valid) return res.status(400).json({ message: passwordResult.message });

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    user.password = req.body.password;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    await RefreshToken.deleteMany({ user: user._id });

    const tokens = await generateTokens(user._id);
    setTokenCookies(res, tokens.accessToken, tokens.refreshToken);

    res.status(200).json({ success: true, message: "Password reset successful" });
  } catch (error) {
    console.error("Error in resetPassword controller:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// ─── GOOGLE OAUTH CALLBACK ────────────────────────────────────────────────────

export async function googleAuthCallback(req, res) {
  try {
    const user = req.user;

    if (!user.isVerified) {
      user.isVerified = true;
      await user.save();
    }

    const tokens = await generateTokens(user._id);
    setTokenCookies(res, tokens.accessToken, tokens.refreshToken);

    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    res.redirect(clientUrl);
  } catch (error) {
    console.error("Error in googleAuthCallback:", error);
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    res.redirect(`${clientUrl}/login?error=google_auth_failed`);
  }
}

// ─── GET ME ───────────────────────────────────────────────────────────────────

export async function getMe(req, res) {
  res.status(200).json({ success: true, user: sanitizeUser(req.user) });
}
