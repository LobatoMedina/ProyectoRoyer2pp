'use client';

import { useState } from 'react';
import { ApiError, authApi, empresaApi } from '@/lib/api';
import { useApi } from '@/lib/useApi';
import { ErrorMessage, Loading, PageHeader, SuccessMessage } from '@/components/shared/feedback';
import { StatusBadge } from '@/components/shared/status-badge';

export default function ConvenioEmpresaPage() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const convenio = useApi(async () => {
    const me = await authApi.me();
    if (!me.empresaId) throw new ApiError(404, 'No hay una empresa asociada a tu cuenta.');

    const estado = await empresaApi.miConvenio();
    return { empresaId: me.empresaId, estado: estado.estado };
  });

  const handleRespond = async (aceptado: boolean) => {
    setMessage(null);
    setError(null);

    const empresaId = convenio.data?.empresaId;
    if (!empresaId) return;

    try {
      const result = await empresaApi.responderConvenio(empresaId, aceptado);
      setMessage(result.message);
      convenio.reload();
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'No fue posible registrar tu respuesta.');
    }
  };

  if (convenio.loading) return <Loading />;
  if (convenio.error) return <ErrorMessage message={convenio.error} />;

  const estado = convenio.data?.estado ?? 'Pendiente';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Convenio con la universidad"
        description="El convenio vigente habilita la publicación y administración de vacantes"
        action={<StatusBadge status={estado} />}
      />

      {message ? <SuccessMessage message={message} /> : null}
      {error ? <ErrorMessage message={error} /> : null}

      <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
        <p className="text-sm text-gray-700">
          Al aceptar el convenio, tu empresa se compromete a publicar información veraz sobre sus
          vacantes, dar seguimiento a los aspirantes canalizados por la Coordinación de Vinculación y
          notificar el resultado de cada proceso de selección.
        </p>

        {estado === 'Vigente' ? (
          <button
            onClick={() => handleRespond(false)}
            className="rounded-lg border border-rose-300 px-5 py-2.5 text-sm font-medium text-rose-700 transition hover:bg-rose-50"
          >
            Dar de baja el convenio
          </button>
        ) : (
          <button
            onClick={() => handleRespond(true)}
            className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700"
          >
            Aceptar convenio
          </button>
        )}
      </div>
    </div>
  );
}
