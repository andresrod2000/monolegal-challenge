import type { InvoiceStatus } from '@monolegal/shared';
import type { InvoiceProps, InvoiceSummary } from '../entities/invoice.types.js';

export interface IInvoiceRepository {
  findByStatus(statuses: InvoiceStatus[]): Promise<InvoiceProps[]>;
  findAll(): Promise<InvoiceSummary[]>;
  updateStatus(id: string, status: InvoiceStatus): Promise<void>;
}
