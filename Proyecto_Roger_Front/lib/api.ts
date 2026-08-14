import { clearSession, getToken } from './auth';
import type {
  Aspirante,
  Carrera,
  CicloEscolar,
  Contacto,
  Convenio,
  CounterRow,
  CurrentUser,
  DuracionTipo,
  Empresa,
  EmpresaParticipacion,
  LoginResponse,
  Notificacion,
  Postulacion,
  PostulacionHistorial,
  ReporteResumen,
  Resolucion,
  Rol,
  Sexo,
  TipoAspirante,
  TipoContacto,
  TipoEmpresa,
  TipoVacante,
  Turno,
  Usuario,
  Vacante,
  VacanteDemandada,
} from './types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

type QueryValue = string | number | boolean | undefined | null;

function buildQuery(params?: Record<string, QueryValue>): string {
  if (!params) return '';

  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    search.append(key, String(value));
  });

  const query = search.toString();
  return query ? `?${query}` : '';
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (response.status === 401 && typeof window !== 'undefined') {
    clearSession();
    window.location.href = '/login';
    throw new ApiError(401, 'Tu sesión expiró. Inicia sesión nuevamente.');
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new ApiError(response.status, payload.error || 'Error en la solicitud.');
  }

  if (response.status === 204) return undefined as T;

  return response.json() as Promise<T>;
}

const get = <T>(endpoint: string, params?: Record<string, QueryValue>) =>
  request<T>(`${endpoint}${buildQuery(params)}`);

const post = <T>(endpoint: string, body?: unknown) =>
  request<T>(endpoint, { method: 'POST', body: JSON.stringify(body ?? {}) });

const put = <T>(endpoint: string, body?: unknown) =>
  request<T>(endpoint, { method: 'PUT', body: JSON.stringify(body ?? {}) });

const patch = <T>(endpoint: string, body?: unknown) =>
  request<T>(endpoint, { method: 'PATCH', body: JSON.stringify(body ?? {}) });

const remove = <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' });

export const authApi = {
  login: (usuario: string, contrasena: string) =>
    post<LoginResponse>('/auth/login', { usuario, contrasena }),
  registerAspirante: (payload: Record<string, unknown>) =>
    post<LoginResponse & { aspiranteId: number }>('/auth/register-aspirante', payload),
  registerEmpresa: (payload: Record<string, unknown>) =>
    post<LoginResponse & { empresaId: number }>('/auth/register-empresa', payload),
  me: () => get<CurrentUser>('/auth/me'),
};

export const catalogApi = {
  carreras: () => get<Carrera[]>('/catalogos/carrera'),
  turnos: () => get<Turno[]>('/catalogos/turno'),
  tiposAspirante: () => get<TipoAspirante[]>('/catalogos/tipos-aspirante'),
  tiposEmpresa: () => get<TipoEmpresa[]>('/catalogos/tipos-empresa'),
  tiposVacante: () => get<TipoVacante[]>('/catalogos/tipos-vacante'),
  tiposDuracion: () => get<DuracionTipo[]>('/catalogos/tipos-duracion'),
  tiposContacto: () => get<TipoContacto[]>('/catalogos/tipos-contacto'),
  resoluciones: () => get<Resolucion[]>('/catalogos/resoluciones'),
  ciclosEscolares: () => get<CicloEscolar[]>('/catalogos/ciclos-escolares'),
  sexos: () => get<Sexo[]>('/catalogos/sexos'),
  roles: () => get<Rol[]>('/catalogos/roles'),
};

export const aspiranteApi = {
  list: (params?: Record<string, QueryValue>) => get<Aspirante[]>('/aspirantes', params),
  me: () => get<Aspirante>('/aspirantes/me'),
  byId: (aspiranteId: number) => get<Aspirante>(`/aspirantes/${aspiranteId}`),
  update: (aspiranteId: number, payload: Record<string, unknown>) =>
    put<Aspirante>(`/aspirantes/${aspiranteId}`, payload),
  addContacto: (aspiranteId: number, contacto: string, tipoContactoId: number) =>
    post<Contacto>(`/aspirantes/${aspiranteId}/contactos`, { contacto, tipoContactoId }),
  removeContacto: (aspiranteId: number, contactoId: number) =>
    remove<{ message: string }>(`/aspirantes/${aspiranteId}/contactos/${contactoId}`),
};

