# CLAUDE.md

Context for AI agents working on this repository. Written in English on purpose; the product
UI, database identifiers and user-facing copy are in Spanish and must stay that way.

## What this is

A university job board ("Bolsa de Trabajo Universitaria") for a Mexican university. It
centralises companies, vacancies, applications and users so that internships, social service,
professional residencies and graduate jobs stop being managed through email, spreadsheets and
messaging groups.

Two independent projects, each with its own git repository, orchestrated by a single
`docker-compose.yml` at the workspace root (the deployment target is Dokploy).

```
.
├── docker-compose.yml          # mariadb + api + web
├── .env                        # secrets consumed by compose (generated, replace before deploy)
├── Bolsa de trabajo/           # backend  — Express + TypeScript + Prisma + MariaDB
└── Proyecto_Roger_Front/       # frontend — Next.js 16 (App Router) + Tailwind 4
```

The split is intentional: the backend owns all writes and business rules, the frontend is a
read/command client. Treat the API as the only source of truth. Never let the frontend compute
business state (vacancy status, agreement status, permissions) on its own.

## Conventions that must be preserved

- **Code identifiers in English, camelCase.** Functions, variables, hooks, props, files in
  `lib/`. Classes are PascalCase, service classes end in `Service`.
- **Database identifiers stay exactly as the data dictionary defines them.** Tables use the
  `tbl_ope_*` (operational), `tbl_cat_*` (catalogue), `tbl_rel_*` (relational) prefixes;
  columns use `Entidad_Campo`. These appear verbatim in Prisma models, API payloads and
  frontend types. Do not "clean them up".
- **The data dictionary is frozen.** No new tables, no new columns. If a requirement seems to
  need one, derive it from existing data instead (see "Design decisions" below) or raise it
  with the team.
- **No code comments.** The team asked for comment-free source. Express intent through naming
  and small functions.
- **Spanish for anything a user reads**: labels, validation messages, API error strings.

## Backend — `Bolsa de trabajo/`

Layered architecture. Dependencies point inward: Presentation → Application → Domain, with
Infrastructure providing Prisma and security primitives.

```
src/
├── Domain/
│   ├── Enums/         Roles, Resolutions, VacancyStatus, AgreementStatus
│   └── Errors/        HttpError (statusCode + message)
├── Application/
│   ├── Dtos/          types inferred from the zod schemas — do not hand-write these
│   ├── Validation/    Schemas.ts, single source of request validation
│   └── Services/      all business logic lives here
├── Infrastructure/
│   ├── prisma.ts      singleton client
│   └── Security/      JwtService, PasswordHasher (bcryptjs)
└── Presentation/
    ├── Controllers/   thin: parse params, call service, send status + json
    ├── Middlewares/   AuthMiddleware, ValidationMiddleware, ErrorHandler
    ├── Routes/        one file per module, mounted in Routes/index.ts under /api
    └── index.ts       express app, cors, error handling
```

Rules when adding an endpoint:

1. Add the zod schema to `Application/Validation/Schemas.ts` and export its inferred type from
   `Application/Dtos/index.ts`.
2. Put the logic in a service. Controllers must not touch Prisma.
3. Wire the route with `authenticateJWT`, `authorizeRoles(...)`, `requireActiveAccount` (for
   any write), and `validateBody` / `validateQuery`.
4. Enforce ownership through `IdentityService`. Never trust an id from the request body to
   decide what a company or applicant may touch — resolve it from the JWT.
5. Throw `HttpError`; the central `errorHandler` formats it and maps Prisma codes
   (P2002 → 409, P2003/P2025 → 400).

`IdentityService` is the security backbone: `getAspiranteIdByUserId`, `getEmpresaIdByUserId`,
`resolveEmpresaId`, `assertEmpresaAccess`, `assertVacanteAccess`, `assertAspiranteAccess`,
`assertPostulacionAccess`. Vinculación bypasses ownership checks by design; every other role
is scoped to its own records.

### Roles

