'use client';

import { useState } from 'react';
import { ApiError, catalogApi, postulacionApi } from '@/lib/api';
import { useApi } from '@/lib/useApi';
import { RESOLUTION, formatDate, fullName } from '@/lib/constants';
import { ErrorMessage, Loading, PageHeader, SuccessMessage } from '@/components/shared/feedback';
import { DataTable } from '@/components/shared/data-table';
import { StatusBadge } from '@/components/shared/status-badge';

export default function VinculacionPostulacionesPage() {
  const [resolucionId, setResolucionId] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const resoluciones = useApi(() => catalogApi.resoluciones());
  const postulaciones = useApi(
    () => postulacionApi.list({ resolucionId: resolucionId ? Number(resolucionId) : undefined }),
    [resolucionId]
  );

  const handleRoute = async (postulacionId: number) => {
    setMessage(null);
    setError(null);

    try {
      const result = await postulacionApi.canalizar(
        postulacionId,
        'Canalizado por la Coordinación de Vinculación.'
      );
      setMessage(result.message);
      postulaciones.reload();
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'No fue posible canalizar la postulación.');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Postulaciones"
        description="Revisa y canaliza a los aspirantes hacia la empresa correspondiente"
      />

      {message ? <SuccessMessage message={message} /> : null}
      {error ? <ErrorMessage message={error} /> : null}

      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <select
          value={resolucionId}
          onChange={(event) => setResolucionId(event.target.value)}
          className="w-full rounded-lg border bg-white p-2.5 text-sm text-black sm:w-72"
        >
          <option value="">Todos los estados</option>
          {resoluciones.data?.map((item) => (
            <option key={item.ResolucionId} value={item.ResolucionId}>
              {item.Resolucion_Resolucion}
            </option>
          ))}
        </select>
      </div>

      {postulaciones.loading ? <Loading /> : null}
      {postulaciones.error ? <ErrorMessage message={postulaciones.error} /> : null}

      {!postulaciones.loading && !postulaciones.error ? (
        <DataTable
          data={postulaciones.data ?? []}
          rowKey={(item) => item.PostulacionId}
          emptyMessage="No hay postulaciones registradas."
          columns={[
            { header: 'Aspirante', accessor: (item) => fullName(item.aspirante.persona) },
            { header: 'Carrera', accessor: (item) => item.aspirante.carrera.Carrera_Carrera },
            { header: 'Vacante', accessor: (item) => item.vacanteEmpresa.vacante.Vacante_Vacante },
            { header: 'Empresa', accessor: (item) => item.vacanteEmpresa.empresa.Empresa_Empresa },
            { header: 'Fecha', accessor: (item) => formatDate(item.Postulacion_FechaPostulacion) },
            {
              header: 'Estado',
              accessor: (item) => <StatusBadge status={item.resolucion.Resolucion_Resolucion} />,
            },
            {
              header: '',
              accessor: (item) =>
                item.resolucion.Resolucion_Resolucion === RESOLUTION.UNDER_REVIEW ? (
                  <button
                    onClick={() => handleRoute(item.PostulacionId)}
                    className="text-sm font-medium text-blue-600 hover:underline"
                  >
                    Canalizar
                  </button>
                ) : (
                  <span className="text-xs text-gray-400">Sin acciones</span>
                ),
            },
          ]}
        />
      ) : null}
    </div>
  );
}
