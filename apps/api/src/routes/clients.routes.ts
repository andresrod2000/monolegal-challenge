import { Router } from 'express';
import type {
  CreateClientUseCase,
  DeleteClientUseCase,
  GetClientByIdUseCase,
  GetClientsUseCase,
  UpdateClientUseCase,
} from '@monolegal/application';
import {
  toClientDto,
  toClientDtoList,
  type CreateClientBody,
  type UpdateClientBody,
} from '../mappers/client.mapper.js';

export interface ClientsRouterDeps {
  getClientsUseCase: GetClientsUseCase;
  getClientByIdUseCase: GetClientByIdUseCase;
  createClientUseCase: CreateClientUseCase;
  updateClientUseCase: UpdateClientUseCase;
  deleteClientUseCase: DeleteClientUseCase;
}

export function createClientsRouter(deps: ClientsRouterDeps): Router {
  const router = Router();

  router.get('/', async (_req, res, next) => {
    try {
      const clients = await deps.getClientsUseCase.execute();
      res.json({
        data: toClientDtoList(clients),
        meta: { total: clients.length },
      });
    } catch (error) {
      next(error);
    }
  });

  router.get('/:id', async (req, res, next) => {
    try {
      const client = await deps.getClientByIdUseCase.execute(req.params.id);
      res.json({ data: toClientDto(client) });
    } catch (error) {
      next(error);
    }
  });

  router.post('/', async (req, res, next) => {
    try {
      const body = req.body as CreateClientBody;
      const client = await deps.createClientUseCase.execute({
        id: body.id,
        name: body.name,
        email: body.email,
      });
      res.status(201).json({ data: toClientDto(client) });
    } catch (error) {
      next(error);
    }
  });

  router.patch('/:id', async (req, res, next) => {
    try {
      const body = req.body as UpdateClientBody;
      const client = await deps.updateClientUseCase.execute(req.params.id, {
        name: body.name,
        email: body.email,
      });
      res.json({ data: toClientDto(client) });
    } catch (error) {
      next(error);
    }
  });

  router.delete('/:id', async (req, res, next) => {
    try {
      await deps.deleteClientUseCase.execute(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  return router;
}
