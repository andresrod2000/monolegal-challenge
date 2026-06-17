import {
  Client,
  ClientNotFoundError,
  type IClientRepository,
  type ILogger,
} from '@monolegal/domain';
import { GetClientByIdUseCase } from '../get-client-by-id.use-case.js';

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

describe('GetClientByIdUseCase', () => {
  it('should return client when found', async () => {
    const client = Client.create({
      id: 'client-1',
      name: 'Acme Corp',
      email: 'billing@acme.com',
    });

    const repository: jest.Mocked<IClientRepository> = {
      findAll: jest.fn(),
      findById: jest.fn(async () => client),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn(),
    };

    const logger = createMockLogger();
    const useCase = new GetClientByIdUseCase(repository, logger);
    const result = await useCase.execute('client-1');

    expect(result).toEqual(client);
    expect(repository.findById).toHaveBeenCalledWith('client-1');
    expect(logger.debug).toHaveBeenCalledWith('Client fetched', { clientId: 'client-1' });
  });

  it('should throw ClientNotFoundError when client does not exist', async () => {
    const repository: jest.Mocked<IClientRepository> = {
      findAll: jest.fn(),
      findById: jest.fn(async () => null),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn(),
    };

    const useCase = new GetClientByIdUseCase(repository, createMockLogger());

    await expect(useCase.execute('missing')).rejects.toThrow(ClientNotFoundError);
  });
});
