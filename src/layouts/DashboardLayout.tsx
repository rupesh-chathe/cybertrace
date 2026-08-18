import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';

const titleMap: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/cases': 'Cases',
  '/cases/new': 'Create Case',
  '/evidence': 'Evidence Explorer',
  '/ai-analysis': 'AI Analysis',
  '/timeline': 'Investigation Timeline',
  '/reports': 'Reports',
  '/audit-logs': 'Audit Logs',
  '/settings': 'Settings',
};

function resolveTitle(pathname: string): string {
  if (titleMap[pathname]) return titleMap[pathname];
  if (pathname.startsWith('/cases/') && !pathname.endsWith('/new')) return 'Case Details';
  if (pathname.startsWith('/evidence/')) return 'Evidence Details';
  if (pathname.startsWith('/reports/')) return 'Forensic Report';
  return 'CYBERTRACE AI';
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const title = resolveTitle(location.pathname);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#0a0e14]">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-64">
        <Topbar title={title} onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
