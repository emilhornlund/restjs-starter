import { UserAuthority } from '../../user';
import { SetMetadata } from '@nestjs/common';

export const USER_AUTHORITIES_KEY = 'user_authorities';
export const HasUserAuthority = (...userAuthorities: UserAuthority[]) =>
  SetMetadata(USER_AUTHORITIES_KEY, userAuthorities);
