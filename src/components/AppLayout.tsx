import { Outlet, useLocation } from 'react-router-dom';
import { AppSidebar } from '@/components/AppSidebar';
import { useState } from 'react';
import { SidebarProvider } from '@/contexts/SidebarContext';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { Menu } from 'lucide-react';
import { UserNav } from './UserNav';

const getTitleFromPath = (pathname: string) => {
  if (pathname === '/cover-letter-templates') {
    return 'Cover Letter Templates';
  }
  if (pathname.startsWith('/cover-letter')) {
    return 'Cover Letter Editor';
  }
  switch (pathname) {
    case '/home':
      return 'Home';
    case '/dashboard':
      return 'My Projects';
    case '/templates':
      return 'Templates';
    case '/settings':
      return 'Settings';
    case '/dashboard/pricing':
      return 'Plans & Pricing';
    default:
      return 'Dashboard';
  }
};

const MobileHeader = ({ onMenuClick }: { onMenuClick: () => void }) => {
  const location = useLocation();
  const title = getTitleFromPath(location.pathname);

  return (
    <header className="md:hidden fixed top-0 left-0 right-0 z-30 bg-background/80 backdrop-blur-sm border-b h-16 flex items-center justify-between px-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onMenuClick}>
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
      </div>
      <UserNav />
    </header>
  );
};

const AppLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  return (
    <SidebarProvider isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed}>
      <div className="min-h-screen bg-background">
        <AppSidebar isMobileNavOpen={isMobileNavOpen} setIsMobileNavOpen={setIsMobileNavOpen} />
        <MobileHeader onMenuClick={() => setIsMobileNavOpen(true)} />
        <div
          className={cn(
            "transition-[margin-left] ease-[cubic-bezier(0.32,0.72,0,1)] duration-500",
            "md:ml-80", // Default for expanded sidebar (72 + 8 for margin/gap)
            isCollapsed && "md:ml-28", // Margin for collapsed sidebar (20 + 8)
            "pt-16 md:pt-0" // Padding for mobile header
          )}
        >
          <Outlet />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;