'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ApiError, authApi, empresaApi, vacanteApi } from '@/lib/api';
import { useApi } from '@/lib/useApi';
import { currencyFormatter } from '@/lib/constants';
import { EmptyState, ErrorMessage, Loading, PageHeader } from '@/components/shared/feedback';
import { DataTable } from '@/components/shared/data-table';
import { StatusBadge } from '@/components/shared/status-badge';

export default function EmpresaVacantesPage() {
  const [error, setError] = useState<string | null>(null);

  const vacantes = useApi(async () => {
    const me = await authApi.me();
    if (!me.empresaId) return [];
    return empresaApi.vacantes(me.empresaId);
  });

  const handleToggle = async (vacanteId: number, activa: boolean) => {
    setError(null);

    try {
      await vacanteApi.updateStatus(vacanteId, activa);
      vacantes.reload();
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'No fue posible actualizar la vacante.');
    }
  };

  if (vacantes.loading) return <Loading />;
  if (vacantes.error) return <ErrorMessage message={vacantes.error} />;

  const data = vacantes.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mis vacantes"
        description="Publica, actualiza y cierra tus ofertas laborales"
        action={
          <Link
            href="/empresa/vacantes/nueva"
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            Nueva vacante
          </Link>
        }
      />

      {error ? <ErrorMessage message={error} /> : null}

      {data.length === 0 ? (
        <EmptyState message="Aún no publicas vacantes." />
      ) : (
        <DataTable
          data={data}
          rowKey={(item) => item.VacanteId}
          columns={[
            { header: 'Puesto', accessor: (item) => item.Vacante_Vacante },
            { header: 'Carrera', accessor: (item) => item.carreraTarget.Carrera_Carrera },
            {
              header: 'Apoyo',
              accessor: (item) => currencyFormatter.format(item.Vacante_Salario),
            },
            {
              header: 'Plazas',
              accessor: (item) => `${item.plazasDisponibles} / ${item.Vacante_Vacantes}`,
            },
            { header: 'Postulantes', accessor: (item) => item.totalPostulaciones },
            { header: 'Estado', accessor: (item) => <StatusBadge status={item.estado} /> },
            {
              header: 'Acciones',
              accessor: (item) => (
                <div className="flex gap-3 text-sm font-medium">
                  <Link
                    href={`/empresa/vacantes/${item.VacanteId}/postulantes`}
                    className="text-blue-600 hover:underline"
                  >
                    Postulantes
                  </Link>
                  <Link
                    href={`/empresa/vacantes/${item.VacanteId}/editar`}
                    className="text-gray-600 hover:underline"
                  >
                    Editar
                  </Link>
                  <button
                    onClick={() => handleToggle(item.VacanteId, !item.Vacante_Activa)}
                    className="text-rose-600 hover:underline"
                  >
                    {item.Vacante_Activa ? 'Cerrar' : 'Reabrir'}
                  </button>
                </div>
              ),
            },
          ]}
        />
      )}
    </div>
  );
}
