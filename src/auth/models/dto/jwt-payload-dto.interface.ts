import { Authorities } from './authorities.enum';

export interface JwtPayloadDto {
  userId: string;
  authorities: Authorities[];
}
