import { PageDto } from '../../../common';
import { UserDto } from './user-dto.interface';

export interface PagedUserDto {
  users: UserDto[];
  page: PageDto;
}
