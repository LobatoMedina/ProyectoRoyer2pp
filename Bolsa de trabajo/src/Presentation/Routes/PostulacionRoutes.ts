import { Router } from 'express';
import { PostulacionController } from '../Controllers/PostulacionController';
import { authenticateJWT, authorizeRoles, requireActiveAccount } from '../Middlewares/AuthMiddleware';
import { validateBody } from '../Middlewares/ValidationMiddleware';
import { RoleName } from '../../Domain/Enums/Roles';
import {
  canalizarPostulacionSchema,
  createPostulacionSchema,
  notificarEntrevistaSchema,
  updateResolucionSchema,
} from '../../Application/Validation/Schemas';

const router = Router();

router.use(authenticateJWT);

router.post(
  '/',
  authorizeRoles(RoleName.ASPIRANTE),
  requireActiveAccount,
  validateBody(createPostulacionSchema),
  PostulacionController.postularse
);

router.get('/mis-postulaciones', authorizeRoles(RoleName.ASPIRANTE), PostulacionController.getMisPostulaciones);

router.get('/', authorizeRoles(RoleName.VINCULACION), PostulacionController.getAllPostulaciones);

router.get(
  '/:id',
  authorizeRoles(RoleName.ASPIRANTE, RoleName.EMPRESA, RoleName.VINCULACION),
  PostulacionController.getPostulacionById
);

router.get(
  '/:id/historial',
  authorizeRoles(RoleName.ASPIRANTE, RoleName.EMPRESA, RoleName.VINCULACION),
  PostulacionController.getHistorial
);

router.patch(
  '/:id/canalizar',
  authorizeRoles(RoleName.VINCULACION),
  requireActiveAccount,
  validateBody(canalizarPostulacionSchema),
  PostulacionController.canalizarPostulante
);

router.patch(
  '/:id/resolucion',
  authorizeRoles(RoleName.EMPRESA, RoleName.VINCULACION),
  requireActiveAccount,
  validateBody(updateResolucionSchema),
  PostulacionController.cambiarResolucion
);

router.post(
  '/:id/notificar-entrevista',
  authorizeRoles(RoleName.EMPRESA, RoleName.VINCULACION),
  requireActiveAccount,
  validateBody(notificarEntrevistaSchema),
  PostulacionController.notificarEntrevista
);

router.patch(
  '/:id/contratar',
  authorizeRoles(RoleName.EMPRESA, RoleName.VINCULACION),
  requireActiveAccount,
  PostulacionController.contratarAspirante
);

router.delete(
  '/:id',
  authorizeRoles(RoleName.ASPIRANTE),
  requireActiveAccount,
  PostulacionController.cancelarPostulacion
);

export default router;
