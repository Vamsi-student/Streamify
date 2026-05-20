import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login } from "../lib/api";
import toast from "react-hot-toast";

const useLogin = () => {
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
        toast.error(data.message || "Please verify your email first");
      }
    },
  });

  return { error, isPending, loginMutation: mutate };
};

export default useLogin;
