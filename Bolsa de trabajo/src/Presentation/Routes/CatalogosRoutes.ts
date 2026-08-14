import { Router } from 'express';
import { CatalogosController } from '../Controllers/CatalogosController';

const router = Router();

router.get('/carrera', CatalogosController.getCarreras);
router.get('/turno', CatalogosController.getTurnos);
router.get('/tipos-aspirante', CatalogosController.getTiposAspirante);
router.get('/tipos-empresa', CatalogosController.getTiposEmpresa);
router.get('/tipos-vacante', CatalogosController.getTiposVacante);
router.get('/tipos-duracion', CatalogosController.getTiposDuracion);
router.get('/tipos-contacto', CatalogosController.getTiposContacto);
router.get('/resoluciones', CatalogosController.getResoluciones);
router.get('/ciclos-escolares', CatalogosController.getCiclosEscolares);
router.get('/sexos', CatalogosController.getSexos);
router.get('/roles', CatalogosController.getRoles);

export default router;
