import { Router } from 'express';
import { AuthController } from '../Controllers/AuthController';
import { authenticateJWT } from '../Middlewares/AuthMiddleware';
import { validateBody } from '../Middlewares/ValidationMiddleware';
import { loginSchema, registerAspiranteSchema, registerEmpresaSchema } from '../../Application/Validation/Schemas';

const router = Router();

router.post('/login', validateBody(loginSchema), AuthController.login);
router.post('/register-aspirante', validateBody(registerAspiranteSchema), AuthController.registerAspirante);
router.post('/register-empresa', validateBody(registerEmpresaSchema), AuthController.registerEmpresa);
router.get('/me', authenticateJWT, AuthController.getMe);

export default router;
