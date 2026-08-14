import prisma from '../../Infrastructure/prisma';
import { HttpError } from '../../Domain/Errors/HttpError';
import { ResolutionName } from '../../Domain/Enums/Resolutions';
import { VacancyStatus } from '../../Domain/Enums/VacancyStatus';
import { TokenPayload } from '../../Infrastructure/Security/JwtService';
import { IdentityService } from './IdentityService';
import { ResolutionService } from './ResolutionService';
import { VacanteService } from './VacanteService';
import {
  CanalizarPostulacionDto,
  CreatePostulacionDto,
  NotificarEntrevistaDto,
  UpdateResolucionDto,
} from '../Dtos';

const postulacionInclude = {
  resolucion: true,
  aspirante: {
    include: {
      persona: {
        include: {
          sexo: true,
          personaContactos: { include: { contacto: { include: { tipoContacto: true } } } },
        },
      },
      carrera: true,
      turno: true,
      tipoAspirante: true,
      cicloEscolarInicio: true,
    },
  },
  vacanteEmpresa: {
    include: {
      vacante: { include: { turno: true, tipoVacante: true, duracionTipo: true, carreraTarget: true } },
      empresa: {
        select: { EmpresaId: true, Empresa_Empresa: true, Empresa_Direccion: true },
      },
    },
  },
};

export class PostulacionService {
  static async postularse(user: TokenPayload, dto: CreatePostulacionDto) {
    const aspiranteId = await IdentityService.getAspiranteIdByUserId(user.userId);
    const vacante = await VacanteService.getVacanteById(dto.vacanteId);

    if (vacante.estado === VacancyStatus.CLOSED) {
      throw new HttpError(400, 'La vacante seleccionada ya no admite postulaciones.');
    }

    const vacanteEmpresa = await prisma.vacanteEmpresa.findFirst({
      where: { VacanteEmpresa_VacanteId: dto.vacanteId },
      select: { VacanteEmpresaId: true },
    });

    if (!vacanteEmpresa) {
      throw new HttpError(404, `Vacante con ID ${dto.vacanteId} no encontrada.`);
    }

    const existing = await prisma.postulacion.findFirst({
      where: {
        Postulacion_VacanteEmpresaId: vacanteEmpresa.VacanteEmpresaId,
        Postulacion_AspiranteId: aspiranteId,
        Postulacion_Activa: true,
      },
      select: { PostulacionId: true },
    });

    if (existing) {
      throw new HttpError(409, 'Ya te has postulado previamente a esta vacante.');
    }

    const resolucionId = await ResolutionService.getIdByName(ResolutionName.UNDER_REVIEW);

    return prisma.postulacion.create({
      data: {
        Postulacion_VacanteEmpresaId: vacanteEmpresa.VacanteEmpresaId,
        Postulacion_AspiranteId: aspiranteId,
        Postulacion_FechaPostulacion: new Date(),
        Postulacion_Activa: true,
        Postulacion_ResolucionId: resolucionId,
      },
      include: postulacionInclude,
    });
  }

  static async getMisPostulaciones(user: TokenPayload) {
    const aspiranteId = await IdentityService.getAspiranteIdByUserId(user.userId);

    return prisma.postulacion.findMany({
      where: { Postulacion_AspiranteId: aspiranteId },
      include: postulacionInclude,
      orderBy: { PostulacionId: 'desc' },
    });
  }

  static async getPostulacionById(user: TokenPayload, postulacionId: number) {
    await IdentityService.assertPostulacionAccess(user, postulacionId);

    const postulacion = await prisma.postulacion.findUnique({
      where: { PostulacionId: postulacionId },
      include: postulacionInclude,
    });

    if (!postulacion) {
      throw new HttpError(404, `Postulación con ID ${postulacionId} no encontrada.`);
    }

    return postulacion;
  }

  static async getPostulacionesByVacanteId(user: TokenPayload, vacanteId: number) {
    await IdentityService.assertVacanteAccess(user, vacanteId);

    return prisma.postulacion.findMany({
      where: { vacanteEmpresa: { VacanteEmpresa_VacanteId: vacanteId } },
      include: postulacionInclude,
      orderBy: { PostulacionId: 'desc' },
    });
  }

  static async getAllPostulaciones(filters: { empresaId?: number; resolucionId?: number }) {
    return prisma.postulacion.findMany({
      where: {
        ...(filters.empresaId
          ? { vacanteEmpresa: { VacanteEmpresa_EmpresaId: filters.empresaId } }
          : {}),
        ...(filters.resolucionId ? { Postulacion_ResolucionId: filters.resolucionId } : {}),
      },
      include: postulacionInclude,
      orderBy: { PostulacionId: 'desc' },
    });
  }

  private static async applyResolution(postulacionId: number, resolucionId: number) {
    return prisma.postulacion.update({
      where: { PostulacionId: postulacionId },
      data: { Postulacion_ResolucionId: resolucionId },
      include: postulacionInclude,
    });
  }

