import { ApiProperty } from '@nestjs/swagger';

export class TokenAuthRequest {
  @ApiProperty({
    title: 'Username',
    description: "The user's own username",
    example: 'john',
  })
  username: string;

  @ApiProperty({
    title: 'Password',
    description: "The user's private password",
    example: 'xeNOb1_v5oYvRJu',
  })
  password: string;
}
