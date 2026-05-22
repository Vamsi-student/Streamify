import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const pendingUserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    default: null,
  },
  profilePic: {
    type: String,
    default: "",
  },
  otpHash: {
    type: String,
    required: true,
  },
  otpExpires: {
    type: Date,
    required: true,
  },
  otpAttempts: {
    type: Number,
    default: 0,
  },
  lastResendAt: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: { expires: 900 },
  },
});

pendingUserSchema.methods.verifyOTP = async function (plainOtp) {
  if (this.otpAttempts >= 5) {
    return { valid: false, message: "Too many failed attempts. Please request a new OTP." };
  }
  const match = await bcrypt.compare(plainOtp, this.otpHash);
  if (!match) {
    this.otpAttempts += 1;
    await this.save();
    return { valid: false, message: "Invalid OTP" };
  }
  return { valid: true };
};

pendingUserSchema.methods.canResend = function () {
  if (!this.lastResendAt) return true;
  const elapsed = Date.now() - new Date(this.lastResendAt).getTime();
  return elapsed >= 30000;
};

const PendingUser = mongoose.model("PendingUser", pendingUserSchema);

export default PendingUser;
