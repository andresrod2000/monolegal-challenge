import { InvoiceStatus } from '@/lib/invoice-status';

export interface Invoice {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  invoiceNumber: string;
  concept: string;
  amount: number;
  dueDate: string;
  status: InvoiceStatus;
}

export interface InvoicesApiResponse {
  data: Invoice[];
  meta: { total: number };
}

export interface InvoiceApiResponse {
  data: Invoice;
}

export type StatusFilter = InvoiceStatus | 'all';

export interface CreateInvoiceInput {
  clientId: string;
  concept: string;
  amount: number;
  dueDate: string;
  status: InvoiceStatus;
}

export interface UpdateInvoiceInput {
  concept?: string;
  amount?: number;
  dueDate?: string;
  status?: InvoiceStatus;
}