export const empresaApi = {
  list: () => get<Empresa[]>('/empresas'),
  byId: (empresaId: number) => get<Empresa>(`/empresas/${empresaId}`),
  update: (empresaId: number, payload: Record<string, unknown>) =>
    put<Empresa>(`/empresas/${empresaId}`, payload),
  addContacto: (empresaId: number, contacto: string, tipoContactoId: number) =>
    post<Contacto>(`/empresas/${empresaId}/contactos`, { contacto, tipoContactoId }),
  vacantes: (empresaId: number) => get<Vacante[]>(`/empresas/${empresaId}/vacantes`),
  convenios: () => get<Convenio[]>('/empresas/convenios'),
  miConvenio: () => get<{ empresaId: number; estado: string }>('/empresas/convenios/estado'),
  solicitarConvenio: (empresaId: number, observaciones?: string) =>
    post<{ message: string }>('/empresas/convenios/solicitar', { empresaId, observaciones }),
  responderConvenio: (empresaId: number, aceptado: boolean, observaciones?: string) =>
    patch<{ message: string }>(`/empresas/convenios/${empresaId}/responder`, {
      aceptado,
      observaciones,
    }),
};

export const vacanteApi = {
  list: (params?: Record<string, QueryValue>) => get<Vacante[]>('/vacantes', params),
  byId: (vacanteId: number) => get<Vacante>(`/vacantes/${vacanteId}`),
  create: (payload: Record<string, unknown>) => post<Vacante>('/vacantes', payload),
  update: (vacanteId: number, payload: Record<string, unknown>) =>
    put<Vacante>(`/vacantes/${vacanteId}`, payload),
  updateStatus: (vacanteId: number, activa: boolean) =>
    patch<Vacante>(`/vacantes/${vacanteId}/status`, { activa }),
  postulaciones: (vacanteId: number) => get<Postulacion[]>(`/vacantes/${vacanteId}/postulaciones`),
};

export const postulacionApi = {
  list: (params?: Record<string, QueryValue>) => get<Postulacion[]>('/postulaciones', params),
  mine: () => get<Postulacion[]>('/postulaciones/mis-postulaciones'),
  byId: (postulacionId: number) => get<Postulacion>(`/postulaciones/${postulacionId}`),
  historial: (postulacionId: number) =>
    get<PostulacionHistorial>(`/postulaciones/${postulacionId}/historial`),
  create: (vacanteId: number) => post<Postulacion>('/postulaciones', { vacanteId }),
  cancel: (postulacionId: number) => remove<Postulacion>(`/postulaciones/${postulacionId}`),
  canalizar: (postulacionId: number, observaciones?: string) =>
    patch<{ message: string }>(`/postulaciones/${postulacionId}/canalizar`, { observaciones }),
  cambiarResolucion: (postulacionId: number, resolucionId: number, comentarios?: string) =>
    patch<Postulacion>(`/postulaciones/${postulacionId}/resolucion`, { resolucionId, comentarios }),
  notificarEntrevista: (postulacionId: number, fechaHora: string, lugar?: string) =>
    post<{ message: string }>(`/postulaciones/${postulacionId}/notificar-entrevista`, {
      fechaHora,
      lugar,
    }),
  contratar: (postulacionId: number) =>
    patch<Postulacion>(`/postulaciones/${postulacionId}/contratar`),
};

export const reporteApi = {
  resumen: () => get<ReporteResumen>('/reportes/resumen'),
  vacantesPorCarrera: () => get<CounterRow[]>('/reportes/vacantes-por-carrera'),
  demandaPorCarrera: () => get<CounterRow[]>('/reportes/demanda-por-carrera'),
  postulacionesPorResolucion: () => get<CounterRow[]>('/reportes/postulaciones-por-resolucion'),
  participacionPorEmpresa: () => get<EmpresaParticipacion[]>('/reportes/participacion-por-empresa'),
  vacantesMasDemandadas: () => get<VacanteDemandada[]>('/reportes/vacantes-mas-demandadas'),
};

export interface CreatePersonalPayload {
  usuario: string;
  contrasena: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  curp: string;
  sexoId: number;
  edad: number;
  rolId: number;
}

export const usuarioApi = {
  list: () => get<Usuario[]>('/usuarios'),
  createPersonal: (payload: CreatePersonalPayload) =>
    post<Usuario>('/usuarios/personal', payload),
  updateStatus: (usuarioId: number, activo: boolean) =>
    patch<Usuario>(`/usuarios/${usuarioId}/status`, { activo }),
  assignRol: (usuarioId: number, rolId: number) =>
    post<Usuario>(`/usuarios/${usuarioId}/roles`, { rolId }),
  removeRol: (usuarioId: number, rolId: number) =>
    remove<Usuario>(`/usuarios/${usuarioId}/roles/${rolId}`),
};

export const notificacionApi = {
  list: () => get<Notificacion[]>('/notificaciones'),
};
