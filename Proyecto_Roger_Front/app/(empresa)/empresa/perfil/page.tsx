'use client';

import { useEffect, useState } from 'react';
import { ApiError, authApi, catalogApi, empresaApi } from '@/lib/api';
import { useApi } from '@/lib/useApi';
import {
  EmptyState,
  ErrorMessage,
  Loading,
  PageHeader,
  SuccessMessage,
} from '@/components/shared/feedback';

export default function PerfilEmpresaPage() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [empresaNombre, setEmpresaNombre] = useState('');
  const [razonSocial, setRazonSocial] = useState('');
  const [direccion, setDireccion] = useState('');
  const [contacto, setContacto] = useState('');
  const [tipoContactoId, setTipoContactoId] = useState('');

  const perfil = useApi(async () => {
    const me = await authApi.me();
    if (!me.empresaId) throw new ApiError(404, 'No hay una empresa asociada a tu cuenta.');

    const [empresa, tiposContacto] = await Promise.all([
      empresaApi.byId(me.empresaId),
      catalogApi.tiposContacto(),
    ]);

    return { empresa, tiposContacto };
  });

  useEffect(() => {
    const empresa = perfil.data?.empresa;
    if (!empresa) return;

    setEmpresaNombre(empresa.Empresa_Empresa);
    setRazonSocial(empresa.Empresa_RazonSocial);
    setDireccion(empresa.Empresa_Direccion);
  }, [perfil.data]);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);
    setError(null);

    const empresaId = perfil.data?.empresa.EmpresaId;
    if (!empresaId) return;

    try {
      await empresaApi.update(empresaId, { empresaNombre, razonSocial, direccion });
      setMessage('Los datos de la empresa fueron actualizados.');
      perfil.reload();
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'No fue posible guardar los cambios.');
    }
  };

  const handleAddContacto = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);
    setError(null);

    const empresaId = perfil.data?.empresa.EmpresaId;
    if (!empresaId) return;

    try {
      await empresaApi.addContacto(empresaId, contacto, Number(tipoContactoId));
      setContacto('');
      setTipoContactoId('');
      setMessage('Medio de contacto agregado.');
      perfil.reload();
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'No fue posible agregar el contacto.');
    }
  };

  if (perfil.loading) return <Loading />;
  if (perfil.error) return <ErrorMessage message={perfil.error} />;
  if (!perfil.data) return null;

  const { empresa, tiposContacto } = perfil.data;
  const contactos = empresa.empresaContactos ?? [];
  const inputClass = 'mt-1 w-full rounded-lg border p-2.5 text-sm text-black';

  return (
    <div className="space-y-6">
      <PageHeader title="Perfil de la empresa" description={`RFC: ${empresa.Empresa_rfc}`} />

      {message ? <SuccessMessage message={message} /> : null}
      {error ? <ErrorMessage message={error} /> : null}

      <form onSubmit={handleSave} className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre comercial</label>
            <input
              type="text"
              value={empresaNombre}
              onChange={(event) => setEmpresaNombre(event.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Razón social</label>
            <input
              type="text"
              value={razonSocial}
              onChange={(event) => setRazonSocial(event.target.value)}
              className={inputClass}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Dirección</label>
            <input
              type="text"
              value={direccion}
              onChange={(event) => setDireccion(event.target.value)}
              className={inputClass}
            />
          </div>
        </div>
        <button
          type="submit"
          className="mt-4 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          Guardar cambios
        </button>
      </form>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
          Medios de contacto
        </h2>

        {contactos.length === 0 ? (
          <div className="mt-3">
            <EmptyState message="Registra al menos un medio de contacto para la Coordinación de Vinculación." />
          </div>
        ) : (
          <ul className="mt-3 divide-y divide-gray-200">
            {contactos.map(({ contacto: item }) => (
              <li key={item.ContactoId} className="py-3 text-sm text-gray-800">
                <span className="text-gray-500">
                  {item.tipoContacto?.TipoContacto_TipoContacto ?? 'Contacto'}:{' '}
                </span>
                {item.Contacto_Contacto}
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={handleAddContacto} className="mt-4 grid gap-3 sm:grid-cols-3">
          <select
            required
            value={tipoContactoId}
            onChange={(event) => setTipoContactoId(event.target.value)}
            className={`${inputClass} bg-white`}
          >
            <option value="">Tipo...</option>
            {tiposContacto.map((item) => (
              <option key={item.TipoContactoId} value={item.TipoContactoId}>
                {item.TipoContacto_TipoContacto}
              </option>
            ))}
          </select>
          <input
            type="text"
            required
            placeholder="Dato de contacto"
            value={contacto}
            onChange={(event) => setContacto(event.target.value)}
            className={inputClass}
          />
          <button
            type="submit"
            className="rounded-lg border border-blue-600 px-5 py-2.5 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
          >
            Agregar
          </button>
        </form>
      </div>
    </div>
  );
}
