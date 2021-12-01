import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, Matches, MaxLength, MinLength } from 'class-validator';
import {
  ApiUserAuthorityDescription,
  ApiUserAuthorityDescriptionExample,
  ApiUserAuthorityDescriptionMaxLength,
  ApiUserAuthorityDescriptionMinLength,
  ApiUserAuthorityDescriptionPattern,
  ApiUserAuthorityDescriptionTitle,
  ApiUserAuthorityNameDescription,
  ApiUserAuthorityNameExample,
  ApiUserAuthorityNameMaxLength,
  ApiUserAuthorityNameMinLength,
  ApiUserAuthorityNamePattern,
  ApiUserAuthorityNameTitle,
} from '../../constant/api-user-authority.constants';

export class CreateUserAuthorityRequest {
  @ApiProperty({
    title: ApiUserAuthorityNameTitle,
    description: ApiUserAuthorityNameDescription,
    minLength: ApiUserAuthorityNameMinLength,
    maxLength: ApiUserAuthorityNameMaxLength,
    pattern: ApiUserAuthorityNamePattern.toString(),
    example: ApiUserAuthorityNameExample,
  })
  @MinLength(ApiUserAuthorityNameMinLength)
  @MaxLength(ApiUserAuthorityNameMaxLength)
  @Matches(ApiUserAuthorityNamePattern, {
    message: (arg) =>
      `${arg.property} can only contain uppercase letters and underscores followed by either :read or :write`,
  })
  name: string;

  @ApiProperty({
    title: ApiUserAuthorityDescriptionTitle,
    description: ApiUserAuthorityDescription,
    required: false,
    nullable: true,
    minLength: ApiUserAuthorityDescriptionMinLength,
    maxLength: ApiUserAuthorityDescriptionMaxLength,
    pattern: ApiUserAuthorityDescriptionPattern.toString(),
    example: ApiUserAuthorityDescriptionExample,
  })
  @MinLength(ApiUserAuthorityDescriptionMinLength)
  @MaxLength(ApiUserAuthorityDescriptionMaxLength)
  @Matches(ApiUserAuthorityDescriptionPattern, {
    message: (arg) => `${arg.property} can only contain word characters`,
  })
  @IsOptional()
  description?: string;
}
