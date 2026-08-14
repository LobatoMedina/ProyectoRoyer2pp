'use client';

import React from 'react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { clearSession, getSession } from '@/lib/auth';
import { notificacionApi } from '@/lib/api';

interface NavbarProps {
  roleTitle: string;
  /** Estado del menú lateral en móvil. */
  menuOpen?: boolean;
  onToggleMenu?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ roleTitle, menuOpen = false, onToggleMenu }) => {
  const [username, setUsername] = useState('Usuario');
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    const session = getSession();
    if (session) setUsername(session.username);

    notificacionApi
      .list()
      .then((items) => setNotificationCount(items.length))
      .catch(() => setNotificationCount(0));
  }, []);

  const handleLogout = () => {
    clearSession();
    window.location.href = '/login';
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-2 border-b border-gray-200 bg-white px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-2 sm:gap-4">
        {onToggleMenu ? (
          <button
            type="button"
            onClick={onToggleMenu}
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuOpen}
            aria-controls="menu-lateral"
            className="-ml-2 rounded-lg p-2 text-gray-700 transition hover:bg-gray-100 lg:hidden"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="h-6 w-6"
              aria-hidden="true"
            >
              {menuOpen ? (
                <path d="M6 6l12 12M18 6L6 18" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        ) : null}

        <Link href="/" className="truncate text-base font-bold text-blue-800 sm:text-xl">
          <span className="sm:hidden">Vinculación</span>
          <span className="hidden sm:inline">Portal Vinculación</span>
        </Link>

        <span className="hidden shrink-0 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-800 sm:inline-block">
          {roleTitle}
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
        {notificationCount > 0 ? (
          <span
            title={`${notificationCount} avisos`}
            className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800"
          >
            {notificationCount}
            <span className="hidden sm:inline"> avisos</span>
          </span>
        ) : null}

        <span className="hidden max-w-[10rem] truncate text-sm font-medium text-gray-700 md:block">
          {username}
        </span>

        <button
          onClick={handleLogout}
          className="rounded bg-gray-100 px-3 py-1.5 text-xs text-gray-700 transition hover:bg-gray-200"
        >
          <span className="sm:hidden">Salir</span>
          <span className="hidden sm:inline">Cerrar Sesión</span>
        </button>
      </div>
    </header>
  );
};
