import { ApiProperty } from '@nestjs/swagger';
import {
  ApiUserAuthorityIdExample,
  ApiUserAuthorityDescriptionExample,
  ApiUserAuthorityNameExample,
  ApiUserAuthorityNameDescription,
  ApiUserAuthorityNameTitle,
  ApiUserAuthorityDescriptionTitle,
  ApiUserAuthorityDescription,
  ApiUserAuthorityIdTitle,
  ApiUserAuthorityIdDescription,
  ApiUserAuthorityCreatedAtTitle,
  ApiUserAuthorityCreatedAtDescription,
  ApiUserAuthorityCreatedAtExample,
  ApiUserAuthorityUpdatedAtTitle,
  ApiUserAuthorityUpdatedAtExample,
  ApiUserAuthorityUpdatedAtDescription,
} from '../../constant/api-user-authority.constants';
import { ApiIdFormat } from '../../../../common/constant/api.constants';

export class UserAuthorityResponse {
  @ApiProperty({
    title: ApiUserAuthorityIdTitle,
    format: ApiIdFormat,
    description: ApiUserAuthorityIdDescription,
    example: ApiUserAuthorityIdExample,
  })
  id: string;

  @ApiProperty({
    title: ApiUserAuthorityNameTitle,
    description: ApiUserAuthorityNameDescription,
    example: ApiUserAuthorityNameExample,
  })
  name: string;

  @ApiProperty({
    title: ApiUserAuthorityDescriptionTitle,
    description: ApiUserAuthorityDescription,
    example: ApiUserAuthorityDescriptionExample,
    required: false,
    nullable: true,
  })
  description?: string;

  @ApiProperty({
    title: ApiUserAuthorityCreatedAtTitle,
    description: ApiUserAuthorityCreatedAtDescription,
    example: ApiUserAuthorityCreatedAtExample,
  })
  createdAt: Date;

  @ApiProperty({
    title: ApiUserAuthorityUpdatedAtTitle,
    description: ApiUserAuthorityUpdatedAtDescription,
    example: ApiUserAuthorityUpdatedAtExample,
  })
  updatedAt: Date;
}
