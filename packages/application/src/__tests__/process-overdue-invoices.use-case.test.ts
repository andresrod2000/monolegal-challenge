import { Invoice } from '@monolegal/domain';
import type { IInvoiceRepository, ILogger, InvoiceProps } from '@monolegal/domain';
import { InvoiceStatus, startOfDay } from '@monolegal/shared';
import { ProcessOverdueInvoicesUseCase } from '../process-overdue-invoices.use-case.js';

const TODAY = new Date('2026-06-16');

function createInvoice(
  overrides: Partial<InvoiceProps> & Pick<InvoiceProps, 'id' | 'status'>,
): Invoice {
  return Invoice.create({
    clientId: 'client-1',
    invoiceNumber: 'INV-2026-0001',
    concept: 'Suscripción SaaS',
    amount: 150000,
    dueDate: new Date('2026-06-15'),
    ...overrides,
  });
}

function createMockRepository(invoices: Invoice[] = []): jest.Mocked<IInvoiceRepository> {
  const store = invoices.map((inv) => inv.toProps());
  return {
    findByStatus: jest.fn(),
    findByStatusAndDueDateBefore: jest.fn(async (status, dueDateBefore) =>
      store
        .filter((inv) => inv.status === status && inv.dueDate < dueDateBefore)
        .map((props) => Invoice.fromProps(props)),
    ),
    findAllSummaries: jest.fn(),
    findById: jest.fn(),
    findByClientId: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    updateStatus: jest.fn(async (id, status) => {
      const invoice = store.find((inv) => inv.id === id);
      if (invoice) invoice.status = status;
    }),
    countByYear: jest.fn(),
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

describe('ProcessOverdueInvoicesUseCase', () => {
  it('should transition overdue al_dia invoice to primerrecordatorio', async () => {
    const invoice = createInvoice({ id: 'inv-1', status: InvoiceStatus.AL_DIA });
    const repository = createMockRepository([invoice]);
    const logger = createMockLogger();
    const useCase = new ProcessOverdueInvoicesUseCase(repository, logger);

    const result = await useCase.execute(TODAY);

    expect(result).toEqual({ transitioned: 1, failed: 0 });
    expect(repository.findByStatusAndDueDateBefore).toHaveBeenCalledWith(
      InvoiceStatus.AL_DIA,
      startOfDay(TODAY),
    );
    expect(repository.updateStatus).toHaveBeenCalledWith(
      'inv-1',
      InvoiceStatus.PRIMER_RECORDATORIO,
    );
  });

  it('should not transition al_dia invoice due today', async () => {
    const invoice = createInvoice({
      id: 'inv-1',
      status: InvoiceStatus.AL_DIA,
      dueDate: new Date('2026-06-16'),
    });
    const repository = createMockRepository([invoice]);
    const useCase = new ProcessOverdueInvoicesUseCase(repository, createMockLogger());

    const result = await useCase.execute(TODAY);

    expect(result).toEqual({ transitioned: 0, failed: 0 });
    expect(repository.updateStatus).not.toHaveBeenCalled();
  });

  it('should not transition al_dia invoice with future due date', async () => {
    const invoice = createInvoice({
      id: 'inv-1',
      status: InvoiceStatus.AL_DIA,
      dueDate: new Date('2026-06-20'),
    });
    const repository = createMockRepository([invoice]);
    const useCase = new ProcessOverdueInvoicesUseCase(repository, createMockLogger());

    const result = await useCase.execute(TODAY);

    expect(result).toEqual({ transitioned: 0, failed: 0 });
    expect(repository.updateStatus).not.toHaveBeenCalled();
  });

  it('should not transition invoices already in reminder status', async () => {
    const repository = createMockRepository([]);
    repository.findByStatusAndDueDateBefore.mockResolvedValue([
      createInvoice({ id: 'inv-1', status: InvoiceStatus.PRIMER_RECORDATORIO }),
    ]);
    const useCase = new ProcessOverdueInvoicesUseCase(repository, createMockLogger());

    const result = await useCase.execute(TODAY);

    expect(result).toEqual({ transitioned: 1, failed: 0 });
    expect(repository.updateStatus).not.toHaveBeenCalled();
  });

  it('should continue processing when one invoice fails', async () => {
    const invoices = [
      createInvoice({ id: 'inv-a', status: InvoiceStatus.AL_DIA }),
      createInvoice({ id: 'inv-b', status: InvoiceStatus.AL_DIA }),
    ];
    const repository = createMockRepository(invoices);
    repository.updateStatus.mockImplementation(async (id) => {
      if (id === 'inv-a') throw new Error('DB unavailable');
    });
    const useCase = new ProcessOverdueInvoicesUseCase(repository, createMockLogger());

    const result = await useCase.execute(TODAY);

    expect(result).toEqual({ transitioned: 1, failed: 1 });
    expect(repository.updateStatus).toHaveBeenCalledTimes(2);
    expect(repository.updateStatus).toHaveBeenCalledWith(
      'inv-b',
      InvoiceStatus.PRIMER_RECORDATORIO,
    );
  });

  it('should process multiple overdue invoices', async () => {
    const invoices = [
      createInvoice({ id: 'inv-a', status: InvoiceStatus.AL_DIA }),
      createInvoice({ id: 'inv-b', status: InvoiceStatus.AL_DIA, dueDate: new Date('2026-06-01') }),
    ];
    const repository = createMockRepository(invoices);
    const useCase = new ProcessOverdueInvoicesUseCase(repository, createMockLogger());

    const result = await useCase.execute(TODAY);

    expect(result).toEqual({ transitioned: 2, failed: 0 });
    expect(repository.updateStatus).toHaveBeenCalledTimes(2);
  });
});
