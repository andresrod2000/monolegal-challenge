import type { InvoiceStatus } from '@monolegal/shared';

export interface InvoiceProps {
  id: string;
  clientId: string;
  invoiceNumber: string;
  concept: string;
  amount: number;
  dueDate: Date;
  status: InvoiceStatus;
}

export interface InvoiceSummary {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  invoiceNumber: string;
  concept: string;
  amount: number;
  dueDate: Date;
  status: InvoiceStatus;
}

export type InvoiceUpdateProps = Partial<
  Pick<InvoiceProps, 'concept' | 'amount' | 'dueDate' | 'status'>
>;
