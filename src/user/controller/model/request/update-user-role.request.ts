import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, Matches, MaxLength, MinLength } from 'class-validator';
import {
  ApiUserRoleDescription,
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
    message: (p) =>
      `${p.property} can only contain uppercase letters and underscores`,
  })
  name: string;

  @ApiProperty({
    title: ApiUserRoleDescriptionTitle,
    description: ApiUserRoleDescription,
    example: ApiUserRoleDescriptionExample,
    required: false,
    nullable: true,
  })
  @MinLength(ApiUserRoleDescriptionMinLength)
  @MaxLength(ApiUserRoleDescriptionMaxLength)
  @Matches(ApiUserRoleDescriptionPattern)
  @IsOptional()
  description?: string;
}
