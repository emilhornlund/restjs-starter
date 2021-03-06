import { UserAuthority } from './user-authority.enum';

export enum UserRole {
  REGULAR_USER = 'REGULAR_USER',
  SUPER_USER = 'SUPER_USER',
}

export const UserRoleAuthority = {
  [UserRole.REGULAR_USER]: [],
  [UserRole.SUPER_USER]: [
    UserAuthority.USER_ADMINISTRATION_READ,
    UserAuthority.USER_ADMINISTRATION_WRITE,
    UserAuthority.ROLE_ADMINISTRATION_READ,
    UserAuthority.ROLE_ADMINISTRATION_WRITE,
    UserAuthority.AUTHORITY_ADMINISTRATION_READ,
    UserAuthority.AUTHORITY_ADMINISTRATION_WRITE,
  ],
};
