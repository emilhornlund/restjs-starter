import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUserParam = createParamDecorator(
  (data: any, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const { currentUser } = request;
    return currentUser ? currentUser?.[data] : currentUser;
  },
);
