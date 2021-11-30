import { ApiProperty } from '@nestjs/swagger';
import { ApiUserRoleIdExample } from '../../constant/api-user-role.constants';

export class UserRoleResponse {
  @ApiProperty({
    title: 'Role Id',
    description: '',
    example: ApiUserRoleIdExample,
  })
  id: string;

  @ApiProperty({
    title: 'Name',
    description: '',
    example: 'REGULAR_USER',
  })
  name: string;

  @ApiProperty({
    title: 'Description',
    description: '',
    example: 'The role description',
  })
  description: string;

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
