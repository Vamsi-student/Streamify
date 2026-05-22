import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { login } from "../lib/api";
import toast from "react-hot-toast";

const useLogin = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { mutate, isPending, error } = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      if (data?.needsVerification) {
        toast.success("Signed in! Please verify your email.");
      }
    },
    onError: (error) => {
      const data = error.response?.data;
      if (data?.needsVerification) {
        sessionStorage.setItem("verify_email", data.email);
        toast.error(data.message || "Please verify your email first");
        navigate("/verify-email", { state: { email: data.email } });
      }
    },
  });

  return { error, isPending, loginMutation: mutate };
};

export default useLogin;
