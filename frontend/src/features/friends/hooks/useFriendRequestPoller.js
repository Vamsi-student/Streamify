import { useRef, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getFriendReqs } from "../../../shared/lib/api";
import useAuthUser from "../../auth/hooks/useAuthUser";
import toast from "react-hot-toast";

const useFriendRequestPoller = () => {
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();
  const prevCountRef = useRef(0);

  const { data } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendReqs,
    enabled: !!authUser,
    refetchInterval: !!authUser ? 20000 : false,
    retry: 3,
  });

  useEffect(() => {
    if (!data?.incomingReqs) return;

    const currentCount = data.incomingReqs.length;
    const prevCount = prevCountRef.current;

    if (prevCount > 0 && currentCount > prevCount) {
      const diff = currentCount - prevCount;
      toast.success(`${diff} new friend request${diff > 1 ? "s" : ""}!`, { duration: 5000 });
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
    }

    prevCountRef.current = currentCount;
  }, [data, queryClient]);
};

export default useFriendRequestPoller;
