import { Response, NextFunction } from 'express';
import { UsuarioService } from '../../Application/Services/UsuarioService';
import { AuthenticatedRequest } from '../Middlewares/AuthMiddleware';
import { parseId } from '../Middlewares/ValidationMiddleware';

export class UsuarioController {
  static async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const activo =
        req.query.activo === undefined ? undefined : String(req.query.activo) === 'true';
      res.status(200).json(await UsuarioService.getAll({ activo }));
    } catch (error) {
      next(error);
    }
  }

  static async updateStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const usuarioId = parseId(req.params.id, 'usuarioId');
      res.status(200).json(await UsuarioService.updateStatus(usuarioId, req.body));
    } catch (error) {
      next(error);
    }
  }

  static async assignRol(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const usuarioId = parseId(req.params.id, 'usuarioId');
      res.status(201).json(await UsuarioService.assignRol(usuarioId, req.body));
    } catch (error) {
      next(error);
    }
  }

  static async removeRol(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const usuarioId = parseId(req.params.id, 'usuarioId');
      const rolId = parseId(req.params.rolId, 'rolId');
      res.status(200).json(await UsuarioService.removeRol(usuarioId, rolId));
    } catch (error) {
      next(error);
    }
  }
}
