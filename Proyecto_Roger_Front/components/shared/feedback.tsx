import React from 'react';

export const Loading = ({ label = 'Cargando información...' }: { label?: string }) => (
  <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-500">
    <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
    {label}
  </div>
);

export const ErrorMessage = ({ message }: { message: string }) => (
  <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
    {message}
  </div>
);

export const SuccessMessage = ({ message }: { message: string }) => (
  <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
    {message}
  </div>
);

export const EmptyState = ({ message }: { message: string }) => (
  <div className="rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-500">
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
  <div className="flex flex-wrap items-start justify-between gap-4">
    <div>
      <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
      {description ? <p className="mt-1 text-sm text-gray-500">{description}</p> : null}
    </div>
    {action}
  </div>
);

export const StatCard = ({ label, value, hint }: { label: string; value: React.ReactNode; hint?: string }) => (
  <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
    <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
    {hint ? <p className="mt-1 text-xs text-gray-500">{hint}</p> : null}
  </div>
);
