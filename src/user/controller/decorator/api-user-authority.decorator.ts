import {
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
} from '@nestjs/swagger';
import { HttpStatus } from '@nestjs/common';
import { UserAuthorityIdParamKey } from './user-authority-id-param.decorator';
import { UserAuthorityResponse } from '../model/response/user-authority.response';
import { ApiUserAuthorityIdExample } from '../constant/api-user-authority.constants';

export const ApiUserAuthorityIdParam = () =>
  ApiParam({
    name: UserAuthorityIdParamKey,
    type: String,
    format: 'uuid',
    description: "The user's unique identifier",
    example: ApiUserAuthorityIdExample,
  });

const UserAuthorityResponseDescription =
  'Information about the user authority.';

export const ApiUserAuthorityOkResponse = () =>
  ApiOkResponse({
    description: UserAuthorityResponseDescription,
    type: UserAuthorityResponse,
  });

export const ApiUserAuthorityCreatedResponse = () =>
  ApiCreatedResponse({
    description: UserAuthorityResponseDescription,
    type: UserAuthorityResponse,
  });

export const ApiUserAuthorityNotFoundResponse = () =>
  ApiNotFoundResponse({
    description: 'The user authority was not found',
    schema: {
      type: 'object',
      example: {
        statusCode: HttpStatus.NOT_FOUND,
        message: `Authority with id \`${ApiUserAuthorityIdExample}\` was not found.`,
      },
    },
  });
