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

export class UpdateUserAuthorityRequest {
  @ApiProperty({
    title: ApiUserAuthorityNameTitle,
    description: ApiUserAuthorityNameDescription,
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
    example: ApiUserAuthorityDescriptionExample,
    required: false,
    nullable: true,
  })
  @MinLength(ApiUserAuthorityDescriptionMinLength)
  @MaxLength(ApiUserAuthorityDescriptionMaxLength)
  @Matches(ApiUserAuthorityDescriptionPattern, {
    message: (arg) => `${arg.property} can only contain word characters`,
  })
  @IsOptional()
  description?: string;
}
