import {
  Invoice,
  InvoiceNotFoundError,
  type IInvoiceRepository,
  type ILogger,
} from '@monolegal/domain';
import { InvoiceStatus } from '@monolegal/shared';
import { GetInvoiceByIdUseCase } from '../get-invoice-by-id.use-case.js';

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

describe('GetInvoiceByIdUseCase', () => {
  it('should return invoice when found', async () => {
    const invoice = Invoice.create({
      id: 'inv-1',
      clientId: 'client-1',
      invoiceNumber: 'INV-2026-0001',
      concept: 'Suscripción SaaS',
      amount: 150000,
      dueDate: new Date('2026-05-01'),
      status: InvoiceStatus.AL_DIA,
    });

    const repository: jest.Mocked<IInvoiceRepository> = {
      findByStatus: jest.fn(),
      findByStatusAndDueDateBefore: jest.fn(),
      findAllSummaries: jest.fn(),
      findById: jest.fn(async () => invoice),
      findByClientId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      updateStatus: jest.fn(),
      countByYear: jest.fn(),
    };

    const logger = createMockLogger();
    const useCase = new GetInvoiceByIdUseCase(repository, logger);
    const result = await useCase.execute('inv-1');

    expect(result).toEqual(invoice);
    expect(repository.findById).toHaveBeenCalledWith('inv-1');
    expect(logger.debug).toHaveBeenCalledWith('Invoice fetched', { invoiceId: 'inv-1' });
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

    const useCase = new GetInvoiceByIdUseCase(repository, createMockLogger());

    await expect(useCase.execute('missing')).rejects.toThrow(InvoiceNotFoundError);
  });
});
