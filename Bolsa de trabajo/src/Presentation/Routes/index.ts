import { Router } from 'express';
import authRoutes from './AuthRoutes';
import aspiranteRoutes from './AspiranteRoutes';
import empresaRoutes from './EmpresaRoutes';
import vacanteRoutes from './VacanteRoutes';
import postulacionRoutes from './PostulacionRoutes';
import catalogosRoutes from './CatalogosRoutes';
import reporteRoutes from './ReporteRoutes';
import usuarioRoutes from './UsuarioRoutes';
import notificacionRoutes from './NotificacionRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/catalogos', catalogosRoutes);
router.use('/aspirantes', aspiranteRoutes);
router.use('/empresas', empresaRoutes);
router.use('/vacantes', vacanteRoutes);
router.use('/postulaciones', postulacionRoutes);
router.use('/reportes', reporteRoutes);
router.use('/usuarios', usuarioRoutes);
router.use('/notificaciones', notificacionRoutes);

export default router;
