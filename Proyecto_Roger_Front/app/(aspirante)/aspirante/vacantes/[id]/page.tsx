'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { ApiError, postulacionApi, vacanteApi } from '@/lib/api';
import { useApi } from '@/lib/useApi';
import { currencyFormatter } from '@/lib/constants';
import {
  ErrorMessage,
  Loading,
  PageHeader,
  SuccessMessage,
} from '@/components/shared/feedback';
import { StatusBadge } from '@/components/shared/status-badge';

export default function VacanteDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const vacanteId = Number(id);

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const vacante = useApi(() => vacanteApi.byId(vacanteId), [vacanteId]);

  const handleApply = async () => {
    setSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      await postulacionApi.create(vacanteId);
      setMessage('Tu postulación fue registrada. Puedes darle seguimiento desde Mis Postulaciones.');
      vacante.reload();
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'No fue posible postularte.');
    } finally {
      setSubmitting(false);
    }
  };

  if (vacante.loading) return <Loading />;
  if (vacante.error) return <ErrorMessage message={vacante.error} />;
  if (!vacante.data) return null;

  const item = vacante.data;

  return (
    <div className="space-y-6">
      <Link href="/aspirante/vacantes" className="text-sm text-blue-600 hover:underline">
        ← Volver a vacantes
      </Link>

      <PageHeader
        title={item.Vacante_Vacante}
        description={item.empresa?.Empresa_Empresa ?? 'Empresa no disponible'}
        action={<StatusBadge status={item.estado} />}
      />

      {message ? <SuccessMessage message={message} /> : null}
      {error ? <ErrorMessage message={error} /> : null}

      <div className="grid gap-4 rounded-lg border border-gray-200 bg-white p-6 sm:grid-cols-2">
        <Detail label="Carrera solicitada" value={item.carreraTarget.Carrera_Carrera} />
        <Detail label="Tipo de vacante" value={item.tipoVacante.VacanteTipo_VacanteTipo} />
        <Detail label="Turno" value={item.turno.Turno_turno} />
        <Detail label="Duración" value={item.duracionTipo.DuracionTipo_DuracionTipo} />
        <Detail label="Apoyo / salario" value={currencyFormatter.format(item.Vacante_Salario)} />
        <Detail label="Plazas disponibles" value={`${item.plazasDisponibles} de ${item.Vacante_Vacantes}`} />
        <Detail label="Dirección" value={item.empresa?.Empresa_Direccion ?? '—'} />
        <Detail label="Postulaciones recibidas" value={String(item.totalPostulaciones)} />
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
          Requisitos y observaciones
        </h2>
        <p className="mt-2 whitespace-pre-line text-sm text-gray-700">
          {item.Vacante_Observaciones || 'La empresa no registró observaciones adicionales.'}
        </p>
      </div>

      <button
        onClick={handleApply}
        disabled={submitting || item.estado === 'Cerrada'}
        className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700 disabled:bg-gray-300"
      >
        {item.estado === 'Cerrada' ? 'Vacante cerrada' : submitting ? 'Enviando...' : 'Postularme'}
      </button>
    </div>
  );
}

const Detail = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
    <p className="mt-1 text-sm text-gray-800">{value}</p>
  </div>
);
