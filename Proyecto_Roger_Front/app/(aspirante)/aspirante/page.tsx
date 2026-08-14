'use client';

import Link from 'next/link';
import { notificacionApi, postulacionApi, vacanteApi } from '@/lib/api';
import { useApi } from '@/lib/useApi';
import { RESOLUTION, formatDate } from '@/lib/constants';
import { EmptyState, ErrorMessage, Loading, PageHeader, StatCard } from '@/components/shared/feedback';
import { StatusBadge } from '@/components/shared/status-badge';

export default function AspiranteDashboardPage() {
  const dashboard = useApi(async () => {
    const [postulaciones, recomendadas, notificaciones] = await Promise.all([
      postulacionApi.mine(),
      vacanteApi.list({ soloMiPerfil: 'true', estado: 'Abierta' }),
      notificacionApi.list(),
    ]);

    return { postulaciones, recomendadas, notificaciones };
  });

  if (dashboard.loading) return <Loading />;
  if (dashboard.error) return <ErrorMessage message={dashboard.error} />;

  const postulaciones = dashboard.data?.postulaciones ?? [];
  const recomendadas = dashboard.data?.recomendadas ?? [];
  const notificaciones = dashboard.data?.notificaciones ?? [];

  const enProceso = postulaciones.filter(
    (item) =>
      item.Postulacion_Activa &&
      ![RESOLUTION.REJECTED, RESOLUTION.HIRED].includes(item.resolucion.Resolucion_Resolucion)
  ).length;

  const contratado = postulaciones.filter(
    (item) => item.resolucion.Resolucion_Resolucion === RESOLUTION.HIRED
  ).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mi panel"
        description="Resumen de tus postulaciones y oportunidades para tu carrera"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Postulaciones" value={postulaciones.length} />
        <StatCard label="En proceso" value={enProceso} />
        <StatCard label="Contrataciones" value={contratado} />
        <StatCard label="Vacantes para tu carrera" value={recomendadas.length} />
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-800">Avisos recientes</h2>
        {notificaciones.length === 0 ? (
          <EmptyState message="No tienes avisos nuevos." />
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

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Recomendadas para tu perfil</h2>
          <Link href="/aspirante/vacantes" className="text-sm font-medium text-blue-600 hover:underline">
            Ver todas
          </Link>
        </div>
        {recomendadas.length === 0 ? (
          <EmptyState message="Por ahora no hay vacantes abiertas para tu carrera." />
        ) : (
          <div className="space-y-3">
            {recomendadas.slice(0, 4).map((vacante) => (
              <Link
                key={vacante.VacanteId}
                href={`/aspirante/vacantes/${vacante.VacanteId}`}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-5 transition hover:border-blue-400"
              >
                <div>
                  <p className="font-semibold text-gray-900">{vacante.Vacante_Vacante}</p>
                  <p className="text-sm text-gray-500">
                    {vacante.empresa?.Empresa_Empresa} · {vacante.tipoVacante.VacanteTipo_VacanteTipo}
                  </p>
                </div>
                <StatusBadge status={vacante.estado} />
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
