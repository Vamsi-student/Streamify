import { Link, useLocation } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { BellIcon, HomeIcon, UsersIcon, MessageCircleIcon } from "lucide-react";
import { useStreamChat } from "../context/StreamChatContext";

const BottomNavigation = () => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const { unreadCount } = useStreamChat();
  const currentPath = location.pathname;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-base-200 border-t border-base-300 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] px-2 pb-safe">
      <div className="flex justify-around items-center h-16">
        <Link
          to="/"
          className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors duration-200 ${
            currentPath === "/" ? "text-primary font-semibold" : "text-base-content/70 hover:text-base-content"
          }`}
        >
          <HomeIcon className="size-5" />
          <span className="text-[10px]">Home</span>
        </Link>

        <Link
          to="/friends"
          className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors duration-200 ${
            currentPath === "/friends" ? "text-primary font-semibold" : "text-base-content/70 hover:text-base-content"
          }`}
        >
          <UsersIcon className="size-5" />
          <span className="text-[10px]">Friends</span>
        </Link>

        <Link
          to="/messages"
          className={`flex flex-col items-center justify-center flex-1 h-full gap-1 relative transition-colors duration-200 ${
            currentPath === "/messages" ? "text-primary font-semibold" : "text-base-content/70 hover:text-base-content"
          }`}
        >
          <div className="relative">
            <MessageCircleIcon className="size-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-2 badge badge-primary badge-xs rounded-full font-bold">
                {unreadCount}
              </span>
            )}
          </div>
          <span className="text-[10px]">Messages</span>
        </Link>

        <Link
          to="/notifications"
          className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors duration-200 ${
            currentPath === "/notifications" ? "text-primary font-semibold" : "text-base-content/70 hover:text-base-content"
          }`}
        >
          <BellIcon className="size-5" />
          <span className="text-[10px]">Notifications</span>
        </Link>

        <Link
          to={`/profile/${authUser?._id}`}
          className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors duration-200 ${
            currentPath?.startsWith("/profile") ? "text-primary font-semibold" : "text-base-content/70 hover:text-base-content"
          }`}
        >
          <div className={`avatar size-5 rounded-full ring-2 ${currentPath?.startsWith("/profile") ? "ring-primary" : "ring-base-content/20"}`}>
            <img src={authUser?.profilePic} alt="Profile" className="rounded-full" />
          </div>
          <span className="text-[10px]">Profile</span>
        </Link>
      </div>
    </nav>
  );
};

export default BottomNavigation;
