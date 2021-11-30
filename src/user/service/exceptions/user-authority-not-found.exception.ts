import { HttpException, HttpStatus } from '@nestjs/common';

export class UserAuthorityNotFoundException extends HttpException {
  constructor(authorityId: string) {
    super(
      `Authority with id \`${authorityId}\` was not found.`,
      HttpStatus.NOT_FOUND,
    );
  }
}
