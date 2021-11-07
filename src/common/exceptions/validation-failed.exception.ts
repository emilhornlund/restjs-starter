import { HttpException, HttpStatus } from '@nestjs/common';
import { ValidationError } from 'class-validator';

export interface ValidationConstraint {
  field: string;
  constraints?: {
    [type: string]: string;
  };
}

export class ValidationFailedException extends HttpException {
  public validationErrors: ValidationConstraint[];

  constructor(validationErrors: ValidationError[]) {
    super('Validation failed', HttpStatus.BAD_REQUEST);
    this.validationErrors = validationErrors.map(
      ({ property: field, constraints }) => ({ field, constraints }),
    );
  }
}
