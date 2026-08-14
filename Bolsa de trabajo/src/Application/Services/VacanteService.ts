import { Prisma } from '@prisma/client';
import prisma from '../../Infrastructure/prisma';
import { HttpError } from '../../Domain/Errors/HttpError';
import { VacancyStatus } from '../../Domain/Enums/VacancyStatus';
import { FINAL_RESOLUTIONS, ResolutionName } from '../../Domain/Enums/Resolutions';
import { TokenPayload } from '../../Infrastructure/Security/JwtService';
import { IdentityService } from './IdentityService';
import {
  CreateVacanteDto,
  UpdateVacanteDto,
  UpdateVacanteStatusDto,
  VacanteFiltersDto,
} from '../Dtos';

interface VacancyMetrics {
  total: number;
  hired: number;
  inProcess: number;
}

const emptyMetrics: VacancyMetrics = { total: 0, hired: 0, inProcess: 0 };

const vacanteInclude = {
  turno: true,
  tipoVacante: true,
  duracionTipo: true,
  carreraTarget: true,
  vacantesEmpresa: {
    include: {
      empresa: {
        select: {
          EmpresaId: true,
          Empresa_Empresa: true,
          Empresa_Direccion: true,
          Empresa_RazonSocial: true,
          tipoEmpresa: true,
        },
      },
    },
  },
};

export class VacanteService {
  private static async getMetrics(vacanteIds: number[]): Promise<Map<number, VacancyMetrics>> {
    const metrics = new Map<number, VacancyMetrics>();
    if (vacanteIds.length === 0) return metrics;

    const postulaciones = await prisma.postulacion.findMany({
      where: {
        Postulacion_Activa: true,
        vacanteEmpresa: { VacanteEmpresa_VacanteId: { in: vacanteIds } },
      },
      select: {
        vacanteEmpresa: { select: { VacanteEmpresa_VacanteId: true } },
        resolucion: { select: { Resolucion_Resolucion: true } },
      },
    });

    for (const postulacion of postulaciones) {
      const vacanteId = postulacion.vacanteEmpresa.VacanteEmpresa_VacanteId;
      const current = metrics.get(vacanteId) ?? { ...emptyMetrics };
      const resolucion = postulacion.resolucion.Resolucion_Resolucion;

      current.total += 1;
      if (resolucion === ResolutionName.HIRED) current.hired += 1;
      if (!FINAL_RESOLUTIONS.includes(resolucion)) current.inProcess += 1;

      metrics.set(vacanteId, current);
    }

    return metrics;
  }

  private static decorate(vacante: any, metrics: Map<number, VacancyMetrics>) {
    const current = metrics.get(vacante.VacanteId) ?? emptyMetrics;
    const plazasDisponibles = Math.max(vacante.Vacante_Vacantes - current.hired, 0);
    const isClosed = !vacante.Vacante_Activa || plazasDisponibles === 0;

    const estado = isClosed
      ? VacancyStatus.CLOSED
      : current.inProcess > 0
        ? VacancyStatus.IN_PROCESS
        : VacancyStatus.OPEN;

    const { vacantesEmpresa, ...rest } = vacante;

    return {
      ...rest,
      Vacante_Salario: Number(vacante.Vacante_Salario),
      empresa: vacantesEmpresa?.[0]?.empresa ?? null,
      estado,
      plazasDisponibles,
      totalPostulaciones: current.total,
      postulacionesEnProceso: current.inProcess,
      contratados: current.hired,
    };
  }

  static async getVacantes(user: TokenPayload, filters: VacanteFiltersDto) {
    const where: any = {};

    if (filters.turnoId) where.Vacante_TurnoId = filters.turnoId;
    if (filters.tipoVacanteId) where.Vacante_TipoVacanteId = filters.tipoVacanteId;
    if (filters.texto) where.Vacante_Vacante = { contains: filters.texto };
    if (filters.empresaId) {
      where.vacantesEmpresa = { some: { VacanteEmpresa_EmpresaId: filters.empresaId } };
    }

    let carreraId = filters.carreraId;

    if (filters.soloMiPerfil === 'true') {
      const aspiranteId = await IdentityService.getAspiranteIdByUserId(user.userId);
      const aspirante = await prisma.aspirante.findUnique({
        where: { AspiranteId: aspiranteId },
        select: { Aspirante_CarreraId: true },
      });
      carreraId = aspirante?.Aspirante_CarreraId ?? carreraId;
    }

    if (carreraId) where.Vacante_CarreraTargetId = carreraId;

    if (filters.salarioMin !== undefined || filters.salarioMax !== undefined) {
      where.Vacante_Salario = {
        ...(filters.salarioMin !== undefined ? { gte: filters.salarioMin } : {}),
        ...(filters.salarioMax !== undefined ? { lte: filters.salarioMax } : {}),
      };
    }

    const vacantes = await prisma.vacante.findMany({
      where,
      include: vacanteInclude,
      orderBy: { VacanteId: 'desc' },
    });

    const metrics = await this.getMetrics(vacantes.map((vacante: any) => vacante.VacanteId));
    const decorated = vacantes.map((vacante: any) => this.decorate(vacante, metrics));

    if (filters.estado) {
      return decorated.filter((vacante: any) => vacante.estado === filters.estado);
    }

    return decorated;
  }

