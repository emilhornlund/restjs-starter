import { ApiProperty } from '@nestjs/swagger';

export class RefreshAuthRequest {
  @ApiProperty({
    title: 'Refresh Token',
    description:
      'The refresh token used to exchange a new token pair after its expiration.',
  })
  refreshToken: string;
}
