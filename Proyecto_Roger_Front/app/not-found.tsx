import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white p-6 text-center">
      <h1 className="text-5xl font-bold text-gray-800 sm:text-6xl">404</h1>
      <p className="mt-2 text-lg text-gray-600 sm:text-xl">Página no encontrada</p>
      <Link href="/" className="mt-6 text-blue-600 underline font-medium">
        Volver al Inicio
      </Link>
    </div>
  );
}
