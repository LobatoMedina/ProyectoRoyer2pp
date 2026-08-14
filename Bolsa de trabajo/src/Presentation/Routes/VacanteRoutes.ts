import { Router } from 'express';
import { VacanteController } from '../Controllers/VacanteController';
import { PostulacionController } from '../Controllers/PostulacionController';
import { authenticateJWT, authorizeRoles, requireActiveAccount } from '../Middlewares/AuthMiddleware';
import { validateBody, validateQuery } from '../Middlewares/ValidationMiddleware';
import { RoleName } from '../../Domain/Enums/Roles';
import {
  createVacanteSchema,
  updateVacanteSchema,
  updateVacanteStatusSchema,
  vacanteFiltersSchema,
} from '../../Application/Validation/Schemas';

const router = Router();

router.use(authenticateJWT);

router.get('/', validateQuery(vacanteFiltersSchema), VacanteController.getVacantes);

router.post(
  '/',
  authorizeRoles(RoleName.EMPRESA, RoleName.VINCULACION),
  requireActiveAccount,
  validateBody(createVacanteSchema),
  VacanteController.createVacante
);

router.get(
  '/:vacanteId/postulaciones',
  authorizeRoles(RoleName.EMPRESA, RoleName.VINCULACION),
  PostulacionController.getPostulacionesByVacanteId
);

router.get('/:id', VacanteController.getVacanteById);

router.put(
  '/:id',
  authorizeRoles(RoleName.EMPRESA, RoleName.VINCULACION),
  requireActiveAccount,
  validateBody(updateVacanteSchema),
  VacanteController.updateVacante
);

router.patch(
  '/:id/status',
  authorizeRoles(RoleName.EMPRESA, RoleName.VINCULACION),
  requireActiveAccount,
  validateBody(updateVacanteStatusSchema),
  VacanteController.updateVacanteStatus
);

export default router;
