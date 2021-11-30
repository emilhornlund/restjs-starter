import { ApiProperty } from '@nestjs/swagger';
import { PageResponse } from '../../../../common/model';
import { UserAuthorityResponse } from './user-authority.response';

export class PagedUserAuthorityResponse {
  @ApiProperty({
    title: 'Paged user authority results',
    description: 'Paged user authority results',
    type: [UserAuthorityResponse],
  })
  user_authorities: UserAuthorityResponse[];

  @ApiProperty({
    title: 'Page',
    description: 'Page',
  })
  page: PageResponse;
}
