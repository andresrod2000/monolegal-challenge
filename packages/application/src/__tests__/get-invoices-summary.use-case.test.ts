import { InvoiceStatus } from '@monolegal/shared';
import type { IInvoiceRepository, InvoiceSummary, ILogger } from '@monolegal/domain';
import { GetInvoicesSummaryUseCase } from '../get-invoices-summary.use-case.js';

describe('GetInvoicesSummaryUseCase', () => {
  it('should return all invoices from repository', async () => {
    const summaries: InvoiceSummary[] = [
      {
        id: '1',
        clientId: 'c1',
        clientName: 'Acme Corp',
        clientEmail: 'billing@acme.com',
        invoiceNumber: 'INV-2026-0001',
        concept: 'Suscripción SaaS',
        amount: 100000,
        dueDate: new Date('2026-05-01'),
        status: InvoiceStatus.AL_DIA,
      },
    ];

    const repository: jest.Mocked<IInvoiceRepository> = {
      findByStatus: jest.fn(),
      findByStatusAndDueDateBefore: jest.fn(),
      findAllSummaries: jest.fn(async () => summaries),
      findById: jest.fn(),
      findByClientId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      updateStatus: jest.fn(),
      countByYear: jest.fn(),
    };

    const logger: jest.Mocked<ILogger> = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      child: jest.fn().mockReturnThis(),
    };

    const useCase = new GetInvoicesSummaryUseCase(repository, logger);
    const result = await useCase.execute();

    expect(result).toEqual(summaries);
    expect(repository.findAllSummaries).toHaveBeenCalledTimes(1);
  });
});
