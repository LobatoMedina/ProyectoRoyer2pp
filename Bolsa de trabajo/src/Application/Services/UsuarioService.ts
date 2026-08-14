import { Prisma } from '@prisma/client';
import prisma from '../../Infrastructure/prisma';
import { PasswordHasher } from '../../Infrastructure/Security/PasswordHasher';
import { HttpError } from '../../Domain/Errors/HttpError';
import { RoleName } from '../../Domain/Enums/Roles';
import { AssignRolDto, CreatePersonalDto, UpdateUsuarioStatusDto } from '../Dtos';

/** Roles que puede tener el personal administrativo dado de alta desde el panel. */
const ROLES_PERSONAL: string[] = [RoleName.CONTROL_ESCOLAR, RoleName.VINCULACION];

const usuarioInclude = {
  rolesUsuario: { include: { rol: true } },
  personas: { select: { PersonaId: true, Persona_Nombre: true, Persona_ApellidoPaterno: true } },
  empresas: { select: { EmpresaId: true, Empresa_Empresa: true } },
};

const toPublicUser = (usuario: any) => ({
  usuarioId: usuario.UsuarioId,
  usuario: usuario.Usuario_Usuario,
  activo: usuario.Usuario_Activo,
  roles: usuario.rolesUsuario.map((link: any) => ({
    rolId: link.rol.RolId,
    rol: link.rol.Rol_Rol,
  })),
  persona: usuario.personas[0]
    ? `${usuario.personas[0].Persona_Nombre} ${usuario.personas[0].Persona_ApellidoPaterno}`
    : null,
  empresa: usuario.empresas[0]?.Empresa_Empresa ?? null,
});

export class UsuarioService {
  /**
   * Da de alta a una persona del personal administrativo (Control Escolar o
   * Vinculación). Crea la cuenta, el registro de persona y la asignación del
   * rol dentro de una sola transacción.
   */
  static async createPersonal(dto: CreatePersonalDto) {
    const rol = await prisma.rol.findUnique({ where: { RolId: dto.rolId } });

    if (!rol) {
      throw new HttpError(404, `Rol con ID ${dto.rolId} no encontrado.`);
    }

    if (!ROLES_PERSONAL.includes(rol.Rol_Rol)) {
      throw new HttpError(
        400,
        `Solo es posible dar de alta personal con los roles: ${ROLES_PERSONAL.join(', ')}.`
      );
    }

    const curp = dto.curp.toUpperCase();

    const [existingUser, existingCurp] = await Promise.all([
      prisma.usuario.findFirst({ where: { Usuario_Usuario: dto.usuario } }),
      prisma.persona.findFirst({ where: { Persona_CURP: curp } }),
    ]);

    if (existingUser) {
      throw new HttpError(409, 'El nombre de usuario ya está registrado.');
    }

    if (existingCurp) {
      throw new HttpError(409, 'La CURP ingresada ya se encuentra registrada.');
    }

    const hashedPassword = await PasswordHasher.hash(dto.contrasena);

    const usuarioId = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const usuario = await tx.usuario.create({
        data: {
          Usuario_Usuario: dto.usuario,
          Usuario_Contraseña: hashedPassword,
          Usuario_Activo: true,
        },
      });

      await tx.rolUsuario.create({
        data: { RolUsuario_UsuarioId: usuario.UsuarioId, RolUsuario_RolId: dto.rolId },
      });

      await tx.persona.create({
        data: {
          Persona_Nombre: dto.nombre,
          Persona_ApellidoPaterno: dto.apellidoPaterno,
          Persona_ApellidoMaterno: dto.apellidoMaterno ?? null,
          Persona_CURP: curp,
          Persona_SexoId: dto.sexoId,
          Persona_edad: dto.edad,
          Persona_UsuarioId: usuario.UsuarioId,
        },
      });

      return usuario.UsuarioId;
    });

    const created = await prisma.usuario.findUnique({
      where: { UsuarioId: usuarioId },
      include: usuarioInclude,
    });

    return toPublicUser(created);
  }

  static async getAll(filters: { activo?: boolean }) {
    const usuarios = await prisma.usuario.findMany({
      where: filters.activo === undefined ? {} : { Usuario_Activo: filters.activo },
      include: usuarioInclude,
      orderBy: { UsuarioId: 'asc' },
    });

    return usuarios.map(toPublicUser);
  }

  static async updateStatus(usuarioId: number, dto: UpdateUsuarioStatusDto) {
    const usuario = await prisma.usuario.findUnique({ where: { UsuarioId: usuarioId } });

    if (!usuario) {
      throw new HttpError(404, `Usuario con ID ${usuarioId} no encontrado.`);
    }

    const updated = await prisma.usuario.update({
      where: { UsuarioId: usuarioId },
      data: { Usuario_Activo: dto.activo },
      include: usuarioInclude,
    });

    return toPublicUser(updated);
  }

  static async assignRol(usuarioId: number, dto: AssignRolDto) {
    const [usuario, rol] = await Promise.all([
      prisma.usuario.findUnique({ where: { UsuarioId: usuarioId } }),
      prisma.rol.findUnique({ where: { RolId: dto.rolId } }),
    ]);

    if (!usuario) throw new HttpError(404, `Usuario con ID ${usuarioId} no encontrado.`);
    if (!rol) throw new HttpError(404, `Rol con ID ${dto.rolId} no encontrado.`);

    const existing = await prisma.rolUsuario.findFirst({
      where: { RolUsuario_UsuarioId: usuarioId, RolUsuario_RolId: dto.rolId },
    });

    if (existing) {
      throw new HttpError(409, 'El usuario ya cuenta con ese rol asignado.');
    }

    await prisma.rolUsuario.create({
      data: { RolUsuario_UsuarioId: usuarioId, RolUsuario_RolId: dto.rolId },
    });

    const updated = await prisma.usuario.findUnique({
      where: { UsuarioId: usuarioId },
      include: usuarioInclude,
    });

    return toPublicUser(updated);
  }

  static async removeRol(usuarioId: number, rolId: number) {
    const link = await prisma.rolUsuario.findFirst({
      where: { RolUsuario_UsuarioId: usuarioId, RolUsuario_RolId: rolId },
    });

    if (!link) {
      throw new HttpError(404, 'El usuario no tiene asignado ese rol.');
    }

    await prisma.rolUsuario.delete({ where: { RolUsuarioId: link.RolUsuarioId } });

    const updated = await prisma.usuario.findUnique({
      where: { UsuarioId: usuarioId },
      include: usuarioInclude,
    });

    return toPublicUser(updated);
  }
}
