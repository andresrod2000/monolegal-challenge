import { Client, ClientValidationError, type IClientRepository, type ILogger } from '@monolegal/domain';
import { CreateClientUseCase } from '../create-client.use-case.js';

function createMockRepository(): jest.Mocked<IClientRepository> {
  return {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(async (props) => Client.create(props)),
    update: jest.fn(),
    delete: jest.fn(),
    exists: jest.fn(),
  };
}

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

describe('CreateClientUseCase', () => {
  it('should create a client via repository', async () => {
    const repository = createMockRepository();
    const logger = createMockLogger();
    const useCase = new CreateClientUseCase(repository, logger);

    const result = await useCase.execute({
      id: 'client-new',
      name: 'New Corp',
      email: 'billing@new.com',
    });

    expect(result.id).toBe('client-new');
    expect(repository.create).toHaveBeenCalledWith({
      id: 'client-new',
      name: 'New Corp',
      email: 'billing@new.com',
    });
  });

  it('should throw ClientValidationError for invalid email', async () => {
    const repository = createMockRepository();
    const logger = createMockLogger();
    const useCase = new CreateClientUseCase(repository, logger);

    await expect(
      useCase.execute({ id: 'c1', name: 'Test', email: 'invalid' }),
    ).rejects.toThrow(ClientValidationError);
    expect(repository.create).not.toHaveBeenCalled();
  });
});
