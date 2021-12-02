import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, Matches, MaxLength, MinLength } from 'class-validator';
import {
  ApiUserEmailDescription,
  ApiUserEmailExample,
  ApiUserEmailTitle,
  ApiUserPasswordDescription,
  ApiUserPasswordExample,
  ApiUserPasswordMaxLength,
  ApiUserPasswordMinLength,
  ApiUserPasswordPattern,
  ApiUserPasswordTitle,
  ApiUserUsernameDescription,
  ApiUserUsernameExample,
  ApiUserUsernameMaxLength,
  ApiUserUsernameMinLength,
  ApiUserUsernamePattern,
  ApiUserUsernameTitle,
} from '../../constant/api-user.constants';

export class CreateUserRequest {
  @ApiProperty({
    title: ApiUserUsernameTitle,
    description: ApiUserUsernameDescription,
    minLength: ApiUserUsernameMinLength,
    maxLength: ApiUserUsernameMaxLength,
    pattern: ApiUserUsernamePattern.toString(),
    example: ApiUserUsernameExample,
  })
  @MinLength(ApiUserUsernameMinLength)
  @MaxLength(ApiUserUsernameMaxLength)
  @Matches(ApiUserUsernamePattern, {
    message: (arg) =>
      `${arg.property} can only contain alphanumeric characters, underscores and dots`,
  })
  username: string;

  @ApiProperty({
    title: ApiUserPasswordTitle,
    description: ApiUserPasswordDescription,
    minLength: ApiUserPasswordMinLength,
    maxLength: ApiUserPasswordMaxLength,
    pattern: ApiUserPasswordPattern.toString(),
    example: ApiUserPasswordExample,
  })
  @MinLength(ApiUserPasswordMinLength)
  @MaxLength(ApiUserPasswordMaxLength)
  @Matches(ApiUserPasswordPattern, {
    message: (arg) => `${arg.property} can only contain word characters`,
  })
  password: string;

  @ApiProperty({
    title: ApiUserEmailTitle,
    description: ApiUserEmailDescription,
    example: ApiUserEmailExample,
  })
  @IsEmail()
  email: string;
}
