import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Portal de Vinculación y Bolsa de Trabajo',
  description: 'Gestión de vinculación universitaria, aspirantes y empresas',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
