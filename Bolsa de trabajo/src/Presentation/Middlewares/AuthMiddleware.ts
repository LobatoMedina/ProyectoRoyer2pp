import { Request, Response, NextFunction } from 'express';
import { JwtService, TokenPayload } from '../../Infrastructure/Security/JwtService';
import { HttpError } from '../../Domain/Errors/HttpError';
import prisma from '../../Infrastructure/prisma';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
  validatedQuery?: any;
}

export const authenticateJWT = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
    return next(new HttpError(401, 'Acceso denegado. Token no proporcionado.'));
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return next(new HttpError(401, 'Acceso denegado. Token no válido.'));
  }

  try {
    req.user = JwtService.verifyToken(token);
    next();
  } catch (error) {
    return next(new HttpError(401, 'Token inválido o expirado.'));
  }
};

export const authorizeRoles = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new HttpError(401, 'Usuario no autenticado.'));
    }

    const hasRole = req.user.roles.some((userRole) => roles.includes(userRole));
    if (!hasRole) {
      return next(new HttpError(403, 'No tienes permisos suficientes para realizar esta acción.'));
    }

    next();
  };
};

export const requireActiveAccount = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return next(new HttpError(401, 'Usuario no autenticado.'));
  }

  const usuario = await prisma.usuario.findUnique({
    where: { UsuarioId: req.user.userId },
    select: { Usuario_Activo: true },
  });

  if (!usuario) {
    return next(new HttpError(401, 'Usuario no encontrado.'));
  }

  if (!usuario.Usuario_Activo) {
    return next(
      new HttpError(
        403,
        'Tu cuenta no está autorizada. Las empresas requieren un convenio vigente con la universidad.'
      )
    );
  }

  next();
};
