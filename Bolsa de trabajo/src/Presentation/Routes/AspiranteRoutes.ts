import { Router } from 'express';
import { AspiranteController } from '../Controllers/AspiranteController';
import { authenticateJWT, authorizeRoles, requireActiveAccount } from '../Middlewares/AuthMiddleware';
import { validateBody, validateQuery } from '../Middlewares/ValidationMiddleware';
import { RoleName } from '../../Domain/Enums/Roles';
import {
  addContactoSchema,
  aspiranteFiltersSchema,
  createExpedienteSchema,
  updateAspiranteSchema,
} from '../../Application/Validation/Schemas';

const router = Router();

router.use(authenticateJWT);

router.get(
  '/',
  authorizeRoles(RoleName.VINCULACION, RoleName.EMPRESA),
  validateQuery(aspiranteFiltersSchema),
  AspiranteController.getAllAspirantes
);

router.get('/me', authorizeRoles(RoleName.ASPIRANTE), AspiranteController.getMiPerfil);

router.post(
  '/',
  authorizeRoles(RoleName.ASPIRANTE, RoleName.VINCULACION),
  requireActiveAccount,
  validateBody(createExpedienteSchema),
  AspiranteController.createExpediente
);

router.get(
  '/:id',
  authorizeRoles(RoleName.VINCULACION, RoleName.EMPRESA, RoleName.ASPIRANTE),
  AspiranteController.getAspiranteById
);

router.put(
  '/:id',
  authorizeRoles(RoleName.ASPIRANTE, RoleName.VINCULACION),
  requireActiveAccount,
  validateBody(updateAspiranteSchema),
  AspiranteController.updateAspirante
);

router.post(
  '/:id/contactos',
  authorizeRoles(RoleName.ASPIRANTE, RoleName.VINCULACION),
  requireActiveAccount,
  validateBody(addContactoSchema),
  AspiranteController.addContacto
);

router.delete(
  '/:id/contactos/:contactoId',
  authorizeRoles(RoleName.ASPIRANTE, RoleName.VINCULACION),
  requireActiveAccount,
  AspiranteController.removeContacto
);

export default router;
