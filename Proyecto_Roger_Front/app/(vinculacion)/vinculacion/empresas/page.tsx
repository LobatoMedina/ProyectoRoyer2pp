'use client';

import Link from 'next/link';
import { empresaApi } from '@/lib/api';
import { useApi } from '@/lib/useApi';
import { ErrorMessage, Loading, PageHeader } from '@/components/shared/feedback';
import { DataTable } from '@/components/shared/data-table';
import { StatusBadge } from '@/components/shared/status-badge';

export default function VinculacionEmpresasPage() {
  const empresas = useApi(() => empresaApi.list());

  if (empresas.loading) return <Loading />;
  if (empresas.error) return <ErrorMessage message={empresas.error} />;

  return (
    <div className="space-y-6">
      <PageHeader title="Empresas" description="Organizaciones registradas en la bolsa de trabajo" />

      <DataTable
        data={empresas.data ?? []}
        rowKey={(item) => item.EmpresaId}
        emptyMessage="No hay empresas registradas."
        columns={[
          { header: 'Empresa', accessor: (item) => item.Empresa_Empresa },
          { header: 'Razón social', accessor: (item) => item.Empresa_RazonSocial },
          { header: 'RFC', accessor: (item) => item.Empresa_rfc },
          {
            header: 'Tipo',
            accessor: (item) => item.tipoEmpresa?.TipoEmpresa_TipoEmpresa ?? '—',
          },
          {
            header: 'Convenio',
            accessor: (item) => <StatusBadge status={item.estadoConvenio ?? 'Pendiente'} />,
          },
          {
            header: '',
            accessor: (item) => (
              <Link
                href={`/vinculacion/empresas/${item.EmpresaId}`}
                className="text-sm font-medium text-blue-600 hover:underline"
              >
                Ver detalle
              </Link>
            ),
          },
        ]}
      />
    </div>
  );
}
