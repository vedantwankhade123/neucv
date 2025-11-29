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
      <div className="h-screen w-full bg-white overflow-hidden relative">
        <AppSidebar isMobileNavOpen={isMobileNavOpen} setIsMobileNavOpen={setIsMobileNavOpen} />
        <MobileHeader onMenuClick={() => setIsMobileNavOpen(true)} />
        <main
          className={cn(
            "h-full overflow-y-auto overflow-x-hidden bg-white",
            "md:ml-[calc(16rem+2rem)]", // Margin to match sidebar width (256px + 32px for margins)
            "pt-16 md:pt-0" // Padding for mobile header
          )}
        >
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;