import { ApiProperty } from '@nestjs/swagger';
import { PageResponse } from '../../../../common/model';
import { UserResponse } from './user.response';

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
