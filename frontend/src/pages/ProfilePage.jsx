import { useParams, Link, useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAuthUser from "../hooks/useAuthUser";
import { getUserById, sendFriendRequest } from "../lib/api";
import { useStreamChat } from "../context/StreamChatContext";
import { capitialize, getLanguageFlag, formatLastSeen } from "../lib/utils";
import { ArrowLeftIcon, MapPinIcon, MessageCircleIcon, UserPlusIcon, CheckCircleIcon } from "lucide-react";
import toast from "react-hot-toast";

const ProfilePage = () => {
  const { id: profileUserId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { authUser } = useAuthUser();
  const { isUserOnline } = useStreamChat();
  const isOwnProfile = authUser?._id === profileUserId;

  const { data: profileData, isLoading } = useQuery({
    queryKey: ["userProfile", profileUserId],
    queryFn: () => getUserById(profileUserId),
    enabled: !!profileUserId,
  });

  const user = profileData?.user;
  const isFriend = profileData?.isFriend;

  const { data: outgoingFriendReqs } = useQuery({
    queryKey: ["outgoingFriendReqs"],
    enabled: !isOwnProfile,
  });

  const hasPendingRequest = outgoingFriendReqs?.some(
    (req) => req.recipient._id === profileUserId
  );

  const { mutate: sendReqMutation, isPending } = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: () => {
      toast.success("Friend request sent!");
      queryClient.invalidateQueries({ queryKey: ["outgoingFriendReqs"] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to send request");
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
        <p className="text-lg opacity-70">User not found</p>
        <button onClick={() => navigate(-1)} className="btn btn-outline">Go back</button>
      </div>
    );
  }

  const online = isUserOnline(user._id);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
      <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm mb-4 gap-2">
        <ArrowLeftIcon className="size-4" />
        Back
      </button>

      <div className="card bg-base-200">
        <div className="card-body p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <div className="relative">
              <div className="avatar size-24 rounded-full">
                <img src={user.profilePic} alt={user.fullName} />
              </div>
              <span
                className={`absolute bottom-1 right-1 size-4 rounded-full border-2 border-base-200 ${
                  online ? "bg-success" : "bg-gray-400"
                }`}
              />
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-bold">{user.fullName}</h1>
              <p className="text-sm opacity-70 mt-1">
                {online ? (
                  <span className="text-success flex items-center gap-1 justify-center sm:justify-start">
                    <span className="size-2 rounded-full bg-success inline-block" />
                    Online
                  </span>
                ) : (
                  `Last seen ${formatLastSeen(user.lastActive)}`
                )}
              </p>
              {user.location && (
                <div className="flex items-center gap-1 text-xs opacity-70 mt-1 justify-center sm:justify-start">
                  <MapPinIcon className="size-3" />
                  {user.location}
                </div>
              )}
            </div>

            {!isOwnProfile && (
              <div className="flex gap-2">
                <Link to={`/chat/${user._id}`} className="btn btn-primary gap-2">
                  <MessageCircleIcon className="size-4" />
                  Message
                </Link>
                {!isFriend && (
                  <button
                    className={`btn gap-2 ${hasPendingRequest ? "btn-disabled" : "btn-outline"}`}
                    disabled={hasPendingRequest || isPending}
                    onClick={() => sendReqMutation(user._id)}
                  >
                    {hasPendingRequest ? (
                      <><CheckCircleIcon className="size-4" /> Request Sent</>
                    ) : (
                      <><UserPlusIcon className="size-4" /> Add Friend</>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>

          {user.bio && (
            <div>
              <h3 className="font-semibold mb-1">Bio</h3>
              <p className="opacity-70">{user.bio}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <span className="badge badge-secondary badge-lg">
              {getLanguageFlag(user.nativeLanguage)}
              Native: {capitialize(user.nativeLanguage)}
            </span>
            <span className="badge badge-outline badge-lg">
              {getLanguageFlag(user.learningLanguage)}
              Learning: {capitialize(user.learningLanguage)}
            </span>
          </div>

          {user.friends?.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">{user.friends.length} Friends</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
