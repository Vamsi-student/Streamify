import { useState } from "react";
import { ShipWheelIcon, Lock, CheckCircle } from "lucide-react";
import { Link, useParams } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { resetPassword } from "../lib/api";
import toast from "react-hot-toast";

const ResetPasswordPage = () => {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { mutate, isPending, isSuccess } = useMutation({
    mutationFn: (data) => resetPassword(token, data.password),
    onSuccess: () => toast.success("Password reset! You are now logged in."),
    onError: (error) => toast.error(error.response?.data?.message || "Invalid or expired link"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast.error("Passwords do not match");
    }
    mutate({ password });
  };

  if (isSuccess) {
    return (
      <div className="min-h-dvh py-6 md:py-12 flex items-center justify-center p-4">
        <div className="border border-primary/25 w-full max-w-md mx-auto bg-base-100 rounded-xl shadow-lg p-8 text-center space-y-4">
          <CheckCircle className="size-16 text-success mx-auto" />
          <h2 className="text-xl font-semibold">Password Reset Successful</h2>
          <p className="text-sm opacity-70">You are now logged in. Start using Streamify!</p>
          <Link to="/" className="btn btn-primary w-full">Go to Home</Link>
        </div>
      </div>
    );
  }

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
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold">Reset Password</h2>
                  <p className="text-sm opacity-70">Choose a new password for your account</p>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="form-control w-full space-y-2">
                    <label className="label">
                      <span className="label-text">New Password</span>
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="input input-bordered w-full"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      minLength={6}
                      required
                    />
                    <p className="text-xs opacity-70">Must be at least 6 characters</p>
                  </div>

                  <div className="form-control w-full space-y-2">
                    <label className="label">
                      <span className="label-text">Confirm Password</span>
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="input input-bordered w-full"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      minLength={6}
                      required
                    />
                  </div>

                  <button type="submit" className="btn btn-primary w-full" disabled={isPending}>
                    {isPending ? (
                      <>
                        <span className="loading loading-spinner loading-xs"></span>
                        Resetting...
                      </>
                    ) : (
                      "Reset Password"
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        <div className="hidden lg:flex w-full lg:w-1/2 bg-primary/10 items-center justify-center">
          <div className="max-w-md p-8 text-center space-y-4">
            <Lock className="size-16 mx-auto text-primary" />
            <h2 className="text-xl font-semibold">Secure your account</h2>
            <p className="opacity-70">Choose a strong password you haven't used before</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
