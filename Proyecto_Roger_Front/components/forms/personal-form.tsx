'use client';

import { useState } from 'react';
import { catalogApi, usuarioApi } from '@/lib/api';
import { useApi } from '@/lib/useApi';

/** Roles que pueden darse de alta desde el panel (debe coincidir con el backend). */
const ROLES_PERSONAL = ['Control Escolar', 'Vinculacion'];

const initialForm = {
  usuario: '',
  contrasena: '',
  nombre: '',
  apellidoPaterno: '',
  apellidoMaterno: '',
  curp: '',
  sexoId: '',
  edad: '',
  rolId: '',
};

interface PersonalFormProps {
  onCreated: (mensaje: string) => void;
  onError: (mensaje: string) => void;
}

export function PersonalForm({ onCreated, onError }: PersonalFormProps) {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const catalogs = useApi(async () => {
    const [sexos, roles] = await Promise.all([catalogApi.sexos(), catalogApi.roles()]);
    return { sexos, roles: roles.filter((rol) => ROLES_PERSONAL.includes(rol.Rol_Rol)) };
  });

  const updateField = (field: keyof typeof initialForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      await usuarioApi.createPersonal({
        usuario: form.usuario,
        contrasena: form.contrasena,
        nombre: form.nombre,
        apellidoPaterno: form.apellidoPaterno,
        apellidoMaterno: form.apellidoMaterno || undefined,
        curp: form.curp.toUpperCase(),
        sexoId: Number(form.sexoId),
        edad: Number(form.edad),
        rolId: Number(form.rolId),
      });

      setForm(initialForm);
      onCreated('El personal fue dado de alta y ya puede iniciar sesión.');
    } catch (cause) {
      onError(cause instanceof Error ? cause.message : 'No fue posible dar de alta al personal.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = 'mt-1 w-full rounded-lg border p-2.5 text-sm text-black';

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
    >
      <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
        Dar de alta personal
      </h2>
      <p className="mt-1 text-sm text-gray-500">
        Crea cuentas para el personal de Control Escolar o de la Coordinación de Vinculación.
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
            min={18}
            max={99}
            value={form.edad}
            onChange={(event) => updateField('edad', event.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Área</label>
          <select
            required
            value={form.rolId}
            onChange={(event) => updateField('rolId', event.target.value)}
            className={`${inputClass} bg-white`}
          >
            <option value="">Selecciona...</option>
            {catalogs.data?.roles.map((rol) => (
              <option key={rol.RolId} value={rol.RolId}>
                {rol.Rol_Rol === 'Vinculacion' ? 'Vinculación' : rol.Rol_Rol}
              </option>
            ))}
          </select>
        </div>
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
          <label className="block text-sm font-medium text-gray-700">Contraseña temporal</label>
          <input
            type="password"
            required
            minLength={6}
            value={form.contrasena}
            onChange={(event) => updateField('contrasena', event.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting || catalogs.loading}
        className="mt-4 w-full rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:bg-blue-300 sm:w-auto"
      >
        {submitting ? 'Dando de alta...' : 'Dar de alta'}
      </button>
    </form>
  );
}
