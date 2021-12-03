import { HttpException, HttpStatus } from '@nestjs/common';

export class UsernameUniqueConstraintException extends HttpException {
  constructor() {
    super(`Username must be unique.`, HttpStatus.CONFLICT);
  }
}
