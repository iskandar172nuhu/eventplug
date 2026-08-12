export class AppError extends Error {
  constructor(public code: string, message: string, public statusCode = 400) {
    super(message)
    this.name = this.constructor.name
  }
}

export class UnauthorizedError extends AppError {
  constructor(msg = 'Not authenticated') { super('UNAUTHORIZED', msg, 401) }
}

export class ForbiddenError extends AppError {
  constructor(msg = 'Insufficient permissions') { super('FORBIDDEN', msg, 403) }
}

export class NotFoundError extends AppError {
  constructor(resource: string) { super('NOT_FOUND', `${resource} not found`, 404) }
}

export class InsufficientInventoryError extends AppError {
  constructor(msg: string) { super('INSUFFICIENT_INVENTORY', msg, 409) }
}

export class BookingConflictError extends AppError {
  constructor(msg: string) { super('BOOKING_CONFLICT', msg, 409) }
}
