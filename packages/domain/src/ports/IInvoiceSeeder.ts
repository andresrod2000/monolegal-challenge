import type { InvoiceStatus } from '@monolegal/shared';

export interface SeedInvoiceInput {
  clientId: string;
  clientName: string;
  clientEmail: string;
  amount: number;
  dueDate: Date;
  status: InvoiceStatus;
}

export interface IInvoiceSeeder {
  resetAndSeed(invoices: SeedInvoiceInput[]): Promise<number>;
}
