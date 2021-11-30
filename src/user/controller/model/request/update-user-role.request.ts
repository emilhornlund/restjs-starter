import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, Matches, MaxLength, MinLength } from 'class-validator';

export class UpdateUserRoleRequest {
  @ApiProperty({
    title: 'Name',
    description: '',
    example: 'REGULAR_USER',
  })
  @MinLength(8)
  @MaxLength(32)
  @Matches(/[A-Z_]/, {
    message: (p) =>
      `${p.property} can only contain uppercase letters and underscores`,
  })
  name: string;

  @ApiProperty({
    title: 'Description',
    description: '',
    example: 'The role description',
    required: false,
  })
  @MaxLength(128)
  @IsOptional()
  description: string;
}
