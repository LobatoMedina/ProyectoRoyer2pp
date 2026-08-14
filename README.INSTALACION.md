# Instalación y notas técnicas

Guía operativa del proyecto. La descripción del problema y de la solución está en
[README.md](./README.md).

---

## 1. Requisitos

- Docker y Docker Compose v2 (`docker compose`, sin guion).
- Para desarrollo sin contenedores: Node.js 20+ y npm 10+.

---

## 2. Levantar todo con Docker

```bash
cp .env.example .env      # opcional: el .env ya viene con claves generadas
docker compose up --build
```

Eso es todo. El archivo `.env` de la raíz alimenta los tres servicios.

| Servicio | URL | Contenedor |
|---|---|---|
| Front-end | http://localhost:3001 | `bolsa_trabajo_web` |
| API | http://localhost:3000 | `bolsa_trabajo_api` |
| MariaDB | localhost:3307 | `bolsa_trabajo_db` |

Al arrancar, el contenedor de la API espera a que MariaDB pase su *healthcheck*, aplica el
esquema con `prisma db push` y ejecuta el seed. El arranque en frío tarda entre uno y dos
minutos por la compilación de las imágenes.

Para detener y borrar los datos:

```bash
docker compose down -v
```

---

## 3. Variables de entorno

Todas viven en el `.env` de la raíz. **Las claves incluidas fueron generadas al azar para que el
proyecto funcione de inmediato; cámbialas antes de desplegar en Dokploy.**

| Variable | Para qué sirve |
|---|---|
| `MARIADB_DATABASE` / `MARIADB_USER` / `MARIADB_PASSWORD` | Credenciales de la base que usa la API |
| `MARIADB_ROOT_PASSWORD` | Contraseña de root de MariaDB |
| `MARIADB_PORT` | Puerto expuesto en el host (3307 para no chocar con un MySQL local) |
| `API_PORT` | Puerto del back-end |
| `JWT_SECRET` | Firma de los tokens. Genera uno nuevo con `openssl rand -hex 32` |
| `JWT_EXPIRES_IN` | Vigencia del token (`24h` por defecto) |
| `CORS_ORIGIN` | Origen permitido. Acepta varios separados por coma |
| `SEED_ADMIN_USER` | Nombre del usuario administrador (`admin` por defecto) |
| `SEED_ADMIN_PASSWORD` | Contraseña del usuario administrador |
| `SEED_DEMO_PASSWORD` | Contraseña de las cuentas de demostración |
| `SEED_DEMO_DATA` | `false` para sembrar solo catálogos y la cuenta de Vinculación |
| `WEB_PORT` | Puerto del front-end |
| `NEXT_PUBLIC_API_URL` | URL de la API **desde el navegador**. Se incrusta al compilar |

### Nota importante para Dokploy

`NEXT_PUBLIC_API_URL` se resuelve en tiempo de compilación de Next.js y la consume el navegador
del usuario, no el contenedor. Al desplegar con dominio propio debe apuntar a la URL pública de
la API, por ejemplo `https://api.tudominio.mx/api`, y `CORS_ORIGIN` debe contener la URL pública
del front-end. Si cambias `NEXT_PUBLIC_API_URL` hay que reconstruir la imagen `web`, no basta
con reiniciar el contenedor.

---

## 4. Cuentas de prueba

| Usuario | Rol | Contraseña |
|---|---|---|
| `admin` | Vinculación (administrador) | `Tijuana123?` |
| `tech_corp` | Empresa (convenio vigente) | valor de `SEED_DEMO_PASSWORD` |
| `juan_perez` | Aspirante | valor de `SEED_DEMO_PASSWORD` |
| `control_escolar` | Control Escolar | valor de `SEED_DEMO_PASSWORD` |

El usuario administrador es el único que el seed crea siempre, incluso con
`SEED_DEMO_DATA=false`. Su nombre y contraseña salen de `SEED_ADMIN_USER` y
`SEED_ADMIN_PASSWORD`; si no defines esas variables, el seed usa `admin` / `Tijuana123?`.
La contraseña nunca se guarda en texto plano: se almacena con bcrypt (10 rondas) en
`Usuario_Contraseña`.

