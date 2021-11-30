import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, MaxLength } from 'class-validator';

export class UpdateUserAuthorityRequest {
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
