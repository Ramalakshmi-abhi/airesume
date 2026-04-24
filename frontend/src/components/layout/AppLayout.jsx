import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar, { MobileSidebar } from "./Sidebar";
import Navbar from "./Navbar";
import { motion } from "framer-motion";
import FloatingChat from "../chat/FloatingChat";
import BottomNav from "./BottomNav";

const AppLayout = ({ title }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background print:h-auto print:bg-white print:overflow-visible">
      {/* Desktop sidebar */}
      <div className="print:hidden">
        <Sidebar />
      </div>

      {/* Mobile drawer */}
      <MobileSidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden print:overflow-visible">
        {/* Navbar */}
        <div className="print:hidden">
          <Navbar title={title} onMenuClick={() => setMobileMenuOpen(true)} />
        </div>

        {/* Page content */}
        <motion.main
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6 print:p-0 print:overflow-visible print:w-full print:m-0"
        >
          <Outlet />
        </motion.main>
      </div>

      {/* Mobile bottom navigation */}
      <div className="print:hidden">
        <BottomNav />
      </div>

      {/* Floating chat */}
      <div className="print:hidden">
        <FloatingChat />
      </div>
    </div>
  );
};

export default AppLayout;
