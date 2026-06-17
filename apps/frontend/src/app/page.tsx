'use client';

import { useMemo, useState } from 'react';
import { ALL_INVOICE_STATUSES, InvoiceStatus } from '@/lib/invoice-status';
import { ClientTable } from '@/components/ClientTable';
import { CreateClientModal } from '@/components/CreateClientModal';
import { CreateInvoiceModal } from '@/components/CreateInvoiceModal';
import { EditClientModal } from '@/components/EditClientModal';
import { EditInvoiceModal } from '@/components/EditInvoiceModal';
import { InvoiceTable } from '@/components/InvoiceTable';
import { InvoiceClientFilter } from '@/components/InvoiceClientFilter';
import { KpiCard } from '@/components/KpiCard';
import { StatusFilterBar } from '@/components/StatusFilter';
import {
  filterInvoices,
  sortInvoices,
  toggleSort,
} from '@/lib/invoice-list-utils';
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
import type { Invoice, StatusFilter, ClientFilter, InvoiceSortState, InvoiceSortField } from '@/types/invoice';

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
  const [clientFilter, setClientFilter] = useState<ClientFilter>('all');
  const [sortState, setSortState] = useState<InvoiceSortState>({
    field: 'dueDate',
    direction: 'desc',
  });
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

  const displayedInvoices = useMemo(() => {
    const filtered = filterInvoices(invoices, {
      status: statusFilter,
      clientId: clientFilter,
    });
    return sortInvoices(filtered, sortState);
  }, [invoices, statusFilter, clientFilter, sortState]);

  function handleSortChange(field: InvoiceSortField) {
    setSortState((current) => toggleSort(current, field));
  }

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
    <main className="min-h-screen bg-surface-cream">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-12 lg:py-16">
        <header className="mb-14 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-brand-medium">
              Monolegal
            </p>
            <h1 className="mt-2 font-serif text-4xl text-brand-dark lg:text-5xl">
              Gestión de Facturación
            </h1>
            <p className="mt-3 text-brand-muted">
              Clientes, facturas y recordatorios de cobro
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setShowCreateClient(true)}
              className="btn-ghost"
            >
              + Nuevo cliente
            </button>
            <button
              type="button"
              onClick={() => setShowCreateInvoice(true)}
              className="btn-secondary"
            >
              + Nueva factura
            </button>
            <button
              type="button"
              onClick={() => handleProcessReminders()}
              disabled={remindersLoading || processingInvoiceId !== null}
              className="btn-ghost"
            >
              {remindersLoading ? 'Procesando…' : 'Ejecutar recordatorios'}
            </button>
            <button
              type="button"
              onClick={() => handleRefresh()}
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Actualizando…' : 'Actualizar'}
            </button>
          </div>
        </header>

        <nav className="mb-10 flex gap-8 border-b border-brand-neutral">
          <button
            type="button"
            onClick={() => setTab('invoices')}
            className={`border-b-2 px-1 pb-3 text-sm font-medium transition-colors ${
              tab === 'invoices'
                ? 'border-brand-dark text-brand-dark'
                : 'border-transparent text-brand-muted hover:text-brand-dark'
            }`}
          >
            Facturas
          </button>
          <button
            type="button"
            onClick={() => setTab('clients')}
            className={`border-b-2 px-1 pb-3 text-sm font-medium transition-colors ${
              tab === 'clients'
                ? 'border-brand-dark text-brand-dark'
                : 'border-transparent text-brand-muted hover:text-brand-dark'
            }`}
          >
            Clientes
          </button>
        </nav>

        {error && (
          <div className="alert-error mb-8">
            {error}
          </div>
        )}

        {remindersError && (
          <div className="alert-error mb-8">
            {remindersError}
          </div>
        )}

        {remindersResult && (
          <div className="alert-success mb-8">
            Recordatorios procesados: {remindersResult.processed} exitosos,{' '}
            {remindersResult.failed} fallidos
          </div>
        )}

        {tab === 'invoices' && (
          <>
            <section className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
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

            <section className="mb-8 flex flex-col gap-4">
              <StatusFilterBar value={statusFilter} onChange={setStatusFilter} />
              <InvoiceClientFilter
                clients={clients}
                value={clientFilter}
                onChange={setClientFilter}
              />
            </section>

            <section>
              {invoicesLoading && invoices.length === 0 ? (
                <div className="panel rounded-none p-16 text-center text-brand-muted">
                  Cargando facturas…
                </div>
              ) : (
                <InvoiceTable
                  invoices={displayedInvoices}
                  sortState={sortState}
                  onSortChange={handleSortChange}
                  onEdit={setEditingInvoice}
                  onProcessReminder={handleProcessInvoiceReminder}
                  processingInvoiceId={processingInvoiceId}
                />
              )}
            </section>

            <footer className="mt-10 text-center text-sm text-brand-neutral">
              {displayedInvoices.length} de {invoices.length} facturas mostradas
            </footer>
          </>
        )}

        {tab === 'clients' && (
          <section>
            {clientsLoading && clients.length === 0 ? (
              <div className="panel rounded-none p-16 text-center text-brand-muted">
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
