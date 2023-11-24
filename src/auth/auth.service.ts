import { Injectable, UnauthorizedException } from "@nestjs/common";
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

    return user;
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
        expiresIn: process.env.JWT_ACCESS_TIME,
        algorithm: "HS256",
        header: {
          typ: "JWT",
          alg: "HS256",
        },
      }),
      refresh_token: await this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: process.env.JWT_REFRESH_TIME,
        algorithm: "HS256",
        header: {
          typ: "JWT",
          alg: "HS256",
        },
      }),
      expires_in: 3600,
    };
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
