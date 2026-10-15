import { AppError } from './app.error.js';

export class ForbiddenError extends AppError {
  constructor() {
    super('Forbidden', 403);
    this.name = 'ForbiddenError';
  }
}