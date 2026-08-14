# Bolsa de Trabajo Universitaria

Aplicación web para centralizar la administración de empresas, vacantes, postulaciones y
usuarios de la Coordinación de Vinculación Universitaria.

---

## 1. El problema

La universidad mantiene convenios con diversas empresas que ofrecen constantemente vacantes
para prácticas profesionales, servicio social, residencias e incluso empleos para egresados.
Sin embargo, esas oportunidades se administran por correo electrónico, hojas de cálculo, redes
sociales y grupos de mensajería, lo que ha generado ocho dificultades concretas:

1. Información desactualizada o duplicada sobre las vacantes disponibles.
2. Dificultad para que estudiantes y egresados encuentren oportunidades acordes con su perfil académico.
3. Falta de control sobre las postulaciones realizadas por los candidatos.
4. Escaso seguimiento al estado de las vacantes (abierta, en proceso o cerrada).
5. Dificultad para que las empresas administren sus ofertas de empleo.
6. Ausencia de reportes que permitan conocer la demanda de vacantes, áreas de mayor interés o niveles de participación.
7. Poco control sobre los usuarios autorizados para publicar y administrar la información.
8. Procesos lentos de comunicación entre empresas, universidad y aspirantes.

### Actores

| Actor | Rol en el sistema |
|---|---|
| **Aspirante** | Estudiante o egresado. Explora vacantes acordes a su carrera, se postula y da seguimiento a su proceso. |
| **Representante de Empresa** | Publica y administra las vacantes de su empresa, revisa postulantes, agenda entrevistas y contrata. |
| **Equipo de Vinculación** | Gestiona convenios, canaliza aspirantes, supervisa vacantes, controla usuarios autorizados y consulta reportes. |

### Cadena de valor

`Gestión de aspirantes → Gestión de empresas → Gestión de vacantes → Gestión de postulaciones → Selección de aspirantes → Seguimiento y contratación`

Al implementarla se identificaron dos unidades funcionales adicionales que el enunciado exige
y que la cadena original no contemplaba: **control de usuarios autorizados** y **reportes e
indicadores**. Ambas están resueltas en el sistema.

---

## 2. La solución

Dos proyectos independientes que se despliegan juntos con un solo `docker compose up`:

```
┌──────────────────────┐      HTTP/JSON      ┌──────────────────────┐      SQL       ┌──────────┐
│  Proyecto_Roger_Front│ ──── Bearer JWT ──> │   Bolsa de trabajo   │ ──── Prisma ─> │ MariaDB  │
│  Next.js 16 · :3001  │                     │  Express + TS · :3000│                │  :3307   │
└──────────────────────┘                     └──────────────────────┘                └──────────┘
```

La separación sigue un enfoque tipo CQRS: el back-end concentra las reglas de negocio y toda
escritura; el front-end es un cliente de lectura y comandos que nunca calcula estado de negocio
por su cuenta.

### Cómo se resuelve cada problema

| # | Problema | Solución implementada |
|---|---|---|
| 1 | Información duplicada o desactualizada | Fuente única en MariaDB. Se rechaza (409) publicar dos vacantes activas con el mismo nombre en la misma empresa. Restricciones `UNIQUE` en RFC, CURP y en las tablas relacionales. |
| 2 | Oportunidades acordes al perfil | `GET /api/vacantes?soloMiPerfil=true` filtra por la carrera del aspirante autenticado. La búsqueda también admite carrera, turno, tipo de vacante, rango salarial y texto libre. |
| 3 | Control de postulaciones | `tbl_ope_Postulacion` con estado, fecha y bandera de vigencia. Se impide postularse dos veces a la misma vacante y postularse a vacantes cerradas. El aspirante puede cancelar. |
| 4 | Estado de la vacante | Estado calculado en cada consulta: **Abierta**, **En proceso** o **Cerrada**, además de plazas disponibles y total de postulaciones. Al completarse las plazas la vacante se cierra sola. |
| 5 | Las empresas administran sus ofertas | La empresa publica, edita, cierra y reabre sus propias vacantes, y gestiona el proceso de selección completo. Ya no depende de que Vinculación suba la información. |
| 6 | Reportes | Módulo `/api/reportes`: resumen general, vacantes por carrera, demanda por carrera, embudo por resolución, participación por empresa y vacantes más demandadas. |
| 7 | Usuarios autorizados | Autenticación JWT con contraseñas bcrypt, autorización por rol en cada ruta y módulo `/api/usuarios` donde el administrador activa, desactiva y asigna roles. El seed crea la cuenta administradora `admin`; las cuentas de empresa nacen sin autorización hasta que el convenio queda vigente. |
| 8 | Comunicación lenta | Módulo `/api/notificaciones`: cada rol recibe su propio feed (cambios de estado para el aspirante, nuevos postulantes para la empresa, pendientes de canalización y convenios sin firmar para Vinculación). La notificación de entrevista queda registrada en el proceso. |

