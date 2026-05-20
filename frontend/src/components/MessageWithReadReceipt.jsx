import { Message as StreamMessage, useMessageContext } from "stream-chat-react";
import useAuthUser from "../hooks/useAuthUser";

const ReadReceipt = () => {
  const { authUser } = useAuthUser();
  const { message, channel } = useMessageContext();
  const isOwn = message?.user?.id === authUser?._id;
  if (!isOwn) return null;

  const otherMembers = Object.values(channel?.state?.members || {}).filter(
    (m) => m.user?.id !== authUser?._id
  );
  const readByOthers = message?.readBy?.filter((id) => id !== authUser?._id) || [];
  const isRead = otherMembers.length > 0 && readByOthers.length >= otherMembers.length;

  return (
    <div className={`text-[10px] text-right leading-none ${isRead ? "text-primary" : "opacity-40"}`}>
      <span className="inline-flex items-center gap-0.5">
        <svg className="size-3" viewBox="0 0 16 11" fill="currentColor">
          <path d="M11.071.653a.457.457 0 0 0-.304-.102.493.493 0 0 0-.381.178l-6.19 7.636-2.011-2.095a.463.463 0 0 0-.336-.153.457.457 0 0 0-.337.128.442.442 0 0 0-.14.33c0 .124.047.246.14.33l2.397 2.5a.525.525 0 0 0 .368.16.533.533 0 0 0 .369-.16l6.645-8.2a.48.48 0 0 0 .115-.318.452.452 0 0 0-.14-.33l.005.006Z" />
          {isRead && (
            <path d="M15.565.653a.457.457 0 0 0-.304-.102.493.493 0 0 0-.381.178l-6.19 7.636-1.067-1.112a.463.463 0 0 0-.642-.006.447.447 0 0 0-.006.64l1.306 1.36a.525.525 0 0 0 .368.16.533.533 0 0 0 .369-.16l6.645-8.2a.48.48 0 0 0 .115-.318.452.452 0 0 0-.14-.33l.005.006Z" />
          )}
        </svg>
      </span>
    </div>
  );
};

const MessageWithReadReceipt = (props) => {
  return (
    <div className="str-chat__message-wrapper">
      <StreamMessage {...props} />
      <ReadReceipt />
    </div>
  );
};

export default MessageWithReadReceipt;
