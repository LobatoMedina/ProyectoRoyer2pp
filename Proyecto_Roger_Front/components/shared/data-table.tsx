'use client';

import React from 'react';

interface Column<T> {
  header: string;
  accessor: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowKey: (item: T) => string | number;
  emptyMessage?: string;
}

/**
 * A partir de md se muestra la tabla clásica; por debajo cada registro se
 * convierte en una tarjeta apilada para no depender del scroll horizontal.
 * Las columnas sin encabezado (acciones) se agrupan al pie de la tarjeta.
 */
export function DataTable<T>({
  columns,
  data,
  rowKey,
  emptyMessage = 'No hay registros disponibles',
}: DataTableProps<T>) {
  const labelledColumns = columns.filter((column) => column.header.trim() !== '');
  const actionColumns = columns.filter((column) => column.header.trim() === '');

  return (
    <>
      <div className="hidden overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm md:block">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 lg:px-6"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500 lg:px-6">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr key={rowKey(row)} className="hover:bg-gray-50">
                  {columns.map((column, index) => (
                    <td
                      key={index}
                      className="break-words px-4 py-4 align-top text-gray-700 lg:px-6"
                    >
                      {column.accessor(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {data.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-sm text-gray-500 shadow-sm">
            {emptyMessage}
          </div>
        ) : (
          data.map((row) => (
            <div
              key={rowKey(row)}
              className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
            >
              <dl className="space-y-3">
                {labelledColumns.map((column, index) => (
                  <div key={index}>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                      {column.header}
                    </dt>
                    <dd className="mt-1 break-words text-sm text-gray-700">
                      {column.accessor(row)}
                    </dd>
                  </div>
                ))}
              </dl>

              {actionColumns.length > 0 ? (
                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-gray-100 pt-3">
                  {actionColumns.map((column, index) => (
                    <React.Fragment key={index}>{column.accessor(row)}</React.Fragment>
                  ))}
                </div>
              ) : null}
            </div>
          ))
        )}
      </div>
    </>
  );
}
