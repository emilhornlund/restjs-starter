import { ApiResponse } from '@nestjs/swagger';
import { HttpStatus } from '@nestjs/common';
import { TokenResponse } from '../models';

export const ApiTokenCreatedResponse = () =>
  ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The JWT pair was successfully created.',
    type: TokenResponse,
  });
