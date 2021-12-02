import { ApiProperty } from '@nestjs/swagger';
import {
  ApiUserRoleIdExample,
  ApiUserRoleDescriptionExample,
  ApiUserRoleNameExample,
  ApiUserRoleNameDescription,
  ApiUserRoleNameTitle,
  ApiUserRoleDescriptionTitle,
  ApiUserRoleDescriptionDescription,
  ApiUserRoleIdTitle,
  ApiUserRoleIdDescription,
  ApiUserRoleCreatedAtTitle,
  ApiUserRoleCreatedAtDescription,
  ApiUserRoleCreatedAtExample,
  ApiUserRoleUpdatedAtTitle,
  ApiUserRoleUpdatedAtExample,
  ApiUserRoleUpdatedAtDescription,
} from '../../constant/api-user-role.constants';
import { ApiIdFormat } from '../../../../common/constant/api.constants';

export class UserRoleResponse {
  @ApiProperty({
    title: ApiUserRoleIdTitle,
    format: ApiIdFormat,
    description: ApiUserRoleIdDescription,
    example: ApiUserRoleIdExample,
  })
  id: string;

  @ApiProperty({
    title: ApiUserRoleNameTitle,
    description: ApiUserRoleNameDescription,
    example: ApiUserRoleNameExample,
  })
  name: string;

  @ApiProperty({
    title: ApiUserRoleDescriptionTitle,
    description: ApiUserRoleDescriptionDescription,
    example: ApiUserRoleDescriptionExample,
    required: false,
    nullable: true,
  })
  description?: string;

  @ApiProperty({
    title: ApiUserRoleCreatedAtTitle,
    description: ApiUserRoleCreatedAtDescription,
    example: ApiUserRoleCreatedAtExample,
  })
  createdAt: Date;

  @ApiProperty({
    title: ApiUserRoleUpdatedAtTitle,
    description: ApiUserRoleUpdatedAtDescription,
    example: ApiUserRoleUpdatedAtExample,
  })
  updatedAt: Date;
}
