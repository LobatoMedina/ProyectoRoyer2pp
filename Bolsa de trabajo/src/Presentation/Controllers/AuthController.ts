import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../../Application/Services/AuthService';
import { AuthenticatedRequest } from '../Middlewares/AuthMiddleware';

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(200).json(await AuthService.login(req.body));
    } catch (error) {
      next(error);
    }
  }

  static async registerAspirante(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(201).json(await AuthService.registerAspirante(req.body));
    } catch (error) {
      next(error);
    }
  }

  static async registerEmpresa(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(201).json(await AuthService.registerEmpresa(req.body));
    } catch (error) {
      next(error);
    }
  }

  static async getMe(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      res.status(200).json(await AuthService.getMe(req.user!.userId));
    } catch (error) {
      next(error);
    }
  }
}
