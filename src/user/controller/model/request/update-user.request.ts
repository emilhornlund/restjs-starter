import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, Matches, MaxLength, MinLength } from 'class-validator';

export class UpdateUserRequest {
  @ApiProperty({
    title: 'Username',
    description: '',
    example: 'testuser',
  })
  @MinLength(2)
  @MaxLength(20)
  @Matches(/[a-zA-Z0-9_.]{2,20}/, {
    message: (p) =>
      `${p.property} can only contain alphanumeric characters, underscores and dots`,
  })
  username: string;

  @ApiProperty({
    title: 'Email',
    description: '',
    example: 'testuser@example.com',
  })
  @IsEmail()
  email: string;
}
