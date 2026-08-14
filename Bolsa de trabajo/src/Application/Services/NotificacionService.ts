import prisma from '../../Infrastructure/prisma';
import { RoleName } from '../../Domain/Enums/Roles';
import { FINAL_RESOLUTIONS, ResolutionName } from '../../Domain/Enums/Resolutions';
import { AgreementStatus } from '../../Domain/Enums/AgreementStatus';
import { TokenPayload } from '../../Infrastructure/Security/JwtService';
import { IdentityService } from './IdentityService';

interface Notification {
  tipo: string;
  titulo: string;
  mensaje: string;
  fecha: Date;
  referenciaId: number | null;
}

export class NotificacionService {
  private static async forAspirante(userId: number): Promise<Notification[]> {
    const aspiranteId = await IdentityService.getAspiranteIdByUserId(userId);

    const postulaciones = await prisma.postulacion.findMany({
      where: { Postulacion_AspiranteId: aspiranteId, Postulacion_Activa: true },
      include: {
        resolucion: true,
        vacanteEmpresa: { include: { vacante: true, empresa: true } },
      },
      orderBy: { PostulacionId: 'desc' },
    });

    return postulaciones
      .filter(
        (postulacion: any) =>
          postulacion.resolucion.Resolucion_Resolucion !== ResolutionName.UNDER_REVIEW
      )
      .map((postulacion: any) => ({
        tipo: 'postulacion',
        titulo: postulacion.vacanteEmpresa.vacante.Vacante_Vacante,
        mensaje: `${postulacion.vacanteEmpresa.empresa.Empresa_Empresa}: ${postulacion.resolucion.Resolucion_Resolucion}`,
        fecha: postulacion.Postulacion_FechaPostulacion,
        referenciaId: postulacion.PostulacionId,
      }));
  }

  private static async forEmpresa(userId: number): Promise<Notification[]> {
    const empresaId = await IdentityService.getEmpresaIdByUserId(userId);

    const postulaciones = await prisma.postulacion.findMany({
      where: {
        Postulacion_Activa: true,
        vacanteEmpresa: { VacanteEmpresa_EmpresaId: empresaId },
      },
      include: {
        resolucion: true,
        aspirante: { include: { persona: true, carrera: true } },
        vacanteEmpresa: { include: { vacante: true } },
      },
      orderBy: { PostulacionId: 'desc' },
    });

    return postulaciones
      .filter(
        (postulacion: any) =>
          !FINAL_RESOLUTIONS.includes(postulacion.resolucion.Resolucion_Resolucion)
      )
      .map((postulacion: any) => ({
        tipo: 'postulante',
        titulo: postulacion.vacanteEmpresa.vacante.Vacante_Vacante,
        mensaje: `${postulacion.aspirante.persona.Persona_Nombre} ${postulacion.aspirante.persona.Persona_ApellidoPaterno} (${postulacion.aspirante.carrera.Carrera_Carrera}) — ${postulacion.resolucion.Resolucion_Resolucion}`,
        fecha: postulacion.Postulacion_FechaPostulacion,
        referenciaId: postulacion.PostulacionId,
      }));
  }

  private static async forVinculacion(): Promise<Notification[]> {
    const pendientes = await prisma.postulacion.findMany({
      where: {
        Postulacion_Activa: true,
        resolucion: { Resolucion_Resolucion: ResolutionName.UNDER_REVIEW },
      },
      include: {
        aspirante: { include: { persona: true } },
        vacanteEmpresa: { include: { vacante: true, empresa: true } },
      },
      orderBy: { PostulacionId: 'desc' },
    });

    const empresasSinConvenio = await prisma.empresa.findMany({
      where: { usuario: { Usuario_Activo: false } },
      select: { EmpresaId: true, Empresa_Empresa: true },
    });

    const postulacionNotifications: Notification[] = pendientes.map((postulacion: any) => ({
      tipo: 'canalizacion',
      titulo: 'Postulación por canalizar',
      mensaje: `${postulacion.aspirante.persona.Persona_Nombre} ${postulacion.aspirante.persona.Persona_ApellidoPaterno} → ${postulacion.vacanteEmpresa.vacante.Vacante_Vacante} (${postulacion.vacanteEmpresa.empresa.Empresa_Empresa})`,
      fecha: postulacion.Postulacion_FechaPostulacion,
      referenciaId: postulacion.PostulacionId,
    }));

    const convenioNotifications: Notification[] = empresasSinConvenio.map((empresa: any) => ({
      tipo: 'convenio',
      titulo: `Convenio ${AgreementStatus.PENDING.toLowerCase()}`,
      mensaje: `${empresa.Empresa_Empresa} aún no cuenta con convenio vigente.`,
      fecha: new Date(),
      referenciaId: empresa.EmpresaId,
    }));

    return [...postulacionNotifications, ...convenioNotifications];
  }

  static async getForUser(user: TokenPayload): Promise<Notification[]> {
    const notifications: Notification[] = [];

    if (user.roles.includes(RoleName.ASPIRANTE)) {
      notifications.push(...(await this.forAspirante(user.userId)));
    }

    if (user.roles.includes(RoleName.EMPRESA)) {
      notifications.push(...(await this.forEmpresa(user.userId)));
    }

    if (user.roles.includes(RoleName.VINCULACION)) {
      notifications.push(...(await this.forVinculacion()));
    }

    return notifications.sort(
      (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    );
  }
}
