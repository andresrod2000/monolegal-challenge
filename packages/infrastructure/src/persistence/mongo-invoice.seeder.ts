import type { IInvoiceSeeder, SeedClientInput, SeedInvoiceInput } from '@monolegal/domain';
import { getClientModel } from './mongo-client.repository.js';
import { getInvoiceModel } from './mongo-invoice.repository.js';

export class MongoInvoiceSeeder implements IInvoiceSeeder {
  async resetAndSeed(clients: SeedClientInput[], invoices: SeedInvoiceInput[]): Promise<number> {
    const clientModel = getClientModel();
    const invoiceModel = getInvoiceModel();

    await invoiceModel.deleteMany({});
    await clientModel.deleteMany({});

    if (clients.length > 0) {
      await clientModel.insertMany(
        clients.map((c) => ({
          clientId: c.id,
          name: c.name,
          email: c.email,
        })),
      );
    }

    if (invoices.length > 0) {
      await invoiceModel.insertMany(invoices);
    }

    return invoices.length;
  }
}
