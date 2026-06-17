import { Client, type ClientProps, type IClientRepository, type ILogger } from '@monolegal/domain';

export interface CreateClientInput {
  id: string;
  name: string;
  email: string;
}

export class CreateClientUseCase {
  constructor(
    private readonly clientRepository: IClientRepository,
    private readonly logger: ILogger,
  ) {}

  async execute(input: CreateClientInput): Promise<Client> {
    const props: ClientProps = {
      id: input.id,
      name: input.name,
      email: input.email,
    };
    Client.create(props);

    const client = await this.clientRepository.create(props);
    this.logger.info('Client created', { clientId: client.id });
    return client;
  }
}
