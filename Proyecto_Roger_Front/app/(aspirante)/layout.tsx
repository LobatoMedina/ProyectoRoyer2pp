import { AppShell } from '@/components/shared/app-shell';

const navItems = [
  { label: 'Mi panel', href: '/aspirante' },
  { label: 'Buscar vacantes', href: '/aspirante/vacantes' },
  { label: 'Mis postulaciones', href: '/aspirante/postulaciones' },
  { label: 'Mi perfil', href: '/aspirante/perfil' },
];

export default function AspiranteLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell roleTitle="Aspirante" navItems={navItems}>
      {children}
    </AppShell>
  );
}
