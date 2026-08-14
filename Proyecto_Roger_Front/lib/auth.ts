import type { RoleName, RoleSlug, SessionUser } from './types';

const TOKEN_COOKIE = 'token';
const ROLE_COOKIE = 'role';
const SESSION_KEY = 'user_session';
const MAX_AGE = 60 * 60 * 24;

const roleSlugByName: Record<RoleName, RoleSlug> = {
  Aspirante: 'aspirante',
  Empresa: 'empresa',
  Vinculacion: 'vinculacion',
  'Control Escolar': 'control-escolar',
};

export function toRoleSlug(roles: RoleName[]): RoleSlug {
  if (roles.includes('Vinculacion')) return roleSlugByName.Vinculacion;
  if (roles.includes('Control Escolar')) return roleSlugByName['Control Escolar'];
  if (roles.includes('Empresa')) return roleSlugByName.Empresa;
  return roleSlugByName.Aspirante;
}

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;

  const match = document.cookie.split('; ').find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split('=').slice(1).join('=')) : null;
}

export function getToken(): string | null {
  return readCookie(TOKEN_COOKIE);
}

export function getRole(): RoleSlug | null {
  return readCookie(ROLE_COOKIE) as RoleSlug | null;
}

export function getSession(): SessionUser | null {
  if (typeof window === 'undefined') return null;

  const stored = window.localStorage.getItem(SESSION_KEY);
  if (!stored) return null;

  try {
    return JSON.parse(stored) as SessionUser;
  } catch {
    return null;
  }
}

export function setSession(user: SessionUser, token: string) {
  const role = toRoleSlug(user.roles);

  window.localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  document.cookie = `${TOKEN_COOKIE}=${token}; path=/; max-age=${MAX_AGE}; samesite=lax`;
  document.cookie = `${ROLE_COOKIE}=${role}; path=/; max-age=${MAX_AGE}; samesite=lax`;
}

export function clearSession() {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(SESSION_KEY);
  }

  document.cookie = `${TOKEN_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  document.cookie = `${ROLE_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

/**
 * Control Escolar comparte el panel de vinculación, pero con un menú
 * reducido: solo consulta expedientes y reportes.
 */
export function homePathForRole(role: RoleSlug): string {
  if (role === 'control-escolar') return '/vinculacion/aspirantes';
  return `/${role}`;
}
