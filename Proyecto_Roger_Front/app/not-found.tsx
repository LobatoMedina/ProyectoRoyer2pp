import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-6xl font-bold text-gray-800">404</h1>
      <p className="text-xl text-gray-600 mt-2">Página no encontrada</p>
      <Link href="/" className="mt-6 text-blue-600 underline font-medium">
        Volver al Inicio
      </Link>
    </div>
  );
}
