import type { AgreementStatus, RoleSlug, VacancyStatus } from './types';

export const ROLES: Record<string, RoleSlug> = {
  ASPIRANTE: 'aspirante',
  EMPRESA: 'empresa',
  VINCULACION: 'vinculacion',
};

export const VACANCY_STATUS: Record<string, VacancyStatus> = {
  OPEN: 'Abierta',
  IN_PROCESS: 'En proceso',
  CLOSED: 'Cerrada',
};

export const AGREEMENT_STATUS: Record<string, AgreementStatus> = {
  PENDING: 'Pendiente',
  ACTIVE: 'Vigente',
};

export const RESOLUTION = {
  UNDER_REVIEW: 'En revisión',
  ROUTED: 'Canalizado a Empresa',
  INTERVIEW: 'Apto para entrevista',
  TECHNICAL_TEST: 'Pruebas técnicas',
  REJECTED: 'Descartado',
  HIRED: 'Contratado',
};

export const currencyFormatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 0,
});

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return '—';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return date.toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: '2-digit' });
}

export function fullName(person?: {
  Persona_Nombre?: string;
  Persona_ApellidoPaterno?: string;
  Persona_ApellidoMaterno?: string | null;
}): string {
  if (!person) return '—';

  return [person.Persona_Nombre, person.Persona_ApellidoPaterno, person.Persona_ApellidoMaterno]
    .filter(Boolean)
    .join(' ');
}
