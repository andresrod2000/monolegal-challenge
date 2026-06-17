'use client';

import { useMemo, useState } from 'react';
import { ALL_INVOICE_STATUSES, InvoiceStatus } from '@/lib/invoice-status';
import { InvoiceTable } from '@/components/InvoiceTable';
import { KpiCard } from '@/components/KpiCard';
import { StatusFilterBar } from '@/components/StatusFilter';
import { useInvoices } from '@/hooks/useInvoices';
import type { StatusFilter } from '@/types/invoice';

export default function DashboardPage() {
  const { invoices, loading, error, refetch } = useInvoices();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const statusCounts = useMemo(() => {
    const counts: Record<InvoiceStatus, number> = {
      [InvoiceStatus.AL_DIA]: 0,
      [InvoiceStatus.PRIMER_RECORDATORIO]: 0,
      [InvoiceStatus.SEGUNDO_RECORDATORIO]: 0,
      [InvoiceStatus.DESACTIVADO]: 0,
    };
    for (const invoice of invoices) {
      counts[invoice.status]++;
    }
    return counts;
  }, [invoices]);

  const filteredInvoices = useMemo(() => {
    if (statusFilter === 'all') return invoices;
    return invoices.filter((inv) => inv.status === statusFilter);
  }, [invoices, statusFilter]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wider text-indigo-400">
              Monolegal
            </p>
            <h1 className="mt-1 text-3xl font-bold text-white sm:text-4xl">
              Dashboard de Facturación
            </h1>
            <p className="mt-2 text-slate-400">
              Resumen de facturas y estados de recordatorio
            </p>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={loading}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Actualizando…' : 'Actualizar'}
          </button>
        </header>

        {error && (
          <div className="mb-6 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-rose-300">
            {error}
          </div>
        )}

        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ALL_INVOICE_STATUSES.map((status) => (
            <KpiCard
              key={status}
              status={status}
              count={statusCounts[status]}
              active={statusFilter === status}
              onClick={setStatusFilter}
            />
          ))}
        </section>

        <section className="mb-6">
          <StatusFilterBar value={statusFilter} onChange={setStatusFilter} />
        </section>

        <section>
          {loading && invoices.length === 0 ? (
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-12 text-center text-slate-400">
              Cargando facturas…
            </div>
          ) : (
            <InvoiceTable invoices={filteredInvoices} />
          )}
        </section>

        <footer className="mt-8 text-center text-sm text-slate-500">
          {filteredInvoices.length} de {invoices.length} facturas mostradas
        </footer>
      </div>
    </main>
  );
}
