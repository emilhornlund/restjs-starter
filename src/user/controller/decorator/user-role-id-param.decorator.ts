import { Param, ParseUUIDPipe } from '@nestjs/common';

export const UserRoleIdParamKey = 'userRoleId';

export const UserRoleIdParam = () =>
  Param(UserRoleIdParamKey, new ParseUUIDPipe());
