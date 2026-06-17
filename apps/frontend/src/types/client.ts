export interface Client {
  id: string;
  name: string;
  email: string;
}

export interface ClientsApiResponse {
  data: Client[];
  meta: { total: number };
}

export interface ClientApiResponse {
  data: Client;
}

export interface CreateClientInput {
  id: string;
  name: string;
  email: string;
}

export interface UpdateClientInput {
  name?: string;
  email?: string;
}
