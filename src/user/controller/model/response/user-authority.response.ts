import { ApiProperty } from '@nestjs/swagger';
import { ApiUserAuthorityIdExample } from '../../constant/api-user-authority.constants';

export class UserAuthorityResponse {
  @ApiProperty({
    title: 'Authority Id',
    description: '',
    example: ApiUserAuthorityIdExample,
  })
  id: string;

  @ApiProperty({
    title: 'Name',
    description: '',
    example: 'AUTHORITY_ADMINISTRATION:read',
  })
  name: string;

  @ApiProperty({
    title: 'Description',
    description: '',
    example: 'The authority description',
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
