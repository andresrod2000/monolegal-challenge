import type { InvoiceStatus } from '@monolegal/shared';

export interface SeedClientInput {
  id: string;
  name: string;
  email: string;
}

export interface SeedInvoiceInput {
  clientId: string;
  invoiceNumber: string;
  concept: string;
  amount: number;
  dueDate: Date;
  status: InvoiceStatus;
}

export interface IInvoiceSeeder {
  resetAndSeed(clients: SeedClientInput[], invoices: SeedInvoiceInput[]): Promise<number>;
}
