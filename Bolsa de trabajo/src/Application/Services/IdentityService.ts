import prisma from '../../Infrastructure/prisma';
import { HttpError } from '../../Domain/Errors/HttpError';
import { RoleName } from '../../Domain/Enums/Roles';
import { TokenPayload } from '../../Infrastructure/Security/JwtService';

export class IdentityService {
  static hasRole(user: TokenPayload, role: RoleName): boolean {
    return user.roles.includes(role);
  }

  static async getAspiranteIdByUserId(userId: number): Promise<number> {
    const aspirante = await prisma.aspirante.findFirst({
      where: { persona: { Persona_UsuarioId: userId } },
      select: { AspiranteId: true },
    });

    if (!aspirante) {
      throw new HttpError(404, 'No se encontró un perfil de aspirante asociado a este usuario.');
    }

    return aspirante.AspiranteId;
  }

  static async getEmpresaIdByUserId(userId: number): Promise<number> {
    const empresa = await prisma.empresa.findFirst({
      where: { UsuarioId: userId },
      select: { EmpresaId: true },
    });

    if (!empresa) {
      throw new HttpError(404, 'No se encontró una empresa asociada a este usuario.');
    }

    return empresa.EmpresaId;
  }

  static async getEmpresaIdByVacanteId(vacanteId: number): Promise<number> {
    const link = await prisma.vacanteEmpresa.findFirst({
      where: { VacanteEmpresa_VacanteId: vacanteId },
      select: { VacanteEmpresa_EmpresaId: true },
    });

    if (!link) {
      throw new HttpError(404, `Vacante con ID ${vacanteId} no encontrada.`);
    }

    return link.VacanteEmpresa_EmpresaId;
  }

  static async resolveEmpresaId(user: TokenPayload, requestedEmpresaId?: number): Promise<number> {
    if (this.hasRole(user, RoleName.EMPRESA)) {
      return this.getEmpresaIdByUserId(user.userId);
    }

    if (!requestedEmpresaId) {
      throw new HttpError(400, 'Debes indicar el empresaId de la empresa propietaria.');
    }

    return requestedEmpresaId;
  }

  static async assertEmpresaAccess(user: TokenPayload, empresaId: number): Promise<void> {
    if (this.hasRole(user, RoleName.VINCULACION)) return;

    const ownEmpresaId = await this.getEmpresaIdByUserId(user.userId);
    if (ownEmpresaId !== empresaId) {
      throw new HttpError(403, 'No tienes acceso a la información de esta empresa.');
    }
  }

  static async assertVacanteAccess(user: TokenPayload, vacanteId: number): Promise<void> {
    if (this.hasRole(user, RoleName.VINCULACION)) return;

    const empresaId = await this.getEmpresaIdByVacanteId(vacanteId);
    await this.assertEmpresaAccess(user, empresaId);
  }

  static async assertAspiranteAccess(user: TokenPayload, aspiranteId: number): Promise<void> {
    if (this.hasRole(user, RoleName.VINCULACION)) return;

    const ownAspiranteId = await this.getAspiranteIdByUserId(user.userId);
    if (ownAspiranteId !== aspiranteId) {
      throw new HttpError(403, 'No tienes acceso al expediente de este aspirante.');
    }
  }

  static async assertPostulacionAccess(user: TokenPayload, postulacionId: number): Promise<void> {
    const postulacion = await prisma.postulacion.findUnique({
      where: { PostulacionId: postulacionId },
      select: {
        Postulacion_AspiranteId: true,
        vacanteEmpresa: { select: { VacanteEmpresa_EmpresaId: true } },
      },
    });

    if (!postulacion) {
      throw new HttpError(404, `Postulación con ID ${postulacionId} no encontrada.`);
    }

    if (this.hasRole(user, RoleName.VINCULACION)) return;

    if (this.hasRole(user, RoleName.EMPRESA)) {
      await this.assertEmpresaAccess(user, postulacion.vacanteEmpresa.VacanteEmpresa_EmpresaId);
      return;
    }

    await this.assertAspiranteAccess(user, postulacion.Postulacion_AspiranteId);
  }
}
