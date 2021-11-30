import { applyDecorators } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';

export const ApiPageableQueryParam = () =>
  applyDecorators(
    ApiQuery({
      name: 'page',
      type: Number,
      description: 'Number of the page',
      required: false,
      example: 0,
    }),
    ApiQuery({
      name: 'size',
      type: Number,
      description: 'The number of elements to include per page.',
      required: false,
      example: 20,
    }),
  );
