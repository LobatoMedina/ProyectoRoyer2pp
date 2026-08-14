import { Navbar } from '@/components/shared/navbar';
import { Sidebar } from '@/components/shared/sidebar';

const navItems = [
  { label: 'Panel', href: '/empresa' },
  { label: 'Mis vacantes', href: '/empresa/vacantes' },
  { label: 'Convenio', href: '/empresa/convenio' },
  { label: 'Perfil', href: '/empresa/perfil' },
];

export default function EmpresaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar roleTitle="Empresa" />
      <div className="flex">
        <Sidebar items={navItems} />
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
