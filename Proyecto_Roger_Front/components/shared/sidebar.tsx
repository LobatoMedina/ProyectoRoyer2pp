'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export interface NavItem {
  label: string;
  href: string;
  icon?: string;
}

interface SidebarProps {
  items: NavItem[];
  /** Controla el cajón lateral en móvil. En escritorio el menú siempre está visible. */
  open?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ items, open = false, onClose }) => {
  const pathname = usePathname();

  const links = (
    <nav className="space-y-1">
      {items.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            aria-current={isActive ? 'page' : undefined}
            className={`flex items-center rounded-lg px-4 py-3 text-sm font-medium transition-colors lg:py-2.5 ${
              isActive
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Escritorio: columna fija a partir de lg */}
      <aside className="hidden w-64 shrink-0 bg-slate-900 p-4 text-slate-100 lg:block lg:min-h-[calc(100vh-4rem)]">
        {links}
      </aside>

      {/* Móvil y tablet: cajón deslizable por debajo de la barra superior */}
      <div
        className={`fixed inset-x-0 bottom-0 top-16 z-30 lg:hidden ${
          open ? 'visible' : 'pointer-events-none invisible'
        }`}
      >
        <div
          onClick={onClose}
          aria-hidden="true"
          className={`absolute inset-0 bg-slate-900/60 transition-opacity duration-200 ${
            open ? 'opacity-100' : 'opacity-0'
          }`}
        />
        <aside
          id="menu-lateral"
          aria-hidden={!open}
          className={`absolute inset-y-0 left-0 w-72 max-w-[85%] overflow-y-auto bg-slate-900 p-4 text-slate-100 shadow-xl transition-transform duration-200 ease-out ${
            open ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {links}
        </aside>
      </div>
    </>
  );
};
