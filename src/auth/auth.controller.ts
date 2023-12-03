import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Req,
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
import { Request, Response } from "express";
import { Permission } from "@prisma/client";

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

  @Get("/verify")
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: "Token verified" })
  @ApiUnauthorizedResponse({ description: "Invalid token" })
  async verifyToken(@Res() response: Response, @Req() request: Request) {
    const token = request.headers.authorization.split(" ")[1];
    const verified = await this.authService.verifyToken(token);
    if (verified) {
      response.status(HttpStatus.OK).send({
        success: true,
      });
    } else {
      response.status(HttpStatus.UNAUTHORIZED).send({
        success: false,
        message: "Invalid token",
      });
    }
  }

  @Get("/perms")
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: "User has perms" })
  @ApiUnauthorizedResponse({ description: "Invalid token" })
  async userHasPerms(
    @Body() perms: Permission[],
    @Res() response: Response,
    @Req() request: Request,
  ) {
    const token = request.headers.authorization.split(" ")[1];
    const hasPerms = this.authService.userHasPerms(token, perms);
    if (hasPerms) {
      response.status(HttpStatus.OK).send({
        statusCode: HttpStatus.OK,
        message: "User has perms",
      });
    } else {
      response.status(HttpStatus.UNAUTHORIZED).send({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: "User does not have perms",
      });
    }
  }

  @Patch("token/refresh")
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: "Tokens refreshed" })
  @ApiUnauthorizedResponse({ description: "Invalid refresh token" })
  async refreshTokens(@Body() refreshTokensDto: RefreshTokensDto) {
    return this.authService.refreshTokens(refreshTokensDto.refreshToken);
  }
}
