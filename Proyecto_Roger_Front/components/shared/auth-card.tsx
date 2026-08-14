import React from 'react';

/**
 * Tarjeta contenedora de las pantallas de acceso.
 * Los formularios largos usan `wide` para poder repartirse en dos columnas
 * en tablet y escritorio sin quedar comprimidos.
 */
export const AuthCard = ({
  children,
  wide = false,
}: {
  children: React.ReactNode;
  wide?: boolean;
}) => (
  <div
    className={`w-full rounded-xl border border-slate-200 bg-white p-6 shadow-md sm:p-8 ${
      wide ? 'max-w-md md:max-w-2xl' : 'max-w-md'
    }`}
  >
    {children}
  </div>
);
