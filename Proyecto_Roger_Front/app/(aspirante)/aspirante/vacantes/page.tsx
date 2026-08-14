'use client';

import { useState } from 'react';
import Link from 'next/link';
import { catalogApi, vacanteApi } from '@/lib/api';
import { useApi } from '@/lib/useApi';
import { currencyFormatter } from '@/lib/constants';
import { EmptyState, ErrorMessage, Loading, PageHeader } from '@/components/shared/feedback';
import { StatusBadge } from '@/components/shared/status-badge';

export default function AspiranteVacantesPage() {
  const [carreraId, setCarreraId] = useState('');
  const [tipoVacanteId, setTipoVacanteId] = useState('');
  const [texto, setTexto] = useState('');
  const [soloMiPerfil, setSoloMiPerfil] = useState(true);

  const catalogs = useApi(async () => {
    const [carreras, tiposVacante] = await Promise.all([
      catalogApi.carreras(),
      catalogApi.tiposVacante(),
    ]);

    return { carreras, tiposVacante };
  });

  const vacantes = useApi(
    () =>
      vacanteApi.list({
        carreraId: carreraId ? Number(carreraId) : undefined,
        tipoVacanteId: tipoVacanteId ? Number(tipoVacanteId) : undefined,
        texto: texto || undefined,
        soloMiPerfil: soloMiPerfil ? 'true' : undefined,
      }),
    [carreraId, tipoVacanteId, texto, soloMiPerfil]
  );

  const selectClass = 'w-full rounded-lg border bg-white p-2.5 text-sm text-black';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vacantes disponibles"
        description="Filtra las oportunidades por carrera, tipo o palabra clave"
      />

      <div className="grid gap-3 rounded-lg border border-gray-200 bg-white p-4 sm:grid-cols-4">
        <input
          type="search"
          placeholder="Buscar por puesto"
          value={texto}
          onChange={(event) => setTexto(event.target.value)}
          className={selectClass}
        />
        <select
          value={carreraId}
          onChange={(event) => {
            setCarreraId(event.target.value);
            if (event.target.value) setSoloMiPerfil(false);
          }}
          className={selectClass}
        >
          <option value="">Todas las carreras</option>
          {catalogs.data?.carreras.map((item) => (
            <option key={item.CarreraId} value={item.CarreraId}>
              {item.Carrera_Carrera}
            </option>
          ))}
        </select>
        <select
          value={tipoVacanteId}
          onChange={(event) => setTipoVacanteId(event.target.value)}
          className={selectClass}
        >
          <option value="">Todos los tipos</option>
          {catalogs.data?.tiposVacante.map((item) => (
            <option key={item.VacanteTipoId} value={item.VacanteTipoId}>
              {item.VacanteTipo_VacanteTipo}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={soloMiPerfil}
            onChange={(event) => {
              setSoloMiPerfil(event.target.checked);
              if (event.target.checked) setCarreraId('');
            }}
          />
          Solo mi carrera
        </label>
      </div>

      {vacantes.loading ? <Loading /> : null}
      {vacantes.error ? <ErrorMessage message={vacantes.error} /> : null}

      {!vacantes.loading && !vacantes.error ? (
        (vacantes.data ?? []).length === 0 ? (
          <EmptyState message="No se encontraron vacantes con esos criterios." />
        ) : (
          <div className="space-y-3">
            {vacantes.data?.map((vacante) => (
              <div
                key={vacante.VacanteId}
                className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-gray-900">{vacante.Vacante_Vacante}</h3>
                    <StatusBadge status={vacante.estado} />
                  </div>
                  <p className="text-sm text-gray-500">
                    {vacante.empresa?.Empresa_Empresa} · {vacante.carreraTarget.Carrera_Carrera} ·{' '}
                    {vacante.turno.Turno_turno}
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    {currencyFormatter.format(vacante.Vacante_Salario)} ·{' '}
                    {vacante.tipoVacante.VacanteTipo_VacanteTipo} · {vacante.plazasDisponibles} plaza(s)
                    disponible(s)
                  </p>
                </div>
                <Link
                  href={`/aspirante/vacantes/${vacante.VacanteId}`}
                  className="rounded bg-blue-600 px-4 py-2 text-sm text-white transition hover:bg-blue-700"
                >
                  Ver detalles
                </Link>
              </div>
            ))}
          </div>
        )
      ) : null}
    </div>
  );
}
