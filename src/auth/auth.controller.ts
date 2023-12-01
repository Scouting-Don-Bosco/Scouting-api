import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Res,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { UsersService } from "../users/users.service";
import { LoginDto } from "./dto/login.dto";
import {
  ApiBody,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { RefreshTokensDto } from "./dto/refreshtokens.dto";
import { Response } from "express";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @ApiBody({ type: LoginDto })
  @ApiOkResponse({ description: "Login successful" })
  @ApiUnauthorizedResponse({ description: "Incorrect email or password" })
  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginArgs: LoginDto, @Res() response: Response) {
    const user = await this.usersService.findUserByEmail(loginArgs.email);
    if (!user) {
      response.status(HttpStatus.UNAUTHORIZED).send({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: "Incorrect email",
      });
      return response;
    }

    const match = await this.authService.comparePasswordsForLogin(
      loginArgs.password,
      user.password,
    );

    if (!match) {
      response.status(HttpStatus.UNAUTHORIZED).send({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: "Fout wachtwoord",
        for: "password",
      });
      return;
    }

    response
      .status(HttpStatus.OK)
      .send(await this.authService.generateTokensForUser(user));
  }

  @Patch("token/refresh")
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: "Tokens refreshed" })
  @ApiUnauthorizedResponse({ description: "Invalid refresh token" })
  async refreshTokens(@Body() refreshTokensDto: RefreshTokensDto) {
    return this.authService.refreshTokens(refreshTokensDto.refreshToken);
  }
}
