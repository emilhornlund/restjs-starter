import { ApiProperty } from '@nestjs/swagger';

export class TokenResponse {
  @ApiProperty({
    title: 'Access Token',
    description:
      'The newly generated access token used to access protected resources.',
  })
  accessToken: string;

  @ApiProperty({
    title: 'Refresh Token',
    description:
      'The newly generated refresh token used to exchange a new token pair after its expiration.',
  })
  refreshToken: string;
}
