import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../../service';
import { ApiUserIdExample } from '../../constant/api-user.constants';

export class UserResponse {
  @ApiProperty({
    title: 'User Id',
    description: '',
    example: ApiUserIdExample,
  })
  id: string;

  @ApiProperty({
    title: 'Username',
    description: '',
    example: 'testuser',
  })
  username: string;

  @ApiProperty({
    title: 'Email',
    description: '',
    example: 'testuser@example.com',
  })
  email: string;

  @ApiProperty({
    title: 'Role',
    description: '',
    example: UserRole.REGULAR_USER,
  })
  role: UserRole;

  @ApiProperty({
    title: 'Created At',
    description: '',
    example: new Date(),
  })
  createdAt: Date;

  @ApiProperty({
    title: 'Updated At',
    description: '',
    example: new Date(),
  })
  updatedAt: Date;
}
