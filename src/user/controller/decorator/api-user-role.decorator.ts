import {
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
} from '@nestjs/swagger';
import { HttpStatus } from '@nestjs/common';
import { UserRoleIdParamKey } from './user-role-id-param.decorator';
import { ApiUserRoleIdExample } from '../constant/api-user-role.constants';
import { UserRoleResponse } from '../model/response/user-role.response';

export const ApiUserRoleIdParam = () =>
  ApiParam({
    name: UserRoleIdParamKey,
    type: String,
    format: 'uuid',
    description: "The user's unique identifier",
    example: ApiUserRoleIdExample,
  });

const UserRoleResponseDescription = 'Information about the user role.';

export const ApiUserRoleOkResponse = () =>
  ApiOkResponse({
    description: UserRoleResponseDescription,
    type: UserRoleResponse,
  });

export const ApiUserRoleCreatedResponse = () =>
  ApiCreatedResponse({
    description: UserRoleResponseDescription,
    type: UserRoleResponse,
  });

export const ApiUserRoleNotFoundResponse = () =>
  ApiNotFoundResponse({
    description: 'The user role was not found',
    schema: {
      type: 'object',
      example: {
        statusCode: HttpStatus.NOT_FOUND,
        message: `Role with id \`${ApiUserRoleIdExample}\` was not found.`,
      },
    },
  });
