'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { ApiError, catalogApi, postulacionApi, vacanteApi } from '@/lib/api';
import { useApi } from '@/lib/useApi';
import { formatDate, fullName } from '@/lib/constants';
import {
  EmptyState,
  ErrorMessage,
  Loading,
  PageHeader,
  SuccessMessage,
} from '@/components/shared/feedback';
import { StatusBadge } from '@/components/shared/status-badge';

/**
 * Valor mínimo para el input datetime-local: el momento actual en hora local.
 * El backend vuelve a validarlo; esto solo evita el intento desde la interfaz.
 */
const ahoraLocal = () => {
  const ahora = new Date();
  ahora.setMinutes(ahora.getMinutes() - ahora.getTimezoneOffset());
  return ahora.toISOString().slice(0, 16);
};

export default function PostulantesVacantePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const vacanteId = Number(id);

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [interviewFor, setInterviewFor] = useState<number | null>(null);
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewPlace, setInterviewPlace] = useState('');

  const view = useApi(async () => {
    const [vacante, postulaciones, resoluciones] = await Promise.all([
      vacanteApi.byId(vacanteId),
      vacanteApi.postulaciones(vacanteId),
      catalogApi.resoluciones(),
    ]);

    return { vacante, postulaciones, resoluciones };
  }, [vacanteId]);

  const runAction = async (action: () => Promise<unknown>, successMessage: string) => {
    setMessage(null);
    setError(null);

    try {
      await action();
      setMessage(successMessage);
      view.reload();
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'No fue posible completar la acción.');
    }
  };

  const handleInterview = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!interviewFor) return;

    if (new Date(interviewDate).getTime() <= Date.now()) {
      setMessage(null);
      setError('No es posible agendar una entrevista en una fecha u hora que ya pasó.');
      return;
    }

    await runAction(
      () => postulacionApi.notificarEntrevista(interviewFor, interviewDate, interviewPlace),
      'Entrevista notificada al aspirante.'
    );

    setInterviewFor(null);
    setInterviewDate('');
    setInterviewPlace('');
  };

  if (view.loading) return <Loading />;
  if (view.error) return <ErrorMessage message={view.error} />;
  if (!view.data) return null;

  const { vacante, postulaciones, resoluciones } = view.data;

  return (
    <div className="space-y-6">
      <Link href="/empresa/vacantes" className="text-sm text-blue-600 hover:underline">
        ← Volver a mis vacantes
      </Link>

      <PageHeader
        title={vacante.Vacante_Vacante}
        description={`${vacante.plazasDisponibles} de ${vacante.Vacante_Vacantes} plaza(s) disponibles`}
        action={<StatusBadge status={vacante.estado} />}
      />

      {message ? <SuccessMessage message={message} /> : null}
      {error ? <ErrorMessage message={error} /> : null}

      {postulaciones.length === 0 ? (
        <EmptyState message="Esta vacante todavía no tiene postulantes." />
      ) : (
        <div className="space-y-4">
          {postulaciones.map((postulacion) => (
            <div
              key={postulacion.PostulacionId}
              className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900">
                    {fullName(postulacion.aspirante.persona)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {postulacion.aspirante.carrera.Carrera_Carrera} ·{' '}
                    {postulacion.aspirante.tipoAspirante.AspiranteTipo_AspiranteTipo} ·{' '}
                    {postulacion.aspirante.turno.Turno_turno}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    Postulado el {formatDate(postulacion.Postulacion_FechaPostulacion)}
                  </p>
                </div>
                <StatusBadge status={postulacion.resolucion.Resolucion_Resolucion} />
              </div>

              <div className="break-words text-sm text-gray-600">
                <span className="font-medium text-gray-700">Contacto: </span>
                {(postulacion.aspirante.persona.personaContactos ?? []).length === 0
                  ? 'El aspirante no registró medios de contacto.'
                  : (postulacion.aspirante.persona.personaContactos ?? [])
                      .map(({ contacto }) => contacto.Contacto_Contacto)
                      .join(' · ')}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <select
                  value=""
                  onChange={(event) => {
                    const resolucionId = Number(event.target.value);
                    if (!resolucionId) return;
                    runAction(
                      () => postulacionApi.cambiarResolucion(postulacion.PostulacionId, resolucionId),
                      'Estado del postulante actualizado.'
                    );
                  }}
                  className="w-full rounded-lg border bg-white p-2 text-sm text-black sm:w-auto"
                >
                  <option value="">Cambiar estado...</option>
                  {resoluciones.map((item) => (
                    <option key={item.ResolucionId} value={item.ResolucionId}>
                      {item.Resolucion_Resolucion}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => setInterviewFor(postulacion.PostulacionId)}
                  className="w-full rounded-lg border border-indigo-300 px-4 py-2 text-sm font-medium text-indigo-700 transition hover:bg-indigo-50 sm:w-auto"
                >
                  Agendar entrevista
                </button>

                <button
                  onClick={() =>
                    runAction(
                      () => postulacionApi.contratar(postulacion.PostulacionId),
                      'Aspirante marcado como contratado.'
                    )
                  }
                  className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 sm:w-auto"
                >
                  Contratar
                </button>
              </div>

              {interviewFor === postulacion.PostulacionId ? (
                <form
                  onSubmit={handleInterview}
                  className="grid gap-3 rounded-lg bg-gray-50 p-4 sm:grid-cols-2 lg:grid-cols-3"
                >
                  <input
                    type="datetime-local"
                    required
                    min={ahoraLocal()}
                    value={interviewDate}
                    onChange={(event) => setInterviewDate(event.target.value)}
                    className="w-full rounded-lg border p-2 text-sm text-black"
                  />
                  <input
                    type="text"
                    placeholder="Lugar o enlace"
                    value={interviewPlace}
                    onChange={(event) => setInterviewPlace(event.target.value)}
                    className="w-full rounded-lg border p-2 text-sm text-black"
                  />
                  <button
                    type="submit"
                    className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 sm:col-span-2 lg:col-span-1 lg:w-auto"
                  >
                    Notificar
                  </button>
                </form>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
