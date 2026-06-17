import type { InvoiceStatus } from '@monolegal/shared';

export interface InvoiceProps {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  amount: number;
  dueDate: Date;
  status: InvoiceStatus;
}

export interface InvoiceSummary {
  id: string;
  clientId: string;
  clientName: string;
  amount: number;
  dueDate: Date;
  status: InvoiceStatus;
}
