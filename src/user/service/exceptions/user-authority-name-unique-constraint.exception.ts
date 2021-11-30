import { HttpException, HttpStatus } from '@nestjs/common';

export class UserAuthorityNameUniqueConstraintException extends HttpException {
  constructor(name: string) {
    super(
      `Authority with name \`${name}\` must be unique.`,
      HttpStatus.CONFLICT,
    );
  }
}
