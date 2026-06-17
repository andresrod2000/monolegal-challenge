import {
  Client,
  ClientHasInvoicesError,
  ClientNotFoundError,
  Invoice,
  type IClientRepository,
  type IInvoiceRepository,
  type ILogger,
} from '@monolegal/domain';
import { InvoiceStatus } from '@monolegal/shared';
import { DeleteClientUseCase } from '../delete-client.use-case.js';

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

describe('DeleteClientUseCase', () => {
  it('should delete client when no invoices exist', async () => {
    const repository: jest.Mocked<IClientRepository> = {
      findAll: jest.fn(),
      findById: jest.fn(async () =>
        Client.create({ id: 'client-1', name: 'Acme', email: 'a@b.com' }),
      ),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn(),
    };

    const invoiceRepository: jest.Mocked<IInvoiceRepository> = {
      findByStatus: jest.fn(),
      findAllSummaries: jest.fn(),
      findById: jest.fn(),
      findByClientId: jest.fn(async () => []),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      updateStatus: jest.fn(),
      countByYear: jest.fn(),
    };

    const useCase = new DeleteClientUseCase(repository, invoiceRepository, createMockLogger());
    await useCase.execute('client-1');

    expect(repository.delete).toHaveBeenCalledWith('client-1');
  });

  it('should throw ClientHasInvoicesError when invoices exist', async () => {
    const repository: jest.Mocked<IClientRepository> = {
      findAll: jest.fn(),
      findById: jest.fn(async () =>
        Client.create({ id: 'client-1', name: 'Acme', email: 'a@b.com' }),
      ),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn(),
    };

    const invoice = Invoice.create({
      id: 'inv-1',
      clientId: 'client-1',
      invoiceNumber: 'INV-2026-0001',
      concept: 'Test',
      amount: 1000,
      dueDate: new Date(),
      status: InvoiceStatus.AL_DIA,
    });

    const invoiceRepository: jest.Mocked<IInvoiceRepository> = {
      findByStatus: jest.fn(),
      findAllSummaries: jest.fn(),
      findById: jest.fn(),
      findByClientId: jest.fn(async () => [invoice]),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      updateStatus: jest.fn(),
      countByYear: jest.fn(),
    };

    const useCase = new DeleteClientUseCase(repository, invoiceRepository, createMockLogger());

    await expect(useCase.execute('client-1')).rejects.toThrow(ClientHasInvoicesError);
    expect(repository.delete).not.toHaveBeenCalled();
  });

  it('should throw ClientNotFoundError when client does not exist', async () => {
    const repository: jest.Mocked<IClientRepository> = {
      findAll: jest.fn(),
      findById: jest.fn(async () => null),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn(),
    };

    const invoiceRepository: jest.Mocked<IInvoiceRepository> = {
      findByStatus: jest.fn(),
      findAllSummaries: jest.fn(),
      findById: jest.fn(),
      findByClientId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      updateStatus: jest.fn(),
      countByYear: jest.fn(),
    };

    const useCase = new DeleteClientUseCase(repository, invoiceRepository, createMockLogger());

    await expect(useCase.execute('missing')).rejects.toThrow(ClientNotFoundError);
  });
});
