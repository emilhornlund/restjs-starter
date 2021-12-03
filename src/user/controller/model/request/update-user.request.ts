import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, Matches, MaxLength, MinLength } from 'class-validator';
import {
  ApiUserEmailDescription,
  ApiUserEmailExample,
  ApiUserEmailTitle,
  ApiUserPasswordPattern,
  ApiUserUsernameDescription,
  ApiUserUsernameExample,
  ApiUserUsernameMaxLength,
  ApiUserUsernameMinLength,
  ApiUserUsernamePattern,
  ApiUserUsernameTitle,
} from '../../constant/api-user.constants';

export class UpdateUserRequest {
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
      `${arg.property} can only contain alphanumeric characters`,
  })
  username: string;

  @ApiProperty({
    title: ApiUserEmailTitle,
    description: ApiUserEmailDescription,
    example: ApiUserEmailExample,
  })
  @IsEmail()
  email: string;
}
