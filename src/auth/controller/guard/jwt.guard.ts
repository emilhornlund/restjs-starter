import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
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

    const accessToken: string = request.headers.authorization?.replace(
      /^(Bearer\s)/,
      '',
    );

    if (!accessToken) {
      throw new UnauthorizedException();
    }

    request.currentUser = await this.authService.verifyAccessToken(accessToken);
    return true;
  }
}
