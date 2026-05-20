import { useEffect, useState } from "react";
import { useParams } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { useStreamChat } from "../context/StreamChatContext";

import {
  Channel,
  ChannelHeader,
  Chat,
  MessageComposer,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";
import toast from "react-hot-toast";

import ChatLoader from "../components/ChatLoader";
import CallButton from "../components/CallButton";
import TypingIndicator from "../components/TypingIndicator";
import MessageWithReadReceipt from "../components/MessageWithReadReceipt";
import MessageSearchModal from "../components/MessageSearchModal";
import { SearchIcon } from "lucide-react";

const ChatPage = () => {
  const { id: targetUserId } = useParams();

  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSearch, setShowSearch] = useState(false);

  const { authUser } = useAuthUser();
  const { chatClient, setActiveChannelCid } = useStreamChat();

  useEffect(() => {
    if (!chatClient || !authUser) {
      setLoading(true);
      return;
    }

    const initChannel = async () => {
      try {
        const channelId = [authUser._id, targetUserId].sort().join("-");

        const currChannel = chatClient.channel("messaging", channelId, {
          members: [authUser._id, targetUserId],
        });

        await currChannel.watch();

        setChannel(currChannel);
        setActiveChannelCid(currChannel.cid);
      } catch (error) {
        console.error("Error initializing chat:", error);
        toast.error("Could not connect to chat. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    initChannel();
  }, [chatClient, authUser, targetUserId, setActiveChannelCid]);

  const handleVideoCall = () => {
    if (channel) {
      const callUrl = `${window.location.origin}/call/${channel.id}`;

      channel.sendMessage({
        text: `I've started a video call. Join me here: ${callUrl}`,
      });

      toast.success("Video call link sent successfully!");
    }
  };

  if (loading || !chatClient || !channel) return <ChatLoader />;

  return (
    <div className="h-[93vh]">
      <Chat client={chatClient}>
        <Channel channel={channel} Message={MessageWithReadReceipt}>
          <div className="w-full relative">
            <div className="absolute top-2 right-2 z-10 flex gap-1">
              <button
                onClick={() => setShowSearch(true)}
                className="btn btn-circle btn-sm btn-ghost"
                title="Search messages"
              >
                <SearchIcon className="size-4" />
              </button>
              <CallButton handleVideoCall={handleVideoCall} />
            </div>
            <Window>
              <ChannelHeader />
              <MessageList />
              <TypingIndicator />
              <MessageComposer />
            </Window>
          </div>
          <Thread />
        </Channel>
      </Chat>

      {showSearch && <MessageSearchModal onClose={() => setShowSearch(false)} />}
    </div>
  );
};
export default ChatPage;
