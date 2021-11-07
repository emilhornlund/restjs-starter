import { ApiProperty } from '@nestjs/swagger';

export class PatchUserPasswordRequest {
  @ApiProperty({
    title: 'Old Password',
    description: '',
    example: 'old_hard!to-guess_password',
  })
  oldPassword: string;

  @ApiProperty({
    title: 'New Password',
    example: 'new_hard!to-guess_password',
    description: '',
  })
  newPassword: string;
}
