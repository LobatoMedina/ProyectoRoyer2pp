'use client';

import { useState } from 'react';
import { ApiError, empresaApi } from '@/lib/api';
import { useApi } from '@/lib/useApi';
import { ErrorMessage, Loading, PageHeader, SuccessMessage } from '@/components/shared/feedback';
import { DataTable } from '@/components/shared/data-table';
import { StatusBadge } from '@/components/shared/status-badge';

export default function ConveniosPage() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const convenios = useApi(() => empresaApi.convenios());

  const handleRequest = async (empresaId: number) => {
    setMessage(null);
    setError(null);

    try {
      const result = await empresaApi.solicitarConvenio(
        empresaId,
        'Solicitud emitida por la Coordinación de Vinculación.'
      );
      setMessage(result.message);
      convenios.reload();
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'No fue posible enviar la solicitud.');
    }
  };

  if (convenios.loading) return <Loading />;
  if (convenios.error) return <ErrorMessage message={convenios.error} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Convenios"
        description="Una empresa solo puede publicar vacantes cuando su convenio está vigente"
      />

      {message ? <SuccessMessage message={message} /> : null}
      {error ? <ErrorMessage message={error} /> : null}

      <DataTable
        data={convenios.data ?? []}
        rowKey={(item) => item.empresaId}
        emptyMessage="No hay empresas registradas."
        columns={[
          { header: 'Empresa', accessor: (item) => item.empresa },
          { header: 'Razón social', accessor: (item) => item.razonSocial },
          { header: 'RFC', accessor: (item) => item.rfc },
          { header: 'Estado', accessor: (item) => <StatusBadge status={item.estado} /> },
          {
            header: '',
            accessor: (item) =>
              item.estado === 'Vigente' ? (
                <button
                  onClick={() => handleRequest(item.empresaId)}
                  className="text-sm font-medium text-rose-600 hover:underline"
                >
                  Revocar / solicitar renovación
                </button>
              ) : (
                <button
                  onClick={() => handleRequest(item.empresaId)}
                  className="text-sm font-medium text-blue-600 hover:underline"
                >
                  Reenviar solicitud
                </button>
              ),
          },
        ]}
      />
    </div>
  );
}
