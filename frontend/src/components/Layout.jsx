import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import BottomNavigation from "./BottomNavigation";

const Layout = ({ children, showSidebar = false }) => {
  return (
    <div className="min-h-screen">
      <div className="flex">
        {showSidebar && <Sidebar />}

        <div className="flex-1 flex flex-col min-w-0">
          <Navbar />

          <main className={`flex-1 overflow-y-auto ${showSidebar ? "pb-16 lg:pb-0" : ""}`}>
            {children}
          </main>
        </div>
      </div>
      {showSidebar && <BottomNavigation />}
    </div>
  );
};
export default Layout;