'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ApiError, authApi, catalogApi } from '@/lib/api';
import { useApi } from '@/lib/useApi';
import { homePathForRole, setSession, toRoleSlug } from '@/lib/auth';
import { ErrorMessage, Loading } from '@/components/shared/feedback';
import { AuthCard } from '@/components/shared/auth-card';

const initialForm = {
  usuario: '',
  contrasena: '',
  empresaNombre: '',
  razonSocial: '',
  rfc: '',
  direccion: '',
  tipoEmpresaId: '',
};

export default function RegistroEmpresaPage() {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const tiposEmpresa = useApi(() => catalogApi.tiposEmpresa());

  const updateField = (field: keyof typeof initialForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const result = await authApi.registerEmpresa({
        usuario: form.usuario,
        contrasena: form.contrasena,
        empresaNombre: form.empresaNombre,
        razonSocial: form.razonSocial,
        rfc: form.rfc.toUpperCase(),
        direccion: form.direccion,
        tipoEmpresaId: Number(form.tipoEmpresaId),
      });

      setSession(result.usuario, result.token);
      window.location.href = homePathForRole(toRoleSlug(result.usuario.roles));
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'No fue posible completar el registro.');
      setSubmitting(false);
    }
  };

  if (tiposEmpresa.loading)
    return (
      <AuthCard>
        <Loading label="Cargando catálogos..." />
      </AuthCard>
    );

  if (tiposEmpresa.error)
    return (
      <AuthCard>
        <ErrorMessage message={tiposEmpresa.error} />
      </AuthCard>
    );

  const inputClass = 'mt-1 w-full rounded-lg border p-2.5 text-black';

  return (
    <AuthCard wide>
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Registro de empresa</h2>
          <p className="mt-1 text-sm text-gray-500">
            Tu cuenta quedará pendiente hasta que se firme el convenio con la universidad
          </p>
        </div>

        {error ? <ErrorMessage message={error} /> : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Usuario</label>
              <input
                type="text"
                required
                value={form.usuario}
                onChange={(event) => updateField('usuario', event.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Contraseña</label>
              <input
                type="password"
                required
                minLength={6}
                value={form.contrasena}
                onChange={(event) => updateField('contrasena', event.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre comercial</label>
              <input
                type="text"
                required
                value={form.empresaNombre}
                onChange={(event) => updateField('empresaNombre', event.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Razón social</label>
              <input
                type="text"
                required
                value={form.razonSocial}
                onChange={(event) => updateField('razonSocial', event.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">RFC</label>
              <input
                type="text"
                required
                minLength={12}
                maxLength={13}
                value={form.rfc}
                onChange={(event) => updateField('rfc', event.target.value)}
                className={`${inputClass} uppercase`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Tipo de empresa</label>
              <select
                required
                value={form.tipoEmpresaId}
                onChange={(event) => updateField('tipoEmpresaId', event.target.value)}
                className={`${inputClass} bg-white`}
              >
                <option value="">Selecciona...</option>
                {tiposEmpresa.data?.map((item) => (
                  <option key={item.TipoEmpresaId} value={item.TipoEmpresaId}>
                    {item.TipoEmpresa_TipoEmpresa}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Dirección</label>
              <input
                type="text"
                required
                value={form.direccion}
                onChange={(event) => updateField('direccion', event.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-blue-600 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:bg-blue-300"
          >
            {submitting ? 'Registrando...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500">
          <Link href="/registro" className="font-medium text-blue-600 hover:underline">
            Volver
          </Link>
        </p>
      </div>
    </AuthCard>
  );
}
