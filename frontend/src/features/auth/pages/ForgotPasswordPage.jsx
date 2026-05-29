import { useState, useRef } from "react";
import { ShipWheelIcon, ArrowLeft, Mail, KeyRound } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { forgotPassword, verifyResetOTP } from "../../../shared/lib/api";
import toast from "react-hot-toast";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [emailSent, setEmailSent] = useState(false);
  const inputRefs = useRef([]);

  const { mutate: sendOtp, isPending: isSending } = useMutation({
    mutationFn: forgotPassword,
    onSuccess: () => {
      toast.success("OTP sent to your email");
      setEmailSent(true);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    },
    onError: (error) => toast.error(error.response?.data?.message || "Something went wrong"),
  });

  const { mutate: verifyOtp, isPending: isVerifying } = useMutation({
    mutationFn: () => verifyResetOTP(email, otp.join("")),
    onSuccess: (data) => {
      toast.success("OTP verified! Set a new password.");
      navigate(`/reset-password/${data.resetToken}`);
    },
    onError: (error) => toast.error(error.response?.data?.message || "Invalid or expired OTP"),
  });

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    sendOtp(email);
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    verifyOtp();
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newOtp = ["", "", "", "", "", ""];
    pasted.split("").forEach((char, i) => { newOtp[i] = char; });
    setOtp(newOtp);
    const focusIdx = Math.min(pasted.length, 5);
    inputRefs.current[focusIdx]?.focus();
  };

  return (
    <div className="min-h-dvh py-6 md:py-12 flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="border border-primary/25 flex flex-col lg:flex-row w-full max-w-5xl mx-auto bg-base-100 rounded-xl shadow-lg overflow-hidden">
        <div className="w-full lg:w-1/2 p-4 sm:p-8 flex flex-col">
          <div className="mb-4 flex items-center justify-start gap-2">
            <ShipWheelIcon className="size-9 text-primary" />
            <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
              Streamify
            </span>
          </div>

          <div className="w-full">
            {!emailSent ? (
              <form onSubmit={handleEmailSubmit}>
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-semibold">Forgot Password</h2>
                    <p className="text-sm opacity-70">
                      Enter your email and we&apos;ll send you a reset code
                    </p>
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="form-control w-full space-y-2">
                      <label className="label">
                        <span className="label-text">Email</span>
                      </label>
                      <input
                        type="email"
                        placeholder="hello@example.com"
                        className="input input-bordered w-full"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>

                    <button type="submit" className="btn btn-primary w-full" disabled={isSending}>
                      {isSending ? (
                        <>
                          <span className="loading loading-spinner loading-xs"></span>
                          Sending...
                        </>
                      ) : (
                        "Send Reset Code"
                      )}
                    </button>

                    <Link to="/login" className="btn btn-ghost w-full gap-2">
                      <ArrowLeft className="size-4" />
                      Back to Login
                    </Link>
                  </div>
                </div>
              </form>
            ) : (
              <form onSubmit={handleOtpSubmit}>
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-semibold">Enter Reset Code</h2>
                    <p className="text-sm opacity-70">
                      We sent a 6-digit code to <strong>{email}</strong>
                    </p>
                  </div>

                  <div className="flex justify-center gap-2">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => { inputRefs.current[index] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        onPaste={index === 0 ? handleOtpPaste : undefined}
                        className="input input-bordered w-10 sm:w-11 h-12 text-center text-lg font-bold"
                      />
                    ))}
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-full"
                    disabled={otp.some((d) => !d) || isVerifying}
                  >
                    {isVerifying ? (
                      <>
                        <span className="loading loading-spinner loading-xs"></span>
                        Verifying...
                      </>
                    ) : (
                      "Verify Code"
                    )}
                  </button>

                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={() => { setEmailSent(false); setOtp(["", "", "", "", "", ""]); }}
                      className="btn btn-ghost btn-sm gap-1"
                    >
                      <ArrowLeft className="size-3" /> Change email
                    </button>
                    <button
                      type="button"
                      onClick={() => sendOtp(email)}
                      disabled={isSending}
                      className="btn btn-ghost btn-sm gap-1"
                    >
                      <KeyRound className="size-3" /> Resend code
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>

        <div className="hidden lg:flex w-full lg:w-1/2 bg-primary/10 items-center justify-center">
          <div className="max-w-md p-8 text-center space-y-4">
            <Mail className="size-16 mx-auto text-primary" />
            <h2 className="text-xl font-semibold">Don&apos;t worry, we&apos;ve got you covered</h2>
            <p className="opacity-70">
              We&apos;ll send a 6-digit reset code to your email. It expires in 10 minutes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
