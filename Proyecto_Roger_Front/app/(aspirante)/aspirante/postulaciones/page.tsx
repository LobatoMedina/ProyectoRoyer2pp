'use client';

import Link from 'next/link';
import { postulacionApi } from '@/lib/api';
import { useApi } from '@/lib/useApi';
import { formatDate } from '@/lib/constants';
import { EmptyState, ErrorMessage, Loading, PageHeader } from '@/components/shared/feedback';
import { DataTable } from '@/components/shared/data-table';
import { StatusBadge } from '@/components/shared/status-badge';

export default function MisPostulacionesPage() {
  const postulaciones = useApi(() => postulacionApi.mine());

  if (postulaciones.loading) return <Loading />;
  if (postulaciones.error) return <ErrorMessage message={postulaciones.error} />;

  const data = postulaciones.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mis postulaciones"
        description="Seguimiento del estado de cada proceso en el que participas"
      />

      {data.length === 0 ? (
        <EmptyState message="Aún no te has postulado a ninguna vacante." />
      ) : (
        <DataTable
          data={data}
          rowKey={(item) => item.PostulacionId}
          columns={[
            { header: 'Vacante', accessor: (item) => item.vacanteEmpresa.vacante.Vacante_Vacante },
            { header: 'Empresa', accessor: (item) => item.vacanteEmpresa.empresa.Empresa_Empresa },
            { header: 'Fecha', accessor: (item) => formatDate(item.Postulacion_FechaPostulacion) },
            {
              header: 'Estado',
              accessor: (item) => <StatusBadge status={item.resolucion.Resolucion_Resolucion} />,
            },
            {
              header: 'Activa',
              accessor: (item) => (item.Postulacion_Activa ? 'Sí' : 'Cancelada'),
            },
            {
              header: '',
              accessor: (item) => (
                <Link
                  href={`/aspirante/postulaciones/${item.PostulacionId}`}
                  className="text-sm font-medium text-blue-600 hover:underline"
                >
                  Ver seguimiento
                </Link>
              ),
            },
          ]}
        />
      )}
    </div>
  );
}
