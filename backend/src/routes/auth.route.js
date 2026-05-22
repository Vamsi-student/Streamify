import express from "express"
import passport from "passport";
import {
  signup, login, logout, refreshToken, onboard, forgotPassword,
  verifyResetOTP, resetPassword, verifyEmail, resendOTP,
  googleAuthCallback, getMe
} from "../controllers/auth.controller.js"
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { authLimiter } from "../middlewares/rateLimiter.js";

const router = express.Router();

router.post("/signup", authLimiter, signup);

router.post("/login", authLimiter, login);

router.post("/logout", logout);

router.post("/refresh", authLimiter, refreshToken);

router.post("/verify-email", authLimiter, verifyEmail);

router.post("/resend-otp", authLimiter, resendOTP);

router.post("/onboarding", authenticateToken, onboard);

router.get("/me", authenticateToken, getMe);

router.post("/forgot-password", authLimiter, forgotPassword);

router.post("/verify-reset-otp", authLimiter, verifyResetOTP);

router.post("/reset-password/:token", authLimiter, resetPassword);

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"], prompt: "select_account" }));

router.get("/google/callback", passport.authenticate("google", { session: false, failureRedirect: `${process.env.CLIENT_URL || "http://localhost:5173"}/login?error=google_auth_failed` }), googleAuthCallback);

export default router;
