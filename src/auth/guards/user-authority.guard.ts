import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { USER_AUTHORITIES_KEY } from '../decorators/has-authority.decorator';
import { UserAuthority } from '../../user/service';

@Injectable()
export class UserAuthorityGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredUserAuthorities = this.reflector.getAllAndOverride<
      UserAuthority[]
    >(USER_AUTHORITIES_KEY, [context.getHandler(), context.getClass()]);
    if (!requiredUserAuthorities) {
      return true;
    }
    const { currentUser } = context.switchToHttp().getRequest();
    return requiredUserAuthorities.every((authority) =>
      currentUser.authorities?.includes(authority),
    );
  }
}
