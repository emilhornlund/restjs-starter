import { UserRole } from './user-role.enum';

export interface CreateUserDto {
  username: string;
  password: string;
  email: string;
  role?: UserRole;
}
