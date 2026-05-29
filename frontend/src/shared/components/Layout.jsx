import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import BottomNavigation from "./BottomNavigation";

const Layout = ({ children, showSidebar = false }) => {
  return (
    <div className="h-dvh flex flex-col overflow-x-hidden bg-base-100">
      <div className="flex flex-1 min-h-0 overflow-hidden relative">
        {showSidebar && <Sidebar />}

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          <Navbar />

          <main className={`flex-1 overflow-y-auto min-w-0 relative ${showSidebar ? "pb-safe pb-16 lg:pb-0" : ""}`}>
            {children}
          </main>
        </div>
      </div>
      {showSidebar && <BottomNavigation />}
    </div>
  );
};
export default Layout;
