import { Param, ParseUUIDPipe } from '@nestjs/common';

export const UserIdParamKey = 'userId';

export const UserIdParam = () => Param(UserIdParamKey, new ParseUUIDPipe());
