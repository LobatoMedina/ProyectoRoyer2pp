import prisma from '../../Infrastructure/prisma';
import { HttpError } from '../../Domain/Errors/HttpError';
import { AgreementStatus } from '../../Domain/Enums/AgreementStatus';
import { TokenPayload } from '../../Infrastructure/Security/JwtService';
import { IdentityService } from './IdentityService';
import { ResponderConvenioDto, SolicitarConvenioDto, UpdateEmpresaDto } from '../Dtos';

const empresaInclude = {
  tipoEmpresa: true,
  usuario: { select: { UsuarioId: true, Usuario_Usuario: true, Usuario_Activo: true } },
  empresaContactos: { include: { contacto: { include: { tipoContacto: true } } } },
};

const withAgreementStatus = (empresa: any) => ({
  ...empresa,
  estadoConvenio: empresa.usuario?.Usuario_Activo ? AgreementStatus.ACTIVE : AgreementStatus.PENDING,
});

export class EmpresaService {
  static async getAllEmpresas() {
    const empresas = await prisma.empresa.findMany({
      include: empresaInclude,
      orderBy: { EmpresaId: 'desc' },
    });

    return empresas.map(withAgreementStatus);
  }

  static async getEmpresaById(user: TokenPayload, empresaId: number) {
    await IdentityService.assertEmpresaAccess(user, empresaId);

    const empresa = await prisma.empresa.findUnique({
      where: { EmpresaId: empresaId },
      include: {
        ...empresaInclude,
        vacantesEmpresa: {
          include: {
            vacante: { include: { turno: true, tipoVacante: true, carreraTarget: true } },
          },
        },
      },
    });

    if (!empresa) {
      throw new HttpError(404, `Empresa con ID ${empresaId} no encontrada.`);
    }

    return withAgreementStatus(empresa);
  }

  static async updateEmpresa(user: TokenPayload, empresaId: number, dto: UpdateEmpresaDto) {
    await IdentityService.assertEmpresaAccess(user, empresaId);

    const empresa = await prisma.empresa.findUnique({ where: { EmpresaId: empresaId } });

    if (!empresa) {
      throw new HttpError(404, `Empresa con ID ${empresaId} no encontrada.`);
    }

    const updated = await prisma.empresa.update({
      where: { EmpresaId: empresaId },
      data: {
        Empresa_Empresa: dto.empresaNombre ?? empresa.Empresa_Empresa,
        Empresa_Direccion: dto.direccion ?? empresa.Empresa_Direccion,
        Empresa_RazonSocial: dto.razonSocial ?? empresa.Empresa_RazonSocial,
        Empresa_rfc: dto.rfc ?? empresa.Empresa_rfc,
        Empresa_TipoEmpresaId: dto.tipoEmpresaId ?? empresa.Empresa_TipoEmpresaId,
      },
      include: empresaInclude,
    });

    return withAgreementStatus(updated);
  }

  static async addContacto(user: TokenPayload, empresaId: number, contacto: string, tipoContactoId: number) {
    await IdentityService.assertEmpresaAccess(user, empresaId);

    return prisma.$transaction(async (tx: any) => {
      const created = await tx.contacto.create({
        data: { Contacto_Contacto: contacto, Contacto_TipoContacto: tipoContactoId },
      });

      await tx.empresaContacto.create({
        data: {
          EmpresaContacto_EmpresaId: empresaId,
          EmpresaContacto_ContactoId: created.ContactoId,
        },
      });

      return created;
    });
  }

  static async getConvenios() {
    const empresas = await prisma.empresa.findMany({
      include: empresaInclude,
      orderBy: { EmpresaId: 'desc' },
    });

    return empresas.map((empresa: any) => ({
      empresaId: empresa.EmpresaId,
      empresa: empresa.Empresa_Empresa,
      razonSocial: empresa.Empresa_RazonSocial,
      rfc: empresa.Empresa_rfc,
      usuarioId: empresa.usuario?.UsuarioId ?? null,
      estado: empresa.usuario?.Usuario_Activo ? AgreementStatus.ACTIVE : AgreementStatus.PENDING,
    }));
  }

  static async getMiConvenio(user: TokenPayload) {
    const empresaId = await IdentityService.getEmpresaIdByUserId(user.userId);
    const empresa = await prisma.empresa.findUnique({
      where: { EmpresaId: empresaId },
      include: { usuario: { select: { Usuario_Activo: true } } },
    });

    return {
      empresaId,
      estado: empresa?.usuario?.Usuario_Activo ? AgreementStatus.ACTIVE : AgreementStatus.PENDING,
    };
  }

  static async solicitarConvenio(dto: SolicitarConvenioDto) {
    const empresa = await prisma.empresa.findUnique({
      where: { EmpresaId: dto.empresaId },
      select: { UsuarioId: true, Empresa_Empresa: true },
    });

    if (!empresa) {
      throw new HttpError(404, `Empresa con ID ${dto.empresaId} no encontrada.`);
    }

    await prisma.usuario.update({
      where: { UsuarioId: empresa.UsuarioId },
      data: { Usuario_Activo: false },
    });

    return {
      message: 'Solicitud de convenio enviada a la empresa.',
      empresaId: dto.empresaId,
      empresa: empresa.Empresa_Empresa,
      estado: AgreementStatus.PENDING,
      observaciones: dto.observaciones ?? null,
      fechaSolicitud: new Date(),
    };
  }

  static async responderConvenio(user: TokenPayload, empresaId: number, dto: ResponderConvenioDto) {
    await IdentityService.assertEmpresaAccess(user, empresaId);

    const empresa = await prisma.empresa.findUnique({
      where: { EmpresaId: empresaId },
      select: { UsuarioId: true },
    });

    if (!empresa) {
      throw new HttpError(404, `Empresa con ID ${empresaId} no encontrada.`);
    }

    await prisma.usuario.update({
      where: { UsuarioId: empresa.UsuarioId },
      data: { Usuario_Activo: dto.aceptado },
    });

    return {
      message: dto.aceptado
        ? 'Convenio aceptado. La empresa ya puede publicar vacantes.'
        : 'Convenio rechazado. La empresa permanece sin autorización para publicar.',
      empresaId,
      estado: dto.aceptado ? AgreementStatus.ACTIVE : AgreementStatus.PENDING,
      observaciones: dto.observaciones ?? null,
      fechaRespuesta: new Date(),
    };
  }
}
