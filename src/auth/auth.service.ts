import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { User } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import bcrypt = require("bcrypt");

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

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
        expiresIn: "1h",
      }),
      refresh_token: await this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: "7d",
      }),
      expires_in: 3600,
    };
  }

  async refreshTokens(refreshToken: string) {
    return this.jwtService.decode(refreshToken);
  }
}
