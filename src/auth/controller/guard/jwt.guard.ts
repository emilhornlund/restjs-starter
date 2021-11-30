import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from '../../service';
import { IS_PUBLIC_KEY } from '../decorator/is-public.decorator';

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private reflector: Reflector, private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const { authorization = '' } = request.headers || {};
    const accessToken = authorization.replace(/^(Bearer\s)/, '');
    request.currentUser = await this.authService.verifyAccessToken(accessToken);
    return true;
  }
}
