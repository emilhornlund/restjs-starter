import { HttpException, HttpStatus } from '@nestjs/common';

export class UserRoleNameUniqueConstraintException extends HttpException {
  constructor(name: string) {
    super(`Role with name \`${name}\` must be unique.`, HttpStatus.CONFLICT);
  }
}
