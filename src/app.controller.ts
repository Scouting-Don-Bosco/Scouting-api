import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { PrismaService } from "./prisma/prisma.service";
import { ApiBearerAuth, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "./auth/auth.guard";
import { Request } from "express";
import { AuthService } from "./auth/auth.service";

@ApiTags("index")
@Controller()
export class AppController {
  constructor(
    private readonly authService: AuthService,
    private readonly prismaService: PrismaService,
  ) {}

  @Get("me")
  @ApiOkResponse({ description: "Get user profile" })
  @ApiBearerAuth("access_token")
  @UseGuards(AuthGuard)
  async getUserProfile(@Req() request: Request) {
    const user = await this.prismaService.user.findUnique({
      where: { id: request["user"].sub },
    });

    const permissions = await this.authService.getUserPerms(
      request.headers.authorization.split(" ")[1],
    );
    return { ...user, permissions };
  }
}
