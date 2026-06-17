import { Client, type IClientRepository, type ILogger } from '@monolegal/domain';
import { GetClientsUseCase } from '../get-clients.use-case.js';

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

describe('GetClientsUseCase', () => {
  it('should return all clients from repository', async () => {
    const clients = [
      Client.create({ id: 'client-1', name: 'Acme Corp', email: 'billing@acme.com' }),
      Client.create({ id: 'client-2', name: 'Globex', email: 'billing@globex.com' }),
    ];

    const repository: jest.Mocked<IClientRepository> = {
      findAll: jest.fn(async () => clients),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn(),
    };

    const logger = createMockLogger();
    const useCase = new GetClientsUseCase(repository, logger);
    const result = await useCase.execute();

    expect(result).toEqual(clients);
    expect(repository.findAll).toHaveBeenCalledTimes(1);
    expect(logger.info).toHaveBeenCalledWith('Clients fetched', { count: 2 });
  });
});
