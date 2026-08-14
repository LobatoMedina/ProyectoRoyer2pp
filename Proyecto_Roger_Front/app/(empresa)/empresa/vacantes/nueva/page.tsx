'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ApiError, vacanteApi } from '@/lib/api';
import { ErrorMessage, PageHeader } from '@/components/shared/feedback';
import { VacanteForm, VacanteFormValues } from '@/components/forms/vacante-form';

export default function NuevaVacantePage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: VacanteFormValues) => {
    setError(null);

    try {
      await vacanteApi.create({ ...values, observaciones: values.observaciones || undefined });
      router.push('/empresa/vacantes');
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'No fue posible publicar la vacante.');
    }
  };

  return (
    <div className="space-y-6">
      <Link href="/empresa/vacantes" className="text-sm text-blue-600 hover:underline">
        ← Volver a mis vacantes
      </Link>

      <PageHeader
        title="Publicar vacante"
        description="La oferta será visible para los aspirantes de la carrera seleccionada"
      />

      {error ? <ErrorMessage message={error} /> : null}

      <VacanteForm submitLabel="Publicar vacante" onSubmit={handleSubmit} />
    </div>
  );
}
