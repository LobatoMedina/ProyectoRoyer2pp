import { Response, NextFunction } from 'express';
import { PostulacionService } from '../../Application/Services/PostulacionService';
import { AuthenticatedRequest } from '../Middlewares/AuthMiddleware';
import { parseId } from '../Middlewares/ValidationMiddleware';

export class PostulacionController {
  static async postularse(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      res.status(201).json(await PostulacionService.postularse(req.user!, req.body));
    } catch (error) {
      next(error);
    }
  }

  static async getMisPostulaciones(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      res.status(200).json(await PostulacionService.getMisPostulaciones(req.user!));
    } catch (error) {
      next(error);
    }
  }

  static async getAllPostulaciones(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const empresaId = req.query.empresaId ? Number(req.query.empresaId) : undefined;
      const resolucionId = req.query.resolucionId ? Number(req.query.resolucionId) : undefined;
      res.status(200).json(await PostulacionService.getAllPostulaciones({ empresaId, resolucionId }));
    } catch (error) {
      next(error);
    }
  }

  static async getPostulacionById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const postulacionId = parseId(req.params.id, 'postulacionId');
      res.status(200).json(await PostulacionService.getPostulacionById(req.user!, postulacionId));
    } catch (error) {
      next(error);
    }
  }

  static async getPostulacionesByVacanteId(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const vacanteId = parseId(req.params.vacanteId, 'vacanteId');
      res
        .status(200)
        .json(await PostulacionService.getPostulacionesByVacanteId(req.user!, vacanteId));
    } catch (error) {
      next(error);
    }
  }

  static async canalizarPostulante(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const postulacionId = parseId(req.params.id, 'postulacionId');
      res
        .status(200)
        .json(await PostulacionService.canalizarPostulante(req.user!, postulacionId, req.body));
    } catch (error) {
      next(error);
    }
  }

  static async cancelarPostulacion(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const postulacionId = parseId(req.params.id, 'postulacionId');
      res.status(200).json(await PostulacionService.cancelarPostulacion(req.user!, postulacionId));
    } catch (error) {
      next(error);
    }
  }

  static async cambiarResolucion(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const postulacionId = parseId(req.params.id, 'postulacionId');
      res
        .status(200)
        .json(await PostulacionService.cambiarResolucion(req.user!, postulacionId, req.body));
    } catch (error) {
      next(error);
    }
  }

  static async notificarEntrevista(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const postulacionId = parseId(req.params.id, 'postulacionId');
      res
        .status(200)
        .json(await PostulacionService.notificarEntrevista(req.user!, postulacionId, req.body));
    } catch (error) {
      next(error);
    }
  }

  static async contratarAspirante(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const postulacionId = parseId(req.params.id, 'postulacionId');
      res.status(200).json(await PostulacionService.contratarAspirante(req.user!, postulacionId));
    } catch (error) {
      next(error);
    }
  }

  static async getHistorial(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const postulacionId = parseId(req.params.id, 'postulacionId');
      res.status(200).json(await PostulacionService.getHistorial(req.user!, postulacionId));
    } catch (error) {
      next(error);
    }
  }
}
