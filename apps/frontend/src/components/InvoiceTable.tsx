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
    <th className="px-5 py-5 font-medium">
      <button
        type="button"
        onClick={() => onSortChange(field)}
        className={`inline-flex items-center gap-1 transition-colors hover:text-brand-dark ${
          isActive ? 'font-medium text-brand-medium' : 'text-brand-muted'
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
      <div className="panel rounded-none p-16 text-center text-brand-muted">
        No hay facturas que coincidan con los filtros seleccionados.
      </div>
    );
  }

  return (
    <div className="panel overflow-hidden rounded-none">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1080px] text-left text-sm">
          <thead>
            <tr className="border-b border-brand-neutral bg-surface-subtle text-brand-muted">
              <SortableHeader
                label="N° Factura"
                field="invoiceNumber"
                sortState={sortState}
                onSortChange={onSortChange}
              />
              <th className="px-5 py-5 font-medium">Concepto</th>
              <SortableHeader
                label="Cliente"
                field="clientName"
                sortState={sortState}
                onSortChange={onSortChange}
              />
              <th className="px-5 py-5 font-medium">Email destino</th>
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
              <th className="px-5 py-5 font-medium">Estado</th>
              <th className="px-5 py-5 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => {
              const isProcessing = processingInvoiceId === invoice.id;
              const canRemind = canProcessReminder(invoice.status);

              return (
                <tr
                  key={invoice.id}
                  className="border-b border-brand-neutral/60 transition-colors hover:bg-brand-light/20"
                >
                  <td className="px-5 py-5 font-mono text-xs text-brand-muted">
                    {invoice.invoiceNumber}
                  </td>
                  <td className="px-5 py-5 text-brand-dark">{invoice.concept}</td>
                  <td className="px-5 py-5 font-medium text-brand-dark">{invoice.clientName}</td>
                  <td className="px-5 py-5 text-brand-muted">{invoice.clientEmail}</td>
                  <td className="px-5 py-5 text-brand-dark">{formatCurrency(invoice.amount)}</td>
                  <td className="px-5 py-5 text-brand-muted">{formatDate(invoice.dueDate)}</td>
                  <td className="px-5 py-5">
                    <StatusBadge status={invoice.status} />
                  </td>
                  <td className="px-5 py-5">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(invoice)}
                        className="btn-sm-ghost"
                      >
                        Editar
                      </button>
                      {canRemind && (
                        <button
                          type="button"
                          onClick={() => onProcessReminder(invoice)}
                          disabled={processingInvoiceId !== null}
                          className="btn-sm border border-brand-medium text-brand-medium hover:border-brand-dark hover:text-brand-dark"
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
