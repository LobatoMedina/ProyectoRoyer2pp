'use client';

import { reporteApi } from '@/lib/api';
import { useApi } from '@/lib/useApi';
import { ErrorMessage, Loading, PageHeader, StatCard } from '@/components/shared/feedback';
import { DataTable } from '@/components/shared/data-table';

export default function VinculacionDashboardPage() {
  const reportes = useApi(async () => {
    const [resumen, demanda, embudo, empresas, vacantes] = await Promise.all([
      reporteApi.resumen(),
      reporteApi.demandaPorCarrera(),
      reporteApi.postulacionesPorResolucion(),
      reporteApi.participacionPorEmpresa(),
      reporteApi.vacantesMasDemandadas(),
    ]);

    return { resumen, demanda, embudo, empresas, vacantes };
  });

  if (reportes.loading) return <Loading label="Generando reportes..." />;
  if (reportes.error) return <ErrorMessage message={reportes.error} />;
  if (!reportes.data) return null;

  const { resumen, demanda, embudo, empresas, vacantes } = reportes.data;
  const maxDemanda = Math.max(...demanda.map((item) => item.total), 1);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reportes e indicadores"
        description="Demanda de vacantes, áreas de mayor interés y niveles de participación"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Aspirantes" value={resumen.totalAspirantes} />
        <StatCard
          label="Empresas"
          value={resumen.totalEmpresas}
          hint={`${resumen.empresasConConvenio} con convenio vigente`}
        />
        <StatCard
          label="Vacantes activas"
          value={resumen.vacantesActivas}
          hint={`${resumen.plazasOfertadas} plazas ofertadas`}
        />
        <StatCard
          label="Postulaciones"
          value={resumen.totalPostulaciones}
          hint={`${resumen.contratados} contrataciones (${resumen.tasaContratacion}%)`}
        />
      </div>

      <section className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
          Demanda por carrera
        </h2>
        {demanda.length === 0 ? (
          <p className="mt-3 text-sm text-gray-500">Aún no hay postulaciones registradas.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {demanda.map((item) => (
              <li key={item.id}>
                <div className="flex justify-between gap-3 text-sm text-gray-700">
                  <span className="min-w-0 break-words">{item.etiqueta}</span>
                  <span className="shrink-0 font-semibold">{item.total}</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-gray-100">
                  <div
                    className="h-2 rounded-full bg-blue-600"
                    style={{ width: `${(item.total / maxDemanda) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
          Etapas del proceso de selección
        </h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {embudo.map((item) => (
            <div key={item.id} className="rounded-lg bg-gray-50 p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{item.total}</p>
              <p className="mt-1 text-xs text-gray-500">{item.etiqueta}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-800">Participación por empresa</h2>
        <DataTable
          data={empresas}
          rowKey={(item) => item.empresaId}
          emptyMessage="No hay empresas registradas."
          columns={[
            { header: 'Empresa', accessor: (item) => item.empresa },
            { header: 'Vacantes', accessor: (item) => item.vacantes },
            { header: 'Activas', accessor: (item) => item.vacantesActivas },
            { header: 'Postulaciones', accessor: (item) => item.postulaciones },
            { header: 'Contrataciones', accessor: (item) => item.contratados },
          ]}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-800">Vacantes más demandadas</h2>
        <DataTable
          data={vacantes}
          rowKey={(item) => item.vacanteId}
          emptyMessage="No hay vacantes publicadas."
          columns={[
            { header: 'Vacante', accessor: (item) => item.vacante },
            { header: 'Empresa', accessor: (item) => item.empresa ?? '—' },
            { header: 'Carrera', accessor: (item) => item.carrera },
            { header: 'Plazas', accessor: (item) => item.plazas },
            { header: 'Postulaciones', accessor: (item) => item.postulaciones },
            { header: 'En proceso', accessor: (item) => item.enProceso },
          ]}
        />
      </section>
    </div>
  );
}
