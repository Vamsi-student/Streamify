import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { signup } from "../../../shared/lib/api";
import toast from "react-hot-toast";

const STORAGE_KEY = "verify_email";

const useSignUp = () => {
  const navigate = useNavigate();

  const { mutate, isPending, error } = useMutation({
    mutationFn: signup,
    onSuccess: (data) => {
      sessionStorage.setItem(STORAGE_KEY, data.email);
      toast.success(data?.message || "Verification code sent to your email.");
      navigate("/verify-email", { state: { email: data.email } });
    },
  });

  return { isPending, error, signupMutation: mutate };
};
export default useSignUp;
