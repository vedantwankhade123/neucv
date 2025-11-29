import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";
import { LayoutGrid, FilePlus, Settings, Home, LogOut, CreditCard, Sparkles, Bot } from "lucide-react";
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
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const navItems = [
  { to: "/home", icon: Home, label: "Home" },
  { to: "/dashboard", icon: LayoutGrid, label: "My Projects", end: true },
  { to: "/dashboard/interview", icon: Bot, label: "Interview Coach" },
  { to: "/templates", icon: FilePlus, label: "Templates" },
  { to: "/dashboard/pricing", icon: CreditCard, label: "Plans & Pricing" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

const SidebarNav = ({ onLinkClick }: { onLinkClick?: () => void }) => {
  return (
    <nav className="px-2 py-2">
      <ul className="space-y-1.5">
        {navItems.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.end}
              onClick={onLinkClick}
              className={({ isActive }) =>
                cn(
                  "flex items-center py-2 px-3 rounded-lg transition-all duration-300 group relative overflow-hidden text-sm",
                  isActive ? "text-white" : "text-slate-900",
                  isActive
                    ? "shadow-sm ring-1 ring-white/10"
                    : "hover:opacity-90"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div 
                    style={{ backgroundColor: isActive ? '#000000' : '#e5e5e5' }}
                    className="absolute inset-0 rounded-lg -z-10"
                  />
                  <item.icon className={cn("h-4 w-4 flex-shrink-0 transition-transform duration-300 group-hover:scale-110 mr-2 relative z-10")} />
                  <span className="font-medium relative z-10">{item.label}</span>
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

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between p-4 h-16 flex-shrink-0">
        <div className="block">
          <Logo />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
        <SidebarNav onLinkClick={() => setIsMobileNavOpen(false)} />
      </div>

      <div className="flex-shrink-0">
        <div className="px-2 py-2">
          <Card className="bg-gradient-to-br from-violet-600 to-indigo-600 border-none shadow-lg text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 p-2 opacity-10">
              <Sparkles className="h-16 w-16" />
            </div>
            <CardHeader className="p-3 pb-2 relative z-10">
              <CardTitle className="text-xs font-bold flex items-center gap-2">
                <Sparkles className="h-3 w-3 text-yellow-300" />
                All Access
              </CardTitle>
              <CardDescription className="text-white/80 text-xs">
                Unlock every template forever
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 pt-2 relative z-10">
              <Button
                size="sm"
                variant="secondary"
                className="w-full text-xs font-semibold shadow-sm hover:bg-white/90 h-7"
                onClick={() => navigate('/dashboard/pricing')}
              >
                Get Bundle
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="px-2 py-2">
          <Button
            variant="ghost"
            onClick={() => setIsLogoutAlertOpen(true)}
            className="w-full justify-start py-2 px-3 rounded-lg text-slate-900 hover:opacity-90 transition-colors text-sm h-9"
            style={{ backgroundColor: '#e5e5e5' }}
          >
            <LogOut className="h-4 w-4 mr-2" />
            <span className="font-medium">Log Out</span>
          </Button>
        </div>
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
        className="fixed top-4 left-4 bottom-4 w-64 bg-slate-50 border border-slate-200 rounded-2xl shadow-lg z-40 no-print hidden md:flex md:flex-col"
      >
        {sidebarContent}
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