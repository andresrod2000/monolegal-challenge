import type { IClientRepository, ILogger } from '@monolegal/domain';
import type { Client } from '@monolegal/domain';

export class GetClientsUseCase {
  constructor(
    private readonly clientRepository: IClientRepository,
    private readonly logger: ILogger,
  ) {}

  async execute(): Promise<Client[]> {
    this.logger.debug('Fetching all clients');
    const clients = await this.clientRepository.findAll();
    this.logger.info('Clients fetched', { count: clients.length });
    return clients;
  }
}
