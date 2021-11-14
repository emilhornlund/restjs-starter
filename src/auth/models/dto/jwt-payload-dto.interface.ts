import { UserAuthority, UserRole } from '../../../user';

export interface JwtPayloadDto {
  userId: string;
  role: UserRole;
  authorities: UserAuthority[];
}
