import Link from 'next/link';

export default function RegistroPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Crear cuenta</h2>
        <p className="mt-1 text-sm text-gray-500">Selecciona el tipo de cuenta que necesitas</p>
      </div>

      <div className="space-y-3">
        <Link
          href="/registro/aspirante"
          className="block rounded-lg border border-gray-200 p-4 transition hover:border-blue-400 hover:bg-blue-50"
        >
          <p className="font-semibold text-gray-900">Soy estudiante o egresado</p>
          <p className="text-sm text-gray-500">
            Consulta vacantes acordes a tu carrera y da seguimiento a tus postulaciones.
          </p>
        </Link>

        <Link
          href="/registro/empresa"
          className="block rounded-lg border border-gray-200 p-4 transition hover:border-blue-400 hover:bg-blue-50"
        >
          <p className="font-semibold text-gray-900">Represento a una empresa</p>
          <p className="text-sm text-gray-500">
            Publica y administra tus vacantes una vez que el convenio quede vigente.
          </p>
        </Link>
      </div>

      <p className="text-center text-sm text-gray-500">
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" className="font-medium text-blue-600 hover:underline">
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
