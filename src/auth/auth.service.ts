import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Permission, RolePerms, User, UserRole } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { adminRoles, userHasAdminRoles } from "./admin.roles";
const bcrypt = require("bcrypt");

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.prismaService.user.findUnique({
      where: { email: email },
    });

    if (!user) {
      throw new UnauthorizedException("Invalid email or password!");
    }

    const isPasswordValid = await this.comparePasswordsForLogin(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid email or password!");
    }

    const tokens = await this.generateTokensForUser(user);

    return tokens;
  }

  async getUserPerms(token: string) {
    const payload = await this.verifyToken(token);
    if (!payload) {
      throw new UnauthorizedException("Invalid token!");
    }

    const user = await this.prismaService.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException("Invalid user!");
    }
    if (userHasAdminRoles(user.roles)) {
      return Permission.ALL;
    }

    const RolePerms = await this.prismaService.rolePerms.findMany({
      where: { role: { in: user.roles } },
    });

    const uniquePermsForUser: Permission[] = [];

    RolePerms.forEach((rolePerm) => {
      rolePerm.perms.forEach((perm) => {
        if (!uniquePermsForUser.includes(perm)) uniquePermsForUser.push(perm);
      });
    });

    return uniquePermsForUser;
  }

  async getRolePerms(role: UserRole) {
    const rolePerms = await this.prismaService.rolePerms.findUnique({
      where: {
        role: role,
      },
    });

    console.log(rolePerms);

    if (!rolePerms) {
      throw new NotFoundException("No role found!");
    }

    return rolePerms;
  }

  async getAllRolePerms() {
    const rolePerms = await this.prismaService.rolePerms.findMany();

    if (!rolePerms) {
      throw new NotFoundException("Roles not found!");
    }

    return rolePerms;
  }

  async addPermissionsToRole(role: UserRole, permissions: Permission[]) {
    const rolePerms = await this.prismaService.rolePerms.findUnique({
      where: { role: role },
    });
    let newPerms: Permission[] = [];
    if (rolePerms) {
      newPerms = [...rolePerms.perms];
    }

    permissions.forEach((perm) => {
      if (!newPerms.includes(perm)) newPerms.push(perm);
    });
    return await this.prismaService.rolePerms.upsert({
      where: {
        role: role,
      },
      update: {
        perms: {
          set: newPerms,
        },
      },
      create: {
        role: role,
        perms: {
          set: newPerms,
        },
      },
    });
  }

  async comparePasswordsForLogin(
    incomingPassword: string,
    hashedUserPassword: string,
  ) {
    return bcrypt.compareSync(incomingPassword, hashedUserPassword);
  }

  async generateTokensForUser(user: User) {
    const payload = { sub: user.id, email: user.email, roles: user.roles };
    return {
      access_token: await this.jwtService.signAsync(payload, {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: process.env.JWT_ACCESS_TIME || "1h",
        algorithm: "HS256",
        header: {
          typ: "JWT",
          alg: "HS256",
        },
      }),
      refresh_token: await this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: process.env.JWT_REFRESH_TIME || "2d",
        algorithm: "HS256",
        header: {
          typ: "JWT",
          alg: "HS256",
        },
      }),
      expires_in: 3600,
    };
  }

  async verifyToken(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_ACCESS_SECRET,
      });
      return payload;
    } catch (error) {
      return null;
    }
  }

  async refreshTokens(refreshToken: string) {
    const payload = await this.jwtService.decode(refreshToken, {
      json: true,
    });
    if (!payload) {
      throw new UnauthorizedException("Invalid token!");
    }

    if (typeof payload !== "object" || payload === null) {
      throw new UnauthorizedException("Invalid token!");
    }

    //check if the expires_in is expired
    //payload has an iat (issued at) property if needed
    //payload has an exp (expires) property
    if (payload.exp < Date.now() / 1000) {
      throw new UnauthorizedException("Login expired!");
    }

    const user = await this.prismaService.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException("Invalid user!");
    }

    const newPayload = { sub: user.id, email: user.email, roles: user.roles };

    return {
      access_token: await this.jwtService.signAsync(newPayload, {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: "1h",
      }),
      expires_in: 3600,
    };
  }
}
