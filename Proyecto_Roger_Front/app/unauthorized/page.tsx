import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-900 p-6 text-center text-white">
      <h1 className="text-2xl font-bold sm:text-3xl">Acceso no autorizado</h1>
      <p className="text-slate-300">
        Tu cuenta no tiene permisos para consultar esta sección del portal.
      </p>
      <Link
        href="/login"
        className="rounded-lg bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-700"
      >
        Volver al inicio de sesión
      </Link>
    </div>
  );
}
