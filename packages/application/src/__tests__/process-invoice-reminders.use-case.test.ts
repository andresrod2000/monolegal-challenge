import { InvoiceStatus, type ILogger } from '@monolegal/shared';
import type { IEmailProvider } from '@monolegal/domain';
import type { IInvoiceRepository, InvoiceProps } from '@monolegal/domain';
import { ProcessInvoiceRemindersUseCase } from '../process-invoice-reminders.use-case.js';

function createInvoice(overrides: Partial<InvoiceProps> & Pick<InvoiceProps, 'id' | 'status'>): InvoiceProps {
  return {
    clientId: 'client-1',
    clientName: 'Acme Corp',
    clientEmail: 'billing@acme.com',
    amount: 150000,
    dueDate: new Date('2026-05-01'),
    ...overrides,
  };
}

function createMockRepository(invoices: InvoiceProps[] = []): jest.Mocked<IInvoiceRepository> {
  const store = [...invoices];
  return {
    findByStatus: jest.fn(async (statuses) =>
      store.filter((inv) => statuses.includes(inv.status)),
    ),
    findAll: jest.fn(async () => store),
    updateStatus: jest.fn(async (id, status) => {
      const invoice = store.find((inv) => inv.id === id);
      if (invoice) invoice.status = status;
    }),
  };
}

function createMockEmailProvider(shouldFailFor?: string[]): jest.Mocked<IEmailProvider> {
  return {
    sendReminder: jest.fn(async (message) => {
      if (shouldFailFor?.includes(message.to)) {
        throw new Error(`Failed to send email to ${message.to}`);
      }
    }),
  };
}

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

describe('ProcessInvoiceRemindersUseCase', () => {
  it('should process first reminder and update status to segundorecordatorio', async () => {
    const invoice = createInvoice({
      id: 'inv-1',
      status: InvoiceStatus.PRIMER_RECORDATORIO,
    });
    const repository = createMockRepository([invoice]);
    const emailProvider = createMockEmailProvider();
    const logger = createMockLogger();

    const useCase = new ProcessInvoiceRemindersUseCase(repository, emailProvider, logger);
    const result = await useCase.execute();

    expect(result).toEqual({ processed: 1, failed: 0 });
    expect(emailProvider.sendReminder).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'billing@acme.com',
        subject: expect.stringContaining('Recordatorio de pago'),
      }),
    );
    expect(repository.updateStatus).toHaveBeenCalledWith(
      'inv-1',
      InvoiceStatus.SEGUNDO_RECORDATORIO,
    );
  });

  it('should process second reminder and update status to desactivado', async () => {
    const invoice = createInvoice({
      id: 'inv-2',
      status: InvoiceStatus.SEGUNDO_RECORDATORIO,
    });
    const repository = createMockRepository([invoice]);
    const emailProvider = createMockEmailProvider();
    const logger = createMockLogger();

    const useCase = new ProcessInvoiceRemindersUseCase(repository, emailProvider, logger);
    const result = await useCase.execute();

    expect(result).toEqual({ processed: 1, failed: 0 });
    expect(emailProvider.sendReminder).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: expect.stringContaining('Desactivación inminente'),
      }),
    );
    expect(repository.updateStatus).toHaveBeenCalledWith('inv-2', InvoiceStatus.DESACTIVADO);
  });

  it('should return zero processed when no invoices need reminders', async () => {
    const repository = createMockRepository([]);
    const emailProvider = createMockEmailProvider();
    const logger = createMockLogger();

    const useCase = new ProcessInvoiceRemindersUseCase(repository, emailProvider, logger);
    const result = await useCase.execute();

    expect(result).toEqual({ processed: 0, failed: 0 });
    expect(emailProvider.sendReminder).not.toHaveBeenCalled();
    expect(repository.updateStatus).not.toHaveBeenCalled();
  });

  it('should continue processing other invoices when one email fails', async () => {
    const invoices = [
      createInvoice({
        id: 'inv-fail',
        clientEmail: 'fail@acme.com',
        status: InvoiceStatus.PRIMER_RECORDATORIO,
      }),
      createInvoice({
        id: 'inv-ok',
        clientEmail: 'ok@acme.com',
        status: InvoiceStatus.PRIMER_RECORDATORIO,
      }),
    ];
    const repository = createMockRepository(invoices);
    const emailProvider = createMockEmailProvider(['fail@acme.com']);
    const logger = createMockLogger();

    const useCase = new ProcessInvoiceRemindersUseCase(repository, emailProvider, logger);
    const result = await useCase.execute();

    expect(result).toEqual({ processed: 1, failed: 1 });
    expect(repository.updateStatus).toHaveBeenCalledTimes(1);
    expect(repository.updateStatus).toHaveBeenCalledWith(
      'inv-ok',
      InvoiceStatus.SEGUNDO_RECORDATORIO,
    );
    expect(logger.error).toHaveBeenCalledWith(
      'Failed to process invoice reminder',
      expect.objectContaining({ invoiceId: 'inv-fail' }),
    );
  });

  it('should process multiple invoices with mixed statuses', async () => {
    const invoices = [
      createInvoice({ id: 'inv-a', status: InvoiceStatus.PRIMER_RECORDATORIO }),
      createInvoice({ id: 'inv-b', status: InvoiceStatus.SEGUNDO_RECORDATORIO }),
    ];
    const repository = createMockRepository(invoices);
    const emailProvider = createMockEmailProvider();
    const logger = createMockLogger();

    const useCase = new ProcessInvoiceRemindersUseCase(repository, emailProvider, logger);
    const result = await useCase.execute();

    expect(result).toEqual({ processed: 2, failed: 0 });
    expect(repository.updateStatus).toHaveBeenCalledWith(
      'inv-a',
      InvoiceStatus.SEGUNDO_RECORDATORIO,
    );
    expect(repository.updateStatus).toHaveBeenCalledWith('inv-b', InvoiceStatus.DESACTIVADO);
  });
});
