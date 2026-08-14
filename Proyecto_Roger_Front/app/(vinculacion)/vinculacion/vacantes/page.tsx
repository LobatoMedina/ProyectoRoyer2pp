'use client';

import { useState } from 'react';
import { catalogApi, vacanteApi } from '@/lib/api';
import { useApi } from '@/lib/useApi';
import { currencyFormatter } from '@/lib/constants';
import { ErrorMessage, Loading, PageHeader } from '@/components/shared/feedback';
import { DataTable } from '@/components/shared/data-table';
import { StatusBadge } from '@/components/shared/status-badge';

export default function VinculacionVacantesPage() {
  const [estado, setEstado] = useState('');
  const [carreraId, setCarreraId] = useState('');

  const carreras = useApi(() => catalogApi.carreras());
  const vacantes = useApi(
    () =>
      vacanteApi.list({
        estado: estado || undefined,
        carreraId: carreraId ? Number(carreraId) : undefined,
      }),
    [estado, carreraId]
  );

  const inputClass = 'w-full rounded-lg border bg-white p-2.5 text-sm text-black';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vacantes"
        description="Supervisa el estado de todas las ofertas publicadas por las empresas"
      />

      <div className="grid gap-3 rounded-lg border border-gray-200 bg-white p-4 sm:grid-cols-2">
        <select
          value={estado}
          onChange={(event) => setEstado(event.target.value)}
          className={inputClass}
        >
          <option value="">Todos los estados</option>
          <option value="Abierta">Abierta</option>
          <option value="En proceso">En proceso</option>
          <option value="Cerrada">Cerrada</option>
        </select>
        <select
          value={carreraId}
          onChange={(event) => setCarreraId(event.target.value)}
          className={inputClass}
        >
          <option value="">Todas las carreras</option>
          {carreras.data?.map((item) => (
            <option key={item.CarreraId} value={item.CarreraId}>
              {item.Carrera_Carrera}
            </option>
          ))}
        </select>
      </div>

      {vacantes.loading ? <Loading /> : null}
      {vacantes.error ? <ErrorMessage message={vacantes.error} /> : null}

      {!vacantes.loading && !vacantes.error ? (
        <DataTable
          data={vacantes.data ?? []}
          rowKey={(item) => item.VacanteId}
          emptyMessage="No hay vacantes con esos criterios."
          columns={[
            { header: 'Puesto', accessor: (item) => item.Vacante_Vacante },
            { header: 'Empresa', accessor: (item) => item.empresa?.Empresa_Empresa ?? '—' },
            { header: 'Carrera', accessor: (item) => item.carreraTarget.Carrera_Carrera },
            { header: 'Apoyo', accessor: (item) => currencyFormatter.format(item.Vacante_Salario) },
            {
              header: 'Plazas',
              accessor: (item) => `${item.plazasDisponibles} / ${item.Vacante_Vacantes}`,
            },
            { header: 'Postulantes', accessor: (item) => item.totalPostulaciones },
            { header: 'Estado', accessor: (item) => <StatusBadge status={item.estado} /> },
          ]}
        />
      ) : null}
    </div>
  );
}
