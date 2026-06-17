import type { Client } from '@monolegal/domain';

export interface ClientDto {
  id: string;
  name: string;
  email: string;
}

export function toClientDto(client: Client): ClientDto {
  return {
    id: client.id,
    name: client.name,
    email: client.email,
  };
}

export function toClientDtoList(clients: Client[]): ClientDto[] {
  return clients.map(toClientDto);
}

export interface CreateClientBody {
  id: string;
  name: string;
  email: string;
}

export interface UpdateClientBody {
  name?: string;
  email?: string;
}
