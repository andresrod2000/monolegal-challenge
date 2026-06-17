import type { InvoiceStatus } from '@monolegal/shared';
import type { Invoice } from '../entities/invoice.js';
import type { InvoiceSummary } from '../entities/invoice.types.js';

export interface IInvoiceRepository {
  findByStatus(statuses: InvoiceStatus[]): Promise<Invoice[]>;
  findAll(): Promise<InvoiceSummary[]>;
  updateStatus(id: string, status: InvoiceStatus): Promise<void>;
}
