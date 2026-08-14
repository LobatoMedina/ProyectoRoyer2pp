'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ApiError, authApi, catalogApi } from '@/lib/api';
import { useApi } from '@/lib/useApi';
import { homePathForRole, setSession, toRoleSlug } from '@/lib/auth';
import { ErrorMessage, Loading } from '@/components/shared/feedback';
import { AuthCard } from '@/components/shared/auth-card';

const initialForm = {
  usuario: '',
  contrasena: '',
  nombre: '',
  apellidoPaterno: '',
  apellidoMaterno: '',
  curp: '',
  sexoId: '',
  edad: '',
  tipoAspiranteId: '',
  carreraId: '',
  turnoId: '',
  cicloEscolarInicioId: '',
};

export default function RegistroAspirantePage() {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const catalogs = useApi(async () => {
    const [carreras, turnos, tiposAspirante, ciclos, sexos] = await Promise.all([
      catalogApi.carreras(),
      catalogApi.turnos(),
      catalogApi.tiposAspirante(),
      catalogApi.ciclosEscolares(),
      catalogApi.sexos(),
    ]);

    return { carreras, turnos, tiposAspirante, ciclos, sexos };
  });

  const updateField = (field: keyof typeof initialForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const result = await authApi.registerAspirante({
        usuario: form.usuario,
        contrasena: form.contrasena,
        nombre: form.nombre,
        apellidoPaterno: form.apellidoPaterno,
        apellidoMaterno: form.apellidoMaterno || undefined,
        curp: form.curp.toUpperCase(),
        sexoId: Number(form.sexoId),
        edad: Number(form.edad),
        tipoAspiranteId: Number(form.tipoAspiranteId),
        carreraId: Number(form.carreraId),
        turnoId: Number(form.turnoId),
        cicloEscolarInicioId: Number(form.cicloEscolarInicioId),
      });

      setSession(result.usuario, result.token);
      window.location.href = homePathForRole(toRoleSlug(result.usuario.roles));
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'No fue posible completar el registro.');
      setSubmitting(false);
    }
  };

  if (catalogs.loading)
    return (
      <AuthCard>
        <Loading label="Cargando catálogos..." />
      </AuthCard>
    );

  if (catalogs.error)
    return (
      <AuthCard>
        <ErrorMessage message={catalogs.error} />
      </AuthCard>
    );

  const inputClass = 'mt-1 w-full rounded-lg border p-2.5 text-black';

  return (
    <AuthCard wide>
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Registro de aspirante</h2>
          <p className="mt-1 text-sm text-gray-500">Estudiantes y egresados de la universidad</p>
        </div>

        {error ? <ErrorMessage message={error} /> : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Usuario</label>
              <input
                type="text"
                required
                value={form.usuario}
                onChange={(event) => updateField('usuario', event.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Contraseña</label>
              <input
                type="password"
                required
                minLength={6}
                value={form.contrasena}
                onChange={(event) => updateField('contrasena', event.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre(s)</label>
              <input
                type="text"
                required
                value={form.nombre}
                onChange={(event) => updateField('nombre', event.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Apellido paterno</label>
              <input
                type="text"
                required
                value={form.apellidoPaterno}
                onChange={(event) => updateField('apellidoPaterno', event.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Apellido materno</label>
              <input
                type="text"
                value={form.apellidoMaterno}
                onChange={(event) => updateField('apellidoMaterno', event.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">CURP</label>
              <input
                type="text"
                required
                minLength={18}
                maxLength={18}
                value={form.curp}
                onChange={(event) => updateField('curp', event.target.value)}
                className={`${inputClass} uppercase`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Sexo</label>
              <select
                required
                value={form.sexoId}
                onChange={(event) => updateField('sexoId', event.target.value)}
                className={`${inputClass} bg-white`}
              >
                <option value="">Selecciona...</option>
                {catalogs.data?.sexos.map((item) => (
                  <option key={item.SexoId} value={item.SexoId}>
                    {item.Sexo_Sexo}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Edad</label>
              <input
                type="number"
                required
                min={15}
                max={99}
                value={form.edad}
                onChange={(event) => updateField('edad', event.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Tipo de aspirante</label>
              <select
                required
                value={form.tipoAspiranteId}
                onChange={(event) => updateField('tipoAspiranteId', event.target.value)}
                className={`${inputClass} bg-white`}
              >
                <option value="">Selecciona...</option>
                {catalogs.data?.tiposAspirante.map((item) => (
                  <option key={item.AspiranteTipoId} value={item.AspiranteTipoId}>
                    {item.AspiranteTipo_AspiranteTipo}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Turno</label>
              <select
                required
                value={form.turnoId}
                onChange={(event) => updateField('turnoId', event.target.value)}
                className={`${inputClass} bg-white`}
              >
                <option value="">Selecciona...</option>
                {catalogs.data?.turnos.map((item) => (
                  <option key={item.TurnoId} value={item.TurnoId}>
                    {item.Turno_turno}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Carrera</label>
              <select
                required
                value={form.carreraId}
                onChange={(event) => updateField('carreraId', event.target.value)}
                className={`${inputClass} bg-white`}
              >
                <option value="">Selecciona...</option>
                {catalogs.data?.carreras.map((item) => (
                  <option key={item.CarreraId} value={item.CarreraId}>
                    {item.Carrera_Carrera}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Ciclo escolar de inicio
              </label>
              <select
                required
                value={form.cicloEscolarInicioId}
                onChange={(event) => updateField('cicloEscolarInicioId', event.target.value)}
                className={`${inputClass} bg-white`}
              >
                <option value="">Selecciona...</option>
                {catalogs.data?.ciclos.map((item) => (
                  <option key={item.CicloEscolarId} value={item.CicloEscolarId}>
                    {item.CicloEscolar_CicloEscolar}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-blue-600 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:bg-blue-300"
          >
            {submitting ? 'Registrando...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500">
          <Link href="/registro" className="font-medium text-blue-600 hover:underline">
            Volver
          </Link>
        </p>
      </div>
    </AuthCard>
  );
}
