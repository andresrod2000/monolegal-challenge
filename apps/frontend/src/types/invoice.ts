import { InvoiceStatus } from '@/lib/invoice-status';

export interface Invoice {
  id: string;
  clientId: string;
  clientName: string;
  amount: number;
  dueDate: string;
  status: InvoiceStatus;
}

export interface InvoicesApiResponse {
  data: Invoice[];
  meta: { total: number };
}

export type StatusFilter = InvoiceStatus | 'all';
