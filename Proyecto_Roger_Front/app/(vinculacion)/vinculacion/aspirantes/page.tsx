'use client';

import { useState } from 'react';
import Link from 'next/link';
import { aspiranteApi, catalogApi } from '@/lib/api';
import { useApi } from '@/lib/useApi';
import { fullName } from '@/lib/constants';
import { ErrorMessage, Loading, PageHeader } from '@/components/shared/feedback';
import { DataTable } from '@/components/shared/data-table';

export default function VinculacionAspirantesPage() {
  const [carreraId, setCarreraId] = useState('');
  const [texto, setTexto] = useState('');

  const carreras = useApi(() => catalogApi.carreras());
  const aspirantes = useApi(
    () =>
      aspiranteApi.list({
        carreraId: carreraId ? Number(carreraId) : undefined,
        texto: texto || undefined,
      }),
    [carreraId, texto]
  );

  const inputClass = 'w-full rounded-lg border bg-white p-2.5 text-sm text-black';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Aspirantes"
        description="Estudiantes y egresados registrados en la bolsa de trabajo"
      />

      <div className="grid gap-3 rounded-lg border border-gray-200 bg-white p-4 sm:grid-cols-2">
        <input
          type="search"
          placeholder="Buscar por nombre o CURP"
          value={texto}
          onChange={(event) => setTexto(event.target.value)}
          className={inputClass}
        />
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

      {aspirantes.loading ? <Loading /> : null}
      {aspirantes.error ? <ErrorMessage message={aspirantes.error} /> : null}

      {!aspirantes.loading && !aspirantes.error ? (
        <DataTable
          data={aspirantes.data ?? []}
          rowKey={(item) => item.AspiranteId}
          emptyMessage="No se encontraron aspirantes."
          columns={[
            { header: 'Nombre', accessor: (item) => fullName(item.persona) },
            { header: 'CURP', accessor: (item) => item.persona.Persona_CURP },
            { header: 'Carrera', accessor: (item) => item.carrera.Carrera_Carrera },
            { header: 'Turno', accessor: (item) => item.turno.Turno_turno },
            {
              header: 'Tipo',
              accessor: (item) => item.tipoAspirante.AspiranteTipo_AspiranteTipo,
            },
            {
              header: '',
              accessor: (item) => (
                <Link
                  href={`/vinculacion/aspirantes/${item.AspiranteId}`}
                  className="text-sm font-medium text-blue-600 hover:underline"
                >
                  Ver expediente
                </Link>
              ),
            },
          ]}
        />
      ) : null}
    </div>
  );
}
