import { Router } from 'express';
import { UsuarioController } from '../Controllers/UsuarioController';
import { authenticateJWT, authorizeRoles, requireActiveAccount } from '../Middlewares/AuthMiddleware';
import { validateBody } from '../Middlewares/ValidationMiddleware';
import { RoleName } from '../../Domain/Enums/Roles';
import { assignRolSchema, updateUsuarioStatusSchema } from '../../Application/Validation/Schemas';

const router = Router();

router.use(authenticateJWT, authorizeRoles(RoleName.VINCULACION), requireActiveAccount);

router.get('/', UsuarioController.getAll);
router.patch('/:id/status', validateBody(updateUsuarioStatusSchema), UsuarioController.updateStatus);
router.post('/:id/roles', validateBody(assignRolSchema), UsuarioController.assignRol);
router.delete('/:id/roles/:rolId', UsuarioController.removeRol);

export default router;
