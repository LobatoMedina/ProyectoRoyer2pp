import { Response, NextFunction } from 'express';
import { ZodType } from 'zod';
import { HttpError } from '../../Domain/Errors/HttpError';
import { AuthenticatedRequest } from './AuthMiddleware';

const formatIssues = (error: any): string => {
  const issues = error?.issues ?? [];
  return issues
    .map((issue: any) => `${issue.path.join('.') || 'body'}: ${issue.message}`)
    .join(' | ');
};

export const validateBody = (schema: ZodType) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body ?? {});
    if (!result.success) {
      return next(new HttpError(400, `Datos inválidos. ${formatIssues(result.error)}`));
    }
    req.body = result.data;
    next();
  };
};

export const validateQuery = (schema: ZodType) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query ?? {});
    if (!result.success) {
      return next(new HttpError(400, `Parámetros inválidos. ${formatIssues(result.error)}`));
    }
    req.validatedQuery = result.data;
    next();
  };
};

export const parseId = (value: unknown, label = 'identificador'): number => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new HttpError(400, `El ${label} proporcionado no es válido.`);
  }
  return parsed;
};
