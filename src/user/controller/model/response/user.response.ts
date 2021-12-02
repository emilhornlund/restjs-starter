import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../../service';
import {
  ApiUserCreatedAtDescription,
  ApiUserCreatedAtExample,
  ApiUserCreatedAtTitle,
  ApiUserEmailDescription,
  ApiUserEmailExample,
  ApiUserEmailTitle,
  ApiUserIdDescription,
  ApiUserIdExample,
  ApiUserIdTitle,
  ApiUserRoleDescription,
  ApiUserRoleExample,
  ApiUserRoleTitle,
  ApiUserUpdatedAtDescription,
  ApiUserUpdatedAtExample,
  ApiUserUpdatedAtTitle,
  ApiUserUsernameDescription,
  ApiUserUsernameExample,
  ApiUserUsernameTitle,
} from '../../constant/api-user.constants';
import { ApiIdFormat } from '../../../../common/constant/api.constants';

export class UserResponse {
  @ApiProperty({
    format: ApiIdFormat,
    title: ApiUserIdTitle,
    description: ApiUserIdDescription,
    example: ApiUserIdExample,
  })
  id: string;

  @ApiProperty({
    title: ApiUserUsernameTitle,
    description: ApiUserUsernameDescription,
    example: ApiUserUsernameExample,
  })
  username: string;

  @ApiProperty({
    title: ApiUserEmailTitle,
    description: ApiUserEmailDescription,
    example: ApiUserEmailExample,
  })
  email: string;

  @ApiProperty({
    title: ApiUserRoleTitle,
    description: ApiUserRoleDescription,
    example: ApiUserRoleExample,
  })
  role: UserRole;

  @ApiProperty({
    title: ApiUserCreatedAtTitle,
    description: ApiUserCreatedAtDescription,
    example: ApiUserCreatedAtExample,
  })
  createdAt: Date;

  @ApiProperty({
    title: ApiUserUpdatedAtTitle,
    description: ApiUserUpdatedAtDescription,
    example: ApiUserUpdatedAtExample,
  })
  updatedAt: Date;
}
