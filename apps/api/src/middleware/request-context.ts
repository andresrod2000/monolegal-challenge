import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import type { ILogger } from '@monolegal/domain';

export interface RequestWithContext extends Request {
  correlationId: string;
  requestLogger: ILogger;
}

export function createRequestContextMiddleware(logger: ILogger) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const correlationId = randomUUID();
    const request = req as RequestWithContext;
    request.correlationId = correlationId;
    request.requestLogger = logger.child({ correlationId });
    next();
  };
}
