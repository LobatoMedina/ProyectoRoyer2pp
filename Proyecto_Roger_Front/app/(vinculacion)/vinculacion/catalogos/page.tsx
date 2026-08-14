'use client';

import { catalogApi } from '@/lib/api';
import { useApi } from '@/lib/useApi';
import { ErrorMessage, Loading, PageHeader } from '@/components/shared/feedback';

export default function CatalogosPage() {
  const catalogos = useApi(async () => {
    const [carreras, turnos, tiposEmpresa, tiposVacante, tiposDuracion, ciclos, resoluciones] =
      await Promise.all([
        catalogApi.carreras(),
        catalogApi.turnos(),
        catalogApi.tiposEmpresa(),
        catalogApi.tiposVacante(),
        catalogApi.tiposDuracion(),
        catalogApi.ciclosEscolares(),
        catalogApi.resoluciones(),
      ]);

    return [
      { title: 'Carreras', items: carreras.map((item) => item.Carrera_Carrera) },
      { title: 'Turnos', items: turnos.map((item) => item.Turno_turno) },
      { title: 'Tipos de empresa', items: tiposEmpresa.map((item) => item.TipoEmpresa_TipoEmpresa) },
      { title: 'Tipos de vacante', items: tiposVacante.map((item) => item.VacanteTipo_VacanteTipo) },
      { title: 'Duraciones', items: tiposDuracion.map((item) => item.DuracionTipo_DuracionTipo) },
      { title: 'Ciclos escolares', items: ciclos.map((item) => item.CicloEscolar_CicloEscolar) },
      { title: 'Resoluciones', items: resoluciones.map((item) => item.Resolucion_Resolucion) },
    ];
  });

  if (catalogos.loading) return <Loading />;
  if (catalogos.error) return <ErrorMessage message={catalogos.error} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Catálogos"
        description="Valores maestros que alimentan los formularios del sistema"
      />

      <div className="grid gap-4 md:grid-cols-2">
        {catalogos.data?.map((catalogo) => (
          <div key={catalogo.title} className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
              {catalogo.title}
            </h2>
            <ul className="mt-3 space-y-1 text-sm text-gray-700">
              {catalogo.items.map((item) => (
                <li key={item}>· {item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
