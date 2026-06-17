import type { IClientRepository, IEmailProvider, IInvoiceRepository, ILogger } from '@monolegal/domain';
import type { Invoice } from '@monolegal/domain';
import { ClientNotFoundError } from '@monolegal/domain';
import { REMINDER_STATUSES } from '@monolegal/shared';

export interface ProcessInvoiceRemindersResult {
  processed: number;
  failed: number;
}

export class ProcessInvoiceRemindersUseCase {
  constructor(
    private readonly invoiceRepository: IInvoiceRepository,
    private readonly clientRepository: IClientRepository,
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

    for (const invoice of invoices) {
      try {
        await this.processInvoice(invoice);
        processed++;
      } catch (error) {
        failed++;
        this.logger.error('Failed to process invoice reminder', {
          invoiceId: invoice.id,
          clientId: invoice.clientId,
          status: invoice.status,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    this.logger.info('Invoice reminder processing completed', { processed, failed });

    return { processed, failed };
  }

  private async processInvoice(invoice: Invoice): Promise<void> {
    const client = await this.clientRepository.findById(invoice.clientId);
    if (!client) {
      throw new ClientNotFoundError(`Client not found for invoice ${invoice.id}: ${invoice.clientId}`);
    }

    const { email, nextStatus } = invoice.buildReminderPayload(client.name);

    await this.emailProvider.sendReminder({
      to: client.email,
      subject: email.subject,
      body: email.body,
    });

    try {
      await this.invoiceRepository.updateStatus(invoice.id, nextStatus);
    } catch (error) {
      this.logger.warn('Email sent but status update failed', {
        invoiceId: invoice.id,
        clientId: invoice.clientId,
        previousStatus: invoice.status,
        targetStatus: nextStatus,
        emailAlreadySent: true,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }

    this.logger.info('Invoice reminder sent and status updated', {
      invoiceId: invoice.id,
      clientId: invoice.clientId,
      clientEmail: client.email,
      previousStatus: invoice.status,
      newStatus: nextStatus,
    });
  }
}
