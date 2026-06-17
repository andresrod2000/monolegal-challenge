import 'dotenv/config';
import { createContainer, disconnectMongoDB, loadConfigFromEnv } from '@monolegal/infrastructure';
import type { SeedClientInput, SeedInvoiceInput } from '@monolegal/domain';
import { deriveStatusFromDueDate, generateDummyInvoiceFields, randomInt } from '@monolegal/shared';

const clients: SeedClientInput[] = [
  { id: 'client-acme', name: 'Acme Corp', email: 'billing@acme.com' },
  { id: 'client-legaltech', name: 'LegalTech SA', email: 'finanzas@legaltech.co' },
  { id: 'client-consultores', name: 'Consultores XYZ', email: 'pagos@consultoresxyz.com' },
];

const INVOICE_COUNT = 15;

function buildInvoices(): SeedInvoiceInput[] {
  const year = new Date().getFullYear();

  return Array.from({ length: INVOICE_COUNT }, (_, index) => {
    const { concept, amount, dueDate } = generateDummyInvoiceFields('seed');
    const client = clients[randomInt(0, clients.length - 1)];

    return {
      clientId: client.id,
      invoiceNumber: `INV-${year}-${String(index + 1).padStart(4, '0')}`,
      concept,
      amount,
      dueDate,
      status: deriveStatusFromDueDate(dueDate),
    };
  });
}

async function seed(): Promise<void> {
  const container = await createContainer(loadConfigFromEnv('seed'));
  const invoices = buildInvoices();
  const inserted = await container.invoiceSeeder.resetAndSeed(clients, invoices);

  const statusCounts = invoices.reduce<Record<string, number>>((acc, inv) => {
    acc[inv.status] = (acc[inv.status] ?? 0) + 1;
    return acc;
  }, {});

  container.logger.info('Seed completed', {
    clients: clients.length,
    invoices: inserted,
    statusDistribution: statusCounts,
  });

  await disconnectMongoDB();
}

seed().catch((error) => {
  console.error('Seed failed:', error);
  disconnectMongoDB().finally(() => process.exit(1));
});
