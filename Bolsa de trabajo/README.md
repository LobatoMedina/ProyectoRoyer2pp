# Bolsa de Trabajo — API

Back-end de la Bolsa de Trabajo Universitaria: **TypeScript · Express · Prisma · MariaDB · JWT**.

La descripción del problema, la solución y las instrucciones de instalación están en la raíz del
espacio de trabajo: `README.md` y `README.INSTALACION.md`.

## Arquitectura

```
src/
├── Domain/          Enums y errores del dominio
├── Application/     Servicios, DTOs y validación con zod
├── Infrastructure/  Cliente Prisma y seguridad (JWT, bcrypt)
└── Presentation/    Controladores, middlewares y rutas
```

Las dependencias apuntan hacia adentro: Presentation → Application → Domain. Los controladores
no consultan Prisma; toda la lógica vive en los servicios.

## Ejecución rápida

```bash
docker compose up -d      # solo MariaDB, para desarrollo local
cp .env.example .env
npm install
npx prisma generate
npx prisma db push
npm run prisma:seed
npm run dev
```

Para levantar el sistema completo (API + front-end + base de datos), usa el `docker compose up`
de la raíz.

## Módulos

`/api/auth` · `/api/catalogos` · `/api/aspirantes` · `/api/empresas` · `/api/vacantes` ·
`/api/postulaciones` · `/api/reportes` · `/api/usuarios` · `/api/notificaciones`

Todas las peticiones de ejemplo están en `api-tests.http`.

## Reglas de negocio implementadas

- El estado de la vacante (**Abierta / En proceso / Cerrada**) se deriva de `Vacante_Activa`, las
  plazas cubiertas y las postulaciones vivas.
- El convenio de la empresa se refleja en `Usuario_Activo`; sin convenio vigente no hay escrituras.
- Cada operación verifica pertenencia a través de `IdentityService`. Vinculación es el único rol
  con acceso transversal.
- No se permiten dos vacantes activas con el mismo nombre en la misma empresa.
- Al cubrirse todas las plazas, la vacante se cierra automáticamente.