### Decisiones de diseño

La estructura del diccionario de datos quedó congelada, así que tres requisitos se resolvieron
**sin agregar tablas ni columnas**:

- **Estado de la vacante.** `Vacante_Activa` es booleano y no puede representar tres estados,
  por lo que el estado se **deriva**: cerrada si la bandera es falsa o si ya se cubrieron todas
  las plazas; en proceso si hay postulaciones vivas; abierta en cualquier otro caso.
- **Convenio universidad–empresa.** Se mapea sobre `Usuario_Activo` de la cuenta de la empresa.
  Al registrarse queda en *Pendiente*; cuando la empresa acepta el convenio pasa a *Vigente*.
  Esto reproduce exactamente el flujo de la matriz de actores (Vinculación solicita → la empresa
  acepta) y, de paso, resuelve el control de usuarios autorizados: una cuenta inactiva puede
  entrar al sistema pero no puede escribir nada.
- **Reportes y notificaciones.** Se calculan por consulta sobre las tablas existentes; no se
  persiste nada nuevo.

Lo que sí queda fuera de alcance por la misma restricción, y conviene documentarlo ante el
cliente: no hay almacenamiento de CV en archivo, ni bitácora de auditoría, ni historial de
cambios de estado con fecha por cada transición. Las tres requerirían tablas nuevas.

### Incongruencias corregidas del material entregado

| Origen | Incongruencia | Corrección |
|---|---|---|
| Documentación de API | El endpoint de convenios recibía `documentoUrl`, campo que no existe en el diccionario | Se sustituye por `observaciones`; el estado del convenio se persiste sobre `Usuario_Activo` |
| Documentación de API | `POST /api/vacantes` no incluía `carreraTargetId`, que es obligatorio en la base | Se agregó al contrato; `empresaId` es opcional y se ignora cuando quien publica es la propia empresa |
| Backend | `EmpresaService` respondía convenios con objetos simulados, sin tocar la base | Convenios persistidos y consultables |
| Backend | Cualquier empresa podía editar vacantes de otra, y cualquier aspirante el expediente de otro | `IdentityService` valida pertenencia en cada operación |
| Backend | Sin CORS: el front-end no podía consumir la API | `cors` configurado por `CORS_ORIGIN` |
| Backend | DTOs sin validación en tiempo de ejecución | Validación con `zod` en cada request |
| Backend | El login rechazaba cuentas inactivas, impidiendo a una empresa aceptar su propio convenio | Se permite iniciar sesión; se bloquean las escrituras |
| Front-end | Login simulado con `token=fake-jwt-token` y todas las pantallas con datos falsos | Autenticación real y todas las vistas conectadas a la API |
| Base de datos | Columnas booleanas declaradas como `BIT`, que Prisma no mapea a `Boolean` | `TINYINT(1)`, equivalente booleano en MariaDB |
| Base de datos | Sin unicidad en RFC ni en las tablas relacionales | Restricciones `UNIQUE` agregadas |

---

## 3. Módulos de la API

| Módulo | Prefijo | Descripción |
|---|---|---|
| Salud | `/` | Estado del servidor |
| Autenticación | `/api/auth` | Login, registro de aspirantes y empresas, perfil actual |
| Catálogos | `/api/catalogos` | Tablas maestras |
| Aspirantes | `/api/aspirantes` | Expedientes, perfiles y contactos |
| Empresas | `/api/empresas` | Información de empresas y convenios |
| Vacantes | `/api/vacantes` | Ofertas de empleo |
| Postulaciones | `/api/postulaciones` | Flujo de solicitudes, selección y contratación |
| Reportes | `/api/reportes` | Indicadores para Vinculación |
| Usuarios | `/api/usuarios` | Control de usuarios y roles |
| Notificaciones | `/api/notificaciones` | Avisos derivados según el rol |

El contrato completo de rutas, peticiones y respuestas está en `Bolsa de trabajo/api-tests.http`.

---

## 4. Flujo funcional

1. La empresa se registra. Su cuenta queda **Pendiente**.
2. Vinculación emite la solicitud de convenio desde su panel.
3. La empresa acepta el convenio y su cuenta pasa a **Vigente**, habilitando la publicación.
4. La empresa publica una vacante dirigida a una carrera concreta.
5. El aspirante la encuentra filtrando por su perfil y se postula. La postulación nace *En revisión*.
6. Vinculación revisa y **canaliza** al aspirante hacia la empresa.
7. La empresa analiza el perfil, agenda entrevista, aplica pruebas y **contrata**.
8. Al cubrirse todas las plazas, la vacante se cierra automáticamente.
9. Vinculación consulta en todo momento los reportes de demanda y participación.

---

## 5. Puesta en marcha

Consulta **[README.INSTALACION.md](./README.INSTALACION.md)** para la instalación, las variables
de entorno, las cuentas de prueba y las notas técnicas del equipo.
