import { useLocation } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { LayoutDashboard, Box, User } from 'lucide-react';

const pageLabels: Record<string, { title: string; icon: any }> = {
  '/dashboard': { title: 'Dashboard', icon: LayoutDashboard },
  '/products': { title: 'Products', icon: Box },
  '/profile': { title: 'Profile', icon: User },
};

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const currentPage = pageLabels[location.pathname] || { title: 'Dashboard', icon: LayoutDashboard };
  const Icon = currentPage.icon;

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-secondary/30">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 shadow-soft">
            <SidebarTrigger className="-ml-1" />
            <div className="flex items-center gap-2">
              <Icon className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-semibold text-foreground">{currentPage.title}</h1>
            </div>
          </header>
          
          <main className="flex-1 p-6 animate-fade-in">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
