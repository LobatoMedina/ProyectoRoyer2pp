'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ApiError, authApi } from '@/lib/api';
import { homePathForRole, setSession, toRoleSlug } from '@/lib/auth';
import { ErrorMessage } from '@/components/shared/feedback';

export default function LoginPage() {
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const result = await authApi.login(usuario, contrasena);
      setSession(result.usuario, result.token);
      window.location.href = homePathForRole(toRoleSlug(result.usuario.roles));
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'No fue posible iniciar sesión.');
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Iniciar Sesión</h2>
        <p className="mt-1 text-sm text-gray-500">Ingresa tus credenciales de acceso</p>
      </div>

      {error ? <ErrorMessage message={error} /> : null}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Usuario</label>
          <input
            type="text"
            required
            value={usuario}
            onChange={(event) => setUsuario(event.target.value)}
            className="mt-1 w-full rounded-lg border p-2.5 text-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Contraseña</label>
          <input
            type="password"
            required
            value={contrasena}
            onChange={(event) => setContrasena(event.target.value)}
            className="mt-1 w-full rounded-lg border p-2.5 text-black"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-blue-600 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:bg-blue-300"
        >
          {submitting ? 'Validando...' : 'Ingresar'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500">
        ¿No tienes cuenta?{' '}
        <Link href="/registro" className="font-medium text-blue-600 hover:underline">
          Regístrate
        </Link>
      </p>
    </div>
  );
}
