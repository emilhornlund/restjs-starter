import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../dto';

export class UserResponse {
  @ApiProperty({
    title: 'User Id',
    description: '',
    example: '7bda9f39-8864-4ebb-a8ff-795d371baf56',
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
