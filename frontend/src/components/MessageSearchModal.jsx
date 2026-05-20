import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { useStreamChat } from "../context/StreamChatContext";
import { SearchIcon, XIcon, MessageCircleIcon } from "lucide-react";

const MessageSearchModal = ({ onClose }) => {
  const navigate = useNavigate();
  const { chatClient } = useStreamChat();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!query.trim() || !chatClient) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const response = await chatClient.search(
          { members: { $in: [chatClient.user?.id] } },
          query.trim(),
          { limit: 20 }
        );
        setResults(response?.results || []);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query, chatClient]);

  const handleResultClick = (message) => {
    const cidParts = message.cid?.split(":");
    if (cidParts?.length === 2) {
      const targetUserId = cidParts[1].split("-").find((id) => id !== chatClient?.user?.id);
      if (targetUserId) {
        navigate(`/chat/${targetUserId}`);
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/50">
      <div className="bg-base-100 w-full max-w-lg rounded-xl shadow-2xl overflow-hidden mx-4">
        <div className="flex items-center gap-2 p-4 border-b border-base-300">
          <SearchIcon className="size-5 opacity-50" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search messages..."
            className="input input-ghost w-full focus:outline-none"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
            <XIcon className="size-4" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto p-2">
          {searching && (
            <div className="flex justify-center py-8">
              <span className="loading loading-spinner loading-sm opacity-50" />
            </div>
          )}

          {!searching && query && results.length === 0 && (
            <p className="text-center py-8 opacity-50 text-sm">No messages found</p>
          )}

          {results.map((item, idx) => {
            const message = item.message;
            return (
              <button
                key={message.id || idx}
                onClick={() => handleResultClick(message)}
                className="w-full text-left p-3 rounded-lg hover:bg-base-200 transition-colors flex items-start gap-3"
              >
                <MessageCircleIcon className="size-5 mt-0.5 shrink-0 opacity-50" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate">{message.user?.name || "Unknown"}</p>
                  <p className="text-sm opacity-70 truncate">{message.text}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MessageSearchModal;
