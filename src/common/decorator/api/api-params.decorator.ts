import { applyDecorators } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';
import {
  ApiPageNumberDescription,
  ApiPageNumberExample,
  ApiPageSizeDescription,
  ApiPageSizeExample,
} from '../../constant/api-page.constants';

export const ApiPageableQueryParam = () =>
  applyDecorators(
    ApiQuery({
      name: 'page',
      type: Number,
      description: ApiPageNumberDescription,
      example: ApiPageNumberExample,
      required: false,
    }),
    ApiQuery({
      name: 'size',
      type: Number,
      description: ApiPageSizeDescription,
      example: ApiPageSizeExample,
      required: false,
    }),
  );
