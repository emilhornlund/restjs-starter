import { ApiProperty } from '@nestjs/swagger';
import {
  ApiPageNumberDescription,
  ApiPageNumberExample,
  ApiPageNumberTitle,
  ApiPageSizeDescription,
  ApiPageSizeExample,
  ApiPageSizeTitle,
  ApiPageTotalElementsDescription,
  ApiPageTotalElementsExample,
  ApiPageTotalElementsTitle,
  ApiPageTotalPagesDescription,
  ApiPageTotalPagesExample,
  ApiPageTotalPagesTitle,
} from '../../constant/api-page.constants';

export class PageResponse {
  @ApiProperty({
    title: ApiPageNumberTitle,
    description: ApiPageNumberDescription,
    example: ApiPageNumberExample,
  })
  number: number;

  @ApiProperty({
    title: ApiPageSizeTitle,
    description: ApiPageSizeDescription,
    example: ApiPageSizeExample,
  })
  size: number;

  @ApiProperty({
    title: ApiPageTotalPagesTitle,
    description: ApiPageTotalPagesDescription,
    example: ApiPageTotalPagesExample,
  })
  totalPages: number;

  @ApiProperty({
    title: ApiPageTotalElementsTitle,
    description: ApiPageTotalElementsDescription,
    example: ApiPageTotalElementsExample,
  })
  totalElements: number;
}
