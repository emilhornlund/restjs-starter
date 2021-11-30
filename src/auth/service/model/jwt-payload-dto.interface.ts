import { UserAuthority, UserRole } from '../../../user/service';

export interface JwtPayloadDto {
  userId: string;
  role: UserRole;
  authorities: UserAuthority[];
}
