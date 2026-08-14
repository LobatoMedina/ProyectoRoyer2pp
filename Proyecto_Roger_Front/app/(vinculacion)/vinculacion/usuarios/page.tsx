'use client';

import { useState } from 'react';
import { ApiError, catalogApi, usuarioApi } from '@/lib/api';
import { useApi } from '@/lib/useApi';
import { ErrorMessage, Loading, PageHeader, SuccessMessage } from '@/components/shared/feedback';
import { DataTable } from '@/components/shared/data-table';
import { StatusBadge } from '@/components/shared/status-badge';
import { PersonalForm } from '@/components/forms/personal-form';

export default function UsuariosPage() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const roles = useApi(() => catalogApi.roles());
  const usuarios = useApi(() => usuarioApi.list());

  const runAction = async (action: () => Promise<unknown>, successMessage: string) => {
    setMessage(null);
    setError(null);

    try {
      await action();
      setMessage(successMessage);
      usuarios.reload();
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'No fue posible completar la acción.');
    }
  };

  if (usuarios.loading) return <Loading />;
  if (usuarios.error) return <ErrorMessage message={usuarios.error} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Usuarios autorizados"
        description="Controla quién puede publicar y administrar información en la plataforma"
      />

      {message ? <SuccessMessage message={message} /> : null}
      {error ? <ErrorMessage message={error} /> : null}

      <PersonalForm
        onCreated={(texto) => {
          setError(null);
          setMessage(texto);
          usuarios.reload();
        }}
        onError={(texto) => {
          setMessage(null);
          setError(texto);
        }}
      />

      <DataTable
        data={usuarios.data ?? []}
        rowKey={(item) => item.usuarioId}
        emptyMessage="No hay usuarios registrados."
        columns={[
          { header: 'Usuario', accessor: (item) => item.usuario },
          { header: 'Persona / Empresa', accessor: (item) => item.persona ?? item.empresa ?? '—' },
          {
            header: 'Roles',
            accessor: (item) => (
              <div className="flex flex-wrap gap-2">
                {item.roles.map((rol) => (
                  <button
                    key={rol.rolId}
                    onClick={() =>
                      runAction(
                        () => usuarioApi.removeRol(item.usuarioId, rol.rolId),
                        'Rol retirado del usuario.'
                      )
                    }
                    className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-700 hover:bg-rose-100 hover:text-rose-700"
                    title="Quitar rol"
                  >
                    {rol.rol} ✕
                  </button>
                ))}
              </div>
            ),
          },
          {
            header: 'Estado',
            accessor: (item) => <StatusBadge status={item.activo ? 'Activo' : 'Inactivo'} />,
          },
          {
            header: 'Acciones',
            accessor: (item) => (
              <div className="flex flex-wrap items-center gap-3">
                <select
                  value=""
                  onChange={(event) => {
                    const rolId = Number(event.target.value);
                    if (!rolId) return;
                    runAction(
                      () => usuarioApi.assignRol(item.usuarioId, rolId),
                      'Rol asignado al usuario.'
                    );
                  }}
                  className="rounded-lg border bg-white p-1.5 text-xs text-black"
                >
                  <option value="">Asignar rol...</option>
                  {roles.data?.map((rol) => (
                    <option key={rol.RolId} value={rol.RolId}>
                      {rol.Rol_Rol}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() =>
                    runAction(
                      () => usuarioApi.updateStatus(item.usuarioId, !item.activo),
                      'Estado del usuario actualizado.'
                    )
                  }
                  className="text-sm font-medium text-blue-600 hover:underline"
                >
                  {item.activo ? 'Desactivar' : 'Activar'}
                </button>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
