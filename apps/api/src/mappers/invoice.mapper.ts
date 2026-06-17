import type { InvoiceSummary } from '@monolegal/domain';

export interface InvoiceSummaryDto {
  id: string;
  clientId: string;
  clientName: string;
  amount: number;
  dueDate: string;
  status: InvoiceSummary['status'];
}

export function toInvoiceSummaryDto(invoice: InvoiceSummary): InvoiceSummaryDto {
  return {
    id: invoice.id,
    clientId: invoice.clientId,
    clientName: invoice.clientName,
    amount: invoice.amount,
    dueDate: invoice.dueDate.toISOString(),
    status: invoice.status,
  };
}

export function toInvoiceSummaryDtoList(invoices: InvoiceSummary[]): InvoiceSummaryDto[] {
  return invoices.map(toInvoiceSummaryDto);
}
