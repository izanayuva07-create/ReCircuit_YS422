import { Request, Response, NextFunction } from 'express';
import { logger } from '../lib/logger.js';

export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
  invalidParams?: { name: string; reason: string }[];
}

export class AppError extends Error {
  public status: number;
  public type: string;
  public details?: any;

  constructor(title: string, status = 400, type = 'about:blank', details?: any) {
    super(title);
    this.status = status;
    this.type = type;
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const status = err.status || 500;
  const problem: ProblemDetails = {
    type: err.type || (status === 500 ? 'https://recircuit.org/errors/internal-server-error' : 'https://recircuit.org/errors/bad-request'),
    title: err.message || 'An unexpected error occurred',
    status,
    detail: err.details?.message || err.message,
    instance: req.originalUrl,
  };

  if (err.details?.errors) {
    problem.invalidParams = err.details.errors;
  }

  logger.error({
    trace_id: req.headers['x-request-id'] || 'no-trace',
    method: req.method,
    url: req.originalUrl,
    status,
    msg: problem.title,
    stack: status === 500 ? err.stack : undefined,
  });

  res.status(status).contentType('application/problem+json').json(problem);
};
