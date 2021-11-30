import { HttpException, HttpStatus } from '@nestjs/common';

export class UserNotFoundByUsernameOrPasswordException extends HttpException {
  constructor(usernameOrEmail: string) {
    super(
      `User with username or email \`${usernameOrEmail}\` was not found.`,
      HttpStatus.NOT_FOUND,
    );
  }
}
