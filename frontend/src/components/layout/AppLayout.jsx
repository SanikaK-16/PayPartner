import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import AskPayPartner from "../assistant/AskPayPartner";

function AppLayout({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleSidebarToggle = () => {
    setSidebarCollapsed((value) => !value);
  };

  const handleMobileSidebarClose = () => {
    setMobileSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Global application header */}
      <Header
        onMobileMenuToggle={() =>
          setMobileSidebarOpen((value) => !value)
        }
      />

      {/* Navigation sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        onToggle={handleSidebarToggle}
        onMobileClose={handleMobileSidebarClose}
      />

      {/* Main application area */}
      <div
        className={`min-h-screen pt-20 transition-all duration-200 ease-out ${
          sidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
        }`}
      >
        <main className="min-h-[calc(100vh-80px)] px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
          {children}
        </main>
      </div>

      {/* Global AI assistant */}
      <AskPayPartner />
    </div>
  );
}

export default AppLayout;