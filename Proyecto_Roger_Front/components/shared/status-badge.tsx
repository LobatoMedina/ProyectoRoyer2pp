import React from 'react';

const styleByStatus: Record<string, string> = {
  abierta: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  vigente: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  activo: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  contratado: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'en proceso': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'apto para entrevista': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'pruebas técnicas': 'bg-sky-100 text-sky-800 border-sky-200',
  'canalizado a empresa': 'bg-sky-100 text-sky-800 border-sky-200',
  pendiente: 'bg-amber-100 text-amber-800 border-amber-200',
  'en revisión': 'bg-amber-100 text-amber-800 border-amber-200',
  cerrada: 'bg-rose-100 text-rose-800 border-rose-200',
  descartado: 'bg-rose-100 text-rose-800 border-rose-200',
  inactivo: 'bg-rose-100 text-rose-800 border-rose-200',
};

export const StatusBadge = ({ status }: { status: string }) => {
  const style = styleByStatus[status.toLowerCase()] ?? 'bg-gray-100 text-gray-800 border-gray-200';

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${style}`}>
      {status}
    </span>
  );
};
