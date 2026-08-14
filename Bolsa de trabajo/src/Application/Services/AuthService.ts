import { Prisma } from '@prisma/client';
import prisma from '../../Infrastructure/prisma';
import { PasswordHasher } from '../../Infrastructure/Security/PasswordHasher';
import { JwtService } from '../../Infrastructure/Security/JwtService';
import { HttpError } from '../../Domain/Errors/HttpError';
import { RoleName } from '../../Domain/Enums/Roles';
import { AgreementStatus } from '../../Domain/Enums/AgreementStatus';
import { LoginDto, RegisterAspiranteDto, RegisterEmpresaDto } from '../Dtos';

const ensureRol = async (tx: Prisma.TransactionClient, rolName: RoleName) => {
  const existing = await tx.rol.findFirst({ where: { Rol_Rol: rolName } });
  if (existing) return existing.RolId;

  const created = await tx.rol.create({ data: { Rol_Rol: rolName } });
  return created.RolId;
};

export class AuthService {
  static async login(dto: LoginDto) {
    const usuario = await prisma.usuario.findFirst({
      where: { Usuario_Usuario: dto.usuario },
      include: { rolesUsuario: { include: { rol: true } } },
    });

    if (!usuario) {
      throw new HttpError(401, 'Credenciales inválidas.');
    }

    const isPasswordValid = await PasswordHasher.compare(dto.contrasena, usuario.Usuario_Contraseña);

    if (!isPasswordValid) {
      throw new HttpError(401, 'Credenciales inválidas.');
    }

    const roles = usuario.rolesUsuario.map((link: any) => link.rol.Rol_Rol);

    const token = JwtService.generateToken({
      userId: usuario.UsuarioId,
      username: usuario.Usuario_Usuario,
      roles,
    });

    return {
      usuario: {
        id: usuario.UsuarioId,
        username: usuario.Usuario_Usuario,
        activo: usuario.Usuario_Activo,
        roles,
      },
      token,
    };
  }

