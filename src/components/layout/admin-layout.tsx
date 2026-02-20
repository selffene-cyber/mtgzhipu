'use client';

import { ReactNode } from 'react';
import { AdminSidebar } from './admin-sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { SiteHeader } from './site-header';
import { useAuthStore } from '@/stores/auth-store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { isAuthenticated, user, isLoading, setLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Simulate checking auth state
    const checkAuth = async () => {
      // In real app, verify token with API
      setLoading(false);
    };
    checkAuth();
  }, [setLoading]);

  // Don't redirect while loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  // Get user role for sidebar
  const userRole = user?.role || 'sales';

  return (
    <SidebarProvider>
      <AdminSidebar 
        user={{
          name: user?.name || 'Usuario',
          email: user?.email || '',
          role: userRole as 'admin' | 'sales' | 'viewer',
          avatar: user?.avatar || '',
        }}
      />
      <SidebarInset>
        <div className="flex flex-col min-h-screen">
          {/* Admin Header */}
          <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center gap-4 px-4">
              <h1 className="text-lg font-semibold">Panel de Administración</h1>
              <div className="ml-auto flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Bienvenido, {user?.name}
                </span>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-4 md:p-6">
            {children}
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
