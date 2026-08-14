export type RoleName = 'Aspirante' | 'Empresa' | 'Vinculacion' | 'Control Escolar';
export type RoleSlug = 'aspirante' | 'empresa' | 'vinculacion' | 'control-escolar';
export type VacancyStatus = 'Abierta' | 'En proceso' | 'Cerrada';
export type AgreementStatus = 'Pendiente' | 'Vigente';

export interface CatalogItem {
  id: number;
  label: string;
}

export interface Carrera {
  CarreraId: number;
  Carrera_Carrera: string;
  Carrera_Activa: boolean;
  Carrera_CuatrimestreDuracion: number;
}

export interface Turno {
  TurnoId: number;
  Turno_turno: string;
  Turno_letra: string;
}

export interface TipoEmpresa {
  TipoEmpresaId: number;
  TipoEmpresa_TipoEmpresa: string;
}

export interface TipoVacante {
  VacanteTipoId: number;
  VacanteTipo_VacanteTipo: string;
}

export interface DuracionTipo {
  DuracionTipoId: number;
  DuracionTipo_DuracionTipo: string;
}

export interface TipoAspirante {
  AspiranteTipoId: number;
  AspiranteTipo_AspiranteTipo: string;
}

export interface TipoContacto {
  TipoContactoId: number;
  TipoContacto_TipoContacto: string;
}

export interface CicloEscolar {
  CicloEscolarId: number;
  CicloEscolar_CicloEscolar: string;
}

export interface Sexo {
  SexoId: number;
  Sexo_Sexo: string;
}

export interface Rol {
  RolId: number;
  Rol_Rol: string;
}

export interface Resolucion {
  ResolucionId: number;
  Resolucion_Resolucion: string;
}

export interface Contacto {
  ContactoId: number;
  Contacto_Contacto: string;
  tipoContacto?: TipoContacto;
}

export interface Persona {
  PersonaId: number;
  Persona_Nombre: string;
  Persona_ApellidoPaterno: string;
  Persona_ApellidoMaterno: string | null;
  Persona_CURP: string;
  Persona_edad: number;
  sexo?: Sexo;
  personaContactos?: Array<{ contacto: Contacto }>;
}

export interface Aspirante {
  AspiranteId: number;
  persona: Persona;
  carrera: Carrera;
  turno: Turno;
  tipoAspirante: TipoAspirante;
  cicloEscolarInicio: CicloEscolar;
}

export interface Empresa {
  EmpresaId: number;
  Empresa_Empresa: string;
  Empresa_Direccion: string;
  Empresa_RazonSocial: string;
  Empresa_rfc: string;
  tipoEmpresa?: TipoEmpresa;
  estadoConvenio?: AgreementStatus;
  empresaContactos?: Array<{ contacto: Contacto }>;
  usuario?: { UsuarioId: number; Usuario_Usuario: string; Usuario_Activo: boolean };
}

export interface Vacante {
  VacanteId: number;
  Vacante_Vacante: string;
  Vacante_Vacantes: number;
  Vacante_Salario: number;
  Vacante_Observaciones: string | null;
  Vacante_Activa: boolean;
  turno: Turno;
  tipoVacante: TipoVacante;
  duracionTipo: DuracionTipo;
  carreraTarget: Carrera;
  empresa: Pick<Empresa, 'EmpresaId' | 'Empresa_Empresa' | 'Empresa_Direccion'> | null;
  estado: VacancyStatus;
  plazasDisponibles: number;
  totalPostulaciones: number;
  postulacionesEnProceso: number;
  contratados: number;
}

export interface Postulacion {
  PostulacionId: number;
  Postulacion_FechaPostulacion: string;
  Postulacion_Activa: boolean;
  resolucion: Resolucion;
  aspirante: Aspirante;
  vacanteEmpresa: {
    vacante: Vacante;
    empresa: Pick<Empresa, 'EmpresaId' | 'Empresa_Empresa' | 'Empresa_Direccion'>;
  };
}

export interface PostulacionHistorial {
  postulacionId: number;
  fechaPostulacion: string;
  activa: boolean;
  estadoActual: string;
  aspirante: { id: number; nombreCompleto: string; carrera: string };
  empresa: string;
  vacante: string;
  etapas: Array<{ etapa: string; fecha?: string; alcanzada: boolean }>;
}

export interface Convenio {
  empresaId: number;
  empresa: string;
  razonSocial: string;
  rfc: string;
  usuarioId: number | null;
  estado: AgreementStatus;
}

export interface Usuario {
  usuarioId: number;
  usuario: string;
  activo: boolean;
  roles: Array<{ rolId: number; rol: string }>;
  persona: string | null;
  empresa: string | null;
}

export interface Notificacion {
  tipo: string;
  titulo: string;
  mensaje: string;
  fecha: string;
  referenciaId: number | null;
}

export interface ReporteResumen {
  totalAspirantes: number;
  totalEmpresas: number;
  empresasConConvenio: number;
  empresasSinConvenio: number;
  totalVacantes: number;
  vacantesActivas: number;
  plazasOfertadas: number;
  totalPostulaciones: number;
  postulacionesActivas: number;
  contratados: number;
  tasaContratacion: number;
}

export interface CounterRow {
  id: number;
  etiqueta: string;
  total: number;
}

export interface EmpresaParticipacion {
  empresaId: number;
  empresa: string;
  vacantes: number;
  vacantesActivas: number;
  postulaciones: number;
  contratados: number;
}

export interface VacanteDemandada {
  vacanteId: number;
  vacante: string;
  empresa: string | null;
  carrera: string;
  plazas: number;
  postulaciones: number;
  enProceso: number;
}

export interface SessionUser {
  id: number;
  username: string;
  activo: boolean;
  roles: RoleName[];
}

export interface LoginResponse {
  usuario: SessionUser;
  token: string;
}

export interface CurrentUser extends SessionUser {
  aspiranteId: number | null;
  empresaId: number | null;
  estadoConvenio: AgreementStatus | null;
  personas: Persona[];
  empresas: Empresa[];
}
