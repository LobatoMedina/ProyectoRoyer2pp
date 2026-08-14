import { Router } from 'express';
import { EmpresaController } from '../Controllers/EmpresaController';
import { VacanteController } from '../Controllers/VacanteController';
import { authenticateJWT, authorizeRoles, requireActiveAccount } from '../Middlewares/AuthMiddleware';
import { validateBody } from '../Middlewares/ValidationMiddleware';
import { RoleName } from '../../Domain/Enums/Roles';
import {
  addContactoSchema,
  responderConvenioSchema,
  solicitarConvenioSchema,
  updateEmpresaSchema,
} from '../../Application/Validation/Schemas';

const router = Router();

router.use(authenticateJWT);

router.get('/', authorizeRoles(RoleName.VINCULACION), EmpresaController.getAllEmpresas);

router.get('/convenios', authorizeRoles(RoleName.VINCULACION), EmpresaController.getConvenios);

router.get('/convenios/estado', authorizeRoles(RoleName.EMPRESA), EmpresaController.getMiConvenio);

router.post(
  '/convenios/solicitar',
  authorizeRoles(RoleName.VINCULACION),
  requireActiveAccount,
  validateBody(solicitarConvenioSchema),
  EmpresaController.solicitarConvenio
);

router.patch(
  '/convenios/:id/responder',
  authorizeRoles(RoleName.EMPRESA),
  validateBody(responderConvenioSchema),
  EmpresaController.responderConvenio
);

router.get(
  '/:empresaId/vacantes',
  authorizeRoles(RoleName.EMPRESA, RoleName.VINCULACION),
  VacanteController.getVacantesByEmpresaId
);

router.get(
  '/:id',
  authorizeRoles(RoleName.VINCULACION, RoleName.EMPRESA),
  EmpresaController.getEmpresaById
);

router.put(
  '/:id',
  authorizeRoles(RoleName.EMPRESA, RoleName.VINCULACION),
  requireActiveAccount,
  validateBody(updateEmpresaSchema),
  EmpresaController.updateEmpresa
);

router.post(
  '/:id/contactos',
  authorizeRoles(RoleName.EMPRESA, RoleName.VINCULACION),
  requireActiveAccount,
  validateBody(addContactoSchema),
  EmpresaController.addContacto
);

export default router;
