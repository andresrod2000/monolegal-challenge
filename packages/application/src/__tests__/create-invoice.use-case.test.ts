import {
  ClientNotFoundError,
  Invoice,
  type IClientRepository,
  type IInvoiceRepository,
  type ILogger,
} from '@monolegal/domain';
import { InvoiceStatus } from '@monolegal/shared';
import { CreateInvoiceUseCase } from '../create-invoice.use-case.js';

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

describe('CreateInvoiceUseCase', () => {
  it('should create invoice with generated invoice number', async () => {
    const created = Invoice.create({
      id: 'inv-new',
      clientId: 'client-1',
      invoiceNumber: 'INV-2026-0003',
      concept: 'Nuevo servicio',
      amount: 200000,
      dueDate: new Date('2026-06-15'),
      status: InvoiceStatus.AL_DIA,
    });

    const invoiceRepository: jest.Mocked<IInvoiceRepository> = {
      findByStatus: jest.fn(),
      findByStatusAndDueDateBefore: jest.fn(),
      findAllSummaries: jest.fn(),
      findById: jest.fn(),
      findByClientId: jest.fn(),
      create: jest.fn(async () => created),
      update: jest.fn(),
      delete: jest.fn(),
      updateStatus: jest.fn(),
      countByYear: jest.fn(async () => 2),
    };

    const clientRepository: jest.Mocked<IClientRepository> = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn(async () => true),
    };

    const useCase = new CreateInvoiceUseCase(
      invoiceRepository,
      clientRepository,
      createMockLogger(),
    );

    const result = await useCase.execute({
      clientId: 'client-1',
      concept: 'Nuevo servicio',
      amount: 200000,
      dueDate: new Date('2026-06-15'),
      status: InvoiceStatus.AL_DIA,
    });

    expect(result.invoiceNumber).toBe('INV-2026-0003');
    expect(invoiceRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        clientId: 'client-1',
        invoiceNumber: 'INV-2026-0003',
        concept: 'Nuevo servicio',
      }),
    );
  });

  it('should throw ClientNotFoundError when client does not exist', async () => {
    const invoiceRepository: jest.Mocked<IInvoiceRepository> = {
      findByStatus: jest.fn(),
      findByStatusAndDueDateBefore: jest.fn(),
      findAllSummaries: jest.fn(),
      findById: jest.fn(),
      findByClientId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      updateStatus: jest.fn(),
      countByYear: jest.fn(),
    };

    const clientRepository: jest.Mocked<IClientRepository> = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn(async () => false),
    };

    const useCase = new CreateInvoiceUseCase(
      invoiceRepository,
      clientRepository,
      createMockLogger(),
    );

    await expect(
      useCase.execute({
        clientId: 'missing',
        concept: 'Test',
        amount: 1000,
        dueDate: new Date(),
        status: InvoiceStatus.AL_DIA,
      }),
    ).rejects.toThrow(ClientNotFoundError);
  });
});
