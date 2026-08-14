import { Response, NextFunction } from 'express';
import { VacanteService } from '../../Application/Services/VacanteService';
import { AuthenticatedRequest } from '../Middlewares/AuthMiddleware';
import { parseId } from '../Middlewares/ValidationMiddleware';

export class VacanteController {
  static async getVacantes(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      res.status(200).json(await VacanteService.getVacantes(req.user!, req.validatedQuery ?? {}));
    } catch (error) {
      next(error);
    }
  }

  static async getVacanteById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const vacanteId = parseId(req.params.id, 'vacanteId');
      res.status(200).json(await VacanteService.getVacanteById(vacanteId));
    } catch (error) {
      next(error);
    }
  }

  static async getVacantesByEmpresaId(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const empresaId = parseId(req.params.empresaId, 'empresaId');
      res.status(200).json(await VacanteService.getVacantesByEmpresaId(req.user!, empresaId));
    } catch (error) {
      next(error);
    }
  }

  static async createVacante(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      res.status(201).json(await VacanteService.createVacante(req.user!, req.body));
    } catch (error) {
      next(error);
    }
  }

  static async updateVacante(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const vacanteId = parseId(req.params.id, 'vacanteId');
      res.status(200).json(await VacanteService.updateVacante(req.user!, vacanteId, req.body));
    } catch (error) {
      next(error);
    }
  }

  static async updateVacanteStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const vacanteId = parseId(req.params.id, 'vacanteId');
      res.status(200).json(await VacanteService.updateVacanteStatus(req.user!, vacanteId, req.body));
    } catch (error) {
      next(error);
    }
  }
}
