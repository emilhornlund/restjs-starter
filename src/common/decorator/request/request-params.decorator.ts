import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { PageableRequest } from '../../model';

const _parseInt = (value) => {
  const val = parseInt(value, 10);
  if (isNaN(val)) {
    throw new BadRequestException('Validation failed');
  }
  return val;
};

export const PageableQueryParam = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): PageableRequest => {
    const request = ctx.switchToHttp().getRequest();
    const { page = 0, size = 20 } = request.query;
    return { page: _parseInt(page), size: _parseInt(size) };
  },
);