`Aspirante`, `Empresa`, `Vinculacion` — stored in `tbl_cat_Rol`, carried in the JWT payload as
`roles: string[]`. A user can hold several. `Vinculacion` is the administrator role; the seed
always creates one such account (`SEED_ADMIN_USER`, default `admin`) with a bcrypt-hashed
password from `SEED_ADMIN_PASSWORD`. There is no public sign-up for it. The frontend cookie uses lowercase slugs
(`aspirante`, `empresa`, `vinculacion`) for middleware routing only.

## Frontend — `Proyecto_Roger_Front/`

Next.js App Router with three route groups: `(auth)`, `(aspirante)`, `(empresa)`,
`(vinculacion)`. Pages that fetch data are client components.

- `lib/api.ts` — the only place that calls `fetch`. Grouped clients: `authApi`, `catalogApi`,
  `aspiranteApi`, `empresaApi`, `vacanteApi`, `postulacionApi`, `reporteApi`, `usuarioApi`,
  `notificacionApi`. Throws `ApiError`; a 401 clears the session and redirects to `/login`.
- `lib/types.ts` — mirrors API responses, using the database's column names.
- `lib/useApi.ts` — `useApi(loader, deps)` returns `{ data, loading, error, reload }`. Use it
  for every read instead of ad-hoc `useEffect` + `fetch`.
- `lib/auth.ts` — session in `localStorage` plus `token` / `role` cookies (the cookies exist so
  `middleware.ts` can gate routes on the edge).
- `middleware.ts` — redirects unauthenticated users to `/login` and mismatched roles to
  `/unauthorized`. It is a convenience layer, not a security boundary; the API enforces access.

Visual language already established, keep it: `bg-gray-50` page background, white cards with
`border-gray-200`, `bg-slate-900` sidebar, `bg-blue-600` primary actions, Tailwind utility
classes only. Shared pieces live in `components/shared/` (`Navbar`, `Sidebar`, `DataTable`,
`StatusBadge`, and the `feedback.tsx` set: `Loading`, `ErrorMessage`, `SuccessMessage`,
`EmptyState`, `PageHeader`, `StatCard`).

## Design decisions worth knowing before you change things

The data dictionary is frozen, so three requirements are satisfied by derivation rather than
by new tables. Changing any of these silently breaks the requirement traceability:

- **Vacancy status** (`Abierta` / `En proceso` / `Cerrada`) is computed in `VacanteService`,
  not stored. `Vacante_Activa` is a boolean and cannot express three states. Closed when the
  flag is false or every position has been filled; in process when live applications exist;
  open otherwise. `closeIfFilled` flips the flag once hires reach `Vacante_Vacantes`.
- **Company agreement** (`convenio`) maps onto `Usuario_Activo` of the company's user account.
  Registration leaves it `false` (Pendiente); the company accepting the agreement sets it
  `true` (Vigente). `requireActiveAccount` therefore blocks every write for companies without
  an agreement, and doubles as the "authorised users" control Vinculación needs.
- **Reports and notifications** are query-time aggregations over existing tables
  (`ReporteService`, `NotificacionService`). Nothing is persisted.

Also deliberate: companies publish their own vacancies (Vinculación is no longer a bottleneck);
duplicate active vacancies with the same title per company are rejected with 409; applicants
can filter vacancies by their own career with `?soloMiPerfil=true`.

## Running it

```bash
docker compose up --build          # from the workspace root
```

Backend on `:3000`, frontend on `:3001`, MariaDB on `:3307`. The API container runs
`prisma db push` then the seed on start, so the schema and catalogues are always in place.
`prisma/schema.sql` is the reference DDL that matches the data dictionary; Prisma is what
actually creates the schema at runtime.

Local development without Docker: `docker compose up -d` inside `Bolsa de trabajo/` starts only
MariaDB, then `npm run dev` in each project.

## Checks before you hand work back

```bash
cd "Bolsa de trabajo" && npx tsc --noEmit
cd Proyecto_Roger_Front && npx tsc --noEmit && npx next build
```

Both must pass clean. `npm test` in the backend runs the Jest suite against the Express app.

## Git

Two separate repositories — commit inside each project directory, never from the root. Work
happens on feature branches; `feature/integracion-cqrs` holds the current integration work.
