import { HttpException, HttpStatus } from '@nestjs/common';

export class BadJwtException extends HttpException {
  constructor() {
    super('Bad jwt', HttpStatus.BAD_REQUEST);
  }
}
