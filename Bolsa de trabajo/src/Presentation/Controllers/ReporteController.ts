import { Request, Response, NextFunction } from 'express';
import { ReporteService } from '../../Application/Services/ReporteService';

const handle = (loader: () => Promise<unknown>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(200).json(await loader());
    } catch (error) {
      next(error);
    }
  };
};

export class ReporteController {
  static getResumen = handle(() => ReporteService.getResumen());
  static getVacantesPorCarrera = handle(() => ReporteService.getVacantesPorCarrera());
  static getDemandaPorCarrera = handle(() => ReporteService.getDemandaPorCarrera());
  static getPostulacionesPorResolucion = handle(() =>
    ReporteService.getPostulacionesPorResolucion()
  );
  static getParticipacionPorEmpresa = handle(() => ReporteService.getParticipacionPorEmpresa());
  static getVacantesMasDemandadas = handle(() => ReporteService.getVacantesMasDemandadas());
}
