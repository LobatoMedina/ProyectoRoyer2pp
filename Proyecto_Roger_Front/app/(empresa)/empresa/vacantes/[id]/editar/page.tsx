'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ApiError, vacanteApi } from '@/lib/api';
import { useApi } from '@/lib/useApi';
import { ErrorMessage, Loading, PageHeader } from '@/components/shared/feedback';
import { VacanteForm, VacanteFormValues } from '@/components/forms/vacante-form';

export default function EditarVacantePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const vacanteId = Number(id);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const vacante = useApi(() => vacanteApi.byId(vacanteId), [vacanteId]);

  const handleSubmit = async (values: VacanteFormValues) => {
    setError(null);

    try {
      await vacanteApi.update(vacanteId, {
        ...values,
        observaciones: values.observaciones || undefined,
      });
      router.push('/empresa/vacantes');
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'No fue posible actualizar la vacante.');
    }
  };

  if (vacante.loading) return <Loading />;
  if (vacante.error) return <ErrorMessage message={vacante.error} />;

  return (
    <div className="space-y-6">
      <Link href="/empresa/vacantes" className="text-sm text-blue-600 hover:underline">
        ← Volver a mis vacantes
      </Link>

      <PageHeader title="Editar vacante" description={vacante.data?.Vacante_Vacante} />

      {error ? <ErrorMessage message={error} /> : null}

      <VacanteForm
        initialValue={vacante.data ?? undefined}
        submitLabel="Guardar cambios"
        onSubmit={handleSubmit}
      />
    </div>
  );
}