  static async registerAspirante(dto: RegisterAspiranteDto) {
    const [existingUser, existingCurp] = await Promise.all([
      prisma.usuario.findFirst({ where: { Usuario_Usuario: dto.usuario } }),
      prisma.persona.findFirst({ where: { Persona_CURP: dto.curp } }),
    ]);

    if (existingUser) {
      throw new HttpError(409, 'El nombre de usuario ya está registrado.');
    }

    if (existingCurp) {
      throw new HttpError(409, 'La CURP ingresada ya se encuentra registrada.');
    }

    const hashedPassword = await PasswordHasher.hash(dto.contrasena);

    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const usuario = await tx.usuario.create({
        data: {
          Usuario_Usuario: dto.usuario,
          Usuario_Contraseña: hashedPassword,
          Usuario_Activo: true,
        },
      });

      const rolId = await ensureRol(tx, RoleName.ASPIRANTE);

      await tx.rolUsuario.create({
        data: { RolUsuario_UsuarioId: usuario.UsuarioId, RolUsuario_RolId: rolId },
      });

      const persona = await tx.persona.create({
        data: {
          Persona_Nombre: dto.nombre,
          Persona_ApellidoPaterno: dto.apellidoPaterno,
          Persona_ApellidoMaterno: dto.apellidoMaterno ?? null,
          Persona_CURP: dto.curp,
          Persona_SexoId: dto.sexoId,
          Persona_edad: dto.edad,
          Persona_UsuarioId: usuario.UsuarioId,
        },
      });

      const aspirante = await tx.aspirante.create({
        data: {
          Aspirante_PersonaId: persona.PersonaId,
          Aspirante_TipoAspiranteId: dto.tipoAspiranteId,
          Aspirante_CarreraId: dto.carreraId,
          Aspirante_TurnoId: dto.turnoId,
          Aspirante_CicloEscolarInicioId: dto.cicloEscolarInicioId,
        },
      });

      const token = JwtService.generateToken({
        userId: usuario.UsuarioId,
        username: usuario.Usuario_Usuario,
        roles: [RoleName.ASPIRANTE],
      });

      return {
        message: 'Aspirante registrado exitosamente.',
        usuarioId: usuario.UsuarioId,
        aspiranteId: aspirante.AspiranteId,
        usuario: {
          id: usuario.UsuarioId,
          username: usuario.Usuario_Usuario,
          activo: true,
          roles: [RoleName.ASPIRANTE],
        },
        token,
      };
    });
  }

  static async registerEmpresa(dto: RegisterEmpresaDto) {
    const [existingUser, existingRfc] = await Promise.all([
      prisma.usuario.findFirst({ where: { Usuario_Usuario: dto.usuario } }),
      prisma.empresa.findFirst({ where: { Empresa_rfc: dto.rfc } }),
    ]);

    if (existingUser) {
      throw new HttpError(409, 'El nombre de usuario ya está registrado.');
    }

    if (existingRfc) {
      throw new HttpError(409, 'El RFC ingresado ya se encuentra registrado.');
    }

    const hashedPassword = await PasswordHasher.hash(dto.contrasena);

    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const usuario = await tx.usuario.create({
        data: {
          Usuario_Usuario: dto.usuario,
          Usuario_Contraseña: hashedPassword,
          Usuario_Activo: false,
        },
      });

      const rolId = await ensureRol(tx, RoleName.EMPRESA);

      await tx.rolUsuario.create({
        data: { RolUsuario_UsuarioId: usuario.UsuarioId, RolUsuario_RolId: rolId },
      });

      const empresa = await tx.empresa.create({
        data: {
          Empresa_Empresa: dto.empresaNombre,
          Empresa_Direccion: dto.direccion,
          Empresa_RazonSocial: dto.razonSocial,
          Empresa_rfc: dto.rfc,
          Empresa_TipoEmpresaId: dto.tipoEmpresaId,
          UsuarioId: usuario.UsuarioId,
        },
      });

      const token = JwtService.generateToken({
        userId: usuario.UsuarioId,
        username: usuario.Usuario_Usuario,
        roles: [RoleName.EMPRESA],
      });

      return {
        message: 'Empresa registrada exitosamente. El convenio queda pendiente de aceptación.',
        usuarioId: usuario.UsuarioId,
        empresaId: empresa.EmpresaId,
        estadoConvenio: AgreementStatus.PENDING,
        usuario: {
          id: usuario.UsuarioId,
          username: usuario.Usuario_Usuario,
          activo: false,
          roles: [RoleName.EMPRESA],
        },
        token,
      };
    });
  }

  static async getMe(userId: number) {
    const usuario = await prisma.usuario.findUnique({
      where: { UsuarioId: userId },
      include: {
        rolesUsuario: { include: { rol: true } },
        personas: {
          include: {
            sexo: true,
            aspirantes: {
              include: {
                carrera: true,
                turno: true,
                tipoAspirante: true,
                cicloEscolarInicio: true,
              },
            },
            personaContactos: { include: { contacto: { include: { tipoContacto: true } } } },
          },
        },
        empresas: {
          include: {
            tipoEmpresa: true,
            empresaContactos: { include: { contacto: { include: { tipoContacto: true } } } },
          },
        },
      },
    });

    if (!usuario) {
      throw new HttpError(404, 'Usuario no encontrado.');
    }

    return {
      id: usuario.UsuarioId,
      username: usuario.Usuario_Usuario,
      activo: usuario.Usuario_Activo,
      roles: usuario.rolesUsuario.map((link: any) => link.rol.Rol_Rol),
      personas: usuario.personas,
      empresas: usuario.empresas,
      aspiranteId: usuario.personas[0]?.aspirantes[0]?.AspiranteId ?? null,
      empresaId: usuario.empresas[0]?.EmpresaId ?? null,
      estadoConvenio: usuario.empresas[0]
        ? usuario.Usuario_Activo
          ? AgreementStatus.ACTIVE
          : AgreementStatus.PENDING
        : null,
    };
  }
}
