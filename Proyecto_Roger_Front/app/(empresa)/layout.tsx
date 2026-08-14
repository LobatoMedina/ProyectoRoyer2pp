import { AppShell } from '@/components/shared/app-shell';

const navItems = [
  { label: 'Panel', href: '/empresa' },
  { label: 'Mis vacantes', href: '/empresa/vacantes' },
  { label: 'Convenio', href: '/empresa/convenio' },
  { label: 'Perfil', href: '/empresa/perfil' },
];

export default function EmpresaLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell roleTitle="Empresa" navItems={navItems}>
      {children}
    </AppShell>
  );
}
