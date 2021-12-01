import {
  ApiBadRequestResponse,
  ApiForbiddenResponse as _ApiForbiddenResponse,
  ApiUnauthorizedResponse as _ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { HttpStatus } from '@nestjs/common';

export const ApiValidationFailedResponse = () =>
  ApiBadRequestResponse({
    description: 'Validation failed',
    schema: {
      properties: {
        statusCode: { type: 'number', example: HttpStatus.BAD_REQUEST },
        message: { type: 'string', example: 'Validation failed' },
        validationErrors: {
          items: {
            properties: {
              field: { type: 'string', example: 'email' },
              constraints: {
                properties: {
                  isEmail: {
                    type: 'string',
                    example: 'email must be an email',
                  },
                },
              },
            },
          },
        },
      },
    },
  });

export const ApiUnauthorizedResponse = () =>
  _ApiUnauthorizedResponse({
    description: 'Unauthorized',
    schema: {
      properties: {
        statusCode: { type: 'number', example: HttpStatus.UNAUTHORIZED },
        message: { type: 'string', example: 'Unauthorized' },
      },
    },
  });

export const ApiForbiddenResponse = () =>
  _ApiForbiddenResponse({
    description: 'Forbidden',
    schema: {
      properties: {
        statusCode: { type: 'number', example: HttpStatus.FORBIDDEN },
        message: { type: 'string', example: 'Forbidden resource' },
      },
    },
  });
