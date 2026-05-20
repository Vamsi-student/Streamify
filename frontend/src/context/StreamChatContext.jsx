import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { StreamChat } from "stream-chat";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api";
import useAuthUser from "../hooks/useAuthUser";
import toast from "react-hot-toast";
import { useLocation } from "react-router";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const StreamChatContext = createContext(null);

export const StreamChatProvider = ({ children }) => {
  const [chatClient, setChatClient] = useState(null);
  const [activeChannelCid, setActiveChannelCid] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [unreadCount, setUnreadCount] = useState(0);
  const { authUser } = useAuthUser();
  const location = useLocation();
  const initializedRef = useRef(false);
  const prevUserIdRef = useRef(null);
  const onlineUsersRef = useRef(new Set());
  const prevUnreadCidRef = useRef(null);

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  useEffect(() => {
    if (authUser?._id !== prevUserIdRef.current) {
      initializedRef.current = false;
      prevUserIdRef.current = authUser?._id;
    }
  }, [authUser?._id]);

  useEffect(() => {
    if (!tokenData?.token || !authUser || initializedRef.current) return;

    const initClient = async () => {
      try {
        const client = StreamChat.getInstance(STREAM_API_KEY);

        if (client.user?.id !== authUser._id) {
          await client.connectUser(
            {
              id: authUser._id,
              name: authUser.fullName,
              image: authUser.profilePic,
            },
            tokenData.token
          );
        }

        setChatClient(client);
        initializedRef.current = true;
      } catch (error) {
        console.error("Error initializing Stream Chat client:", error);
      }
    };

    initClient();
  }, [tokenData, authUser]);

  useEffect(() => {
    if (!chatClient || !authUser) return;

    const handlePresence = (event) => {
      const userId = event.user?.id;
      if (!userId) return;

      const ref = onlineUsersRef;
      const newSet = new Set(ref.current);

      if (event.user.online) {
        newSet.add(userId);
      } else {
        newSet.delete(userId);
      }

      ref.current = newSet;
      setOnlineUsers(newSet);
    };

    const existingUsers = chatClient.users;
    if (existingUsers) {
      const initialOnline = new Set();
      Object.values(existingUsers).forEach((u) => {
        if (u.online) initialOnline.add(u.id);
      });
      onlineUsersRef.current = initialOnline;
      setOnlineUsers(initialOnline);
    }

    chatClient.on("user.presence.changed", handlePresence);
    return () => chatClient.off("user.presence.changed", handlePresence);
  }, [chatClient, authUser?._id]);

  const isUserOnline = useCallback((userId) => {
    return onlineUsersRef.current.has(userId);
  }, []);

  useEffect(() => {
    if (!chatClient || !authUser) return;

    const queryUnread = async () => {
      try {
        const channels = await chatClient.queryChannels(
          { members: { $in: [authUser._id] } },
          { last_message_at: -1 },
          { limit: 30, watch: false, state: true }
        );
        const total = channels.reduce((sum, ch) => sum + (ch.state?.unreadCount || 0), 0);
        setUnreadCount(total);
      } catch (e) {
        // silent — channels might not be ready yet
      }
    };

    queryUnread();
  }, [chatClient, authUser?._id]);

  useEffect(() => {
    if (!chatClient || !authUser) return;

    const handleEvent = (event) => {
      if (event.user?.id === authUser._id) return;

      if (event.cid && activeChannelCid === event.cid) return;

      const senderName = event.user?.name || "Someone";
      const text = event.message?.text || "Sent a message";

      toast.success(`${senderName}: ${text}`, {
        duration: 4000,
      });

      if (event.cid) {
        setUnreadCount((prev) => prev + 1);
        prevUnreadCidRef.current = event.cid;
      }
    };

    chatClient.on("message.new", handleEvent);
    return () => chatClient.off("message.new", handleEvent);
  }, [chatClient, authUser?._id, activeChannelCid]);

  useEffect(() => {
    if (!authUser) return;

    if (location.pathname.startsWith("/chat/")) {
      const targetUserId = location.pathname.split("/chat/")[1];
      const expectedId = [authUser._id, targetUserId].sort().join("-");
      setActiveChannelCid(`messaging:${expectedId}`);
    } else {
      setActiveChannelCid(null);
    }
  }, [location.pathname, authUser]);

  useEffect(() => {
    if (!chatClient || !authUser) return;
    const timer = setTimeout(async () => {
      try {
        const channels = await chatClient.queryChannels(
          { members: { $in: [authUser._id] } },
          { last_message_at: -1 },
          { limit: 30, watch: false, state: true }
        );
        const total = channels.reduce((sum, ch) => sum + (ch.state?.unreadCount || 0), 0);
        setUnreadCount(total);
      } catch (e) {
        // silent
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [location.pathname, chatClient, authUser]);

  const refreshUnreadCount = useCallback(async () => {
    if (!chatClient || !authUser) return;
    try {
      const channels = await chatClient.queryChannels(
        { members: { $in: [authUser._id] } },
        { last_message_at: -1 },
        { limit: 30, watch: false, state: true }
      );
      const total = channels.reduce((sum, ch) => sum + (ch.state?.unreadCount || 0), 0);
      setUnreadCount(total);
    } catch (e) {
      // silent
    }
  }, [chatClient, authUser]);

  return (
    <StreamChatContext.Provider value={{ chatClient, setActiveChannelCid, onlineUsers, isUserOnline, unreadCount, refreshUnreadCount }}>
      {children}
    </StreamChatContext.Provider>
  );
};

export const useStreamChat = () => {
  const ctx = useContext(StreamChatContext);
  if (!ctx) {
    throw new Error("useStreamChat must be used within StreamChatProvider");
  }
  return ctx;
};
