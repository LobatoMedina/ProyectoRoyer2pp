import { Response, NextFunction } from 'express';
import { NotificacionService } from '../../Application/Services/NotificacionService';
import { AuthenticatedRequest } from '../Middlewares/AuthMiddleware';

export class NotificacionController {
  static async getForUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      res.status(200).json(await NotificacionService.getForUser(req.user!));
    } catch (error) {
      next(error);
    }
  }
}
