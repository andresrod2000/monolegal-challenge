import { ClientNotFoundError, type IClientRepository, type ILogger } from '@monolegal/domain';
import type { Client } from '@monolegal/domain';

export class GetClientByIdUseCase {
  constructor(
    private readonly clientRepository: IClientRepository,
    private readonly logger: ILogger,
  ) {}

  async execute(id: string): Promise<Client> {
    const client = await this.clientRepository.findById(id);
    if (!client) {
      throw new ClientNotFoundError(`Client not found: ${id}`);
    }
    this.logger.debug('Client fetched', { clientId: id });
    return client;
  }
}
