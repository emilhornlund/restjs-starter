import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, Matches, MaxLength, MinLength } from 'class-validator';

export class CreateUserAuthorityRequest {
  @ApiProperty({
    title: 'Name',
    description: '',
    example: 'AUTHORITY_ADMINISTRATION:read',
  })
  @MinLength(8)
  @MaxLength(32)
  @Matches(/[A-Z_]{8,32}:(read|write)/, {
    message: (p) => `${p.property} invalid`,
  })
  name: string;

  @ApiProperty({
    title: 'Description',
    description: '',
    example: 'The authority description',
    required: false,
  })
  @MaxLength(128)
  @IsOptional()
  description: string;
}
