import { Router } from 'express';
import { NotificacionController } from '../Controllers/NotificacionController';
import { authenticateJWT } from '../Middlewares/AuthMiddleware';

const router = Router();

router.get('/', authenticateJWT, NotificacionController.getForUser);

export default router;
