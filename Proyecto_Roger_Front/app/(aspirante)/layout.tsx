import { Navbar } from '@/components/shared/navbar';
import { Sidebar } from '@/components/shared/sidebar';

const navItems = [
  { label: 'Mi panel', href: '/aspirante' },
  { label: 'Buscar vacantes', href: '/aspirante/vacantes' },
  { label: 'Mis postulaciones', href: '/aspirante/postulaciones' },
  { label: 'Mi perfil', href: '/aspirante/perfil' },
];

export default function AspiranteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar roleTitle="Aspirante" />
      <div className="flex">
        <Sidebar items={navItems} />
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
