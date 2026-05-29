import { Link } from "react-router";
import { getLanguageFlag } from "../../../shared/utils/utils";
import { useStreamChat } from "../../chat/context/StreamChatContext";

const FriendCard = ({ friend }) => {
  const { isUserOnline } = useStreamChat();
  const online = isUserOnline(friend._id);

  return (
    <div className="card bg-base-200 hover:shadow-md transition-shadow">
      <div className="card-body p-4">
        <div className="flex items-center gap-3 mb-3">
          <Link to={`/profile/${friend._id}`} className="relative">
            <div className="avatar size-12">
              <img src={friend.profilePic} alt={friend.fullName} />
            </div>
            <span
              className={`absolute bottom-0 right-0 size-3 rounded-full border-2 border-base-200 ${
                online ? "bg-success" : "bg-gray-400"
              }`}
            />
          </Link>
          <Link to={`/profile/${friend._id}`} className="font-semibold truncate hover:underline">
            {friend.fullName}
          </Link>
        </div>

        {online && <p className="text-xs text-success mb-2">Online</p>}

        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className="badge badge-secondary text-xs">
            {getLanguageFlag(friend.nativeLanguage)}
            Native: {friend.nativeLanguage}
          </span>
          <span className="badge badge-outline text-xs">
            {getLanguageFlag(friend.learningLanguage)}
            Learning: {friend.learningLanguage}
          </span>
        </div>

        <Link to={`/chat/${friend._id}`} className="btn btn-outline w-full">
          Message
        </Link>
      </div>
    </div>
  );
};
export default FriendCard;