Como el seed es idempotente, volver a ejecutarlo restablece la contraseña de estas tres cuentas
al valor actual de las variables. Es la forma prevista de rotar la clave del administrador: cambia
`SEED_ADMIN_PASSWORD` y corre `npm run prisma:seed`.

El seed también crea una vacante de ejemplo de Tech Corp dirigida a Ingeniería en Sistemas
Computacionales. En producción usa `SEED_DEMO_DATA=false` y cambia `SEED_ADMIN_PASSWORD`.

---

## 5. Desarrollo local sin contenedores

Levanta solo la base de datos y corre cada proyecto en su terminal:

```bash
# Terminal 1 — base de datos
cd "Bolsa de trabajo"
docker compose up -d

# Terminal 2 — API
cd "Bolsa de trabajo"
cp .env.example .env        # ajusta DATABASE_URL y JWT_SECRET
npm install
npx prisma generate
npx prisma db push
npm run prisma:seed
npm run dev                 # http://localhost:3000

# Terminal 3 — front-end
cd Proyecto_Roger_Front
cp .env.example .env.local
npm install
npm run dev                 # http://localhost:3001
```

El `docker-compose.yml` que está dentro de `Bolsa de trabajo/` levanta **únicamente MariaDB**,
pensado para este flujo. El de la raíz es el que levanta el sistema completo.

---

## 6. Comandos útiles

### Back-end (`Bolsa de trabajo/`)

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor con recarga automática |
| `npm run build` | Compila TypeScript a `dist/` |
| `npm start` | Ejecuta la versión compilada |
| `npm test` | Pruebas de la API con Jest y Supertest |
| `npm run prisma:generate` | Regenera el cliente de Prisma |
| `npm run prisma:push` | Sincroniza el esquema con la base |
| `npm run prisma:seed` | Carga catálogos y datos de prueba |

### Front-end (`Proyecto_Roger_Front/`)

| Comando | Qué hace |
|---|---|
| `npm run dev` | Desarrollo en el puerto 3001 |
| `npm run build` | Compilación de producción (salida standalone) |
| `npm run typecheck` | Verificación de tipos |
| `npm run lint` | ESLint |

---

## 7. Probar la API a mano

`Bolsa de trabajo/api-tests.http` contiene todas las peticiones listas para ejecutarse desde la
extensión REST Client de VS Code. Empieza por el login: la variable `@token` se reutiliza en el
resto de las llamadas.

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"usuario":"admin","contrasena":"Tijuana123?"}'
```

---

## 8. Despliegue en Dokploy desde un repositorio único

Dokploy necesita un solo repositorio que contenga el `docker-compose.yml` y ambos proyectos.
Al unificarlos hay un detalle que rompe el despliegue si se pasa por alto.

### El problema de los repositorios anidados

Cada proyecto trae su propia carpeta `.git`. Si creas el repositorio nuevo en la raíz y haces
`git add -A`, git **no sube el código**: registra cada carpeta como un enlace a submódulo
(modo `160000`) sin archivo `.gitmodules`. El repositorio queda con ocho entradas y, al clonarlo,
Dokploy encuentra dos directorios vacíos y la construcción falla de inmediato.

Git avisa con `warning: adding embedded git repository`, pero el `push` funciona igual, así que
el error aparece hasta el despliegue.

### Opción A — aplanar (recomendada para desplegar)

El historial de cada proyecto se conserva en sus repositorios originales, que no se tocan.

```bash
cp -r "Bolsa de trabajo" Proyecto_Roger_Front \
      docker-compose.yml .gitignore .env.example \
      README.md README.INSTALACION.md CLAUDE.md  ../bolsa-trabajo-deploy/

cd ../bolsa-trabajo-deploy
rm -rf "Bolsa de trabajo/.git" Proyecto_Roger_Front/.git

