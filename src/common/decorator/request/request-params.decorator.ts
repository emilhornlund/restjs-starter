import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { PageableRequest } from '../../model';
import { IsNumberConstraintException } from '../../exception';

const _parseInt = (field, value) => {
  const val = parseInt(value, 10);
  if (isNaN(val)) {
    throw new IsNumberConstraintException(field);
  }
  return val;
};

export const PageableQueryParam = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): PageableRequest => {
    const request = ctx.switchToHttp().getRequest();
    const { page = 0, size = 20 } = request.query;
    return { page: _parseInt('page', page), size: _parseInt('size', size) };
  },
);
