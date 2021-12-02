import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, Matches, MaxLength, MinLength } from 'class-validator';
import {
  ApiUserRoleDescriptionDescription,
  ApiUserRoleDescriptionExample,
  ApiUserRoleDescriptionMaxLength,
  ApiUserRoleDescriptionMinLength,
  ApiUserRoleDescriptionPattern,
  ApiUserRoleDescriptionTitle,
  ApiUserRoleNameDescription,
  ApiUserRoleNameExample,
  ApiUserRoleNameMaxLength,
  ApiUserRoleNameMinLength,
  ApiUserRoleNamePattern,
  ApiUserRoleNameTitle,
} from '../../constant/api-user-role.constants';

export class UpdateUserRoleRequest {
  @ApiProperty({
    title: ApiUserRoleNameTitle,
    description: ApiUserRoleNameDescription,
    example: ApiUserRoleNameExample,
  })
  @MinLength(ApiUserRoleNameMinLength)
  @MaxLength(ApiUserRoleNameMaxLength)
  @Matches(ApiUserRoleNamePattern, {
    message: (arg) =>
      `${arg.property} can only contain uppercase letters and underscores`,
  })
  name: string;

  @ApiProperty({
    title: ApiUserRoleDescriptionTitle,
    description: ApiUserRoleDescriptionDescription,
    example: ApiUserRoleDescriptionExample,
    required: false,
    nullable: true,
  })
  @MinLength(ApiUserRoleDescriptionMinLength)
  @MaxLength(ApiUserRoleDescriptionMaxLength)
  @Matches(ApiUserRoleDescriptionPattern, {
    message: (arg) => `${arg.property} can only contain word characters`,
  })
  @IsOptional()
  description?: string;
}
