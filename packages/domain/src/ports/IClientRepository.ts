import type { Client } from '../entities/client.js';
import type { ClientProps } from '../entities/client.types.js';

export interface IClientRepository {
  findAll(): Promise<Client[]>;
  findById(id: string): Promise<Client | null>;
  create(props: ClientProps): Promise<Client>;
  update(id: string, props: Partial<Pick<ClientProps, 'name' | 'email'>>): Promise<Client>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;
}
