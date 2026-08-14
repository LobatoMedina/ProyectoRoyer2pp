'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { ApiError, postulacionApi } from '@/lib/api';
import { useApi } from '@/lib/useApi';
import { formatDate } from '@/lib/constants';
import { ErrorMessage, Loading, PageHeader, SuccessMessage } from '@/components/shared/feedback';
import { StatusBadge } from '@/components/shared/status-badge';

export default function PostulacionDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const postulacionId = Number(id);

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const detalle = useApi(async () => {
    const [postulacion, historial] = await Promise.all([
      postulacionApi.byId(postulacionId),
      postulacionApi.historial(postulacionId),
    ]);

    return { postulacion, historial };
  }, [postulacionId]);

  const handleCancel = async () => {
    setError(null);
    setMessage(null);

    try {
      await postulacionApi.cancel(postulacionId);
      setMessage('Tu postulación fue cancelada.');
      detalle.reload();
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'No fue posible cancelar la postulación.');
    }
  };

  if (detalle.loading) return <Loading />;
  if (detalle.error) return <ErrorMessage message={detalle.error} />;
  if (!detalle.data) return null;

  const { postulacion, historial } = detalle.data;

  return (
    <div className="space-y-6">
      <Link href="/aspirante/postulaciones" className="text-sm text-blue-600 hover:underline">
        ← Volver a mis postulaciones
      </Link>

      <PageHeader
        title={historial.vacante}
        description={`${historial.empresa} · Postulación del ${formatDate(historial.fechaPostulacion)}`}
        action={<StatusBadge status={historial.estadoActual} />}
      />

      {message ? <SuccessMessage message={message} /> : null}
      {error ? <ErrorMessage message={error} /> : null}

      <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
          Avance del proceso
        </h2>
        <ol className="mt-4 space-y-3">
          {historial.etapas.map((etapa, index) => (
            <li key={index} className="flex items-center gap-3">
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                  etapa.alcanzada ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-500'
                }`}
              >
                {index + 1}
              </span>
              <span className={etapa.alcanzada ? 'text-gray-900' : 'text-gray-400'}>
                {etapa.etapa}
              </span>
            </li>
          ))}
        </ol>
      </div>

      {postulacion.Postulacion_Activa ? (
        <button
          onClick={handleCancel}
          className="rounded-lg border border-rose-300 px-5 py-2.5 text-sm font-medium text-rose-700 transition hover:bg-rose-50 w-full sm:w-auto"
        >
          Cancelar postulación
        </button>
      ) : null}
    </div>
  );
}
