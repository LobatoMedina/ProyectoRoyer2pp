import { Request, Response, NextFunction } from 'express';
import { CatalogosService } from '../../Application/Services/CatalogosService';

const handle = (loader: () => Promise<unknown>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(200).json(await loader());
    } catch (error) {
      next(error);
    }
  };
};

export class CatalogosController {
  static getCarreras = handle(() => CatalogosService.getCarreras());
  static getTurnos = handle(() => CatalogosService.getTurnos());
  static getTiposAspirante = handle(() => CatalogosService.getTiposAspirante());
  static getTiposEmpresa = handle(() => CatalogosService.getTiposEmpresa());
  static getTiposVacante = handle(() => CatalogosService.getTiposVacante());
  static getTiposDuracion = handle(() => CatalogosService.getTiposDuracion());
  static getTiposContacto = handle(() => CatalogosService.getTiposContacto());
  static getResoluciones = handle(() => CatalogosService.getResoluciones());
  static getCiclosEscolares = handle(() => CatalogosService.getCiclosEscolares());
  static getSexos = handle(() => CatalogosService.getSexos());
  static getRoles = handle(() => CatalogosService.getRoles());
}
