import { useState } from "react";
import useAuthUser from "../hooks/useAuthUser";
import { useStreamChat } from "../context/StreamChatContext";

import {
  Channel,
  ChannelHeader,
  ChannelList,
  Chat,
  MessageComposer,
  MessageList,
  Thread,
  Window,
  useChannelStateContext,
} from "stream-chat-react";
import toast from "react-hot-toast";

import ChatLoader from "../components/ChatLoader";
import CallButton from "../components/CallButton";
import TypingIndicator from "../components/TypingIndicator";
import MessageWithReadReceipt from "../components/MessageWithReadReceipt";
import { PlusIcon } from "lucide-react";
import CreateGroupModal from "../components/CreateGroupModal";

const MessagesPage = () => {
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);

  const { authUser } = useAuthUser();
  const { chatClient } = useStreamChat();

  if (!chatClient) return <ChatLoader />;

  const filters = { type: "messaging", members: { $in: [authUser._id] } };
  const sort = { last_message_at: -1 };

  return (
    <div className="h-[93vh] flex w-full">
      <Chat client={chatClient} theme={`str-chat__theme-${document.documentElement.getAttribute('data-theme') || 'night'}`}>

        {/* Left Side: Channel List */}
        <div className="w-80 border-r border-base-300 flex flex-col bg-base-100">
          <div className="p-4 border-b border-base-300 flex justify-between items-center bg-base-200">
            <h2 className="font-bold text-lg">Messages</h2>
            <button
              onClick={() => setIsGroupModalOpen(true)}
              className="btn btn-circle btn-sm btn-ghost"
              title="Create Group Chat"
            >
              <PlusIcon className="size-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <ChannelList filters={filters} sort={sort} />
          </div>
        </div>

        {/* Right Side: Active Channel */}
        <div className="flex-1 bg-base-200 relative h-full">
          <Channel Message={MessageWithReadReceipt}>
            <div className="w-full h-full relative">
              <ActiveCallButton />
              <Window>
                <ChannelHeader />
                <MessageList />
                <TypingIndicator />
                <MessageComposer />
              </Window>
            </div>
            <Thread />
          </Channel>
        </div>
      </Chat>

      {isGroupModalOpen && (
        <CreateGroupModal
          onClose={() => setIsGroupModalOpen(false)}
          client={chatClient}
        />
      )}
    </div>
  );
};

const ActiveCallButton = () => {
  const { channel } = useChannelStateContext();

  const handleVideoCall = () => {
    if (channel) {
      const callUrl = `${window.location.origin}/call/${channel.id}`;
      channel.sendMessage({
        text: `I've started a video call. Join me here: ${callUrl}`,
      });
      toast.success("Video call link sent successfully!");
    }
  };

  return <CallButton handleVideoCall={handleVideoCall} />;
};

export default MessagesPage;
