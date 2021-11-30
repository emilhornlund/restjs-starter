import { PageResponse } from '../../../../common';
import { UserResponse } from './user.response';
import { ApiProperty } from '@nestjs/swagger';

export class PagedUserResponse {
  @ApiProperty({
    title: 'Paged user results',
    description: 'Paged user results',
    type: [UserResponse],
  })
  users: UserResponse[];

  @ApiProperty({
    title: 'Page',
    description: 'Page',
  })
  page: PageResponse;
}
