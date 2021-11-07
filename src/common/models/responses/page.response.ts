import { ApiProperty } from '@nestjs/swagger';

export class PageResponse {
  @ApiProperty({
    title: 'Page number',
    description: 'Page number',
  })
  number: number;

  @ApiProperty({
    title: 'Page size',
    description: 'Page size',
  })
  size: number;

  @ApiProperty({
    title: 'Total pages',
    description: 'Total number of pages',
  })
  totalPages: number;

  @ApiProperty({
    title: 'Total elements',
    description: 'Total number of elements',
  })
  totalElements: number;
}
