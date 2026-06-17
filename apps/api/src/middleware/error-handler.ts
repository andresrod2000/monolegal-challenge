import type { NextFunction, Request, Response } from 'express';
import type { ILogger } from '@monolegal/domain';
import type { RequestWithContext } from './request-context.js';

export function createErrorHandler(logger: ILogger) {
  return (err: Error, req: Request, res: Response, _next: NextFunction): void => {
    const requestLogger = (req as RequestWithContext).requestLogger ?? logger;
    requestLogger.error('Unhandled request error', {
      message: err.message,
      path: req.path,
      method: req.method,
    });

    if (res.headersSent) {
      return;
    }

    res.status(500).json({
      error: {
        message: 'Internal server error',
      },
    });
  };
}

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({
    error: {
      message: 'Not found',
    },
  });
}
