import { Navbar } from '@/components/shared/navbar';
import { Sidebar } from '@/components/shared/sidebar';

const navItems = [
  { label: 'Reportes', href: '/vinculacion' },
  { label: 'Aspirantes', href: '/vinculacion/aspirantes' },
  { label: 'Empresas', href: '/vinculacion/empresas' },
  { label: 'Convenios', href: '/vinculacion/convenios' },
  { label: 'Vacantes', href: '/vinculacion/vacantes' },
  { label: 'Postulaciones', href: '/vinculacion/postulaciones' },
  { label: 'Usuarios', href: '/vinculacion/usuarios' },
  { label: 'Catálogos', href: '/vinculacion/catalogos' },
];

export default function VinculacionLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar roleTitle="Vinculación" />
      <div className="flex">
        <Sidebar items={navItems} />
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
