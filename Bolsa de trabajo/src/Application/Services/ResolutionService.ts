import prisma from '../../Infrastructure/prisma';
import { ResolutionName } from '../../Domain/Enums/Resolutions';

export class ResolutionService {
  static async getIdByName(name: ResolutionName): Promise<number> {
    const existing = await prisma.resolucion.findFirst({
      where: { Resolucion_Resolucion: name },
      select: { ResolucionId: true },
    });

    if (existing) return existing.ResolucionId;

    const created = await prisma.resolucion.create({
      data: { Resolucion_Resolucion: name },
      select: { ResolucionId: true },
    });

    return created.ResolucionId;
  }
}
