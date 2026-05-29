import { Link, useLocation } from "react-router";
import useAuthUser from "../../features/auth/hooks/useAuthUser";
import { BellIcon, HomeIcon, ShipWheelIcon, UsersIcon, MessageCircleIcon } from "lucide-react";
import { useStreamChat } from "../../features/chat/context/StreamChatContext";

const Sidebar = () => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const { isUserOnline, unreadCount } = useStreamChat();
  const currentPath = location.pathname;

  return (
    <aside className="w-64 bg-base-200 border-r border-base-300 hidden lg:flex flex-col h-dvh sticky top-0">
      <div className="p-5 border-b border-base-300">
        <Link to="/" className="flex items-center gap-2.5">
          <ShipWheelIcon className="size-9 text-primary" />
          <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary  tracking-wider">
            Streamify
          </span>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        <Link
          to="/"
          className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
            currentPath === "/" ? "btn-active" : ""
          }`}
        >
          <HomeIcon className="size-5 text-base-content opacity-70" />
          <span>Home</span>
        </Link>

        <Link
          to="/friends"
          className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
            currentPath === "/friends" ? "btn-active" : ""
          }`}
        >
          <UsersIcon className="size-5 text-base-content opacity-70" />
          <span>Friends</span>
        </Link>

        <Link
          to="/messages"
          className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
            currentPath === "/messages" ? "btn-active" : ""
          }`}
        >
          <MessageCircleIcon className="size-5 text-base-content opacity-70" />
          <span>Messages</span>
          {unreadCount > 0 && (
            <span className="badge badge-primary badge-sm ml-auto">{unreadCount}</span>
          )}
        </Link>

        <Link
          to="/notifications"
          className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
            currentPath === "/notifications" ? "btn-active" : ""
          }`}
        >
          <BellIcon className="size-5 text-base-content opacity-70" />
          <span>Notifications</span>
        </Link>
      </nav>

      <Link to={`/profile/${authUser?._id}`} className="p-4 border-t border-base-300 mt-auto block hover:bg-base-300 transition-colors">
        <div className="flex items-center gap-3">
          <div className="avatar">
            <div className="w-10 rounded-full">
              <img src={authUser?.profilePic} alt="User Avatar" />
            </div>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">{authUser?.fullName}</p>
            <p className={`text-xs flex items-center gap-1 ${isUserOnline(authUser?._id) ? "text-success" : "opacity-50"}`}>
              <span className={`size-2 rounded-full inline-block ${isUserOnline(authUser?._id) ? "bg-success" : "bg-gray-400"}`} />
              {isUserOnline(authUser?._id) ? "Online" : "Offline"}
            </p>
          </div>
        </div>
      </Link>
    </aside>
  );
};
export default Sidebar;
