import request from 'supertest';
import app from '../Presentation/index';

describe('API Bolsa de Trabajo', () => {
  describe('Salud del servidor', () => {
    it('responde con un mensaje de estado', async () => {
      const response = await request(app).get('/');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
    });

    it('responde 404 en rutas inexistentes', async () => {
      const response = await request(app).get('/api/ruta-inexistente');
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Autenticación', () => {
    it('rechaza el login con credenciales vacías', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ usuario: '', contrasena: '' });
      expect(response.status).toBe(400);
    });

    it('rechaza el registro de aspirante con datos incompletos', async () => {
      const response = await request(app)
        .post('/api/auth/register-aspirante')
        .send({ usuario: 'test' });
      expect(response.status).toBe(400);
    });

    it('rechaza el acceso al perfil sin token', async () => {
      const response = await request(app).get('/api/auth/me');
      expect(response.status).toBe(401);
    });
  });

  describe('Rutas protegidas', () => {
    const protectedRoutes = [
      '/api/aspirantes',
      '/api/empresas',
      '/api/vacantes',
      '/api/postulaciones/mis-postulaciones',
      '/api/reportes/resumen',
      '/api/usuarios',
      '/api/notificaciones',
    ];

    it.each(protectedRoutes)('rechaza %s sin token', async (route) => {
      const response = await request(app).get(route);
      expect(response.status).toBe(401);
    });

    it('rechaza un token inválido', async () => {
      const response = await request(app)
        .get('/api/vacantes')
        .set('Authorization', 'Bearer token-invalido');
      expect(response.status).toBe(401);
    });

    it('rechaza un encabezado de autorización mal formado', async () => {
      const response = await request(app).get('/api/vacantes').set('Authorization', 'token-suelto');
      expect(response.status).toBe(401);
    });
  });
});
