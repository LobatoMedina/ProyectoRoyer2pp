'use client';

import Link from 'next/link';
import { authApi, empresaApi, notificacionApi } from '@/lib/api';
import { useApi } from '@/lib/useApi';
import { formatDate } from '@/lib/constants';
import { EmptyState, ErrorMessage, Loading, PageHeader, StatCard } from '@/components/shared/feedback';
import { StatusBadge } from '@/components/shared/status-badge';

export default function EmpresaDashboardPage() {
  const dashboard = useApi(async () => {
    const me = await authApi.me();
    const empresaId = me.empresaId;

    const [vacantes, notificaciones] = await Promise.all([
      empresaId ? empresaApi.vacantes(empresaId) : Promise.resolve([]),
      notificacionApi.list(),
    ]);

    return { me, vacantes, notificaciones };
  });

  if (dashboard.loading) return <Loading />;
  if (dashboard.error) return <ErrorMessage message={dashboard.error} />;

  const vacantes = dashboard.data?.vacantes ?? [];
  const notificaciones = dashboard.data?.notificaciones ?? [];
  const estadoConvenio = dashboard.data?.me.estadoConvenio ?? 'Pendiente';

  const abiertas = vacantes.filter((item) => item.estado !== 'Cerrada').length;
  const postulaciones = vacantes.reduce((total, item) => total + item.totalPostulaciones, 0);
  const contratados = vacantes.reduce((total, item) => total + item.contratados, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Panel de la empresa"
        description="Estado de tus vacantes y procesos de selección"
        action={<StatusBadge status={estadoConvenio} />}
      />

      {estadoConvenio !== 'Vigente' ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Tu convenio aún no está vigente, por lo que no puedes publicar vacantes.{' '}
          <Link href="/empresa/convenio" className="font-medium underline">
            Revisar convenio
          </Link>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Vacantes publicadas" value={vacantes.length} />
        <StatCard label="Vacantes abiertas" value={abiertas} />
        <StatCard label="Postulaciones" value={postulaciones} />
        <StatCard label="Contrataciones" value={contratados} />
      </div>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-gray-800">Mis vacantes</h2>
          <Link href="/empresa/vacantes" className="text-sm font-medium text-blue-600 hover:underline">
            Administrar
          </Link>
        </div>
        {vacantes.length === 0 ? (
          <EmptyState message="Todavía no publicas vacantes." />
        ) : (
          <div className="space-y-3">
            {vacantes.slice(0, 4).map((vacante) => (
              <Link
                key={vacante.VacanteId}
                href={`/empresa/vacantes/${vacante.VacanteId}/postulantes`}
                className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-white p-4 transition hover:border-blue-400 sm:flex-row sm:items-center sm:justify-between sm:p-5"
              >
                <div className="min-w-0">
                  <p className="font-semibold break-words text-gray-900">{vacante.Vacante_Vacante}</p>
                  <p className="text-sm text-gray-500">
                    {vacante.totalPostulaciones} postulación(es) · {vacante.plazasDisponibles} plaza(s)
                    disponible(s)
                  </p>
                </div>
                <StatusBadge status={vacante.estado} />
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-800">Avisos</h2>
        {notificaciones.length === 0 ? (
          <EmptyState message="No hay movimientos recientes." />
        ) : (
          <div className="space-y-2">
            {notificaciones.slice(0, 5).map((item, index) => (
              <div key={index} className="rounded-lg border border-gray-200 bg-white p-4">
                <p className="font-medium text-gray-900">{item.titulo}</p>
                <p className="text-sm text-gray-600">{item.mensaje}</p>
                <p className="mt-1 text-xs text-gray-400">{formatDate(item.fecha)}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
