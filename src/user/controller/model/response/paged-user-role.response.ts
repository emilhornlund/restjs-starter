import { ApiProperty } from '@nestjs/swagger';
import { PageResponse } from '../../../../common/model';
import { UserRoleResponse } from './user-role.response';

export class PagedUserRoleResponse {
  @ApiProperty({
    title: 'Paged user role results',
    description: 'Paged user role results',
    type: [UserRoleResponse],
  })
  user_roles: UserRoleResponse[];

  @ApiProperty({
    title: 'Page',
    description: 'Page',
  })
  page: PageResponse;
}
