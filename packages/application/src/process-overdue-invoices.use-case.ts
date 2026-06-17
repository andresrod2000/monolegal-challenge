import type { IInvoiceRepository, ILogger, Invoice } from '@monolegal/domain';
import { InvoiceStatus, startOfDay } from '@monolegal/shared';

export interface ProcessOverdueInvoicesResult {
  transitioned: number;
  failed: number;
}

export class ProcessOverdueInvoicesUseCase {
  constructor(
    private readonly invoiceRepository: IInvoiceRepository,
    private readonly logger: ILogger,
  ) {}

  async execute(referenceDate: Date = new Date()): Promise<ProcessOverdueInvoicesResult> {
    const dueDateBefore = startOfDay(referenceDate);
    const invoices = await this.invoiceRepository.findByStatusAndDueDateBefore(
      InvoiceStatus.AL_DIA,
      dueDateBefore,
    );

    this.logger.info('Starting overdue invoice processing', {
      totalInvoices: invoices.length,
      referenceDate: dueDateBefore.toISOString(),
    });

    let transitioned = 0;
    let failed = 0;

    for (const invoice of invoices) {
      try {
        await this.processInvoice(invoice, referenceDate);
        transitioned++;
      } catch (error) {
        failed++;
        this.logger.error('Failed to transition overdue invoice', {
          invoiceId: invoice.id,
          clientId: invoice.clientId,
          status: invoice.status,
          dueDate: invoice.dueDate.toISOString(),
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    this.logger.info('Overdue invoice processing completed', { transitioned, failed });

    return { transitioned, failed };
  }

  private async processInvoice(invoice: Invoice, referenceDate: Date): Promise<void> {
    if (!invoice.shouldTransitionToFirstReminder(referenceDate)) {
      return;
    }

    const nextStatus = invoice.getStatusAfterBecomingOverdue();
    await this.invoiceRepository.updateStatus(invoice.id, nextStatus);

    this.logger.info('Overdue invoice transitioned to first reminder', {
      invoiceId: invoice.id,
      clientId: invoice.clientId,
      previousStatus: invoice.status,
      newStatus: nextStatus,
      dueDate: invoice.dueDate.toISOString(),
    });
  }
}
