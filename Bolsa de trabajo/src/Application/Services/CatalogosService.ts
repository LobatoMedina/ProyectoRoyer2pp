import prisma from '../../Infrastructure/prisma';

export class CatalogosService {
  static async getCarreras() {
    return prisma.carrera.findMany({ where: { Carrera_Activa: true }, orderBy: { CarreraId: 'asc' } });
  }

  static async getTurnos() {
    return prisma.turno.findMany({ orderBy: { TurnoId: 'asc' } });
  }

  static async getTiposAspirante() {
    return prisma.aspiranteTipo.findMany({ orderBy: { AspiranteTipoId: 'asc' } });
  }

  static async getTiposEmpresa() {
    return prisma.tipoEmpresa.findMany({ orderBy: { TipoEmpresaId: 'asc' } });
  }

  static async getTiposVacante() {
    return prisma.vacanteTipo.findMany({ orderBy: { VacanteTipoId: 'asc' } });
  }

  static async getTiposDuracion() {
    return prisma.duracionTipo.findMany({ orderBy: { DuracionTipoId: 'asc' } });
  }

  static async getTiposContacto() {
    return prisma.tipoContacto.findMany({ orderBy: { TipoContactoId: 'asc' } });
  }

  static async getResoluciones() {
    return prisma.resolucion.findMany({ orderBy: { ResolucionId: 'asc' } });
  }

  static async getCiclosEscolares() {
    return prisma.cicloEscolar.findMany({
      where: { CicloEscolar_Activo: true },
      orderBy: { CicloEscolarId: 'asc' },
    });
  }

  static async getSexos() {
    return prisma.sexo.findMany({ orderBy: { SexoId: 'asc' } });
  }

  static async getRoles() {
    return prisma.rol.findMany({ orderBy: { RolId: 'asc' } });
  }
}