git init
git add -A
git status --short | wc -l      # deben ser cientos de archivos, no ocho
git commit -m "chore: monorepo de despliegue"
git remote add origin <url-del-tercer-repo>
git push -u origin main
```

La verificación que importa antes del push:

```bash
git ls-files -s | grep 160000   # no debe devolver nada
git ls-files | wc -l            # debe superar los 150 archivos
git ls-files | grep -c "^\.env$"  # debe ser 0
```

### Opción B — submódulos

Si quieres conservar los tres repositorios vinculados:

```bash
git submodule add <url-backend> "Bolsa de trabajo"
git submodule add <url-frontend> Proyecto_Roger_Front
git commit -m "chore: submodulos"
```

Requiere que Dokploy clone con `--recurse-submodules` y que ambos repositorios sean accesibles
con las credenciales del despliegue. Es más frágil; para entregar el proyecto, la opción A da
menos problemas.

### Variables en Dokploy

Dokploy escribe las variables de la interfaz en un archivo `.env` junto al `docker-compose.yml`,
que es exactamente de donde Compose toma la interpolación `${VAR}`. El `docker-compose.yml` de
este proyecto usa interpolación y además mapea cada variable dentro de `environment:`, así que
funciona sin cambios: basta con capturar en el panel las quince variables del `.env`.

Ninguno de los valores generados contiene `$` ni `#`, que son los caracteres que romperían el
archivo. Si generas contraseñas nuevas, evita esos dos caracteres o entrecomilla el valor.

### Valores que cambian en producción

Tres variables **no** pueden quedarse con el valor local:

| Variable | Local | Producción |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3000/api` | `https://api.tudominio.mx/api` |
| `CORS_ORIGIN` | `http://localhost:3001` | `https://tudominio.mx` |
| `SEED_ADMIN_PASSWORD` | `Tijuana123?` | una contraseña nueva |

`NEXT_PUBLIC_API_URL` se incrusta durante la compilación de Next.js y la resuelve el navegador
del usuario, no el contenedor. **Cambiarla exige reconstruir la imagen `web`**: un
*Redeploy* que solo reinicie contenedores dejará el front-end apuntando a `localhost` y todas
las llamadas fallarán. En Dokploy usa *Rebuild*, o `docker compose up --build`.

Si `CORS_ORIGIN` no coincide con el dominio real del front-end, el navegador bloqueará cada
petición con un error de CORS aunque la API responda correctamente.

### Dominios y puertos

MariaDB está publicada como `127.0.0.1:3307:3306`, es decir, accesible solo desde el propio
servidor. No la expongas al exterior. En Dokploy asigna un dominio al servicio `web` (puerto
interno 3001) y otro al servicio `api` (puerto interno 3000); Traefik se encarga del TLS y del
enrutamiento.

Los `container_name` fijos del compose pueden chocar si despliegas varias instancias en el mismo
servidor. Si eso ocurre, elimina esas tres líneas y deja que Docker genere los nombres.

---

## 9. Notas del equipo

**Sobre la estructura.** El diccionario de datos quedó congelado por acuerdo del equipo, así que
el estado de la vacante, el convenio, los reportes y las notificaciones se derivan de los datos
existentes en lugar de agregar tablas. El detalle de cada decisión está en el README principal,
en la sección "Decisiones de diseño". Si en algún momento se autoriza tocar el diccionario, lo
primero que conviene agregar es una tabla de documentos (para el CV), una de bitácora y una de
historial de resoluciones con fecha.

**Sobre `schema.sql`.** Se conserva como DDL de referencia porque refleja el diccionario tal
como se entregó. Sin embargo, quien crea el esquema en tiempo de ejecución es
`prisma db push` a partir de `schema.prisma`. Si modificas uno, actualiza el otro. El único
cambio respecto al diccionario original es que los `BIT` se declaran `TINYINT(1)`, que es el
tipo booleano real de MariaDB y el que Prisma mapea a `Boolean`.

**Sobre el rol de Vinculación.** Es el rol administrador del sistema y el único que omite las
verificaciones de pertenencia, por diseño: necesita ver todos los expedientes, todas las empresas
y todas las postulaciones. No existe registro público para este rol; la cuenta `admin` se crea
desde el seed y desde ella se asignan más administradores con el módulo de usuarios.

