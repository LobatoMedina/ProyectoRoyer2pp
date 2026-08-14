import React from 'react';

export const Loading = ({ label = 'Cargando información...' }: { label?: string }) => (
  <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-500 sm:p-6">
    <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
    {label}
  </div>
);

export const ErrorMessage = ({ message }: { message: string }) => (
  <div className="break-words rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
    {message}
  </div>
);

export const SuccessMessage = ({ message }: { message: string }) => (
  <div className="break-words rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
    {message}
  </div>
);

export const EmptyState = ({ message }: { message: string }) => (
  <div className="rounded-lg border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500 sm:p-10">
    {message}
  </div>
);

export const PageHeader = ({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) => (
  <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between sm:gap-4">
    <div className="min-w-0">
      <h1 className="break-words text-xl font-bold text-gray-800 sm:text-2xl">{title}</h1>
      {description ? <p className="mt-1 text-sm text-gray-500">{description}</p> : null}
    </div>
    {action ? <div className="shrink-0">{action}</div> : null}
  </div>
);

export const StatCard = ({ label, value, hint }: { label: string; value: React.ReactNode; hint?: string }) => (
  <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
    <p className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">{value}</p>
    {hint ? <p className="mt-1 text-xs text-gray-500">{hint}</p> : null}
  </div>
);
