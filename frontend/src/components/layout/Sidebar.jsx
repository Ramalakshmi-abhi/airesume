import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Upload,
  User,
  FileText,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  BriefcaseBusiness,
  GitCompare,
  Map,
  Brain,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/upload", icon: Upload, label: "Upload Resume" },
  { to: "/analyze", icon: FileText, label: "Analysis" },
  { to: "/job-match", icon: BriefcaseBusiness, label: "Job Match" },
  { to: "/rewrite", icon: GitCompare, label: "AI Rewriter" },
  { to: "/preview", icon: FileText, label: "Web PDF Builder" },
  { to: "/roadmap", icon: Map, label: "Skill Roadmap" },
  { to: "/interview-prep", icon: Brain, label: "Interview Prep" },
  { to: "/profile", icon: User, label: "Profile" },
];

// Mobile drawer sidebar
export const MobileSidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          />
          {/* Drawer */}
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 bottom-0 w-72 bg-card/95 backdrop-blur-xl border-r border-border/50 z-50 flex flex-col md:hidden shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-5 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-base bg-gradient-to-r from-blue-500 to-violet-600 bg-clip-text text-transparent">
                  ResumeAI
                </span>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
              {navItems.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200",
                      isActive
                        ? "bg-gradient-to-r from-blue-500/10 to-violet-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon className={cn("w-5 h-5 flex-shrink-0", isActive && "text-blue-500")} />
                      <span className="text-sm font-medium">{label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            {/* User */}
            <div className="px-4 py-4 border-t border-border/50 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-violet-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {user?.displayName?.[0] || user?.email?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{user?.displayName || "User"}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

// Desktop sidebar (unchanged behaviour)
const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="relative hidden md:flex flex-col h-screen bg-card/80 backdrop-blur-xl border-r border-border/50 z-20 overflow-hidden"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-border/50 min-h-[64px]">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/30">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="font-bold text-base bg-gradient-to-r from-blue-500 to-violet-600 bg-clip-text text-transparent whitespace-nowrap"
            >
              ResumeAI
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto scrollbar-hide">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative overflow-hidden",
                isActive
                  ? "bg-gradient-to-r from-blue-500/10 to-violet-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-blue-500 to-violet-500 rounded-r-full"
                  />
                )}
                <Icon className={cn("w-5 h-5 flex-shrink-0", isActive && "text-blue-500")} />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-sm font-medium whitespace-nowrap"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className={cn("px-2 py-4 border-t border-border/50 flex items-center gap-3", collapsed && "justify-center")}>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-violet-500 flex items-center justify-center flex-shrink-0 text-white text-sm font-bold">
          {user?.displayName?.[0] || user?.email?.[0]?.toUpperCase() || "U"}
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 min-w-0"
            >
              <p className="text-xs font-semibold truncate">{user?.displayName || "User"}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-card border border-border shadow-md flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors z-10"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </motion.aside>
  );
};

export default Sidebar;
