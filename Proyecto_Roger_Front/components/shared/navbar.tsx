'use client';

import React from 'react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { clearSession, getSession } from '@/lib/auth';
import { notificacionApi } from '@/lib/api';

interface NavbarProps {
  roleTitle: string;
}

export const Navbar: React.FC<NavbarProps> = ({ roleTitle }) => {
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
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div className="flex items-center space-x-4">
        <Link href="/" className="text-xl font-bold text-blue-800">
          Portal Vinculación
        </Link>
        <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-800">
          {roleTitle}
        </span>
      </div>
      <div className="flex items-center space-x-4">
        {notificationCount > 0 ? (
          <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">
            {notificationCount} avisos
          </span>
        ) : null}
        <span className="text-sm font-medium text-gray-700">{username}</span>
        <button
          onClick={handleLogout}
          className="rounded bg-gray-100 px-3 py-1.5 text-xs text-gray-700 transition hover:bg-gray-200"
        >
          Cerrar Sesión
        </button>
      </div>
    </header>
  );
};
