import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { verifyEmail, resendOTP, logout } from "../lib/api";
import { MailIcon, ArrowLeftIcon, RefreshCwIcon, LogOutIcon } from "lucide-react";
import toast from "react-hot-toast";
import useAuthUser from "../hooks/useAuthUser";

const STORAGE_KEY = "verify_email";

const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);

  const { authUser, isLoading } = useAuthUser();

  const email = location.state?.email || sessionStorage.getItem(STORAGE_KEY);

  useEffect(() => {
    if (email && !sessionStorage.getItem(STORAGE_KEY)) {
      sessionStorage.setItem(STORAGE_KEY, email);
    }
  }, [email]);

  useEffect(() => {
    if (authUser?.isVerified) {
      sessionStorage.removeItem(STORAGE_KEY);
      navigate(authUser?.isOnboarded ? "/" : "/onboarding", { replace: true });
    }
  }, [authUser, navigate]);

  useEffect(() => {
    if (!email && !isLoading && !authUser) {
      navigate("/signup", { replace: true });
    }
  }, [email, isLoading, authUser, navigate]);

  const queryClient = useQueryClient();

  const { mutate: verifyMutation, isPending: isVerifying } = useMutation({
    mutationFn: () => verifyEmail({ email, otp: otp.join("") }),
    onSuccess: (data) => {
      sessionStorage.removeItem(STORAGE_KEY);
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      toast.success("Email verified successfully!");
      navigate(data?.user?.isOnboarded ? "/" : "/onboarding", { replace: true });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Verification failed");
    },
  });

  const { mutate: logoutMutation } = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      sessionStorage.removeItem(STORAGE_KEY);
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      navigate("/login");
    },
  });

  const { mutate: resendMutation, isPending: isResending } = useMutation({
    mutationFn: () => resendOTP(email),
    onSuccess: () => {
      toast.success("New OTP sent to your email");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to resend OTP");
    },
  });

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newOtp = ["", "", "", "", "", ""];
    pasted.split("").forEach((char, i) => { newOtp[i] = char; });
    setOtp(newOtp);
    const focusIdx = Math.min(pasted.length, 5);
    inputRefs.current[focusIdx]?.focus();
  };

  if (!email) {
    return (
      <div className="min-h-dvh py-6 md:py-12 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh py-6 md:py-12 flex items-center justify-center p-4">
      <div className="card bg-base-200 w-full max-w-md p-6 sm:p-8">
        <div className="text-center mb-6">
          <div className="mx-auto size-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <MailIcon className="size-8 text-primary" />
          </div>
          <h1 className="text-xl font-bold">Verify Your Email</h1>
          <p className="text-sm opacity-70 mt-2">
            Enter the 6-digit code sent to <strong>{email}</strong>
          </p>
        </div>

        <div className="flex justify-center gap-2 mb-6">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={index === 0 ? handlePaste : undefined}
              className="input input-bordered w-10 sm:w-11 h-12 text-center text-lg font-bold"
            />
          ))}
        </div>

        <button
          className="btn btn-primary w-full"
          onClick={verifyMutation}
          disabled={otp.some((d) => !d) || isVerifying || !email}
        >
          {isVerifying ? (
            <><span className="loading loading-spinner loading-xs" /> Verifying...</>
          ) : (
            "Verify Email"
          )}
        </button>

        <div className="text-center mt-4">
          <button
            className="btn btn-ghost btn-sm gap-2"
            onClick={resendMutation}
            disabled={isResending}
          >
            <RefreshCwIcon className={`size-4 ${isResending ? "animate-spin" : ""}`} />
            Resend OTP
          </button>
        </div>

        <div className="flex justify-center gap-4 mt-2">
          <button onClick={logoutMutation} className="btn btn-ghost btn-xs gap-1">
            <ArrowLeftIcon className="size-3" /> Back to Login
          </button>
          <button onClick={logoutMutation} className="btn btn-ghost btn-xs gap-1 text-error">
            <LogOutIcon className="size-3" /> Sign out
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