**Sobre el middleware del front-end.** `middleware.ts` solo mejora la navegación redirigiendo
según la cookie de rol. **No es una frontera de seguridad**: quien manipule esa cookie llegará a
la pantalla, pero la API rechazará cada llamada. Toda la autorización real vive en el back-end.

**Sobre las contraseñas.** Se almacenan con bcrypt (10 rondas). La columna del diccionario se
llama `Usuario_Contraseña`, con eñe y acento; se respetó tal cual, por lo que la base usa
`utf8mb4` y conviene no renombrarla.

**Pendientes sugeridos.** Refresh tokens, paginación en los listados (hoy devuelven todo),
carga de archivos para el CV y notificaciones por correo. Nada de eso bloquea la entrega.

---

## 9. Notas sobre cambios recientes

### Diseño responsivo

Los tres paneles (aspirante, empresa y vinculación) funcionan desde 320 px de ancho.

- La estructura común vive en `components/shared/app-shell.tsx`. Los layouts de cada grupo de
  rutas solo le pasan el título y los elementos de menú, así que siguen siendo componentes de
  servidor.
- El menú lateral es una columna fija a partir del breakpoint `lg` y un cajón deslizable por
  debajo, con overlay, cierre con Escape y bloqueo del scroll de fondo.
- `DataTable` muestra la tabla habitual desde `md` y convierte cada registro en una tarjeta
  apilada en pantallas menores. Su interfaz no cambió, así que las páginas que lo usan no
  requirieron modificaciones.
- En `globals.css` se fuerza `font-size: 16px` en campos de formulario por debajo de 640 px:
  iOS hace zoom automático al enfocar un campo con fuente menor y eso descuadra el layout.
- Se retiró el bloque `@media (prefers-color-scheme: dark)`. La aplicación asume fondo claro en
  todas sus pantallas y ese bloque dejaba texto gris sobre negro en dispositivos con modo
  oscuro activado.

### Validación de fechas de entrevista

`notificarEntrevistaSchema` antes aceptaba cualquier texto no vacío. Ahora verifica que la cadena
sea interpretable por `Date.parse` y que corresponda a un momento futuro. El formulario del
front-end también aplica el atributo `min` en el campo `datetime-local`, pero la validación que
cuenta es la del servidor.

### Ciclos escolares

El catálogo pasó de cuatrimestres (`2025-1`, `2025-2`, ...) a generaciones de cuatro años
(`2023-2027`, `2024-2028`, ...), generadas por `buildCiclosEscolares()` en `prisma/seed.ts`.

El rango va de `CICLO_PRIMER_ANIO` (2018) al año actual más uno, y todas las generaciones quedan
activas. `CatalogosService.getCiclosEscolares()` filtra por `CicloEscolar_Activo`, y ese catálogo
alimenta el registro de aspirantes: si solo se sembraran generaciones recientes, un egresado no
podría seleccionar la suya. Ajusta `CICLO_PRIMER_ANIO` si necesitas otro punto de partida.

### Personal de Control Escolar

Se agregó el rol `Control Escolar` (id 4) y el endpoint `POST /api/usuarios/personal`, restringido
a Vinculación, que crea la cuenta, el registro de persona y la asignación de rol en una sola
transacción. El formulario correspondiente está en `/vinculacion/usuarios`. El endpoint solo acepta
los roles `Control Escolar` y `Vinculacion`; cualquier otro devuelve 400.

Control Escolar **comparte el panel de vinculación** con el menú filtrado, en lugar de tener una
sección propia. Ve únicamente Reportes, Aspirantes y Catálogos. El filtrado del menú ocurre en
`app/(vinculacion)/layout.tsx` leyendo la cookie de rol; el bloqueo real está en `middleware.ts`
y en los `authorizeRoles` de las rutas del back-end.

| Recurso | Vinculación | Control Escolar |
|---|---|---|
| Expedientes de aspirantes (lectura y edición) | Sí | Sí |
| Reportes e indicadores | Sí | Sí |
| Catálogos | Sí | Sí |
| Empresas, convenios, vacantes, postulaciones | Sí | No |
| Administración de usuarios | Sí | No |
