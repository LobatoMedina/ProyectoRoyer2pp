import prisma from '../../Infrastructure/prisma';
import { HttpError } from '../../Domain/Errors/HttpError';
import { AssignRolDto, UpdateUsuarioStatusDto } from '../Dtos';

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
