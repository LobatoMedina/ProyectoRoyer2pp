import { z } from 'zod';

const requiredText = (max: number) => z.string().trim().min(1).max(max);
const positiveId = z.coerce.number().int().positive();
const optionalId = positiveId.optional();

export const loginSchema = z.object({
  usuario: requiredText(100),
  contrasena: z.string().min(1).max(255),
});

export const registerAspiranteSchema = z.object({
  usuario: requiredText(100),
  contrasena: z.string().min(6).max(255),
  nombre: requiredText(100),
  apellidoPaterno: requiredText(100),
  apellidoMaterno: z.string().trim().max(100).optional(),
  curp: z.string().trim().length(18),
  sexoId: positiveId,
  edad: z.coerce.number().int().min(15).max(99),
  tipoAspiranteId: positiveId,
  carreraId: positiveId,
  turnoId: positiveId,
  cicloEscolarInicioId: positiveId,
});

export const registerEmpresaSchema = z.object({
  usuario: requiredText(100),
  contrasena: z.string().min(6).max(255),
  empresaNombre: requiredText(150),
  direccion: requiredText(255),
  razonSocial: requiredText(255),
  rfc: z.string().trim().min(12).max(13),
  tipoEmpresaId: positiveId,
});

export const createExpedienteSchema = z.object({
  personaId: optionalId,
  nombre: z.string().trim().max(100).optional(),
  apellidoPaterno: z.string().trim().max(100).optional(),
  apellidoMaterno: z.string().trim().max(100).optional(),
  curp: z.string().trim().length(18).optional(),
  sexoId: optionalId,
  edad: z.coerce.number().int().min(15).max(99).optional(),
  tipoAspiranteId: positiveId,
  carreraId: positiveId,
  turnoId: positiveId,
  cicloEscolarInicioId: positiveId,
});

export const updateAspiranteSchema = z.object({
  nombre: z.string().trim().max(100).optional(),
  apellidoPaterno: z.string().trim().max(100).optional(),
  apellidoMaterno: z.string().trim().max(100).optional(),
  edad: z.coerce.number().int().min(15).max(99).optional(),
  carreraId: optionalId,
  turnoId: optionalId,
  tipoAspiranteId: optionalId,
});

export const addContactoSchema = z.object({
  contacto: requiredText(255),
  tipoContactoId: positiveId,
});

export const updateEmpresaSchema = z.object({
  empresaNombre: z.string().trim().max(150).optional(),
  direccion: z.string().trim().max(255).optional(),
  razonSocial: z.string().trim().max(255).optional(),
  rfc: z.string().trim().min(12).max(13).optional(),
  tipoEmpresaId: optionalId,
});

export const solicitarConvenioSchema = z.object({
  empresaId: positiveId,
  observaciones: z.string().trim().max(500).optional(),
});

export const responderConvenioSchema = z.object({
  aceptado: z.coerce.boolean(),
  observaciones: z.string().trim().max(500).optional(),
});

export const createVacanteSchema = z.object({
  empresaId: optionalId,
  vacanteNombre: requiredText(150),
  vacantes: z.coerce.number().int().min(1).max(999),
  turnoId: positiveId,
  salario: z.coerce.number().min(0).max(99999999),
  tipoVacanteId: positiveId,
  duracionTipoId: positiveId,
  carreraTargetId: positiveId,
  observaciones: z.string().trim().max(2000).optional(),
});

export const updateVacanteSchema = z.object({
  vacanteNombre: z.string().trim().min(1).max(150).optional(),
  vacantes: z.coerce.number().int().min(1).max(999).optional(),
  turnoId: optionalId,
  salario: z.coerce.number().min(0).max(99999999).optional(),
  tipoVacanteId: optionalId,
  duracionTipoId: optionalId,
  carreraTargetId: optionalId,
  observaciones: z.string().trim().max(2000).optional(),
});

export const updateVacanteStatusSchema = z.object({
  activa: z.coerce.boolean(),
});

export const vacanteFiltersSchema = z.object({
  carreraId: optionalId,
  turnoId: optionalId,
  tipoVacanteId: optionalId,
  empresaId: optionalId,
  salarioMin: z.coerce.number().min(0).optional(),
  salarioMax: z.coerce.number().min(0).optional(),
  estado: z.enum(['Abierta', 'En proceso', 'Cerrada']).optional(),
  soloMiPerfil: z.enum(['true', 'false']).optional(),
  texto: z.string().trim().max(150).optional(),
});

export const aspiranteFiltersSchema = z.object({
  carreraId: optionalId,
  turnoId: optionalId,
  tipoAspiranteId: optionalId,
  texto: z.string().trim().max(150).optional(),
});

export const createPostulacionSchema = z.object({
  vacanteId: positiveId,
});

export const canalizarPostulacionSchema = z.object({
  observaciones: z.string().trim().max(500).optional(),
});

export const updateResolucionSchema = z.object({
  resolucionId: positiveId,
  comentarios: z.string().trim().max(500).optional(),
});

export const notificarEntrevistaSchema = z.object({
  fechaHora: z.string().trim().min(1),
  lugar: z.string().trim().max(255).optional(),
  observaciones: z.string().trim().max(500).optional(),
});

export const updateUsuarioStatusSchema = z.object({
  activo: z.coerce.boolean(),
});

export const assignRolSchema = z.object({
  rolId: positiveId,
});
