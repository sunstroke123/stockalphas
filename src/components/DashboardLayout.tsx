'use client';

import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext';

function DashboardContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isCollapsed } = useSidebar();
  
  // Routes that should show the sidebar
  const protectedRoutes = ['/dashboard', '/portfolio', '/help', '/charts', '/stock'];
  const shouldShowSidebar = protectedRoutes.some(route => pathname?.startsWith(route));

  if (!shouldShowSidebar) {
    return <>{children}</>;
  }

  return (
    <>
      <Sidebar />
      <div
        className={`transition-all duration-300 ease-in-out ${
          isCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        } pt-16 lg:pt-0`}
      >
        {children}
      </div>
    </>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <DashboardContent>{children}</DashboardContent>
    </SidebarProvider>
  );
}
