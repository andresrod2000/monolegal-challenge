import {
  Client,
  ClientNotFoundError,
  type IClientRepository,
  type ILogger,
} from '@monolegal/domain';

export interface UpdateClientInput {
  name?: string;
  email?: string;
}

export class UpdateClientUseCase {
  constructor(
    private readonly clientRepository: IClientRepository,
    private readonly logger: ILogger,
  ) {}

  async execute(id: string, input: UpdateClientInput): Promise<Client> {
    const existing = await this.clientRepository.findById(id);
    if (!existing) {
      throw new ClientNotFoundError(`Client not found: ${id}`);
    }

    const updatedProps = {
      name: input.name ?? existing.name,
      email: input.email ?? existing.email,
    };
    Client.create({ id: existing.id, ...updatedProps });

    const client = await this.clientRepository.update(id, updatedProps);
    this.logger.info('Client updated', { clientId: id });
    return client;
  }
}
