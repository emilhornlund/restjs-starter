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

export class CreateUserRoleRequest {
  @ApiProperty({
    title: ApiUserRoleNameTitle,
    description: ApiUserRoleNameDescription,
    minLength: ApiUserRoleNameMinLength,
    maxLength: ApiUserRoleNameMaxLength,
    pattern: ApiUserRoleNamePattern.toString(),
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
    description: ApiUserRoleDescription,
    required: false,
    nullable: true,
    minLength: ApiUserRoleDescriptionMinLength,
    maxLength: ApiUserRoleDescriptionMaxLength,
    pattern: ApiUserRoleDescriptionPattern.toString(),
    example: ApiUserRoleDescriptionExample,
  })
  @MinLength(ApiUserRoleDescriptionMinLength)
  @MaxLength(ApiUserRoleDescriptionMaxLength)
  @Matches(ApiUserRoleDescriptionPattern, {
    message: (arg) => `${arg.property} can only contain word characters`,
  })
  @IsOptional()
  description?: string;
}