  static async getVacanteById(vacanteId: number) {
    const vacante = await prisma.vacante.findUnique({
      where: { VacanteId: vacanteId },
      include: vacanteInclude,
    });

    if (!vacante) {
      throw new HttpError(404, `Vacante con ID ${vacanteId} no encontrada.`);
    }

    const metrics = await this.getMetrics([vacanteId]);
    return this.decorate(vacante, metrics);
  }

  static async getVacantesByEmpresaId(user: TokenPayload, empresaId: number) {
    await IdentityService.assertEmpresaAccess(user, empresaId);
    return this.getVacantes(user, { empresaId });
  }

  static async createVacante(user: TokenPayload, dto: CreateVacanteDto) {
    const empresaId = await IdentityService.resolveEmpresaId(user, dto.empresaId);

    const empresa = await prisma.empresa.findUnique({ where: { EmpresaId: empresaId } });
    if (!empresa) {
      throw new HttpError(404, `Empresa con ID ${empresaId} no encontrada.`);
    }

    const duplicate = await prisma.vacante.findFirst({
      where: {
        Vacante_Activa: true,
        Vacante_Vacante: dto.vacanteNombre,
        vacantesEmpresa: { some: { VacanteEmpresa_EmpresaId: empresaId } },
      },
      select: { VacanteId: true },
    });

    if (duplicate) {
      throw new HttpError(
        409,
        `La empresa ya tiene publicada una vacante activa con el nombre "${dto.vacanteNombre}".`
      );
    }

    const vacanteId = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const vacante = await tx.vacante.create({
        data: {
          Vacante_Vacante: dto.vacanteNombre,
          Vacante_Vacantes: dto.vacantes,
          Vacante_TurnoId: dto.turnoId,
          Vacante_Salario: dto.salario,
          Vacante_TipoVacanteId: dto.tipoVacanteId,
          Vacante_DuracionTipoId: dto.duracionTipoId,
          Vacante_CarreraTargetId: dto.carreraTargetId,
          Vacante_Observaciones: dto.observaciones ?? null,
          Vacante_Activa: true,
        },
      });

      await tx.vacanteEmpresa.create({
        data: {
          VacanteEmpresa_EmpresaId: empresaId,
          VacanteEmpresa_VacanteId: vacante.VacanteId,
        },
      });

      return vacante.VacanteId;
    });

    return this.getVacanteById(vacanteId);
  }

  static async updateVacante(user: TokenPayload, vacanteId: number, dto: UpdateVacanteDto) {
    await IdentityService.assertVacanteAccess(user, vacanteId);

    const vacante = await prisma.vacante.findUnique({ where: { VacanteId: vacanteId } });
    if (!vacante) {
      throw new HttpError(404, `Vacante con ID ${vacanteId} no encontrada.`);
    }

    await prisma.vacante.update({
      where: { VacanteId: vacanteId },
      data: {
        Vacante_Vacante: dto.vacanteNombre ?? vacante.Vacante_Vacante,
        Vacante_Vacantes: dto.vacantes ?? vacante.Vacante_Vacantes,
        Vacante_TurnoId: dto.turnoId ?? vacante.Vacante_TurnoId,
        Vacante_Salario: dto.salario ?? vacante.Vacante_Salario,
        Vacante_TipoVacanteId: dto.tipoVacanteId ?? vacante.Vacante_TipoVacanteId,
        Vacante_DuracionTipoId: dto.duracionTipoId ?? vacante.Vacante_DuracionTipoId,
        Vacante_CarreraTargetId: dto.carreraTargetId ?? vacante.Vacante_CarreraTargetId,
        Vacante_Observaciones:
          dto.observaciones !== undefined ? dto.observaciones : vacante.Vacante_Observaciones,
      },
    });

    return this.getVacanteById(vacanteId);
  }

  static async updateVacanteStatus(
    user: TokenPayload,
    vacanteId: number,
    dto: UpdateVacanteStatusDto
  ) {
    await IdentityService.assertVacanteAccess(user, vacanteId);

    const vacante = await prisma.vacante.findUnique({ where: { VacanteId: vacanteId } });
    if (!vacante) {
      throw new HttpError(404, `Vacante con ID ${vacanteId} no encontrada.`);
    }

    await prisma.vacante.update({
      where: { VacanteId: vacanteId },
      data: { Vacante_Activa: dto.activa },
    });

    return this.getVacanteById(vacanteId);
  }

  static async closeIfFilled(vacanteId: number): Promise<void> {
    const vacante = await this.getVacanteById(vacanteId);

    if (vacante.plazasDisponibles === 0 && vacante.Vacante_Activa) {
      await prisma.vacante.update({
        where: { VacanteId: vacanteId },
        data: { Vacante_Activa: false },
      });
    }
  }
}
