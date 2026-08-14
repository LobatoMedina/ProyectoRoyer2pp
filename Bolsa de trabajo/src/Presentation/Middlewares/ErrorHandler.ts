import { Request, Response, NextFunction } from 'express';
import { HttpError } from '../../Domain/Errors/HttpError';

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
};

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof HttpError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  const prismaCode = (err as any)?.code;

  if (prismaCode === 'P2002') {
    return res.status(409).json({ error: 'El registro ya existe (valor duplicado).' });
  }

  if (prismaCode === 'P2003' || prismaCode === 'P2025') {
    return res.status(400).json({ error: 'Referencia inválida hacia un catálogo o registro inexistente.' });
  }

  console.error('Unhandled Error:', err);

  return res.status(500).json({
    error: 'Error interno del servidor.',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
};
