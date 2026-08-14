import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 p-6 text-white">
      <div className="w-full max-w-2xl space-y-6 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
          Portal de Vinculación y Bolsa de Trabajo
        </h1>
        <p className="text-base text-slate-300 sm:text-lg">
          Un solo lugar para publicar vacantes, postularse y dar seguimiento a los procesos entre la
          universidad, las empresas con convenio y la comunidad universitaria.
        </p>
        <div className="flex flex-col justify-center gap-3 pt-4 sm:flex-row sm:gap-4">
          <Link
            href="/login"
            className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Iniciar Sesión
          </Link>
          <Link
            href="/registro"
            className="rounded-lg border border-slate-700 bg-slate-800 px-6 py-3 font-semibold text-white transition hover:bg-slate-700"
          >
            Registrarse
          </Link>
        </div>
      </div>
    </div>
  );
}
