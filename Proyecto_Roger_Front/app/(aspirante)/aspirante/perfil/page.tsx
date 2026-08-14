'use client';

import { useState } from 'react';
import { ApiError, aspiranteApi, catalogApi } from '@/lib/api';
import { useApi } from '@/lib/useApi';
import { fullName } from '@/lib/constants';
import {
  EmptyState,
  ErrorMessage,
  Loading,
  PageHeader,
  SuccessMessage,
} from '@/components/shared/feedback';

export default function PerfilAspirantePage() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [contacto, setContacto] = useState('');
  const [tipoContactoId, setTipoContactoId] = useState('');
  const [edad, setEdad] = useState('');
  const [carreraId, setCarreraId] = useState('');
  const [turnoId, setTurnoId] = useState('');

  const perfil = useApi(async () => {
    const [aspirante, carreras, turnos, tiposContacto] = await Promise.all([
      aspiranteApi.me(),
      catalogApi.carreras(),
      catalogApi.turnos(),
      catalogApi.tiposContacto(),
    ]);

    setEdad(String(aspirante.persona.Persona_edad));
    setCarreraId(String(aspirante.carrera.CarreraId));
    setTurnoId(String(aspirante.turno.TurnoId));

    return { aspirante, carreras, turnos, tiposContacto };
  });

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);
    setError(null);

    const aspiranteId = perfil.data?.aspirante.AspiranteId;
    if (!aspiranteId) return;

    try {
      await aspiranteApi.update(aspiranteId, {
        edad: Number(edad),
        carreraId: Number(carreraId),
        turnoId: Number(turnoId),
      });
      setMessage('Tu expediente fue actualizado.');
      perfil.reload();
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'No fue posible guardar los cambios.');
    }
  };

  const handleAddContacto = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);
    setError(null);

    const aspiranteId = perfil.data?.aspirante.AspiranteId;
    if (!aspiranteId) return;

    try {
      await aspiranteApi.addContacto(aspiranteId, contacto, Number(tipoContactoId));
      setContacto('');
      setTipoContactoId('');
      setMessage('Medio de contacto agregado.');
      perfil.reload();
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'No fue posible agregar el contacto.');
    }
  };

  const handleRemoveContacto = async (contactoId: number) => {
    const aspiranteId = perfil.data?.aspirante.AspiranteId;
    if (!aspiranteId) return;

    try {
      await aspiranteApi.removeContacto(aspiranteId, contactoId);
      perfil.reload();
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'No fue posible eliminar el contacto.');
    }
  };

  if (perfil.loading) return <Loading />;
  if (perfil.error) return <ErrorMessage message={perfil.error} />;
  if (!perfil.data) return null;

  const { aspirante, carreras, turnos, tiposContacto } = perfil.data;
  const contactos = aspirante.persona.personaContactos ?? [];
  const inputClass = 'mt-1 w-full rounded-lg border p-2.5 text-sm text-black';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mi perfil"
        description="Mantén actualizados tus datos académicos y medios de contacto"
      />

      {message ? <SuccessMessage message={message} /> : null}
      {error ? <ErrorMessage message={error} /> : null}

      <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
          Datos personales
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <p className="text-sm text-gray-800">
            <span className="text-gray-500">Nombre: </span>
            {fullName(aspirante.persona)}
          </p>
          <p className="text-sm text-gray-800">
            <span className="text-gray-500">CURP: </span>
            {aspirante.persona.Persona_CURP}
          </p>
          <p className="text-sm text-gray-800">
            <span className="text-gray-500">Tipo: </span>
            {aspirante.tipoAspirante.AspiranteTipo_AspiranteTipo}
          </p>
          <p className="text-sm text-gray-800">
            <span className="text-gray-500">Ciclo de inicio: </span>
            {aspirante.cicloEscolarInicio.CicloEscolar_CicloEscolar}
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
          Datos académicos
        </h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Edad</label>
            <input
              type="number"
              min={15}
              max={99}
              value={edad}
              onChange={(event) => setEdad(event.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Carrera</label>
            <select
              value={carreraId}
              onChange={(event) => setCarreraId(event.target.value)}
              className={`${inputClass} bg-white`}
            >
              {carreras.map((item) => (
                <option key={item.CarreraId} value={item.CarreraId}>
                  {item.Carrera_Carrera}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Turno</label>
            <select
              value={turnoId}
              onChange={(event) => setTurnoId(event.target.value)}
              className={`${inputClass} bg-white`}
            >
              {turnos.map((item) => (
                <option key={item.TurnoId} value={item.TurnoId}>
                  {item.Turno_turno}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button
          type="submit"
          className="mt-4 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 w-full sm:w-auto"
        >
          Guardar cambios
        </button>
      </form>

      <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
          Medios de contacto
        </h2>

        {contactos.length === 0 ? (
          <div className="mt-3">
            <EmptyState message="Aún no registras medios de contacto. Las empresas los necesitan para comunicarse contigo." />
          </div>
        ) : (
          <ul className="mt-3 divide-y divide-gray-200">
            {contactos.map(({ contacto: item }) => (
              <li key={item.ContactoId} className="flex items-center justify-between py-3">
                <span className="text-sm text-gray-800">
                  <span className="text-gray-500">
                    {item.tipoContacto?.TipoContacto_TipoContacto ?? 'Contacto'}:{' '}
                  </span>
                  {item.Contacto_Contacto}
                </span>
                <button
                  onClick={() => handleRemoveContacto(item.ContactoId)}
                  className="text-xs font-medium text-rose-600 hover:underline"
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={handleAddContacto} className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <select
            required
            value={tipoContactoId}
            onChange={(event) => setTipoContactoId(event.target.value)}
            className={`${inputClass} bg-white`}
          >
            <option value="">Tipo...</option>
            {tiposContacto.map((item) => (
              <option key={item.TipoContactoId} value={item.TipoContactoId}>
                {item.TipoContacto_TipoContacto}
              </option>
            ))}
          </select>
          <input
            type="text"
            required
            placeholder="Dato de contacto"
            value={contacto}
            onChange={(event) => setContacto(event.target.value)}
            className={inputClass}
          />
          <button
            type="submit"
            className="mt-1 rounded-lg border border-blue-600 px-5 py-2.5 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
          >
            Agregar
          </button>
        </form>
      </div>
    </div>
  );
}
