import { NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Package, LayoutDashboard, User, LogOut, Box, FileText } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/products', label: 'Products', icon: Box },
  { path: '/files', label: 'Files', icon: FileText },
];

export function AppSidebar() {
  const { user, logout, isLoading } = useAuth();
  const { open } = useSidebar();

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2 px-4 py-4">
            <Package className="h-5 w-5 text-sidebar-primary" />
            {open && <span className="font-semibold">Inventory Shop</span>}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.path}
                        className={({ isActive }) =>
                          `flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                            isActive
                              ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                              : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                          }`
                        }
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="border-t border-sidebar-border p-4">
        {open && (
          <div className="mb-2 text-xs text-sidebar-foreground/60 truncate">
            {isLoading ? (
              <span className="animate-pulse">Loading...</span>
            ) : (
              user?.email || 'Not logged in'
            )}
          </div>
        )}
        <Button
          onClick={logout}
          variant="outline"
          size={open ? "default" : "icon"}
          className="w-full justify-start border-sidebar-border bg-transparent text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <LogOut className={open ? "mr-2 h-4 w-4" : "h-4 w-4"} />
          {open && "Logout"}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
