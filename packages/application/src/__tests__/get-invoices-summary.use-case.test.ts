import { InvoiceStatus } from '@monolegal/shared';
import type { IInvoiceRepository, InvoiceSummary } from '@monolegal/domain';
import type { ILogger } from '@monolegal/shared';
import { GetInvoicesSummaryUseCase } from '../get-invoices-summary.use-case.js';

describe('GetInvoicesSummaryUseCase', () => {
  it('should return all invoices from repository', async () => {
    const summaries: InvoiceSummary[] = [
      {
        id: '1',
        clientId: 'c1',
        clientName: 'Acme Corp',
        amount: 100000,
        dueDate: new Date('2026-05-01'),
        status: InvoiceStatus.AL_DIA,
      },
    ];

    const repository: jest.Mocked<IInvoiceRepository> = {
      findByStatus: jest.fn(),
      findAll: jest.fn(async () => summaries),
      updateStatus: jest.fn(),
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
    expect(repository.findAll).toHaveBeenCalledTimes(1);
  });
});
