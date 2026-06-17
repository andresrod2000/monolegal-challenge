'use client';

import { useMemo, useState } from 'react';
import { ALL_INVOICE_STATUSES, InvoiceStatus } from '@/lib/invoice-status';
import { ClientTable } from '@/components/ClientTable';
import { CreateClientModal } from '@/components/CreateClientModal';
import { CreateInvoiceModal } from '@/components/CreateInvoiceModal';
import { EditClientModal } from '@/components/EditClientModal';
import { EditInvoiceModal } from '@/components/EditInvoiceModal';
import { InvoiceTable } from '@/components/InvoiceTable';
import { KpiCard } from '@/components/KpiCard';
import { StatusFilterBar } from '@/components/StatusFilter';
import {
  createClient,
  deleteClient,
  updateClient,
  useClients,
} from '@/hooks/useClients';
import {
  createInvoice,
  updateInvoice,
  useInvoices,
} from '@/hooks/useInvoices';
import { useProcessReminders } from '@/hooks/useProcessReminders';
import type { Client } from '@/types/client';
import type { Invoice, StatusFilter } from '@/types/invoice';

type Tab = 'invoices' | 'clients';

export default function DashboardPage() {
  const { invoices, loading: invoicesLoading, error: invoicesError, refetch: refetchInvoices } =
    useInvoices();
  const { clients, loading: clientsLoading, error: clientsError, refetch: refetchClients } =
    useClients();
  const {
    loading: remindersLoading,
    processingInvoiceId,
    error: remindersError,
    result: remindersResult,
    execute: executeReminders,
    executeForInvoice,
  } = useProcessReminders();

  const [tab, setTab] = useState<Tab>('invoices');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [showCreateClient, setShowCreateClient] = useState(false);
  const [showCreateInvoice, setShowCreateInvoice] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);

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

  const invoiceCountByClient = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const invoice of invoices) {
      counts[invoice.clientId] = (counts[invoice.clientId] ?? 0) + 1;
    }
    return counts;
  }, [invoices]);

  const loading = tab === 'invoices' ? invoicesLoading : clientsLoading;
  const error = tab === 'invoices' ? invoicesError : clientsError;

  async function handleRefresh() {
    await Promise.all([refetchInvoices(), refetchClients()]);
  }

  async function handleCreateClient(data: { id: string; name: string; email: string }) {
    await createClient(data);
    await refetchClients();
  }

  async function handleUpdateClient(id: string, data: { name: string; email: string }) {
    await updateClient(id, data);
    await Promise.all([refetchClients(), refetchInvoices()]);
  }

  async function handleDeleteClient(client: Client) {
    if (!confirm(`¿Eliminar cliente "${client.name}"?`)) return;
    await deleteClient(client.id);
    await refetchClients();
  }

  async function handleCreateInvoice(data: Parameters<typeof createInvoice>[0]) {
    await createInvoice(data);
    await refetchInvoices();
  }

  async function handleUpdateInvoice(
    id: string,
    data: { concept: string; amount: number; dueDate: string; status: InvoiceStatus },
  ) {
    await updateInvoice(id, data);
    await refetchInvoices();
  }

  async function handleProcessReminders() {
    const result = await executeReminders();
    if (result) {
      await refetchInvoices();
    }
  }

  async function handleProcessInvoiceReminder(invoice: Invoice) {
    const result = await executeForInvoice(invoice.id);
    if (result) {
      await refetchInvoices();
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wider text-indigo-400">
              Monolegal
            </p>
            <h1 className="mt-1 text-3xl font-bold text-white sm:text-4xl">
              Gestión de Facturación
            </h1>
            <p className="mt-2 text-slate-400">
              Clientes, facturas y recordatorios de cobro
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setShowCreateClient(true)}
              className="rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-800"
            >
              + Nuevo cliente
            </button>
            <button
              type="button"
              onClick={() => setShowCreateInvoice(true)}
              className="rounded-lg border border-indigo-500/50 px-4 py-2 text-sm font-medium text-indigo-300 transition-colors hover:bg-indigo-950"
            >
              + Nueva factura
            </button>
            <button
              type="button"
              onClick={() => handleProcessReminders()}
              disabled={remindersLoading || processingInvoiceId !== null}
              className="rounded-lg border border-amber-500/50 px-4 py-2 text-sm font-medium text-amber-300 transition-colors hover:bg-amber-950 disabled:opacity-50"
            >
              {remindersLoading ? 'Procesando…' : 'Ejecutar recordatorios'}
            </button>
            <button
              type="button"
              onClick={() => handleRefresh()}
              disabled={loading}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Actualizando…' : 'Actualizar'}
            </button>
          </div>
        </header>

        <nav className="mb-8 flex gap-2">
          <button
            type="button"
            onClick={() => setTab('invoices')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              tab === 'invoices'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Facturas
          </button>
          <button
            type="button"
            onClick={() => setTab('clients')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              tab === 'clients'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Clientes
          </button>
        </nav>

        {error && (
          <div className="mb-6 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-rose-300">
            {error}
          </div>
        )}

        {remindersError && (
          <div className="mb-6 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-rose-300">
            {remindersError}
          </div>
        )}

        {remindersResult && (
          <div className="mb-6 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-emerald-300">
            Recordatorios procesados: {remindersResult.processed} exitosos,{' '}
            {remindersResult.failed} fallidos
          </div>
        )}

        {tab === 'invoices' && (
          <>
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
              {invoicesLoading && invoices.length === 0 ? (
                <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-12 text-center text-slate-400">
                  Cargando facturas…
                </div>
              ) : (
                <InvoiceTable
                  invoices={filteredInvoices}
                  onEdit={setEditingInvoice}
                  onProcessReminder={handleProcessInvoiceReminder}
                  processingInvoiceId={processingInvoiceId}
                />
              )}
            </section>

            <footer className="mt-8 text-center text-sm text-slate-500">
              {filteredInvoices.length} de {invoices.length} facturas mostradas
            </footer>
          </>
        )}

        {tab === 'clients' && (
          <section>
            {clientsLoading && clients.length === 0 ? (
              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-12 text-center text-slate-400">
                Cargando clientes…
              </div>
            ) : (
              <ClientTable
                clients={clients}
                invoiceCountByClient={invoiceCountByClient}
                onEdit={setEditingClient}
                onDelete={handleDeleteClient}
              />
            )}
          </section>
        )}
      </div>

      <CreateClientModal
        open={showCreateClient}
        onClose={() => setShowCreateClient(false)}
        onSubmit={handleCreateClient}
      />
      <CreateInvoiceModal
        open={showCreateInvoice}
        clients={clients}
        onClose={() => setShowCreateInvoice(false)}
        onSubmit={handleCreateInvoice}
      />
      <EditClientModal
        client={editingClient}
        onClose={() => setEditingClient(null)}
        onSubmit={handleUpdateClient}
      />
      <EditInvoiceModal
        invoice={editingInvoice}
        onClose={() => setEditingInvoice(null)}
        onSubmit={handleUpdateInvoice}
      />
    </main>
  );
}
