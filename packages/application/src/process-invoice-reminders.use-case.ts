import { Invoice } from '@monolegal/domain';
import type { IEmailProvider } from '@monolegal/domain';
import type { IInvoiceRepository } from '@monolegal/domain';
import { REMINDER_STATUSES, type ILogger } from '@monolegal/shared';

export interface ProcessInvoiceRemindersResult {
  processed: number;
  failed: number;
}

export class ProcessInvoiceRemindersUseCase {
  constructor(
    private readonly invoiceRepository: IInvoiceRepository,
    private readonly emailProvider: IEmailProvider,
    private readonly logger: ILogger,
  ) {}

  async execute(): Promise<ProcessInvoiceRemindersResult> {
    const invoices = await this.invoiceRepository.findByStatus(REMINDER_STATUSES);

    this.logger.info('Starting invoice reminder processing', {
      totalInvoices: invoices.length,
    });

    let processed = 0;
    let failed = 0;

    for (const invoiceProps of invoices) {
      try {
        await this.processInvoice(invoiceProps);
        processed++;
      } catch (error) {
        failed++;
        this.logger.error('Failed to process invoice reminder', {
          invoiceId: invoiceProps.id,
          clientName: invoiceProps.clientName,
          status: invoiceProps.status,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    this.logger.info('Invoice reminder processing completed', { processed, failed });

    return { processed, failed };
  }

  private async processInvoice(invoiceProps: Parameters<typeof Invoice.fromProps>[0]): Promise<void> {
    const invoice = Invoice.fromProps(invoiceProps);
    const nextStatus = invoice.getNextStatusAfterReminder();

    const emailContent = invoice.canSendFirstReminder()
      ? invoice.buildFirstReminderEmail()
      : invoice.buildSecondReminderEmail();

    await this.emailProvider.sendReminder({
      to: invoice.clientEmail,
      subject: emailContent.subject,
      body: emailContent.body,
    });

    await this.invoiceRepository.updateStatus(invoice.id, nextStatus);

    this.logger.info('Invoice reminder sent and status updated', {
      invoiceId: invoice.id,
      clientName: invoice.clientName,
      previousStatus: invoice.status,
      newStatus: nextStatus,
    });
  }
}
