import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthPayload } from 'src/common/interface';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  /**
   * Overrides the default handleRequest to attach the user payload
   * to `req.requester` instead of `req.user`.
   */
  handleRequest<TUser = AuthPayload>(
    err: any,
    user: TUser,
    info: any,
    context: ExecutionContext,
    status?: any,
  ): TUser {
    // If strategy validation failed (err) or no user was returned 
    if (err || !user) {
      throw err || new UnauthorizedException(info?.message || 'Unauthorized');
    }

    // Get the request object from the execution context
    const request = context.switchToHttp().getRequest();

    // *** Attach the validated user payload to req.requester ***
    request.requester = user;

    // Return the user payload (standard behavior for AuthGuard)
    return user;
  }
}
