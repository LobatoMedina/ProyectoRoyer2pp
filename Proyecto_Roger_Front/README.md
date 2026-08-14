# Bolsa de Trabajo — Front-end

Portal web de la Bolsa de Trabajo Universitaria: **Next.js 16 (App Router) · React 19 · Tailwind 4**.

La descripción del problema, la solución y las instrucciones de instalación están en la raíz del
espacio de trabajo: `README.md` y `README.INSTALACION.md`.

## Estructura

```
app/
├── (auth)/          Login y registro de aspirantes y empresas
├── (aspirante)/     Panel, búsqueda de vacantes, postulaciones y perfil
├── (empresa)/       Panel, vacantes, postulantes, convenio y perfil
└── (vinculacion)/   Reportes, aspirantes, empresas, convenios, vacantes, usuarios y catálogos

components/
├── forms/           Formularios reutilizables
└── shared/          Navbar, Sidebar, DataTable, StatusBadge y componentes de estado

lib/
├── api.ts           Único punto de contacto con la API
├── auth.ts          Sesión en cookies y localStorage
├── types.ts         Tipos alineados con las respuestas de la API
├── useApi.ts        Hook de carga de datos
└── constants.ts     Constantes y formateadores
```

## Ejecución

```bash
cp .env.example .env.local
npm install
npm run dev          # http://localhost:3001
```

Requiere la API corriendo en la URL indicada por `NEXT_PUBLIC_API_URL`.

## Notas

- `middleware.ts` redirige según la cookie de rol. Es una ayuda de navegación, no una frontera
  de seguridad: la autorización real la aplica la API en cada petición.
- Las páginas que consumen datos son componentes de cliente y usan el hook `useApi`.
- Identificadores en inglés y camelCase; los textos visibles para el usuario, en español.
