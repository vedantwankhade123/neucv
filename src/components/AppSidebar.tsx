import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";
import { LayoutGrid, FilePlus, Settings, Home, LogOut, PanelLeftClose, PanelRightClose, CreditCard, Sparkles, Mail } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/contexts/SidebarContext";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const navItems = [
  { to: "/home", icon: Home, label: "Home" },
  { to: "/dashboard", icon: LayoutGrid, label: "My Projects", end: true },
  { to: "/cover-letter-templates", icon: Mail, label: "Cover Letters" },
  { to: "/templates", icon: FilePlus, label: "Templates" },
  { to: "/dashboard/pricing", icon: CreditCard, label: "Plans & Pricing" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

const SidebarNav = ({ onLinkClick }: { onLinkClick?: () => void }) => {
  const { isCollapsed } = useSidebar();
  return (
    <nav className="flex-grow px-4 py-2">
      <ul className="space-y-2">
        {navItems.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.end}
              onClick={onLinkClick}
              className={({ isActive }) =>
                cn(
                  "flex items-center py-3 px-4 rounded-xl transition-all duration-300 group relative overflow-hidden",
                  isCollapsed && "justify-center px-2",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-20" />
                  )}
                  <item.icon className={cn("h-5 w-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110", !isCollapsed && "mr-3")} />
                  <span className={cn("font-medium", isCollapsed && "hidden")}>{item.label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

interface AppSidebarProps {
  isMobileNavOpen: boolean;
  setIsMobileNavOpen: (isOpen: boolean) => void;
}

export const AppSidebar = ({ isMobileNavOpen, setIsMobileNavOpen }: AppSidebarProps) => {
  const navigate = useNavigate();
  const [isLogoutAlertOpen, setIsLogoutAlertOpen] = useState(false);
  const { isCollapsed, setIsCollapsed } = useSidebar();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className={cn("flex items-center justify-between p-6 h-20", isCollapsed && "justify-center p-4")}>
        <div className={cn(isCollapsed ? "hidden" : "block")}>
          <Logo />
        </div>
      </div>

      <SidebarNav onLinkClick={() => setIsMobileNavOpen(false)} />

      {!isCollapsed && (
        <div className="px-4 py-4 mt-auto">
          <Card className="bg-gradient-to-br from-violet-600 to-indigo-600 border-none shadow-lg text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 p-3 opacity-10">
              <Sparkles className="h-24 w-24" />
            </div>
            <CardHeader className="p-4 pb-2 relative z-10">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-yellow-300" />
                All Access
              </CardTitle>
              <CardDescription className="text-white/80 text-xs">
                Unlock every template forever
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2 relative z-10">
              <Button
                size="sm"
                variant="secondary"
                className="w-full text-xs font-semibold shadow-sm hover:bg-white/90"
                onClick={() => navigate('/dashboard/pricing')}
              >
                Get Bundle
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="p-4 mt-2">
        <Button
          variant="ghost"
          onClick={() => setIsLogoutAlertOpen(true)}
          className={cn(
            "w-full justify-start py-3 px-4 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors",
            isCollapsed && "justify-center"
          )}
        >
          <LogOut className={cn("h-5 w-5", !isCollapsed && "mr-3")} />
          <span className={cn("font-medium", isCollapsed && "hidden")}>Log Out</span>
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Sidebar (Sheet) */}
      <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
        <SheetContent side="left" className="w-72 p-0 bg-background/95 backdrop-blur-xl border-r flex flex-col md:hidden">
          {sidebarContent}
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "fixed top-4 left-4 bottom-4 bg-background/80 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-3xl shadow-2xl z-40 no-print transition-[width] ease-[cubic-bezier(0.32,0.72,0,1)] duration-500 hidden md:flex md:flex-col ring-1 ring-black/5 dark:ring-white/5",
          isCollapsed ? "w-24" : "w-72"
        )}
      >
        {sidebarContent}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-1/2 -right-4 transform -translate-y-1/2 bg-background border shadow-md rounded-full h-8 w-8 hover:scale-110 transition-transform duration-200"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <PanelRightClose className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </Button>
      </aside>

      <AlertDialog open={isLogoutAlertOpen} onOpenChange={setIsLogoutAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
            <AlertDialogDescription>
              You will be returned to the landing page. Any unsaved changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Log Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};