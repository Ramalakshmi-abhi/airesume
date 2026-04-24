import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, Upload, FileText, BriefcaseBusiness, User } from "lucide-react";
import { cn } from "@/lib/utils";

// Show only 5 most important items in bottom nav
const bottomNavItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Home" },
  { to: "/upload", icon: Upload, label: "Upload" },
  { to: "/analyze", icon: FileText, label: "Analyze" },
  { to: "/job-match", icon: BriefcaseBusiness, label: "Jobs" },
  { to: "/profile", icon: User, label: "Profile" },
];

const BottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 md:hidden bg-card/95 backdrop-blur-xl border-t border-border/50 flex items-center justify-around px-2 py-1 safe-area-bottom">
      {bottomNavItems.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all duration-200 min-w-[56px]",
              isActive
                ? "text-blue-500"
                : "text-muted-foreground"
            )
          }
        >
          {({ isActive }) => (
            <>
              <div className={cn(
                "w-10 h-6 flex items-center justify-center rounded-full transition-all",
                isActive && "bg-blue-500/10"
              )}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-medium">{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomNav;
