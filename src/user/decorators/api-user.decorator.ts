import {
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
} from '@nestjs/swagger';
import { UserIdParamKey } from './user-id-param.decorator';
import { UserResponse } from '../models';

export const ApiUserIdParam = () =>
  ApiParam({
    name: UserIdParamKey,
    type: String,
    format: 'uuid',
    description: "The user's unique identifier",
    example: '7bda9f39-8864-4ebb-a8ff-795d371baf56',
  });

const userResponseDescription = 'Information about the user.';

export const ApiUserOkResponse = () =>
  ApiOkResponse({
    description: userResponseDescription,
    type: UserResponse,
  });

export const ApiUserCreatedResponse = () =>
  ApiCreatedResponse({
    description: userResponseDescription,
    type: UserResponse,
  });

export const ApiUserNotFoundResponse = () =>
  ApiNotFoundResponse({
    description: 'The user was not found',
    schema: {
      type: 'object',
      example: {
        statusCode: 404,
        message:
          'User with id `7bda9f39-8864-4ebb-a8ff-795d371baf56` was not found.',
      },
    },
  });
