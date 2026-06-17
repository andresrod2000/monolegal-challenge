import {
  Invoice,
  InvoiceNotFoundError,
  type IInvoiceRepository,
  type ILogger,
} from '@monolegal/domain';
import { InvoiceStatus } from '@monolegal/shared';
import { UpdateInvoiceUseCase } from '../update-invoice.use-case.js';

function createMockLogger(): jest.Mocked<ILogger> {
  const logger: jest.Mocked<ILogger> = {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    child: jest.fn(),
  };
  logger.child.mockReturnValue(logger);
  return logger;
}

describe('UpdateInvoiceUseCase', () => {
  it('should update invoice concept and amount', async () => {
    const existing = Invoice.create({
      id: 'inv-1',
      clientId: 'client-1',
      invoiceNumber: 'INV-2026-0001',
      concept: 'Original',
      amount: 100000,
      dueDate: new Date('2026-05-01'),
      status: InvoiceStatus.AL_DIA,
    });

    const updated = Invoice.create({
      ...existing.toProps(),
      concept: 'Actualizado',
      amount: 150000,
    });

    const repository: jest.Mocked<IInvoiceRepository> = {
      findByStatus: jest.fn(),
      findByStatusAndDueDateBefore: jest.fn(),
      findAllSummaries: jest.fn(),
      findById: jest.fn(async () => existing),
      findByClientId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(async () => updated),
      delete: jest.fn(),
      updateStatus: jest.fn(),
      countByYear: jest.fn(),
    };

    const useCase = new UpdateInvoiceUseCase(repository, createMockLogger());
    const result = await useCase.execute('inv-1', { concept: 'Actualizado', amount: 150000 });

    expect(result.concept).toBe('Actualizado');
    expect(result.amount).toBe(150000);
  });

  it('should throw InvoiceNotFoundError when invoice does not exist', async () => {
    const repository: jest.Mocked<IInvoiceRepository> = {
      findByStatus: jest.fn(),
      findByStatusAndDueDateBefore: jest.fn(),
      findAllSummaries: jest.fn(),
      findById: jest.fn(async () => null),
      findByClientId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      updateStatus: jest.fn(),
      countByYear: jest.fn(),
    };

    const useCase = new UpdateInvoiceUseCase(repository, createMockLogger());

    await expect(useCase.execute('missing', { concept: 'X' })).rejects.toThrow(
      InvoiceNotFoundError,
    );
  });
});
