import { HttpException, HttpStatus } from '@nestjs/common';

export class UserRoleNotFoundException extends HttpException {
  constructor(roleId: string) {
    super(`Role with id \`${roleId}\` was not found.`, HttpStatus.NOT_FOUND);
  }
}
