import { HttpException, HttpStatus } from '@nestjs/common';

export class UserNotFoundException extends HttpException {
  constructor(userId: string) {
    super(`User with id \`${userId}\` was not found.`, HttpStatus.NOT_FOUND);
  }
}
