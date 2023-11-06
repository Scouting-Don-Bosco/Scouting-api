import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { UserRole } from "@prisma/client";
import { Request } from "express";
import { Roles } from "./decorators/roles.decorator";
import { AdminOnly } from "./decorators/admin.decorator";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromRequest(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_ACCESS_SECRET,
      });
      request["user"] = payload;
    } catch (e) {
      throw new UnauthorizedException();
    }

    const roles =
      this.reflector.get(Roles, context.getHandler()) ||
      this.reflector.get(Roles, context.getClass());
    const adminOnly =
      this.reflector.get(AdminOnly, context.getHandler()) ||
      this.reflector.get(AdminOnly, context.getClass());

    if (!roles && !adminOnly) {
      return true;
    }

    const userRoles = request["user"].roles as UserRole[];

    console.log(userRoles);

    if (adminOnly) {
      if (
        userRoles.includes(UserRole.WEBMASTER) ||
        userRoles.includes(UserRole.BOARDMEMBER)
      ) {
        return true;
      } else throw new UnauthorizedException("Admin only");
    }

    if (
      roles &&
      (userRoles.includes(UserRole.WEBMASTER) ||
        userRoles.includes(UserRole.BOARDMEMBER))
    )
      return true;

    if (roles && roles.some((role) => userRoles.includes(role))) {
      return true;
    }

    return false;
  }

  private extractTokenFromRequest(request: Request) {
    const [type, token] = request.headers.authorization?.split(" ") ?? [];
    return type === "Bearer" ? token : null;
  }
}
