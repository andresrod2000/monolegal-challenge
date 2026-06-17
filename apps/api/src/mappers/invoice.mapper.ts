import type { Invoice, InvoiceSummary } from '@monolegal/domain';
import type { InvoiceStatus } from '@monolegal/shared';

export interface InvoiceSummaryDto {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  invoiceNumber: string;
  concept: string;
  amount: number;
  dueDate: string;
  status: InvoiceSummary['status'];
}

export interface InvoiceDetailDto {
  id: string;
  clientId: string;
  invoiceNumber: string;
  concept: string;
  amount: number;
  dueDate: string;
  status: InvoiceStatus;
}

export interface CreateInvoiceBody {
  clientId: string;
  concept: string;
  amount: number;
  dueDate: string;
  status: InvoiceStatus;
}

export interface UpdateInvoiceBody {
  concept?: string;
  amount?: number;
  dueDate?: string;
  status?: InvoiceStatus;
}

export function toInvoiceSummaryDto(invoice: InvoiceSummary): InvoiceSummaryDto {
  return {
    id: invoice.id,
    clientId: invoice.clientId,
    clientName: invoice.clientName,
    clientEmail: invoice.clientEmail,
    invoiceNumber: invoice.invoiceNumber,
    concept: invoice.concept,
    amount: invoice.amount,
    dueDate: invoice.dueDate.toISOString(),
    status: invoice.status,
  };
}

export function toInvoiceSummaryDtoList(invoices: InvoiceSummary[]): InvoiceSummaryDto[] {
  return invoices.map(toInvoiceSummaryDto);
}

export function toInvoiceDetailDto(invoice: Invoice): InvoiceDetailDto {
  return {
    id: invoice.id,
    clientId: invoice.clientId,
    invoiceNumber: invoice.invoiceNumber,
    concept: invoice.concept,
    amount: invoice.amount,
    dueDate: invoice.dueDate.toISOString(),
    status: invoice.status,
  };
}
