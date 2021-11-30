import { Param, ParseUUIDPipe } from '@nestjs/common';

export const UserAuthorityIdParamKey = 'userAuthorityId';

export const UserAuthorityIdParam = () =>
  Param(UserAuthorityIdParamKey, new ParseUUIDPipe());
