import { Prisma } from '@prisma/client';
import prisma from '../../Infrastructure/prisma';
import { HttpError } from '../../Domain/Errors/HttpError';
import { TokenPayload } from '../../Infrastructure/Security/JwtService';
import { IdentityService } from './IdentityService';
import {
  AddContactoDto,
  AspiranteFiltersDto,
  CreateAspiranteExpedienteDto,
  UpdateAspiranteDto,
} from '../Dtos';

const aspiranteInclude = {
  persona: {
    include: {
      sexo: true,
      usuario: { select: { UsuarioId: true, Usuario_Usuario: true, Usuario_Activo: true } },
      personaContactos: { include: { contacto: { include: { tipoContacto: true } } } },
    },
  },
  carrera: true,
  turno: true,
  tipoAspirante: true,
  cicloEscolarInicio: true,
};

export class AspiranteService {
  static async getAllAspirantes(filters: AspiranteFiltersDto) {
    const where: any = {};

    if (filters.carreraId) where.Aspirante_CarreraId = filters.carreraId;
    if (filters.turnoId) where.Aspirante_TurnoId = filters.turnoId;
    if (filters.tipoAspiranteId) where.Aspirante_TipoAspiranteId = filters.tipoAspiranteId;
    if (filters.texto) {
      where.persona = {
        OR: [
          { Persona_Nombre: { contains: filters.texto } },
          { Persona_ApellidoPaterno: { contains: filters.texto } },
          { Persona_CURP: { contains: filters.texto } },
        ],
      };
    }

    return prisma.aspirante.findMany({
      where,
      include: aspiranteInclude,
      orderBy: { AspiranteId: 'desc' },
    });
  }

  static async getAspiranteById(user: TokenPayload, aspiranteId: number) {
    const aspirante = await prisma.aspirante.findUnique({
      where: { AspiranteId: aspiranteId },
      include: {
        ...aspiranteInclude,
        postulaciones: {
          include: {
            resolucion: true,
            vacanteEmpresa: { include: { vacante: true, empresa: true } },
          },
        },
      },
    });

    if (!aspirante) {
      throw new HttpError(404, `Aspirante con ID ${aspiranteId} no encontrado.`);
    }

    return aspirante;
  }

  static async getMiPerfil(user: TokenPayload) {
    const aspiranteId = await IdentityService.getAspiranteIdByUserId(user.userId);
    return this.getAspiranteById(user, aspiranteId);
  }

  static async createExpediente(user: TokenPayload, dto: CreateAspiranteExpedienteDto) {
    let personaId = dto.personaId;

    if (!personaId) {
      if (!dto.nombre || !dto.apellidoPaterno || !dto.curp || !dto.sexoId || !dto.edad) {
        throw new HttpError(
          400,
          'Faltan datos personales obligatorios (nombre, apellidoPaterno, curp, sexoId, edad).'
        );
      }

      const persona = await prisma.persona.create({
        data: {
          Persona_Nombre: dto.nombre,
          Persona_ApellidoPaterno: dto.apellidoPaterno,
          Persona_ApellidoMaterno: dto.apellidoMaterno ?? null,
          Persona_CURP: dto.curp,
          Persona_SexoId: dto.sexoId,
          Persona_edad: dto.edad,
          Persona_UsuarioId: user.userId,
        },
      });

      personaId = persona.PersonaId;
    }

    return prisma.aspirante.create({
      data: {
        Aspirante_PersonaId: personaId,
        Aspirante_TipoAspiranteId: dto.tipoAspiranteId,
        Aspirante_CarreraId: dto.carreraId,
        Aspirante_TurnoId: dto.turnoId,
        Aspirante_CicloEscolarInicioId: dto.cicloEscolarInicioId,
      },
      include: aspiranteInclude,
    });
  }

  static async updateAspirante(user: TokenPayload, aspiranteId: number, dto: UpdateAspiranteDto) {
    await IdentityService.assertAspiranteAccess(user, aspiranteId);

    const aspirante = await prisma.aspirante.findUnique({ where: { AspiranteId: aspiranteId } });

    if (!aspirante) {
      throw new HttpError(404, `Aspirante con ID ${aspiranteId} no encontrado.`);
    }

    await prisma.aspirante.update({
      where: { AspiranteId: aspiranteId },
      data: {
        Aspirante_CarreraId: dto.carreraId ?? aspirante.Aspirante_CarreraId,
        Aspirante_TurnoId: dto.turnoId ?? aspirante.Aspirante_TurnoId,
        Aspirante_TipoAspiranteId: dto.tipoAspiranteId ?? aspirante.Aspirante_TipoAspiranteId,
      },
    });

    if (dto.nombre || dto.apellidoPaterno || dto.apellidoMaterno !== undefined || dto.edad) {
      await prisma.persona.update({
        where: { PersonaId: aspirante.Aspirante_PersonaId },
        data: {
          Persona_Nombre: dto.nombre ?? undefined,
          Persona_ApellidoPaterno: dto.apellidoPaterno ?? undefined,
          Persona_ApellidoMaterno: dto.apellidoMaterno ?? undefined,
          Persona_edad: dto.edad ?? undefined,
        },
      });
    }

    return this.getAspiranteById(user, aspiranteId);
  }

  static async addContacto(user: TokenPayload, aspiranteId: number, dto: AddContactoDto) {
    await IdentityService.assertAspiranteAccess(user, aspiranteId);

    const aspirante = await prisma.aspirante.findUnique({ where: { AspiranteId: aspiranteId } });

    if (!aspirante) {
      throw new HttpError(404, `Aspirante con ID ${aspiranteId} no encontrado.`);
    }

    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const contacto = await tx.contacto.create({
        data: {
          Contacto_Contacto: dto.contacto,
          Contacto_TipoContacto: dto.tipoContactoId,
        },
      });

      await tx.personaContacto.create({
        data: {
          PersonaContacto_PersonaId: aspirante.Aspirante_PersonaId,
          PersonaContacto_ContactoId: contacto.ContactoId,
        },
      });

      return contacto;
    });
  }

  static async removeContacto(user: TokenPayload, aspiranteId: number, contactoId: number) {
    await IdentityService.assertAspiranteAccess(user, aspiranteId);

    const aspirante = await prisma.aspirante.findUnique({ where: { AspiranteId: aspiranteId } });

    if (!aspirante) {
      throw new HttpError(404, `Aspirante con ID ${aspiranteId} no encontrado.`);
    }

    const link = await prisma.personaContacto.findFirst({
      where: {
        PersonaContacto_PersonaId: aspirante.Aspirante_PersonaId,
        PersonaContacto_ContactoId: contactoId,
      },
    });

    if (!link) {
      throw new HttpError(404, 'El contacto no pertenece a este aspirante.');
    }

    await prisma.contacto.delete({ where: { ContactoId: contactoId } });

    return { message: 'Contacto eliminado correctamente.' };
  }
}
