import {
  ClientHasInvoicesError,
  ClientNotFoundError,
  type IClientRepository,
  type IInvoiceRepository,
  type ILogger,
} from '@monolegal/domain';

export class DeleteClientUseCase {
  constructor(
    private readonly clientRepository: IClientRepository,
    private readonly invoiceRepository: IInvoiceRepository,
    private readonly logger: ILogger,
  ) {}

  async execute(id: string): Promise<void> {
    const existing = await this.clientRepository.findById(id);
    if (!existing) {
      throw new ClientNotFoundError(`Client not found: ${id}`);
    }

    const invoices = await this.invoiceRepository.findByClientId(id);
    if (invoices.length > 0) {
      throw new ClientHasInvoicesError(
        `Cannot delete client ${id}: ${invoices.length} invoice(s) exist`,
      );
    }

    await this.clientRepository.delete(id);
    this.logger.info('Client deleted', { clientId: id });
  }
}
