import { HttpException, HttpStatus } from '@nestjs/common';

export class EmailUniqueConstraintException extends HttpException {
  constructor() {
    super(`Email must be unique.`, HttpStatus.CONFLICT);
  }
}
