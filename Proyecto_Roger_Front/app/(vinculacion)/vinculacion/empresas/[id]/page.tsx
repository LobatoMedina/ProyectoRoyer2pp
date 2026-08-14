'use client';

import { use } from 'react';
import Link from 'next/link';
import { empresaApi } from '@/lib/api';
import { useApi } from '@/lib/useApi';
import { currencyFormatter } from '@/lib/constants';
import { EmptyState, ErrorMessage, Loading, PageHeader } from '@/components/shared/feedback';
import { DataTable } from '@/components/shared/data-table';
import { StatusBadge } from '@/components/shared/status-badge';

export default function DetalleEmpresaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const empresaId = Number(id);

  const detalle = useApi(async () => {
    const [empresa, vacantes] = await Promise.all([
      empresaApi.byId(empresaId),
      empresaApi.vacantes(empresaId),
    ]);

    return { empresa, vacantes };
  }, [empresaId]);

  if (detalle.loading) return <Loading />;
  if (detalle.error) return <ErrorMessage message={detalle.error} />;
  if (!detalle.data) return null;

  const { empresa, vacantes } = detalle.data;
  const contactos = empresa.empresaContactos ?? [];

  return (
    <div className="space-y-6">
      <Link href="/vinculacion/empresas" className="text-sm text-blue-600 hover:underline">
        ← Volver a empresas
      </Link>

      <PageHeader
        title={empresa.Empresa_Empresa}
        description={empresa.Empresa_RazonSocial}
        action={<StatusBadge status={empresa.estadoConvenio ?? 'Pendiente'} />}
      />

      <div className="grid gap-4 rounded-lg border border-gray-200 bg-white p-4 sm:grid-cols-2 sm:p-6">
        <Detail label="RFC" value={empresa.Empresa_rfc} />
        <Detail label="Tipo" value={empresa.tipoEmpresa?.TipoEmpresa_TipoEmpresa ?? '—'} />
        <Detail label="Dirección" value={empresa.Empresa_Direccion} />
        <Detail label="Usuario" value={empresa.usuario?.Usuario_Usuario ?? '—'} />
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Contactos</h2>
        {contactos.length === 0 ? (
          <div className="mt-3">
            <EmptyState message="La empresa no ha registrado medios de contacto." />
          </div>
        ) : (
          <ul className="mt-3 divide-y divide-gray-200">
            {contactos.map(({ contacto }) => (
              <li key={contacto.ContactoId} className="py-3 text-sm text-gray-800">
                <span className="text-gray-500">
                  {contacto.tipoContacto?.TipoContacto_TipoContacto ?? 'Contacto'}:{' '}
                </span>
                {contacto.Contacto_Contacto}
              </li>
            ))}
          </ul>
        )}
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-800">Vacantes publicadas</h2>
        <DataTable
          data={vacantes}
          rowKey={(item) => item.VacanteId}
          emptyMessage="La empresa no ha publicado vacantes."
          columns={[
            { header: 'Puesto', accessor: (item) => item.Vacante_Vacante },
            { header: 'Carrera', accessor: (item) => item.carreraTarget.Carrera_Carrera },
            { header: 'Apoyo', accessor: (item) => currencyFormatter.format(item.Vacante_Salario) },
            { header: 'Postulantes', accessor: (item) => item.totalPostulaciones },
            { header: 'Estado', accessor: (item) => <StatusBadge status={item.estado} /> },
          ]}
        />
      </section>
    </div>
  );
}

const Detail = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
    <p className="mt-1 break-words text-sm text-gray-800">{value}</p>
  </div>
);
