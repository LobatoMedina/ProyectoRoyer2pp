'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/shared/navbar';
import { Sidebar, NavItem } from '@/components/shared/sidebar';

interface AppShellProps {
  roleTitle: string;
  navItems: NavItem[];
  children: React.ReactNode;
}

/**
 * Estructura común de los tres paneles (aspirante, empresa y vinculación).
 * Concentra aquí el estado del menú móvil para que layouts y páginas
 * sigan siendo componentes de servidor.
 */
export function AppShell({ roleTitle, navItems, children }: AppShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const [lastPathname, setLastPathname] = useState(pathname);

  // Al cambiar de ruta el cajón debe cerrarse solo. Se ajusta durante el
  // render (y no en un efecto) para evitar un segundo pintado del menú abierto.
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setMenuOpen(false);
  }

  // Evita que el contenido de fondo se desplace mientras el menú está abierto.
  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  // Cerrar con la tecla Escape.
  useEffect(() => {
    if (!menuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [menuOpen]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        roleTitle={roleTitle}
        menuOpen={menuOpen}
        onToggleMenu={() => setMenuOpen((current) => !current)}
      />
      <div className="lg:flex">
        <Sidebar items={navItems} open={menuOpen} onClose={() => setMenuOpen(false)} />
        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
