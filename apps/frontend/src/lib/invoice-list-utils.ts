import type {
  ClientFilter,
  Invoice,
  InvoiceSortField,
  InvoiceSortState,
  StatusFilter,
} from '@/types/invoice';

export interface InvoiceFilterOptions {
  status: StatusFilter;
  clientId: ClientFilter;
}

export function filterInvoices(invoices: Invoice[], options: InvoiceFilterOptions): Invoice[] {
  return invoices.filter((invoice) => {
    if (options.status !== 'all' && invoice.status !== options.status) {
      return false;
    }
    if (options.clientId !== 'all' && invoice.clientId !== options.clientId) {
      return false;
    }
    return true;
  });
}

function compareInvoices(a: Invoice, b: Invoice, field: InvoiceSortField): number {
  switch (field) {
    case 'invoiceNumber':
      return a.invoiceNumber.localeCompare(b.invoiceNumber, 'es-CO');
    case 'clientName':
      return a.clientName.localeCompare(b.clientName, 'es-CO');
    case 'amount':
      return a.amount - b.amount;
    case 'dueDate':
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  }
}

export function sortInvoices(invoices: Invoice[], sortState: InvoiceSortState): Invoice[] {
  const sorted = [...invoices];
  sorted.sort((a, b) => {
    const result = compareInvoices(a, b, sortState.field);
    return sortState.direction === 'asc' ? result : -result;
  });
  return sorted;
}

export function toggleSort(current: InvoiceSortState, field: InvoiceSortField): InvoiceSortState {
  if (current.field === field) {
    return {
      field,
      direction: current.direction === 'asc' ? 'desc' : 'asc',
    };
  }
  return { field, direction: 'asc' };
}

export function getSortIndicator(
  sortState: InvoiceSortState,
  field: InvoiceSortField,
): string | null {
  if (sortState.field !== field) return null;
  return sortState.direction === 'asc' ? '↑' : '↓';
}
