'use client';

import { useEffect, useState } from 'react';
import { catalogApi } from '@/lib/api';
import { useApi } from '@/lib/useApi';
import { ErrorMessage, Loading } from '@/components/shared/feedback';
import type { Vacante } from '@/lib/types';

export interface VacanteFormValues {
  vacanteNombre: string;
  vacantes: number;
  turnoId: number;
  salario: number;
  tipoVacanteId: number;
  duracionTipoId: number;
  carreraTargetId: number;
  observaciones: string;
}

interface VacanteFormProps {
  initialValue?: Vacante;
  submitLabel: string;
  onSubmit: (values: VacanteFormValues) => Promise<void>;
}

const emptyForm = {
  vacanteNombre: '',
  vacantes: '1',
  turnoId: '',
  salario: '',
  tipoVacanteId: '',
  duracionTipoId: '',
  carreraTargetId: '',
  observaciones: '',
};

export function VacanteForm({ initialValue, submitLabel, onSubmit }: VacanteFormProps) {
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const catalogs = useApi(async () => {
    const [carreras, turnos, tiposVacante, tiposDuracion] = await Promise.all([
      catalogApi.carreras(),
      catalogApi.turnos(),
      catalogApi.tiposVacante(),
      catalogApi.tiposDuracion(),
    ]);

    return { carreras, turnos, tiposVacante, tiposDuracion };
  });

  useEffect(() => {
    if (!initialValue) return;

    setForm({
      vacanteNombre: initialValue.Vacante_Vacante,
      vacantes: String(initialValue.Vacante_Vacantes),
      turnoId: String(initialValue.turno.TurnoId),
      salario: String(initialValue.Vacante_Salario),
      tipoVacanteId: String(initialValue.tipoVacante.VacanteTipoId),
      duracionTipoId: String(initialValue.duracionTipo.DuracionTipoId),
      carreraTargetId: String(initialValue.carreraTarget.CarreraId),
      observaciones: initialValue.Vacante_Observaciones ?? '',
    });
  }, [initialValue]);

  const updateField = (field: keyof typeof emptyForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      await onSubmit({
        vacanteNombre: form.vacanteNombre,
        vacantes: Number(form.vacantes),
        turnoId: Number(form.turnoId),
        salario: Number(form.salario),
        tipoVacanteId: Number(form.tipoVacanteId),
        duracionTipoId: Number(form.duracionTipoId),
        carreraTargetId: Number(form.carreraTargetId),
        observaciones: form.observaciones,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (catalogs.loading) return <Loading label="Cargando catálogos..." />;
  if (catalogs.error) return <ErrorMessage message={catalogs.error} />;

  const inputClass = 'mt-1 w-full rounded-lg border p-2.5 text-sm text-black';

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Nombre del puesto</label>
          <input
            type="text"
            required
            value={form.vacanteNombre}
            onChange={(event) => updateField('vacanteNombre', event.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Número de plazas</label>
          <input
            type="number"
            required
            min={1}
            value={form.vacantes}
            onChange={(event) => updateField('vacantes', event.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Apoyo económico / salario</label>
          <input
            type="number"
            required
            min={0}
            step="0.01"
            value={form.salario}
            onChange={(event) => updateField('salario', event.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Carrera solicitada</label>
          <select
            required
            value={form.carreraTargetId}
            onChange={(event) => updateField('carreraTargetId', event.target.value)}
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
        <div>
          <label className="block text-sm font-medium text-gray-700">Tipo de vacante</label>
          <select
            required
            value={form.tipoVacanteId}
            onChange={(event) => updateField('tipoVacanteId', event.target.value)}
            className={`${inputClass} bg-white`}
          >
            <option value="">Selecciona...</option>
            {catalogs.data?.tiposVacante.map((item) => (
              <option key={item.VacanteTipoId} value={item.VacanteTipoId}>
                {item.VacanteTipo_VacanteTipo}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Duración</label>
          <select
            required
            value={form.duracionTipoId}
            onChange={(event) => updateField('duracionTipoId', event.target.value)}
            className={`${inputClass} bg-white`}
          >
            <option value="">Selecciona...</option>
            {catalogs.data?.tiposDuracion.map((item) => (
              <option key={item.DuracionTipoId} value={item.DuracionTipoId}>
                {item.DuracionTipo_DuracionTipo}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Requisitos, horario y beneficios
          </label>
          <textarea
            rows={5}
            value={form.observaciones}
            onChange={(event) => updateField('observaciones', event.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:bg-blue-300 w-full sm:w-auto"
      >
        {submitting ? 'Guardando...' : submitLabel}
      </button>
    </form>
  );
}
