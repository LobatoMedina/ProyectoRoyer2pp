import { cookies } from 'next/headers';
import { AppShell } from '@/components/shared/app-shell';

/**
 * Control Escolar comparte este panel con la Coordinación de Vinculación,
 * pero solo ve las secciones relacionadas con expedientes de estudiantes.
 * El menú se filtra aquí y el acceso real se bloquea en `middleware.ts`.
 */
const navItems = [
  { label: 'Reportes', href: '/vinculacion', roles: ['vinculacion', 'control-escolar'] },
  { label: 'Aspirantes', href: '/vinculacion/aspirantes', roles: ['vinculacion', 'control-escolar'] },
  { label: 'Empresas', href: '/vinculacion/empresas', roles: ['vinculacion'] },
  { label: 'Convenios', href: '/vinculacion/convenios', roles: ['vinculacion'] },
  { label: 'Vacantes', href: '/vinculacion/vacantes', roles: ['vinculacion'] },
  { label: 'Postulaciones', href: '/vinculacion/postulaciones', roles: ['vinculacion'] },
  { label: 'Usuarios', href: '/vinculacion/usuarios', roles: ['vinculacion'] },
  { label: 'Catálogos', href: '/vinculacion/catalogos', roles: ['vinculacion', 'control-escolar'] },
];

export default async function VinculacionLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const role = cookieStore.get('role')?.value ?? 'vinculacion';

  const items = navItems
    .filter((item) => item.roles.includes(role))
    .map(({ label, href }) => ({ label, href }));

  const roleTitle = role === 'control-escolar' ? 'Control Escolar' : 'Vinculación';

  return (
    <AppShell roleTitle={roleTitle} navItems={items}>
      {children}
    </AppShell>
  );
}