  static async canalizarPostulante(
    user: TokenPayload,
    postulacionId: number,
    dto: CanalizarPostulacionDto
  ) {
    await IdentityService.assertPostulacionAccess(user, postulacionId);

    const resolucionId = await ResolutionService.getIdByName(ResolutionName.ROUTED);
    const postulacion = await this.applyResolution(postulacionId, resolucionId);

    return {
      message: 'Postulante canalizado exitosamente a la empresa.',
      observaciones: dto.observaciones ?? null,
      postulacion,
    };
  }

  static async cancelarPostulacion(user: TokenPayload, postulacionId: number) {
    await IdentityService.assertPostulacionAccess(user, postulacionId);

    return prisma.postulacion.update({
      where: { PostulacionId: postulacionId },
      data: { Postulacion_Activa: false },
      include: postulacionInclude,
    });
  }

  static async cambiarResolucion(
    user: TokenPayload,
    postulacionId: number,
    dto: UpdateResolucionDto
  ) {
    await IdentityService.assertPostulacionAccess(user, postulacionId);

    const resolucion = await prisma.resolucion.findUnique({
      where: { ResolucionId: dto.resolucionId },
    });

    if (!resolucion) {
      throw new HttpError(404, `Resolución con ID ${dto.resolucionId} no encontrada.`);
    }

    const postulacion = await this.applyResolution(postulacionId, dto.resolucionId);

    if (resolucion.Resolucion_Resolucion === ResolutionName.HIRED) {
      await VacanteService.closeIfFilled(postulacion.vacanteEmpresa.VacanteEmpresa_VacanteId);
    }

    return { ...postulacion, comentarios: dto.comentarios ?? null };
  }

  static async notificarEntrevista(
    user: TokenPayload,
    postulacionId: number,
    dto: NotificarEntrevistaDto
  ) {
    await IdentityService.assertPostulacionAccess(user, postulacionId);

    const resolucionId = await ResolutionService.getIdByName(ResolutionName.INTERVIEW);
    const postulacion = await this.applyResolution(postulacionId, resolucionId);

    return {
      message: 'Notificación de entrevista registrada y enviada.',
      postulacionId,
      fechaHora: dto.fechaHora,
      lugar: dto.lugar ?? 'Instalaciones de la empresa',
      observaciones: dto.observaciones ?? null,
      estadoPostulacion: postulacion.resolucion.Resolucion_Resolucion,
    };
  }

  static async contratarAspirante(user: TokenPayload, postulacionId: number) {
    await IdentityService.assertPostulacionAccess(user, postulacionId);

    const resolucionId = await ResolutionService.getIdByName(ResolutionName.HIRED);
    const postulacion = await this.applyResolution(postulacionId, resolucionId);

    await VacanteService.closeIfFilled(postulacion.vacanteEmpresa.VacanteEmpresa_VacanteId);

    return postulacion;
  }

  static async getHistorial(user: TokenPayload, postulacionId: number) {
    const postulacion = await this.getPostulacionById(user, postulacionId);
    const persona = postulacion.aspirante.persona;

    const nombreCompleto = [
      persona.Persona_Nombre,
      persona.Persona_ApellidoPaterno,
      persona.Persona_ApellidoMaterno,
    ]
      .filter(Boolean)
      .join(' ');

    return {
      postulacionId: postulacion.PostulacionId,
      fechaPostulacion: postulacion.Postulacion_FechaPostulacion,
      activa: postulacion.Postulacion_Activa,
      estadoActual: postulacion.resolucion.Resolucion_Resolucion,
      aspirante: {
        id: postulacion.aspirante.AspiranteId,
        nombreCompleto,
        carrera: postulacion.aspirante.carrera.Carrera_Carrera,
      },
      empresa: postulacion.vacanteEmpresa.empresa.Empresa_Empresa,
      vacante: postulacion.vacanteEmpresa.vacante.Vacante_Vacante,
      etapas: [
        {
          etapa: 'Postulación registrada',
          fecha: postulacion.Postulacion_FechaPostulacion,
          alcanzada: true,
        },
        {
          etapa: ResolutionName.ROUTED,
          alcanzada: [
            ResolutionName.ROUTED,
            ResolutionName.INTERVIEW,
            ResolutionName.TECHNICAL_TEST,
            ResolutionName.HIRED,
          ].includes(postulacion.resolucion.Resolucion_Resolucion as ResolutionName),
        },
        {
          etapa: ResolutionName.INTERVIEW,
          alcanzada: [
            ResolutionName.INTERVIEW,
            ResolutionName.TECHNICAL_TEST,
            ResolutionName.HIRED,
          ].includes(postulacion.resolucion.Resolucion_Resolucion as ResolutionName),
        },
        {
          etapa: ResolutionName.HIRED,
          alcanzada: postulacion.resolucion.Resolucion_Resolucion === ResolutionName.HIRED,
        },
      ],
    };
  }
}
