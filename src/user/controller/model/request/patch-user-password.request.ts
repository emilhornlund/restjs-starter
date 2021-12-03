import { ApiProperty } from '@nestjs/swagger';
import { Matches, MaxLength, MinLength } from 'class-validator';
import {
  ApiUserNewPasswordDescription,
  ApiUserNewPasswordExample,
  ApiUserNewPasswordTitle,
  ApiUserOldPasswordDescription,
  ApiUserOldPasswordExample,
  ApiUserOldPasswordTitle,
  ApiUserPasswordMaxLength,
  ApiUserPasswordMinLength,
  ApiUserPasswordPattern,
} from '../../constant/api-user.constants';

export class PatchUserPasswordRequest {
  @ApiProperty({
    title: ApiUserOldPasswordTitle,
    description: ApiUserOldPasswordDescription,
    minLength: ApiUserPasswordMinLength,
    maxLength: ApiUserPasswordMaxLength,
    pattern: ApiUserPasswordPattern.toString(),
    example: ApiUserOldPasswordExample,
  })
  @MinLength(ApiUserPasswordMinLength)
  @MaxLength(ApiUserPasswordMaxLength)
  @Matches(ApiUserPasswordPattern, {
    message: (arg) => `${arg.property} can only contain word characters`,
  })
  oldPassword: string;

  @ApiProperty({
    title: ApiUserNewPasswordTitle,
    description: ApiUserNewPasswordDescription,
    minLength: ApiUserPasswordMinLength,
    maxLength: ApiUserPasswordMaxLength,
    pattern: ApiUserPasswordPattern.toString(),
    example: ApiUserNewPasswordExample,
  })
  @MinLength(ApiUserPasswordMinLength)
  @MaxLength(ApiUserPasswordMaxLength)
  @Matches(ApiUserPasswordPattern, {
    message: (arg) => `${arg.property} can only contain word characters`,
  })
  newPassword: string;
}
