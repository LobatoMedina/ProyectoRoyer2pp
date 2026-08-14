import { Response, NextFunction } from 'express';
import { AspiranteService } from '../../Application/Services/AspiranteService';
import { AuthenticatedRequest } from '../Middlewares/AuthMiddleware';
import { parseId } from '../Middlewares/ValidationMiddleware';

export class AspiranteController {
  static async getAllAspirantes(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      res.status(200).json(await AspiranteService.getAllAspirantes(req.validatedQuery ?? {}));
    } catch (error) {
      next(error);
    }
  }

  static async getMiPerfil(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      res.status(200).json(await AspiranteService.getMiPerfil(req.user!));
    } catch (error) {
      next(error);
    }
  }

  static async getAspiranteById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const aspiranteId = parseId(req.params.id, 'aspiranteId');
      res.status(200).json(await AspiranteService.getAspiranteById(req.user!, aspiranteId));
    } catch (error) {
      next(error);
    }
  }

  static async createExpediente(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      res.status(201).json(await AspiranteService.createExpediente(req.user!, req.body));
    } catch (error) {
      next(error);
    }
  }

  static async updateAspirante(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const aspiranteId = parseId(req.params.id, 'aspiranteId');
      res.status(200).json(await AspiranteService.updateAspirante(req.user!, aspiranteId, req.body));
    } catch (error) {
      next(error);
    }
  }

  static async addContacto(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const aspiranteId = parseId(req.params.id, 'aspiranteId');
      res.status(201).json(await AspiranteService.addContacto(req.user!, aspiranteId, req.body));
    } catch (error) {
      next(error);
    }
  }

  static async removeContacto(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const aspiranteId = parseId(req.params.id, 'aspiranteId');
      const contactoId = parseId(req.params.contactoId, 'contactoId');
      res.status(200).json(await AspiranteService.removeContacto(req.user!, aspiranteId, contactoId));
    } catch (error) {
      next(error);
    }
  }
}
