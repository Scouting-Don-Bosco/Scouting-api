import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { UsersService } from "../users/users.service";
import { LoginDto } from "./dto/login.dto";
import { ApiBody, ApiTags } from "@nestjs/swagger";
import { RefreshTokensDto } from "./dto/refreshtokens.dto";
import { UserRole } from "@prisma/client";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @ApiBody({ type: LoginDto })
  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginArgs: LoginDto) {
    const user = await this.usersService.findUserByEmail(loginArgs.email);
    if (!user) {
      return {
        statusCode: HttpStatus.UNAUTHORIZED,
        message: "Incorrect email",
      };
    }

    const match = this.authService.comparePasswordsForLogin(
      loginArgs.password,
      user.password,
    );

    if (!match) {
      return {
        statusCode: HttpStatus.UNAUTHORIZED,
        message: "Incorrect password",
      };
    }

    return await this.authService.generateTokensForUser(user);
  }

  @Patch("token/refresh")
  @HttpCode(HttpStatus.OK)
  async refreshTokens(@Body() refreshTokensDto: RefreshTokensDto) {
    return this.authService.refreshTokens(refreshTokensDto.refreshToken);
  }

  @Get("roles")
  @HttpCode(HttpStatus.OK)
  async getRoles() {
    return UserRole;
  }
}
