import { Router } from 'express';
import { ReporteController } from '../Controllers/ReporteController';
import { authenticateJWT, authorizeRoles } from '../Middlewares/AuthMiddleware';
import { RoleName } from '../../Domain/Enums/Roles';

const router = Router();

router.use(authenticateJWT, authorizeRoles(RoleName.VINCULACION, RoleName.CONTROL_ESCOLAR));

router.get('/resumen', ReporteController.getResumen);
router.get('/vacantes-por-carrera', ReporteController.getVacantesPorCarrera);
router.get('/demanda-por-carrera', ReporteController.getDemandaPorCarrera);
router.get('/postulaciones-por-resolucion', ReporteController.getPostulacionesPorResolucion);
router.get('/participacion-por-empresa', ReporteController.getParticipacionPorEmpresa);
router.get('/vacantes-mas-demandadas', ReporteController.getVacantesMasDemandadas);

export default router;
