import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseEnumPipe,
  Patch,
  Post,
  Query,
  Req,
  Res,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { UsersService } from "../users/users.service";
import { LoginDto } from "./dto/login.dto";
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { RefreshTokensDto } from "./dto/refreshtokens.dto";
import { Request, Response } from "express";
import { Permission, UserRole } from "@prisma/client";
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
  async login(@Body() loginDto: LoginDto, @Res() response: Response) {
    const result = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );

    response.status(HttpStatus.OK).send(result);
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

  @Get("/permissions")
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth("access_token")
  @ApiOkResponse({ description: "User has perms" })
  @ApiUnauthorizedResponse({ description: "Invalid token" })
  async getUserPermissions(@Res() response: Response, @Req() request: Request) {
    const token = request.headers.authorization.split(" ")[1];
    const permissions = await this.authService.getUserPerms(token);
    if (permissions) {
      response.status(HttpStatus.OK).send({
        statusCode: HttpStatus.OK,
        permissions: permissions,
      });
    } else {
      response.status(HttpStatus.UNAUTHORIZED).send({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: "User does not have any permissions",
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

  @Post("/roles/:role/permissions")
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: "Permissions added to role" })
  @ApiUnauthorizedResponse({ description: "Invalid token" })
  @ApiParam({ name: "role", enum: UserRole })
  async addPermissionsToRole(
    @Body() permissions: Permission[],
    @Param("role", new ParseEnumPipe(UserRole)) role: UserRole,
  ) {
    const result = await this.authService.addPermissionsToRole(
      role,
      permissions,
    );
    if (!result) {
      throw new BadRequestException("Role not found");
    }
    return result;
  }

  @Get("/roles/:role/permissions")
  @ApiParam({ name: "role", enum: UserRole })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: "Permissions found for role" })
  async getPermissionsForRole(
    @Param("role", new ParseEnumPipe(UserRole)) role: UserRole,
  ) {
    try {
      return await this.authService.getRolePerms(role);
    } catch (error) {
      throw new BadRequestException("Role not found");
    }
  }

  @Get("/roles/permissions")
  @ApiOkResponse({ description: "Permissions for all roles returned" })
  async getAllRolePermissions() {
    try {
      return await this.authService.getAllRolePerms();
    } catch (error) {
      throw new BadRequestException("Roles not found");
    }
  }

  @Post("/roles/permissions")
  @ApiOkResponse({ description: "Permissions for roles returned" })
  @ApiUnauthorizedResponse({ description: "Invalid token" })
  async getPermissionsForRoles(@Body() roles: UserRole[]) {
    console.log(roles);
    const uniquePerms: Permission[] = [];
    for (const role of roles) {
      const rolePerms = await this.getPermissionsForRole(role);
      rolePerms.perms.forEach((perm) => {
        if (!uniquePerms.includes(perm)) uniquePerms.push(perm);
      });
    }
    return uniquePerms;
  }
}
