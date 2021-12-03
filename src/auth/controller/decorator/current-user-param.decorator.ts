import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUserParam = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.currentUser[data];
  },
);
