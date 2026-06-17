import {
  Client,
  ClientValidationError,
} from '../index.js';

const validProps = {
  id: 'client-1',
  name: 'Acme Corp',
  email: 'billing@acme.com',
};

describe('Client.create', () => {
  it('should create a valid client', () => {
    const client = Client.create(validProps);
    expect(client.id).toBe('client-1');
    expect(client.email).toBe('billing@acme.com');
  });

  it('should normalize email to lowercase', () => {
    const client = Client.create({ ...validProps, email: 'Billing@Acme.COM' });
    expect(client.email).toBe('billing@acme.com');
  });

  it('should throw ClientValidationError when id is empty', () => {
    expect(() => Client.create({ ...validProps, id: '' })).toThrow(ClientValidationError);
  });

  it('should throw ClientValidationError when email is invalid', () => {
    expect(() => Client.create({ ...validProps, email: 'not-an-email' })).toThrow(
      ClientValidationError,
    );
  });
});
