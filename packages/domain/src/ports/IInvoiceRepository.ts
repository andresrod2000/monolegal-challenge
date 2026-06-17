import type { InvoiceStatus } from '@monolegal/shared';
import type { Invoice } from '../entities/invoice.js';
import type { InvoiceProps, InvoiceSummary, InvoiceUpdateProps } from '../entities/invoice.types.js';

export interface IInvoiceRepository {
  findByStatus(statuses: InvoiceStatus[]): Promise<Invoice[]>;
  findAllSummaries(): Promise<InvoiceSummary[]>;
  findById(id: string): Promise<Invoice | null>;
  findByClientId(clientId: string): Promise<Invoice[]>;
  create(props: Omit<InvoiceProps, 'id'>): Promise<Invoice>;
  update(id: string, props: InvoiceUpdateProps): Promise<Invoice>;
  delete(id: string): Promise<void>;
  updateStatus(id: string, status: InvoiceStatus): Promise<void>;
  countByYear(year: number): Promise<number>;
}
