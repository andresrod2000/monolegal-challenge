import type { IInvoiceSeeder, SeedInvoiceInput } from '@monolegal/domain';
import { getInvoiceModel } from './mongo-invoice.repository.js';

export class MongoInvoiceSeeder implements IInvoiceSeeder {
  async resetAndSeed(invoices: SeedInvoiceInput[]): Promise<number> {
    const model = getInvoiceModel();
    await model.deleteMany({});
    if (invoices.length > 0) {
      await model.insertMany(invoices);
    }
    return invoices.length;
  }
}
