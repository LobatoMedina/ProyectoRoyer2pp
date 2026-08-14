'use client';

import { use } from 'react';
import Link from 'next/link';
import { aspiranteApi } from '@/lib/api';
import { useApi } from '@/lib/useApi';
import { fullName } from '@/lib/constants';
import { EmptyState, ErrorMessage, Loading, PageHeader } from '@/components/shared/feedback';

export default function ExpedienteAspirantePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const aspiranteId = Number(id);

  const aspirante = useApi(() => aspiranteApi.byId(aspiranteId), [aspiranteId]);

  if (aspirante.loading) return <Loading />;
  if (aspirante.error) return <ErrorMessage message={aspirante.error} />;
  if (!aspirante.data) return null;

  const item = aspirante.data;
  const contactos = item.persona.personaContactos ?? [];

  return (
    <div className="space-y-6">
      <Link href="/vinculacion/aspirantes" className="text-sm text-blue-600 hover:underline">
        ← Volver a aspirantes
      </Link>

      <PageHeader title={fullName(item.persona)} description={item.carrera.Carrera_Carrera} />

      <div className="grid gap-4 rounded-lg border border-gray-200 bg-white p-6 sm:grid-cols-2">
        <Detail label="CURP" value={item.persona.Persona_CURP} />
        <Detail label="Edad" value={String(item.persona.Persona_edad)} />
        <Detail label="Sexo" value={item.persona.sexo?.Sexo_Sexo ?? '—'} />
        <Detail label="Turno" value={item.turno.Turno_turno} />
        <Detail label="Tipo" value={item.tipoAspirante.AspiranteTipo_AspiranteTipo} />
        <Detail
          label="Ciclo de inicio"
          value={item.cicloEscolarInicio.CicloEscolar_CicloEscolar}
        />
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
          Medios de contacto
        </h2>
        {contactos.length === 0 ? (
          <div className="mt-3">
            <EmptyState message="El aspirante no ha registrado medios de contacto." />
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
    </div>
  );
}

const Detail = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
    <p className="mt-1 text-sm text-gray-800">{value}</p>
  </div>
);
