import type { Invoice, InvoiceSortField, InvoiceSortState } from '@/types/invoice';
import { canProcessReminder } from '@/lib/invoice-status';
import { getSortIndicator } from '@/lib/invoice-list-utils';
import { StatusBadge } from './StatusBadge';

interface InvoiceTableProps {
  invoices: Invoice[];
  sortState: InvoiceSortState;
  onSortChange: (field: InvoiceSortField) => void;
  onEdit: (invoice: Invoice) => void;
  onProcessReminder: (invoice: Invoice) => void;
  processingInvoiceId: string | null;
}

interface SortableHeaderProps {
  label: string;
  field: InvoiceSortField;
  sortState: InvoiceSortState;
  onSortChange: (field: InvoiceSortField) => void;
}

function SortableHeader({ label, field, sortState, onSortChange }: SortableHeaderProps) {
  const indicator = getSortIndicator(sortState, field);
  const isActive = sortState.field === field;

  return (
    <th className="px-4 py-4 font-medium">
      <button
        type="button"
        onClick={() => onSortChange(field)}
        className={`inline-flex items-center gap-1 transition-colors hover:text-white ${
          isActive ? 'text-indigo-300' : 'text-slate-400'
        }`}
      >
        {label}
        {indicator && <span className="text-xs">{indicator}</span>}
      </button>
    </th>
  );
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function InvoiceTable({
  invoices,
  sortState,
  onSortChange,
  onEdit,
  onProcessReminder,
  processingInvoiceId,
}: InvoiceTableProps) {
  if (invoices.length === 0) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-12 text-center text-slate-400">
        No hay facturas que coincidan con los filtros seleccionados.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/40">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1080px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400">
              <SortableHeader
                label="N° Factura"
                field="invoiceNumber"
                sortState={sortState}
                onSortChange={onSortChange}
              />
              <th className="px-4 py-4 font-medium">Concepto</th>
              <SortableHeader
                label="Cliente"
                field="clientName"
                sortState={sortState}
                onSortChange={onSortChange}
              />
              <th className="px-4 py-4 font-medium">Email destino</th>
              <SortableHeader
                label="Monto"
                field="amount"
                sortState={sortState}
                onSortChange={onSortChange}
              />
              <SortableHeader
                label="Vencimiento"
                field="dueDate"
                sortState={sortState}
                onSortChange={onSortChange}
              />
              <th className="px-4 py-4 font-medium">Estado</th>
              <th className="px-4 py-4 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => {
              const isProcessing = processingInvoiceId === invoice.id;
              const canRemind = canProcessReminder(invoice.status);

              return (
                <tr
                  key={invoice.id}
                  className="border-b border-slate-800/60 transition-colors hover:bg-slate-800/30"
                >
                  <td className="px-4 py-4 font-mono text-xs text-indigo-300">
                    {invoice.invoiceNumber}
                  </td>
                  <td className="px-4 py-4 text-slate-200">{invoice.concept}</td>
                  <td className="px-4 py-4 font-medium text-white">{invoice.clientName}</td>
                  <td className="px-4 py-4 text-indigo-300">{invoice.clientEmail}</td>
                  <td className="px-4 py-4 text-slate-200">{formatCurrency(invoice.amount)}</td>
                  <td className="px-4 py-4 text-slate-300">{formatDate(invoice.dueDate)}</td>
                  <td className="px-4 py-4">
                    <StatusBadge status={invoice.status} />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(invoice)}
                        className="rounded-lg bg-slate-700 px-3 py-1 text-xs font-medium text-white hover:bg-slate-600"
                      >
                        Editar
                      </button>
                      {canRemind && (
                        <button
                          type="button"
                          onClick={() => onProcessReminder(invoice)}
                          disabled={processingInvoiceId !== null}
                          className="rounded-lg border border-amber-500/50 px-3 py-1 text-xs font-medium text-amber-300 hover:bg-amber-950 disabled:opacity-50"
                        >
                          {isProcessing ? 'Enviando…' : 'Recordatorio'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
