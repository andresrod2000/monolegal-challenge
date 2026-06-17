import { Client, ClientNotFoundError, type IClientRepository, type ILogger } from '@monolegal/domain';
import { UpdateClientUseCase } from '../update-client.use-case.js';

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

describe('UpdateClientUseCase', () => {
  it('should update client email', async () => {
    const existing = Client.create({
      id: 'client-1',
      name: 'Acme Corp',
      email: 'old@acme.com',
    });

    const repository: jest.Mocked<IClientRepository> = {
      findAll: jest.fn(),
      findById: jest.fn(async () => existing),
      create: jest.fn(),
      update: jest.fn(async (_id, props) =>
        Client.create({ id: 'client-1', name: props.name ?? existing.name, email: props.email ?? existing.email }),
      ),
      delete: jest.fn(),
      exists: jest.fn(),
    };

    const useCase = new UpdateClientUseCase(repository, createMockLogger());
    const result = await useCase.execute('client-1', { email: 'new@acme.com' });

    expect(result.email).toBe('new@acme.com');
    expect(repository.update).toHaveBeenCalledWith('client-1', {
      name: 'Acme Corp',
      email: 'new@acme.com',
    });
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

    const useCase = new UpdateClientUseCase(repository, createMockLogger());

    await expect(useCase.execute('missing', { email: 'x@y.com' })).rejects.toThrow(
      ClientNotFoundError,
    );
  });
});
