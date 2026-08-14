import prisma from '../../Infrastructure/prisma';
import { FINAL_RESOLUTIONS, ResolutionName } from '../../Domain/Enums/Resolutions';

interface CounterRow {
  id: number;
  etiqueta: string;
  total: number;
}

const toSortedRows = (map: Map<number, CounterRow>): CounterRow[] =>
  Array.from(map.values()).sort((a, b) => b.total - a.total);

export class ReporteService {
  static async getResumen() {
    const [
      totalAspirantes,
      totalEmpresas,
      empresasConConvenio,
      totalVacantes,
      vacantesActivas,
      totalPostulaciones,
      postulacionesActivas,
    ] = await Promise.all([
      prisma.aspirante.count(),
      prisma.empresa.count(),
      prisma.empresa.count({ where: { usuario: { Usuario_Activo: true } } }),
      prisma.vacante.count(),
      prisma.vacante.count({ where: { Vacante_Activa: true } }),
      prisma.postulacion.count(),
      prisma.postulacion.count({ where: { Postulacion_Activa: true } }),
    ]);

    const contratados = await prisma.postulacion.count({
      where: { resolucion: { Resolucion_Resolucion: ResolutionName.HIRED } },
    });

    const plazas = await prisma.vacante.aggregate({
      _sum: { Vacante_Vacantes: true },
      where: { Vacante_Activa: true },
    });

    return {
      totalAspirantes,
      totalEmpresas,
      empresasConConvenio,
      empresasSinConvenio: totalEmpresas - empresasConConvenio,
      totalVacantes,
      vacantesActivas,
      plazasOfertadas: plazas._sum.Vacante_Vacantes ?? 0,
      totalPostulaciones,
      postulacionesActivas,
      contratados,
      tasaContratacion:
        totalPostulaciones === 0 ? 0 : Number(((contratados / totalPostulaciones) * 100).toFixed(2)),
    };
  }

  static async getVacantesPorCarrera() {
    const vacantes = await prisma.vacante.findMany({
      include: { carreraTarget: { select: { CarreraId: true, Carrera_Carrera: true } } },
    });

    const map = new Map<number, CounterRow>();

    for (const vacante of vacantes) {
      const key = vacante.carreraTarget.CarreraId;
      const current = map.get(key) ?? {
        id: key,
        etiqueta: vacante.carreraTarget.Carrera_Carrera,
        total: 0,
      };
      current.total += 1;
      map.set(key, current);
    }

    return toSortedRows(map);
  }

  static async getDemandaPorCarrera() {
    const postulaciones = await prisma.postulacion.findMany({
      include: { aspirante: { include: { carrera: true } } },
    });

    const map = new Map<number, CounterRow>();

    for (const postulacion of postulaciones) {
      const carrera = postulacion.aspirante.carrera;
      const current = map.get(carrera.CarreraId) ?? {
        id: carrera.CarreraId,
        etiqueta: carrera.Carrera_Carrera,
        total: 0,
      };
      current.total += 1;
      map.set(carrera.CarreraId, current);
    }

    return toSortedRows(map);
  }

  static async getPostulacionesPorResolucion() {
    const postulaciones = await prisma.postulacion.findMany({ include: { resolucion: true } });

    const map = new Map<number, CounterRow>();

    for (const postulacion of postulaciones) {
      const resolucion = postulacion.resolucion;
      const current = map.get(resolucion.ResolucionId) ?? {
        id: resolucion.ResolucionId,
        etiqueta: resolucion.Resolucion_Resolucion,
        total: 0,
      };
      current.total += 1;
      map.set(resolucion.ResolucionId, current);
    }

    return toSortedRows(map);
  }

  static async getParticipacionPorEmpresa() {
    const empresas = await prisma.empresa.findMany({
      include: {
        vacantesEmpresa: {
          include: {
            vacante: { select: { Vacante_Activa: true } },
            postulaciones: { include: { resolucion: true } },
          },
        },
      },
    });

    return empresas
      .map((empresa: any) => {
        const vacantes = empresa.vacantesEmpresa.length;
        const vacantesActivas = empresa.vacantesEmpresa.filter(
          (link: any) => link.vacante.Vacante_Activa
        ).length;

        const postulaciones = empresa.vacantesEmpresa.flatMap((link: any) => link.postulaciones);
        const contratados = postulaciones.filter(
          (postulacion: any) => postulacion.resolucion.Resolucion_Resolucion === ResolutionName.HIRED
        ).length;

        return {
          empresaId: empresa.EmpresaId,
          empresa: empresa.Empresa_Empresa,
          vacantes,
          vacantesActivas,
          postulaciones: postulaciones.length,
          contratados,
        };
      })
      .sort((a: any, b: any) => b.postulaciones - a.postulaciones);
  }

  static async getVacantesMasDemandadas(limit = 10) {
    const vacantes = await prisma.vacante.findMany({
      include: {
        carreraTarget: true,
        vacantesEmpresa: {
          include: {
            empresa: { select: { Empresa_Empresa: true } },
            postulaciones: { include: { resolucion: true } },
          },
        },
      },
    });

    return vacantes
      .map((vacante: any) => {
        const postulaciones = vacante.vacantesEmpresa.flatMap((link: any) => link.postulaciones);
        const enProceso = postulaciones.filter(
          (postulacion: any) =>
            !FINAL_RESOLUTIONS.includes(postulacion.resolucion.Resolucion_Resolucion)
        ).length;

        return {
          vacanteId: vacante.VacanteId,
          vacante: vacante.Vacante_Vacante,
          empresa: vacante.vacantesEmpresa[0]?.empresa?.Empresa_Empresa ?? null,
          carrera: vacante.carreraTarget.Carrera_Carrera,
          plazas: vacante.Vacante_Vacantes,
          postulaciones: postulaciones.length,
          enProceso,
        };
      })
      .sort((a: any, b: any) => b.postulaciones - a.postulaciones)
      .slice(0, limit);
  }
}
