import { ApiResponse } from '@nestjs/swagger';
import { HttpStatus } from '@nestjs/common';
import { TokenResponse } from '../model/response/token.response';

export const ApiTokenCreatedResponse = () =>
  ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The JWT pair was successfully created.',
    type: TokenResponse,
  });
