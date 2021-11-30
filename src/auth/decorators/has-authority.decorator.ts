import { SetMetadata } from '@nestjs/common';
import { UserAuthority } from '../../user/service';

export const USER_AUTHORITIES_KEY = 'user_authorities';
export const HasUserAuthority = (...userAuthorities: UserAuthority[]) =>
  SetMetadata(USER_AUTHORITIES_KEY, userAuthorities);
