import { UserRole } from './user-role.enum';

export interface UserDto {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}
