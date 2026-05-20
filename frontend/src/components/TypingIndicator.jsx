import { useChannelStateContext } from "stream-chat-react";

const TypingIndicator = () => {
  const { typing } = useChannelStateContext();

  const typingUsers = Object.values(typing || {})
    .filter((event) => event?.user?.id)
    .map((event) => event.user);

  if (typingUsers.length === 0) return null;

  const names = typingUsers.map((u) => u.name || u.id);
  const text =
    names.length === 1
      ? `${names[0]} is typing...`
      : names.length === 2
        ? `${names[0]} and ${names[1]} are typing...`
        : `${names[0]} and ${names.length - 1} others are typing...`;

  return (
    <div className="px-4 pb-2 text-sm text-primary/70 flex items-center gap-2">
      <span className="flex gap-0.5">
        <span className="size-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="size-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
        <span className="size-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
      </span>
      {text}
    </div>
  );
};

export default TypingIndicator;
