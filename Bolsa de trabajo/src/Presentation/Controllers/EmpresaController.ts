import { Response, NextFunction } from 'express';
import { EmpresaService } from '../../Application/Services/EmpresaService';
import { AuthenticatedRequest } from '../Middlewares/AuthMiddleware';
import { parseId } from '../Middlewares/ValidationMiddleware';

export class EmpresaController {
  static async getAllEmpresas(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      res.status(200).json(await EmpresaService.getAllEmpresas());
    } catch (error) {
      next(error);
    }
  }

  static async getEmpresaById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const empresaId = parseId(req.params.id, 'empresaId');
      res.status(200).json(await EmpresaService.getEmpresaById(req.user!, empresaId));
    } catch (error) {
      next(error);
    }
  }

  static async updateEmpresa(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const empresaId = parseId(req.params.id, 'empresaId');
      res.status(200).json(await EmpresaService.updateEmpresa(req.user!, empresaId, req.body));
    } catch (error) {
      next(error);
    }
  }

  static async addContacto(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const empresaId = parseId(req.params.id, 'empresaId');
      const result = await EmpresaService.addContacto(
        req.user!,
        empresaId,
        req.body.contacto,
        req.body.tipoContactoId
      );
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getConvenios(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      res.status(200).json(await EmpresaService.getConvenios());
    } catch (error) {
      next(error);
    }
  }

  static async getMiConvenio(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      res.status(200).json(await EmpresaService.getMiConvenio(req.user!));
    } catch (error) {
      next(error);
    }
  }

  static async solicitarConvenio(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      res.status(201).json(await EmpresaService.solicitarConvenio(req.body));
    } catch (error) {
      next(error);
    }
  }

  static async responderConvenio(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const empresaId = parseId(req.params.id, 'empresaId');
      res.status(200).json(await EmpresaService.responderConvenio(req.user!, empresaId, req.body));
    } catch (error) {
      next(error);
    }
  }
}
