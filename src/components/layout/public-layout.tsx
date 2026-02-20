'use client';

import { ReactNode } from 'react';
import { SiteHeader } from './site-header';
import { BottomNav } from './bottom-nav';
import { useAppStore } from '@/stores/app-store';
import { Sheet, SheetContent } from '@/components/ui/sheet';

interface PublicLayoutProps {
  children: ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  const { mobileMenuOpen, setMobileMenuOpen } = useAppStore();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <SiteHeader 
        showMenu={true} 
        onMenuClick={() => setMobileMenuOpen(true)} 
      />

      {/* Mobile Menu Sheet */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-80">
          <div className="flex flex-col gap-4 py-4">
            <nav className="flex flex-col gap-2">
              <a 
                href="/" 
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Inicio
              </a>
              <a 
                href="/catalogo" 
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Catálogo
              </a>
              <a 
                href="/login" 
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Iniciar Sesión
              </a>
            </nav>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className="flex-1 pb-20 md:pb-0">
        {children}
      </main>

      {/* Footer (Desktop) */}
      <footer className="hidden md:block border-t bg-muted/30">
        <div className="container px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <h3 className="font-bold text-lg">MTG Automotora</h3>
              <p className="text-sm text-muted-foreground">
                Tu próxima decisión inteligente. Vehículos seleccionados con garantía y confianza.
              </p>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h4 className="font-semibold">Enlaces Rápidos</h4>
              <nav className="flex flex-col gap-2 text-sm">
                <a href="/catalogo" className="hover:text-primary transition-colors">Catálogo</a>
                <a href="/consignar" className="hover:text-primary transition-colors">Consignar</a>
                <a href="/contacto" className="hover:text-primary transition-colors">Contacto</a>
              </nav>
            </div>

            {/* Contact */}
            <div className="space-y-4">
              <h4 className="font-semibold">Contacto</h4>
              <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                <p>+56 9 1234 5678</p>
                <p>contacto@mtgautomotora.cl</p>
                <p>Santiago, Chile</p>
              </div>
            </div>

            {/* Hours */}
            <div className="space-y-4">
              <h4 className="font-semibold">Horario</h4>
              <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                <p>Lunes - Viernes: 9:00 - 18:00</p>
                <p>Sábado: 10:00 - 14:00</p>
                <p>Domingo: Cerrado</p>
              </div>
            </div>
          </div>

          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} MTG Automotora. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>

      {/* Bottom Navigation (Mobile) */}
      <BottomNav />
    </div>
  );
}
