import { Link, useLocation } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { BellIcon, LogOutIcon, ShipWheelIcon, ArrowLeft } from "lucide-react";
import ThemeSelector from "./ThemeSelector";
import useLogout from "../hooks/useLogout";

const Navbar = () => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const isChatPage = location.pathname?.startsWith("/chat");

  // const queryClient = useQueryClient();
  // const { mutate: logoutMutation } = useMutation({
  //   mutationFn: logout,
  //   onSuccess: () => queryClient.invalidateQueries({ queryKey: ["authUser"] }),
  // });

  const { logoutMutation } = useLogout();

  return (
    <nav className="bg-base-200 border-b border-base-300 sticky top-0 z-30 h-16 flex items-center">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between w-full">
          {/* LOGO OR BACK BUTTON - ONLY IN THE CHAT PAGE */}
          {isChatPage ? (
            <div className="flex items-center gap-2">
              <Link to="/messages" className="btn btn-ghost btn-circle lg:hidden" title="Back to messages">
                <ArrowLeft className="h-6 w-6 text-base-content opacity-75" />
              </Link>
              <Link to="/" className="hidden lg:flex items-center gap-2.5">
                <ShipWheelIcon className="size-9 text-primary" />
                <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary  tracking-wider">
                  Streamify
                </span>
              </Link>
            </div>
          ) : (
            <div />
          )}

            <div className="flex items-center gap-3 sm:gap-4 ml-auto">
            <Link to={"/notifications"}>
              <button className="btn btn-ghost btn-circle btn-sm lg:btn-md">
                <BellIcon className="h-5 w-5 lg:h-6 lg:w-6 text-base-content opacity-70" />
              </button>
            </Link>
          </div>

          {/* TODO */}
          <ThemeSelector />

          <Link to={`/profile/${authUser?._id}`} className="avatar">
            <div className="w-7 lg:w-9 rounded-full">
              <img src={authUser?.profilePic} alt="User Avatar" rel="noreferrer" />
            </div>
          </Link>

          {/* Logout button */}
          <button className="btn btn-ghost btn-circle btn-sm lg:btn-md" onClick={logoutMutation}>
            <LogOutIcon className="h-5 w-5 lg:h-6 lg:w-6 text-base-content opacity-70" />
          </button>
        </div>
      </div>
    </nav>
  );
};
export default Navbar;